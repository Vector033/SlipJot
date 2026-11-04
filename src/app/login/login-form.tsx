"use client";

import { useActionState, useState } from "react";
import { authAction, type AuthState } from "./actions";

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 rounded-xl bg-line/60 p-1 text-sm" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-2 ${mode === m ? "bg-white font-semibold shadow-sm" : "text-ink-2"}`}
          >
            {m === "signin" ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
          </button>
        ))}
      </div>
      <input type="hidden" name="mode" value={mode} />
      <label className="block">
        <span className="label">อีเมล</span>
        <input name="email" type="email" required autoComplete="email" className="input" />
      </label>
      <label className="block">
        <span className="label">รหัสผ่าน</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="input"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.message && <p className="text-sm text-accent-strong">{state.message}</p>}
      <button disabled={pending} className="btn-primary w-full py-3">
        {pending ? "รอสักครู่…" : mode === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
      </button>
    </form>
  );
}
