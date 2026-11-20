// Service worker básico. Funciona em subpasta (GitHub Pages).
// Chamadas ao Supabase (outra origem) nunca são guardadas em cache.
const CACHE = "farmacia-basica-v2";
const BASE = self.registration.scope; // termina com "/"
const SHELL = ["", "login/", "manifest.json", "logo.png", "icons/icon-192.png"].map((p) => BASE + p);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (url.pathname.includes("/_next/static/") || url.pathname.includes("/icons/") || SHELL.includes(url.href))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match(BASE + "login/")))
  );
});
