"use client";

import { useActionState, useState } from "react";
import { PasswordInput, PasswordRules } from "@/components/password-input";
import { authAction, googleSignInAction, type AuthState } from "./actions";

export function LoginForm({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <div>
        <label htmlFor="login-password" className="label">
          รหัสผ่าน
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          required
          minLength={mode === "signup" ? 10 : 8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          aria-describedby={mode === "signup" ? "pw-rules" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "signup" && <PasswordRules id="pw-rules" value={password} email={email} />}
      </div>
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

/** "เข้าสู่ระบบด้วย Google". Its own form, so it can sit beside the email form. */
export function GoogleButton() {
  const [state, action, pending] = useActionState<AuthState>(googleSignInAction, {});
  return (
    <form action={action} className="space-y-2">
      <button disabled={pending} className="btn w-full py-3 text-base">
        <GoogleMark />
        {pending ? "กำลังเปิด Google…" : "เข้าสู่ระบบด้วย Google"}
      </button>
      {state.error && (
        <p role="alert" className="notice bg-red-soft text-red-deep">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** Google's four-colour "G", as their brand guidelines require for sign-in buttons. */
export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
