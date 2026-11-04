import Link from "next/link";
import { monthKeyOf, monthLabel, shiftMonth, type MonthKey } from "@/lib/core/month";

/** ‹ month › switcher that keeps other query params. */
export function MonthNav({ month, path, params = {} }: { month: MonthKey; path: string; params?: Record<string, string> }) {
  const href = (m: MonthKey) => `${path}?${new URLSearchParams({ ...params, month: m })}`;
  const isCurrent = month === monthKeyOf(new Date());
  return (
    <div className="flex items-center gap-1">
      <Link href={href(shiftMonth(month, -1))} className="btn px-2.5" aria-label="เดือนก่อน">
        ‹
      </Link>
      <span className="min-w-36 text-center font-semibold">{monthLabel(month)}</span>
      {isCurrent ? (
        <span className="btn invisible px-2.5" aria-hidden>
          ›
        </span>
      ) : (
        <Link href={href(shiftMonth(month, 1))} className="btn px-2.5" aria-label="เดือนถัดไป">
          ›
        </Link>
      )}
    </div>
  );
}
