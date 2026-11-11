"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, playSplitFlapTick, setSoundEnabled } from "@/lib/micro-sound";

const SOUND_EVENT = "slipjot:sound-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SOUND_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SOUND_EVENT, callback);
  };
}

/** Opt-in micro-sound toggle (mute by default) stored locally on this device. */
export function SoundToggle() {
  const enabled = useSyncExternalStore(subscribe, isSoundEnabled, () => false);

  const toggle = (next: boolean) => {
    setSoundEnabled(next);
    window.dispatchEvent(new Event(SOUND_EVENT));
    if (next) playSplitFlapTick(true);
  };

  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => toggle(e.target.checked)}
        className="mt-1 size-5 accent-red"
      />
      <span className="flex-1">
        <span className="flex items-center gap-2 font-medium">
          {enabled ? <Volume2 className="size-4 text-ink" aria-hidden /> : <VolumeX className="size-4 text-ink-3" aria-hidden />}
          เสียงป้ายบอกทางและสแกนสลิป
        </span>
        <span className="block text-sm text-ink-2">
          <span className="inline-block">ปิดอยู่เป็นค่าเริ่มต้น:</span>{" "}
          <span className="inline-block">เปิดเสียงคลิกเบาๆ เมื่อพลิกป้าย</span>{" "}
          <span className="inline-block">หรืออ่านสลิปเสร็จ (เฉพาะเครื่องนี้)</span>
        </span>
      </span>
    </label>
  );
}
