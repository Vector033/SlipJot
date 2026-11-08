"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { passwordRules } from "@/lib/password";

/**
 * A password field with a show/hide button. The button is a real <button> whose name
 * says what it will do; it never submits the form, and the field stays focused.
 */
export function PasswordInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <span className="relative block">
      <input
        {...props}
        type={shown ? "text" : "password"}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`input pr-12 ${className}`}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-ink-3 hover:text-ink"
      >
        {shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </span>
  );
}

/** Live checklist under a new-password field. Mirrors the server's rules. */
export function PasswordRules({ value, email, id }: { value: string; email?: string; id?: string }) {
  return (
    <ul id={id} className="mt-2 space-y-1 text-sm" aria-label="เงื่อนไขรหัสผ่าน">
      {passwordRules(value, email).map((r) => (
        <li key={r.label} className={`flex items-center gap-2 ${r.ok ? "text-ok" : "text-ink-3"}`}>
          <span
            aria-hidden
            className={`grid size-5 place-items-center rounded-full border-2 ${r.ok ? "border-ok bg-ok text-white" : "border-line"}`}
          >
            {r.ok && <Check className="size-3" strokeWidth={3} />}
          </span>
          {r.label}
          <span className="sr-only">{r.ok ? "(ผ่าน)" : "(ยังไม่ผ่าน)"}</span>
        </li>
      ))}
      <li className="text-ink-3">และต้องไม่ใช่รหัสที่เคยหลุดจากเว็บอื่น (ตรวจตอนกดบันทึก)</li>
    </ul>
  );
}
