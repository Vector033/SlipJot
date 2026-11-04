// Hybrid categoriser: cheap rules first, the LLM only when they all miss.
//   1. learned payee rule (the user corrected this payee before, or the LLM already answered)
//   2. memo keywords ("ค่าข้าว" says food even when paid to a person)
//   3. payee-name keywords (Grab, หอพัก, การไฟฟ้า…)
//   4. LLM, whose answer is then saved as a payee rule so the payee never costs a call again
// Pure: the rule lookup and the LLM are passed in.

import { normalizeThaiName } from "@slipjot/slip-reader";
import type { CategorySlug } from "./categories";

export type CategorizeSource = "rule" | "keyword" | "llm" | "none";

export interface CategorizeInput {
  payeeName: string;
  memo?: string | null;
  amount?: number;
}

export interface CategorizeResult<C> {
  /** A user category id (rule) or a built-in slug (keyword/llm), or null. */
  category: C | CategorySlug | null;
  source: CategorizeSource;
  /** True when the answer came from a model call; the caller should store it as a rule. */
  learnFromLlm: boolean;
}

export type LlmCategorizer = (input: CategorizeInput) => Promise<CategorySlug | null>;

/**
 * Rule key for a payee: the consonant skeleton of their normalised name, or the account
 * tail if there's no name. OCR often drops Thai vowel and tone marks ("ภานุวัฒน์" →
 * "ภานวัฒน์"), so marks are left out of the key: the same shop keeps one key across slips.
 */
export function payeeKey(name: string | null | undefined, last4?: string | null): string {
  const n = name
    ? normalizeThaiName(name)
        .replace(/\s+/g, "")
        .replace(/[ัิ-ฺ็-๎]/g, "")
    : "";
  return n || (last4 ? `#${last4}` : "");
}

// Lower-case substrings. Checked in order, so specific ones (grabfood) come before general (grab).
const PAYEE_KEYWORDS: [CategorySlug, string[]][] = [
  ["food", ["grabfood", "grab food", "lineman", "line man", "foodpanda", "robinhood", "shopeefood"]],
  ["transport", ["grab", "bolt", "bts", "mrt", "การรถไฟ", "รถไฟ", "ขนส่ง", "ปตท", "ptt", "บางจาก", "bangchak", "shell", "caltex", "เชลล์", "airasia", "air asia", "nok air", "นกแอร์", "thai lion", "แท็กซี่", "taxi", "ที่จอดรถ", "parking", "easy pass", "m-flow"]],
  ["food", ["ข้าว", "ก๋วยเตี๋ยว", "ก๋วยเตี๋ยว", "อาหาร", "ครัว", "กาแฟ", "coffee", "cafe", "คาเฟ่", "ชานม", "ส้มตำ", "หมูกระทะ", "ชาบู", "สุกี้", "บุฟเฟ่", "เบเกอรี่", "bakery", "ขนม", "ไก่ทอด", "ผัดไทย", "ตามสั่ง", "โจ๊ก", "kfc", "mcdonald", "แมคโดนัลด์", "mk restaurant", "swensen", "starbucks", "amazon cafe", "café amazon", "pizza", "พิซซ่า", "bar b q", "ร้านน้ำ", "เครื่องดื่ม", "ผลไม้"]],
  ["housing", ["หอพัก", "อพาร์ท", "apartment", "แมนชั่น", "mansion", "residence", "เรสซิเดนซ์", "คอนโด", "condo", "ค่าเช่า", "บ้านเช่า", "dormitory", "dorm", "hotel", "โรงแรม", "agoda", "booking.com", "airbnb"]],
  ["bills", ["การไฟฟ้า", "การประปา", "pea", "mea", "ais", "true move", "truemove", "dtac", "3bb", "true online", "nt broadband", "ทีโอที", "internet", "อินเทอร์เน็ต", "ค่าโทรศัพท์", "ค่าเน็ต"]],
  ["entertainment", ["netflix", "spotify", "youtube", "disney", "steam", "playstation", "nintendo", "garena", "major cineplex", "เมเจอร์", "sf cinema", "เอส เอฟ", "โรงภาพยนตร์", "คอนเสิร์ต", "ticket", "บัตรคอนเสิร์ต", "เกม"]],
  ["education", ["มหาวิทยาลัย", "university", "คณะ", "ค่าเทอม", "ค่าธรรมเนียมการศึกษา", "tuition", "ร้านหนังสือ", "หนังสือ", "book", "se-ed", "ซีเอ็ด", "นายอินทร์", "udemy", "coursera", "ปริ้น", "ถ่ายเอกสาร", "print"]],
  ["health", ["โรงพยาบาล", "hospital", "คลินิก", "clinic", "ร้านยา", "เภสัช", "pharmacy", "boots", "watsons", "ฟิตเนส", "fitness", "gym", "ทันตกรรม", "dental", "ตัดผม", "ร้านเสริมสวย", "salon", "barber"]],
  ["shopping", ["shopee", "lazada", "7-eleven", "7-11", "เซเว่น", "ซีพี ออลล์", "cp all", "lotus", "โลตัส", "big c", "บิ๊กซี", "makro", "แม็คโคร", "tops", "ท็อปส์", "central", "เซ็นทรัล", "uniqlo", "ikea", "power buy", "advice", "jib", "banana it", "เครื่องเขียน", "สหกรณ์", "ร้านค้า", "family mart", "แฟมิลี่มาร์ท", "lawson", "ลอว์สัน", "mini big c", "watson"]],
];

// Order matters: "คืนเงินค่าตั๋ว" is paying a friend back, not a ticket; "ค่าหนังสือ" is a book, not a movie.
const MEMO_KEYWORDS: [CategorySlug, string[]][] = [
  ["people", ["คืนเงิน", "ยืม", "ให้แม่", "ให้พ่อ", "ค่าขนมน้อง"]],
  ["housing", ["ค่าหอ", "ค่าเช่า", "ค่าห้อง"]],
  ["bills", ["ค่าไฟ", "ค่าน้ำประปา", "ค่าน้ำค่าไฟ", "ค่าเน็ต", "ค่าโทร"]],
  ["food", ["ค่าข้าว", "ค่าอาหาร", "ค่ากาแฟ", "ค่าขนม", "หมูกระทะ", "ชาบู", "กินข้าว", "ข้าว"]],
  ["transport", ["ค่ารถ", "ค่าแท็กซี่", "ค่าน้ำมัน", "ค่าตั๋ว", "ค่าเดินทาง", "ค่าวิน"]],
  ["education", ["ค่าเทอม", "ค่าหนังสือ", "ค่าชีท", "ค่าเรียน", "ค่าปริ้น"]],
  ["health", ["ค่ายา", "ค่าหมอ", "ค่าตัดผม"]],
  ["entertainment", ["ค่าหนัง", "ค่าเกม", "ค่าคอนเสิร์ต"]],
  ["shopping", ["ค่าของ", "ค่าเสื้อ"]],
];

const wordRes = new Map<string, RegExp>();

/** Latin keywords must stand alone ("ais" must not match "raise"); Thai has no spaces, so substrings. */
function hasKeyword(text: string, word: string) {
  if (!/^[a-z0-9 .\-*'&]+$/.test(word)) return text.includes(word);
  let re = wordRes.get(word);
  if (!re) {
    re = new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}([^a-z0-9]|$)`);
    wordRes.set(word, re);
  }
  return re.test(text);
}

function matchKeywords(text: string, table: [CategorySlug, string[]][]): CategorySlug | null {
  const t = text.toLowerCase().replace(/[*_]/g, " ");
  for (const [slug, words] of table) if (words.some((w) => hasKeyword(t, w))) return slug;
  return null;
}

export function keywordCategory(input: CategorizeInput): { slug: CategorySlug; from: "memo" | "payee" } | null {
  const memo = input.memo ? matchKeywords(input.memo, MEMO_KEYWORDS) : null;
  if (memo) return { slug: memo, from: "memo" };
  const payee = matchKeywords(input.payeeName, PAYEE_KEYWORDS);
  return payee ? { slug: payee, from: "payee" } : null;
}

export async function categorize<C>(
  input: CategorizeInput,
  deps: { lookupRule: (key: string) => C | null | Promise<C | null>; llm?: LlmCategorizer | null },
): Promise<CategorizeResult<C>> {
  const key = payeeKey(input.payeeName);
  const learned = key ? await deps.lookupRule(key) : null;
  // A memo states intent for this one payment, so it beats what the payee usually is.
  const kw = keywordCategory(input);
  if (kw?.from === "memo") return { category: kw.slug, source: "keyword", learnFromLlm: false };
  if (learned) return { category: learned, source: "rule", learnFromLlm: false };
  if (kw) return { category: kw.slug, source: "keyword", learnFromLlm: false };
  if (deps.llm && input.payeeName.trim()) {
    const slug = await deps.llm(input);
    if (slug) return { category: slug, source: "llm", learnFromLlm: true };
  }
  return { category: null, source: "none", learnFromLlm: false };
}
