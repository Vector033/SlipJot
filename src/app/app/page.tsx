import Link from "next/link";
import type { Metadata } from "next";
import { MonthNav } from "@/components/month-nav";
import { formatBaht } from "@/lib/core/format";
import { bangkokDay, isMonthKey, monthKeyOf, type MonthKey } from "@/lib/core/month";
import { getMonthSummary } from "@/lib/data";
import { CategoryDonut, DailyBars } from "./charts";

export const metadata: Metadata = { title: "ภาพรวม" };

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

      {sp.wiped && <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-strong">ลบข้อมูลทั้งหมดแล้ว</p>}

      {s.reviewCount > 0 && (
        <Link href="/app/review" className="flex items-center justify-between rounded-2xl bg-marker px-4 py-3 font-medium">
          <span>มี {s.reviewCount} รายการรอให้คุณตรวจ</span>
          <span aria-hidden>›</span>
        </Link>
      )}

      {alerts.map((c) => (
        <p key={c.name} role="status" className={`rounded-2xl border px-4 py-3 text-sm ${c.budget!.level === "over" ? "border-danger/30 bg-red-50 text-danger" : "border-warn/30 bg-amber-50 text-warn"}`}>
          {c.icon} {c.name}:{" "}
          {c.budget!.level === "over"
            ? `เกินงบแล้ว ${formatBaht(c.total - c.budget!.budget)}`
            : c.budget!.ratio >= 0.8
              ? `ใช้ไป ${Math.round(c.budget!.ratio * 100)}% ของงบ`
              : `ถ้าใช้เท่านี้ต่อไป สิ้นเดือนจะเกินงบ (คาด ${formatBaht(c.budget!.projected)})`}
        </p>
      ))}

      <section className="card p-5">
        <p className="text-sm text-ink-2">{isCurrent ? "ใช้ไปเดือนนี้" : "ใช้ไปทั้งเดือน"}</p>
        <p className="num mt-1 text-4xl font-bold" data-testid="month-total">
          {formatBaht(s.total)}
        </p>
        <p className="mt-1 text-sm text-ink-3">
          {s.count} รายการ
          {s.previousTotal > 0 && (
            <>
              {" · "}
              <span className={diff > 0 ? "text-warn" : "text-accent"}>
                {diff > 0 ? "มากกว่า" : "น้อยกว่า"}เดือนก่อน {formatBaht(Math.abs(diff))}
              </span>
              {isCurrent && " (เดือนก่อนทั้งเดือน)"}
            </>
          )}
        </p>
        {s.total > 0 && (
          <div className="mt-4">
            <DailyBars data={s.byDay} today={isCurrent ? bangkokDay(now) : null} />
          </div>
        )}
      </section>

      {s.total === 0 ? (
        <section className="card p-8 text-center">
          <p className="font-semibold">ยังไม่มีรายจ่ายในเดือนนี้</p>
          <p className="mt-1 text-sm text-ink-2">ส่งสลิปจากอัลบั้มเข้ามา ระบบจะอ่านและจัดหมวดให้</p>
          <Link href="/app/upload" className="btn-primary mt-4">
            ส่งสลิป
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <section className="card p-5">
            <h2 className="font-semibold">ตามหมวด</h2>
            <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <CategoryDonut data={s.byCategory} />
              <ul className="w-full space-y-3">
                {s.byCategory
                  .filter((c) => c.total > 0 || c.budget)
                  .map((c) => (
                    <li key={c.name}>
                      <Link
                        href={`/app/expenses?${new URLSearchParams({ month, cat: c.categoryId ?? "none" })}`}
                        className="block rounded-lg hover:bg-paper"
                      >
                        <div className="flex items-baseline gap-2 text-sm">
                          <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden />
                          <span className="min-w-0 flex-1 truncate">
                            {c.icon} {c.name}
                          </span>
                          <span className="num font-semibold">{formatBaht(c.total)}</span>
                          <span className="num w-10 text-right text-ink-3">{s.total ? Math.round((c.total / s.total) * 100) : 0}%</span>
                        </div>
                        {c.budget && <BudgetBar ratio={c.budget.ratio} level={c.budget.level} budget={c.budget.budget} />}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">จ่ายบ่อยสุด</h2>
            <ol className="mt-3 divide-y divide-line">
              {s.topPayees.map((p, i) => (
                <li key={p.name + i} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="num w-4 text-ink-3">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="text-ink-3">{p.count} ครั้ง</span>
                  <span className="num w-20 text-right font-semibold">{formatBaht(p.total)}</span>
                </li>
              ))}
            </ol>
            {budgets.length === 0 && (
              <p className="mt-4 rounded-xl bg-paper p-3 text-sm text-ink-2">
                ตั้งงบรายเดือนให้แต่ละหมวดได้ใน{" "}
                <Link href="/app/settings#categories" className="font-medium text-accent underline">
                  ตั้งค่า
                </Link>{" "}
                แล้วระบบจะเตือนเมื่อใกล้เกิน
              </p>
            )}
          </section>
        </div>
      )}
      <p className="text-xs text-ink-3">ตัวเลขทั้งหมดมาจากรายการของคุณเอง ไม่ใช่คำแนะนำทางการเงิน</p>
    </div>
  );
}

function BudgetBar({ ratio, level, budget }: { ratio: number; level: "ok" | "near" | "over"; budget: number }) {
  const color = level === "over" ? "bg-danger" : level === "near" ? "bg-warn" : "bg-accent";
  return (
    <div className="mt-1.5 flex items-center gap-2 pl-4.5">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
        aria-label="ใช้ไปเทียบกับงบ"
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
      <span className="num text-xs text-ink-3">งบ {formatBaht(budget)}</span>
    </div>
  );
}
