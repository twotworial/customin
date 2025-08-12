// IG slider (swipe only) + popup menu (robust)
(() => {
  /* ===== 1) IG slider ===== */
  const slider = document.getElementById('igSlider');
  const track  = document.getElementById('igTrack');
  const dotsEl = document.getElementById('igDots');
  const slides = track ? Array.from(track.children) : [];
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let index = 0, timer;

  if (slider && track && slides.length && dotsEl) {
    // dots
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Ke slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });

    const slideWidth = () => slider.clientWidth;

    function updateDots(){
      [...dotsEl.children].forEach((d, i)=> d.setAttribute('aria-current', i===index ? 'true' : 'false'));
    }

    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: index * slideWidth(), behavior: 'smooth' });
      updateDots();
    }

    // sync saat geser manual
    let rafId = 0;
    track.addEventListener('scroll', ()=> {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / slideWidth());
        if (i !== index){ index = i; updateDots(); }
      });
    }, { passive:true });

    // jaga posisi saat resize
    window.addEventListener('resize', ()=> goTo(index), { passive:true });

    // autoplay (pause saat hover/focus, hormati reduce motion)
    function start(){ if(!reduce) timer = setInterval(()=> goTo(index + 1), 4500); }
    function stop(){ if (timer) clearInterval(timer); }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin',  stop);
    slider.addEventListener('focusout', start);

    start();
    updateDots();
  }

  /* ===== 2) Popup menu ===== */
  const menuBtn = document.getElementById('menuButton');
  const popup   = document.getElementById('popupMenu');

  if (popup && !popup.innerHTML.trim()) {
    popup.innerHTML = `
      <ul>
        <li><a href="/produk/"><span class="iconify" data-icon="mdi:table-furniture"></span>Produk</a></li>
        <li><a href="/blog/"><span class="iconify" data-icon="mdi:newspaper-variant-outline"></span>Blog</a></li>
        <li><a href="/kontak.html"><span class="iconify" data-icon="mdi:phone-outline"></span>Kontak</a></li>
      </ul>`;
  }

  let open = false;
  function setOpen(val){
    open = (typeof val === 'boolean') ? val : !open;
    if (!popup) return;
    popup.classList.toggle('show', open);
    popup.setAttribute('aria-hidden', String(!open));
    menuBtn?.setAttribute('aria-expanded', String(open));
  }
  function closePopup(){ setOpen(false); }

  // toggle via click
  menuBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen();
  });

  // klik di luar -> tutup
  document.addEventListener('click', (e) => {
    if (!open || !popup) return;
    if (!popup.contains(e.target) && !menuBtn?.contains(e.target)) closePopup();
  }, { passive:true });

  // ESC -> tutup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) closePopup();
  });

})();
