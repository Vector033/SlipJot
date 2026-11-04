import { getOptionalUser } from "@/lib/auth";
import { ensureSetup } from "@/lib/data";
import { LIMITS, enforce } from "@/lib/rate-limit";
import { MAX_SLIP_BYTES, isSameOrigin } from "@/lib/request-guard";
import { ingestSlip } from "@/lib/slips";
import { isDemoUser } from "@/lib/supabase/admin";

// Share target from the PWA manifest. Normally public/sw.js intercepts this POST and
// hands the files to the upload page. This handler only runs when the service worker
// is not active yet, and processes the shared images directly.
export const maxDuration = 60;

const MAX_SHARED = 10;

export async function POST(req: Request) {
  const to = (path: string) => Response.redirect(new URL(path, req.url), 303);
  if (!isSameOrigin(req, { allowNavigation: true })) return to("/app/upload?shared=error");
  const user = await getOptionalUser();
  if (!user) return to("/login");
  await ensureSetup(user.id);

  const fd = await req.formData().catch(() => null);
  const files = (fd?.getAll("slips") ?? []).filter((f): f is File => f instanceof File).slice(0, MAX_SHARED);
  let saved = 0;
  let review = 0;
  for (const file of files) {
    if (file.size > MAX_SLIP_BYTES) continue;
    try {
      await enforce(
        [LIMITS.uploadUserHour, user.id],
        [LIMITS.uploadUserDay, user.id],
        ...(isDemoUser(user.email) ? ([[LIMITS.uploadDemoDay, "demo"]] as const) : []),
      );
      const r = await ingestSlip(user.id, new Uint8Array(await file.arrayBuffer()));
      if (r.status === "saved") saved++;
      if (r.status === "review") review++;
    } catch (err) {
      // Rate limits, unreadable or unsafe files: skip that file, keep the rest.
      console.error("shared slip skipped:", err instanceof Error ? err.message.slice(0, 120) : "unknown");
    }
  }
  return to(review > 0 ? "/app/review" : `/app/expenses?added=${saved}`);
}
