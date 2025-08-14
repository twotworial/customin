/* sw.js — App Shell + SWR + Image cache (scope-aware) */
const VERSION = 'v1-2025-08-14';
const APP_CACHE = `app-${VERSION}`;
const IMG_CACHE = `img-${VERSION}`;
const MAX_IMG_ENTRIES = 60;

/* ===== Scope-aware paths (custom domain / GitHub Pages) ===== */
const SCOPE_URL = new URL(self.registration.scope);
const BASE = SCOPE_URL.pathname.endsWith('/') ? SCOPE_URL.pathname : SCOPE_URL.pathname + '/';
const p = (path) => BASE + path.replace(/^\//, '');

/* Aset penting yang diprecache */
const OFFLINE_PAGES = [p(''), p('index.html')]; // '/' & 'index.html' untuk berjaga
const APP_ASSETS = [
  ...OFFLINE_PAGES,
  p('style.css'),
  p('assets/cart.css'),
  p('script.js'),
  p('assets/cart.js'),
  p('OG/Cover-Furniture-Custom-by-Customin.webp'),
  p('produk/foto/kursi-lipat.webp'),
];

/* ===== Install: precache app shell ===== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ===== Activate: clean old caches + enable navigation preload ===== */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== APP_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k))
    );
    // Navigation preload (lebih cepat saat online)
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

/* Util: batasi jumlah item image cache (FIFO simple) */
async function trimImageCache() {
  const cache = await caches.open(IMG_CACHE);
  let keys = await cache.keys();
  while (keys.length > MAX_IMG_ENTRIES) {
    await cache.delete(keys[0]);
    keys = await cache.keys();
  }
}

/* ===== Fetch strategy ===== */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // 1) Navigasi halaman -> network-first + preload, fallback ke cache ('/'/index.html)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) {
          // simpan untuk offline
          const cache = await caches.open(APP_CACHE);
          cache.put(req, preload.clone());
          return preload;
        }
        const fresh = await fetch(req);
        const cache = await caches.open(APP_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(APP_CACHE);
        // coba exact match dulu
        const cached = await cache.match(req);
        if (cached) return cached;
        // fallback ke halaman root/index
        for (const fallback of OFFLINE_PAGES) {
          const hit = await cache.match(fallback);
          if (hit) return hit;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // 2) CSS/JS -> stale-while-revalidate (tidak mengembalikan null)
  if (req.destination === 'style' || req.destination === 'script') {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const cached = await cache.match(req);
      // revalidate di background
      const revalidate = (async () => {
        try {
          const res = await fetch(req);
          if (res && res.status === 200) await cache.put(req, res.clone());
          return res;
        } catch {
          return null;
        }
      })();

      if (cached) {
        event.waitUntil(revalidate);
        return cached;
      }
      const fresh = await revalidate;
      return fresh || new Response('', { status: 504 });
    })());
    return;
  }

  // 3) Gambar -> cache-first (opaque allowed untuk cross-origin)
  if (req.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req, sameOrigin ? {} : { mode: 'no-cors' });
        if (res) {
          // simpan meskipun opaque
          await cache.put(req, res.clone());
          trimImageCache().catch(() => {});
          return res;
        }
      } catch {}
      return new Response('', { status: 504 });
    })());
    return;
  }

  // 4) Default -> cache-first, lalu network; simpan hanya same-origin
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.status === 200 && sameOrigin) {
        await cache.put(req, res.clone());
      }
      return res;
    } catch {
      return new Response('', { status: 504 });
    }
  })());
});
