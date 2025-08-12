<script>
// ===== Util =====
const ID = (s) => document.getElementById(s);
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const monthID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmtDate = iso => {
  const d = new Date(iso.replace(/-/g,'/')); // iOS-safe
  return `${String(d.getDate()).padStart(2,'0')} ${monthID[d.getMonth()]} ${d.getFullYear()}`;
};

// ===== Render dari JSON =====
(async function initBlog(){
  const grid = ID('grid');
  const q = ID('q');
  const cat = ID('catSelect');
  const tag = ID('tagSelect');
  const crumbCurrent = ID('crumbCurrent');

  try {
    const res = await fetch('/blog/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal memuat posts.json');
    const data = await res.json();
    let posts = (data.posts||[]).filter(p => !p.draft);

    // sort terbaru dulu
    posts.sort((a,b)=> new Date(b.date) - new Date(a.date));

    // populate kategori & tag jika belum ada
    if (cat && cat.options.length <= 1) {
      const cats = Array.from(new Set(posts.map(p=>p.category))).sort();
      cats.forEach(c => cat.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    }
    if (tag && tag.options.length === 0) {
      const tags = Array.from(new Set(posts.flatMap(p=>p.tags||[]))).sort();
      tags.forEach(t => tag.insertAdjacentHTML('beforeend', `<option value="${t}">${t}</option>`));
    }

    // baca URL params
    const params = new URLSearchParams(location.search);
    if (q && params.get('q')) q.value = params.get('q');
    if (cat && params.get('kategori')) cat.value = params.get('kategori');
    if (tag && params.get('tag')) {
      const arr = params.get('tag').split(',').map(decodeURIComponent);
      qsa('option', tag).forEach(o => { if (arr.includes(o.value)) o.selected = true; });
    }

    const syncURL = (kategori, tags, keyword) => {
      const p = new URLSearchParams();
      if (keyword) p.set('q', keyword);
      if (kategori && kategori !== '*') p.set('kategori', kategori);
      if (tags.length) p.set('tag', tags.join(','));
      history.replaceState(null,'', p.toString()?`?${p.toString()}`:location.pathname);
    };

    const render = (list) => {
      if (!grid) return;
      grid.innerHTML = list.map(p => {
        const href = `/blog/${p.slug}.html`;
        const tags = (p.tags||[]).map(t=>`<span class="tag"><span class="iconify" data-icon="mdi:tag-outline"></span>${t}</span>`).join('');
        const dateHuman = fmtDate(p.date);
        return `
          <article class="post-card" data-kategori="${p.category||''}" data-tags="${(p.tags||[]).join(',')}">
            <a class="post-img" href="${href}" title="${p.title}">
              <img src="${p.cover}" alt="${p.coverAlt||p.title}" width="320" height="160" loading="lazy" decoding="async">
            </a>
            <div class="post-content">
              <h2 class="post-title"><a href="${href}">${p.title}</a></h2>
              <div class="post-meta"><time datetime="${p.date}">${dateHuman}</time><span class="dot"></span><span>${p.readMin||3} menit</span><span class="dot"></span><span>${p.category||''}</span></div>
              <p class="post-excerpt">${p.description||''}</p>
              <div class="post-tags">${tags}</div>
            </div>
          </article>`;
      }).join('');
    };

    const apply = () => {
      const keyword = (q?.value||'').trim().toLowerCase();
      const kategori = cat ? cat.value : '*';
      const tags = tag ? [...tag.selectedOptions].map(o=>o.value) : [];
      const filtered = posts.filter(p => {
        const title = (p.title||'').toLowerCase();
        const matchQ = !keyword || title.includes(keyword);
        const matchK = (kategori==='*') || p.category===kategori;
        const matchT = tags.length===0 || tags.some(x => (p.tags||[]).includes(x));
        return matchQ && matchK && matchT;
      });
      if (crumbCurrent) {
        const tagTrail = tags.length ? ' · ' + tags.map(t=>`#${t}`).join(', ') : '';
        crumbCurrent.textContent = (kategori==='*' ? 'Blog' : `Blog › ${kategori}`) + tagTrail;
      }
      render(filtered);
      syncURL(kategori, tags, keyword);
    };

    // initial
    render(posts);
    apply();

    q && q.addEventListener('input', apply);
    cat && cat.addEventListener('change', apply);
    tag && tag.addEventListener('change', apply);

  } catch (e) {
    console.error(e);
    if (ID('grid')) {
      ID('grid').innerHTML = `<div style="padding:12px;border:1px solid #eee;border-radius:12px;background:#fff;">Tidak bisa memuat daftar artikel. Coba refresh.</div>`;
    }
  }
})();
</script>
