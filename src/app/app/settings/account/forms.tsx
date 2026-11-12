"use client";

import { useActionState, useState } from "react";
import { PasswordInput, PasswordRules } from "@/components/password-input";
import { ThaiPhrases } from "@/components/thai-phrases";
import { GoogleMark } from "@/app/login/login-form";
import {
  changePasswordAction,
  linkGoogleAction,
  signOutOthersAction,
  unlinkGoogleAction,
  type AccountState,
} from "./actions";

function Result({ state }: { state: AccountState }) {
  if (state.error)
    return (
      <p role="alert" className="notice bg-red-soft text-red-deep">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="notice bg-plate-soft text-ink">
        {state.message}
      </p>
    );
  return null;
}

export function GoogleLinkButton() {
  const [state, action, pending] = useActionState<AccountState>(linkGoogleAction, {});
  return (
    <form action={action} className="space-y-2">
      <button disabled={pending} className="btn">
        <GoogleMark />
        {pending ? "กำลังเปิด Google…" : "เชื่อม Google"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function GoogleUnlinkButton({ blockedReason }: { blockedReason?: string }) {
  const [state, action, pending] = useActionState<AccountState>(unlinkGoogleAction, {});
  return (
    <form action={action} className="space-y-2">
      {blockedReason ? (
        <p className="text-sm text-ink-3">
          <ThaiPhrases text={blockedReason} />
        </p>
      ) : (
        // Two taps, like every other removal in the app.
        <details>
          <summary className="btn-danger cursor-pointer list-none [&::-webkit-details-marker]:hidden">ยกเลิกการเชื่อม</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-red-soft p-2.5 text-sm text-red-deep">
            <p className="min-w-0 flex-1 basis-48">จากนี้ต้องเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</p>
            <button disabled={pending} className="btn-primary min-h-10 px-4 text-sm">
              {pending ? "กำลังยกเลิก…" : "ยกเลิกการเชื่อม Google"}
            </button>
          </div>
        </details>
      )}
      <Result state={state} />
    </form>
  );
}

export function ChangePasswordForm({ hasPassword, email, disabled }: { hasPassword: boolean; email: string; disabled?: boolean }) {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  // Clear the new password once it is saved; keep it on an error so nothing is retyped.
  const [state, action, pending] = useActionState<AccountState, FormData>(async (prev, fd) => {
    const result = await changePasswordAction(prev, fd);
    if (result.message) {
      setNext("");
      setConfirm("");
    }
    return result;
  }, {});
  const mismatch = confirm.length > 0 && confirm !== next;

  return (
    <form action={action} className="max-w-md space-y-4">
      <fieldset disabled={disabled || pending} className="space-y-4 disabled:opacity-60">
        {/* Lets password managers file the new password under the right account. */}
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
        {hasPassword && (
          <div>
            <label htmlFor="current-password" className="label">
              รหัสผ่านปัจจุบัน
            </label>
            <PasswordInput id="current-password" name="current" required autoComplete="current-password" />
          </div>
        )}
        <div>
          <label htmlFor="new-password" className="label">
            {hasPassword ? "รหัสผ่านใหม่" : "รหัสผ่าน"}
          </label>
          <PasswordInput
            id="new-password"
            name="password"
            required
            minLength={10}
            autoComplete="new-password"
            aria-describedby="new-password-rules"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <PasswordRules id="new-password-rules" value={next} email={email} />
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">
            พิมพ์รหัสผ่านใหม่อีกครั้ง
          </label>
          <PasswordInput
            id="confirm-password"
            name="confirm"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
            aria-describedby={mismatch ? "confirm-hint" : undefined}
          />
          {mismatch && (
            <p id="confirm-hint" className="mt-1.5 text-sm text-red-deep">
              ยังไม่ตรงกับรหัสผ่านใหม่
            </p>
          )}
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink-2">
          <input type="checkbox" name="signOutOthers" defaultChecked className="mt-0.5 size-5 shrink-0 accent-red" />
          ออกจากระบบในเครื่องอื่นด้วย
        </label>
        <button className="btn-primary">
          {pending ? "กำลังบันทึก…" : hasPassword ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่าน"}
        </button>
      </fieldset>
      <Result state={state} />
    </form>
  );
}

export function SignOutOthersButton({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState<AccountState>(signOutOthersAction, {});
  return (
    <form action={action} className="space-y-2">
      <button disabled={disabled || pending} className="btn">
        {pending ? "กำลังออกจากระบบ…" : "ออกจากระบบทุกเครื่อง ยกเว้นเครื่องนี้"}
      </button>
      <Result state={state} />
    </form>
  );
}
