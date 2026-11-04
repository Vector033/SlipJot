import "server-only";
import { and, asc, desc, eq, gte, isNotNull, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  aiUsage,
  categories,
  expenses,
  payeeRules,
  settings,
  slipImages,
  type CategorySource,
  type ExpenseStatus,
} from "@/db/schema";
import { requireUser } from "./auth";
import { budgetStatus, type BudgetStatus } from "./core/budget";
import { DEFAULT_CATEGORIES } from "./core/categories";
import { payeeKey } from "./core/categorize";
import { bangkokDay, daysInMonth, monthKeyOf, monthRange, shiftMonth, type MonthKey } from "./core/month";

// Data Access Layer. Every exported function resolves the signed-in user itself and
// scopes its queries to that user, so callers cannot reach anyone else's rows.

export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;

/** Creates the settings row and default categories on first visit. Idempotent. */
export async function ensureSetup(userId: string) {
  const inserted = await db.insert(settings).values({ userId }).onConflictDoNothing().returning();
  if (inserted.length === 0) return;
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((c, i) => ({ userId, slug: c.slug, name: c.name, icon: c.icon, color: c.color, sort: i })))
    .onConflictDoNothing();
}

export async function getSettings() {
  const { id } = await requireUser();
  const [row] = await db.select().from(settings).where(eq(settings.userId, id));
  return row ?? { userId: id, keepImages: false };
}

export async function setKeepImages(keep: boolean) {
  const { id } = await requireUser();
  await db.update(settings).set({ keepImages: keep }).where(eq(settings.userId, id));
  // Turning it off applies to images already kept too.
  if (!keep) {
    await db
      .update(slipImages)
      .set({ expiresAt: sql`now() + interval '7 days'` })
      .where(and(eq(slipImages.userId, id), sql`${slipImages.expiresAt} is null`));
    await db.execute(sql`
      delete from slipjot.slip_images si using slipjot.expenses e
      where si.expense_id = e.id and si.user_id = ${id} and e.status = 'confirmed'`);
  }
}

// ---------- categories ----------

export async function getCategories(): Promise<Category[]> {
  const { id } = await requireUser();
  return db.select().from(categories).where(eq(categories.userId, id)).orderBy(asc(categories.sort), asc(categories.createdAt));
}

export async function saveCategory(input: { id?: string; name: string; icon: string; color: string; monthlyBudget: number | null }) {
  const { id: userId } = await requireUser();
  if (input.id) {
    await db
      .update(categories)
      .set({ name: input.name, icon: input.icon, color: input.color, monthlyBudget: input.monthlyBudget })
      .where(and(eq(categories.id, input.id), eq(categories.userId, userId)));
  } else {
    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${categories.sort}), 0)` })
      .from(categories)
      .where(eq(categories.userId, userId));
    await db.insert(categories).values({ userId, ...input, sort: Number(max) + 1 });
  }
}

export async function deleteCategory(categoryId: string) {
  const { id } = await requireUser();
  await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, id)));
}

// ---------- expenses ----------

export interface ExpenseFilter {
  month: MonthKey;
  categoryId?: string | "none";
  status?: ExpenseStatus;
  q?: string;
}

export async function listExpenses(f: ExpenseFilter) {
  const { id } = await requireUser();
  const { start, end } = monthRange(f.month);
  const conds = [eq(expenses.userId, id), gte(expenses.occurredAt, start), lt(expenses.occurredAt, end)];
  if (f.categoryId === "none") conds.push(sql`${expenses.categoryId} is null`);
  else if (f.categoryId) conds.push(eq(expenses.categoryId, f.categoryId));
  if (f.status) conds.push(eq(expenses.status, f.status));
  if (f.q) conds.push(sql`(${expenses.payeeName} ilike ${"%" + f.q + "%"} or ${expenses.memo} ilike ${"%" + f.q + "%"})`);
  return db.select().from(expenses).where(and(...conds)).orderBy(desc(expenses.occurredAt));
}

export async function getReviewQueue() {
  const { id } = await requireUser();
  await purgeExpiredImages();
  return db
    .select({ expense: expenses, hasImage: sql<boolean>`${slipImages.expenseId} is not null` })
    .from(expenses)
    .leftJoin(slipImages, eq(slipImages.expenseId, expenses.id))
    .where(and(eq(expenses.userId, id), eq(expenses.status, "review")))
    .orderBy(desc(expenses.createdAt));
}

export async function reviewCount() {
  const { id } = await requireUser();
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(expenses)
    .where(and(eq(expenses.userId, id), eq(expenses.status, "review")));
  return n;
}

export async function getExpense(expenseId: string) {
  const { id } = await requireUser();
  const [row] = await db
    .select({ expense: expenses, hasImage: sql<boolean>`${slipImages.expenseId} is not null` })
    .from(expenses)
    .leftJoin(slipImages, eq(slipImages.expenseId, expenses.id))
    .where(and(eq(expenses.id, expenseId), eq(expenses.userId, id)));
  return row ?? null;
}

export async function getSlipImage(expenseId: string) {
  const { id } = await requireUser();
  const [row] = await db
    .select({ bytes: slipImages.bytes, mimeType: slipImages.mimeType })
    .from(slipImages)
    .where(and(eq(slipImages.expenseId, expenseId), eq(slipImages.userId, id)));
  return row ?? null;
}

export interface ExpenseInput {
  amount: number;
  occurredAt: Date;
  payeeName: string;
  categoryId: string | null;
  memo: string | null;
}

/** Saves edits. Changing the category teaches a payee rule, so the next slip to this payee lands right. */
export async function updateExpense(expenseId: string, input: ExpenseInput, confirm: boolean) {
  const { id } = await requireUser();
  const current = await getExpense(expenseId);
  if (!current) throw new Error("not found");
  const e = current.expense;
  const key = payeeKey(input.payeeName, e.payeeLast4);
  const categoryChanged = input.categoryId !== e.categoryId;

  await db
    .update(expenses)
    .set({
      amount: input.amount,
      occurredAt: input.occurredAt,
      payeeName: input.payeeName,
      payeeKey: key,
      memo: input.memo,
      categoryId: input.categoryId,
      ...(categoryChanged ? { categorySource: (input.categoryId ? "user" : "none") as CategorySource } : {}),
      ...(confirm ? { status: "confirmed" as ExpenseStatus, issues: [], duplicateOf: null } : {}),
    })
    .where(and(eq(expenses.id, expenseId), eq(expenses.userId, id)));

  // Confirming (or any edit) of a categorised expense records the payee → category rule.
  // A user's choice always wins over an earlier LLM guess.
  if (input.categoryId && key && (categoryChanged || confirm)) {
    await db
      .insert(payeeRules)
      .values({ userId: id, payeeKey: key, categoryId: input.categoryId, source: "user" })
      .onConflictDoUpdate({
        target: [payeeRules.userId, payeeRules.payeeKey],
        set: { categoryId: input.categoryId, source: "user", updatedAt: new Date() },
      });
  }

  if (confirm) {
    const s = await getSettings();
    if (s.keepImages) {
      await db.update(slipImages).set({ expiresAt: null }).where(eq(slipImages.expenseId, expenseId));
    } else {
      // PDPA default: the image goes as soon as the user has checked what we read.
      await db.delete(slipImages).where(and(eq(slipImages.expenseId, expenseId), eq(slipImages.userId, id)));
    }
  }
}

export async function deleteExpense(expenseId: string) {
  const { id } = await requireUser();
  await db.delete(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.userId, id)));
}

export async function createManualExpense(input: ExpenseInput) {
  const { id } = await requireUser();
  const [row] = await db
    .insert(expenses)
    .values({
      userId: id,
      ...input,
      payeeKey: payeeKey(input.payeeName),
      categorySource: input.categoryId ? "user" : "none",
      autoCategorySource: "none",
      status: "confirmed",
      readSource: "manual",
    })
    .returning({ id: expenses.id });
  return row.id;
}

export async function purgeExpiredImages() {
  await db.delete(slipImages).where(and(isNotNull(slipImages.expiresAt), lt(slipImages.expiresAt, new Date())));
}

// ---------- dashboard ----------

export interface CategoryTotal {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  budget: BudgetStatus | null;
}

export interface MonthSummary {
  month: MonthKey;
  total: number;
  count: number;
  previousTotal: number;
  byCategory: CategoryTotal[];
  byDay: { day: number; total: number }[];
  topPayees: { name: string; total: number; count: number }[];
  reviewCount: number;
}

export async function getMonthSummary(month: MonthKey, now = new Date()): Promise<MonthSummary> {
  const { id } = await requireUser();
  const { start, end } = monthRange(month);
  const prev = monthRange(shiftMonth(month, -1));
  const inMonth = and(eq(expenses.userId, id), gte(expenses.occurredAt, start), lt(expenses.occurredAt, end));

  const [cats, catRows, dayRows, payeeRows, [prevRow], review] = await Promise.all([
    getCategories(),
    db
      .select({ categoryId: expenses.categoryId, total: sql<string>`sum(${expenses.amount})`, count: sql<number>`count(*)::int` })
      .from(expenses)
      .where(inMonth)
      .groupBy(expenses.categoryId),
    db
      .select({
        day: sql<number>`extract(day from ${expenses.occurredAt} at time zone 'Asia/Bangkok')::int`,
        total: sql<string>`sum(${expenses.amount})`,
      })
      .from(expenses)
      .where(inMonth)
      .groupBy(sql`1`),
    db
      .select({
        name: sql<string>`min(${expenses.payeeName})`,
        total: sql<string>`sum(${expenses.amount})`,
        count: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .where(and(inMonth, ne(expenses.payeeKey, "")))
      .groupBy(expenses.payeeKey)
      .orderBy(sql`count(*) desc`, sql`sum(${expenses.amount}) desc`)
      .limit(5),
    db
      .select({ total: sql<string>`coalesce(sum(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(eq(expenses.userId, id), gte(expenses.occurredAt, prev.start), lt(expenses.occurredAt, prev.end))),
    reviewCount(),
  ]);

  const isCurrent = monthKeyOf(now) === month;
  const isPast = end.getTime() <= now.getTime();
  const dim = daysInMonth(month);
  const dayNow = isCurrent ? bangkokDay(now) : isPast ? dim : 0;

  const totals = new Map(catRows.map((r) => [r.categoryId, { total: Number(r.total), count: r.count }]));
  const byCategory: CategoryTotal[] = cats.map((c) => {
    const t = totals.get(c.id) ?? { total: 0, count: 0 };
    return {
      categoryId: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      ...t,
      budget: c.monthlyBudget ? budgetStatus(t.total, c.monthlyBudget, dayNow, dim) : null,
    };
  });
  const uncategorised = totals.get(null);
  if (uncategorised) {
    byCategory.push({ categoryId: null, name: "ยังไม่จัดหมวด", icon: "❔", color: "#adb5bd", ...uncategorised, budget: null });
  }

  const dayMap = new Map(dayRows.map((r) => [r.day, Number(r.total)]));
  return {
    month,
    total: byCategory.reduce((a, c) => a + c.total, 0),
    count: byCategory.reduce((a, c) => a + c.count, 0),
    previousTotal: Number(prevRow?.total ?? 0),
    byCategory: byCategory.sort((a, b) => b.total - a.total),
    byDay: Array.from({ length: dim }, (_, i) => ({ day: i + 1, total: dayMap.get(i + 1) ?? 0 })),
    topPayees: payeeRows.map((r) => ({ name: r.name, total: Number(r.total), count: r.count })),
    reviewCount: review,
  };
}

/** How expenses got their category and what the AI cost, over the user's whole history. */
export async function getInsights() {
  const { id } = await requireUser();
  const [sources, reads, [cost]] = await Promise.all([
    db
      .select({ source: expenses.autoCategorySource, n: sql<number>`count(*)::int` })
      .from(expenses)
      .where(and(eq(expenses.userId, id), ne(expenses.readSource, "manual")))
      .groupBy(expenses.autoCategorySource),
    db
      .select({ source: expenses.readSource, n: sql<number>`count(*)::int` })
      .from(expenses)
      .where(eq(expenses.userId, id))
      .groupBy(expenses.readSource),
    db
      .select({ usd: sql<string>`coalesce(sum(${aiUsage.costUsd}), 0)`, calls: sql<number>`count(*)::int` })
      .from(aiUsage)
      .where(eq(aiUsage.userId, id)),
  ]);
  const bySource = Object.fromEntries(sources.map((s) => [s.source, s.n])) as Partial<Record<CategorySource, number>>;
  const slips = reads.filter((r) => r.source !== "manual").reduce((a, r) => a + r.n, 0);
  return {
    slips,
    bySource,
    readsBySource: Object.fromEntries(reads.map((r) => [r.source, r.n])),
    aiCalls: cost?.calls ?? 0,
    aiCostUsd: Number(cost?.usd ?? 0),
  };
}

export async function exportRows() {
  const { id } = await requireUser();
  return db
    .select({
      occurredAt: expenses.occurredAt,
      amount: expenses.amount,
      payeeName: expenses.payeeName,
      payeeBank: expenses.payeeBank,
      category: categories.name,
      memo: expenses.memo,
      reference: expenses.reference,
      status: expenses.status,
      readSource: expenses.readSource,
    })
    .from(expenses)
    .leftJoin(categories, eq(categories.id, expenses.categoryId))
    .where(eq(expenses.userId, id))
    .orderBy(asc(expenses.occurredAt));
}

/** Wipes every expense, rule, image, usage row and category. The account stays. */
export async function deleteAllData() {
  const { id } = await requireUser();
  await db.delete(expenses).where(eq(expenses.userId, id)); // cascades slip_images
  await db.delete(payeeRules).where(eq(payeeRules.userId, id));
  await db.delete(aiUsage).where(eq(aiUsage.userId, id));
  await db.delete(categories).where(eq(categories.userId, id));
  await db.delete(settings).where(eq(settings.userId, id));
  await ensureSetup(id);
}
