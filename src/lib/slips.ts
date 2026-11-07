import "server-only";
import { and, eq, or, sql } from "drizzle-orm";
import { readSlip, type SlipReadResult } from "@slipjot/slip-reader";
import { dHash, sha256 } from "@slipjot/slip-reader/image";
import { db } from "@/db";
import { aiUsage, categories, expenses, payeeRules, settings, slipImages } from "@/db/schema";
import type { CategorySlug } from "./core/categories";
import { categorize, payeeKey } from "./core/categorize";
import { DUPLICATE_REASON_TH, findDuplicate, type DuplicateVerdict } from "./core/dedup";
import { sanitizeImage } from "./image-safety";
import { categorizeWithLlm, llmEnabled } from "./llm/categorize-llm";
import { localLlmConfig } from "./llm/local-llm";

// Upload pipeline for one slip: hash → exact-duplicate check → sanitise (re-encode,
// strip metadata) → read → dedup → categorise → save. The image itself is only stored when the result needs review
// (deleted on confirm, or after 7 days) or when the user opted in to keeping images.



export type IngestResult =
  | { status: "duplicate"; of: string; reason: string }
  | {
      status: "saved" | "review";
      expenseId: string;
      amount: number | null;
      payeeName: string;
      occurredAt: string | null;
      category: string | null;
      issues: string[];
    };

/** Gemini (or OCR) as usual; in local dev with SLIP_LLM_PROVIDER=freellmapi, the local router, then OCR if it fails. */
async function readSlipWithProvider(bytes: Uint8Array, mimeType: string): Promise<SlipReadResult> {
  const local = localLlmConfig();
  if (!local) return readSlip(bytes, mimeType, { decodeQr: true });
  try {
    return await readSlip(bytes, mimeType, { provider: "local-llm", decodeQr: true, ...local });
  } catch (err) {
    console.warn(`local LLM read failed, falling back to OCR: ${(err as Error).message}`);
    return readSlip(bytes, mimeType, { provider: "ocr", decodeQr: true });
  }
}

async function exactByHash(userId: string, sha: string) {
  const [row] = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), eq(expenses.imageSha256, sha)))
    .limit(1);
  return row?.id ?? null;
}

/** `upload` is the file exactly as received; its type is decided from its bytes, never its name. */
export async function ingestSlip(userId: string, upload: Uint8Array): Promise<IngestResult> {
  const sha = sha256(upload);
  // Cheapest check first: the very same file never costs an OCR pass or a model call.
  const sameFile = await exactByHash(userId, sha);
  if (sameFile) return { status: "duplicate", of: sameFile, reason: DUPLICATE_REASON_TH["same-image"] };

  // From here on only the re-encoded copy exists: no EXIF/GPS reaches the model, the DB or the review page.
  const safe = await sanitizeImage(upload);
  const bytes = safe.bytes;
  const mimeType = safe.mimeType;

  const [read, dhash] = await Promise.all([
    readSlipWithProvider(bytes, mimeType),
    dHash(bytes).catch(() => null),
  ]);
  if (read.usage) {
    await db.insert(aiUsage).values({ userId, kind: "read", model: read.model ?? "gemini", ...read.usage });
  }

  const payeeName = read.receiver.name.value ?? "";
  const key = payeeKey(payeeName, read.receiver.accountLast4.value);
  const verdict = await checkDuplicate(userId, read, sha, dhash, key);
  if (verdict.kind === "exact") return { status: "duplicate", of: verdict.of, reason: DUPLICATE_REASON_TH[verdict.reason] };

  const cats = await db.select().from(categories).where(eq(categories.userId, userId));
  const bySlug = new Map(cats.filter((c) => c.slug).map((c) => [c.slug as CategorySlug, c]));
  const cat = await categorize<string>(
    { payeeName, memo: read.memo.value, amount: read.amount.value ?? undefined },
    {
      lookupRule: async (k) => {
        const [rule] = await db
          .select({ id: payeeRules.id, categoryId: payeeRules.categoryId })
          .from(payeeRules)
          .where(and(eq(payeeRules.userId, userId), eq(payeeRules.payeeKey, k)));
        if (!rule) return null;
        await db.update(payeeRules).set({ hits: sql`${payeeRules.hits} + 1` }).where(eq(payeeRules.id, rule.id));
        return rule.categoryId;
      },
      llm: llmEnabled()
        ? async (input) => {
            const { slug, usage } = await categorizeWithLlm(input).catch(() => ({ slug: null, usage: null }));
            if (usage) await db.insert(aiUsage).values({ userId, kind: "categorize", ...usage });
            return slug;
          }
        : null,
    },
  );
  const categoryId =
    cat.source === "rule" ? (cat.category as string) : cat.category ? (bySlug.get(cat.category as CategorySlug)?.id ?? null) : null;
  if (cat.learnFromLlm && categoryId && key) {
    await db.insert(payeeRules).values({ userId, payeeKey: key, categoryId, source: "llm" }).onConflictDoNothing();
  }

  const issues = [...read.issues];
  if (verdict.kind === "possible") issues.unshift(DUPLICATE_REASON_TH[verdict.reason]);
  const needsReview = read.needsReview || verdict.kind === "possible";

  const [row] = await db
    .insert(expenses)
    .values({
      userId,
      // A slip we could not read still becomes a review item so the user can type it in.
      amount: read.amount.value ?? 0,
      occurredAt: read.dateTime.value ? new Date(read.dateTime.value) : new Date(),
      payeeName,
      payeeKey: key,
      payeeBank: read.receiver.bank.value,
      payeeLast4: read.receiver.accountLast4.value,
      senderBank: read.sender.bank.value,
      senderLast4: read.sender.accountLast4.value,
      memo: read.memo.value,
      reference: read.reference.value,
      qrPayload: read.qrPayload,
      categoryId,
      categorySource: categoryId ? cat.source : "none",
      autoCategorySource: categoryId ? cat.source : "none",
      status: needsReview ? "review" : "confirmed",
      readSource: read.source,
      confidence: read.overallConfidence,
      issues,
      imageSha256: sha,
      imageDhash: dhash,
      duplicateOf: verdict.kind === "possible" ? verdict.of : null,
    })
    .returning({ id: expenses.id });

  const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
  const keep = userSettings?.keepImages ?? false;
  if (needsReview || keep) {
    await db.insert(slipImages).values({
      expenseId: row.id,
      userId,
      mimeType,
      bytes: Buffer.from(bytes),
      ...(keep ? { expiresAt: null } : {}),
    });
  }

  return {
    status: needsReview ? "review" : "saved",
    expenseId: row.id,
    amount: read.amount.value,
    payeeName,
    occurredAt: read.dateTime.value,
    category: categoryId ? (cats.find((c) => c.id === categoryId)?.name ?? null) : null,
    issues,
  };
}

async function checkDuplicate(
  userId: string,
  read: SlipReadResult,
  sha: string,
  dhash: string | null,
  key: string,
): Promise<DuplicateVerdict> {
  const match = [eq(expenses.imageSha256, sha)];
  if (read.reference.value) match.push(eq(expenses.reference, read.reference.value));
  if (read.qrPayload) match.push(eq(expenses.qrPayload, read.qrPayload));
  if (read.amount.value !== null) match.push(eq(expenses.amount, read.amount.value));
  const rows = await db
    .select({
      id: expenses.id,
      imageSha256: expenses.imageSha256,
      imageDhash: expenses.imageDhash,
      reference: expenses.reference,
      qrPayload: expenses.qrPayload,
      amount: expenses.amount,
      occurredAt: expenses.occurredAt,
      payeeKey: expenses.payeeKey,
    })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), or(...match)))
    .limit(200);
  return findDuplicate(
    {
      sha256: sha,
      dhash,
      reference: read.reference.value,
      qrPayload: read.qrPayload,
      amount: read.amount.value,
      occurredAt: read.dateTime.value,
      payeeKey: key,
    },
    rows,
  );
}
