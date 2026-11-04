"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "ภาพรวม", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/app/expenses", label: "รายการ", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/app/upload", label: "ส่งสลิป", icon: "M12 5v14M5 12h14", primary: true },
  { href: "/app/review", label: "รอตรวจ", icon: "M9 12l2 2 4-4M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" },
  { href: "/app/settings", label: "ตั้งค่า", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function Icon({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

export function DesktopNav({ reviewCount }: { reviewCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={isActive(pathname, it.href) ? "page" : undefined}
          className={
            it.primary
              ? "btn-primary ml-2"
              : `relative rounded-lg px-3 py-2 text-sm font-medium ${isActive(pathname, it.href) ? "bg-white text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`
          }
        >
          {it.primary && <Icon d={it.icon} className="size-4" />}
          {it.label}
          {it.href === "/app/review" && reviewCount > 0 && <Badge n={reviewCount} />}
        </Link>
      ))}
    </nav>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="num ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-marker px-1.5 text-xs font-bold text-ink">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function MobileNav({ reviewCount }: { reviewCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "font-semibold text-accent" : "text-ink-3"}`}
              >
                {it.primary ? (
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-accent text-white shadow-lg ring-4 ring-white">
                    <Icon d={it.icon} className="size-6" />
                  </span>
                ) : (
                  <Icon d={it.icon} />
                )}
                {it.label}
                {it.href === "/app/review" && reviewCount > 0 && (
                  <span className="num absolute top-1 right-[22%] min-w-4 rounded-full bg-marker px-1 text-[10px] font-bold text-ink">
                    {reviewCount}
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
