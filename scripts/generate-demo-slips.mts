// Renders the extra fictional slips the landing's route board flips through.
// Run: node scripts/generate-demo-slips.mts  (needs `npx playwright install chromium` once)
// Output: public/demo/slip-<id>.jpg. Every name, account and reference is made up.
// slip-sample.jpg (kbank-03 from generate-synthetic-slips.mts) stays the first stop.
// Afterwards embed each file's origin: impeccable embed-prompt <file> --prompt "origin: …".

import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import QRCode from "qrcode";
import { slipHtml, type SyntheticSlip } from "./synthetic-slips.mts";

const SLIPS: SyntheticSlip[] = [
  {
    id: "transport",
    layout: "SCB",
    amount: 30,
    fee: 0,
    dateTime: "2026-10-06T08:42:00+07:00",
    sender: { name: "นางสาว พิมพ์ชนก ทองดี", bank: "SCB", last4: "4821", masked: "xxx-xxx482-1" },
    receiver: { name: "นาย ศุภชัย คำแสน", bank: "KTB", last4: "7305", masked: "XXX-X-X7305-X" },
    reference: "2026100618427305",
    memo: "ค่ารถแดง",
    qrPayload: "004000060000010103014021620261006184273055102TH91041234",
  },
  {
    id: "shopping",
    layout: "KTB",
    amount: 145,
    fee: 0,
    dateTime: "2026-10-07T12:18:00+07:00",
    sender: { name: "นางสาว พิมพ์ชนก ทองดี", bank: "KTB", last4: "9036", masked: "XXX-X-X9036-X" },
    receiver: { name: "ร้านเครื่องเขียนหน้ามอ", bank: "KBANK", last4: "5512", masked: "xxx-xxx-5512" },
    reference: "1218K4402917",
    memo: null,
    qrPayload: "00380006000001010300602121218K44029175102TH91045678",
  },
  {
    id: "housing",
    layout: "BAY",
    amount: 3500,
    fee: 0,
    dateTime: "2026-10-01T19:05:32+07:00",
    sender: { name: "นางสาว พิมพ์ชนก ทองดี", bank: "BAY", last4: "1174", masked: "XXX-X-X1174-X" },
    receiver: { name: "หอพักบ้านสวนนิมมาน", bank: "SCB", last4: "6640", masked: "xxx-xxx-6640" },
    reference: "BAY300716254408",
    memo: "ค่าหอเดือนนี้",
    qrPayload: "0043000600000101030250215BAY3007162544085102TH91049012",
  },
];

const outDir = fileURLToPath(new URL("../public/demo/", import.meta.url));
const browser = await chromium.launch();
for (const slip of SLIPS) {
  const page = await browser.newPage({ deviceScaleFactor: 2.5, viewport: { width: 420, height: 900 } });
  const qr = await QRCode.toDataURL(slip.qrPayload, { margin: 1, width: 180 });
  await page.setContent(slipHtml(slip, qr), { waitUntil: "load" });
  await page.locator(".slip").screenshot({ path: `${outDir}slip-${slip.id}.jpg`, type: "jpeg", quality: 85 });
  await page.close();
  console.log(`wrote public/demo/slip-${slip.id}.jpg`);
}
await browser.close();
