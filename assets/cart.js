/* assets/cart.js – keranjang + badge + WA checkout + hook tombol Order */
(function(){
  const STORAGE_KEY = 'customin_cart_v1';

  const fmtIDR = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
  const parseIDR = s => Number(String(s||'').replace(/[^0-9]/g,'')||0);

  const Cart = {
    _subscribers: [],
    _load(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
      catch{ return []; }
    },
    _save(items){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      this._emit();
    },
    _emit(){
      const count = this.count();
      document.querySelectorAll('[data-cart-count]').forEach(el=>{
        el.textContent = count;
        el.closest('.js-cart-btn, .mini-nav-btn, .nav-item, a, button')
          ?.classList.toggle('has-items', count>0);
      });
      this._subscribers.forEach(fn=>fn(this.items()));
    },
    subscribe(fn){ this._subscribers.push(fn); fn(this.items()); },

    items(){ return this._load(); },
    count(){ return this._load().reduce((a,b)=>a+(b.qty||0),0); },
    total(){ return this._load().reduce((a,b)=>a + (b.qty||0)*(b.price||0), 0); },

    add(item){
      const items = this._load();
      const idx = items.findIndex(i => i.id === item.id);
      if(idx>-1){ items[idx].qty += item.qty||1; }
      else { items.push({...item, qty:item.qty||1}); }
      this._save(items);
    },
    update(id, qty){
      const items = this._load().map(i => i.id===id ? {...i, qty:Math.max(1, qty)} : i);
      this._save(items);
    },
    remove(id){
      const items = this._load().filter(i=>i.id!==id);
      this._save(items);
    },
    clear(){
      localStorage.removeItem(STORAGE_KEY);
      this._emit();
    },

    // biar bisa dipakai di bridge internal
    formatToNumber: parseIDR,

    open(){ ensureDrawer(); render(); showDrawer(true); },
    close(){ showDrawer(false); },
    checkoutWA(){
      const items = this.items();
      if(!items.length) return;
      const lines = items.map(i=>`• ${i.name} x${i.qty} — ${fmtIDR(i.qty*i.price)}`);
      const text = `Halo Customin.co,%0ASaya ingin order:%0A${lines.join('%0A')}%0A%0ATotal: ${fmtIDR(this.total())}%0A%0AAlamat: %0AMetode Bayar: `;
      const url = `https://wa.me/628888085772?text=${text}`;
      window.open(url,'_blank');
    }
  };
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
        <button class="cart-close" aria-label="Tutup">
          <span class="iconify" data-icon="mdi:close"></span>
        </button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total">
          <span>Total</span>
          <strong id="cartTotal">Rp 0</strong>
        </div>
        <div class="cart-actions">
          <button class="btn" id="clearCart">Hapus Semua</button>
          <button class="btn btn-primary" id="checkoutWA">Checkout via WhatsApp</button>
        </div>
      </div>`;
    document.body.appendChild(box);

    box.querySelector('.cart-close').addEventListener('click', ()=>Cart.close());
    document.getElementById('clearCart').addEventListener('click', ()=>{ Cart.clear(); render(); });
    document.getElementById('checkoutWA').addEventListener('click', ()=>Cart.checkoutWA());
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
          <img src="${i.image || ''}" alt="${i.name}">
          <div>
            <div class="ci-name">${i.name}</div>
            <div class="ci-qty">
              <button class="ci-dec" aria-label="Kurangi">−</button>
              <span class="ci-val">${i.qty}</span>
              <button class="ci-inc" aria-label="Tambah">+</button>
            </div>
          </div>
          <div class="ci-price">${fmtIDR(i.price * i.qty)}</div>
        </div>`).join('');
    }
    totalEl.textContent = fmtIDR(Cart.total());

    body.querySelectorAll('.cart-item').forEach(row=>{
      const id = row.dataset.id;
      row.querySelector('.ci-dec').addEventListener('click', ()=>{
        const cur = Number(row.querySelector('.ci-val').textContent); 
        Cart.update(id, Math.max(1, cur-1)); render();
      });
      row.querySelector('.ci-inc').addEventListener('click', ()=>{
        const cur = Number(row.querySelector('.ci-val').textContent);
        Cart.update(id, cur+1); render();
      });
      // Hapus cepat: double click harga
      row.querySelector('.ci-price').addEventListener('dblclick', ()=>{
        Cart.remove(id); render();
      });
    });
  }

  // ---------- Tombol global (ikon cart) ----------
  function bindGlobalButtons(){
    document.querySelectorAll('.js-cart-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        ensureDrawer(); render(); showDrawer(true);
      });
    });
  }

  // ---------- ADD-TO-CART dari tombol "Order" ----------
  const toNumber = t => Cart.formatToNumber ? Cart.formatToNumber(t) : parseIDR(t);

  function addFromCard(btn){
    const card  = btn.closest('.product-card');
    if(!card) return;
    const name  = (card.querySelector('.product-title')?.textContent || 'Produk').trim();
    const price = toNumber(card.querySelector('.product-price')?.textContent || '0');
    const img   = card.querySelector('.product-img img')?.getAttribute('src') || '';
    const id    = (name+'|'+price).toLowerCase().replace(/[^a-z0-9]+/g,'-');
    Cart.add({ id, name, price, image: img, qty: 1 });
  }

  function addFromDetail(btn){
    const name  = (document.querySelector('.pd-title')?.textContent || 'Produk').trim();
    const price = toNumber(document.querySelector('.pd-price')?.textContent || '0');

    // Qty dari .qty-value (span) atau <input name="qty">
    const qtyEl = document.querySelector('.qty-value') || document.querySelector('input[name="qty"]');
    const qty   = Number(qtyEl?.textContent || qtyEl?.value || 1) || 1;

    const img   = document.getElementById('mainProductImg')?.getAttribute('src') || '';
    const id    = (name+'|'+price).toLowerCase().replace(/[^a-z0-9]+/g,'-');
    Cart.add({ id, name, price, image: img, qty });
  }

  function bindOrderButtons(){
    // Listing (kartu produk)
    document.querySelectorAll('.product-card .order-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        addFromCard(btn);
        ensureDrawer(); render(); showDrawer(true);
      });
    });

    // Detail produk (pakai selector yang ada di halaman detail kamu)
    document.querySelectorAll('.pd-addcart-btn, .pd .order-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        addFromDetail(btn);
        ensureDrawer(); render(); showDrawer(true);
      });
    });
  }

  // ---------- Bootstrap ----------
  Cart.subscribe(()=>{ /* badge dihandle di _emit */ });

  document.addEventListener('DOMContentLoaded', ()=>{
    bindGlobalButtons();
    bindOrderButtons();     // penting!
    ensureDrawer();
    Cart._emit();           // refresh badge di awal
  });
})();
