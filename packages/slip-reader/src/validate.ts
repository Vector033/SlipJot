import { BANK_CODES, type Field, type Party, type RawSlip, type SlipReadResult } from "./types.ts";

// Rule checks run on every provider's output. A model can be confidently wrong, so
// these rules cap confidence instead of trusting what the provider reported.

export const REVIEW_THRESHOLD = 0.75;
const MAX_AMOUNT = 2_000_000;

function clamp01(n: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

function capped<T>(field: Field<T>, cap: number): Field<T> {
  return { value: field.value, confidence: Math.min(field.confidence, cap) };
}

function cleanParty(p: Party): Party {
  const last4 = p.accountLast4.value;
  return {
    name: p.name.value?.trim() ? { value: p.name.value.trim(), confidence: clamp01(p.name.confidence) } : empty(),
    bank:
      p.bank.value && (BANK_CODES as readonly string[]).includes(p.bank.value)
        ? { value: p.bank.value, confidence: clamp01(p.bank.confidence) }
        : empty(),
    // Privacy rule: only ever 4 digits leave the reader.
    accountLast4: last4 && /^\d{4}$/.test(last4) ? { value: last4, confidence: clamp01(p.accountLast4.confidence) } : empty(),
  };
}

export function empty<T>(): Field<T> {
  return { value: null, confidence: 0 };
}

export function finalize(raw: RawSlip, now = new Date()): SlipReadResult {
  const issues: string[] = [];
  let amount = { ...raw.amount, confidence: clamp01(raw.amount.confidence) };
  let dateTime = { ...raw.dateTime, confidence: clamp01(raw.dateTime.confidence) };
  const sender = cleanParty(raw.sender);
  const receiver = cleanParty(raw.receiver);

  if (amount.value === null) {
    issues.push("อ่านยอดเงินไม่ได้");
  } else if (!(amount.value > 0) || amount.value > MAX_AMOUNT) {
    issues.push("ยอดเงินดูผิดปกติ");
    amount = capped(amount, 0.3);
  } else {
    amount = { value: Math.round(amount.value * 100) / 100, confidence: amount.confidence };
  }

  if (dateTime.value === null) {
    issues.push("อ่านวันเวลาไม่ได้");
  } else {
    const t = Date.parse(dateTime.value);
    if (Number.isNaN(t)) {
      issues.push("รูปแบบวันเวลาไม่ถูกต้อง");
      dateTime = { value: null, confidence: 0 };
    } else if (t > now.getTime() + 24 * 3600_000) {
      issues.push("วันที่อยู่ในอนาคต");
      dateTime = capped(dateTime, 0.3);
    } else if (t < now.getTime() - 3 * 365 * 24 * 3600_000) {
      issues.push("วันที่เก่ากว่า 3 ปี");
      dateTime = capped(dateTime, 0.5);
    }
  }

  if (receiver.name.value === null) issues.push("อ่านชื่อผู้รับไม่ได้");

  const reference = raw.reference.value?.trim()
    ? { value: raw.reference.value.trim(), confidence: clamp01(raw.reference.confidence) }
    : empty<string>();
  const memo = raw.memo.value?.trim()
    ? { value: raw.memo.value.trim(), confidence: clamp01(raw.memo.confidence) }
    : empty<string>();

  // The three fields an expense needs. A missing one pulls the score to zero.
  const overallConfidence =
    Math.round(
      Math.min(
        amount.confidence,
        0.5 * amount.confidence + 0.3 * dateTime.confidence + 0.2 * receiver.name.confidence,
      ) * 100,
    ) / 100;

  const lowFields = [
    amount.confidence < REVIEW_THRESHOLD && amount.value !== null ? "ยอดเงิน" : null,
    dateTime.confidence < REVIEW_THRESHOLD && dateTime.value !== null ? "วันเวลา" : null,
    receiver.name.confidence < REVIEW_THRESHOLD && receiver.name.value !== null ? "ชื่อผู้รับ" : null,
  ].filter(Boolean);
  if (lowFields.length) issues.push(`ไม่แน่ใจ: ${lowFields.join(", ")}`);

  return {
    ...raw,
    amount,
    dateTime,
    sender,
    receiver,
    reference,
    memo,
    overallConfidence,
    needsReview: issues.length > 0 || overallConfidence < REVIEW_THRESHOLD,
    issues,
  };
}
