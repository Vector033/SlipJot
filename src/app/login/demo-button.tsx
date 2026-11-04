"use client";

import { useActionState } from "react";
import { demoLoginAction, type AuthState } from "./actions";

export function DemoButton() {
  const [state, action, pending] = useActionState<AuthState>(demoLoginAction, {});
  return (
    <form action={action} className="space-y-2">
      <button disabled={pending} className="btn w-full py-3">
        {pending ? "กำลังเปิด…" : "ลองดูด้วยบัญชีเดโม (ข้อมูลสมมติ)"}
      </button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
