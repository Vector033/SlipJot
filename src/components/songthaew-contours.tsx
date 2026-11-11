/**
 * Reusable Chiang Mai Doi Suthep single-hue ridge silhouette & topographic contour lines (#6 & #13).
 * Pure inline SVG (`pointer-events-none`, `aria-hidden`) engineered for 60 FPS mobile PWA surfaces.
 */
export function SongthaewContours({
  variant = "hero",
  density = "rich",
  className = "",
}: {
  variant?: "hero" | "cabin" | "header";
  density?: "rich" | "subtle";
  className?: string;
}) {
  if (variant === "header") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className={`pointer-events-none select-none ${className}`}
      >
        {/* Side bodywork louvers on left/right wings (desktop margins) */}
        <g className="hidden sm:block" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path d="M26 52L54 12M44 52L72 12M62 52L90 12" stroke="var(--color-on-red-2)" strokeOpacity="0.14" />
          <path d="M28 52L56 12M46 52L74 12M64 52L92 12" stroke="var(--color-red-night)" strokeOpacity="0.3" />
          <path d="M1348 52L1376 12M1366 52L1394 12M1384 52L1412 12" stroke="var(--color-on-red-2)" strokeOpacity="0.14" />
          <path d="M1350 52L1378 12M1368 52L1396 12M1386 52L1414 12" stroke="var(--color-red-night)" strokeOpacity="0.3" />
        </g>
        {/* Stepped Doi Suthep horizon ridges hugging the lower rim so upper enamel & nav text stay bright red */}
        <path
          d="M0 64V44C185 32 355 28 545 38C720 47 885 26 1080 34C1245 40 1355 48 1440 40V64Z"
          fill="var(--color-red-night)"
          fillOpacity="0.24"
        />
        <path
          d="M0 64V52C210 44 390 38 585 46C765 54 925 38 1115 44C1275 49 1365 56 1440 50V64Z"
          fill="var(--color-red-night)"
          fillOpacity="0.36"
        />
        <path
          d="M0 36C195 24 365 20 550 30C725 39 885 18 1080 26C1245 32 1355 42 1440 34"
          fill="none"
          stroke="var(--color-on-red-2)"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 46C205 36 375 30 565 39C745 47 905 29 1095 36C1260 42 1365 51 1440 43"
          fill="none"
          stroke="var(--color-on-red-2)"
          strokeOpacity="0.11"
          strokeWidth="1.05"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

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
