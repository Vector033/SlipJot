"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CircleAlert, ImagePlus, RotateCcw, ScanLine } from "lucide-react";
import { RollingNumber } from "@/components/rolling-number";
import type { IngestResult } from "@/lib/slips";
import { formatDateTime } from "@/lib/core/format";

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
        if (!res.ok) update(item.key, { state: "error", error: json.error ?? "ส่งสลิปนี้ไม่สำเร็จ" });
        else update(item.key, { state: "done", result: json as IngestResult });
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
    <div className="space-y-5">
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
        className={`flex flex-col items-center gap-3 rounded-3xl border-[3px] border-dashed px-6 py-12 text-center transition-colors ${dragging ? "border-red bg-red-soft" : "border-chrome-dark bg-white"}`}
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-red text-white">
          <ImagePlus className="size-8" aria-hidden />
        </span>
        <p className="mt-1 text-lg font-bold">เลือกรูปสลิปจากอัลบั้ม</p>
        <p className="max-w-[34ch] text-sm text-ink-2">เลือกได้หลายรูปพร้อมกัน หรือลากไฟล์มาวางตรงนี้ · JPG, PNG, WebP ไม่เกิน 10 MB</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-plate mt-2">
          เลือกรูป
        </button>
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
        <section>
          {/* One short summary for screen readers instead of re-reading every row. */}
          <p className="sr-only" role="status">
            {busy ? `กำลังอ่าน ${done.length} จาก ${items.length} สลิป` : `อ่านครบ ${items.length} สลิป`} · บันทึกแล้ว {saved} · รอตรวจ{" "}
            {review} · ซ้ำ {dupes}
            {items.some((i) => i.state === "error") ? ` · ไม่สำเร็จ ${items.filter((i) => i.state === "error").length}` : ""}
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
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
              <Link href="/app/review" className="btn-primary ml-auto">
                ตรวจ {review} รายการ
              </Link>
            )}
            {!busy && review === 0 && done.length > 0 && (
              <Link href="/app/expenses" className="btn ml-auto">
                ดูรายการ
              </Link>
            )}
          </div>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.key} className="board flex items-center gap-3 p-3" data-testid="upload-row">
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-steel">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={it.preview} alt="" className="size-full object-cover object-top" />
                  {it.state === "reading" && (
                    // The reader passing over the slip: a flat plate band, no glow. Hidden for reduced motion.
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_38%,rgb(245_196_0/0.7)_50%,transparent_62%)] motion-reduce:hidden"
                      style={{ animation: "scan-loop 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <Row item={it} onRetry={() => retry(it)} />
                </div>
              </li>
            ))}
          </ul>
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
        <p className="flex items-center gap-2 text-ink-2">
          <ScanLine className="size-4 text-red" aria-hidden /> กำลังอ่านสลิป…
        </p>
        <p className="text-xs text-ink-3">อ่านยอด เวลา และผู้รับ แล้วจัดหมวดให้</p>
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
        <span className="truncate font-medium">{r.payeeName || "ไม่ทราบผู้รับ"}</span>
        <span className="plate-sm shrink-0 text-base" style={{ animation: "pop-chip 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) both" }}>
          {r.amount !== null ? <>฿<RollingNumber text={r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} /></> : "–"}
        </span>
      </p>
      <p className="flex flex-wrap items-center gap-x-2 text-ink-3">
        {r.occurredAt && <span>{formatDateTime(r.occurredAt)}</span>}
        <span>· {r.category ?? "ยังไม่จัดหมวด"}</span>
        {r.status === "review" ? (
          <Link
            href="/app/review"
            className="ml-auto inline-flex min-h-6 items-center gap-1 rounded-full bg-plate-soft px-2 text-xs font-semibold text-warn underline"
            style={{ animation: "pop-chip 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) 90ms both" }}
          >
            <CircleAlert className="size-3.5" aria-hidden /> รอตรวจ
          </Link>
        ) : (
          <span
            className="ml-auto inline-flex min-h-6 items-center gap-1 rounded-full bg-ok/10 px-2 text-xs font-semibold text-ok"
            style={{ animation: "pop-chip 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) 90ms both" }}
          >
            <Check className="size-3.5" aria-hidden /> บันทึกแล้ว
          </span>
        )}
      </p>
    </>
  );
}
