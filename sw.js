const CACHE_NAME = "eduhub-shell-v65";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/termos.html",
  "/privacidade.html",
  "/css/tailwind.css",
  "/css/app.css?v=54",
  "/css/lexend.css",
  "/css/material-symbols.css",
  "/js/data.js?v=55",
  "/js/router.js?v=56",
  "/js/pages-core.js?v=55",
  "/js/pages-extra.js?v=65",
  "/js/pages-more.js?v=55",
  "/js/sound-manager.js?v=53",
  "/js/security-utils.js?v=54",
  "/js/supabase.js?v=57",
  "/js/ai-service.js?v=65",
  "/js/app.js?v=65",
  "/js/vendor/supabase.js",
  "/js/vendor/purify.min.js",
  "/js/vendor/mathjax.js",
  "/js/vendor/pdf.min.js",
  "/js/vendor/pdf.worker.min.js",
  "/js/vendor/mammoth.browser.min.js",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/css/") ||
    pathname.startsWith("/js/") ||
    pathname === "/manifest.json" ||
    pathname.endsWith(".html")
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shellFallback = await cache.match("/index.html");
    if (shellFallback) return shellFallback;

    return new Response(
      "<!doctype html><html><body><h1>Offline</h1><p>Sem conexao e sem cache local disponivel.</p></body></html>",
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      }
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    const isCodeAsset = url.pathname.startsWith("/js/") || url.pathname.startsWith("/css/");
    event.respondWith(isCodeAsset ? networkFirst(event.request) : cacheFirst(event.request));
  }
});
