"use client";

import { useEffect, useState } from "react";

/**
 * Plate digits that roll into place like an odometer: each digit is a fixed-width column
 * that slides from 0 to its value, the rightmost settling last. Separators and the baht
 * sign stay still. Screen readers get the plain value; reduced motion lands instantly.
 */
export function RollingNumber({ text, className = "", delayMs = 0 }: { text: string; className?: string; delayMs?: number }) {
  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRolled(true));
    return () => cancelAnimationFrame(id);
  }, [text]);

  const chars = [...text];
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let seen = 0;
  return (
    <span className={`font-plate num relative isolate inline-flex items-center ${className}`}>
      {/* #18 Square-Dot Grid / #22 ASCII & Pixels LED matrix (6%) + #8 Halftone corner accents behind odometer digits */}
      <span aria-hidden className="led-matrix pointer-events-none absolute -inset-x-1 inset-y-0 z-0 rounded-[0.2em]" />
      <span aria-hidden className="halftone-corners pointer-events-none absolute -inset-x-1 inset-y-0 z-0 rounded-[0.2em] text-ink opacity-[0.07]" />
      <span className="sr-only">{text}</span>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} aria-hidden className="relative z-10 select-none">
              {ch}
            </span>
          );
        }
        const order = seen++;
        const d = Number(ch);
        return (
          // select-none: copying the amount yields the sr-only value, not the 0–9 strips.
          <span key={i} aria-hidden className="relative z-10 inline-block h-[1.15em] select-none overflow-hidden" style={{ width: "0.58em" }}>
            <span
              className="absolute inset-x-0 top-0 flex flex-col text-center will-change-transform"
              style={{
                transform: `translateY(-${(rolled ? d : 0) * 1.15}em)`,
                transition: `transform ${700 + order * 90}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs + (digitCount - order) * 35}ms`,
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1.15em] leading-[1.15em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
