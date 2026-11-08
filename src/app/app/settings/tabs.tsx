"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app/settings", label: "หมวดและข้อมูล" },
  { href: "/app/settings/account", label: "บัญชีและความปลอดภัย" },
] as const;

/** The two settings pages, as lit stops: the current one is plate yellow. */
export function SettingsTabs() {
  const path = usePathname();
  return (
    <nav aria-label="หน้าตั้งค่า" className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const on = path === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={`chip ${on ? "chip-on" : ""}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
