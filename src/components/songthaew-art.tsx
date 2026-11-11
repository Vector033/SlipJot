/**
 * Editorial Chiang Mai Songthaew SVG illustrations replacing noisy background grids.
 * Pure inline vector markup (`aria-hidden`, `pointer-events-none`) bound strictly to theme tokens.
 */
export function SongthaewIllo({
  variant,
  className = "",
}: {
  variant: "truck" | "cleared" | "ledger";
  className?: string;
}) {
  if (variant === "truck") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 220 96"
        className={`pointer-events-none select-none ${className}`}
        fill="none"
      >
        {/* Subtle Doi Suthep silhouette behind */}
        <path
          d="M16 79C48 44 102 38 158 58C180 66 196 73 206 79H16Z"
          fill="var(--color-steel-2)"
        />
        <line x1="22" y1="80" x2="198" y2="80" stroke="var(--color-chrome-dark)" strokeWidth="1.75" strokeLinecap="round" />

        {/* Rear boarding step + passenger canopy */}
        <rect x="38" y="62" width="10" height="5" rx="1.5" fill="var(--color-chrome-dark)" />
        <path
          d="M46 25C49 17 128 17 136 25V66H46V25Z"
          fill="var(--color-red)"
          stroke="var(--color-ink)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Passenger side opening + grab pole */}
        <rect
          x="54"
          y="27"
          width="74"
          height="17"
          rx="3"
          fill="var(--color-steel)"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
        <line x1="78" y1="27" x2="78" y2="44" stroke="var(--color-chrome-dark)" strokeWidth="2" />
        <line x1="104" y1="27" x2="104" y2="44" stroke="var(--color-chrome-dark)" strokeWidth="2" />
        {/* Chrome waist trim */}
        <line x1="47" y1="50" x2="136" y2="50" stroke="var(--color-chrome)" strokeWidth="2" />

        {/* Front cab & hood */}
        <path
          d="M136 25H158C163 25 166 28 168 34L172 44L179 47C182 48.5 184 51 184 55V66H136V25Z"
          fill="var(--color-red)"
          stroke="var(--color-ink)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Roof route sign */}
        <rect
          x="138"
          y="17"
          width="20"
          height="7"
          rx="2"
          fill="var(--color-plate)"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
        {/* Cab windshield / side window */}
        <path
          d="M141 29H157C160 29 162 31 164 36L166 43H141V29Z"
          fill="var(--color-steel)"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Headlight + yellow plate badge */}
        <rect x="177" y="50" width="5" height="6" rx="1.5" fill="var(--color-plate-soft)" stroke="var(--color-ink)" strokeWidth="1.25" />
        <rect
          x="166"
          y="58"
          width="16"
          height="7"
          rx="2"
          fill="var(--color-plate)"
          stroke="var(--color-ink)"
          strokeWidth="1.4"
        />

        {/* Wheels */}
        <circle cx="72" cy="69" r="10.5" fill="var(--color-panel)" stroke="var(--color-ink)" strokeWidth="3.5" />
        <circle cx="72" cy="69" r="3.5" fill="var(--color-chrome-dark)" />
        <circle cx="155" cy="69" r="10.5" fill="var(--color-panel)" stroke="var(--color-ink)" strokeWidth="3.5" />
        <circle cx="155" cy="69" r="3.5" fill="var(--color-chrome-dark)" />
      </svg>
    );
  }

  if (variant === "cleared") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 200 96"
        className={`pointer-events-none select-none ${className}`}
        fill="none"
      >
        {/* Soft horizon wash */}
        <ellipse cx="100" cy="76" rx="74" ry="12" fill="var(--color-steel-2)" />
        {/* Red ticket stub behind */}
        <rect
          x="48"
          y="24"
          width="44"
          height="52"
          rx="7"
          transform="rotate(-7 48 24)"
          fill="var(--color-red-soft)"
          stroke="var(--color-red)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* Main thermal slip */}
        <path
          d="M66 14H134V74L127 70L120 75L113 70L106 75L99 70L92 75L85 70L78 75L72 70L66 74V14Z"
          fill="var(--color-panel)"
          stroke="var(--color-ink)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Header stripe */}
        <rect x="75" y="22" width="50" height="5" rx="2.5" fill="var(--color-ink)" fillOpacity="0.16" />
        {/* Plate-yellow amount highlight */}
        <rect
          x="75"
          y="33"
          width="50"
          height="13"
          rx="4"
          fill="var(--color-plate)"
          stroke="var(--color-ink)"
          strokeWidth="1.4"
        />
        {/* Receipt detail lines */}
        <line x1="76" y1="54" x2="122" y2="54" stroke="var(--color-chrome-dark)" strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="61" x2="108" y2="61" stroke="var(--color-chrome)" strokeWidth="2" strokeLinecap="round" />

        {/* Verified green check seal */}
        <circle cx="134" cy="64" r="15" fill="var(--color-ok)" stroke="var(--color-panel)" strokeWidth="3" />
        <path
          d="M127.5 64.2L132 68.7L140.5 60"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 96"
      className={`pointer-events-none select-none ${className}`}
      fill="none"
    >
      <ellipse cx="100" cy="78" rx="76" ry="10" fill="var(--color-steel-2)" />
      <rect
        x="42"
        y="16"
        width="116"
        height="62"
        rx="10"
        fill="var(--color-panel)"
        stroke="var(--color-ink)"
        strokeWidth="1.75"
      />
      {/* Ink header bar + red seam */}
      <path d="M42 26C42 20.477 46.477 16 52 16H148C153.523 16 158 20.477 158 26V31H42V26Z" fill="var(--color-ink)" />
      <line x1="43" y1="31" x2="157" y2="31" stroke="var(--color-red)" strokeWidth="2" />
      <circle cx="53" cy="23.5" r="2.2" fill="var(--color-plate)" />
      <rect x="60" y="21.5" width="38" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />

      {/* Ledger rows */}
      <circle cx="55" cy="44" r="4" fill="var(--color-red-soft)" stroke="var(--color-red)" strokeWidth="1.5" />
      <line x1="65" y1="44" x2="112" y2="44" stroke="var(--color-chrome-dark)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="122" y="39" width="24" height="10" rx="3" fill="var(--color-plate)" stroke="var(--color-ink)" strokeWidth="1.25" />

      <line x1="51" y1="53" x2="149" y2="53" stroke="var(--color-line)" strokeWidth="1" />

      <circle cx="55" cy="64" r="4" fill="var(--color-steel)" stroke="var(--color-chrome-dark)" strokeWidth="1.5" />
      <line x1="65" y1="64" x2="104" y2="64" stroke="var(--color-chrome)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="122" y="59" width="24" height="10" rx="3" fill="var(--color-steel)" stroke="var(--color-line)" strokeWidth="1.25" />
    </svg>
  );
}
