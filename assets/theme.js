/* ==========================================================================
   NOVORA — Theme interactivity
   Vanilla JS, no dependencies. Progressive enhancement.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const money = (cents) => {
    const fmt = window.Shopify && window.Shopify.currency ? window.Shopify.currency.active : 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: fmt }).format(cents / 100);
    } catch (e) {
      return '$' + (cents / 100).toFixed(2);
    }
  };
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  function bindReveals(ctx = document) {
    $$('[data-reveal]', ctx).forEach((el, i) => {
      if (!el.style.getPropertyValue('--reveal-delay')) {
        el.style.setProperty('--reveal-delay', (i % 6) * 70 + 'ms');
      }
      revealObserver.observe(el);
    });
  }

  /* ---------- Lazy media fade-in ---------- */
  function bindMediaFade(ctx = document) {
    $$('img.media-fade', ctx).forEach((img) => {
      if (img.complete) img.classList.add('is-loaded');
      else img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    });
  }

  /* ---------- Header scroll state ---------- */
  function initHeader() {
    const wrap = $('[data-header]');
    if (!wrap) return;
    const onScroll = () => { wrap.setAttribute('data-scrolled', window.scrollY > 24 ? 'true' : 'false'); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Hero parallax ---------- */
  function initParallax() {
    const media = $('[data-parallax]');
    if (!media || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.35, 260);
        media.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Generic drawer/overlay controller ---------- */
  const overlay = $('[data-overlay]');
  let openPanels = 0;
  function lockScroll(lock) { document.body.classList.toggle('no-scroll', lock); }
  function setOverlay() { if (overlay) overlay.setAttribute('data-active', openPanels > 0 ? 'true' : 'false'); }

  function openPanel(el) {
    if (!el) return;
    el.setAttribute('aria-hidden', 'false');
    el.setAttribute('data-active', 'true'); // modals use data-active for visibility
    openPanels++; setOverlay(); lockScroll(true);
    const focusable = el.querySelector('button, a, input');
    if (focusable) setTimeout(() => focusable.focus(), 100);
  }
  function closePanel(el) {
    if (!el || el.getAttribute('aria-hidden') === 'true') return;
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-active', 'false');
    openPanels = Math.max(0, openPanels - 1); setOverlay();
    if (openPanels === 0) lockScroll(false);
  }
  function closeAll() {
    $$('[aria-hidden="false"][data-panel]').forEach(closePanel);
  }
  if (overlay) overlay.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); openPanel($('#' + opener.getAttribute('data-open'))); }
    const closer = e.target.closest('[data-close]');
    if (closer) { e.preventDefault(); closePanel(closer.closest('[data-panel]')); }
  });

  /* ---------- Sliders (prev/next) ---------- */
  function initSliders() {
    $$('[data-slider]').forEach((slider) => {
      const track = $('[data-slider-track]', slider);
      const prev = $('[data-slider-prev]', slider);
      const next = $('[data-slider-next]', slider);
      if (!track) return;
      const step = () => Math.max(track.clientWidth * 0.8, 280);
      const update = () => {
        if (!prev || !next) return;
        prev.disabled = track.scrollLeft < 8;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      };
      if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
      track.addEventListener('scroll', update, { passive: true });
      update();
    });
  }

  /* ---------- Accordions ---------- */
  function initAccordions() {
    $$('.accordion__trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = btn.nextElementSibling;
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.style.maxHeight = expanded ? '0px' : panel.scrollHeight + 'px';
      });
    });
  }

  /* ---------- Countdown ---------- */
  function initCountdowns() {
    $$('[data-countdown]').forEach((el) => {
      let target = new Date(el.getAttribute('data-countdown')).getTime();
      if (isNaN(target) || target < Date.now()) {
        // fallback: rolling 3-day timer
        target = Date.now() + 1000 * 60 * 60 * 72;
      }
      const out = {
        d: $('[data-cd="days"]', el), h: $('[data-cd="hours"]', el),
        m: $('[data-cd="mins"]', el), s: $('[data-cd="secs"]', el)
      };
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => {
        let diff = Math.max(0, target - Date.now());
        const d = Math.floor(diff / 86400000); diff -= d * 86400000;
        const h = Math.floor(diff / 3600000); diff -= h * 3600000;
        const m = Math.floor(diff / 60000); diff -= m * 60000;
        const s = Math.floor(diff / 1000);
        if (out.d) out.d.textContent = pad(d);
        if (out.h) out.h.textContent = pad(h);
        if (out.m) out.m.textContent = pad(m);
        if (out.s) out.s.textContent = pad(s);
      };
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------- Wishlist (localStorage) ---------- */
  const WISH_KEY = 'novora_wishlist';
  const getWishlist = () => { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch (e) { return []; } };
  const setWishlist = (arr) => localStorage.setItem(WISH_KEY, JSON.stringify(arr));
  function syncWishlistUI() {
    const list = getWishlist();
    $$('[data-wishlist]').forEach((btn) => {
      btn.classList.toggle('is-active', list.includes(btn.getAttribute('data-wishlist')));
    });
    const count = $('[data-wishlist-count]');
    if (count) { count.textContent = list.length; count.hidden = list.length === 0; }
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wishlist]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute('data-wishlist');
    let list = getWishlist();
    list = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setWishlist(list); syncWishlistUI();
  });

  /* ==========================================================================
     CART
     ========================================================================== */
  const cartDrawer = $('#CartDrawer');
  const cartConfig = window.NovoraCart || {};
  const freeShipThreshold = (cartConfig.freeShipThreshold || 0) * 100;

  async function fetchCart() {
    const res = await fetch(window.Shopify.routes.root + 'cart.js', { headers: { 'Accept': 'application/json' } });
    return res.json();
  }

  async function addToCart(items) {
    const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.description || 'Could not add to cart'); }
    return res.json();
  }

  async function changeLine(line, quantity) {
    const res = await fetch(window.Shopify.routes.root + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ line, quantity })
    });
    return res.json();
  }

  function renderCart(cart) {
    const countEls = $$('[data-cart-count]');
    countEls.forEach((el) => { el.textContent = cart.item_count; el.hidden = cart.item_count === 0; });

    if (!cartDrawer) return;
    const body = $('[data-cart-body]', cartDrawer);
    const foot = $('[data-cart-foot]', cartDrawer);

    // free shipping bar
    const bar = $('[data-shipbar]', cartDrawer);
    if (bar && freeShipThreshold > 0) {
      const remaining = Math.max(0, freeShipThreshold - cart.total_price);
      const pct = Math.min(100, (cart.total_price / freeShipThreshold) * 100);
      $('[data-shipbar-fill]', bar).style.width = pct + '%';
      const text = $('[data-shipbar-text]', bar);
      text.innerHTML = remaining === 0
        ? '🎉 ' + (cartConfig.freeShipQualified || "You've unlocked free shipping!")
        : "You're <strong>" + money(remaining) + "</strong> away from free shipping";
    }

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="cart-empty"><p class="h3">Your cart is empty</p><p class="text-muted">Time to represent your colors.</p><a href="' + (cartConfig.shopUrl || '/collections/all') + '" class="btn btn--primary mt-2">Continue shopping</a></div>';
      if (foot) foot.hidden = true;
      return;
    }
    if (foot) foot.hidden = false;

    body.querySelectorAll('[data-line-list]').forEach((n) => n.remove());
    const list = document.createElement('div');
    list.setAttribute('data-line-list', '');
    list.innerHTML = cart.items.map((item, i) => {
      const img = item.image ? item.image.replace(/(\.[a-z]+)(\?|$)/i, '_120x150$1$2') : '';
      const variant = item.options_with_values ? item.options_with_values.map((o) => o.value).join(' / ') : '';
      return `<div class="cart-line" data-line="${i + 1}">
        <div class="cart-line__img"><img src="${img}" alt="${item.product_title}" loading="lazy" width="72" height="90"></div>
        <div>
          <div class="cart-line__title">${item.product_title}</div>
          <div class="cart-line__variant">${variant}</div>
          <div class="qty" data-qty>
            <button type="button" data-qty-minus aria-label="Decrease">−</button>
            <input type="text" inputmode="numeric" value="${item.quantity}" data-qty-input aria-label="Quantity" readonly>
            <button type="button" data-qty-plus aria-label="Increase">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="cart-line__price">${money(item.final_line_price)}</div>
          <button type="button" class="cart-line__remove" data-line-remove>Remove</button>
        </div>
      </div>`;
    }).join('');
    // insert before upsell block if present
    const upsell = $('.cart-upsell', body);
    if (upsell) body.insertBefore(list, upsell); else body.prepend(list);

    const subtotal = $('[data-cart-subtotal]', cartDrawer);
    if (subtotal) subtotal.textContent = money(cart.total_price);
  }

  async function refreshCart() { try { renderCart(await fetchCart()); } catch (e) {} }

  // Quantity & remove handlers (delegated within drawer)
  if (cartDrawer) {
    cartDrawer.addEventListener('click', async (e) => {
      const line = e.target.closest('[data-line]');
      if (!line) return;
      const idx = parseInt(line.getAttribute('data-line'), 10);
      const input = $('[data-qty-input]', line);
      let qty = parseInt(input.value, 10);
      if (e.target.closest('[data-qty-plus]')) qty++;
      else if (e.target.closest('[data-qty-minus]')) qty = Math.max(0, qty - 1);
      else if (e.target.closest('[data-line-remove]')) qty = 0;
      else return;
      line.style.opacity = '0.5';
      renderCart(await changeLine(idx, qty));
    });
  }

  // Add to cart (product forms + quick add)
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Adding…'; }
    try {
      const id = form.querySelector('[name="id"]').value;
      const qtyInput = form.querySelector('[name="quantity"]');
      const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      await addToCart([{ id, quantity }]);
      await refreshCart();
      if (cartConfig.drawerEnabled && cartDrawer) openPanel(cartDrawer);
      if (btn) { btn.innerHTML = '✓ Added'; setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1200); }
    } catch (err) {
      if (btn) { btn.innerHTML = original; btn.disabled = false; }
      alert(err.message);
    }
  });

  // Quick add buttons (single variant)
  document.addEventListener('click', async (e) => {
    const qa = e.target.closest('[data-quick-add]');
    if (!qa) return;
    e.preventDefault();
    const id = qa.getAttribute('data-quick-add');
    const original = qa.innerHTML;
    qa.disabled = true; qa.innerHTML = 'Adding…';
    try {
      await addToCart([{ id, quantity: 1 }]);
      await refreshCart();
      if (cartConfig.drawerEnabled && cartDrawer) openPanel(cartDrawer);
      qa.innerHTML = '✓ Added';
      setTimeout(() => { qa.innerHTML = original; qa.disabled = false; }, 1200);
    } catch (err) { qa.innerHTML = original; qa.disabled = false; alert(err.message); }
  });

  // Upsell add inside drawer
  document.addEventListener('click', async (e) => {
    const up = e.target.closest('[data-upsell-add]');
    if (!up) return;
    e.preventDefault();
    up.disabled = true; up.textContent = 'Adding…';
    try { await addToCart([{ id: up.getAttribute('data-upsell-add'), quantity: 1 }]); await refreshCart(); }
    catch (err) { alert(err.message); }
  });

  // Frequently bought together — add multiple variants at once
  document.addEventListener('click', async (e) => {
    const bundle = e.target.closest('[data-bundle-add]');
    if (!bundle) return;
    e.preventDefault();
    const ids = (bundle.getAttribute('data-ids') || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return;
    const original = bundle.innerHTML;
    bundle.disabled = true; bundle.innerHTML = 'Adding…';
    try {
      await addToCart(ids.map((id) => ({ id: id, quantity: 1 })));
      await refreshCart();
      if (cartConfig.drawerEnabled && cartDrawer) openPanel(cartDrawer);
      bundle.innerHTML = '✓ Added';
      setTimeout(() => { bundle.innerHTML = original; bundle.disabled = false; }, 1400);
    } catch (err) { bundle.innerHTML = original; bundle.disabled = false; alert(err.message); }
  });

  /* ==========================================================================
     PRODUCT PAGE
     ========================================================================== */
  function initProduct() {
    const product = $('[data-product]');
    if (!product) return;
    const data = JSON.parse($('[data-product-json]', product).textContent);

    // Gallery
    const slides = $$('.gallery-main__slide', product);
    const thumbs = $$('.gallery-thumb', product);
    function showSlide(i) {
      slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
      thumbs.forEach((t, n) => t.classList.toggle('is-active', n === i));
    }
    thumbs.forEach((t, i) => t.addEventListener('click', () => showSlide(i)));

    // Variant selection
    const form = $('[data-product-form]', product);
    const idInput = form ? $('[name="id"]', form) : null;
    const priceEl = $('[data-product-price]', product);
    const atcBtn = form ? $('[data-atc]', form) : null;
    let selected = {};

    function findVariant() {
      return data.variants.find((v) =>
        data.options.every((opt, i) => v.options[i] === selected[opt])
      );
    }
    function updateVariant() {
      const variant = findVariant();
      if (!variant || !idInput) return;
      idInput.value = variant.id;
      if (priceEl) {
        priceEl.innerHTML = variant.compare_at_price && variant.compare_at_price > variant.price
          ? `<span class="price__sale">${money(variant.price)}</span> <span class="price__compare">${money(variant.compare_at_price)}</span>`
          : money(variant.price);
      }
      if (atcBtn) {
        atcBtn.disabled = !variant.available;
        atcBtn.querySelector('[data-atc-text]').textContent = variant.available ? (atcBtn.dataset.addLabel || 'Add to cart') : (atcBtn.dataset.soldLabel || 'Sold out');
      }
      const stickyPrice = $('[data-sticky-price]');
      if (stickyPrice) stickyPrice.textContent = money(variant.price);
      // update sticky atc id
      const stickyForm = $('[data-sticky-form]');
      if (stickyForm) { const si = $('[name="id"]', stickyForm); if (si) si.value = variant.id; }
    }

    $$('.size-chip input', product).forEach((input) => {
      input.addEventListener('change', () => {
        const opt = input.name; selected[opt] = input.value;
        $$('.size-chip', input.closest('.size-list')).forEach((c) => c.classList.remove('is-selected'));
        input.closest('.size-chip').classList.add('is-selected');
        const optIndex = data.options.indexOf(opt);
        if (optIndex > -1) {
          const label = $('[data-selected-' + (optIndex + 1) + ']', product);
          if (label) label.textContent = input.value;
        }
        updateVariant();
      });
    });
    // init defaults
    data.options.forEach((opt, i) => {
      const first = data.variants.find((v) => v.available) || data.variants[0];
      selected[opt] = first.options[i];
    });
    // pre-select chips matching default
    $$('.size-chip input', product).forEach((input) => {
      if (selected[input.name] === input.value && !input.closest('.size-chip').classList.contains('is-soldout')) {
        input.checked = true; input.closest('.size-chip').classList.add('is-selected');
      }
    });
    updateVariant();

    // Quantity stepper on product
    $$('[data-qty]', product).forEach((q) => {
      const input = $('[data-qty-input]', q);
      $('[data-qty-plus]', q)?.addEventListener('click', () => { input.value = parseInt(input.value, 10) + 1; });
      $('[data-qty-minus]', q)?.addEventListener('click', () => { input.value = Math.max(1, parseInt(input.value, 10) - 1); });
    });

    // Image zoom
    $$('.gallery-main__slide img', product).forEach((img) => {
      img.addEventListener('click', () => openZoom(img.src, img.alt));
    });

    // Sticky ATC visibility
    const sticky = $('[data-sticky-atc]');
    const buybox = $('[data-buybox]', product);
    if (sticky && buybox) {
      const obs = new IntersectionObserver((entries) => {
        sticky.setAttribute('data-visible', entries[0].isIntersecting ? 'false' : 'true');
      }, { rootMargin: '0px 0px -200px 0px' });
      obs.observe(buybox);
    }

    // Live visitor counter
    const visitor = $('[data-visitor]');
    if (visitor) {
      const base = 14 + Math.floor(Math.random() * 22);
      const set = (n) => visitor.textContent = n;
      set(base);
      setInterval(() => set(Math.max(6, base + Math.floor(Math.random() * 9) - 4)), 5000);
    }
  }

  /* ---------- Image zoom lightbox ---------- */
  function openZoom(src, alt) {
    let lb = $('#NovoraZoom');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'NovoraZoom';
      lb.className = 'modal';
      lb.setAttribute('data-panel', '');
      lb.innerHTML = '<div class="modal__backdrop" data-zoom-close></div><div class="modal__dialog" style="width:min(900px,100%);background:#000"><button class="modal__close" data-zoom-close aria-label="Close">✕</button><img style="width:100%;height:auto" alt=""></div>';
      document.body.appendChild(lb);
      lb.addEventListener('click', (e) => { if (e.target.closest('[data-zoom-close]')) closePanel(lb); });
    }
    const img = lb.querySelector('img');
    img.src = src; img.alt = alt || '';
    lb.setAttribute('data-active', 'true');
    openPanel(lb);
  }

  /* ==========================================================================
     RECENTLY VIEWED
     ========================================================================== */
  function trackRecentlyViewed() {
    const product = $('[data-product]');
    const RV_KEY = 'novora_recently_viewed';
    let list = [];
    try { list = JSON.parse(localStorage.getItem(RV_KEY)) || []; } catch (e) {}
    if (product) {
      const handle = product.getAttribute('data-product-handle');
      if (handle) {
        list = [handle, ...list.filter((h) => h !== handle)].slice(0, 8);
        localStorage.setItem(RV_KEY, JSON.stringify(list));
      }
    }
    // render into placeholder if section requests it
    const container = $('[data-recently-viewed]');
    if (container) {
      const current = product ? product.getAttribute('data-product-handle') : null;
      const handles = list.filter((h) => h !== current).slice(0, 4);
      if (handles.length === 0) { container.closest('[data-recently-viewed-section]')?.remove(); return; }
      Promise.all(handles.map((h) =>
        fetch(window.Shopify.routes.root + 'products/' + h + '?section_id=product-card-ajax')
          .then((r) => r.ok ? r.text() : '').catch(() => '')
      )).then((parts) => {
        const html = parts.filter(Boolean).join('');
        if (html.trim()) { container.innerHTML = html; bindReveals(container); bindMediaFade(container); syncWishlistUI(); }
        else container.closest('[data-recently-viewed-section]')?.remove();
      });
    }
  }

  /* ==========================================================================
     RECENT PURCHASE NOTIFICATIONS
     ========================================================================== */
  function initPurchaseToasts() {
    const toast = $('[data-purchase-toast]');
    if (!toast) return;
    let data = [];
    try { data = JSON.parse($('[data-purchase-data]').textContent); } catch (e) { return; }
    if (!data.length) return;
    const names = ['Marcus from London', 'Sofia from Madrid', 'Liam from Toronto', 'Yuki from Tokyo', 'Ahmed from Dubai', 'Emma from Berlin', 'Lucas from São Paulo', 'Chloe from Paris'];
    const times = ['2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', 'just now'];
    let i = 0;
    const show = () => {
      const p = data[i % data.length];
      $('[data-toast-img]', toast).src = p.image;
      $('[data-toast-name]', toast).textContent = names[Math.floor(Math.random() * names.length)];
      $('[data-toast-meta]', toast).textContent = 'purchased ' + p.title;
      $('[data-toast-time]', toast).textContent = times[Math.floor(Math.random() * times.length)];
      toast.setAttribute('data-visible', 'true');
      setTimeout(() => toast.setAttribute('data-visible', 'false'), 5000);
      i++;
    };
    $('[data-toast-close]', toast)?.addEventListener('click', () => toast.setAttribute('data-visible', 'false'));
    setTimeout(show, 4000);
    setInterval(show, 16000);
  }

  /* ==========================================================================
     POPUPS (newsletter / first-order discount + exit intent)
     ========================================================================== */
  function initPopup() {
    const popup = $('[data-popup]');
    if (!popup) return;
    const KEY = 'novora_popup_seen';
    if (localStorage.getItem(KEY)) return;
    const dismiss = () => { popup.setAttribute('data-active', 'false'); localStorage.setItem(KEY, '1'); };
    const show = () => { if (!localStorage.getItem(KEY)) { popup.setAttribute('data-active', 'true'); openedOnce = true; } };
    let openedOnce = false;
    popup.querySelectorAll('[data-popup-close]').forEach((b) => b.addEventListener('click', dismiss));
    popup.querySelector('form')?.addEventListener('submit', () => localStorage.setItem(KEY, '1'));
    // timed
    const delay = parseInt(popup.getAttribute('data-popup-delay') || '6', 10) * 1000;
    setTimeout(show, delay);
    // exit intent (desktop)
    document.addEventListener('mouseout', (e) => {
      if (!openedOnce && e.clientY <= 0 && !e.relatedTarget) show();
    });
  }

  /* ==========================================================================
     INIT
     ========================================================================== */
  function init() {
    bindReveals();
    bindMediaFade();
    initHeader();
    initParallax();
    initSliders();
    initAccordions();
    initCountdowns();
    initProduct();
    trackRecentlyViewed();
    initPurchaseToasts();
    initPopup();
    syncWishlistUI();
    refreshCart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Shopify Theme Editor support
  document.addEventListener('shopify:section:load', (e) => {
    bindReveals(e.target); bindMediaFade(e.target);
    initSliders(); initAccordions(); initCountdowns(); initProduct(); syncWishlistUI();
  });

  // expose minimal API
  window.Novora = { refreshCart, openPanel, closePanel, addToCart };
})();
