import { describe, expect, it } from "vitest";
import { fromGemini, type GeminiSlip } from "./gemini.ts";
import { parseSlipText, type OcrLine } from "./parse.ts";
import { parseSlipQr } from "./qr-payload.ts";
import { finalize } from "./validate.ts";

const now = new Date("2026-11-04T12:00:00+07:00");
const L = (text: string, confidence = 0.93): OcrLine => ({ text, confidence });

// Real tesseract output for synthetic slips, noise included.
const KBANK_STYLE = [
  L("โอนเงินสําเร็จ"),
  L("18 n.y. 69 17:14 น.", 0.84),
  L("นาย ภานวัฒน์ ปัญญาดี"),
  L("ธ.กสิกรไทย"),
  L("XXX-X-X6222-X", 0.85),
  L("J", 0.9),
  L("นางสาว กนกวรรณ ใจดี"),
  L("ธ.กรุงศรีอยุธยา"),
  L("ว00(-%-%7241-%", 0.75),
  L("เลขที่รายการ:                                  [ต Hi 1 [=]", 0.83),
  L("075817148680BTF47188                     Sur 1 TH", 0.5),
  L("จํานวน:        3,866.00 un  [=] gi)", 0.84),
  L("ค่าธรรมเนียม:                               0.00 บาท"),
  L("บันทึกช่วยจํา:                     คืนเงินค่าตั๋ว"),
];

const SCB_STYLE = [
  L("อนเงินสําเร็จ"),
  L("17 ต.ค. 2569 - 10:26", 0.92),
  L("รหัสอ้างอิง: 2026101747884130"),
  L("จาก"),
  L("นาง พิมพ์ชนก พรหมมา"),
  L("XXX-XXX228-8", 0.86),
  L("ไปยัง"),
  L("นาง พิมพ์ชนก บุญมา"),
  L("ธ.ไทยพาณิชย์"),
  L("XXX-XXX-0615", 0.9),
  L("จํานวนเงิน                                       5, 541 .00", 0.92),
];

const BBL_STYLE = [
  L("Transfer successful"),
  L("Date                                        16 Sep 26, 01:52"),
  L("From"),
  L("MR. SUPACHAI THONGDEE"),
  L("Bangkok Bank XXX-X-X681-5"),
  L("To"),
  L("MR. NATTHAPHON WONGKHAM"),
  L("Bangkok Bank XXX-X-X887-5"),
  L("Amount (THB)                                3,890.97"),
  L("Fee (THB)                                                0.00"),
  L("Transaction reference no."),
  L("048-496-198423"),
];

describe("parseSlipText", () => {
  it("reads an unlabelled K PLUS-style slip", () => {
    const r = finalize(parseSlipText(KBANK_STYLE, { now }), now);
    expect(r.amount.value).toBe(3866);
    expect(r.dateTime.value).toBe("2026-09-18T17:14:00+07:00");
    expect(r.sender.name.value).toBe("นาย ภานวัฒน์ ปัญญาดี");
    expect(r.sender.bank.value).toBe("KBANK");
    expect(r.sender.accountLast4.value).toBe("6222");
    expect(r.receiver.name.value).toBe("นางสาว กนกวรรณ ใจดี");
    expect(r.receiver.bank.value).toBe("BAY");
    expect(r.receiver.accountLast4.value).toBe("7241");
    expect(r.reference.value).toBe("075817148680BTF47188");
    expect(r.memo.value).toBe("คืนเงินค่าตั๋ว");
    expect(r.source).toBe("ocr");
  });

  it("reads a labelled slip and glues split digits", () => {
    const r = parseSlipText(SCB_STYLE, { now });
    expect(r.amount.value).toBe(5541);
    expect(r.sender.name.value).toBe("นาง พิมพ์ชนก พรหมมา");
    expect(r.sender.accountLast4.value).toBe("2288");
    expect(r.receiver.name.value).toBe("นาง พิมพ์ชนก บุญมา");
    expect(r.receiver.bank.value).toBe("SCB");
    expect(r.reference.value).toBe("2026101747884130");
  });

  it("reads an English slip and ignores the fee", () => {
    const r = parseSlipText(BBL_STYLE, { now });
    expect(r.amount.value).toBe(3890.97);
    expect(r.dateTime.value).toBe("2026-09-16T01:52:00+07:00");
    expect(r.receiver.name.value).toBe("MR. NATTHAPHON WONGKHAM");
    expect(r.receiver.accountLast4.value).toBe("8875");
    expect(r.reference.value).toBe("048-496-198423");
  });

  it("prefers the QR reference and takes the sending bank from it", () => {
    const qr = "0041000600000101030040220075817148680BTF471885102TH91042477";
    const r = parseSlipText(SCB_STYLE, { now, qrPayload: qr });
    expect(r.reference.value).toBe("075817148680BTF47188");
    expect(r.qrPayload).toBe(qr);
  });

  it("flags an unreadable image for review", () => {
    const r = finalize(parseSlipText([L("ไม่มีอะไร", 0.3)], { now }), now);
    expect(r.needsReview).toBe(true);
    expect(r.overallConfidence).toBe(0);
    expect(r.issues).toContain("อ่านยอดเงินไม่ได้");
  });
});

describe("parseSlipQr", () => {
  it("reads the transaction reference and sending bank", () => {
    expect(parseSlipQr("0041000600000101030040220075817148680BTF471885102TH91042477")).toEqual({
      reference: "075817148680BTF47188",
      sendingBank: "KBANK",
    });
  });

  it("returns null for other QR codes", () => {
    expect(parseSlipQr("https://example.com")).toBeNull();
    expect(parseSlipQr("00020101021129370016A000000677010111")).toBeNull();
  });
});

describe("finalize", () => {
  const base = parseSlipText(KBANK_STYLE, { now });

  it("caps confidence for amounts and dates that cannot be right", () => {
    const r = finalize({ ...base, amount: { value: 9_999_999, confidence: 0.99 } }, now);
    expect(r.amount.confidence).toBeLessThanOrEqual(0.3);
    expect(r.needsReview).toBe(true);
    const future = finalize({ ...base, dateTime: { value: "2027-01-01T00:00:00+07:00", confidence: 0.99 } }, now);
    expect(future.issues).toContain("วันที่อยู่ในอนาคต");
  });

  it("never lets more than 4 account digits through", () => {
    const leaked = { ...base.receiver, accountLast4: { value: "1234567890", confidence: 1 } };
    const r = finalize({ ...base, receiver: leaked }, now);
    expect(r.receiver.accountLast4.value).toBeNull();
  });
});

describe("fromGemini", () => {
  const g: GeminiSlip = {
    is_transfer_slip: true,
    amount: 150,
    amount_confidence: 0.95,
    date_text: "4 พ.ย. 69 12:34 น.",
    datetime_iso: "2026-11-04T12:34:00+07:00",
    datetime_confidence: 0.9,
    sender: { name: "นาย ก", name_confidence: 0.9, bank: "KBANK", bank_confidence: 0.9, account_masked: "xxx-x-x1234-x", account_confidence: 0.9 },
    receiver: { name: "ร้านป้าแดง", name_confidence: 0.9, bank: null, bank_confidence: 0, account_masked: "xxx-xxx-5678", account_confidence: 0.8 },
    reference: "0123",
    reference_confidence: 0.8,
    memo: null,
    memo_confidence: 0,
  };

  it("maps the model output and trusts our date parser over the model's conversion", () => {
    const r = fromGemini({ ...g, datetime_iso: "2569-11-04T12:34:00+07:00" }, now);
    expect(r.dateTime.value).toBe("2026-11-04T12:34:00+07:00");
    expect(r.dateTime.confidence).toBeLessThanOrEqual(0.6);
    expect(r.sender.accountLast4.value).toBe("1234");
    expect(r.receiver.accountLast4.value).toBe("5678");
    expect(r.memo.value).toBeNull();
  });

  it("distrusts images the model says are not slips", () => {
    const r = finalize(fromGemini({ ...g, is_transfer_slip: false }, now), now);
    expect(r.needsReview).toBe(true);
  });
});
