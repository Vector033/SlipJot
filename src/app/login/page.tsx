import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { demoEmail } from "@/lib/supabase/admin";
import { DemoButton } from "./demo-button";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      <div className="on-red bg-red text-white lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
        <div className="mx-auto w-full max-w-md px-5 pt-5 pb-8 lg:mx-0 lg:max-w-none lg:px-12 lg:pt-10">
          <Link href="/" aria-label="SlipJot หน้าแรก" className="inline-flex">
            <Logo tone="white" />
          </Link>
          <p className="sign mt-8 text-[2rem] sm:text-[2.6rem] lg:mt-24 lg:text-[3.2rem]">
            สลิปเข้า
            <br />
            <span className="text-plate">รายจ่ายออก</span>
          </p>
          <p className="mt-3 max-w-[34ch] text-on-red-2">ส่งสลิปที่มีอยู่แล้วในอัลบั้ม ที่เหลือ SlipJot จัดการให้</p>
          {/* The route a slip rides, stop by stop. Desktop only: on a phone the form comes first. */}
          <ol className="relative mt-16 hidden space-y-7 border-l-[3px] border-chrome/70 pl-7 lg:block" aria-label="สลิปผ่านอะไรบ้าง">
            {[
              ["ส่งสลิป", "เลือกหลายรูปจากอัลบั้ม หรือแชร์จากแอปธนาคาร"],
              ["อ่าน", "ยอด วันเวลา ผู้รับ ธนาคาร และบันทึกช่วยจำ"],
              ["ลงป้ายหมวด", "ร้านเดิมเข้าหมวดเดิม ใบไหนไม่แน่ใจจะถามก่อน"],
              ["สรุปเดือน", "ยอดรวม หมวด ร้านที่จ่ายบ่อย และเตือนเมื่อใกล้เกินงบ"],
            ].map(([stop, what], i) => (
              <li key={stop} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-1.5 -left-[2.32rem] size-4 rounded-full border-[3px] ${i === 0 ? "border-ink bg-plate" : "border-chrome bg-red"}`}
                />
                <p className="sign text-xl text-white">{stop}</p>
                <p className="mt-0.5 text-on-red-2">{what}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="trim" />
      </div>

      <div className="flex flex-1 items-start justify-center px-5 py-10 lg:items-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold">ยินดีต้อนรับ</h1>
          <p className="mt-1 mb-6 text-ink-2">เข้าสู่ระบบ หรือสร้างบัญชีใหม่ด้วยอีเมล</p>
          <LoginForm initialMode={sp.mode === "signup" ? "signup" : "signin"} />
          {demoEmail() && (
            <div className="mt-6 border-t-2 border-line pt-6">
              <DemoButton />
              <p className="mt-2 text-center text-sm text-ink-3">ข้อมูลสมมติ ใช้ร่วมกับคนอื่น ไม่ต้องสมัคร</p>
            </div>
          )}
          <p className="mt-8 text-sm leading-relaxed text-ink-3">
            รูปสลิปถูกลบหลังคุณยืนยันรายการ เก็บเลขบัญชีแค่ 4 ตัวท้าย และลบข้อมูลทั้งหมดได้เองจากหน้าตั้งค่า
          </p>
        </div>
      </div>
    </main>
  );
}
