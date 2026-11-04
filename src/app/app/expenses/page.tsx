import Link from "next/link";
import type { Metadata } from "next";
import { MonthNav } from "@/components/month-nav";
import { formatBaht, formatDateTime } from "@/lib/core/format";
import { isMonthKey, monthKeyOf } from "@/lib/core/month";
import { getCategories, listExpenses } from "@/lib/data";

export const metadata: Metadata = { title: "รายการ" };

const SOURCE_TH: Record<string, string> = { rule: "จำจากครั้งก่อน", keyword: "จากชื่อร้าน", llm: "AI", user: "คุณเลือก", none: "" };

export default async function ExpensesPage({ searchParams }: PageProps<"/app/expenses">) {
  const sp = await searchParams;
  const month = isMonthKey(sp.month as string) ? (sp.month as `${number}-${string}`) : monthKeyOf(new Date());
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const [cats, rows] = await Promise.all([
    getCategories(),
    listExpenses({ month, categoryId: cat === "none" || (cat && /^[0-9a-f-]{36}$/.test(cat)) ? cat : undefined, q: q || undefined }),
  ]);
  const byId = new Map(cats.map((c) => [c.id, c]));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const base = { ...(cat ? { cat } : {}), ...(q ? { q } : {}) };
  const chipHref = (c?: string) => `/app/expenses?${new URLSearchParams({ month, ...(c ? { cat: c } : {}), ...(q ? { q } : {}) })}`;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">รายการ</h1>
        <div className="flex items-center gap-2">
          <MonthNav month={month} path="/app/expenses" params={base} />
          <Link href="/app/expenses/new" className="btn">
            + เพิ่มเอง
          </Link>
        </div>
      </header>

      {typeof sp.added === "string" && (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-strong">บันทึกสลิปที่แชร์มา {sp.added} รายการ</p>
      )}

      <form className="flex gap-2" action="/app/expenses">
        <input type="hidden" name="month" value={month} />
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input name="q" defaultValue={q} placeholder="ค้นหาผู้รับหรือบันทึกช่วยจำ" className="input" aria-label="ค้นหา" />
        <button className="btn">ค้นหา</button>
      </form>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="กรองตามหมวด">
        <Link href={chipHref()} className={`chip shrink-0 ${!cat ? "chip-on" : ""}`}>
          ทั้งหมด
        </Link>
        {cats.map((c) => (
          <Link key={c.id} href={chipHref(c.id)} className={`chip shrink-0 ${cat === c.id ? "chip-on" : ""}`}>
            {c.icon} {c.name}
          </Link>
        ))}
        <Link href={chipHref("none")} className={`chip shrink-0 ${cat === "none" ? "chip-on" : ""}`}>
          ❔ ยังไม่จัดหมวด
        </Link>
      </nav>

      <p className="text-sm text-ink-2">
        {rows.length} รายการ · รวม <span className="num font-semibold text-ink">{formatBaht(total, true)}</span>
      </p>

      {rows.length === 0 ? (
        <div className="card p-8 text-center text-ink-2">
          ยังไม่มีรายการในเดือนนี้{" "}
          <Link href="/app/upload" className="font-semibold text-accent underline">
            ส่งสลิป
          </Link>
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {rows.map((r) => {
            const c = r.categoryId ? byId.get(r.categoryId) : null;
            return (
              <li key={r.id}>
                <Link href={`/app/expenses/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper" data-testid="expense-row">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ background: `${c?.color ?? "#adb5bd"}22` }}
                    aria-hidden
                  >
                    {c?.icon ?? "❔"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.payeeName || "ไม่ทราบผู้รับ"}</span>
                    <span className="block truncate text-sm text-ink-3">
                      {formatDateTime(r.occurredAt)} · {c?.name ?? "ยังไม่จัดหมวด"}
                      {r.categorySource !== "none" && SOURCE_TH[r.categorySource] ? ` (${SOURCE_TH[r.categorySource]})` : ""}
                      {r.memo ? ` · ${r.memo}` : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="num block font-semibold">{formatBaht(r.amount, true)}</span>
                    {r.status === "review" && <span className="rounded bg-marker px-1.5 text-xs font-semibold">รอตรวจ</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
