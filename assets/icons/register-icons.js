// file: /assets/icons/register-icons.js
(() => {
  const ICON_COLLECTIONS = [
    '/assets/icons/mdi.json',
    '/assets/icons/fluent.json'
  ];

  function fetchJson(path) {
    return fetch(path, { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} saat load ${path}`);
      return r.json();
    });
  }

  function addAll(collections) {
    // Iconify mungkin belum siap (walau <script> di-defer), jadi tunggu sebentar
    const ready = () => window.Iconify && typeof Iconify.addCollection === 'function';

    if (ready()) {
      collections.forEach(json => {
        try { Iconify.addCollection(json); }
        catch (e) { console.error('Iconify.addCollection gagal:', e); }
      });
      return;
    }

    let waited = 0;
    const step = 30;   // ms
    const max  = 3000; // ms
    const t = setInterval(() => {
      waited += step;
      if (ready()) {
        clearInterval(t);
        collections.forEach(json => {
          try { Iconify.addCollection(json); }
          catch (e) { console.error('Iconify.addCollection gagal:', e); }
        });
      } else if (waited >= max) {
        clearInterval(t);
        console.warn('Iconify belum siap setelah 3s; koleksi ikon belum terdaftar.');
      }
    }, step);
  }

  Promise.all(ICON_COLLECTIONS.map(fetchJson))
    .then(addAll)
    .catch(err => console.error('Gagal memuat koleksi ikon:', err));
})();
