import Link from "next/link";
import { Logo } from "@/components/logo";
import { getOptionalUser } from "@/lib/auth";

const steps = [
  { n: "1", title: "ส่งสลิปเข้ามา", body: "เลือกหลายรูปจากอัลบั้ม หรือกดแชร์จากแอปธนาคารมาที่ SlipJot ได้เลย" },
  { n: "2", title: "ระบบอ่านให้", body: "ยอด วันเวลา ผู้รับ ธนาคาร และบันทึกช่วยจำ ถ้าไม่แน่ใจจะถามคุณก่อนบันทึก" },
  { n: "3", title: "จัดหมวดเอง จำเอง", body: "ร้านเดิมเข้าหมวดเดิมทุกครั้ง แก้ครั้งเดียว ครั้งหน้าระบบจำได้" },
];

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, sp] = await Promise.all([getOptionalUser(), searchParams]);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <Link href={user ? "/app" : "/login"} className="btn">
          {user ? "เปิดแอป" : "เข้าสู่ระบบ"}
        </Link>
      </header>

      {sp.deleted && (
        <p className="mt-6 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-strong">ลบบัญชีและข้อมูลทั้งหมดแล้ว</p>
      )}

      <section className="py-14 sm:py-20">
        <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
          สลิปกองอยู่ในอัลบั้ม
          <br />
          <span className="bg-marker px-1">เงินหายไปไหน</span> ไม่มีใครรู้
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-2">
          SlipJot อ่านสลิปโอนเงินจากทุกธนาคาร บันทึกเป็นรายจ่าย จัดหมวดให้ และเตือนเมื่อใกล้เกินงบ ไม่ต้องพิมพ์เองสักบรรทัด
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={user ? "/app/upload" : "/login"} className="btn-primary px-6 py-3 text-base">
            เริ่มส่งสลิป
          </Link>
        </div>
      </section>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="card p-5">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{s.n}</span>
            <h2 className="mt-3 font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-2xl border border-dashed border-line p-5 text-sm text-ink-2">
        <h2 className="font-semibold text-ink">ข้อมูลของคุณ</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>รูปสลิปถูกลบทันทีหลังคุณตรวจรายการ (เลือกเก็บไว้ได้ถ้าต้องการ)</li>
          <li>เก็บเลขบัญชีแค่ 4 ตัวท้ายตามที่สลิปแสดง</li>
          <li>ไม่เชื่อมบัญชีธนาคาร และไม่ได้ตรวจสอบสลิปกับธนาคาร ระบบแค่อ่านสิ่งที่พิมพ์อยู่บนรูป</li>
          <li>Export เป็น CSV หรือลบข้อมูลทั้งหมดได้ทุกเมื่อ</li>
        </ul>
      </section>

      <footer className="mt-auto pt-12 text-xs text-ink-3">
        SlipJot แสดงสถิติการใช้จ่ายของคุณเอง ไม่ใช่คำแนะนำทางการเงิน
      </footer>
    </main>
  );
}
