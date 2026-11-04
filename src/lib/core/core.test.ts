import { describe, expect, it, vi } from "vitest";
import { budgetStatus } from "./budget";
import { categorize, keywordCategory, payeeKey } from "./categorize";
import { expensesToCsv } from "./csv";
import { findDuplicate, type ExistingExpense } from "./dedup";
import { monthKeyOf, monthLabel, monthRange, shiftMonth } from "./month";

describe("payeeKey", () => {
  it("ignores titles, initials and spacing", () => {
    expect(payeeKey("นาย สมชาย ใจดี")).toBe(payeeKey("สมชาย  ใจดี"));
    expect(payeeKey("MR. SOMCHAI J")).toBe("somchai");
    expect(payeeKey("", "1234")).toBe("#1234");
    expect(payeeKey(null)).toBe("");
  });

  it("survives OCR dropping Thai vowel and tone marks", () => {
    expect(payeeKey("ก๋วยเตี๋ยวเรือลุงชัย")).toBe(payeeKey("ก๋วยเติียวเรือลงชัย"));
    expect(payeeKey("นาย ภานุวัฒน์ ปัญญาดี")).toBe(payeeKey("นาย ภานวัฒน์ ปัญญาดี"));
  });
});

describe("keywordCategory", () => {
  it.each([
    [{ payeeName: "GRAB*FOOD" }, "food"],
    [{ payeeName: "Grab Taxi" }, "transport"],
    [{ payeeName: "หอพักบ้านสวนนิมมาน" }, "housing"],
    [{ payeeName: "การไฟฟ้าส่วนภูมิภาค" }, "bills"],
    [{ payeeName: "ร้านข้าวมันไก่ป้าแดง" }, "food"],
    [{ payeeName: "SHOPEE" }, "shopping"],
    [{ payeeName: "บจก. ซีพี ออลล์" }, "shopping"],
    [{ payeeName: "นาย สมชาย ใจดี", memo: "ค่าข้าว" }, "food"],
    [{ payeeName: "นาย สมชาย ใจดี", memo: "คืนเงินค่าตั๋ว" }, "people"],
    [{ payeeName: "นาย สมชาย ใจดี", memo: "ค่าหนังสือ" }, "education"],
  ] as const)("%o → %s", (input, slug) => {
    expect(keywordCategory(input)?.slug).toBe(slug);
  });

  it("matches Latin keywords as whole words only", () => {
    expect(keywordCategory({ payeeName: "RAISE CO" })).toBeNull();
    expect(keywordCategory({ payeeName: "นาย สมชาย ใจดี" })).toBeNull();
  });
});

describe("categorize", () => {
  it("uses a learned rule before keywords and never calls the LLM", async () => {
    const llm = vi.fn();
    const r = await categorize({ payeeName: "Grab Taxi" }, { lookupRule: () => "cat-1", llm });
    expect(r).toEqual({ category: "cat-1", source: "rule", learnFromLlm: false });
    expect(llm).not.toHaveBeenCalled();
  });

  it("lets a memo override the payee's usual category", async () => {
    const r = await categorize({ payeeName: "นาย ก", memo: "ค่าหอ" }, { lookupRule: () => "cat-food" });
    expect(r.category).toBe("housing");
  });

  it("asks the LLM only when rules and keywords miss, and marks the answer to learn", async () => {
    const llm = vi.fn().mockResolvedValue("food");
    const r = await categorize({ payeeName: "บจก. ไม่รู้จัก" }, { lookupRule: () => null, llm });
    expect(llm).toHaveBeenCalledOnce();
    expect(r).toEqual({ category: "food", source: "llm", learnFromLlm: true });
  });

  it("falls back to none without an LLM", async () => {
    const r = await categorize({ payeeName: "นาย ข" }, { lookupRule: () => null });
    expect(r.source).toBe("none");
  });
});

describe("findDuplicate", () => {
  const existing: ExistingExpense[] = [
    {
      id: "e1",
      imageSha256: "aaa",
      imageDhash: "ffff0000ffff0000",
      reference: "2026101747884130",
      qrPayload: "QR1",
      amount: 150,
      occurredAt: new Date("2026-11-01T12:00:00+07:00"),
      payeeKey: "ร้านป้าแดง",
    },
  ];
  const base = {
    sha256: "bbb",
    dhash: "0000ffff0000ffff",
    reference: null,
    qrPayload: null,
    amount: 99,
    occurredAt: "2026-11-02T12:00:00+07:00",
    payeeKey: "x",
  };

  it("spots exact duplicates by image, QR or reference", () => {
    expect(findDuplicate({ ...base, sha256: "aaa" }, existing)).toMatchObject({ kind: "exact", reason: "same-image" });
    expect(findDuplicate({ ...base, qrPayload: "QR1" }, existing)).toMatchObject({ kind: "exact", reason: "same-qr" });
    expect(findDuplicate({ ...base, reference: "2026101747884130" }, existing)).toMatchObject({ kind: "exact" });
  });

  it("flags same amount, minute and payee as a possible duplicate", () => {
    const v = findDuplicate(
      { ...base, amount: 150, occurredAt: "2026-11-01T12:00:30+07:00", payeeKey: "ร้านป้าแดง" },
      existing,
    );
    expect(v).toMatchObject({ kind: "possible", reason: "same-amount-time-payee" });
  });

  it("flags a re-screenshot (close dHash, same amount)", () => {
    const v = findDuplicate({ ...base, amount: 150, dhash: "ffff0000ffff0003" }, existing);
    expect(v).toMatchObject({ kind: "possible", reason: "similar-image" });
  });

  it("lets genuinely different slips through", () => {
    expect(findDuplicate(base, existing)).toEqual({ kind: "none" });
    expect(findDuplicate({ ...base, reference: "1234" }, [{ ...existing[0], reference: "1234" }])).toEqual({ kind: "none" });
  });
});

describe("month helpers", () => {
  it("uses Bangkok months", () => {
    // 2026-10-31 18:00 UTC is already 1 Nov in Bangkok.
    expect(monthKeyOf(new Date("2026-10-31T18:00:00Z"))).toBe("2026-11");
    const { start, end } = monthRange("2026-11");
    expect(start.toISOString()).toBe("2026-10-31T17:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-30T17:00:00.000Z");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(monthLabel("2026-11")).toBe("พฤศจิกายน 2569");
  });
});

describe("budgetStatus", () => {
  it("warns at 80% and when the pace will overshoot", () => {
    expect(budgetStatus(500, 1000, 15, 30).level).toBe("ok");
    expect(budgetStatus(850, 1000, 25, 30).level).toBe("near");
    expect(budgetStatus(600, 1000, 10, 30).level).toBe("near"); // pace → 1800
    expect(budgetStatus(1200, 1000, 20, 30).level).toBe("over");
  });
});

describe("expensesToCsv", () => {
  it("writes a BOM, Bangkok time, and defuses formulas", () => {
    const csv = expensesToCsv([
      {
        occurredAt: new Date("2026-11-04T05:30:00Z"),
        amount: 1500,
        payeeName: '=HYPERLINK("x")',
        payeeBank: "KBANK",
        category: "อาหาร, ของกิน",
        memo: null,
        reference: "123",
        status: "confirmed",
        readSource: "ocr",
      },
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("2026-11-04 12:30,1500.00");
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"อาหาร, ของกิน"');
  });
});
