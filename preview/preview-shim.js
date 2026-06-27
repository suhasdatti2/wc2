/* Preview-only shim: fakes Shopify globals + a mock cart so theme.js runs
   without a Shopify backend. NOT part of the importable theme. */
(function () {
  window.Shopify = window.Shopify || {};
  window.Shopify.routes = { root: '/' };
  window.Shopify.currency = { active: 'USD' };
  window.NovoraCart = {
    drawerEnabled: true,
    freeShipThreshold: 120,
    shopUrl: '#',
    freeShipQualified: "You've unlocked free shipping!"
  };

  // Demo catalog (ids match data-quick-add / product form ids in the HTML)
  var CATALOG = {
    '1001': { product_title: 'Brazil Home Jersey 24/25', price: 8900, image: 'img/jersey-1.svg#' },
    '1002': { product_title: 'Argentina Home Jersey 24/25', price: 8900, image: 'img/jersey-2.svg#' },
    '1003': { product_title: 'France Away Jersey 24/25', price: 9400, image: 'img/jersey-3.svg#' },
    '1004': { product_title: 'Portugal Home Jersey 24/25', price: 8900, image: 'img/jersey-4.svg#' },
    '1005': { product_title: 'England Home Jersey 24/25', price: 8500, image: 'img/jersey-5.svg#' },
    '1006': { product_title: 'Spain Home Jersey 24/25', price: 8900, image: 'img/jersey-6.svg#' },
    '1007': { product_title: 'Germany Away Jersey 24/25', price: 9400, image: 'img/jersey-7.svg#' },
    '1008': { product_title: 'Italy Home Jersey 24/25', price: 8900, image: 'img/jersey-8.svg#' },
    '2001': { product_title: 'Brazil Home Jersey 24/25 — S', price: 8900, image: 'img/jersey-1.svg#' },
    '2002': { product_title: 'Brazil Home Jersey 24/25 — M', price: 8900, image: 'img/jersey-1.svg#' },
    '2003': { product_title: 'Brazil Home Jersey 24/25 — L', price: 8900, image: 'img/jersey-1.svg#' },
    '2004': { product_title: 'Brazil Home Jersey 24/25 — XL', price: 8900, image: 'img/jersey-1.svg#' }
  };
  var cart = { items: [], item_count: 0, total_price: 0, currency: { iso_code: 'USD' } };

  function recompute() {
    cart.item_count = cart.items.reduce(function (n, i) { return n + i.quantity; }, 0);
    cart.total_price = cart.items.reduce(function (n, i) { return n + i.final_line_price; }, 0);
  }
  function addItems(items) {
    items.forEach(function (it) {
      var id = String(it.id);
      var info = CATALOG[id] || { product_title: 'Novora Jersey', price: 8900, image: 'img/jersey-1.svg#' };
      var existing = cart.items.find(function (x) { return x.id === id; });
      var qty = it.quantity || 1;
      if (existing) { existing.quantity += qty; existing.final_line_price = existing.quantity * info.price; }
      else {
        cart.items.push({
          id: id, product_title: info.product_title, image: info.image,
          quantity: qty, final_line_price: info.price * qty,
          options_with_values: [{ value: it.size || 'M' }]
        });
      }
    });
    recompute();
  }
  function changeLine(line, quantity) {
    var item = cart.items[line - 1];
    if (item) {
      if (quantity <= 0) cart.items.splice(line - 1, 1);
      else { var unit = item.final_line_price / item.quantity; item.quantity = quantity; item.final_line_price = unit * quantity; }
    }
    recompute();
  }

  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (url, opts) {
    url = String(url);
    function json(data) { return Promise.resolve({ ok: true, json: function () { return Promise.resolve(data); } }); }
    if (url.indexOf('cart/add') > -1) {
      var body = {}; try { body = JSON.parse(opts.body); } catch (e) {}
      addItems(body.items || []); return json(cart);
    }
    if (url.indexOf('cart/change') > -1) {
      var b = {}; try { b = JSON.parse(opts.body); } catch (e) {}
      changeLine(b.line, b.quantity); return json(cart);
    }
    if (url.indexOf('cart.js') > -1 || url.replace(/\?.*/, '').endsWith('/cart')) return json(cart);
    if (realFetch) return realFetch(url, opts);
    return json({});
  };
})();
