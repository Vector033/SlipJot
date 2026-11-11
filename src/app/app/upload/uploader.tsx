"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CircleAlert, ImagePlus, RotateCcw, ScanLine, ShieldCheck, X } from "lucide-react";
import { RollingNumber } from "@/components/rolling-number";
import { ThaiPhrases } from "@/components/thai-phrases";
import type { IngestResult } from "@/lib/slips";
import { formatDateTime } from "@/lib/core/format";
import { playScanCompleteTone } from "@/lib/micro-sound";

type Item = {
  key: string;
  file: File;
  preview: string;
  state: "waiting" | "reading" | "done" | "error";
  result?: IngestResult;
  error?: string;
};

const SHARE_CACHE = "slipjot-share";
const CONCURRENCY = 2;

async function takeSharedFiles(): Promise<File[]> {
  if (!("caches" in window)) return [];
  const cache = await caches.open(SHARE_CACHE);
  const files: File[] = [];
  for (const req of await cache.keys()) {
    const res = await cache.match(req);
    if (res) {
      const blob = await res.blob();
      const name = decodeURIComponent(res.headers.get("x-filename") ?? "slip.jpg");
      files.push(new File([blob], name, { type: blob.type || "image/jpeg" }));
    }
    await cache.delete(req);
  }
  return files;
}

export function Uploader({ shared }: { shared: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const running = useRef(0);
  const queue = useRef<Item[]>([]);

  const update = useCallback((key: string, patch: Partial<Item>) => {
    setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }, []);

  const upload = useCallback(
    async (item: Item) => {
      update(item.key, { state: "reading" });
      const body = new FormData();
      body.set("file", item.file);
      try {
        const res = await fetch("/api/slips", { method: "POST", body });
        const json = await res.json().catch(() => ({ error: "เซิร์ฟเวอร์ไม่ตอบ" }));
        if (!res.ok) {
          update(item.key, { state: "error", error: json.error ?? "ส่งสลิปนี้ไม่สำเร็จ" });
        } else {
          const result = json as IngestResult;
          update(item.key, { state: "done", result });
          playScanCompleteTone(result.status === "review" ? "review" : "ok");
        }
      } catch {
        update(item.key, { state: "error", error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" });
      }
    },
    [update],
  );

  // Up to CONCURRENCY workers drain the shared queue.
  const pump = useCallback(() => {
    while (running.current < CONCURRENCY && queue.current.length) {
      running.current++;
      (async () => {
        while (queue.current.length) await upload(queue.current.shift()!);
        running.current--;
        if (running.current === 0) router.refresh(); // update the review badge
      })();
    }
  }, [router, upload]);

  const add = useCallback(
    (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
      const next = images.map((file, i) => ({
        key: `${Date.now()}-${i}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        state: "waiting" as const,
      }));
      setItems((xs) => [...next, ...xs]);
      queue.current.push(...next);
      pump();
    },
    [pump],
  );

  const retry = useCallback(
    (item: Item) => {
      update(item.key, { state: "waiting", error: undefined });
      queue.current.push(item);
      pump();
    },
    [pump, update],
  );

  const remove = useCallback((key: string) => {
    queue.current = queue.current.filter((x) => x.key !== key);
    setItems((xs) => {
      const target = xs.find((x) => x.key === key);
      if (target) URL.revokeObjectURL(target.preview);
      return xs.filter((x) => x.key !== key);
    });
  }, []);

  useEffect(() => {
    if (!shared) return;
    takeSharedFiles().then((files) => files.length && add(files));
  }, [shared, add]);

  const done = items.filter((i) => i.state === "done");
  const saved = done.filter((i) => i.result?.status === "saved").length;
  const review = done.filter((i) => i.result?.status === "review").length;
  const dupes = done.filter((i) => i.result?.status === "duplicate").length;
  const busy = items.some((i) => i.state === "waiting" || i.state === "reading");

  return (
    <div className="space-y-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add([...e.dataTransfer.files]);
        }}
        // Once slips are in, the drop zone shrinks to one row so the slips being read stay on a phone screen.
        className={`paper-texture flex items-center rounded-3xl border-[3px] border-dashed text-center transition-[background-color,border-color,box-shadow] duration-150 ${items.length ? "justify-between gap-3 px-4 py-3" : "flex-col gap-3 px-6 py-12"} ${dragging ? "border-red bg-red-soft ring-4 ring-red/15" : "border-chrome-dark bg-white hover:border-red/60"}`}
      >
        {items.length === 0 && (
          <span className="flex size-16 items-center justify-center rounded-xl bg-red text-white shadow-[0_6px_14px_-8px_rgb(179_18_28/0.55)]">
            <ImagePlus className="size-8" aria-hidden />
          </span>
        )}
        <p className={items.length ? "text-left font-bold" : "mt-1 text-lg font-bold"}>
          {items.length ? "เพิ่มสลิปอีก" : "เลือกรูปสลิปจากอัลบั้ม"}
        </p>
        {items.length === 0 && (
          <p className="max-w-[38ch] text-sm text-ink-2">
            <ThaiPhrases text="เลือกได้หลายรูปพร้อมกัน| หรือลากไฟล์มาวางตรงนี้| · JPG, PNG, WebP| ไม่เกิน 10 MB" />
          </p>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} className={items.length ? "btn" : "btn-plate mt-2"}>
          เลือกรูป
        </button>
        {items.length === 0 && (
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-ink-2">
            <ShieldCheck className="size-4 shrink-0 text-ok" aria-hidden />
            <span>
              <ThaiPhrases text="AI อ่านใน 2 วิ| · ใบไหนไม่แน่ใจถามคุณก่อนบันทึกเสมอ" />
            </span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="เลือกรูปสลิป"
          data-testid="slip-input"
          onChange={(e) => {
            add([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <section className="space-y-4">
          {/* One short summary for screen readers instead of re-reading every row. */}
          <p className="sr-only" role="status">
            {busy ? `กำลังอ่าน ${done.length} จาก ${items.length} สลิป` : `อ่านครบ ${items.length} สลิป`} · บันทึกแล้ว {saved} · รอตรวจ{" "}
            {review} · ซ้ำ {dupes}
            {items.some((i) => i.state === "error") ? ` · ไม่สำเร็จ ${items.filter((i) => i.state === "error").length}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="chip">
              บันทึกแล้ว <span className="num font-bold text-ink">{saved}</span>
            </span>
            <span className={`chip ${review ? "border-ink bg-plate text-ink" : ""}`}>
              รอตรวจ <span className="num font-bold">{review}</span>
            </span>
            <span className="chip">
              ซ้ำ <span className="num font-bold text-ink">{dupes}</span>
            </span>
            {!busy && review > 0 && (
              <Link href="/app/review" className="btn-primary ml-auto hidden sm:inline-flex">
                ตรวจ {review} รายการ <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            {!busy && review === 0 && done.length > 0 && (
              <Link href="/app/expenses" className="btn ml-auto hidden sm:inline-flex">
                ดูรายการ <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
          <ul className="space-y-3">
            {items.map((it) => {
              const verified = it.state === "done" && it.result?.status === "saved";
              const unsure = it.state === "done" && it.result?.status === "review";
              return (
                <li
                  key={it.key}
                  className="board paper-texture flex items-center gap-3 p-4"
                  data-testid="upload-row"
                >
                  {/* Inner radius = outer (16px) - padding (16px) -> crisp 4px frame; floating badges/actions over white bank slips use dark high-contrast pills. */}
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-[4px] bg-steel transition-[width,height] duration-300 ease-out motion-reduce:transition-none ${
                      it.state === "reading" ? "h-36 w-26 border border-plate-deep" : "h-22 w-16"
                    } ${verified ? "iridescent-border" : unsure ? "border-2 border-plate-deep" : "border border-line"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                    <img src={it.preview} alt="" className="size-full object-cover object-top" />
                    {/* #12 Paper Texture over the slip preview (baseFrequency=0.85, opacity 3.5%) */}
                    <span aria-hidden className="paper-overlay pointer-events-none absolute inset-0 z-10" />
                    {it.state === "reading" && (
                      <>
                        <span aria-hidden className="animate-laser pointer-events-none absolute inset-0 z-10 motion-reduce:hidden">
                          <span className="block h-[3px] w-full rounded-full bg-plate shadow-[0_0_6px_1px_rgb(245_196_0/0.95),0_0_18px_4px_rgb(245_196_0/0.45)]" />
                          <span className="block h-5 w-full bg-gradient-to-b from-plate/30 to-transparent" />
                        </span>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute right-1.5 bottom-1.5 z-20 inline-flex items-center rounded-full bg-ink/90 px-2 py-0.5 text-[0.65rem] font-semibold text-white ring-1 ring-white/25 backdrop-blur-xs"
                        >
                          สแกน…
                        </span>
                      </>
                    )}
                    {it.state !== "reading" && (
                      <button
                        type="button"
                        onClick={() => remove(it.key)}
                        aria-label="นำรูปนี้ออกจากรายการ"
                        className="absolute top-1 right-1 z-20 inline-flex size-5 items-center justify-center rounded-full bg-ink/90 text-white shadow-sm ring-1 ring-white/30 transition-colors hover:bg-ink after:absolute after:-inset-3 after:content-['']"
                      >
                        <X className="size-3" strokeWidth={2.5} aria-hidden />
                      </button>
                    )}
                    {verified && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-1 left-1 z-20 inline-flex size-5 items-center justify-center rounded-full bg-ok text-white shadow-sm ring-2 ring-white"
                      >
                        <Check className="size-3" strokeWidth={2.75} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <Row item={it} onRetry={() => retry(it)} />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Mobile bottom thumb-zone primary CTA after reading completes */}
          {!busy && (review > 0 || done.length > 0) && (
            <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 pt-2 sm:hidden">
              {review > 0 ? (
                <Link href="/app/review" className="btn-plate w-full shadow-lg">
                  ตรวจ {review} รายการ <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <Link href="/app/expenses" className="btn-primary w-full shadow-lg">
                  ดูรายการที่บันทึก <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Row({ item, onRetry }: { item: Item; onRetry: () => void }) {
  if (item.state === "waiting") return <p className="text-ink-3">รอคิว…</p>;
  if (item.state === "reading")
    return (
      <div className="space-y-1.5">
        <p className="flex items-start gap-2 font-medium text-ink-2">
          <ScanLine className="mt-1 size-4 shrink-0 text-red" aria-hidden />
          <span>
            <ThaiPhrases text="กำลังอ่านยอดเงิน| วันที่ และผู้รับ..." />
          </span>
        </p>
        <p className="text-xs text-ink-3">
          <ThaiPhrases text="อ่านเสร็จแล้ว|จะจัดหมวดให้" />
        </p>
      </div>
    );
  if (item.state === "error")
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="flex min-w-0 flex-1 items-start gap-2 text-red-deep">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {item.error}
        </p>
        <button type="button" onClick={onRetry} className="btn min-h-9 px-3">
          <RotateCcw className="size-4" aria-hidden /> ลองอีกครั้ง
        </button>
      </div>
    );
  const r = item.result!;
  if (r.status === "duplicate")
    return (
      <p className="text-ink-2">
        <span className="font-medium text-ink">ข้าม: </span>
        {r.reason}
      </p>
    );
  return (
    <>
      <p className="flex items-baseline justify-between gap-2">
        <span className="animate-pop-chip truncate font-medium">{r.payeeName || "ไม่ทราบผู้รับ"}</span>
        <span className="plate-sm animate-pop-chip shrink-0 text-base">
          {r.amount !== null ? <>฿<RollingNumber text={r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} /></> : "–"}
        </span>
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-ink-3">
        {r.occurredAt && (
          <span className="animate-pop-chip" style={{ animationDelay: "45ms" }}>
            {formatDateTime(r.occurredAt)}
          </span>
        )}
        <span className="animate-pop-chip" style={{ animationDelay: "70ms" }}>
          · {r.category ?? "ยังไม่จัดหมวด"}
        </span>
        {r.status === "review" ? (
          <Link
            href="/app/review"
            className="animate-pop-chip ml-auto inline-flex min-h-6 items-center gap-1 rounded-full bg-plate-soft px-2 text-xs font-semibold text-warn underline"
            style={{ animationDelay: "100ms" }}
          >
            <CircleAlert className="size-3.5" aria-hidden /> รอตรวจ
          </Link>
        ) : (
          <span
            className="animate-pop-chip ml-auto inline-flex min-h-6 items-center gap-1 rounded-full bg-ok/12 px-2 text-xs font-semibold text-ok"
            style={{ animationDelay: "100ms" }}
          >
            <Check className="size-3.5" aria-hidden /> บันทึกแล้ว
          </span>
        )}
      </p>
    </>
  );
}
