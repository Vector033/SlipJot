// Months are Bangkok calendar months (UTC+7, no DST), whatever timezone the server runs in.

const OFFSET_MS = 7 * 3600_000;

export type MonthKey = `${number}-${string}`; // "2026-11"

export function monthKeyOf(date: Date): MonthKey {
  const d = new Date(date.getTime() + OFFSET_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` as MonthKey;
}

export function isMonthKey(s: string | undefined | null): s is MonthKey {
  return !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}

/** [start, end) of a Bangkok month as UTC instants. */
export function monthRange(key: MonthKey): { start: Date; end: Date } {
  const [y, m] = key.split("-").map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, 1) - OFFSET_MS),
    end: new Date(Date.UTC(y, m, 1) - OFFSET_MS),
  };
}

export function shiftMonth(key: MonthKey, delta: number): MonthKey {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` as MonthKey;
}

export function daysInMonth(key: MonthKey): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Day of month (1-based) of an instant, in Bangkok time. */
export function bangkokDay(date: Date): number {
  return new Date(date.getTime() + OFFSET_MS).getUTCDate();
}

const TH_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export function monthLabel(key: MonthKey): string {
  const [y, m] = key.split("-").map(Number);
  return `${TH_MONTHS[m - 1]} ${y + 543}`;
}
