// Built-in categories every new account starts with. Colours are Chiang Mai's songthaew
// route colours (red city line, orange to Fang, blue to Lamphun, green to Mae Jo…);
// icons are keys into components/category-icon.tsx. Users can rename, recolour,
// add or delete them; the slug stays so keyword rules and the LLM can still refer to them.

export const CATEGORY_SLUGS = [
  "food",
  "transport",
  "shopping",
  "housing",
  "bills",
  "education",
  "health",
  "entertainment",
  "people",
  "other",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  icon: string;
  color: string;
  /** For the LLM prompt. */
  hint: string;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { slug: "food", name: "อาหารและเครื่องดื่ม", icon: "food", color: "#e3730b", hint: "meals, drinks, coffee, groceries for eating, food delivery" },
  { slug: "transport", name: "เดินทาง", icon: "transport", color: "#b3121c", hint: "ride hailing, taxi, BTS/MRT, bus, fuel, parking, flights" },
  { slug: "shopping", name: "ช้อปปิ้ง", icon: "shopping", color: "#1f5fbf", hint: "online shopping, convenience stores, clothes, stationery, gadgets" },
  { slug: "housing", name: "ค่าหอ/ที่พัก", icon: "housing", color: "#1f8a4c", hint: "dorm or apartment rent, hotel" },
  { slug: "bills", name: "บิลและค่าบริการ", icon: "bills", color: "#c79a00", hint: "electricity, water, phone, internet, subscriptions to utilities" },
  { slug: "education", name: "การเรียน", icon: "education", color: "#6b3fa0", hint: "tuition, books, courses, university fees, printing" },
  { slug: "health", name: "สุขภาพ", icon: "health", color: "#138a8a", hint: "hospital, clinic, pharmacy, gym, haircut and personal care" },
  { slug: "entertainment", name: "บันเทิง", icon: "entertainment", color: "#d23c7a", hint: "movies, games, streaming, concerts, hobbies" },
  { slug: "people", name: "โอนให้คน", icon: "people", color: "#8f969e", hint: "transfers to friends or family that are not a purchase" },
  { slug: "other", name: "อื่น ๆ", icon: "other", color: "#7a5230", hint: "anything else" },
];
