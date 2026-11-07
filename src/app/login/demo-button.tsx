"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { demoLoginAction, type AuthState } from "./actions";

/** Opens the shared demo account in one tap. `onRed` is the landing's plate-yellow version. */
export function DemoButton({ onRed = false, label = "ลองดูด้วยบัญชีเดโม" }: { onRed?: boolean; label?: string }) {
  const [state, action, pending] = useActionState<AuthState>(demoLoginAction, {});
  return (
    <form action={action} className={onRed ? "" : "space-y-2"}>
      <button disabled={pending} className={onRed ? "btn-plate" : "btn w-full py-3 text-base"}>
        {pending ? "กำลังเปิดบัญชีเดโม…" : label}
        {!pending && <ArrowRight className="size-4" aria-hidden />}
      </button>
      {state.error && <p className={`mt-2 text-sm ${onRed ? "text-plate" : "text-danger"}`}>{state.error}</p>}
    </form>
  );
}
