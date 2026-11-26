import type { Metadata } from "next";
import { isMonthKey, monthKeyOf } from "@/lib/core/month";
import { getCategories, listExpenses } from "@/lib/data";
import { ExpensesBrowser } from "./expenses-browser";

export const metadata: Metadata = { title: "รายการ" };

export default async function ExpensesPage({ searchParams }: PageProps<"/app/expenses">) {
  const sp = await searchParams;
  const month = isMonthKey(sp.month as string) ? (sp.month as `${number}-${string}`) : monthKeyOf(new Date());
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const added = typeof sp.added === "string" ? sp.added : undefined;

  const [cats, rows] = await Promise.all([getCategories(), listExpenses({ month })]);

  return (
    <ExpensesBrowser
      key={`${month}:${cat ?? ""}:${q}`}
      month={month}
      categories={cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, slug: c.slug }))}
      rows={rows.map((r) => ({
        id: r.id,
        amount: r.amount,
        occurredAt: r.occurredAt.toISOString(),
        payeeName: r.payeeName,
        categoryId: r.categoryId,
        categorySource: r.categorySource,
        memo: r.memo,
        status: r.status,
      }))}
      initialCat={cat}
      initialQ={q}
      added={added}
    />
  );
}
