// Pure helpers for sign-in flows, kept apart from server-only modules so they can be unit tested.

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null | undefined, fallback = "/app") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/** "Chrome on Windows" from a user agent; good enough to recognise your own devices. */
export function describeAgent(ua: string | null): { device: string; kind: "desktop" | "mobile" } {
  if (!ua) return { device: "อุปกรณ์ที่ไม่รู้จัก", kind: "desktop" };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : /node|undici|curl|python/i.test(ua)
              ? "Script"
              : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const kind = /Mobile|iPhone|Android/.test(ua) ? "mobile" : "desktop";
  return { device: os ? `${browser} บน ${os}` : browser, kind };
}
