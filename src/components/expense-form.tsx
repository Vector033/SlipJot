"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/app/actions";

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

/** One form for review, edit and manual entry. `lowFields` get a marker so the eye goes there first. */
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
  const mark = (f: (typeof lowFields)[number]) => (lowFields.includes(f) ? "border-warn bg-marker/30" : "");

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
            defaultValue={values.occurredAt}
            className={`input ${mark("occurredAt")}`}
          />
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
                {c.icon} {c.name}
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
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && !confirm && <p className="text-sm text-accent-strong">บันทึกแล้ว</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button disabled={pending} className="btn-primary">
          {pending ? "กำลังบันทึก…" : submitLabel}
        </button>
        {children}
      </div>
    </form>
  );
}
