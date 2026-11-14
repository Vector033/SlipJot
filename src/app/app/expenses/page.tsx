import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { MonthNav } from "@/components/month-nav";
import { SongthaewIllo } from "@/components/songthaew-art";
import { ThaiPhrases } from "@/components/thai-phrases";
import { formatBaht, formatDayLabel, formatTime, toLocalInput } from "@/lib/core/format";
import { isMonthKey, monthKeyOf } from "@/lib/core/month";
import { getCategories, listExpenses } from "@/lib/data";

export const metadata: Metadata = { title: "รายการ" };

const SOURCE_TH: Record<string, string> = {
  rule: "จำจากครั้งก่อน",
  keyword: "จากชื่อร้าน",
  llm: "AI",
  user: "คุณเลือก",
  none: "",
};

export default async function ExpensesPage({ searchParams }: PageProps<"/app/expenses">) {
  const sp = await searchParams;
  const month = isMonthKey(sp.month as string) ? (sp.month as `${number}-${string}`) : monthKeyOf(new Date());
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const [cats, rows] = await Promise.all([
    getCategories(),
    listExpenses({
      month,
      categoryId: cat === "none" || (cat && /^[0-9a-f-]{36}$/.test(cat)) ? cat : undefined,
      q: q || undefined,
    }),
  ]);
  const byId = new Map(cats.map((c) => [c.id, c]));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const base = { ...(cat ? { cat } : {}), ...(q ? { q } : {}) };
  const chipHref = (c?: string) =>
    `/app/expenses?${new URLSearchParams({ month, ...(c ? { cat: c } : {}), ...(q ? { q } : {}) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">รายการ</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthNav month={month} path="/app/expenses" params={base} />
          <Link href="/app/expenses/new" className="btn" aria-label="เพิ่มรายการเอง">
            <Plus className="size-4" aria-hidden /> <span className="hidden sm:inline">เพิ่มเอง</span>
          </Link>
        </div>
      </header>

      {typeof sp.added === "string" && <p className="notice bg-plate-soft">บันทึกสลิปที่แชร์มา {sp.added} รายการ</p>}

      <form className="relative" action="/app/expenses" role="search">
        <input type="hidden" name="month" value={month} />
        {cat && <input type="hidden" name="cat" value={cat} />}
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3"
          aria-hidden
        />
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="ค้นหาผู้รับหรือบันทึกช่วยจำ"
          className="input pl-10"
          aria-label="ค้นหาผู้รับหรือบันทึกช่วยจำ"
        />
      </form>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="กรองตามหมวด">
        <Link href={chipHref()} aria-current={!cat ? "page" : undefined} className={`chip ${!cat ? "chip-on" : ""}`}>
          ทั้งหมด
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={chipHref(c.id)}
            aria-current={cat === c.id ? "page" : undefined}
            className={`chip ${cat === c.id ? "chip-on" : ""}`}
          >
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
            {c.name}
          </Link>
        ))}
        <Link
          href={chipHref("none")}
          aria-current={cat === "none" ? "page" : undefined}
          className={`chip ${cat === "none" ? "chip-on" : ""}`}
        >
          ยังไม่จัดหมวด
        </Link>
      </nav>

      <div className="paper-texture flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/90 px-4 py-2.5 text-sm text-ink-2 shadow-xs">
        <span className="num font-medium">{rows.length} รายการ</span>
        <span className="flex items-center gap-2">
          <span>รวม</span>
          <span className="plate-sm text-base font-semibold text-ink">{formatBaht(total, true)}</span>
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="board paper-texture overflow-hidden">
          <div className="board-head">
            <span>สมุดรายการ</span>
            <span className="meta whitespace-nowrap">{q || cat ? "ตัวกรอง" : "ว่างอยู่"}</span>
          </div>
          <div className="px-6 py-10 text-center sm:py-12">
            <SongthaewIllo variant="ledger" className="mx-auto mb-2 h-24 w-52" />
            <p className="sign text-xl">{q || cat ? "ไม่พบรายการ" : "ยังไม่มีรายการ"}</p>
            <p className="mt-2 text-ink-2">
              {q || cat ? <ThaiPhrases text="ไม่มีรายการที่ตรงกับคำค้น|หรือหมวดนี้ในเดือนนี้" /> : "เดือนนี้ยังไม่มีรายจ่าย"}
            </p>
            {q || cat ? (
              <Link href={`/app/expenses?${new URLSearchParams({ month })}`} className="btn mt-5">
                ล้างตัวกรอง
              </Link>
            ) : (
              <Link href="/app/upload" className="btn-primary mt-5">
                ส่งสลิป
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {groupByDay(rows).map((g) => (
            <section key={g.key} aria-label={g.label} className="board paper-texture overflow-hidden">
              <div className="board-head">
                <h2>{g.label}</h2>
                <span className="font-plate num text-lg font-semibold text-plate">{formatBaht(g.total, true)}</span>
              </div>
              <ul className="rows">
                {g.rows.map((r) => {
                  const c = r.categoryId ? byId.get(r.categoryId) : null;
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/app/expenses/${r.id}`}
                        className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-steel"
                        data-testid="expense-row"
                      >
                        <CategoryIcon icon={c?.icon} slug={c?.slug} color={c?.color} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{r.payeeName || "ไม่ทราบผู้รับ"}</span>
                          <span className="block truncate text-sm text-ink-3">
                            {formatTime(r.occurredAt)} · {c?.name ?? "ยังไม่จัดหมวด"}
                            {r.categorySource !== "none" && SOURCE_TH[r.categorySource]
                              ? ` (${SOURCE_TH[r.categorySource]})`
                              : ""}
                            {r.memo ? ` · ${r.memo}` : ""}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="plate-sm text-[1.05rem]">{r.amount > 0 ? formatBaht(r.amount, true) : "฿ –"}</span>
                          {r.status === "review" && <span className="text-xs font-semibold text-red">รอตรวจ</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDay<T extends { occurredAt: Date; amount: number }>(rows: T[]) {
  const groups: { key: string; label: string; total: number; rows: T[] }[] = [];
  for (const r of rows) {
    const key = toLocalInput(r.occurredAt).slice(0, 10);
    let g = groups.at(-1);
    if (!g || g.key !== key) {
      g = { key, label: formatDayLabel(r.occurredAt), total: 0, rows: [] };
      groups.push(g);
    }
    g.rows.push(r);
    g.total += r.amount;
  }
  return groups;
}
