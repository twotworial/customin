/* sw.js — App Shell + SWR + Image cache
   Catatan:
   - Jika situs pakai custom domain (customin.co), register('/sw.js')
   - Jika GitHub Project Pages (username.github.io/repo), register('./sw.js')
*/
const VERSION = 'v1-2025-08-11';
const APP_CACHE = `app-${VERSION}`;
const IMG_CACHE = `img-${VERSION}`;
const MAX_IMG_ENTRIES = 60;

const APP_ASSETS = [
  '/',                           // beranda sbg fallback offline
  '/style.css',
  '/assets/cart.css',
  '/script.js',
  '/assets/cart.js',
  '/OG/Cover-Furniture-Custom-by-Customin.webp',
  '/produk/foto/kursi-lipat.webp'
  // Tambahkan aset penting lain bila perlu
];

// --- Install: precache app shell ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// --- Activate: bersihkan cache lama ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== APP_CACHE && k !== IMG_CACHE)
        .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Util kecil: batasi jumlah item image cache
async function trimImageCache() {
  const cache = await caches.open(IMG_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_IMG_ENTRIES) {
    await cache.delete(keys[0]); // simple FIFO
  }
}

// --- Fetch strategy ---
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Abaikan non-GET
  if (req.method !== 'GET') return;

  // 1) Navigasi halaman -> network-first dengan fallback cache "/"
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        // Optionally, simpan ke cache untuk offline
        const cache = await caches.open(APP_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cache = await caches.open(APP_CACHE);
        const cached = await cache.match(req);
        return cached || cache.match('/');
      }
    })());
    return;
  }

  // 2) CSS/JS -> stale-while-revalidate di APP_CACHE
  if (req.destination === 'style' || req.destination === 'script') {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        // Hanya simpan jika OK
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || fetchPromise || new Response('', { status: 504 });
    })());
    return;
  }

  // 3) Gambar -> cache-first di IMG_CACHE
  if (req.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req, { mode: 'no-cors' }); // izinkan opaque cross-origin (Unsplash, CDN)
        // res bisa opaque; tetap disimpan untuk offline
        if (res) {
          cache.put(req, res.clone());
          trimImageCache().catch(()=>{});
          return res;
        }
      } catch (err) {}
      // fallback kosong
      return new Response('', { status: 504 });
    })());
    return;
  }

  // 4) Default -> coba cache dulu, lalu network
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.status === 200 && url.origin === location.origin) {
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return new Response('', { status: 504 });
    }
  })());
});
