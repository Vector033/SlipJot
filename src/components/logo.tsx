/** Wordmark in route-sign lettering, with a route-board mark: red body, chrome trim, plate stripe. */
export function Logo({ tone = "ink", className = "" }: { tone?: "ink" | "white"; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg aria-hidden viewBox="0 0 32 32" className="size-8 shrink-0">
        <rect x="1" y="3" width="30" height="26" rx="6" fill="#b3121c" />
        <rect x="1" y="3" width="30" height="26" rx="6" fill="none" stroke="#1b1715" strokeOpacity=".25" />
        <path d="M5 21h22" stroke="#c8cdd3" strokeWidth="2" />
        <path d="M5 22.6h22" stroke="#8f969e" strokeWidth=".8" />
        <rect x="8" y="8" width="16" height="9" rx="2" fill="#f5c400" stroke="#1b1715" strokeWidth="1.4" />
        <path d="M11 12.5h10" stroke="#1b1715" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className={`sign text-[1.35rem] leading-none ${tone === "white" ? "text-white" : "text-ink"}`}>SlipJot</span>
    </span>
  );
}
