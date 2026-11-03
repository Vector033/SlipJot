// Fictional Thai transfer slips for tests and the accuracy eval. Every name, account
// and reference is made up. The layouts copy the *structure* conventions of each bank's
// slips (field order, date format, labels) with plain styling: no real logos or brand art.

export type LayoutCode = "KBANK" | "SCB" | "BBL" | "KTB" | "BAY";

export interface SlipParty {
  name: string;
  bank: string;
  last4: string;
  masked: string;
}

export interface SyntheticSlip {
  id: string;
  layout: LayoutCode;
  amount: number;
  fee: number;
  /** ISO, +07:00 */
  dateTime: string;
  sender: SlipParty;
  receiver: SlipParty;
  reference: string;
  memo: string | null;
  qrPayload: string;
}

// Small seeded PRNG so `npm run slips:generate` is reproducible.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["สมชาย", "วิภาวดี", "ณัฐพล", "กนกวรรณ", "ธนากร", "พิมพ์ชนก", "ศุภชัย", "อรอุมา", "ปิยะพงษ์", "จิราพร", "ภานุวัฒน์", "สุดารัตน์", "อนุชา", "มณีรัตน์", "เกียรติศักดิ์", "ชลธิชา"];
const LAST = ["ใจดี", "ศรีสุข", "วงศ์คำ", "แก้วมณี", "บุญมา", "ทองดี", "สายสุวรรณ", "อินทร์แก้ว", "พรหมมา", "จันทร์เพ็ญ", "ปัญญาดี", "คำแสน"];
const TITLES = ["นาย", "นางสาว", "นาง", "น.ส."];
const EN_FIRST = ["SOMCHAI", "WIPAWADEE", "NATTHAPHON", "KANOKWAN", "THANAKORN", "PIMCHANOK", "SUPACHAI", "ORNUMA"];
const EN_LAST = ["JAIDEE", "SRISUK", "WONGKHAM", "KAEWMANEE", "BOONMA", "THONGDEE"];
const SHOPS = [
  "ร้านข้าวมันไก่ป้าแดง",
  "ก๋วยเตี๋ยวเรือลุงชัย",
  "หอพักบ้านสวนนิมมาน",
  "ร้านกาแฟดอยช้างมูบ",
  "ร้านเครื่องเขียนหน้ามอ",
  "สหกรณ์ร้านค้านักศึกษา",
  "ร้านตัดผมสไตล์ช่างเอ",
  "ร้านอาหารตามสั่งครัวคุณยาย",
];
const MEMOS = ["ค่าข้าว", "ค่าหอเดือนนี้", "คืนเงินค่าตั๋ว", "ค่ากาแฟ", "ค่าหนังสือ", null, null, null];

const BANK_LABEL_TH: Record<string, string> = {
  KBANK: "ธ.กสิกรไทย",
  SCB: "ธ.ไทยพาณิชย์",
  BBL: "ธ.กรุงเทพ",
  KTB: "ธ.กรุงไทย",
  BAY: "ธ.กรุงศรีอยุธยา",
  TTB: "ธ.ทหารไทยธนชาต",
  GSB: "ธ.ออมสิน",
};
const BANK_LABEL_EN: Record<string, string> = {
  KBANK: "KASIKORNBANK",
  SCB: "SCB",
  BBL: "Bangkok Bank",
  KTB: "Krungthai",
  BAY: "Krungsri",
  TTB: "ttb",
  GSB: "GSB",
};
const OTHER_BANKS = Object.keys(BANK_LABEL_TH);

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pick<T>(r: () => number, xs: T[]): T {
  return xs[Math.floor(r() * xs.length)];
}
function digits(r: () => number, n: number) {
  return Array.from({ length: n }, () => Math.floor(r() * 10)).join("");
}
const p2 = (n: number) => String(n).padStart(2, "0");

function personTh(r: () => number) {
  return `${pick(r, TITLES)} ${pick(r, FIRST)} ${pick(r, LAST)}`;
}

const BANK_NUMBER: Record<LayoutCode, string> = { BBL: "002", KBANK: "004", KTB: "006", SCB: "014", BAY: "025" };

/** Same TLV shape as real slip QR codes, with a made-up reference and checksum. */
function qrFor(layout: LayoutCode, reference: string, crc: string) {
  const inner = `0006000001` + `0103${BANK_NUMBER[layout]}` + `02${p2(reference.length)}${reference}`;
  return `00${p2(inner.length)}${inner}5102TH9104${crc}`;
}

function maskFor(layout: LayoutCode, last4: string, r: () => number) {
  switch (layout) {
    case "KBANK":
      return `xxx-x-x${last4}-x`;
    case "SCB":
      return `xxx-xxx${last4.slice(0, 3)}-${last4[3]}`;
    case "BBL":
      return `XXX-X-X${last4.slice(0, 3)}-${last4[3]}`;
    case "KTB":
      return `XXX-X-X${last4}-X`;
    case "BAY":
      return r() < 0.5 ? `XXX-X-X${last4}-X` : `xxx-xxx-${last4}`;
  }
}

export function makeSlip(layout: LayoutCode, i: number, r: () => number): SyntheticSlip {
  const toShop = r() < 0.4;
  const englishNames = layout === "BBL";
  const senderName = englishNames
    ? `${pick(r, ["MR.", "MS."])} ${pick(r, EN_FIRST)} ${pick(r, EN_LAST)}`
    : personTh(r);
  const receiverName = toShop
    ? pick(r, SHOPS)
    : englishNames
      ? `${pick(r, ["MR.", "MS."])} ${pick(r, EN_FIRST)} ${pick(r, EN_LAST)}`
      : personTh(r);
  const sLast = digits(r, 4);
  const rLast = digits(r, 4);
  const rBank = toShop ? pick(r, OTHER_BANKS) : r() < 0.5 ? layout : pick(r, OTHER_BANKS);
  const amountBase = toShop ? 35 + Math.floor(r() * 400) : 50 + Math.floor(r() * 6000);
  const amount = r() < 0.6 ? amountBase : amountBase + Math.floor(r() * 100) / 100;
  // Spread over the last ~60 days before 2026-11-04.
  const t = Date.UTC(2026, 10, 4, 5) - Math.floor(r() * 60 * 24 * 60) * 60_000;
  const d = new Date(t + 7 * 3600_000);
  const dateTime = `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}T${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(layout === "BAY" ? d.getUTCSeconds() : 0)}+07:00`;
  const reference =
    layout === "KBANK"
      ? `0${digits(r, 3)}${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}${digits(r, 4)}BTF${digits(r, 5)}`
      : layout === "SCB"
        ? `${d.getUTCFullYear()}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}${digits(r, 8)}`
        : layout === "BBL"
          ? `${digits(r, 3)}-${digits(r, 3)}-${digits(r, 6)}`
          : layout === "KTB"
            ? `${digits(r, 4)}${String.fromCharCode(65 + Math.floor(r() * 26))}${digits(r, 7)}`
            : `BAY${digits(r, 12)}`;
  const memo = layout === "BBL" ? null : pick(r, MEMOS);
  return {
    id: `${layout.toLowerCase()}-${p2(i + 1)}`,
    layout,
    amount,
    fee: 0,
    dateTime,
    sender: { name: senderName, bank: layout, last4: sLast, masked: maskFor(layout, sLast, r) },
    receiver: {
      name: receiverName,
      bank: rBank,
      last4: rLast,
      masked: toShop ? `xxx-xxx-${rLast}` : maskFor(layout, rLast, r),
    },
    reference,
    memo,
    qrPayload: qrFor(layout, reference, digits(r, 4)),
  };
}

function fmtAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso)!;
  return { y: +m[1], mo: +m[2], d: +m[3], h: m[4], mi: m[5], s: m[6] };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** HTML for one slip at 420 CSS px wide. `qrDataUrl` is the rendered QR. */
export function slipHtml(s: SyntheticSlip, qrDataUrl: string): string {
  const t = parts(s.dateTime);
  const be = t.y + 543;
  const amt = fmtAmount(s.amount);
  const base = `
    <meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0}
    body{width:420px;font-family:"Leelawadee UI",Tahoma,sans-serif;color:#1f2933;background:#fff}
    .slip{padding:22px 24px 26px;background:var(--bg)}
    .muted{color:#6b7280;font-size:13px}
    .row{display:flex;justify-content:space-between;align-items:baseline;margin:6px 0;font-size:15px}
    .big{font-size:26px;font-weight:700}
    .name{font-size:17px;font-weight:600}
    .head{font-size:20px;font-weight:700;margin-bottom:4px}
    .qr{width:92px;height:92px}
    hr{border:0;border-top:1px dashed #cbd5e1;margin:12px 0}
    </style>`;
  const qr = `<img class="qr" src="${qrDataUrl}">`;
  const memoRow = (label: string) => (s.memo ? `<div class="row"><span class="muted">${label}</span><span>${esc(s.memo)}</span></div>` : "");

  switch (s.layout) {
    case "KBANK":
      return `${base}<div class="slip" style="--bg:#f4faf6">
        <div class="head">โอนเงินสำเร็จ</div>
        <div class="muted">${t.d} ${TH_MONTHS[t.mo - 1]} ${String(be).slice(2)} ${t.h}:${t.mi} น.</div>
        <hr>
        <div class="name">${esc(s.sender.name)}</div>
        <div>${BANK_LABEL_TH[s.sender.bank]}</div>
        <div class="muted">${s.sender.masked}</div>
        <div style="margin:8px 0;font-size:18px">↓</div>
        <div class="name">${esc(s.receiver.name)}</div>
        <div>${BANK_LABEL_TH[s.receiver.bank]}</div>
        <div class="muted">${s.receiver.masked}</div>
        <hr>
        <div style="display:flex;justify-content:space-between;gap:12px"><div style="flex:1">
        <div class="row"><span class="muted">เลขที่รายการ:</span></div>
        <div style="font-size:14px">${s.reference}</div>
        <div class="row"><span class="muted">จำนวน:</span><span class="big">${amt} บาท</span></div>
        <div class="row"><span class="muted">ค่าธรรมเนียม:</span><span>0.00 บาท</span></div>
        ${memoRow("บันทึกช่วยจำ:")}
        </div>${qr}</div></div>`;
    case "SCB":
      return `${base}<div class="slip" style="--bg:#f7f5fb">
        <div class="head" style="text-align:center">โอนเงินสำเร็จ</div>
        <div class="muted" style="text-align:center">${p2(t.d)} ${TH_MONTHS[t.mo - 1]} ${be} - ${t.h}:${t.mi}</div>
        <div class="muted" style="text-align:center">รหัสอ้างอิง: ${s.reference}</div>
        <hr>
        <div class="muted">จาก</div>
        <div class="name">${esc(s.sender.name)}</div>
        <div class="muted">${s.sender.masked}</div>
        <div class="muted" style="margin-top:10px">ไปยัง</div>
        <div class="name">${esc(s.receiver.name)}</div>
        <div>${BANK_LABEL_TH[s.receiver.bank]}</div>
        <div class="muted">${s.receiver.masked}</div>
        <hr>
        <div class="row"><span>จำนวนเงิน</span><span class="big">${amt}</span></div>
        ${memoRow("บันทึกช่วยจำ")}
        <div style="display:flex;justify-content:center;margin-top:10px">${qr}</div></div>`;
    case "BBL":
      return `${base}<div class="slip" style="--bg:#f3f6fb;font-family:Arial,sans-serif">
        <div class="head">Transfer successful</div>
        <div class="row"><span class="muted">Date</span><span>${p2(t.d)} ${EN_MONTHS[t.mo - 1]} ${String(t.y).slice(2)}, ${t.h}:${t.mi}</span></div>
        <hr>
        <div class="muted">From</div>
        <div class="name">${esc(s.sender.name)}</div>
        <div>${BANK_LABEL_EN[s.sender.bank]} ${s.sender.masked}</div>
        <div class="muted" style="margin-top:10px">To</div>
        <div class="name">${esc(s.receiver.name)}</div>
        <div>${BANK_LABEL_EN[s.receiver.bank]} ${s.receiver.masked}</div>
        <hr>
        <div class="row"><span>Amount (THB)</span><span class="big">${amt}</span></div>
        <div class="row"><span class="muted">Fee (THB)</span><span>0.00</span></div>
        <div class="row"><span class="muted">Transaction reference no.</span></div>
        <div>${s.reference}</div>
        <div style="margin-top:10px">${qr}</div></div>`;
    case "KTB":
      return `${base}<div class="slip" style="--bg:#f2f8fc">
        <div class="head">ทำรายการสำเร็จ</div>
        <div class="row"><span class="muted">วันที่ทำรายการ</span><span>${p2(t.d)} ${TH_MONTHS[t.mo - 1]} ${be} - ${t.h}:${t.mi}</span></div>
        <div class="row"><span class="muted">รหัสอ้างอิง</span><span>${s.reference}</span></div>
        <hr>
        <div class="muted">ผู้โอน</div>
        <div class="name">${esc(s.sender.name)}</div>
        <div class="muted">${BANK_LABEL_TH[s.sender.bank]} ${s.sender.masked}</div>
        <div class="muted" style="margin-top:10px">ผู้รับเงิน</div>
        <div class="name">${esc(s.receiver.name)}</div>
        <div class="muted">${BANK_LABEL_TH[s.receiver.bank]} ${s.receiver.masked}</div>
        <hr>
        <div class="row"><span>จำนวนเงิน</span><span class="big">${amt} บาท</span></div>
        <div class="row"><span class="muted">ค่าธรรมเนียม</span><span>0.00 บาท</span></div>
        ${memoRow("บันทึกช่วยจำ")}
        <div style="text-align:right;margin-top:8px">${qr}</div></div>`;
    case "BAY":
      return `${base}<div class="slip" style="--bg:#fbf8ef">
        <div class="head">โอนเงินสำเร็จ</div>
        <div class="muted">${p2(t.d)}/${p2(t.mo)}/${be} ${t.h}:${t.mi}:${t.s}</div>
        <hr>
        <div class="muted">บัญชีต้นทาง</div>
        <div class="name">${esc(s.sender.name)}</div>
        <div>${BANK_LABEL_TH[s.sender.bank]} ${s.sender.masked}</div>
        <div class="muted" style="margin-top:10px">บัญชีปลายทาง</div>
        <div class="name">${esc(s.receiver.name)}</div>
        <div>${BANK_LABEL_TH[s.receiver.bank]} ${s.receiver.masked}</div>
        <hr>
        <div class="row"><span>ยอดโอน</span><span class="big">${amt} THB</span></div>
        <div class="row"><span class="muted">หมายเลขอ้างอิง</span><span style="font-size:13px">${s.reference}</span></div>
        ${memoRow("หมายเหตุ")}
        <div style="margin-top:10px">${qr}</div></div>`;
  }
}
