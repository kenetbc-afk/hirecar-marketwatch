# HIRECAR Mobile Hero Redesign — Session Skill v2
**Session Date:** 2026-03-05
**Scope:** Mobile-only CSS changes to `index.html` hero/credit module
**Breakpoints Modified:** `@media (max-width: 768px)` + `@media (max-width: 480px)`
**Desktop:** UNTOUCHED — all changes scoped inside mobile media queries

---

## Architecture

The landing page hero is a single monolithic `index.html` (~7300+ lines). The credit module stacks:

```
.credit-module (parent, background: #000)
  .credit-module-inner
    .credit-icon (hero image container, relative positioned)
      .credit-carousel (absolute, inset: 0)
        img.carousel-slide.city-slide      — img/la-110-freeway.webp
        img.carousel-slide.cars-disney     — img/cars-disney-hall.jpg
        img.carousel-slide.la-mural        — img/la-night-6.jpeg
        img.carousel-slide.collision-night — img/la-dtla-fog.avif
        img.carousel-slide.porsche-911     — img/porsche-911.avif
        img.carousel-slide.storage-accident — img/la-night-4.jpeg
        img.carousel-slide.ferrari-road    — Unsplash URL
        img.carousel-slide.dtla-buildings  — img/la-night-5.jpeg
        img.carousel-slide.mercedes-amg    — Unsplash URL
      ::before (gradient overlay, z-index: 2)
      .credit-overlay (text overlay, z-index: 3)
        .credit-eyebrow
        .credit-headline
        .credit-sub
        .credit-stat-row (hidden on mobile)
    .credit-module-main (CTA panel, z-index: 4)
      .credit-module-text
        .credit-cta-lead
        .credit-module-actions
          a.credit-cta-primary
          a.credit-cta-secondary
        .credit-cta-fine
```

### Z-Index Stack (mobile)
1. `.credit-icon` — base image container
2. `::before` — gradient overlay (z-index: 2)
3. `.credit-overlay` — headline/description text (z-index: 3)
4. `.credit-module-main` — CTA buttons (z-index: 4)

### CSS Location
- Desktop carousel styles: ~lines 463-522
- 768px breakpoint hero section: ~lines 3135-3260
- 480px breakpoint overrides: ~lines 3417-3439

---

## Design Decisions

### Layout Philosophy
- **Text on top**: `.credit-overlay` at `top: 18%` (768px) / `top: 16%` (480px) — upper third
- **Image in middle**: Full-bleed carousel, no transforms, `object-fit: cover`
- **Dark bleeds**: Heavy gradient at top (0.92 → 0.35 opacity) clearing in middle, darkening at bottom (0.55 → 0.95)
- **Buttons pulled up**: `.credit-module-main` uses `margin-top: -52vh; min-height: 52vh; justify-content: flex-end` to dock buttons at bottom of hero overlap
- **Centered proportional CTAs**: `max-width: 280px` buttons inside `320px` container, `margin: 0 auto`

### Gradient Overlay
```css
background: linear-gradient(180deg,
  rgba(0,0,0,.92) 0%,     /* heavy top for header */
  rgba(0,0,0,.7) 10%,
  rgba(0,0,0,.35) 22%,
  rgba(0,0,0,.08) 40%,    /* clears for image */
  rgba(0,0,0,.05) 55%,
  rgba(0,0,0,.15) 68%,
  rgba(0,0,0,.55) 80%,    /* darkens for buttons */
  rgba(0,0,0,.88) 92%,
  rgba(0,0,0,.95) 100%);
```

### Carousel Image Focal Points (768px)
Desktop `object-position` values do NOT translate to portrait mobile. Desktop uses landscape containers, mobile uses tall portrait — horizontal content gets heavily cropped. Values tuned for portrait:

| Slide | Desktop | Mobile | Rationale |
|-------|---------|--------|-----------|
| city-slide | 0% 50% | 40% 50% | Center skyline, not crop to hills |
| porsche-911 | 18% center | 35% 45% | Show full car body |
| ferrari-road | 45% 65% | center 50% | Center the Ferrari |
| mercedes-amg | center 86% | center 55% | Show car mid-frame |
| cars-disney | 0% 92% | 40% 65% | Balance cars + concert hall |
| collision-night | 88% center | center center | Center the scene |
| la-mural | center center | center 40% | Show upper mural detail |
| storage-accident | center center | center center | Already centered |
| dtla-buildings | center center | center 40% | Show building tops |

### Button Sizing (768px → 480px)
| Property | 768px | 480px |
|----------|-------|-------|
| .credit-module-actions max-width | 320px | 260px |
| .credit-cta-* max-width | 280px | 240px |
| .credit-cta-* padding | 10px 16px | 9px 14px |
| .credit-cta-* font-size | 11px | 10.5px |
| .credit-module-main margin-top | -52vh | -50vh |
| .credit-module-main min-height | 52vh | 50vh |

---

## Key Learnings

1. **Portrait crop kills horizontal compositions**: Desktop `object-position: 0% 50%` anchors left edge — on portrait mobile, this crops 60%+ of the image from the right. Always bias toward center (30-50%) for mobile portrait.

2. **`transform: none !important`**: Desktop carousel slides use `scale(1.05)` to `scale(1.5)` — these must be stripped on mobile to "zoom out as much as possible."

3. **Negative margin overlap technique**: `.credit-module-main` pulls up into hero via `margin-top: -52vh` with matching `min-height: 52vh` and `justify-content: flex-end`. This docks content at the bottom of the overlap zone without absolute positioning.

4. **Background removal**: CTA panel's own gradient background removed (`background: none !important`) — the hero's `::before` gradient handles all dark bleed.

5. **Button centering**: Use `max-width` + `margin: 0 auto` on the `.credit-module-actions` container, not `width: 100%` on individual buttons. Buttons should be proportional, not edge-to-edge.

---

## Quick Reference — What to Modify Next

### To adjust button size
Edit `.credit-module-actions` `max-width` and `.credit-cta-primary, .credit-cta-secondary` `max-width` + `padding` in both 768px and 480px breakpoints.

### To adjust text position
Edit `.credit-overlay { top: 18% }` — lower % moves text down, higher moves up.

### To adjust image framing per slide
Edit `.carousel-slide.{class} { object-position: X% Y% !important; }` in the 768px breakpoint. X controls left-right (0%=left, 100%=right), Y controls up-down.

### To adjust dark bleed strength
Edit the `rgba(0,0,0,...)` values in `.credit-icon::before` gradient. Higher alpha = darker.

### To adjust how far buttons pull into hero
Edit `.credit-module-main { margin-top: -52vh; min-height: 52vh; }` — these two values should always match (negative margin = min-height).

---

## Files Modified
- `index.html` — lines ~3135-3260 (768px breakpoint), lines ~3417-3439 (480px breakpoint)

## Document Control
- **Skill ID:** mobile-hero-redesign-v2
- **Status:** ACTIVE
- **Created:** 2026-03-05
