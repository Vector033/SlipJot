import {
  Baby,
  BookOpen,
  Bus,
  Car,
  CircleHelp,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  HeartPulse,
  House,
  Package,
  PawPrint,
  Plane,
  Shirt,
  ShoppingBag,
  Smartphone,
  Users,
  UtensilsCrossed,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Category icons come from one stroke family. The DB stores an icon key; rows created
// before icons were keys hold an emoji, so unknown values fall back to the slug's icon.
export const CATEGORY_ICONS = {
  food: UtensilsCrossed,
  coffee: Coffee,
  transport: Bus,
  car: Car,
  plane: Plane,
  shopping: ShoppingBag,
  clothes: Shirt,
  housing: House,
  bills: Zap,
  internet: Wifi,
  phone: Smartphone,
  education: BookOpen,
  health: HeartPulse,
  gym: Dumbbell,
  entertainment: Gamepad2,
  gift: Gift,
  people: Users,
  baby: Baby,
  pet: PawPrint,
  other: Package,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

export const ICON_LABELS_TH: Record<CategoryIconKey, string> = {
  food: "อาหาร",
  coffee: "กาแฟ",
  transport: "รถโดยสาร",
  car: "รถ",
  plane: "เครื่องบิน",
  shopping: "ถุงช้อปปิ้ง",
  clothes: "เสื้อผ้า",
  housing: "บ้าน",
  bills: "ไฟฟ้า",
  internet: "อินเทอร์เน็ต",
  phone: "มือถือ",
  education: "หนังสือ",
  health: "สุขภาพ",
  gym: "ออกกำลังกาย",
  entertainment: "เกม",
  gift: "ของขวัญ",
  people: "คน",
  baby: "เด็ก",
  pet: "สัตว์เลี้ยง",
  other: "กล่อง",
};

export function iconKeyFor(icon: string | null | undefined, slug?: string | null): CategoryIconKey | null {
  if (icon && icon in CATEGORY_ICONS) return icon as CategoryIconKey;
  if (slug && slug in CATEGORY_ICONS) return slug as CategoryIconKey;
  return null;
}

/** Relative luminance of a #rrggbb colour, for picking ink or white on top of it. */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0.5;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The category's stop marker: its songthaew route colour, the icon in white or ink, whichever reads. */
export function CategoryIcon({
  icon,
  slug,
  color,
  size = "md",
}: {
  icon?: string | null;
  slug?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const key = iconKeyFor(icon, slug);
  const Icon = key ? CATEGORY_ICONS[key] : CircleHelp;
  const box = size === "sm" ? "size-7" : size === "lg" ? "size-12" : "size-10";
  const glyph = size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";
  const c = color ?? "#8f969e";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${box}`}
      style={{ background: c, color: luminance(c) > 0.3 ? "#1b1715" : "#ffffff" }}
    >
      <Icon className={glyph} strokeWidth={2} />
    </span>
  );
}
