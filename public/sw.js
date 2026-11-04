// SlipJot service worker. Its one job: receive images shared from banking apps
// (Web Share Target, see app/manifest.ts) and hand them to the upload page.
// Shared files wait in Cache Storage only until the upload page picks them up.

const SHARE_CACHE = "slipjot-share";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(receiveShare(event.request));
  }
});

async function receiveShare(request) {
  try {
    const form = await request.formData();
    const files = form.getAll("slips").filter((f) => f instanceof File);
    const cache = await caches.open(SHARE_CACHE);
    const stamp = Date.now();
    await Promise.all(
      files.slice(0, 20).map((file, i) =>
        cache.put(
          `/shared/${stamp}-${i}`,
          new Response(file, { headers: { "content-type": file.type || "image/jpeg", "x-filename": encodeURIComponent(file.name || `slip-${i}.jpg`) } }),
        ),
      ),
    );
    return Response.redirect("/app/upload?shared=1", 303);
  } catch {
    return Response.redirect("/app/upload?shared=error", 303);
  }
}
