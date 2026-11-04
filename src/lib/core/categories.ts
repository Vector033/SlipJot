// Built-in categories every new account starts with. Users can rename, recolour,
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
  { slug: "food", name: "อาหารและเครื่องดื่ม", icon: "🍜", color: "#e8590c", hint: "meals, drinks, coffee, groceries for eating, food delivery" },
  { slug: "transport", name: "เดินทาง", icon: "🛵", color: "#1971c2", hint: "ride hailing, taxi, BTS/MRT, bus, fuel, parking, flights" },
  { slug: "shopping", name: "ช้อปปิ้ง", icon: "🛍️", color: "#c2255c", hint: "online shopping, convenience stores, clothes, stationery, gadgets" },
  { slug: "housing", name: "ค่าหอ/ที่พัก", icon: "🏠", color: "#5f3dc4", hint: "dorm or apartment rent, hotel" },
  { slug: "bills", name: "บิลและค่าบริการ", icon: "💡", color: "#0c8599", hint: "electricity, water, phone, internet, subscriptions to utilities" },
  { slug: "education", name: "การเรียน", icon: "📚", color: "#2f9e44", hint: "tuition, books, courses, university fees, printing" },
  { slug: "health", name: "สุขภาพ", icon: "💊", color: "#e03131", hint: "hospital, clinic, pharmacy, gym, haircut and personal care" },
  { slug: "entertainment", name: "บันเทิง", icon: "🎮", color: "#f08c00", hint: "movies, games, streaming, concerts, hobbies" },
  { slug: "people", name: "โอนให้คน", icon: "👥", color: "#495057", hint: "transfers to friends or family that are not a purchase" },
  { slug: "other", name: "อื่น ๆ", icon: "📦", color: "#868e96", hint: "anything else" },
];
