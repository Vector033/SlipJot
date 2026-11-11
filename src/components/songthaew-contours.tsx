/**
 * Reusable Chiang Mai Doi Suthep single-hue ridge silhouette & topographic contour lines (#6 & #13).
 * Pure inline SVG (`pointer-events-none`, `aria-hidden`) engineered for 60 FPS mobile PWA surfaces.
 */
export function SongthaewContours({
  variant = "hero",
  density = "rich",
  className = "",
}: {
  variant?: "hero" | "cabin";
  density?: "rich" | "subtle";
  className?: string;
}) {
  if (variant === "cabin") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className={`pointer-events-none select-none ${className}`}
      >
        <path
          d="M0 220V148C170 116 320 92 490 104C645 115 760 66 945 76C1120 86 1255 128 1440 102V220Z"
          fill="var(--color-chrome)"
          fillOpacity="0.28"
        />
        <path
          d="M0 220V172C210 146 375 118 555 130C735 142 895 96 1080 106C1240 115 1345 144 1440 130V220Z"
          fill="var(--color-steel-2)"
          fillOpacity="0.62"
        />
        <path
          d="M0 118C205 80 355 54 535 70C710 86 845 32 1035 42C1205 51 1335 86 1440 66"
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.06"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 162C220 138 360 106 540 118C710 130 860 84 1050 94C1210 102 1330 132 1440 118"
          fill="none"
          stroke="var(--color-red)"
          strokeOpacity="0.09"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  const backRidgeOpacity = density === "rich" ? 0.28 : 0.22;
  const frontRidgeOpacity = density === "rich" ? 0.42 : 0.34;
  const lineOpacity = density === "rich" ? 0.22 : 0.16;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M0 200V132C180 96 310 72 470 84C610 94 710 42 890 50C1050 58 1210 104 1440 80V200Z"
        fill="var(--color-red-night)"
        fillOpacity={backRidgeOpacity}
      />
      <path
        d="M0 200V152C220 130 360 96 540 108C710 120 860 72 1050 82C1210 90 1330 124 1440 110V200Z"
        fill="var(--color-red-night)"
        fillOpacity={frontRidgeOpacity}
      />
      <path
        d="M0 108C210 68 360 44 540 60C710 76 840 22 1030 32C1200 40 1330 76 1440 56"
        fill="none"
        stroke="var(--color-on-red-2)"
        strokeOpacity={lineOpacity}
        strokeWidth="1.35"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 126C200 98 350 68 530 82C705 96 850 48 1045 58C1215 66 1335 94 1440 80"
        fill="none"
        stroke="var(--color-on-red-2)"
        strokeOpacity={lineOpacity * 0.78}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 146C220 124 360 92 540 104C710 116 860 70 1050 80C1210 88 1330 120 1440 106"
        fill="none"
        stroke="var(--color-red-night)"
        strokeOpacity={density === "rich" ? 0.5 : 0.36}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
