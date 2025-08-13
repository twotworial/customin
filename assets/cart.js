<script>
(() => {
  const STORAGE_KEY = 'customin_cart_v1';
  const WA_NUMBER   = '628888085772';

  const fmtIDR   = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
  const parseIDR = s => Number(String(s).replace(/[^0-9]/g,'')||0);

  const Cart = {
    _subscribers: [],
    _load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch{ return []; } },
    _save(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); this._emit(); },
    _emit(){
      const count = this.count();
      document.querySelectorAll('[data-cart-count]').forEach(el=>{
        el.textContent = count;
        el.closest('.js-cart-btn, .mini-nav-btn, a, button')?.classList.toggle('has-items', count>0);
      });
      this._subscribers.forEach(fn=>fn(this.items()));
    },
    subscribe(fn){ this._subscribers.push(fn); fn(this.items()); },

    items(){ return this._load(); },
    count(){ return this._load().reduce((a,b)=> a + (b.qty||1), 0); },
    total(){ return this._load().reduce((a,b)=> a + (b.qty||1)*(b.price||0), 0); },

    // --- normalisasi agar slug/title/cover juga diterima ---
    _normalize(item){
      const id    = item.id    ?? item.slug;
      const name  = item.name  ?? item.title  ?? 'Produk';
      const image = item.image ?? item.cover  ?? '';
      const price = Number(item.price||0);
      const qty   = Math.max(1, Number(item.qty||1));
      return { id, name, image, price, qty };
    },

    add(raw){
      const item = this._normalize(raw);
      if (!item.id) return; // butuh id/slug
      const items = this._load();
      const i = items.findIndex(x => x.id === item.id);
      if (i>-1) items[i].qty = (items[i].qty||1) + item.qty;
      else items.push(item);
      this._save(items);
    },
    update(id, qty){
      qty = Math.max(1, Number(qty||1));
      this._save(this._load().map(i => i.id===id ? {...i, qty} : i));
    },
    remove(id){ this._save(this._load().filter(i=>i.id!==id)); },
    clear(){ localStorage.removeItem(STORAGE_KEY); this._emit(); },

    open(){ ensureDrawer(); render(); showDrawer(true); },
    close(){ showDrawer(false); },

    checkoutWA(){
      const items = this.items();
      if(!items.length) return;
      const lines = items.map(i=>`• ${i.name} x${i.qty} — ${fmtIDR(i.price*i.qty)}`);
      const text  = encodeURIComponent(
        `Halo Customin.co,%0ASaya ingin order:%0A${lines.join('%0A')}%0A%0ATotal: ${fmtIDR(this.total())}%0A%0AAlamat: %0AMetode Bayar: `
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
    }
  };

  // expose global
  window.Cart = Cart;

  // ---------- Drawer ----------
  function ensureDrawer(){
    if(document.getElementById('cartDrawer')) return;

    const overlay = document.createElement('div');
    overlay.id='cartDrawerOverlay';
    overlay.addEventListener('click', ()=>Cart.close());
    document.body.appendChild(overlay);

    const box = document.createElement('div');
    box.id='cartDrawer';
    box.innerHTML = `
      <div class="cart-head">
        <h3>Keranjang</h3>
        <button class="cart-close" aria-label="Tutup"><span class="iconify" data-icon="mdi:close"></span></button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><strong id="cartTotal">Rp 0</strong></div>
        <div class="cart-actions">
          <button class="btn" id="clearCart">Hapus Semua</button>
          <button class="btn btn-primary" id="checkoutWA">Checkout via WhatsApp</button>
        </div>
      </div>`;
    document.body.appendChild(box);

    box.querySelector('.cart-close').addEventListener('click', ()=>Cart.close());
    box.querySelector('#clearCart').addEventListener('click', ()=>{ Cart.clear(); render(); });
    box.querySelector('#checkoutWA').addEventListener('click', ()=>Cart.checkoutWA());
  }

  function showDrawer(show){
    document.getElementById('cartDrawer')?.classList.toggle('show', show);
    document.getElementById('cartDrawerOverlay')?.classList.toggle('show', show);
  }

  function render(){
    const body = document.getElementById('cartBody');
    const totalEl = document.getElementById('cartTotal');
    if(!body || !totalEl) return;

    const items = Cart.items();
    if(!items.length){
      body.innerHTML = `<div class="cart-empty">Keranjang kosong.</div>`;
    }else{
      body.innerHTML = items.map(i=>`
        <div class="cart-item" data-id="${i.id}">
          <img src="${i.image||''}" alt="${i.name}">
          <div>
            <div class="ci-name">${i.name}</div>
            <div class="ci-qty">
              <button class="ci-dec" aria-label="Kurangi">−</button>
              <span class="ci-val">${i.qty}</span>
              <button class="ci-inc" aria-label="Tambah">+</button>
            </div>
          </div>
          <div class="ci-price">${fmtIDR((i.price||0)*(i.qty||1))}</div>
        </div>`).join('');
    }
    totalEl.textContent = fmtIDR(Cart.total());

    body.querySelectorAll('.cart-item').forEach(row=>{
      const id = row.dataset.id;
      row.querySelector('.ci-dec').onclick = ()=>{ Cart.update(id, Number(row.querySelector('.ci-val').textContent)-1); render(); };
      row.querySelector('.ci-inc').onclick = ()=>{ Cart.update(id, Number(row.querySelector('.ci-val').textContent)+1); render(); };
      row.querySelector('.ci-price').ondblclick = ()=>{ Cart.remove(id); render(); };
    });
  }

  // ---------- Delegasi global ----------
  document.addEventListener('click', (e)=>{
    // buka drawer dari ikon/cart button
    const openBtn = e.target.closest('.js-cart-btn');
    if (openBtn){ e.preventDefault(); Cart.open(); return; }

    // tombol Order
    const addBtn = e.target.closest('[data-add="cart"]');
    if (addBtn){
      e.preventDefault();
      // ambil dataset (fallback: cari harga terdekat)
      const dataset = addBtn.dataset || {};
      const payload = {
        id:    dataset.id    ?? dataset.slug,
        name:  dataset.name  ?? dataset.title  ?? addBtn.getAttribute('aria-label'),
        image: dataset.image ?? dataset.cover  ?? '',
        price: dataset.price ? Number(dataset.price) : parseIDR(addBtn.closest('.product-card')?.querySelector('.price')?.textContent||'0'),
        qty:   dataset.qty ? Number(dataset.qty) : 1
      };
      Cart.add(payload);

      // feedback kecil
      const t = addBtn.textContent;
      addBtn.textContent = 'Ditambahkan ✓'; addBtn.disabled = true;
      setTimeout(()=>{ addBtn.textContent = t; addBtn.disabled = false; }, 850);
      return;
    }
  }, {passive:false});

  // bootstrap
  document.addEventListener('DOMContentLoaded', ()=>{
    ensureDrawer();
    Cart._emit();  // set badge awal
  });
})();
</script>
