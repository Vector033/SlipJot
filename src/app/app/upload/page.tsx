import type { Metadata } from "next";
import { ThaiPhrases } from "@/components/thai-phrases";
import { llmLabel } from "@/lib/llm/categorize-llm";
import { Uploader } from "./uploader";

export const metadata: Metadata = { title: "ส่งสลิป" };

export default async function UploadPage({ searchParams }: PageProps<"/app/upload">) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold">ส่งสลิป</h1>
        <p className="mt-1 leading-relaxed text-ink-2">
          <ThaiPhrases text="ระบบอ่านยอด เวลา ผู้รับ| แล้วจัดหมวดให้| รายการที่ไม่แน่ใจ|จะไปรอให้คุณตรวจก่อน" />
        </p>
      </header>
      {llmLabel() === "local" && (
        <p className="notice bg-red-soft text-red-deep" role="note">
          <strong>โหมดพัฒนา:</strong>{" "}
          <ThaiPhrases text="สลิปจะถูกส่งไป LLM ฟรี|ผ่าน FreeLLMAPI| ซึ่งอาจเก็บข้อมูลไว้| ใช้กับสลิปจำลองเท่านั้น| ห้ามใช้สลิปจริง" />
        </p>
      )}
      {sp.shared === "error" && (
        <p className="text-sm text-danger">
          <ThaiPhrases text="รับรูปที่แชร์มาไม่สำเร็จ| ลองเลือกจากอัลบั้มแทน" />
        </p>
      )}
      <Uploader shared={sp.shared === "1"} />
      <p className="paper-texture rounded-xl border border-line/70 bg-white/70 px-3.5 py-2.5 text-xs leading-relaxed text-ink-3">
        <span className="inline-block">
          {llmLabel() === "local"
            ? "อ่านด้วย LLM ฟรีในเครื่อง (โหมดพัฒนา)"
            : llmLabel() === "gemini"
              ? "อ่านด้วย Gemini"
              : "อ่านด้วย OCR ในเซิร์ฟเวอร์ (ยังไม่ได้ตั้งค่า Gemini)"}{" "}
          ·
        </span>{" "}
        <ThaiPhrases text="รูปที่บันทึกได้เลยจะไม่ถูกเก็บ| รูปที่รอตรวจจะถูกลบเมื่อคุณยืนยัน| หรือภายใน 7 วัน" />
      </p>
    </div>
  );
}
