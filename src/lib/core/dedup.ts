// Decides whether an uploaded slip is one we already have.
// "exact" duplicates are skipped; "possible" ones are saved but sent to review.

export interface SlipFingerprint {
  sha256: string;
  dhash: string | null;
  reference: string | null;
  qrPayload: string | null;
  amount: number | null;
  /** ISO */
  occurredAt: string | null;
  payeeKey: string;
}

export interface ExistingExpense {
  id: string;
  imageSha256: string | null;
  imageDhash: string | null;
  reference: string | null;
  qrPayload: string | null;
  amount: number;
  occurredAt: Date;
  payeeKey: string;
}

export type DuplicateVerdict =
  | { kind: "none" }
  | { kind: "exact"; of: string; reason: "same-image" | "same-reference" | "same-qr" }
  | { kind: "possible"; of: string; reason: "same-amount-time-payee" | "similar-image" };

export function hamming(a: string, b: string): number {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

/** dHash bits that may differ between two screenshots of the same slip. */
export const SIMILAR_IMAGE_BITS = 5;

export function findDuplicate(slip: SlipFingerprint, existing: ExistingExpense[]): DuplicateVerdict {
  for (const e of existing) {
    if (e.imageSha256 && e.imageSha256 === slip.sha256) return { kind: "exact", of: e.id, reason: "same-image" };
    if (slip.qrPayload && e.qrPayload === slip.qrPayload) return { kind: "exact", of: e.id, reason: "same-qr" };
    // Short references are not unique enough across banks.
    if (slip.reference && slip.reference.length >= 8 && e.reference === slip.reference) {
      return { kind: "exact", of: e.id, reason: "same-reference" };
    }
  }
  const t = slip.occurredAt ? Date.parse(slip.occurredAt) : NaN;
  for (const e of existing) {
    const sameAmount = slip.amount !== null && Math.abs(e.amount - slip.amount) < 0.005;
    if (!sameAmount) continue;
    const sameMinute = !Number.isNaN(t) && Math.abs(e.occurredAt.getTime() - t) < 60_000;
    if (sameMinute && slip.payeeKey && e.payeeKey === slip.payeeKey) {
      return { kind: "possible", of: e.id, reason: "same-amount-time-payee" };
    }
    if (slip.dhash && e.imageDhash && hamming(slip.dhash, e.imageDhash) <= SIMILAR_IMAGE_BITS) {
      return { kind: "possible", of: e.id, reason: "similar-image" };
    }
  }
  return { kind: "none" };
}

export const DUPLICATE_REASON_TH: Record<string, string> = {
  "same-image": "อัปโหลดรูปนี้ไปแล้ว",
  "same-reference": "มีรายการเลขอ้างอิงนี้แล้ว",
  "same-qr": "มีสลิปนี้แล้ว (QR ตรงกัน)",
  "same-amount-time-payee": "อาจเป็นสลิปซ้ำ: ยอด เวลา และผู้รับตรงกับรายการเดิม",
  "similar-image": "อาจเป็นสลิปซ้ำ: รูปคล้ายรายการเดิมและยอดเท่ากัน",
};
