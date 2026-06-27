# Novora — Premium Football Jersey Shopify Theme

A production-ready **Shopify Online Store 2.0** theme for a premium football (soccer)
jersey brand. Built with Liquid, semantic HTML5, modern CSS, and dependency-free
vanilla JavaScript. Luxury aesthetic, mobile-first, conversion-optimized.

> Brand identity is original. The theme showcases football-inspired apparel and does
> **not** imply affiliation with FIFA or any national federation.

## Install

1. Download `novora-theme.zip` (see repo root / chat attachment).
2. Shopify Admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Select the zip and click **Upload**.
4. Click **Customize** to edit content, colors, fonts, and sections in the Theme Editor.

### Recommended setup
- Create collections (e.g. *Brazil*, *Argentina*, *Best Sellers*) and assign them in the
  **Featured teams** and **Best sellers** sections.
- Create navigation menus named `main-menu` and `footer` (Navigation settings).
- Add product images; cards use the 2nd image for the hover swap.
- Set a `Size` option on jersey products to enable the size selector + sticky ATC.
- Theme settings → **Cart** → pick a *Cart upsell collection* (also powers the
  recent-purchase social proof).

## Brand palette
| Token | Value |
|---|---|
| Background (matte black) | `#0A0A0A` |
| Text (pure white) | `#FFFFFF` |
| Accent (metallic gold) | `#D4AF37` |
| Highlight (electric blue) | `#00C2FF` |

All editable in **Theme settings → Colors**.

## What's included
- **Homepage:** full-screen hero (parallax, fade-ins, scroll indicator), featured teams
  grid with flag accents, best-sellers slider, Why Novora features, cinematic promo banner
  with countdown, testimonials carousel, social gallery, newsletter, first-order / exit-intent
  discount popup.
- **Product page:** image gallery + zoom + thumbnails, sticky Add to Cart, size & quantity
  selectors, shipping estimate, accordions, trust badges, money-back guarantee, bundle tiers
  (Buy 2/3/4), low-stock indicator, live visitor counter, recent-purchase toasts,
  Frequently Bought Together, related products, recently viewed.
- **Cart:** slide-out drawer with free-shipping progress bar, upsells, discount field,
  express/dynamic checkout, plus a full cart page.
- **Navigation:** sticky header, transparent over hero, mega menu, search modal, wishlist
  (localStorage), account, cart count, currency & language selectors in the footer.
- **System pages:** collection (sort + pagination), collections list, search, blog, article,
  page, contact, 404, password splash, and full customer account templates.

## File structure
```
assets/      theme.css, theme.js
config/      settings_schema.json, settings_data.json
layout/      theme.liquid, password.liquid
locales/     en.default.json
sections/    modular sections + header/footer section groups
snippets/    reusable partials (product-card, icon, price, cart-drawer, …)
templates/   JSON templates (OS 2.0) + customer account templates
```

## Performance & accessibility
- Responsive `srcset` images, lazy loading, `fetchpriority` on hero/first product image.
- Single CSS + single JS file, no frameworks, deferred reveal via `IntersectionObserver`.
- Semantic landmarks, skip-link, focus states, `aria-*` on interactive components,
  `prefers-reduced-motion` support, JSON-LD product structured data + Open Graph tags.
