"use client";

const STORAGE_KEY = "slipjot:sound";
let sharedCtx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

/** Subtle mechanical split-flap tick (mute unless user explicitly opted in). */
export function playSplitFlapTick(force = false) {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.022);

  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.026);
}

/** Gentle two-tone confirmation chime when OCR finishes reading a slip (mute by default). */
export function playScanCompleteTone(kind: "ok" | "review", force = false) {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = kind === "ok" ? [587.33, 880] : [523.25];
  notes.forEach((freq, i) => {
    const start = now + i * 0.075;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.032, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.17);
  });
}
