import { fetchWithRetry } from "@slipjot/slip-reader";
import { z } from "zod";
import { CATEGORY_SLUGS, DEFAULT_CATEGORIES, type CategorySlug } from "../core/categories.ts";
import type { CategorizeInput } from "../core/categorize.ts";

// Server code only (reads GEMINI_API_KEY); also imported by eval/run-categorize-eval.mts.
// Text-only Gemini call that picks one built-in category for a payee. Only reached when
// learned rules and keywords both miss; the answer is stored as a payee rule afterwards.

const schema = z.object({
  category: z.enum(CATEGORY_SLUGS),
  confidence: z.number().min(0).max(1),
});

const SYSTEM = `You categorise Thai personal expenses from a bank transfer slip.
Pick the single best category for the payee. Categories:
${DEFAULT_CATEGORIES.map((c) => `- ${c.slug}: ${c.hint}`).join("\n")}
A person's name with no other clue is usually "people", unless the memo says what was bought.
If you really cannot tell, answer "other" with low confidence.`;

export interface LlmUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export function llmEnabled() {
  return !!process.env.GEMINI_API_KEY;
}

export async function categorizeWithGemini(
  input: CategorizeInput,
  model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
): Promise<{ slug: CategorySlug | null; usage: LlmUsage }> {
  const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify({ payee: input.payeeName, memo: input.memo ?? null, amount_thb: input.amount ?? null }) }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(schema, { target: "draft-7" }),
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  };
  const inputTokens = body.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = (body.usageMetadata?.candidatesTokenCount ?? 0) + (body.usageMetadata?.thoughtsTokenCount ?? 0);
  const usage: LlmUsage = {
    model,
    inputTokens,
    outputTokens,
    costUsd: (inputTokens * Number(process.env.GEMINI_PRICE_IN ?? 0.3) + outputTokens * Number(process.env.GEMINI_PRICE_OUT ?? 2.5)) / 1e6,
  };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const parsed = schema.safeParse((() => { try { return JSON.parse(text); } catch { return null; } })());
  // A low-confidence "other" teaches nothing, so don't learn a rule from it.
  if (!parsed.success || (parsed.data.category === "other" && parsed.data.confidence < 0.5)) return { slug: null, usage };
  return { slug: parsed.data.category, usage };
}
