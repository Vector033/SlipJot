import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { SongthaewContours } from "@/components/songthaew-contours";
import { ThaiPhrases } from "@/components/thai-phrases";
import { demoEmail } from "@/lib/supabase/admin";
import { DemoButton } from "./demo-button";
import { googleEnabled } from "@/lib/site";
import { GoogleButton, LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      <div className="on-red songthaew-enamel relative overflow-hidden text-white lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"
        />
        <div className="relative z-10 mx-auto w-full max-w-md px-5 pt-5 pb-12 lg:mx-0 lg:max-w-none lg:px-12 lg:pt-10 lg:pb-24">
          <Link href="/" aria-label="SlipJot หน้าแรก" className="inline-flex min-h-11 items-center">
            <Logo tone="white" />
          </Link>
          <p className="sign mt-8 text-[2rem] sm:text-[2.6rem] lg:mt-24 lg:text-[3.2rem]">
            สลิปเข้า
            <br />
            <span className="text-plate">รายจ่ายออก</span>
          </p>
          <p className="mt-3 max-w-[36ch] text-on-red-2">
            <ThaiPhrases text="ส่งสลิปที่มีอยู่แล้วในอัลบั้ม| ที่เหลือ SlipJot จัดการให้" />
          </p>
          {/* The route a slip rides, stop by stop. Desktop only: on a phone the form comes first. */}
          <ol className="relative mt-16 hidden space-y-7 border-l-[3px] border-chrome/70 pl-7 lg:block" aria-label="สลิปผ่านอะไรบ้าง">
            {[
              ["ส่งสลิป", "เลือกหลายรูปจากอัลบั้ม| หรือแชร์จากแอปธนาคาร"],
              ["อ่าน", "ยอด วันเวลา ผู้รับ| ธนาคาร และบันทึกช่วยจำ"],
              ["ลงป้ายหมวด", "ร้านเดิมเข้าหมวดเดิม| ใบไหนไม่แน่ใจจะถามก่อน"],
              ["สรุปเดือน", "ยอดรวม หมวด| ร้านที่จ่ายบ่อย| และเตือนเมื่อใกล้เกินงบ"],
            ].map(([stop, what], i) => (
              <li key={stop} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-1.5 -left-[2.32rem] size-4 rounded-full border-[3px] ${i === 0 ? "border-ink bg-plate shadow-[0_0_0_3px_rgb(245_196_0/0.25)]" : "border-chrome/90 bg-red-deep"}`}
                />
                <p className="sign text-xl text-white">{stop}</p>
                <p className="mt-0.5 text-on-red-2">
                  <ThaiPhrases text={what} />
                </p>
              </li>
            ))}
          </ol>
        </div>
        <SongthaewContours
          variant="hero"
          density="rich"
          className="absolute inset-x-0 bottom-1 z-[1] h-28 w-full lg:h-48"
        />
        <div className="trim relative z-10" />
      </div>

      <div className="relative flex flex-1 items-start justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:items-center">
        <SongthaewContours
          variant="cabin"
          className="absolute inset-x-0 bottom-0 z-0 h-36 w-full opacity-75 lg:h-44"
        />
        <div className="board paper-texture relative z-10 w-full max-w-md overflow-hidden">
          <div className="board-head">
            <span className="text-sm font-semibold">ประตูขึ้นรถ · SlipJot</span>
            <span className="meta whitespace-nowrap">ลบรูปหลังตรวจ</span>
          </div>
          <div className="p-5 sm:p-7">
            <h1 className="text-2xl font-bold">ยินดีต้อนรับ</h1>
            <p className="mt-1 mb-6 text-ink-2">
              {googleEnabled() ? (
                <ThaiPhrases text="เข้าสู่ระบบด้วย Google หรืออีเมล| ครั้งแรกจะสร้างบัญชีให้" />
              ) : (
                <ThaiPhrases text="เข้าสู่ระบบ| หรือสร้างบัญชีใหม่ด้วยอีเมล" />
              )}
            </p>
            {sp.oauth && (
              <p role="alert" className="notice mb-4 bg-red-soft text-red-deep">
                {sp.oauth === "cancelled" ? "ยกเลิกการเข้าสู่ระบบด้วย Google แล้ว" : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง"}
              </p>
            )}
            {googleEnabled() && (
              <>
                <GoogleButton />
                <p className="my-5 flex items-center gap-3 text-sm text-ink-3" aria-hidden>
                  <span className="h-0.5 flex-1 bg-line" />
                  หรือใช้อีเมล
                  <span className="h-0.5 flex-1 bg-line" />
                </p>
              </>
            )}
            <LoginForm initialMode={sp.mode === "signup" ? "signup" : "signin"} />
            {demoEmail() && (
              <div className="mt-6 border-t-2 border-line pt-6">
                <DemoButton />
                <p className="mt-2 text-center text-sm text-ink-3">
                  <ThaiPhrases text="ข้อมูลสมมติ| ใช้ร่วมกับคนอื่น| ไม่ต้องสมัคร" />
                </p>
              </div>
            )}
            <p className="mt-7 border-t border-line pt-4 text-sm leading-relaxed text-ink-3">
              <ThaiPhrases text="รูปสลิปถูกลบหลังคุณยืนยันรายการ| เก็บเลขบัญชีแค่ 4 ตัวท้าย| และลบข้อมูลทั้งหมดได้เอง|จากหน้าตั้งค่า" />
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
