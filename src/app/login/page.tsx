import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { demoEmail } from "@/lib/supabase/admin";
import { DemoButton } from "./demo-button";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-10 self-start">
        <Logo />
      </Link>
      <h1 className="mb-2 text-2xl font-semibold">สลิปเข้า รายจ่ายออก</h1>
      <p className="mb-6 text-ink-2">เข้าสู่ระบบเพื่อดูว่าเดือนนี้เงินไปไหน</p>
      <LoginForm />
      {demoEmail() && (
        <div className="mt-6 border-t border-line pt-6">
          <DemoButton />
        </div>
      )}
      <p className="mt-6 text-sm text-ink-3">
        รูปสลิปถูกลบหลังอ่านเสร็จ เก็บเลขบัญชีแค่ 4 ตัวท้าย และลบข้อมูลทั้งหมดได้เองจากหน้าตั้งค่า
      </p>
    </main>
  );
}
