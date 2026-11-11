import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { ExpenseForm } from "@/components/expense-form";
import { toLocalInput } from "@/lib/core/format";
import { getCategories } from "@/lib/data";
import { createExpenseAction } from "../../actions";

export const metadata: Metadata = { title: "เพิ่มรายการเอง" };

export default async function NewExpensePage() {
  const cats = await getCategories();
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/app/expenses" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> กลับไปที่รายการ
      </Link>
      <h1 className="text-2xl font-bold">เพิ่มรายการเอง</h1>
      <p className="text-ink-2">สำหรับเงินสดหรือรายการที่ไม่มีสลิป</p>
      <div className="board p-4 sm:p-5">
        <ExpenseForm
          action={createExpenseAction}
          values={{ amount: null, occurredAt: toLocalInput(new Date()), payeeName: "", categoryId: null, memo: null }}
          categories={cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, slug: c.slug }))}
          submitLabel="เพิ่มรายการ"
          stickyAction
        />
      </div>
    </div>
  );
}
