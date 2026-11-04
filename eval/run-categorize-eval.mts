// How often does the hybrid categoriser need the LLM, and how often is it right?
//   npm run eval:categorize                 # no key: counts the LLM calls that *would* happen
//   GEMINI_API_KEY=… npm run eval:categorize   # real Gemini calls for the misses
//
// Replays a fictional 90-day stream of slips for a student in Chiang Mai, in order.
// When the result is wrong (or empty), the simulated user fixes it once, which saves a
// payee rule, exactly like editing a category in the app. Payee names randomly lose Thai
// vowel/tone marks the way OCR drops them, to test that learned rules still match.

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { categorize, payeeKey } from "../src/lib/core/categorize.ts";
import type { CategorySlug } from "../src/lib/core/categories.ts";
import { rng } from "../scripts/synthetic-slips.mts";

type Payee = { name: string; truth: CategorySlug; perWeek: number; memos?: [string, CategorySlug][] };

const PAYEES: Payee[] = [
  { name: "ร้านข้าวมันไก่ป้าแดง", truth: "food", perWeek: 3 },
  { name: "ก๋วยเตี๋ยวเรือลุงชัย", truth: "food", perWeek: 2 },
  { name: "ร้านกาแฟดอยช้างมูบ", truth: "food", perWeek: 3 },
  { name: "ร้านอาหารตามสั่งครัวคุณยาย", truth: "food", perWeek: 2 },
  { name: "ส้มตำเจ๊หน่อย", truth: "food", perWeek: 1 },
  { name: "ชานมไข่มุกหน้ามอ", truth: "food", perWeek: 1.5 },
  { name: "นาง มณีรัตน์ ทองดี", truth: "food", perWeek: 2 }, // street stall on a personal account
  { name: "นาย อนุชา คำแสน", truth: "food", perWeek: 1 }, // another stall
  { name: "บจก. แกร็บแท็กซี่ (ประเทศไทย)", truth: "transport", perWeek: 1 },
  { name: "GRAB*FOOD", truth: "food", perWeek: 1 },
  { name: "LINE MAN", truth: "food", perWeek: 0.7 },
  { name: "รถแดงนิมมาน", truth: "transport", perWeek: 1 },
  { name: "ปตท. สาขาห้วยแก้ว", truth: "transport", perWeek: 0.5 },
  { name: "SHOPEE", truth: "shopping", perWeek: 0.7 },
  { name: "LAZADA", truth: "shopping", perWeek: 0.3 },
  { name: "บจก. ซีพี ออลล์", truth: "shopping", perWeek: 2 },
  { name: "ร้านเครื่องเขียนหน้ามอ", truth: "shopping", perWeek: 0.5 },
  { name: "หอพักบ้านสวนนิมมาน", truth: "housing", perWeek: 0.25 },
  { name: "การไฟฟ้าส่วนภูมิภาค", truth: "bills", perWeek: 0.25 },
  { name: "AIS", truth: "bills", perWeek: 0.25 },
  { name: "NETFLIX", truth: "entertainment", perWeek: 0.25 },
  { name: "เมเจอร์ ซีนีเพล็กซ์", truth: "entertainment", perWeek: 0.3 },
  { name: "ร้านหนังสือเชียงใหม่บุ๊ค", truth: "education", perWeek: 0.3 },
  { name: "ร้านถ่ายเอกสารคณะ", truth: "education", perWeek: 0.5 },
  { name: "ร้านยาเภสัชหน้ามอ", truth: "health", perWeek: 0.2 },
  { name: "ร้านตัดผมสไตล์ช่างเอ", truth: "health", perWeek: 0.25 },
  { name: "ฟิตเนสเฟิร์ส นิมมาน", truth: "health", perWeek: 0.1 },
  { name: "บจก. สตรีมมิ่ง ไทย", truth: "entertainment", perWeek: 0.25 },
  { name: "ร้านลุงหนวด", truth: "food", perWeek: 1 },
  {
    name: "นาย ณัฐพล วงศ์คำ",
    truth: "people",
    perWeek: 0.7,
    memos: [
      ["คืนเงินค่าตั๋ว", "people"],
      ["ค่าหมูกระทะ", "food"],
    ],
  },
  {
    name: "นางสาว จิราพร บุญมา",
    truth: "people",
    perWeek: 0.5,
    memos: [["ค่าข้าว", "food"]],
  },
];

const MARKS = /[ัิ-ฺ็-๎]/g;
const r = rng(7);
/** OCR sometimes drops one or two marks. */
function ocrNoise(name: string) {
  if (r() > 0.3) return name;
  const marks = [...name.matchAll(MARKS)];
  if (!marks.length) return name;
  const drop = marks[Math.floor(r() * marks.length)].index!;
  return name.slice(0, drop) + name.slice(drop + 1);
}

type Txn = { payeeName: string; memo: string | null; truth: CategorySlug };
const stream: Txn[] = [];
for (let day = 0; day < 90; day++) {
  for (const p of PAYEES) {
    if (r() > p.perWeek / 7) continue;
    const memo = p.memos && r() < 0.5 ? p.memos[Math.floor(r() * p.memos.length)] : null;
    stream.push({ payeeName: ocrNoise(p.name), memo: memo?.[0] ?? null, truth: memo?.[1] ?? p.truth });
  }
}

const useGemini = !!process.env.GEMINI_API_KEY;
const argModel = process.argv.includes("--model") ? process.argv[process.argv.indexOf("--model") + 1] : undefined;
let llmErrors = 0;
let gemini: ((i: { payeeName: string; memo?: string | null }) => Promise<CategorySlug | null>) | null = null;
if (useGemini) {
  // Same prompt as the app. Like the app, a failed call counts as "no answer".
  const { categorizeWithGemini } = await import("../src/lib/llm/categorize-llm.ts");
  gemini = async (i) => {
    try {
      return (await categorizeWithGemini(i, argModel)).slug;
    } catch {
      llmErrors++;
      return null;
    }
  };
}

const rules = new Map<string, CategorySlug>();
const counts = { rule: 0, keyword: 0, llm: 0, none: 0 };
const correct = { rule: 0, keyword: 0, llm: 0, none: 0 };
let llmCalls = 0;
let corrections = 0;
const firstWeek = { n: 0, llm: 0 };
const lastMonth = { n: 0, llm: 0 };

for (const [i, t] of stream.entries()) {
  let calledLlm = false;
  const res = await categorize<CategorySlug>(
    { payeeName: t.payeeName, memo: t.memo },
    {
      lookupRule: (k) => rules.get(k) ?? null,
      llm: async (input) => {
        calledLlm = true;
        llmCalls++;
        return gemini ? gemini(input) : null;
      },
    },
  );
  counts[res.source]++;
  const ok = res.category === t.truth;
  if (ok) correct[res.source]++;
  const key = payeeKey(t.payeeName);
  if (res.learnFromLlm && res.category) rules.set(key, res.category as CategorySlug);
  if (!ok) {
    corrections++;
    // A memo-driven exception doesn't redefine the payee; only fix the payee's default.
    if (!t.memo) rules.set(key, t.truth);
  }
  if (i < stream.length * (7 / 90)) {
    firstWeek.n++;
    if (calledLlm) firstWeek.llm++;
  }
  if (i >= stream.length * (60 / 90)) {
    lastMonth.n++;
    if (calledLlm) lastMonth.llm++;
  }
}

const n = stream.length;
const pct = (a: number, b: number) => (b ? `${((100 * a) / b).toFixed(1)}%` : "–");
const summary = {
  slips: n,
  llmMode: useGemini ? `gemini ${argModel ?? process.env.GEMINI_MODEL ?? "default"}` : "none (counts would-be calls)",
  llmErrors,
  bySource: counts,
  accuracyBySource: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v ? correct[k as keyof typeof correct] / v : null])),
  llmCalls,
  llmCallsAvoided: 1 - llmCalls / n,
  firstWeekLlmShare: firstWeek.llm / Math.max(firstWeek.n, 1),
  lastMonthLlmShare: lastMonth.llm / Math.max(lastMonth.n, 1),
  userCorrections: corrections,
  learnedRules: rules.size,
};
const table = [
  `| | value |`,
  `|---|---|`,
  `| slips replayed (90 days) | ${n} |`,
  `| categorised by learned rule | ${pct(counts.rule, n)} (accuracy ${pct(correct.rule, counts.rule)}) |`,
  `| categorised by keyword | ${pct(counts.keyword, n)} (accuracy ${pct(correct.keyword, counts.keyword)}) |`,
  `| reached the LLM | ${pct(llmCalls, n)} (${llmCalls} calls) |`,
  `| LLM calls avoided | ${pct(n - llmCalls, n)} |`,
  `| LLM share, first week → last month | ${pct(firstWeek.llm, firstWeek.n)} → ${pct(lastMonth.llm, lastMonth.n)} |`,
  `| user corrections needed | ${corrections} (${pct(corrections, n)}) |`,
].join("\n");
console.log(table);

const outDir = fileURLToPath(new URL("./results/", import.meta.url));
await mkdir(outDir, { recursive: true });
const tag = useGemini ? "gemini" : "nollm";
await writeFile(`${outDir}categorize-${tag}.json`, JSON.stringify(summary, null, 2) + "\n");
await writeFile(`${outDir}categorize-${tag}.md`, `LLM: ${summary.llmMode}\n\n${table}\n`);
