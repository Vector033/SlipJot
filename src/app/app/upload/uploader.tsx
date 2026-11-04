"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IngestResult } from "@/lib/slips";
import { formatBaht, formatDateTime } from "@/lib/core/format";

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
        if (!res.ok) update(item.key, { state: "error", error: json.error ?? "อัปโหลดไม่สำเร็จ" });
        else update(item.key, { state: "done", result: json as IngestResult });
      } catch {
        update(item.key, { state: "error", error: "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง" });
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
        className={`card flex flex-col items-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-accent bg-accent-soft" : ""}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-10 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-semibold">เลือกรูปสลิปจากอัลบั้ม</p>
        <p className="text-sm text-ink-3">เลือกได้หลายรูปพร้อมกัน หรือลากไฟล์มาวางตรงนี้</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary mt-1 px-6 py-3">
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
        <section aria-live="polite">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip">บันทึกแล้ว {saved}</span>
            <span className={`chip ${review ? "border-marker bg-marker/40 text-ink" : ""}`}>รอตรวจ {review}</span>
            <span className="chip">ซ้ำ {dupes}</span>
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
              <li key={it.key} className="card flex items-center gap-3 p-3" data-testid="upload-row">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={it.preview} alt="" className="h-14 w-10 shrink-0 rounded-md border border-line object-cover object-top" />
                <div className="min-w-0 flex-1 text-sm">
                  <Row item={it} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({ item }: { item: Item }) {
  if (item.state === "waiting") return <p className="text-ink-3">รอคิว…</p>;
  if (item.state === "reading")
    return (
      <p className="flex items-center gap-2 text-ink-2">
        <span className="size-3 animate-spin rounded-full border-2 border-accent border-t-transparent" /> กำลังอ่านสลิป…
      </p>
    );
  if (item.state === "error") return <p className="text-danger">{item.error}</p>;
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
        <span className="num shrink-0 font-semibold">{r.amount !== null ? formatBaht(r.amount, true) : "–"}</span>
      </p>
      <p className="flex flex-wrap items-center gap-x-2 text-ink-3">
        {r.occurredAt && <span>{formatDateTime(r.occurredAt)}</span>}
        <span>· {r.category ?? "ยังไม่จัดหมวด"}</span>
        {r.status === "review" ? (
          <Link href="/app/review" className="ml-auto rounded bg-marker px-1.5 text-xs font-semibold text-ink">
            รอตรวจ
          </Link>
        ) : (
          <span className="ml-auto text-xs font-semibold text-accent">บันทึกแล้ว ✓</span>
        )}
      </p>
    </>
  );
}
