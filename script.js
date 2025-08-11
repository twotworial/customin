// IG slider (swipe only) + popup menu
(() => {
  /* ===== 1) IG slider ===== */
  const slider = document.getElementById('igSlider');
  const track  = document.getElementById('igTrack');
  const slides = track ? Array.from(track.children) : [];
  const dotsEl = document.getElementById('igDots');
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let index = 0, timer;

  if (slider && track && slides.length) {
    // dots
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Ke slide ' + (i+1));
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });

    const slideWidth = () => slider.clientWidth;

    function updateDots(){
      [...dotsEl.children].forEach((d, i)=> d.setAttribute('aria-current', i===index?'true':'false'));
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: index * slideWidth(), behavior:'smooth' });
      updateDots();
    }

    // sync saat geser manual
    track.addEventListener('scroll', ()=> {
      const i = Math.round(track.scrollLeft / slideWidth());
      if(i !== index){ index = i; updateDots(); }
    }, { passive:true });

    // jaga posisi saat resize
    window.addEventListener('resize', ()=> goTo(index));

    // autoplay (pause saat hover/focus)
    function start(){ if(!reduce) timer = setInterval(()=> goTo(index+1), 4500); }
    function stop(){ clearInterval(timer); }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin',  stop);
    slider.addEventListener('focusout', start);

    start();
    updateDots();
  }

  /* ===== 2) Popup menu ===== */
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
    menuBtn?.setAttribute('aria-expanded', popup?.classList.contains('show') ? 'true' : 'false');
  }, { passive:true });

  document.addEventListener('click', (e) => {
    if (!popup?.classList.contains('show')) return;
    if (!popup.contains(e.target) && !menuBtn?.contains(e.target)) closePopup();
  }, { passive:true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
})();
