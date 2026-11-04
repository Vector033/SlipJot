export interface CsvExpense {
  occurredAt: Date;
  amount: number;
  payeeName: string;
  payeeBank: string | null;
  category: string | null;
  memo: string | null;
  reference: string | null;
  status: string;
  readSource: string;
}

function cell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote anything with separators, and defuse spreadsheet formulas (CSV injection).
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function bangkokIso(d: Date) {
  const t = new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");
  return t;
}

/** UTF-8 with BOM so Excel opens Thai text correctly. */
export function expensesToCsv(rows: CsvExpense[]): string {
  const header = ["วันเวลา (เวลาไทย)", "ยอด (บาท)", "ผู้รับ", "ธนาคารผู้รับ", "หมวด", "บันทึกช่วยจำ", "เลขอ้างอิง", "สถานะ", "ที่มา"];
  const lines = [header.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [bangkokIso(r.occurredAt), r.amount.toFixed(2), r.payeeName, r.payeeBank, r.category, r.memo, r.reference, r.status, r.readSource]
        .map(cell)
        .join(","),
    );
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}
