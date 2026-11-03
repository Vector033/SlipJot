// Pure helpers for the messy text on Thai slips: Buddhist-era dates, Thai month
// names, amounts with commas, masked account numbers and personal titles.

const THAI_MONTHS: [RegExp, number][] = [
  [/^(ม\.?ค\.?|มกราคม)$/, 1],
  [/^(ก\.?พ\.?|กุมภาพันธ์)$/, 2],
  [/^(มี\.?ค\.?|มีนาคม)$/, 3],
  [/^(เม\.?ย\.?|เมษายน)$/, 4],
  [/^(พ\.?ค\.?|พฤษภาคม)$/, 5],
  [/^(มิ\.?ย\.?|มิถุนายน)$/, 6],
  [/^(ก\.?ค\.?|กรกฎาคม)$/, 7],
  [/^(ส\.?ค\.?|สิงหาคม)$/, 8],
  [/^(ก\.?ย\.?|กันยายน)$/, 9],
  [/^(ต\.?ค\.?|ตุลาคม)$/, 10],
  [/^(พ\.?ย\.?|พฤศจิกายน)$/, 11],
  [/^(ธ\.?ค\.?|ธันวาคม)$/, 12],
];

const EN_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// Latin letters tesseract outputs for Thai consonants in month abbreviations ("n.y." = ก.ย.).
const OCR_LOOKALIKES: Record<string, string> = { n: "ก", u: "น", y: "ย", w: "พ", a: "ล" };

export function monthFromName(name: string): number | null {
  const n = name.trim().toLowerCase();
  for (const [re, m] of THAI_MONTHS) if (re.test(n)) return m;
  const en = EN_MONTHS.findIndex((m) => n.startsWith(m));
  if (en >= 0) return en + 1;
  // OCR repair: map lookalike Latin letters, drop below-vowels and tone marks that
  // tesseract adds to abbreviations ("กุย." for ก.ย.), then try again.
  const repaired = [...n]
    .map((ch) => OCR_LOOKALIKES[ch] ?? ch)
    .join("")
    .replace(/[ุู่-์\s]/g, "");
  if (/^[ก-๙.]+$/.test(repaired)) {
    if (repaired !== n) for (const [re, m] of THAI_MONTHS) if (re.test(repaired)) return m;
    // ค read for ก in the first letter ("ค.ย." for ก.ย.). Only a fallback: ค is real in ม.ค. etc.
    const swapped = repaired.replace(/^ค/, "ก");
    if (swapped !== repaired) for (const [re, m] of THAI_MONTHS) if (re.test(swapped)) return m;
  }
  return null;
}

/**
 * Turns a printed year into a Gregorian year. 4-digit years above 2400 are Buddhist era.
 * 2-digit years are ambiguous ("69" on a Thai slip is BE 2569, "26" on an English slip is
 * CE 2026), so we pick whichever reading lands near `now`.
 */
export function resolveYear(printed: number, now = new Date()): number | null {
  const thisYear = now.getUTCFullYear();
  const plausible = (y: number) => y >= thisYear - 5 && y <= thisYear + 1;
  if (printed >= 2400) return printed - 543;
  if (printed >= 1900) return printed;
  if (printed < 100) {
    const be = 2500 + printed - 543;
    const ce = 2000 + printed;
    if (plausible(be)) return be;
    if (plausible(ce)) return ce;
  }
  return null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** ISO 8601 in Thailand time (+07:00, no DST). */
export function toBangkokIso(y: number, mo: number, d: number, h: number, mi: number, s = 0): string | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) return null;
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCDate() !== d) return null; // 31 Feb and friends
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}+07:00`;
}

const TIME_RE = /(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*[:.]\s*(\d{2}))?|(?<!\d)([01]\d|2[0-3])([0-5]\d)(?!\d)/;

/** HH:MM(:SS) from text, also "1756" when OCR drops the colon. */
function findTime(text: string): [number, number, number] | null {
  const m = TIME_RE.exec(text);
  if (!m) return null;
  return m[1] !== undefined ? [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)] : [Number(m[4]), Number(m[5]), 0];
}

/**
 * Finds a date and time in free text. Handles "4 พ.ย. 69 12:34 น.", "04 พ.ย. 2569 - 12:34",
 * "04 Nov 26, 12:34", "04/11/2569 12:34:56" and "2026-11-04 12:34".
 */
export function parseThaiDateTime(text: string, now = new Date()): string | null {
  const t = text.replace(/\s+/g, " ");

  // Day, month name, year.
  const named = /(\d{1,2})\s*([ก-๙a-zA-Z.]{2,12}?)\.?\s*(\d{2}|\d{4})(?!\d)/g;
  for (const m of t.matchAll(named)) {
    const month = monthFromName(m[2]);
    if (!month) continue;
    const year = resolveYear(Number(m[3]), now);
    if (!year) continue;
    const time = findTime(t.slice((m.index ?? 0) + m[0].length));
    if (!time) continue;
    const iso = toBangkokIso(year, month, Number(m[1]), ...time);
    if (iso) return iso;
  }

  // ISO-ish year first.
  const ymd = /(\d{4})-(\d{1,2})-(\d{1,2})[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t);
  if (ymd) {
    const year = resolveYear(Number(ymd[1]), now);
    if (year) {
      const iso = toBangkokIso(year, Number(ymd[2]), Number(ymd[3]), Number(ymd[4]), Number(ymd[5]), Number(ymd[6] ?? 0));
      if (iso) return iso;
    }
  }

  // Numeric day/month/year.
  const dmy = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(?!\d)/.exec(t);
  if (dmy) {
    const year = resolveYear(Number(dmy[3]), now);
    const time = findTime(t.slice((dmy.index ?? 0) + dmy[0].length));
    if (year && time) {
      const iso = toBangkokIso(year, Number(dmy[2]), Number(dmy[1]), ...time);
      if (iso) return iso;
    }
  }
  return null;
}

/** "1,234.50 บาท" → 1234.5. Requires exactly two decimals, the way every slip prints amounts. */
export function parseAmount(text: string): number | null {
  const m = /(\d{1,3}(?:[,\s]\d{3})+|\d+)\.(\d{2})(?!\d)/.exec(text);
  if (!m) return null;
  const value = Number(m[1].replace(/[,\s]/g, "") + "." + m[2]);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

/**
 * Last 4 visible digits of a masked account or phone number ("xxx-x-x1234-x" → "1234",
 * "XXX-XXX-5678" → "5678"). Returns null when fewer than 4 digits are visible, so we
 * never invent digits. Anything longer is cut to 4: we only ever keep the tail.
 */
export function accountLast4(masked: string): string | null {
  const digits = masked.replace(/[^0-9]/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}

/** Text that looks like a masked account or phone number. */
export const MASKED_ACCOUNT_RE = /[xX*•#\d]{1,4}(?:[-\s][xX*•#\d]{1,7}){1,4}/;

const TITLE_RE =
  /^(นางสาว|น\.ส\.?|นาง|นาย|ด\.ช\.?|ด\.ญ\.?|เด็กชาย|เด็กหญิง|คุณ|mrs\.?|mr\.?|ms\.?|miss|dr\.?)\s*/i;

/**
 * Canonical form of a person's or shop's name for matching across slips: no title
 * (นาย/นาง/น.ส./MR/MS…), no trailing initials ("สมชาย ใ." / "SOMCHAI J"), single spaces,
 * Latin lowercased. Shared with HarnKan so both apps match names the same way.
 */
export function normalizeThaiName(name: string): string {
  let n = name.normalize("NFC").replace(/\s+/g, " ").trim();
  for (let i = 0; i < 2; i++) n = n.replace(TITLE_RE, "");
  const parts = n.split(" ").filter(Boolean);
  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    const isInitial =
      last.endsWith(".") ||
      /^[a-zA-Z]$/.test(last) ||
      (/[ก-๙]/.test(last) && [...last].length <= 2) ||
      /^[xX*]+$/.test(last);
    if (!isInitial) break;
    parts.pop();
  }
  return parts.join(" ").toLowerCase();
}
