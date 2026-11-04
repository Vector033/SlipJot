import { getOptionalUser } from "@/lib/auth";
import { expensesToCsv } from "@/lib/core/csv";
import { exportRows } from "@/lib/data";
import { LIMITS, hit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return new Response(null, { status: 401 });
  const limit = await hit(LIMITS.exportUser, user.id);
  if (!limit.ok) return new Response("ดาวน์โหลดถี่เกินไป ลองใหม่ภายหลัง", { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } });
  const csv = expensesToCsv(await exportRows());
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="slipjot-${today}.csv"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
