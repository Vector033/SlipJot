import type { BankCode } from "./types.ts";

// The mini QR on Thai transfer slips is an EMVCo-style TLV string:
//   00 <len> [ 00 06 000001 | 01 03 <sending bank code> | 02 <len> <transaction ref> ] 51 02 TH 91 04 <crc>
// We only read it to get a stable dedup key and the printed reference. It does not
// prove the transfer happened; only the bank's own API can do that.

const BANK_BY_NUMBER: Record<string, BankCode> = {
  "002": "BBL",
  "004": "KBANK",
  "006": "KTB",
  "011": "TTB",
  "014": "SCB",
  "022": "CIMB",
  "024": "UOB",
  "025": "BAY",
  "030": "GSB",
  "033": "GHB",
  "034": "BAAC",
  "067": "TISCO",
  "069": "KKP",
  "073": "LHB",
};

export function parseTlv(s: string): Map<string, string> | null {
  const out = new Map<string, string>();
  let i = 0;
  while (i < s.length) {
    if (i + 4 > s.length) return null;
    const tag = s.slice(i, i + 2);
    const len = Number(s.slice(i + 2, i + 4));
    if (!Number.isInteger(len) || i + 4 + len > s.length) return null;
    out.set(tag, s.slice(i + 4, i + 4 + len));
    i += 4 + len;
  }
  return out;
}

export interface SlipQrInfo {
  reference: string | null;
  sendingBank: BankCode | null;
}

export function parseSlipQr(payload: string): SlipQrInfo | null {
  const top = parseTlv(payload.trim());
  const inner = top?.get("00");
  if (!inner) return null;
  const fields = parseTlv(inner);
  if (!fields) return null;
  return {
    reference: fields.get("02") || null,
    sendingBank: BANK_BY_NUMBER[fields.get("01") ?? ""] ?? null,
  };
}

export const BANK_NUMBERS: Partial<Record<BankCode, string>> = Object.fromEntries(
  Object.entries(BANK_BY_NUMBER).map(([num, code]) => [code, num]),
);
