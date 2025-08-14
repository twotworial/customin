<!-- file: /assets/icons/register-icons.js -->
<script>
(async () => {
  // helper tambah koleksi dari JSON lokal
  async function addCollectionFrom(path) {
    const res = await fetch(path, { cache: 'no-store' });
    const json = await res.json();
    // global Iconify sudah disediakan oleh iconify.min.js
    window.Iconify && Iconify.addCollection(json);
  }

  // daftar semua koleksi lokal yang dipakai
  addCollectionFrom('/assets/icons/mdi.json');
  addCollectionFrom('/assets/icons/fluent.json');
})();
</script>
