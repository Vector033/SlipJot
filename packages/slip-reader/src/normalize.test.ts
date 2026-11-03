import { describe, expect, it } from "vitest";
import { detectBank } from "./banks.ts";
import { accountLast4, monthFromName, normalizeThaiName, parseAmount, parseThaiDateTime, resolveYear } from "./normalize.ts";

const now = new Date("2026-11-04T12:00:00+07:00");

describe("resolveYear", () => {
  it("converts Buddhist-era years", () => {
    expect(resolveYear(2569, now)).toBe(2026);
    expect(resolveYear(69, now)).toBe(2026); // BE 2569
    expect(resolveYear(26, now)).toBe(2026); // CE on English slips
    expect(resolveYear(2026, now)).toBe(2026);
    expect(resolveYear(10, now)).toBeNull();
  });
});

describe("parseThaiDateTime", () => {
  it.each([
    ["4 พ.ย. 69 12:34 น.", "2026-11-04T12:34:00+07:00"],
    ["04 พ.ย. 2569 - 09:05", "2026-11-04T09:05:00+07:00"],
    ["วันที่ทำรายการ 28 ต.ค. 2569 - 17:39", "2026-10-28T17:39:00+07:00"],
    ["Date 16 Sep 26, 01:52", "2026-09-16T01:52:00+07:00"],
    ["15/09/2569 15:37:00", "2026-09-15T15:37:00+07:00"],
    ["2026-11-01 08:00", "2026-11-01T08:00:00+07:00"],
    ["1 ธันวาคม 2568 23:59", "2025-12-01T23:59:00+07:00"],
  ])("%s", (text, iso) => {
    expect(parseThaiDateTime(text, now)).toBe(iso);
  });

  it("repairs common OCR misreads of the month", () => {
    expect(parseThaiDateTime("18 n.y. 69 17:14 น.", now)).toBe("2026-09-18T17:14:00+07:00");
    expect(parseThaiDateTime("21 กุย. 2569 - 03:35", now)).toBe("2026-09-21T03:35:00+07:00");
    expect(parseThaiDateTime("12 ค.ย. 2569 - 03:55", now)).toBe("2026-09-12T03:55:00+07:00");
    expect(parseThaiDateTime("18 กย. 69 ไ1756น.", now)).toBe("2026-09-18T17:56:00+07:00");
  });

  it("keeps real ค months", () => {
    expect(monthFromName("ม.ค.")).toBe(1);
    expect(monthFromName("ต.ค.")).toBe(10);
    expect(monthFromName("ธ.ค.")).toBe(12);
  });

  it("rejects impossible dates", () => {
    expect(parseThaiDateTime("31 ก.พ. 2569 10:00", now)).toBeNull();
    expect(parseThaiDateTime("no date here", now)).toBeNull();
  });
});

describe("parseAmount", () => {
  it.each([
    ["1,234.50 บาท", 1234.5],
    ["จำนวน: 3,866.00 บาท", 3866],
    ["143.00", 143],
    ["1,500,000.00", 1500000],
  ])("%s", (text, value) => {
    expect(parseAmount(text)).toBe(value);
  });

  it("needs two decimals", () => {
    expect(parseAmount("ref 20260921")).toBeNull();
  });
});

describe("accountLast4", () => {
  it("keeps only the last 4 visible digits", () => {
    expect(accountLast4("xxx-x-x1234-x")).toBe("1234");
    expect(accountLast4("XXX-XXX194-3")).toBe("1943");
    expect(accountLast4("xxx-xxx-5678")).toBe("5678");
    expect(accountLast4("123-4-56789-0")).toBe("7890");
    expect(accountLast4("xxx-x-x12-x")).toBeNull();
  });
});

describe("normalizeThaiName", () => {
  it.each([
    ["นาย สมชาย ใจดี", "สมชาย ใจดี"],
    ["น.ส. วิภาวดี ศรีสุข", "วิภาวดี ศรีสุข"],
    ["นางสาว  กนกวรรณ   ใ.", "กนกวรรณ"],
    ["MR. SOMCHAI J", "somchai"],
    ["Ms. Wipawadee Srisuk", "wipawadee srisuk"],
    ["คุณ สมชาย ใจ", "สมชาย"],
    ["ร้านข้าวมันไก่ป้าแดง", "ร้านข้าวมันไก่ป้าแดง"],
    ["นาย สมชาย xxx", "สมชาย"],
  ])("%s → %s", (raw, want) => {
    expect(normalizeThaiName(raw)).toBe(want);
  });
});

describe("detectBank", () => {
  it.each([
    ["ธ.กสิกรไทย", "KBANK"],
    ["ธ.ไทยพาณิชย์", "SCB"],
    ["Bangkok Bank XXX-X-X681-5", "BBL"],
    ["ธ.กรุงไทย XXX-X-X6824-X", "KTB"],
    ["ธ.กรุงศรีอยุธยา", "BAY"],
    ["ธ.ทหารไทยธนชาต", "TTB"],
    ["ธ.ออมสิน", "GSB"],
    ["ธ.คสิกรไทย", "KBANK"], // OCR ก→ค
    ["ธ.ทหารไทยธนซาต", "TTB"], // OCR ช→ซ
  ])("%s", (text, code) => {
    expect(detectBank(text)).toBe(code);
  });

  it("does not match codes inside words", () => {
    expect(detectBank("scbx")).toBeNull();
    expect(detectBank("นาย สมชาย ใจดี")).toBeNull();
  });
});
