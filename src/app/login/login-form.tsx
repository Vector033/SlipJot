"use client";

import { useActionState, useState } from "react";
import { authAction, type AuthState } from "./actions";

export function LoginForm({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 rounded-xl bg-steel-2 p-1 text-sm" role="group" aria-label="เลือกการเข้าใช้">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`min-h-10 rounded-lg font-semibold transition-colors ${mode === m ? "bg-white text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
          >
            {m === "signin" ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
          </button>
        ))}
      </div>
      <input type="hidden" name="mode" value={mode} />
      <label className="block">
        <span className="label">อีเมล</span>
        <input name="email" type="email" required autoComplete="email" inputMode="email" className="input" />
      </label>
      <label className="block">
        <span className="label">รหัสผ่าน</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 10 : 8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          aria-describedby={mode === "signup" ? "pw-hint" : undefined}
          className="input"
        />
        {mode === "signup" && (
          <span id="pw-hint" className="mt-1.5 block text-sm text-ink-3">
            อย่างน้อย 10 ตัวอักษร และไม่ใช่รหัสที่เคยหลุดจากเว็บอื่น
          </span>
        )}
      </label>
      {state.error && (
        <p role="alert" className="notice bg-red-soft text-red-deep">
          {state.error}
        </p>
      )}
      {state.message && <p className="notice bg-steel-2" role="status">{state.message}</p>}
      <button disabled={pending} className="btn-primary w-full py-3">
        {pending ? "รอสักครู่…" : mode === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
      </button>
    </form>
  );
}
