// Rule-based parser that turns OCR lines from a Thai transfer slip into fields.
// It is the fallback when no LLM key is set and the baseline the LLM is measured against.
// Pure: no I/O, so it runs in tests and in any runtime.

import { detectBank } from "./banks.ts";
import { accountLast4, parseAmount, parseThaiDateTime } from "./normalize.ts";
import { parseSlipQr } from "./qr-payload.ts";
import type { BankCode, Field, Party, RawSlip } from "./types.ts";
import { empty } from "./validate.ts";

export interface OcrLine {
  text: string;
  /** 0..1 */
  confidence: number;
}

const AMOUNT_LABEL = /^(จำนวนเงิน|จำนวน|ยอดโอน|ยอดเงิน|ยอดชำระ|ยอดสุทธิ|amount|totalamount|total)/;
const FEE_LABEL = /(ค่าธรรมเนียม|fee)/;
const REF_LABEL =
  /^(เลขที่รายการ|รหัสอ้างอิง|หมายเลขอ้างอิง|เลขอ้างอิง|รหัสรายการ|หมายเลขรายการ|transactionreference|transactionref|transactionid|transactionno|referenceno|reference|refno|ref)/;
const MEMO_LABEL = /^(บันทึกช่วยจำ|บันทึก|หมายเหตุ|memo|note)/;
const SENDER_LABEL = /^(จาก|from|ผู้โอน|บัญชีต้นทาง)[:]?$/;
const RECEIVER_LABEL = /^(ไปยัง|ไปที่|ถึง|to|ผู้รับเงิน|ผู้รับ|บัญชีปลายทาง)[:]?$/;
const DATE_LABEL = /^(วันที่ทำรายการ|วันที่|วันเวลา|date|time)/;

/** Fixes the usual tesseract quirks in Thai text before matching. */
export function cleanOcrText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/ํา/g, "ำ") // ํา → ำ
    .replace(/ํ\s*า/g, "ำ")
    .replace(/[|]/g, "")
    .trim();
}

function compact(text: string) {
  return text.replace(/\s+/g, "").toLowerCase();
}

/** Text after a label: after the first ":" or wide gap. */
function valueAfterLabel(text: string): string {
  const m = /[:：]|\s{2,}/.exec(text);
  return m ? text.slice(m.index + m[0].length).trim() : "";
}

function isLabelLine(c: string) {
  return (
    SENDER_LABEL.test(c) ||
    RECEIVER_LABEL.test(c) ||
    AMOUNT_LABEL.test(c) ||
    REF_LABEL.test(c) ||
    MEMO_LABEL.test(c) ||
    FEE_LABEL.test(c) ||
    DATE_LABEL.test(c)
  );
}

/**
 * The masked account token in a line ("XXX-X-X6222-X"), tolerating OCR noise such as
 * "ว00(-%-%7241-%". Needs dashes or mask characters plus at least 3 digits.
 */
function maskedToken(text: string): string | null {
  for (const token of text.split(/\s+/)) {
    const digits = token.match(/\d/g)?.length ?? 0;
    if (digits < 3 || token.length < 6) continue;
    const dashes = token.match(/-/g)?.length ?? 0;
    const masks = token.match(/[xX*•#%]/g)?.length ?? 0;
    if (dashes >= 1 && (masks >= 1 || dashes >= 2)) return token;
  }
  return null;
}

function looksMasked(text: string) {
  return maskedToken(text) !== null;
}

/** Strips OCR junk around a name: stray Latin bits in front of Thai, trailing symbols. */
function cleanName(text: string): string {
  let t = text.replace(/[↓→>»]+/g, " ").trim();
  if (/[ก-๙]/.test(t)) t = t.replace(/^[A-Za-z]{1,3}\s+(?=[ก-๙])/, "");
  t = t.replace(/[\s\-_.,:;'"`~]+$/, "").replace(/^[\s\-_.,:;'"`~]+/, "");
  return t.replace(/\s+/g, " ");
}

function field<T>(value: T | null, confidence: number): Field<T> {
  return value === null ? empty<T>() : { value, confidence: Math.round(confidence * 100) / 100 };
}

interface Line extends OcrLine {
  c: string;
}

/** OCR splits big digits apart ("5, 541 .00", "3,679. 14"); glue numbers back together. */
function joinDigits(text: string) {
  return text.replace(/(?<=[\d,.])\s+(?=[\d,.])/g, "");
}

function findAmount(lines: Line[]): Field<number> {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!AMOUNT_LABEL.test(l.c) || FEE_LABEL.test(l.c)) continue;
    for (const [text, conf] of [
      [valueAfterLabel(l.text), l.confidence],
      [lines[i + 1]?.text ?? "", lines[i + 1]?.confidence ?? 0],
    ] as const) {
      const v = parseAmount(joinDigits(text));
      if (v !== null) return field(v, 0.95 * conf);
    }
  }
  // No label: the biggest "x.xx" that is not a fee.
  let best: { v: number; conf: number } | null = null;
  for (const l of lines) {
    if (FEE_LABEL.test(l.c) || REF_LABEL.test(l.c)) continue;
    const v = parseAmount(joinDigits(l.text));
    if (v !== null && (!best || v > best.v)) best = { v, conf: l.confidence };
  }
  return best ? field(best.v, 0.5 * best.conf) : empty();
}

function findDateTime(lines: Line[], now: Date): Field<string> {
  for (let i = 0; i < lines.length; i++) {
    const own = parseThaiDateTime(lines[i].text, now);
    if (own) return field(own, 0.95 * lines[i].confidence);
    if (lines[i + 1]) {
      const joined = parseThaiDateTime(`${lines[i].text} ${lines[i + 1].text}`, now);
      if (joined) return field(joined, 0.85 * Math.min(lines[i].confidence, lines[i + 1].confidence));
    }
  }
  return empty();
}

function findReference(lines: Line[]): Field<string> {
  for (let i = 0; i < lines.length; i++) {
    if (!REF_LABEL.test(lines[i].c)) continue;
    for (const l of [{ text: valueAfterLabel(lines[i].text), confidence: lines[i].confidence }, lines[i + 1]]) {
      if (!l) continue;
      const tokens = l.text.match(/[A-Za-z0-9][A-Za-z0-9-]{5,}/g) ?? [];
      const best = tokens.filter((t) => /\d{4}/.test(t)).sort((a, b) => b.length - a.length)[0];
      if (best) return field(best, 0.9 * l.confidence);
    }
  }
  return empty();
}

function findMemo(lines: Line[]): Field<string> {
  for (const l of lines) {
    if (!MEMO_LABEL.test(l.c)) continue;
    const v = valueAfterLabel(l.text);
    if (v) return field(v, 0.85 * l.confidence);
  }
  return empty();
}

function emptyParty(): Party {
  return { name: empty(), bank: empty(), accountLast4: empty() };
}

/**
 * Each party block ends with a masked account line. The name is the closest line above
 * it that is not a bank name, label or arrow; the bank is anywhere between the two.
 */
function partyAt(lines: Line[], anchor: number, floor: number, labelled: boolean): Party {
  const acct = lines[anchor];
  const maskText = maskedToken(acct.text) ?? acct.text;
  const party = emptyParty();
  party.accountLast4 = field(accountLast4(maskText), 0.9 * acct.confidence);

  let nameIdx = -1;
  for (let i = anchor - 1; i >= floor; i--) {
    const l = lines[i];
    if (isLabelLine(l.c) || looksMasked(l.text)) break;
    // "ธ." (ธนาคาร) starts a bank line even when OCR garbles the bank's name.
    const bankLine = detectBank(l.text) !== null || l.c.startsWith("ธ.");
    if (bankLine && l.c.length <= 26 && !/^(นาย|นาง|น\.ส|mr|ms|mrs)/i.test(l.text)) continue;
    if (compact(l.text).length <= 2) continue; // arrows, stray marks
    nameIdx = i;
    break;
  }
  if (nameIdx >= 0) {
    const name = cleanName(lines[nameIdx].text);
    if (name) party.name = field(name, (labelled ? 0.9 : 0.85) * lines[nameIdx].confidence);
  }

  let bank: BankCode | null = null;
  let bankConf = 0;
  for (let i = Math.max(nameIdx + 1, floor); i <= anchor && !bank; i++) {
    bank = detectBank(lines[i].text);
    bankConf = lines[i].confidence;
  }
  if (bank) party.bank = field(bank, 0.9 * bankConf);
  return party;
}

export interface ParseOptions {
  now?: Date;
  qrPayload?: string | null;
}

export function parseSlipText(ocr: OcrLine[], opts: ParseOptions = {}): RawSlip {
  const now = opts.now ?? new Date();
  const lines: Line[] = ocr
    .map((l) => ({ text: cleanOcrText(l.text), confidence: l.confidence }))
    .filter((l) => l.text)
    .map((l) => ({ ...l, c: compact(l.text) }));

  const anchors = lines.map((l, i) => (looksMasked(l.text) && !REF_LABEL.test(l.c) ? i : -1)).filter((i) => i >= 0);
  const receiverLabel = lines.findIndex((l) => RECEIVER_LABEL.test(l.c));
  const labelled = receiverLabel >= 0;

  let sender = emptyParty();
  let receiver = emptyParty();
  if (anchors.length >= 2) {
    sender = partyAt(lines, anchors[0], 0, labelled);
    receiver = partyAt(lines, anchors[1], anchors[0] + 1, labelled);
  } else if (anchors.length === 1) {
    const isReceiver = receiverLabel < 0 || receiverLabel < anchors[0];
    if (isReceiver) receiver = partyAt(lines, anchors[0], Math.max(receiverLabel + 1, 0), labelled);
    else sender = partyAt(lines, anchors[0], 0, labelled);
  }
  // No account line for the receiver, but a "to" label: take the line after it.
  if (receiver.name.value === null && receiverLabel >= 0 && lines[receiverLabel + 1]) {
    const l = lines[receiverLabel + 1];
    receiver.name = field(cleanName(l.text) || null, 0.7 * l.confidence);
  }

  let reference = findReference(lines);
  const qr = opts.qrPayload ? parseSlipQr(opts.qrPayload) : null;
  if (qr?.reference) reference = field(qr.reference, 0.98);
  if (qr?.sendingBank && !sender.bank.value) sender.bank = field(qr.sendingBank, 0.9);

  return {
    amount: findAmount(lines),
    dateTime: findDateTime(lines, now),
    sender,
    receiver,
    reference,
    memo: findMemo(lines),
    qrPayload: opts.qrPayload ?? null,
    source: "ocr",
  };
}
