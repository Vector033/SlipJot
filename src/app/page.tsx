import Link from "next/link";
import { ArrowRight, EyeOff, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { SongthaewContours } from "@/components/songthaew-contours";
import { SongthaewShader } from "@/components/songthaew-shader";
import { ThaiPhrases } from "@/components/thai-phrases";
import { getOptionalUser } from "@/lib/auth";
import { demoEmail } from "@/lib/supabase/admin";
import { DemoButton } from "./login/demo-button";
import { RouteBoardDemo } from "./route-board-demo";
import { RouteStops, Stop } from "./route-stops";

// Measured on the held-out synthetic set (eval/results/holdout-*.json): 40 fictional slips,
// 8 per bank layout, never used while tuning. Real slips have not been measured yet.
const ACCURACY = [
  { bank: "กสิกรไทย", ocr: 75, gemini: 100 },
  { bank: "ไทยพาณิชย์", ocr: 88, gemini: 100 },
  { bank: "กรุงเทพ", ocr: 100, gemini: 100 },
  { bank: "กรุงไทย", ocr: 100, gemini: 100 },
  { bank: "กรุงศรีฯ", ocr: 100, gemini: 100 },
];

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, sp] = await Promise.all([getOptionalUser(), searchParams]);
  const hasDemo = !!demoEmail() && !user;

  return (
    <main className="flex-1">
      {/* First viewport: the side of the truck */}
      <div className="on-red songthaew-enamel relative overflow-hidden text-white">
        <SongthaewShader />
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo tone="white" />
          <Link
            href={user ? "/app" : "/login"}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-white/40 px-4 text-sm font-semibold whitespace-nowrap hover:border-white"
          >
            {user ? "เปิดแอป" : "เข้าสู่ระบบ"}
          </Link>
        </header>

        {sp.deleted && (
          <p className="relative z-10 mx-auto mb-2 max-w-6xl px-4 text-sm font-semibold text-white sm:px-6 lg:px-8" role="status">
            ลบบัญชีและข้อมูลทั้งหมดแล้ว
          </p>
        )}

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pt-6 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-8 lg:pt-10 lg:pb-20">
          <div>
            {/* Thai has no spaces: line breaks are placed by hand between whole words. */}
            <h1 className="sign text-[2rem] min-[360px]:text-[2.5rem] sm:text-[3.4rem] lg:text-[3.75rem]">
              <span className="whitespace-nowrap">สลิปในอัลบั้ม</span>
              <br />
              <span className="text-plate">
                <span className="whitespace-nowrap">กลายเป็น</span>
                <wbr />
                <span className="whitespace-nowrap">รายจ่ายเอง</span>
              </span>
            </h1>
            <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-on-red-2">
              <ThaiPhrases text="ส่งรูปสลิปโอนเงิน|จากแอปธนาคาร| SlipJot| อ่านยอด เวลา ผู้รับ| แล้วพาไปลงหมวดให้| ใบไหนไม่แน่ใจ|จะถามคุณก่อนบันทึก" />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link href="/app/upload" className="btn-plate">
                  ส่งสลิป <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : hasDemo ? (
                <DemoButton onRed label="ลองดูบัญชีเดโม" />
              ) : (
                <Link href="/login" className="btn-plate">
                  เริ่มใช้งาน <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
              {!user && (
                <Link href="/login?mode=signup" className="btn-ghost-red">
                  สมัครแล้วส่งสลิปจริง
                </Link>
              )}
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-on-red-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white" aria-hidden />
              <span>
                <ThaiPhrases text="AI อ่านใน 2 วิ| · ใบไหนไม่แน่ใจถามคุณก่อนบันทึกเสมอ" />
                {hasDemo && (
                  <>
                    {" "}
                    <span className="inline-block opacity-90">· บัญชีเดโมใช้ข้อมูลสมมติ ไม่ต้องสมัคร</span>
                  </>
                )}
              </span>
            </p>
          </div>
          <RouteBoardDemo />
        </div>

        {/* #6 Single-Hue Landscape & #13 Contour Lines: clearly visible Chiang Mai mountain ridges & topographic lines. */}
        <SongthaewContours
          variant="hero"
          density="rich"
          className="absolute inset-x-0 bottom-1 z-[1] h-36 w-full sm:h-48"
        />

        <div className="trim relative z-10" />
      </div>

      <RouteStops>
        <Stop name="อ่านสลิปธนาคารหลัก" id="read">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="sign text-3xl sm:text-4xl">
                <ThaiPhrases text="อ่านสลิป|ธนาคารหลัก" />
              </h2>
              <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
                <ThaiPhrases text="ยอด วันเวลา| (แปลง พ.ศ. ให้)| ชื่อผู้รับ ธนาคาร| เลขบัญชี 4 ตัวท้าย| และบันทึกช่วยจำ| อ่านด้วย Gemini| และถ้าระบบ AI ล่ม|จะอ่านด้วย OCR ภาษาไทย|ในเซิร์ฟเวอร์แทน" />
              </p>
            </div>
            <div className="board paper-texture overflow-hidden">
              <table className="w-full text-left">
                <caption className="sr-only">ความแม่นยำต่อธนาคาร</caption>
                <thead className="border-b-2 border-red bg-ink text-sm text-white">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      ธนาคาร
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">
                      Gemini
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">
                      OCR สำรอง
                    </th>
                  </tr>
                </thead>
                <tbody className="rows">
                  {ACCURACY.map((r) => (
                    <tr key={r.bank}>
                      <th scope="row" className="px-4 py-3 font-medium">
                        {r.bank}
                      </th>
                      <td className="px-4 py-3 text-right">
                        <span className="num font-semibold">{r.gemini}%</span>
                      </td>
                      <td className="num px-4 py-3 text-right text-ink-2">{r.ocr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-line px-4 py-3 text-sm text-ink-3">
                <ThaiPhrases text="สลิปที่อ่านยอด วันเวลา| และผู้รับถูกครบ| จากสลิปทดสอบสังเคราะห์ 40 ใบ| (ข้อมูลสมมติ| ไม่เคยใช้ตอนปรับระบบ)| ยังไม่ได้วัดกับสลิปจริง" />
              </p>
            </div>
          </div>
        </Stop>

        <Stop name="ไม่แน่ใจ ถามก่อน" id="review">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="board paper-texture order-2 overflow-hidden p-5 lg:order-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircleQuestion className="size-4 text-red" aria-hidden /> รอคุณตรวจ 1 รายการ
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="label">ยอด (บาท)</p>
                  <p className="input num">55.00</p>
                </div>
                <div>
                  <p className="label">วันเวลา</p>
                  <p className="input">4 พ.ย. 2569 11:12</p>
                </div>
              </div>
              <p className="label mt-3">ผู้รับ / ร้าน</p>
              <p className="input border-plate-deep bg-plate-soft">ร้านข้าวมันไก่ป่าแดง</p>
              <p className="mt-2 text-sm text-warn">
                <ThaiPhrases text="ไม่แน่ใจ: ชื่อผู้รับ| · ตัวอย่าง (ข้อมูลสมมติ)" />
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="sign text-3xl sm:text-4xl">
                <ThaiPhrases text="ไม่แน่ใจ| ถามก่อน" />
              </h2>
              <p className="mt-4 max-w-[48ch] text-lg text-ink-2">
                <ThaiPhrases text="ใบไหนอ่านไม่ชัด| ยอดดูแปลก| หรือคล้ายสลิปที่ส่งไปแล้ว| จะไปรอให้คุณตรวจพร้อมรูป| ช่องที่ไม่แน่ใจมีแถบเหลือง| แก้แล้วกดยืนยันครั้งเดียว" />
              </p>
              <p className="mt-6 flex items-baseline gap-3">
                <span className="plate shrink-0 text-4xl">0%</span>
                <span className="text-ink-2">
                  <ThaiPhrases text="สลิปที่บันทึกผิดโดยไม่ถาม| ในชุดทดสอบ" />
                </span>
              </p>
            </div>
          </div>
        </Stop>

        <Stop name="ร้านเดิม หมวดเดิม" id="learn">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="sign text-3xl sm:text-4xl">
                <ThaiPhrases text="ร้านเดิม| หมวดเดิม" />
              </h2>
              <p className="mt-4 max-w-[50ch] text-lg text-ink-2">
                <ThaiPhrases text="ระบบดูจากร้านที่เคยจ่าย| บันทึกช่วยจำ| และชื่อร้าน| ก่อนจะถาม AI| แก้หมวดครั้งเดียว| ครั้งหน้าที่จ่ายร้านนั้น|ก็ลงหมวดที่ถูกเอง" />
              </p>
            </div>
            <ol className="space-y-3">
              {[
                { who: "ก๋วยเตี๋ยวเรือลุงชัย", how: "จำจากครั้งก่อน", where: "อาหาร" },
                { who: "นาย ณัฐพล วงศ์คำ · “คืนเงินค่าตั๋ว”", how: "จากบันทึกช่วยจำ", where: "โอนให้คน" },
                { who: "หอพักบ้านสวนนิมมาน", how: "จากชื่อร้าน", where: "ค่าหอ" },
              ].map((r) => (
                <li key={r.who} className="board paper-texture flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.who}</span>
                    <span className="text-sm text-ink-3">{r.how}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-ink-3" aria-hidden />
                  <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-sm font-semibold whitespace-nowrap text-white">
                    {r.where}
                  </span>
                </li>
              ))}
              <li className="px-1 pt-2 text-ink-2">
                <span className="plate-sm mr-2 text-lg">96.6%</span>
                <ThaiPhrases text="จัดหมวดได้โดยไม่ต้องเรียก AI| ในการจำลองใช้งาน 90 วัน" />
              </li>
            </ol>
          </div>
        </Stop>

        <Stop name="ข้อมูลของคุณ" id="privacy">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink text-white shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
            <span aria-hidden className="led-matrix-light pointer-events-none absolute inset-0 z-0 opacity-[0.045]" />
            <div className="relative z-10 px-6 pt-7 pb-5 sm:px-10 sm:pt-10">
              <h2 className="sign text-3xl sm:text-4xl">
                <ThaiPhrases text="ข้อมูลของคุณ| เป็นของคุณ" />
              </h2>
            </div>
            {/* The promises read like the stops on a route board: one per row, chrome between.
                "|" marks where a Thai title may wrap, between whole words. */}
            <dl className="relative z-10">
              {[
                {
                  t: "รูปสลิป|ถูกลบ",
                  d: "ลบทันทีเมื่อคุณยืนยันรายการ| หรือภายใน 7 วัน| เก็บไว้ได้ถ้าคุณเลือกเอง",
                  mark: <span className="plate-sm whitespace-nowrap text-sm">7 วัน</span>,
                },
                {
                  t: "เลขบัญชี|แค่ 4 ตัวท้าย",
                  d: "ตามที่สลิปแสดง| ระบบไม่เก็บเลขเต็ม| และลบข้อมูลตำแหน่ง|ในรูปก่อนอ่าน",
                  mark: <span className="plate-sm whitespace-nowrap text-base">••6884</span>,
                },
                {
                  t: "ไม่เชื่อม|บัญชีธนาคาร",
                  d: "อ่านแค่สิ่งที่พิมพ์บนรูป| ไม่ได้ตรวจสอบสลิป|กับธนาคาร",
                  mark: (
                    <span className="inline-block rounded-full border-2 border-white/40 px-2.5 py-0.5 text-sm whitespace-nowrap">
                      อ่านอย่างเดียว
                    </span>
                  ),
                },
                {
                  t: "เอาออกหรือลบ|ได้ทุกเมื่อ",
                  d: "ดาวน์โหลด CSV| หรือลบข้อมูลทั้งหมดได้|จากหน้าตั้งค่า",
                  mark: (
                    <span className="inline-block rounded-full border-2 border-white/40 px-2.5 py-0.5 text-sm whitespace-nowrap">
                      CSV
                    </span>
                  ),
                },
              ].map(({ t, d, mark }) => (
                <div
                  key={t}
                  className="trim-top grid gap-x-8 gap-y-1 px-6 pt-6 pb-5 sm:grid-cols-[16rem_1fr_auto] sm:items-center sm:px-10"
                >
                  <dt className="sign text-xl text-white">
                    {t.split("|").map((w, i) => (
                      <span key={i}>
                        {i > 0 && <wbr />}
                        <span className="whitespace-nowrap">{w}</span>
                      </span>
                    ))}
                  </dt>
                  <dd className="text-[0.95rem] leading-relaxed text-white/80">
                    <ThaiPhrases text={d} />
                  </dd>
                  <dd className="mt-2 sm:mt-0">{mark}</dd>
                </div>
              ))}
            </dl>
            <div className="trim relative z-10 opacity-60" />
            <p className="relative z-10 flex items-start gap-2 px-6 py-5 text-sm text-white/70 sm:items-center sm:px-10">
              <EyeOff className="mt-0.5 size-4 shrink-0 sm:mt-0" aria-hidden />
              <span>
                <ThaiPhrases text="SlipJot แสดงสถิติของคุณเองเท่านั้น| ไม่ใช่คำแนะนำทางการเงิน" />
              </span>
            </p>
          </div>
        </Stop>
      </RouteStops>

      <div className="on-red songthaew-enamel relative overflow-hidden text-white">
        <SongthaewContours
          variant="hero"
          density="subtle"
          className="absolute inset-x-0 bottom-0 z-0 h-32 w-full sm:h-40"
        />
        <div className="trim relative z-10" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <h2 className="sign text-3xl sm:text-4xl">
            <ThaiPhrases text="ลองกับข้อมูลสมมติ|ก่อนก็ได้" />
          </h2>
          <div className="flex flex-wrap gap-3">
            {hasDemo ? (
              <DemoButton onRed label="ลองดูบัญชีเดโม" />
            ) : (
              <Link href={user ? "/app" : "/login"} className="btn-plate">
                {user ? "เปิดแอป" : "เริ่มใช้งาน"} <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
        <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-8 text-xs text-on-red-2 sm:px-6 lg:px-8">
          <ThaiPhrases text="SlipJot เป็นโปรเจกต์ส่วนตัว| อ่านสลิปจากรูปเท่านั้น| ไม่ได้ยืนยันการโอนกับธนาคาร" />
        </footer>
      </div>
    </main>
  );
}
