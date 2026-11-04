import type { Metadata } from "next";
import { llmEnabled } from "@/lib/llm/categorize-llm";
import { Uploader } from "./uploader";

export const metadata: Metadata = { title: "ส่งสลิป" };

export default async function UploadPage({ searchParams }: PageProps<"/app/upload">) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold">ส่งสลิป</h1>
        <p className="mt-1 text-ink-2">
          ระบบอ่านยอด เวลา ผู้รับ แล้วจัดหมวดให้ รายการที่ไม่แน่ใจจะไปรอให้คุณตรวจก่อน
        </p>
      </header>
      {sp.shared === "error" && <p className="text-sm text-danger">รับรูปที่แชร์มาไม่สำเร็จ ลองเลือกจากอัลบั้มแทน</p>}
      <Uploader shared={sp.shared === "1"} />
      <p className="text-xs text-ink-3">
        {llmEnabled() ? "อ่านด้วย Gemini" : "อ่านด้วย OCR ในเซิร์ฟเวอร์ (ยังไม่ได้ตั้งค่า Gemini)"} · รูปที่บันทึกได้เลยจะไม่ถูกเก็บ
        รูปที่รอตรวจจะถูกลบเมื่อคุณยืนยัน หรือภายใน 7 วัน
      </p>
    </div>
  );
}
