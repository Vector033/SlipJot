// Creates a demo account with ~3 months of FICTIONAL expenses on the LOCAL Supabase stack,
// for screenshots and manual testing. Run: npm run seed:demo  (re-running resets the account)
// Shops and people below are made up; never seed real financial data.

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { DEFAULT_CATEGORIES } from "../src/lib/core/categories.ts";
import { rng } from "./synthetic-slips.mts";

export const DEMO_EMAIL = "demo@slipjot.test";
export const DEMO_PASSWORD = "slipjot-demo-2026";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (!/127\.0\.0\.1|localhost/.test(url)) throw new Error("seed-demo only runs against local Supabase");

const admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

// Delete and recreate the demo user (cascades to all of its rows).
const { data: list } = await admin.auth.admin.listUsers();
const old = list.users.find((u) => u.email === DEMO_EMAIL);
if (old) await admin.auth.admin.deleteUser(old.id);
const { data: created, error } = await admin.auth.admin.createUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true });
if (error) throw error;
const userId = created.user.id;

await sql`insert into settings (user_id) values (${userId})`;
const budgets: Record<string, number> = { food: 4500, transport: 1200, shopping: 1500, entertainment: 400 };
const catIds: Record<string, string> = {};
for (const [i, c] of DEFAULT_CATEGORIES.entries()) {
  const [row] = await sql`
    insert into categories (user_id, slug, name, icon, color, sort, monthly_budget)
    values (${userId}, ${c.slug}, ${c.name}, ${c.icon}, ${c.color}, ${i}, ${budgets[c.slug] ?? null})
    returning id`;
  catIds[c.slug] = row.id;
}

type Payee = { name: string; slug: string; min: number; max: number; perWeek: number; bank: string; source: "keyword" | "rule" | "llm" };
const payees: Payee[] = [
  { name: "ร้านข้าวมันไก่ป้าแดง", slug: "food", min: 45, max: 60, perWeek: 3, bank: "KBANK", source: "keyword" },
  { name: "ก๋วยเตี๋ยวเรือลุงชัย", slug: "food", min: 50, max: 70, perWeek: 2, bank: "SCB", source: "keyword" },
  { name: "ร้านกาแฟดอยช้างมูบ", slug: "food", min: 55, max: 85, perWeek: 3, bank: "KTB", source: "keyword" },
  { name: "ร้านอาหารตามสั่งครัวคุณยาย", slug: "food", min: 50, max: 90, perWeek: 2, bank: "BAY", source: "keyword" },
  { name: "นาง มณีรัตน์ ทองดี", slug: "food", min: 30, max: 50, perWeek: 2, bank: "GSB", source: "rule" }, // street stall, learned
  { name: "GRAB TAXI", slug: "transport", min: 60, max: 180, perWeek: 1.5, bank: "KBANK", source: "keyword" },
  { name: "รถแดงนิมมาน", slug: "transport", min: 30, max: 40, perWeek: 1, bank: "SCB", source: "llm" },
  { name: "SHOPEE", slug: "shopping", min: 120, max: 690, perWeek: 0.7, bank: "SCB", source: "keyword" },
  { name: "ร้านเครื่องเขียนหน้ามอ", slug: "shopping", min: 25, max: 120, perWeek: 0.5, bank: "KTB", source: "keyword" },
  { name: "บจก. สตรีมมิ่ง ไทย", slug: "entertainment", min: 149, max: 149, perWeek: 0.25, bank: "BBL", source: "llm" },
  { name: "ร้านหนังสือเชียงใหม่บุ๊ค", slug: "education", min: 180, max: 450, perWeek: 0.3, bank: "BBL", source: "keyword" },
  { name: "นาย ณัฐพล วงศ์คำ", slug: "people", min: 100, max: 400, perWeek: 0.5, bank: "KBANK", source: "rule" },
];

const r = rng(42);
const rows: Record<string, unknown>[] = [];
const now = Date.UTC(2026, 10, 4, 5); // 2026-11-04 12:00 Bangkok
const start = Date.UTC(2026, 7, 1) - 7 * 3600_000; // 1 Aug Bangkok
for (let day = start; day < now; day += 24 * 3600_000) {
  for (const p of payees) {
    if (r() > p.perWeek / 7) continue;
    const hour = p.slug === "food" ? 8 + Math.floor(r() * 12) : 9 + Math.floor(r() * 13);
    const t = new Date(day + hour * 3600_000 + Math.floor(r() * 60) * 60_000);
    if (t.getTime() > now) continue;
    rows.push(expense(p.name, p.slug, p.min + Math.round(r() * (p.max - p.min)), t, p.bank, p.source));
  }
}
// Monthly bills.
for (const [m, rent, power] of [[7, 3500, 412.5], [8, 3500, 455.75], [9, 3500, 398.25], [10, 3500, 0]] as const) {
  rows.push(expense("หอพักบ้านสวนนิมมาน", "housing", rent, new Date(Date.UTC(2026, m, 1, 3)), "KTB", "keyword", "ค่าหอ"));
  if (power) rows.push(expense("การไฟฟ้าส่วนภูมิภาค", "bills", power, new Date(Date.UTC(2026, m, 6, 4)), "KTB", "keyword"));
}

function expense(name: string, slug: string, amount: number, at: Date, bank: string, source: string, memo: string | null = null) {
  return {
    user_id: userId,
    amount,
    occurred_at: at,
    payee_name: name,
    payee_key: name.replace(/^(นาย|นาง|นางสาว)\s+/, "").replace(/\s+/g, "").replace(/[ัิ-ฺ็-๎]/g, "").toLowerCase(),
    payee_bank: bank,
    payee_last4: String(1000 + Math.floor(r() * 9000)),
    sender_bank: "KBANK",
    sender_last4: "4821",
    memo,
    category_id: catIds[slug],
    category_source: source,
    auto_category_source: source,
    status: "confirmed",
    read_source: "ocr",
    confidence: 0.85 + r() * 0.1,
  };
}

await sql`insert into expenses ${sql(rows)}`;
// Two unsure reads waiting in the review queue.
await sql`insert into expenses ${sql([
  { ...expense("ร้านข้าวมันไก่ป่าแดง", "food", 55, new Date(Date.UTC(2026, 10, 4, 4, 12)), "KBANK", "keyword"), status: "review", confidence: 0.62, issues: JSON.stringify(["ไม่แน่ใจ: ชื่อผู้รับ"]) },
  { ...expense("", "other", 0, new Date(Date.UTC(2026, 10, 3, 11, 40)), "SCB", "none"), category_id: null, category_source: "none", auto_category_source: "none", status: "review", confidence: 0, issues: JSON.stringify(["อ่านยอดเงินไม่ได้", "อ่านชื่อผู้รับไม่ได้"]) },
])}`;

// Learned rules, as if the user had corrected these payees once.
for (const p of payees.filter((p) => p.source !== "keyword")) {
  await sql`insert into payee_rules (user_id, payee_key, category_id, source, hits)
            values (${userId}, ${expense(p.name, p.slug, 0, new Date(), p.bank, "rule").payee_key}, ${catIds[p.slug]}, ${p.source === "llm" ? "llm" : "user"}, 5)`;
}

console.log(`demo account ${DEMO_EMAIL} / ${DEMO_PASSWORD}: ${rows.length + 2} expenses`);
await sql.end();
