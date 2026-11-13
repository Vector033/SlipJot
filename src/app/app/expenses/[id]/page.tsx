import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BANK_NAMES_TH, type BankCode } from "@slipjot/slip-reader";
import { ExpenseForm } from "@/components/expense-form";
import { toLocalInput } from "@/lib/core/format";
import { monthKeyOf } from "@/lib/core/month";
import { getCategories, getExpense } from "@/lib/data";
import { deleteExpenseAction, saveExpenseAction } from "../../actions";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ThaiPhrases } from "@/components/thai-phrases";

export const metadata: Metadata = { title: "แก้ไขรายการ" };

const bank = (code: string | null) => (code ? (BANK_NAMES_TH[code as BankCode] ?? code) : null);

export default async function ExpensePage({ params }: PageProps<"/app/expenses/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row, cats] = await Promise.all([getExpense(id), getCategories()]);
  if (!row) notFound();
  const e = row.expense;
  const back = `/app/expenses?month=${monthKeyOf(e.occurredAt)}`;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <Link href={back} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> กลับไปที่รายการ
      </Link>
      <h1 className="text-2xl font-bold">แก้ไขรายการ</h1>
      <div className="board paper-texture overflow-x-clip">
        <div className="board-head">
          <span>รายละเอียดรายการ</span>
          <span className="meta whitespace-nowrap">{e.status === "review" ? "รอตรวจ" : "บันทึกแล้ว"}</span>
        </div>
        <div className="p-4 sm:p-5">
          <ExpenseForm
            action={saveExpenseAction}
            confirm={e.status === "review"}
            redirectTo={back}
            values={{
              id: e.id,
              amount: e.amount > 0 ? e.amount : null,
              occurredAt: toLocalInput(e.occurredAt),
              payeeName: e.payeeName,
              categoryId: e.categoryId,
              memo: e.memo,
            }}
            categories={cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, slug: c.slug }))}
            submitLabel={e.status === "review" ? "ยืนยันและบันทึก" : "บันทึก"}
            stickyAction
          >
            <ConfirmDelete
              action={deleteExpenseAction}
              label="ลบรายการ"
              confirmLabel="ลบรายการนี้ถาวร"
              note="ย้อนกลับไม่ได้"
              className="ml-auto"
            />
          </ExpenseForm>
          <p className="mt-3 text-xs text-ink-3">
            <ThaiPhrases text="เปลี่ยนหมวดแล้ว| ครั้งหน้าที่จ่ายให้ผู้รับนี้| ระบบจะใช้หมวดที่คุณเลือก" />
          </p>
        </div>
      </div>

      <section className="board paper-texture overflow-hidden" aria-label="ข้อมูลจากสลิป">
        <div className="board-head">
          <span>ข้อมูลสลิปและธนาคาร</span>
          <span className="meta whitespace-nowrap">อ้างอิง</span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 p-5 text-sm">
          <dt className="text-ink-3">ธนาคารผู้รับ</dt>
          <dd>{[bank(e.payeeBank), e.payeeLast4 && `••${e.payeeLast4}`].filter(Boolean).join(" ") || "–"}</dd>
          <dt className="text-ink-3">จากบัญชี</dt>
          <dd>{[bank(e.senderBank), e.senderLast4 && `••${e.senderLast4}`].filter(Boolean).join(" ") || "–"}</dd>
          <dt className="text-ink-3">เลขอ้างอิง</dt>
          <dd className="num break-all">{e.reference ?? "–"}</dd>
          <dt className="text-ink-3">อ่านโดย</dt>
          <dd className="num">
            {e.readSource === "gemini" ? "Gemini" : e.readSource === "ocr" ? "OCR" : e.readSource === "local-llm" ? "LLM ในเครื่อง" : "เพิ่มเอง"}
            {e.confidence !== null && ` · มั่นใจ ${Math.round(e.confidence * 100)}%`}
          </dd>
          <dt className="text-ink-3">รูปสลิป</dt>
          <dd>
            {row.hasImage ? (
              <a href={`/api/slips/${e.id}/image`} target="_blank" className="font-semibold text-red underline">
                เปิดดู
              </a>
            ) : (
              "ลบแล้ว"
            )}
          </dd>
        </dl>
      </section>
    </div>
  );
}
