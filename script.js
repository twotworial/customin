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

  menuBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen();
  });

  document.addEventListener('click', (e) => {
    if (!open || !popup) return;
    if (!popup.contains(e.target) && !menuBtn?.contains(e.target)) closePopup();
  }, { passive:true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) closePopup();
  });

})();

/* ===== 3) Home: render 2 pos blog terbaru (tanpa excerpt & komentar) ===== */
(() => {
  const wrap = document.getElementById('homePosts'); // <div id="homePosts" class="posts-list"></div>
  if (!wrap) return;

  const fmt = (d) => {
    const dd = new Date(d);
    return isNaN(dd) ? '' : dd.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
  };

  (async () => {
    wrap.setAttribute('aria-busy', 'true');

    let posts = [];
    try {
      const res = await fetch('/blog/posts.json', { cache: 'no-store' });
      posts = await res.json();
    } catch (e) {
      console.error('Gagal load posts.json', e);
    }

    const top2 = posts
      .filter(p => p && (p.title || p.slug))
      .sort((a,b)=> new Date(b.date) - new Date(a.date))
      .slice(0, 2);

    wrap.innerHTML = top2.map(p => {
      const url   = p.url || `/blog/${p.slug}.html`;
      const tag   = p.category || 'Umum';
      const cover = p.cover || '/OG/Cover-Furniture-Custom-by-Customin.webp';

      return `
        <article class="post-card">
          <a class="post-cover" href="${url}">
            <img src="${cover}" alt="${p.coverAlt || p.title || ''}" loading="lazy" decoding="async">
          </a>
          <div class="post-content">
            <h2 class="post-title"><a href="${url}">${p.title || '(Tanpa judul)'}</a></h2>
            <div class="post-meta">
              ${p.date ? `<time datetime="${p.date}">${fmt(p.date)}</time>` : ''}
              <span class="dot"></span>
              <a class="pd-chip" href="/blog/?q=${encodeURIComponent(tag)}">
                <span class="iconify" data-icon="mdi:label-outline"></span><span class="chip-text">${tag}</span>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    wrap.removeAttribute('aria-busy');
    // Tidak memuat Disqus count karena komentar disembunyikan
  })();
})();
