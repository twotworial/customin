// sw.js
const VERSION = 'v1.0.0'; // ganti tiap rilis biar cache ke-refresh
const ASSET_MATCHERS = [
  p => p.startsWith('/assets/'),
  p => /\.css(\?.*)?$/.test(p),
  p => /\.js(\?.*)?$/.test(p),
  p => /\.(png|jpe?g|webp|svg|gif|ico)(\?.*)?$/.test(p),
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)); // init cache
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const path = url.pathname;

  // Jangan cache HTML (biar always fresh dari server)
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) return;

  // Cache only assets yang match rule di atas
  const isAsset = ASSET_MATCHERS.some(fn => fn(path));
  if (!isAsset) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    const fetchPromise = fetch(req)
      .then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => cached);
    return cached || fetchPromise;
  })());
});
