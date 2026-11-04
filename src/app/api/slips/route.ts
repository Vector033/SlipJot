import { getOptionalUser } from "@/lib/auth";
import { ensureSetup, purgeExpiredImages } from "@/lib/data";
import { UnsafeImageError } from "@/lib/image-safety";
import { LIMITS, RateLimitError, enforce, retryText } from "@/lib/rate-limit";
import { MAX_SLIP_BYTES, isSameOrigin } from "@/lib/request-guard";
import { ingestSlip } from "@/lib/slips";
import { isDemoUser } from "@/lib/supabase/admin";

// One slip per request: the client loops over the selected files, so each read stays
// well inside serverless time limits and the UI can show progress per file.
export const maxDuration = 60;

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "cache-control": "private, no-store", ...headers } });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "คำขอไม่ได้มาจาก SlipJot" }, 403);
  const user = await getOptionalUser();
  if (!user) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

  // Refuse oversized bodies before reading them into memory.
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_SLIP_BYTES + 64 * 1024) return json({ error: "ไฟล์ใหญ่เกิน 10 MB" }, 413);

  try {
    await enforce(
      [LIMITS.uploadUserHour, user.id],
      [LIMITS.uploadUserDay, user.id],
      ...(isDemoUser(user.email) ? ([[LIMITS.uploadDemoDay, "demo"]] as const) : []),
    );
  } catch (err) {
    if (err instanceof RateLimitError) {
      return json({ error: `ส่งสลิปถี่เกินไป ลองใหม่ในอีก ${retryText(err.retryAfterSec)}` }, 429, {
        "retry-after": String(err.retryAfterSec),
      });
    }
    throw err;
  }

  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File)) return json({ error: "ไม่พบไฟล์" }, 400);
  if (file.size > MAX_SLIP_BYTES) return json({ error: "ไฟล์ใหญ่เกิน 10 MB" }, 413);

  await ensureSetup(user.id);
  try {
    return json(await ingestSlip(user.id, new Uint8Array(await file.arrayBuffer())));
  } catch (err) {
    if (err instanceof UnsafeImageError) return json({ error: err.message }, 415);
    console.error("slip ingest failed:", err instanceof Error ? err.message.slice(0, 200) : "unknown");
    return json({ error: "อ่านสลิปไม่สำเร็จ ลองใหม่อีกครั้ง" }, 500);
  } finally {
    purgeExpiredImages().catch(() => {});
  }
}
