import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, ClipboardCheck, TrendingDown, TrendingUp } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { MonthNav } from "@/components/month-nav";
import { RollingNumber } from "@/components/rolling-number";
import { ThaiPhrases } from "@/components/thai-phrases";
import { formatMoney } from "@/lib/core/format";
import { bangkokDay, isMonthKey, monthKeyOf, monthLabel, type MonthKey } from "@/lib/core/month";
import { getMonthSummary } from "@/lib/data";
import { CategoryDonut, DailyBars } from "./charts";

export const metadata: Metadata = { title: "ภาพรวม" };

const bahtText = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function DashboardPage({ searchParams }: PageProps<"/app">) {
  const sp = await searchParams;
  const now = new Date();
  const month: MonthKey = isMonthKey(sp.month as string) ? (sp.month as MonthKey) : monthKeyOf(now);
  const s = await getMonthSummary(month, now);
  const isCurrent = month === monthKeyOf(now);
  const diff = s.total - s.previousTotal;
  const budgets = s.byCategory.filter((c) => c.budget);
  const alerts = budgets.filter((c) => c.budget!.level !== "ok");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">ภาพรวม</h1>
        <MonthNav month={month} path="/app" />
      </header>

      {sp.wiped && <p className="notice bg-steel-2">ลบข้อมูลทั้งหมดแล้ว</p>}

      {s.reviewCount > 0 && (
        <Link
          href="/app/review"
          className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-ink bg-plate px-4 font-semibold transition-colors hover:bg-plate-deep"
        >
          <ClipboardCheck className="size-5 shrink-0" aria-hidden />
          <span className="flex-1">
            <ThaiPhrases text={`มี ${s.reviewCount} รายการ|รอให้คุณตรวจ`} />
          </span>
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      )}

      {alerts.map((c) => {
        const over = c.budget!.level === "over";
        return (
          <p
            key={c.name}
            role="status"
            className={`notice flex items-start gap-3 ${over ? "bg-red-soft text-red-deep" : "bg-plate-soft text-ink"}`}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">{c.name}</span>:{" "}
              {over ? (
                <ThaiPhrases text={`เกินงบแล้ว| ${formatMoney(c.total - c.budget!.budget)}`} />
              ) : c.budget!.ratio >= 0.8 ? (
                <ThaiPhrases text={`ใช้ไป ${Math.round(c.budget!.ratio * 100)}% ของงบ`} />
              ) : (
                <ThaiPhrases text={`ถ้าใช้เท่านี้ต่อไป| สิ้นเดือนจะเกินงบ| (คาดว่า ${formatMoney(c.budget!.projected)})`} />
              )}
            </span>
          </p>
        );
      })}

      <section className="board overflow-hidden" aria-labelledby="month-head">
        <div className="board-head">
          <h2 id="month-head">{isCurrent ? "ใช้ไปแล้วเดือนนี้" : "ใช้ไปทั้งเดือน"}</h2>
          <span className="meta whitespace-nowrap">{monthLabel(month)}</span>
        </div>
        <div className="relative overflow-hidden">
          {/* #18 Square-Dot Grid / #22 ASCII & Pixels LED matrix (6% opacity) + #8 Halftone corner accents */}
          <span aria-hidden className="led-matrix pointer-events-none absolute inset-0 z-0" />
          <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-ink opacity-[0.12]" />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 p-5 pb-3">
            <div>
              <p data-testid="month-total">
                <span className="plate text-[clamp(1.75rem,9vw,2.4rem)] sm:text-5xl">
                  ฿<RollingNumber text={bahtText(s.total)} />
                </span>
              </p>
            </div>
            <div className="text-sm text-ink-2 sm:text-right">
              <p className="num">{s.count} รายการ</p>
              {s.previousTotal > 0 && (
                <p
                  className={`mt-1 inline-flex items-center gap-1 font-medium ${diff > 0 ? "text-red-deep" : "text-ok"}`}
                >
                  {diff > 0 ? (
                    <TrendingUp className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <TrendingDown className="size-4 shrink-0" aria-hidden />
                  )}
                  <span>
                    <span className="inline-block">{diff > 0 ? "มากกว่า" : "น้อยกว่า"}เดือนก่อน</span>{" "}
                    <span className="font-plate num inline-block">{formatMoney(Math.abs(diff))}</span>
                  </span>
                </p>
              )}
            </div>
          </div>
          {s.total > 0 && (
            <div className="relative z-10 px-3 pb-3">
              <DailyBars data={s.byDay} today={isCurrent ? bangkokDay(now) : null} />
            </div>
          )}
        </div>
      </section>

      {s.count === 0 ? (
        <section className="board flex flex-col items-center px-6 py-12 text-center">
          <p className="sign text-2xl">ยังไม่มีรายจ่ายเดือนนี้</p>
          <p className="mt-2 max-w-[38ch] text-ink-2">
            <ThaiPhrases text="ส่งสลิปจากอัลบั้มเข้ามา| ระบบจะอ่านและจัดหมวดให้" />
          </p>
          <Link href="/app/upload" className="btn-primary mt-6">
            ส่งสลิป <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <section className="board overflow-hidden" aria-labelledby="by-cat">
            <div className="board-head">
              <h2 id="by-cat">ตามหมวด</h2>
              <span className="meta whitespace-nowrap">กดเพื่อดูรายการ</span>
            </div>
            <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:items-start">
              <CategoryDonut data={s.byCategory} />
              <ul className="rows w-full min-w-0 sm:flex-1">
                {s.byCategory
                  .filter((c) => c.total > 0 || c.budget)
                  .map((c) => (
                    <li key={c.name}>
                      <Link
                        href={`/app/expenses?${new URLSearchParams({ month, cat: c.categoryId ?? "none" })}`}
                        className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-steel"
                      >
                        <CategoryIcon icon={c.icon} slug={c.slug} color={c.color} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span className="min-w-0 flex-1 truncate">{c.name}</span>
                            <span className="font-plate num shrink-0 text-[1.05rem] font-semibold">{formatMoney(c.total)}</span>
                            <span className="num w-10 text-right text-sm text-ink-3">
                              {s.total ? Math.round((c.total / s.total) * 100) : 0}%
                            </span>
                          </span>
                          {c.budget && (
                            <BudgetBar ratio={c.budget.ratio} level={c.budget.level} budget={c.budget.budget} />
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </section>

          <section className="board overflow-hidden" aria-labelledby="top-payees">
            <div className="board-head">
              <h2 id="top-payees">จ่ายบ่อยสุด</h2>
              <span className="meta whitespace-nowrap">5 อันดับ</span>
            </div>
            <ol className="rows px-5">
              {s.topPayees.map((p, i) => (
                <li key={p.name + i} className="flex items-center gap-3 py-3">
                  <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-steel text-sm font-semibold text-ink-2">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="text-sm text-ink-3">{p.count} ครั้ง</span>
                  </span>
                  <span className="plate-sm shrink-0 text-[1.05rem]">{formatMoney(p.total)}</span>
                </li>
              ))}
            </ol>
            {budgets.length === 0 && (
              <p className="steel-speckled m-5 mt-1 rounded-lg p-3 text-sm text-ink-2">
                <span className="inline-block">
                  ตั้งงบรายเดือนให้แต่ละหมวดได้ใน{" "}
                  <Link href="/app/settings#categories" className="font-semibold text-red underline">
                    ตั้งค่า
                  </Link>
                </span>{" "}
                <span className="inline-block">แล้วระบบจะเตือนเมื่อใกล้เกิน</span>
              </p>
            )}
          </section>
        </div>
      )}
      <p className="text-xs text-ink-3">
        <ThaiPhrases text="ตัวเลขทั้งหมดมาจากรายการของคุณเอง| ไม่ใช่คำแนะนำทางการเงิน" />
      </p>
    </div>
  );
}

function BudgetBar({ ratio, level, budget }: { ratio: number; level: "ok" | "near" | "over"; budget: number }) {
  const color = level === "over" ? "bg-red" : level === "near" ? "bg-plate-deep" : "bg-ink";
  return (
    <span className="mt-1.5 flex items-center gap-2">
      <span
        className="h-2 flex-1 overflow-hidden rounded-full bg-steel-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
        aria-label="ใช้ไปเทียบกับงบ"
      >
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </span>
      <span className="font-plate num text-xs whitespace-nowrap text-ink-3">งบ {formatMoney(budget)}</span>
    </span>
  );
}
