import type { BankCode } from "./types.ts";

// Names and abbreviations as they appear on slips, matched case-insensitively.
// Order matters: longer, more specific aliases come first (กรุงไทย before ไทย).
const BANK_ALIASES: [BankCode, string[]][] = [
  ["KBANK", ["กสิกรไทย", "กสิกร", "kasikornbank", "kasikorn", "k plus", "k+", "kbank"]],
  ["SCB", ["ไทยพาณิชย์", "siam commercial", "scb easy", "scb"]],
  ["BBL", ["กรุงเทพ", "bangkok bank", "bualuang", "bbl"]],
  ["KTB", ["กรุงไทย", "krungthai", "krung thai", "ktb"]],
  ["BAY", ["กรุงศรีอยุธยา", "กรุงศรี", "krungsri", "bank of ayudhya", "bay"]],
  ["TTB", ["ทหารไทยธนชาต", "ทีทีบี", "tmbthanachart", "ttb"]],
  ["GSB", ["ออมสิน", "government savings", "mymo", "gsb"]],
  ["BAAC", ["ธ.ก.ส.", "ธกส", "เพื่อการเกษตร", "baac"]],
  ["GHB", ["อาคารสงเคราะห์", "ธอส", "ghb"]],
  ["UOB", ["ยูโอบี", "uob"]],
  ["CIMB", ["ซีไอเอ็มบี", "cimb"]],
  ["KKP", ["เกียรตินาคิน", "kiatnakin", "kkp"]],
  ["LHB", ["แลนด์ แอนด์ เฮ้าส์", "แลนด์แอนด์เฮ้าส์", "lh bank", "lhb"]],
  ["TISCO", ["ทิสโก้", "tisco"]],
  ["TRUEMONEY", ["ทรูมันนี่", "truemoney", "true money"]],
];

export const BANK_NAMES_TH: Record<BankCode, string> = {
  KBANK: "กสิกรไทย",
  SCB: "ไทยพาณิชย์",
  BBL: "กรุงเทพ",
  KTB: "กรุงไทย",
  BAY: "กรุงศรีอยุธยา",
  TTB: "ทีทีบี",
  GSB: "ออมสิน",
  BAAC: "ธ.ก.ส.",
  GHB: "อาคารสงเคราะห์",
  UOB: "ยูโอบี",
  CIMB: "ซีไอเอ็มบี",
  KKP: "เกียรตินาคิน",
  LHB: "แลนด์ แอนด์ เฮ้าส์",
  TISCO: "ทิสโก้",
  TRUEMONEY: "TrueMoney",
  OTHER: "อื่น ๆ",
};

function isAsciiWord(alias: string) {
  return /^[a-z+ ]+$/.test(alias);
}

// Thai consonants tesseract confuses in bank names (คสิกร → กสิกร, ธนซาต → ธนชาต).
const OCR_SWAPS: [RegExp, string][] = [
  [/ค/g, "ก"],
  [/ซ/g, "ช"],
];

/**
 * First bank mentioned in the text, or null. Short Latin codes must stand alone ("scb",
 * not "scbx"). Retries with common OCR consonant swaps when nothing matches as printed.
 */
export function detectBank(text: string): BankCode | null {
  const exact = detectBankExact(text);
  if (exact) return exact;
  let repaired = text;
  for (const [re, to] of OCR_SWAPS) repaired = repaired.replace(re, to);
  return repaired !== text ? detectBankExact(repaired) : null;
}

function detectBankExact(text: string): BankCode | null {
  const lower = text.toLowerCase();
  let best: { code: BankCode; index: number } | null = null;
  for (const [code, aliases] of BANK_ALIASES) {
    for (const alias of aliases) {
      let index: number;
      if (isAsciiWord(alias)) {
        const escaped = alias.replace(/[+]/g, "\\+");
        const m = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).exec(lower);
        index = m ? m.index + m[1].length : -1;
      } else {
        index = lower.indexOf(alias);
      }
      if (index >= 0 && (!best || index < best.index)) best = { code, index };
    }
  }
  return best?.code ?? null;
}
