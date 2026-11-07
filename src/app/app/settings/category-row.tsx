"use client";

import { useActionState, useState } from "react";
import { CATEGORY_ICONS, ICON_LABELS_TH, iconKeyFor, type CategoryIconKey } from "@/components/category-icon";
import { saveCategoryAction, type FormState } from "../actions";

export interface CategoryRowValues {
  id?: string;
  slug?: string | null;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number | null;
}

const KEYS = Object.keys(CATEGORY_ICONS) as CategoryIconKey[];

export function CategoryRow({ c, children }: { c: CategoryRowValues; children?: React.ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategoryAction, {});
  const [icon, setIcon] = useState<CategoryIconKey>(iconKeyFor(c.icon, c.slug) ?? "other");
  const [color, setColor] = useState(c.color);
  const [open, setOpen] = useState(false);
  const Icon = CATEGORY_ICONS[icon];

  return (
    <form action={action} className="py-3">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <input type="hidden" name="icon" value={icon} />
      <div className="flex flex-wrap items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`ไอคอน: ${ICON_LABELS_TH[icon]} (กดเพื่อเปลี่ยน)`}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-line bg-white transition-colors hover:border-ink"
          style={{ color: `color-mix(in oklab, ${color} 82%, black)` }}
        >
          <Icon className="size-5" aria-hidden />
        </button>
        <label className="size-11 shrink-0">
          <span className="sr-only">สีหมวด</span>
          <input
            name="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 w-11 cursor-pointer rounded-xl border-2 border-line bg-white p-1"
          />
        </label>
        <label className="min-w-36 flex-1">
          <span className="sr-only">ชื่อหมวด</span>
          <input name="name" defaultValue={c.name} required maxLength={40} className="input" placeholder="ชื่อหมวดใหม่" />
        </label>
        <label className="w-32">
          <span className="mb-1 block text-xs text-ink-3">งบ/เดือน (บาท)</span>
          <input name="monthlyBudget" inputMode="numeric" defaultValue={c.monthlyBudget ?? ""} placeholder="ไม่ตั้ง" className="input num" />
        </label>
        <button disabled={pending} className="btn">
          {c.id ? "บันทึก" : "เพิ่มหมวด"}
        </button>
        {children}
      </div>
      {open && (
        <fieldset className="mt-3 rounded-xl bg-steel p-2">
          <legend className="sr-only">เลือกไอคอน</legend>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {KEYS.map((k) => {
              const I = CATEGORY_ICONS[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setIcon(k);
                    setOpen(false);
                  }}
                  aria-pressed={k === icon}
                  aria-label={ICON_LABELS_TH[k]}
                  className={`flex aspect-square items-center justify-center rounded-lg transition-colors ${k === icon ? "bg-ink text-white" : "bg-white text-ink-2 hover:text-ink"}`}
                >
                  <I className="size-5" aria-hidden />
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {state.error && <p role="alert" className="mt-2 text-sm text-red-deep">{state.error}</p>}
      {state.ok && (
        <p role="status" className="mt-2 text-xs font-medium text-ok">
          บันทึกแล้ว
        </p>
      )}
    </form>
  );
}
