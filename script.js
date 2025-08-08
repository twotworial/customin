// script.js
(() => {
  /* -------------------------
     1) SWIPER (autoplay + loop)
     ------------------------- */
  const sliderEl = document.querySelector('.main-slider');
  if (sliderEl && window.Swiper) {
    const paginationEl = sliderEl.querySelector('.swiper-pagination');
    new Swiper(sliderEl, {
      loop: true,
      speed: 600,
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: paginationEl, clickable: true }
    });
  }

  /* -------------------------
     2) POPUP MENU
     ------------------------- */
  const menuBtn = document.getElementById('menuButton');
  const popup = document.getElementById('popupMenu');

  // Isi menu (ubah sesuai kebutuhan)
  if (popup) {
    popup.innerHTML = `
      <ul>
        <li><a href="/kategori/kursi"><span class="iconify" data-icon="mdi:seat-outline"></span>Kategori Kursi</a></li>
        <li><a href="/kategori/meja"><span class="iconify" data-icon="mdi:table-furniture"></span>Kategori Meja</a></li>
        <li><a href="/promo"><span class="iconify" data-icon="mdi:tag-outline"></span>Promo</a></li>
        <li><a href="/kontak.html"><span class="iconify" data-icon="mdi:phone-outline"></span>Kontak</a></li>
      </ul>`;
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove('show');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    popup?.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', popup?.classList.contains('show') ? 'true' : 'false');
  });

  // Klik di luar, tutup
  document.addEventListener('click', (e) => {
    if (!popup?.classList.contains('show')) return;
    if (!popup.contains(e.target) && !menuBtn?.contains(e.target)) closePopup();
  });

  // Esc untuk tutup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
})();
