import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthKeyOf, monthLabel, shiftMonth, type MonthKey } from "@/lib/core/month";

/** ‹ month › switcher that keeps other query params. */
export function MonthNav({ month, path, params = {} }: { month: MonthKey; path: string; params?: Record<string, string> }) {
  const href = (m: MonthKey) => `${path}?${new URLSearchParams({ ...params, month: m })}`;
  const isCurrent = month === monthKeyOf(new Date());
  const arrow = "inline-flex size-11 items-center justify-center rounded-xl border-2 border-line bg-white text-ink transition-colors hover:border-ink";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="เลือกเดือน">
      <Link href={href(shiftMonth(month, -1))} className={arrow} aria-label="เดือนก่อน">
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <span className="min-w-36 text-center font-semibold" aria-live="polite">
        {monthLabel(month)}
      </span>
      {isCurrent ? (
        <span className={`${arrow} invisible`} aria-hidden />
      ) : (
        <Link href={href(shiftMonth(month, 1))} className={arrow} aria-label="เดือนถัดไป">
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
