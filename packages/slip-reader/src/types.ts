// Public contract of the slip reader. HarnKan's copy of this package exports the
// same shapes, so keep changes backwards compatible and tell the other repo.

export const BANK_CODES = [
  "KBANK",
  "SCB",
  "BBL",
  "KTB",
  "BAY",
  "TTB",
  "GSB",
  "BAAC",
  "GHB",
  "UOB",
  "CIMB",
  "KKP",
  "LHB",
  "TISCO",
  "TRUEMONEY",
  "OTHER",
] as const;
export type BankCode = (typeof BANK_CODES)[number];

/** A value read from the slip plus how sure we are of it (0..1). */
export interface Field<T> {
  value: T | null;
  confidence: number;
}

export interface Party {
  name: Field<string>;
  bank: Field<BankCode>;
  /** Last 4 visible digits only. Full account or phone numbers are never returned. */
  accountLast4: Field<string>;
}

export type SlipSource = "gemini" | "ocr" | "fake";

export interface SlipUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface SlipReadResult {
  /** THB, rounded to 2 decimals. */
  amount: Field<number>;
  /** ISO 8601 with +07:00. Buddhist-era years are converted. */
  dateTime: Field<string>;
  sender: Party;
  receiver: Party;
  /** Transaction reference as printed on the slip. */
  reference: Field<string>;
  memo: Field<string>;
  /** Raw text of the slip's mini QR code, when one was found. Used for dedup only, not bank verification. */
  qrPayload: string | null;
  overallConfidence: number;
  needsReview: boolean;
  /** Human-readable reasons the result needs review (Thai). */
  issues: string[];
  source: SlipSource;
  model?: string;
  usage?: SlipUsage;
  /** Milliseconds spent reading. */
  elapsedMs?: number;
}

export type ProviderChoice = "auto" | "gemini" | "ocr";

export interface ReadSlipOptions {
  /** "auto" uses Gemini when an API key is available, otherwise local OCR. */
  provider?: ProviderChoice;
  apiKey?: string;
  model?: string;
  /** Decode the slip's QR code (Node only). Default true on the OCR path, false on the Gemini path. */
  decodeQr?: boolean;
  /** Clock for date sanity checks; tests pass a fixed date. */
  now?: Date;
}

/** Everything a provider extracted before validation fills in the verdict. */
export type RawSlip = Omit<SlipReadResult, "overallConfidence" | "needsReview" | "issues">;
