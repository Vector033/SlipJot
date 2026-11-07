"use client";

import { useActionState, useId, useState } from "react";
import type { FormState } from "@/app/app/actions";

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

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
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
  redirectTo,
  lowFields = [],
  children,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  values: ExpenseFormValues;
  categories: CategoryOption[];
  submitLabel: string;
  confirm?: boolean;
  redirectTo?: string;
  lowFields?: ("amount" | "occurredAt" | "payeeName")[];
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [when, setWhen] = useState(values.occurredAt);
  const idBase = useId();
  const mark = (f: (typeof lowFields)[number]) => (lowFields.includes(f) ? "border-plate-deep bg-plate-soft" : "");

  return (
    <form action={formAction} className="space-y-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {confirm && <input type="hidden" name="intent" value="confirm" />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">ยอด (บาท)</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            defaultValue={values.amount ?? ""}
            className={`input num ${mark("amount")}`}
          />
        </label>
        <label className="block">
          <span className="label">วันเวลา</span>
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
        <span className="label">ผู้รับ / ร้าน</span>
        <input name="payeeName" defaultValue={values.payeeName} maxLength={200} className={`input ${mark("payeeName")}`} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">หมวด</span>
          <select name="categoryId" defaultValue={values.categoryId ?? ""} className="input">
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
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button disabled={pending} className="btn-primary">
          {pending ? "กำลังบันทึก…" : submitLabel}
        </button>
        {children}
      </div>
    </form>
  );
}
