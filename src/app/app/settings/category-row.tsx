"use client";

import { useActionState } from "react";
import { saveCategoryAction, type FormState } from "../actions";

export interface CategoryRowValues {
  id?: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number | null;
}

export function CategoryRow({ c, children }: { c: CategoryRowValues; children?: React.ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategoryAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-2 py-3">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <label className="w-14">
        <span className="sr-only">ไอคอน</span>
        <input name="icon" defaultValue={c.icon} maxLength={8} className="input px-2 text-center" aria-label="ไอคอน" />
      </label>
      <label className="w-11">
        <span className="sr-only">สี</span>
        <input name="color" type="color" defaultValue={c.color} className="h-11 w-11 cursor-pointer rounded-lg border border-line bg-white p-1" aria-label="สี" />
      </label>
      <label className="min-w-32 flex-1">
        <span className="sr-only">ชื่อหมวด</span>
        <input name="name" defaultValue={c.name} required maxLength={40} className="input" aria-label="ชื่อหมวด" placeholder="ชื่อหมวด" />
      </label>
      <label className="w-32">
        <span className="text-xs text-ink-3">งบ/เดือน (บาท)</span>
        <input
          name="monthlyBudget"
          inputMode="numeric"
          defaultValue={c.monthlyBudget ?? ""}
          placeholder="ไม่ตั้ง"
          className="input num"
          aria-label="งบต่อเดือน"
        />
      </label>
      <button disabled={pending} className="btn">
        {c.id ? "บันทึก" : "เพิ่ม"}
      </button>
      {children}
      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="w-full text-xs text-accent-strong">บันทึกแล้ว</p>}
    </form>
  );
}
