<script>
(() => {
  const STORAGE_KEY = 'customin_cart_v1';

  const fmtIDR = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));

  // ---------- Helpers ----------
  const load  = () => { try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch{ return []; } };
  const save  = (items) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); emit(); };

  // Normalisasi item: dukung id/name/image atau slug/title/cover
  const normalize = (item) => {
    const id    = item?.id    ?? item?.slug;
    const name  = item?.name  ?? item?.title ?? id ?? 'Item';
    const price = Number(item?.price ?? item?.amount ?? 0);
    const image = item?.image ?? item?.cover ?? '';
    const qty   = Math.max(1, Number(item?.qty ?? 1));
    return { id, name, price, image, qty };
  };

  const items  = () => load();
  const count  = () => load().reduce((a,b)=> a + (Number(b.qty)||1), 0);
  const total  = () => load().reduce((a,b)=> a + (Number(b.qty)||1)*(Number(b.price)||0), 0);

  function emit(){
    const c = count();
    document.querySelectorAll('[data-cart-count]').forEach(b=>{
      b.textContent = c;
      b.closest('.js-cart-btn, .mini-nav-btn, a, button')?.classList.toggle('has-items', c>0);
    });
    document.dispatchEvent(new CustomEvent('cart:update', {detail:{items:load(), count:c}}));
  }

  // ---------- Public API ----------
  function add(itemRaw){
    const item = normalize(itemRaw);
    if(!item.id) return;
    const its = load();
    const i = its.findIndex(x => (x.id||x.slug) === item.id);
    if(i>-1){ its[i].qty = (Number(its[i].qty)||1) + item.qty; }
    else    { its.push(item); }
    save(its);
  }
  function update(id, qty){
    const its = load().map(i => ((i.id||i.slug)===id ? {...i, qty:Math.max(1, Number(qty)||1)} : i));
    save(its);
  }
  function inc(id){ const its=load(); const i=its.findIndex(x=>(x.id||x.slug)===id); if(i>-1){ its[i].qty=(Number(its[i].qty)||1)+1; save(its);} }
  function dec(id){ const its=load(); const i=its.findIndex(x=>(x.id||x.slug)===id); if(i>-1){ its[i].qty=Math.max(1,(Number(its[i].qty)||1)-1); save(its);} }
  function removeItem(id){ save(load().filter(i => (i.id||i.slug)!==id)); }
  function clear(){ localStorage.removeItem(STORAGE_KEY); emit(); }

  function checkoutWA(){
    const its = load();
    if(!its.length) return alert('Keranjang masih kosong.');
    const lines = its.map(i=>`• ${i.name} x${i.qty} — ${fmtIDR(i.price*i.qty)}`);
    const text  = encodeURIComponent(
      `Halo Customin.co,%0ASaya ingin order:%0A%0A${lines.join('%0A')}`+
      `%0A%0ATotal: ${fmtIDR(total())}%0A%0AAlamat:%0AMetode Bayar:`
    );
    window.open(`https://wa.me/628888085772?text=${text}`, '_blank');
  }

  // ---------- Drawer ----------
  function ensureDrawer(){
    if(document.getElementById('cartDrawer')) return;
    const overlay = document.createElement('div');
    overlay.id='cartDrawerOverlay';
    document.body.appendChild(overlay);

    const box = document.createElement('aside');
    box.id='cartDrawer'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
    box.innerHTML = `
      <div class="cart-head">
        <h3>Keranjang</h3>
        <button class="cart-close" aria-label="Tutup">&times;</button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><strong id="cartTotal">Rp 0</strong></div>
        <div class="cart-actions">
          <button class="btn" id="cartClear">Hapus Semua</button>
          <button class="btn btn-primary" id="cartCheckout">Checkout via WhatsApp</button>
        </div>
      </div>`;
    document.body.appendChild(box);

    overlay.addEventListener('click', close);
    box.querySelector('.cart-close').addEventListener('click', close);
    box.querySelector('#cartClear').addEventListener('click', ()=>{ clear(); render(); });
    box.querySelector('#cartCheckout').addEventListener('click', checkoutWA);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  }
  function open(){ ensureDrawer(); render(); document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartDrawerOverlay').classList.add('show'); }
  function close(){ document.getElementById('cartDrawer')?.classList.remove('show'); document.getElementById('cartDrawerOverlay')?.classList.remove('show'); }

  function render(){
    const body = document.getElementById('cartBody');
    const totalEl = document.getElementById('cartTotal');
    if(!body || !totalEl) return;

    const its = load();
    totalEl.textContent = fmtIDR(total());
    if(!its.length){ body.innerHTML = `<div class="cart-empty">Keranjang kosong.</div>`; return; }

    body.innerHTML = its.map(i=>`
      <div class="cart-item" data-id="${i.id||i.slug}">
        <img src="${i.image||i.cover||''}" alt="${i.name||i.title||''}">
        <div>
          <div class="ci-name">${i.name||i.title||i.id||i.slug}</div>
          <div class="ci-qty">
            <button data-act="dec" aria-label="Kurangi">−</button>
            <span class="ci-val">${i.qty||1}</span>
            <button data-act="inc" aria-label="Tambah">+</button>
            <button data-act="remove" class="ci-remove" title="Hapus">Hapus</button>
          </div>
        </div>
        <div class="ci-price">${fmtIDR((i.price||0)*(i.qty||1))}</div>
      </div>`).join('');
  }

  // ---------- Delegated events (robust) ----------
  // Buka drawer dari ikon/cart button
  document.addEventListener('click', (e)=>{
    const cartBtn = e.target.closest('.js-cart-btn');
    if(cartBtn){
      e.preventDefault();
      open();
    }
  });

  // Tambah ke cart dari tombol Order apa pun
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add="cart"]');
    if(!btn) return;
    e.preventDefault();
    const ds = btn.dataset;
    const item = normalize({
      id: ds.id || ds.slug,
      name: ds.name || ds.title || btn.getAttribute('aria-label'),
      price: ds.price,
      image: ds.image || ds.cover,
      qty: ds.qty
    });
    add(item);
    open();
    // feedback kecil
    btn.disabled = true;
    const txt = btn.textContent;
    btn.textContent = 'Ditambahkan ✓';
    setTimeout(()=>{ btn.disabled=false; btn.textContent = txt; }, 900);
  });

  // Aksi di dalam drawer (inc/dec/remove)
  document.addEventListener('click', (e)=>{
    const row = e.target.closest('.cart-item'); if(!row) return;
    const id = row.dataset.id;
    const act = e.target.getAttribute('data-act');
    if(!act) return;
    e.preventDefault();
    if(act==='inc')   inc(id);
    if(act==='dec')   dec(id);
    if(act==='remove') removeItem(id);
    render();
  });

  // Expose
  window.Cart = { items, count, total, add, update, inc, dec, remove: removeItem, clear, open, close, checkoutWA };

  // Bootstrap
  ensureDrawer();
  emit(); // set badge awal
})();
</script>
