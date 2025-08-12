// /assets/cart.js
(() => {
  const KEY = 'customin_cart';
  const WA_NUMBER = '628888085772';

  const $badges  = () => document.querySelectorAll('[data-cart-count]');
  const $buttons = () => document.querySelectorAll('.js-cart-btn');
  const fmtIDR = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);

  const read  = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } };
  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    const count = items.reduce((n,i)=> n + (i.qty||1), 0);

    // update angka
    $badges().forEach(b => b.textContent = count);

    // tampilkan badge (dua cara: di body & di tombol, supaya kompatibel)
    document.body.classList.toggle('has-items', count > 0);
    $buttons().forEach(btn => btn.classList.toggle('has-items', count > 0));

    document.dispatchEvent(new CustomEvent('cart:update',{detail:{items,count}}));
  };

  const add    = (item) => {
    const items = read();
    const idx = items.findIndex(x=>x.slug===item.slug);
    const delta = Math.max(1, (item.qty|0) || 1); // <- rename dari inc -> delta
    if (idx>-1) items[idx].qty = (items[idx].qty||1) + delta;
    else items.push({slug:item.slug,title:item.title,price:item.price,cover:item.cover,qty:delta});
    write(items);
  };
  const update = (slug, qty) => write(read().map(it => it.slug===slug ? {...it, qty:Math.max(1, qty)} : it));
  const inc    = (slug) => { const it=read(); const i=it.findIndex(x=>x.slug===slug); if(i>-1){ it[i].qty=(it[i].qty||1)+1; write(it);} };
  const dec    = (slug) => { const it=read(); const i=it.findIndex(x=>x.slug===slug); if(i>-1){ it[i].qty=Math.max(1,(it[i].qty||1)-1); write(it);} };
  const remove = (slug) => write(read().filter(i=>i.slug!==slug));
  const clear  = () => write([]);

  /* ---------- Drawer UI ---------- */
  function ensureDOM(){
    if (document.getElementById('cartDrawer')) return;
    const overlay = document.createElement('div'); overlay.id='cartDrawerOverlay';
    const drawer  = document.createElement('aside'); drawer.id='cartDrawer';
    drawer.setAttribute('role','dialog'); drawer.setAttribute('aria-modal','true');
    drawer.innerHTML = `
      <div class="cart-head">
        <h3>Keranjang</h3>
        <button class="cart-close" aria-label="Tutup">&times;</button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><span id="cartTotal">Rp 0</span></div>
        <div class="cart-actions">
          <button class="btn" id="cartClear">Hapus Semua</button>
          <button class="btn btn-primary" id="cartCheckout">Checkout via WhatsApp</button>
        </div>
      </div>`;
    document.body.append(overlay, drawer);
  }
  function openDrawer(){ ensureDOM(); render(); document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartDrawerOverlay').classList.add('show'); }
  function closeDrawer(){ document.getElementById('cartDrawer')?.classList.remove('show'); document.getElementById('cartDrawerOverlay')?.classList.remove('show'); }

  function render(){
    const items = read();
    const body  = document.getElementById('cartBody');
    if (!body) return;
    const total = items.reduce((s,i)=> s + (i.price||0)*(i.qty||1), 0);
    const totalEl = document.getElementById('cartTotal'); if (totalEl) totalEl.textContent = fmtIDR(total);

    if (!items.length){ body.innerHTML = `<div class="cart-empty">Keranjang kosong.</div>`; return; }
    body.innerHTML = items.map(i=>`
      <div class="cart-item" data-slug="${i.slug}">
        <img src="${i.cover||''}" alt="">
        <div>
          <div class="ci-name">${i.title||i.slug}</div>
          <div class="ci-price">${fmtIDR(i.price||0)}</div>
          <div class="ci-qty">
            <button type="button" data-act="dec">-</button>
            <span>${i.qty||1}</span>
            <button type="button" data-act="inc">+</button>
            <button type="button" class="ci-remove" data-act="remove" title="Hapus">Hapus</button>
          </div>
        </div>
        <div class="ci-sub">${fmtIDR((i.price||0)*(i.qty||1))}</div>
      </div>`).join('');
  }

  function checkoutWA(){
    const items = read();
    if(!items.length) return alert('Keranjang masih kosong.');
    const lines = items.map(i=>`• ${i.title} x${i.qty} — ${fmtIDR(i.price)} = ${fmtIDR(i.price*i.qty)}`);
    const total = items.reduce((s,i)=> s + i.price*i.qty, 0);
    const text = encodeURIComponent(
      `Halo Customin.co,\nSaya ingin order:\n\n${lines.join('\n')}\n\nTotal: ${fmtIDR(total)}\n\n(From: ${location.href})`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', (e)=>{
    const openBtn = e.target.closest('.js-cart-btn');
    if (openBtn){ e.preventDefault(); openDrawer(); return; }

    if (e.target.id === 'cartDrawerOverlay') { closeDrawer(); }
    if (e.target.closest('.cart-close')) { closeDrawer(); }

    const row = e.target.closest('.cart-item');
    if (row){
      const slug = row.dataset.slug;
      const act  = e.target.getAttribute('data-act');
      if (act==='inc'){ inc(slug); render(); }
      if (act==='dec'){ dec(slug); render(); }
      if (act==='remove'){ remove(slug); render(); }
    }

    if (e.target.id==='cartClear'){ clear(); render(); }
    if (e.target.id==='cartCheckout'){ checkoutWA(); }
  });

  document.addEventListener('cart:update', ()=>{
    const d = document.getElementById('cartDrawer');
    if (d?.classList.contains('show')) render();
  });

  // expose API
  window.Cart = { read, write, add, update, inc, dec, remove, clear, open: openDrawer, close: closeDrawer };

  // set badge awal
  write(read());
})();
