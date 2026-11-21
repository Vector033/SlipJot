"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, House, ListOrdered, Plus, Settings, type LucideIcon } from "lucide-react";

const items: { href: string; label: string; icon: LucideIcon; primary?: boolean }[] = [
  { href: "/app", label: "ภาพรวม", icon: House },
  { href: "/app/expenses", label: "รายการ", icon: ListOrdered },
  { href: "/app/upload", label: "ส่งสลิป", icon: Plus, primary: true },
  { href: "/app/review", label: "รอตรวจ", icon: ClipboardCheck },
  { href: "/app/settings", label: "ตั้งค่า", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

/** The review count is part of the route board, not a decoration: it is how much is left to do. */
function Count({ n, onRed = false }: { n: number; onRed?: boolean }) {
  return (
    <span
      className={`plate-sm min-w-6 justify-center text-[0.8rem] ${onRed ? "" : "ring-2 ring-white"}`}
    >
      <span aria-hidden>{n > 99 ? "99+" : n}</span>
      <span className="sr-only"> รอ {n} รายการ</span>
    </span>
  );
}

export function DesktopNav({ reviewCount }: { reviewCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="เมนูหลัก">
      {items.map((it) => {
        const active = isActive(pathname, it.href);
        if (it.primary) {
          return (
            <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined} className="btn-plate ml-2 min-h-11 px-4 py-2 text-sm">
              <it.icon className="size-4" aria-hidden /> {it.label}
            </Link>
          );
        }
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-red-deep text-white" : "text-on-red-2 hover:bg-red-deep/60 hover:text-white"}`}
          >
            {it.label}
            {it.href === "/app/review" && reviewCount > 0 && <Count n={reviewCount} onRed />}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ reviewCount }: { reviewCount: number }) {
  const pathname = usePathname();
  return (
    <nav
      className="fluted-glass fixed inset-x-0 bottom-0 z-20 border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="เมนูหลัก"
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "font-semibold text-red" : "text-ink-3"}`}
              >
                {it.primary ? (
                  <span className="-mt-6 flex size-14 items-center justify-center rounded-2xl border border-plate-deep/40 bg-plate text-ink shadow-[0_6px_16px_-4px_rgb(245_158_11/0.5)]">
                    <it.icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : (
                  <it.icon className="size-[1.35rem]" strokeWidth={active ? 2.4 : 2} aria-hidden />
                )}
                <span>{it.label}</span>
                {active && !it.primary && <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b bg-red" />}
                {it.href === "/app/review" && reviewCount > 0 && (
                  <span className="absolute top-1.5 left-[calc(50%+4px)]">
                    <Count n={reviewCount} />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
