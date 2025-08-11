// script.js — slider + popup menu (rapih & a11y)
(() => {
  /* -------------------------
     1) SWIPER (autoplay + loop)
     ------------------------- */
  const sliderEl = document.querySelector('.main-slider');

  // Hormati setting prefers-reduced-motion
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (sliderEl && window.Swiper) {
    const paginationEl = sliderEl.querySelector('.swiper-pagination');

    new Swiper(sliderEl, {
      loop: true,
      speed: 600,
      autoplay: reduceMotion ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: paginationEl, clickable: true },
      a11y: { enabled: true }
    });
  }

  /* -------------------------
     2) POPUP MENU
     ------------------------- */
  const menuBtn = document.getElementById('menuButton');
  const popup = document.getElementById('popupMenu');

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
    menuBtn?.setAttribute('aria-expanded', 'false');
  }

  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    popup?.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', popup?.classList.contains('show') ? 'true' : 'false');
  }, { passive:true });

  // Klik di luar -> tutup
  document.addEventListener('click', (e) => {
    if (!popup?.classList.contains('show')) return;
    if (!popup.contains(e.target) && !menuBtn?.contains(e.target)) closePopup();
  }, { passive:true });

  // Esc -> tutup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
})();
