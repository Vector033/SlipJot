import "server-only";

// CSRF guard for route handlers (server actions already get Next's own origin check).
// A cross-site page can make a browser POST here with the user's cookies; these checks
// make the server refuse anything that did not come from SlipJot's own pages.

/**
 * True when the request came from our own origin. `allowNavigation` also accepts a
 * top-level navigation with no initiator (`Sec-Fetch-Site: none`), which is what the
 * OS share sheet produces when it opens the share target without the service worker.
 */
export function isSameOrigin(req: Request, { allowNavigation = false } = {}): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site === "same-origin") return true;
  if (allowNavigation && site === "none") return true;
  if (site && site !== "same-origin") return false;
  // Older browsers without Fetch Metadata: fall back to the Origin header.
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const MAX_SLIP_BYTES = 10 * 1024 * 1024;
