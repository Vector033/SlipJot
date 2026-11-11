"use client";

import { useActionState, useId, useState } from "react";
import type { FormState } from "@/app/app/actions";
import { CategoryIcon } from "@/components/category-icon";
import { playScanCompleteTone, playSplitFlapTick } from "@/lib/micro-sound";

const THAI_WHEN = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2026-11-04T11:12" (Bangkok wall time) → "4 พ.ย. 2569 11:12" */
function thaiWhen(local: string) {
  const d = new Date(`${local}:00+07:00`);
  return Number.isNaN(d.getTime()) ? "" : `${THAI_WHEN.format(d)} น.`;
}

function formatCtaBaht(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Number.isInteger(n)
    ? n.toLocaleString("en-US")
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color?: string;
  slug?: string | null;
}

export interface ExpenseFormValues {
  id?: string;
  amount: number | null;
  occurredAt: string; // datetime-local value, Bangkok time
  payeeName: string;
  categoryId: string | null;
  memo: string | null;
}

/** One form for review, edit and manual entry. `lowFields` are painted plate-yellow so the eye goes there first. */
export function ExpenseForm({
  action,
  values,
  categories,
  submitLabel,
  confirm = false,
  stickyAction = false,
  redirectTo,
  lowFields = [],
  children,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  values: ExpenseFormValues;
  categories: CategoryOption[];
  submitLabel: string;
  confirm?: boolean;
  stickyAction?: boolean;
  redirectTo?: string;
  lowFields?: ("amount" | "occurredAt" | "payeeName")[];
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [amountText, setAmountText] = useState(values.amount !== null ? String(values.amount) : "");
  const [when, setWhen] = useState(values.occurredAt);
  const [categoryId, setCategoryId] = useState(values.categoryId ?? "");
  const idBase = useId();
  const mark = (f: (typeof lowFields)[number]) => (lowFields.includes(f) ? "border-plate-deep bg-plate-soft" : "");
  // Colour alone is not enough: unsure fields also say so in their label (read out with the field name).
  const unsure = (f: (typeof lowFields)[number]) =>
    lowFields.includes(f) ? <span className="font-semibold text-warn"> · ไม่แน่ใจ ตรวจอีกครั้ง</span> : null;

  const ctaBaht = formatCtaBaht(amountText);
  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (confirm) playScanCompleteTone("ok");
      }}
      className="space-y-4"
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {confirm && <input type="hidden" name="intent" value="confirm" />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">ยอด (บาท){unsure("amount")}</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            className={`input num ${mark("amount")}`}
          />
        </label>
        <label className="block">
          <span className="label">วันเวลา{unsure("occurredAt")}</span>
          <input
            name="occurredAt"
            type="datetime-local"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-describedby={`${idBase}-when`}
            className={`input ${mark("occurredAt")}`}
          />
          {/* The native picker follows the browser's locale; this line always reads in Thai with the B.E. year. */}
          <span id={`${idBase}-when`} className="mt-1.5 block text-sm text-ink-2" aria-live="polite">
            {thaiWhen(when)}
          </span>
        </label>
      </div>
      <label className="block">
        <span className="label">ผู้รับ / ร้าน{unsure("payeeName")}</span>
        <input name="payeeName" defaultValue={values.payeeName} maxLength={200} className={`input ${mark("payeeName")}`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">หมวด</span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">ยังไม่จัดหมวด</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">บันทึกช่วยจำ</span>
          <input name="memo" defaultValue={values.memo ?? ""} maxLength={300} className="input" />
        </label>
      </div>

      {/* Co-located 1-tap Chiang Mai songthaew route category preset chips directly above confirmation */}
      {categories.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-ink-3">เลือกสายหมวดด่วน (แตะครั้งเดียว)</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="เลือกสายหมวดด่วน">
            {categories.map((c) => {
              const selected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    playSplitFlapTick();
                    setCategoryId(selected ? "" : c.id);
                  }}
                  className={`chip ${selected ? "chip-on" : ""}`}
                >
                  {c.color ? (
                    <CategoryIcon icon={c.icon} slug={c.slug} color={c.color} size="sm" />
                  ) : (
                    <span aria-hidden className="size-2.5 rounded-full bg-chrome-dark" />
                  )}
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state.error && (
        <p role="alert" className="notice bg-red-soft text-red-deep">
          {state.error}
        </p>
      )}
      {state.ok && !confirm && (
        <p role="status" className="text-sm font-medium text-ok">
          บันทึกแล้ว
        </p>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 ${
          stickyAction
            ? "fluted-glass sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 -mx-4 border-t border-line px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:bg-none sm:p-0 sm:pt-2 sm:backdrop-blur-none"
            : "pt-2"
        }`}
      >
        <button disabled={pending} className="btn-primary flex-1 sm:flex-initial">
          {pending ? (
            "กำลังบันทึก…"
          ) : (
            <>
              <span>{submitLabel}</span>
              {ctaBaht && <span className="font-plate num">฿{ctaBaht}</span>}
              {selectedCategory && <span className="truncate">· {selectedCategory.name}</span>}
            </>
          )}
        </button>
        {children}
      </div>
    </form>
  );
}
