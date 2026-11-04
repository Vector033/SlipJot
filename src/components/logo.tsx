export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-bold tracking-tight ${className}`}>
      <svg aria-hidden viewBox="0 0 32 32" className="size-7">
        <path d="M7 3h18v26l-3-2-3 2-3-2-3 2-3-2-3 2z" fill="#0f766e" />
        <path d="M11 11h10M11 16h10M11 21h6" stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>
        Slip<span className="text-accent">Jot</span>
      </span>
    </span>
  );
}
