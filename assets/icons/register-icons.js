<!-- file: /assets/icons/register-icons.js -->
<script>
(() => {
  // 0) Matikan network loader Iconify (jaga-jaga kalau ada ikon yg belum terdaftar)
  //    Semua request ke provider "" akan langsung di-abort (tidak ada fetch eksternal).
  if (window.Iconify && Iconify._api && typeof Iconify._api.setAPIModule === 'function') {
    Iconify._api.setAPIModule('', {
      prepare: () => [],                                 // tidak ada request yang disiapkan
      send: (_host, _payload, done) => done('abort', 424) // selalu abort
    });
  }

  // 1) Pause observer supaya Iconify tidak scan DOM & memicu loader sebelum koleksi lokal siap
  try { Iconify.pauseObserver(); } catch(_) {}

  const FILES = [
    '/assets/icons/mdi.json',
    '/assets/icons/fluent.json'
  ];

  const fetchJson = (path) =>
    fetch(path, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} saat load ${path}`);
        return r.json();
      });

  Promise.all(FILES.map(fetchJson))
    .then(jsons => {
      jsons.forEach(json => {
        try { Iconify.addCollection(json); }
        catch (e) { console.error('Iconify.addCollection gagal:', e); }
      });
    })
    .catch(err => {
      console.error('Gagal memuat koleksi ikon lokal:', err);
    })
    .finally(() => {
      // 2) Lanjutkan observer & paksa scan setelah koleksi sudah ditambahkan
      try {
        Iconify.resumeObserver();
        Iconify.scan();
      } catch(_) {}
    });
})();
</script>
