const baht = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const bahtFixed = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatBaht(n: number, fixed = false): string {
  return `฿${(fixed ? bahtFixed : baht).format(n)}`;
}

const dateTime = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit" });

export function formatDateTime(d: Date | string): string {
  return dateTime.format(typeof d === "string" ? new Date(d) : d);
}

export function formatDate(d: Date | string): string {
  return dateOnly.format(typeof d === "string" ? new Date(d) : d);
}

/** Value for <input type="datetime-local"> in Bangkok time. */
export function toLocalInput(d: Date): string {
  return new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16);
}

/** Inverse of toLocalInput. */
export function fromLocalInput(s: string): Date {
  return new Date(`${s}:00+07:00`);
}
