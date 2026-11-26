"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { MonthNav } from "@/components/month-nav";
import { SongthaewIllo } from "@/components/songthaew-art";
import { ThaiPhrases } from "@/components/thai-phrases";
import { formatBaht, formatDayLabel, formatTime, toLocalInput } from "@/lib/core/format";
import type { MonthKey } from "@/lib/core/month";

const SOURCE_TH: Record<string, string> = {
  rule: "จำจากครั้งก่อน",
  keyword: "จากชื่อร้าน",
  llm: "AI",
  user: "คุณเลือก",
  none: "",
};

export interface ExpenseRow {
  id: string;
  amount: number;
  occurredAt: string;
  payeeName: string;
  categoryId: string | null;
  categorySource: string;
  memo: string | null;
  status: "review" | "confirmed";
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  slug: string | null;
}

export function ExpensesBrowser({
  month,
  categories,
  rows,
  initialCat,
  initialQ,
  added,
}: {
  month: MonthKey;
  categories: ExpenseCategory[];
  rows: ExpenseRow[];
  initialCat?: string;
  initialQ: string;
  added?: string;
}) {
  const [cat, setCat] = useState<string | undefined>(initialCat);
  const [q, setQ] = useState(initialQ);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildUrl = (nextCat?: string, nextQ = "") => {
    const trimmed = nextQ.trim().slice(0, 60);
    const params = new URLSearchParams({ month });
    if (nextCat) params.set("cat", nextCat);
    if (trimmed) params.set("q", trimmed);
    return `/app/expenses?${params}`;
  };

  const replaceUrl = (nextCat?: string, nextQ = "") => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", buildUrl(nextCat, nextQ));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      const trimmed = q.trim().slice(0, 60);
      const params = new URLSearchParams({ month });
      if (cat) params.set("cat", cat);
      if (trimmed) params.set("q", trimmed);
      window.history.replaceState(null, "", `/app/expenses?${params}`);
    }, 180);
    return () => clearTimeout(t);
  }, [month, cat, q]);

  const validCat = cat === "none" || (cat && /^[0-9a-f-]{36}$/.test(cat)) ? cat : undefined;
  const trimmedQ = q.trim().slice(0, 60);
  const needle = trimmedQ.toLowerCase();

  const filtered = rows.filter((r) => {
    if (validCat === "none" && r.categoryId !== null) return false;
    if (validCat && validCat !== "none" && r.categoryId !== validCat) return false;
    if (needle) {
      const payeeHit = r.payeeName.toLowerCase().includes(needle);
      const memoHit = (r.memo ?? "").toLowerCase().includes(needle);
      if (!payeeHit && !memoHit) return false;
    }
    return true;
  });

  const byId = new Map(categories.map((c) => [c.id, c]));
  const total = filtered.reduce((a, r) => a + r.amount, 0);
  const groups = groupByDay(filtered);

  const navParams: Record<string, string> = {
    ...(validCat ? { cat: validCat } : {}),
    ...(trimmedQ ? { q: trimmedQ } : {}),
  };

  const selectCat = (nextCat?: string) => {
    setCat(nextCat);
    replaceUrl(nextCat, q);
  };

  const clearSearch = () => {
    setQ("");
    replaceUrl(cat, "");
    inputRef.current?.focus();
  };

  const resetAll = () => {
    setCat(undefined);
    setQ("");
    replaceUrl(undefined, "");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">รายการ</h1>
        <div className="flex flex-wrap items-center gap-2">
          <MonthNav month={month} path="/app/expenses" params={navParams} />
          <Link href="/app/expenses/new" className="btn" aria-label="เพิ่มรายการเอง">
            <Plus className="size-4" aria-hidden /> <span className="hidden sm:inline">เพิ่มเอง</span>
          </Link>
        </div>
      </header>

      {added && <p className="notice bg-plate-soft">บันทึกสลิปที่แชร์มา {added} รายการ</p>}

      <form
        className="relative"
        action="/app/expenses"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          replaceUrl(cat, q);
        }}
      >
        <input type="hidden" name="month" value={month} />
        {validCat && <input type="hidden" name="cat" value={validCat} />}
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3"
          aria-hidden
        />
        <input
          ref={inputRef}
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาผู้รับหรือบันทึกช่วยจำ"
          className="input pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden"
          aria-label="ค้นหาผู้รับหรือบันทึกช่วยจำ"
        />
        {q.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="ล้างคำค้น"
            className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-steel hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="กรองตามหมวด">
        <Link
          href={buildUrl(undefined, trimmedQ)}
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              selectCat(undefined);
            }
          }}
          aria-current={!validCat ? "page" : undefined}
          className={`chip ${!validCat ? "chip-on" : ""}`}
        >
          ทั้งหมด
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildUrl(c.id, trimmedQ)}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                selectCat(c.id);
              }
            }}
            aria-current={validCat === c.id ? "page" : undefined}
            className={`chip ${validCat === c.id ? "chip-on" : ""}`}
          >
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
            {c.name}
          </Link>
        ))}
        <Link
          href={buildUrl("none", trimmedQ)}
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              selectCat("none");
            }
          }}
          aria-current={validCat === "none" ? "page" : undefined}
          className={`chip ${validCat === "none" ? "chip-on" : ""}`}
        >
          ยังไม่จัดหมวด
        </Link>
      </nav>

      <div className="paper-texture flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/90 px-4 py-2.5 text-sm text-ink-2 shadow-xs">
        <span className="num font-medium">{filtered.length} รายการ</span>
        <span className="flex items-center gap-2">
          <span>รวม</span>
          <span className="plate-sm text-base font-semibold text-ink">{formatBaht(total, true)}</span>
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="board paper-texture overflow-hidden">
          <div className="board-head">
            <span>สมุดรายการ</span>
            <span className="meta whitespace-nowrap">{trimmedQ || validCat ? "ตัวกรอง" : "ว่างอยู่"}</span>
          </div>
          <div className="px-6 py-10 text-center sm:py-12">
            <SongthaewIllo variant="ledger" className="mx-auto mb-2 h-24 w-52" />
            <p className="sign text-xl">{trimmedQ || validCat ? "ไม่พบรายการ" : "ยังไม่มีรายการ"}</p>
            <p className="mt-2 text-ink-2">
              {trimmedQ || validCat ? <ThaiPhrases text="ไม่มีรายการที่ตรงกับคำค้น|หรือหมวดนี้ในเดือนนี้" /> : "เดือนนี้ยังไม่มีรายจ่าย"}
            </p>
            {trimmedQ || validCat ? (
              <Link
                href={buildUrl(undefined, "")}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    resetAll();
                  }
                }}
                className="btn mt-5"
              >
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
          {groups.map((g) => (
            <section key={g.key} aria-label={g.label} className="board paper-texture overflow-hidden">
              <div className="board-head">
                <h2>{g.label}</h2>
                <span className="font-plate num text-base font-semibold text-ink">{formatBaht(g.total, true)}</span>
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

function groupByDay<T extends { occurredAt: string; amount: number }>(rows: T[]) {
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
