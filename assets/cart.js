(() => {
  const KEY = 'customin_cart';

  /* ---------- utils ---------- */
  const fmtIDR = n =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const $badges = () => document.querySelectorAll('[data-cart-count]');
  const $triggers = () => document.querySelectorAll('.js-cart-btn');

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    const count = items.reduce((n, i) => n + (i.qty || 1), 0);

    // update badge angka
    $badges().forEach(b => b.textContent = count);
    // toggle .has-items supaya CSS-mu menampilkan badge
    $triggers().forEach(t => t.classList.toggle('has-items', count > 0));

    document.dispatchEvent(new CustomEvent('cart:update', { detail: { items, count } }));
  };

  /* ---------- CRUD ---------- */
  const add = (item) => {
    const items = read();
    const idx = items.findIndex(x => x.slug === item.slug);
    if (idx > -1) items[idx].qty = (items[idx].qty || 1) + (item.qty || 1);
    else items.push({ slug: item.slug, title: item.title, price: item.price, cover: item.cover, qty: item.qty || 1 });
    write(items);
    render(); // kalau drawer sedang terbuka, langsung update
  };
  const inc = (slug) => {
    const items = read();
    const i = items.findIndex(x => x.slug === slug);
    if (i > -1) { items[i].qty = (items[i].qty || 1) + 1; write(items); render(); }
  };
  const dec = (slug) => {
    const items = read();
    const i = items.findIndex(x => x.slug === slug);
    if (i > -1) {
      items[i].qty = (items[i].qty || 1) - 1;
      if (items[i].qty <= 0) items.splice(i, 1);
      write(items); render();
    }
  };
  const remove = (slug) => { write(read().filter(x => x.slug !== slug)); render(); };
  const clear = () => { write([]); render(); };

  /* ---------- UI (drawer) ---------- */
  function ensureDrawer() {
    if (document.getElementById('cartDrawer')) return;
    const overlay = document.createElement('div');
    overlay.id = 'cartDrawerOverlay';

    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
      <div class="cart-head">
        <h3>Keranjang</h3>
        <button class="cart-close" type="button" aria-label="Tutup">
          <span class="iconify" data-icon="mdi:close"></span>
        </button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><b id="cartTotal">Rp 0</b></div>
        <div class="cart-actions">
          <button class="btn" id="cartClear" type="button">Hapus Semua</button>
          <button class="btn btn-primary" id="cartCheckout" type="button">Checkout via WhatsApp</button>
        </div>
      </div>
    `;
    document.body.append(overlay, drawer);

    // events
    overlay.addEventListener('click', close);
    drawer.querySelector('.cart-close').addEventListener('click', close);
    drawer.addEventListener('click', onDrawerClick);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function open() {
    ensureDrawer();
    render();
    document.getElementById('cartDrawerOverlay').classList.add('show');
    document.getElementById('cartDrawer').classList.add('show');
  }
  function close() {
    document.getElementById('cartDrawerOverlay')?.classList.remove('show');
    document.getElementById('cartDrawer')?.classList.remove('show');
  }

  function onDrawerClick(e) {
    const btn = e.target.closest('button,[data-act]');
    if (!btn) return;

    const act = btn.dataset.act || btn.id;
    const slug = btn.dataset.slug;

    if (act === 'inc') inc(slug);
    if (act === 'dec') dec(slug);
    if (act === 'del') remove(slug);
    if (act === 'cartClear' || act === 'cart-clear') clear();
    if (act === 'cartCheckout' || act === 'cart-checkout') checkoutWA();
  }

  function render() {
    const body = document.getElementById('cartBody');
    const totalEl = document.getElementById('cartTotal');
    if (!body || !totalEl) return;

    const items = read();
    if (!items.length) {
      body.innerHTML = `<div class="cart-empty">Keranjang masih kosong</div>`;
      totalEl.textContent = fmtIDR(0);
      return;
    }

    let total = 0;
    body.innerHTML = items.map(it => {
      const sub = (it.price || 0) * (it.qty || 1);
      total += sub;
      return `
        <div class="cart-item" data-slug="${it.slug}">
          <img src="${it.cover || ''}" alt="">
          <div>
            <div class="ci-name">${it.title || '-'}</div>
            <div class="ci-price">${fmtIDR(it.price || 0)}</div>
          </div>
          <div class="ci-qty">
            <button data-act="dec" data-slug="${it.slug}" aria-label="Kurangi">-</button>
            <span>${it.qty || 1}</span>
            <button data-act="inc" data-slug="${it.slug}" aria-label="Tambah">+</button>
            <button data-act="del" data-slug="${it.slug}" title="Hapus" style="margin-left:8px;">×</button>
          </div>
        </div>`;
    }).join('');

    totalEl.textContent = fmtIDR(total);
  }

  function checkoutWA() {
    const items = read();
    if (!items.length) { alert('Keranjang masih kosong.'); return; }
    const total = items.reduce((n,i)=>n + i.price * (i.qty||1), 0);

    const lines = [
      'Halo Customin.co, saya ingin order:',
      ...items.map(i => `- ${i.title} x ${i.qty} = ${fmtIDR(i.price * (i.qty||1))}`),
      `Total: ${fmtIDR(total)}`,
      '',
      'Nama:',
      'Alamat:',
      'Catatan:'
    ];
    const msg = encodeURIComponent(lines.join('\n'));
    // ganti no WA kalau perlu
    const waNumber = '628888085772';
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
  }

  /* ---------- hooks (open dari nav & refresh badge) ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-cart-btn,[data-open-cart]');
    if (btn) { e.preventDefault(); open(); }
  });

  // expose ke global untuk dipakai halaman katalog/detail
  window.Cart = {
    read, write, add, inc, dec, remove, clear, open, close
  };

  // boot
  write(read()); // set angka badge + class has-items awal
})();
