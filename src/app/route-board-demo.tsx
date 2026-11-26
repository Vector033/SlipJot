"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { RollingNumber } from "@/components/rolling-number";
import { ThaiPhrases } from "@/components/thai-phrases";
import { playSplitFlapTick } from "@/lib/micro-sound";

// The landing's signature moment: a fictional slip is read onto the route board.
// The payee is written on like sign paint, the amount rolls onto the plate, and the stop
// for its category lights up. It plays once and holds; "next slip" flips the board's
// rows over like a split-flap sign and reads the next sample. Nothing loops on its own.

const STOPS = ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "ค่าหอ", "บิล"] as const;

type Sample = {
  src: string;
  w: number;
  h: number;
  alt: string;
  payee: string;
  amount: string;
  when: string;
  memo: string | null;
  stop: (typeof STOPS)[number];
  why: string;
};

// All fictional, rendered by scripts/generate-synthetic-slips.mts and scripts/generate-demo-slips.mts.
const SAMPLES: Sample[] = [
  {
    src: "/demo/slip-sample.jpg",
    w: 1050,
    h: 1133,
    alt: "สลิปโอนเงินตัวอย่าง (ข้อมูลสมมติ) ยอด 268 บาท ถึงก๋วยเตี๋ยวเรือลุงชัย",
    payee: "ก๋วยเตี๋ยวเรือ|ลุงชัย",
    amount: "268.00",
    when: "6 ต.ค. 2569 · 05:15 น.",
    memo: "ค่ากาแฟ",
    stop: "อาหาร",
    why: "จัดหมวดจากบันทึกช่วยจำ “ค่ากาแฟ”",
  },
  {
    src: "/demo/slip-transport.jpg",
    w: 1050,
    h: 1173,
    alt: "สลิปโอนเงินตัวอย่าง (ข้อมูลสมมติ) ยอด 30 บาท ถึงนายศุภชัย คำแสน",
    payee: "นาย ศุภชัย| คำแสน",
    amount: "30.00",
    when: "6 ต.ค. 2569 · 08:42 น.",
    memo: "ค่ารถแดง",
    stop: "เดินทาง",
    why: "จัดหมวดจากบันทึกช่วยจำ “ค่ารถแดง”",
  },
  {
    src: "/demo/slip-shopping.jpg",
    w: 1050,
    h: 1150,
    alt: "สลิปโอนเงินตัวอย่าง (ข้อมูลสมมติ) ยอด 145 บาท ถึงร้านเครื่องเขียนหน้ามอ",
    payee: "ร้านเครื่องเขียน|หน้ามอ",
    amount: "145.00",
    when: "7 ต.ค. 2569 · 12:18 น.",
    memo: null,
    stop: "ช้อปปิ้ง",
    why: "ไม่มีบันทึกช่วยจำ| จึงจัดหมวดจากชื่อร้าน",
  },
  {
    src: "/demo/slip-housing.jpg",
    w: 1050,
    h: 1155,
    alt: "สลิปโอนเงินตัวอย่าง (ข้อมูลสมมติ) ยอด 3,500 บาท ถึงหอพักบ้านสวนนิมมาน",
    payee: "หอพัก|บ้านสวนนิมมาน",
    amount: "3,500.00",
    when: "1 ต.ค. 2569 · 19:05 น.",
    memo: "ค่าหอเดือนนี้",
    stop: "ค่าหอ",
    why: "จัดหมวดจากบันทึกช่วยจำ “ค่าหอเดือนนี้”",
  },
];

// Each row of the board flips over in turn, top to bottom, like split-flap leaves.
const flip = (run: number, row: number) =>
  run === 0 ? undefined : { animation: `flip-tick 0.38s cubic-bezier(0.16, 1, 0.3, 1) ${row * 70}ms both` };

export function RouteBoardDemo() {
  const [run, setRun] = useState(0);
  const [idx, setIdx] = useState(0);
  // Start settled in "read" so SSR and initial hydration never flash "กำลังอ่าน…" or "฿0.00".
  const [phase, setPhase] = useState<"scan" | "read">("read");
  // On phones the board sits below the fold: hold the laser until it is on screen.
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const slip = SAMPLES[idx];

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.5 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (run === 0) return;
    // Reduced motion: no scan delay, the next sample lands at once.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => setPhase("read"), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("read"), 1100);
    return () => clearTimeout(t);
  }, [run]);

  const next = () => {
    playSplitFlapTick();
    setPhase("scan");
    setIdx((i) => (i + 1) % SAMPLES.length);
    setRun((r) => r + 1);
  };

  return (
    <figure ref={ref} className="relative mx-auto w-full max-w-[34rem] lg:max-w-[40rem]" aria-label="ตัวอย่าง: SlipJot อ่านสลิปแล้วบันทึกเป็นรายจ่าย">
      <div className="grid grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] items-start gap-3 sm:gap-4">
        {/* The slip, as it sits in the photo album. All samples share one cell so nothing shifts. */}
        <div className="relative mt-6 grid overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] ring-1 ring-black/10">
          {SAMPLES.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              alt={i === idx ? s.alt : ""}
              aria-hidden={i === idx ? undefined : true}
              width={s.w}
              height={s.h}
              className={`h-auto w-full [grid-area:1/1] transition-opacity duration-200 ${i === idx ? "opacity-100" : "opacity-0"}`}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
            />
          ))}
          <span aria-hidden className="paper-overlay pointer-events-none absolute inset-0" />
          {/* The reader's laser: a glowing plate-yellow line sweeping the slip, looping while the demo is on screen.
              The full-height wrapper moves (transform only), so 100% is the slip's height. */}
          {seen && (
            <span aria-hidden className="laser pointer-events-none absolute inset-0 motion-reduce:hidden">
              <span className="block h-[3px] rounded-full bg-plate shadow-[0_0_6px_1px_rgb(245_196_0/0.95),0_0_22px_6px_rgb(245_196_0/0.55),0_0_44px_14px_rgb(217_171_0/0.25)]" />
            </span>
          )}
        </div>

        {/* Embossed metallic route board */}
        <div
          key={run}
          className="overflow-hidden rounded-2xl border border-white/15 border-t-white/30 bg-red-night text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.45),0_24px_48px_-20px_rgb(0_0_0/0.7)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-ink px-3 py-2 text-[0.75rem] text-on-red-2 sm:px-3.5 sm:text-[0.8rem]">
            <span className="whitespace-nowrap">
              <span className="hidden min-[390px]:inline">สลิป</span>ตัวอย่าง <span className="num">{idx + 1}/{SAMPLES.length}</span>
              <span className="hidden sm:inline"> · ข้อมูลสมมติ</span>
            </span>
            <span className={`whitespace-nowrap font-medium ${phase === "read" ? "text-plate" : ""}`}>
              {phase === "read" ? "อ่านแล้ว" : "กำลังอ่าน…"}
            </span>
          </div>

          <div className="relative space-y-2.5 px-3 pt-3 pb-3.5 [perspective:600px]">
            {/* #18 Square-Dot Grid / #22 ASCII & Pixels LED matrix (6% opacity) + #8 Halftone corner accents */}
            <span aria-hidden className="led-matrix-light pointer-events-none absolute inset-0 z-0" />
            <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-on-red-2 opacity-[0.1]" />

            <div
              className="relative z-10 origin-top rounded-[4px] bg-black/20 px-2.5 py-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.45)]"
              style={flip(run, 0)}
            >
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/25" />
              <p className="relative text-[0.8rem] text-on-red-2">จ่ายให้</p>
              <p
                className="sign relative min-h-[2.8em] pt-0.5 text-[1.05rem] leading-[1.35] sm:min-h-0 sm:text-2xl"
                style={
                  phase === "read"
                    ? run > 0
                      ? { animation: "write-on 0.9s cubic-bezier(0.65, 0, 0.35, 1) both" }
                      : undefined
                    : { visibility: "hidden" }
                }
              >
                <ThaiPhrases text={slip.payee} />
              </p>
            </div>

            <div
              className="relative z-10 origin-top rounded-[4px] bg-black/20 px-2.5 py-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.45)]"
              style={flip(run, 1)}
            >
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/25" />
              <p className="relative mb-1 text-[0.8rem] text-on-red-2">ยอด</p>
              <span className="plate relative text-[1.6rem] sm:text-[2rem]">
                ฿
                {phase === "read" ? (
                  run > 0 ? (
                    <RollingNumber text={slip.amount} delayMs={250} />
                  ) : (
                    <span className="font-plate num">{slip.amount}</span>
                  )
                ) : (
                  <span className="num">0.00</span>
                )}
              </span>
              <p className="relative mt-2 text-[0.75rem] leading-relaxed text-on-red-2">
                <span className="inline-block">{slip.when}</span>
                <br />
                {slip.memo ? (
                  <span className="inline-block">
                    บันทึกช่วยจำ: <span className="text-white">{slip.memo}</span>
                  </span>
                ) : (
                  "ไม่มีบันทึกช่วยจำ"
                )}
              </p>
            </div>

            <div className="trim relative z-10 opacity-70" />

            <div className="relative z-10 origin-top px-0.5" style={flip(run, 2)}>
              <p className="mb-1.5 text-[0.8rem] text-on-red-2">ลงป้าย</p>
              <ul className="flex flex-wrap gap-1 lg:flex-nowrap" aria-label="หมวด">
                {STOPS.map((s) => {
                  const on = phase === "read" && s === slip.stop;
                  return (
                    <li
                      key={s}
                      aria-current={on ? "true" : undefined}
                      className={`rounded-full border px-2 py-0.5 text-[0.8rem] whitespace-nowrap ${
                        on
                          ? run === 0
                            ? "border-plate bg-plate font-semibold text-ink"
                            : "border-plate font-semibold"
                          : "border-white/25 text-on-red-2"
                      }`}
                      style={on && run > 0 ? { animation: "stop-light 0.35s ease-out 1.15s both" } : undefined}
                    >
                      {s}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-[0.8rem] text-on-red-2">
        <span aria-live="polite">
          <span className="inline-block">ตัวอย่างการทำงาน · ข้อมูลสมมติ ·</span> <Unbroken text={slip.why} />
        </span>
        <button
          type="button"
          onClick={next}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/35 px-3.5 text-white whitespace-nowrap transition-[border-color,transform] duration-150 hover:border-white active:scale-[0.97]"
        >
          สลิปถัดไป <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </figcaption>
    </figure>
  );
}

// Thai has no word spaces: keep "บันทึกช่วยจำ “...”" together so the quoted memo never orphans alone.
function Unbroken({ text }: { text: string }) {
  if (text.includes("|")) {
    return <ThaiPhrases text={text} />;
  }
  const at = text.indexOf("บันทึกช่วยจำ");
  if (at < 0) return <span className="inline-block">{text}</span>;
  return (
    <>
      {at > 0 && <span className="inline-block">{text.slice(0, at)}</span>}
      <span className="inline-block">{text.slice(at)}</span>
    </>
  );
}
