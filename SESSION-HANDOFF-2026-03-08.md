# HIRECAR MarketWatch — Session Handoff
**Date:** March 8, 2026
**Engineer:** Claude (AI pair-programmer)
**Owner:** Ken Eckman
**Commit Range:** `fc9ae8e` → `9690c11`
**Live URL:** https://hirecar-marketwatch.pages.dev

---

## Summary

This session completed **4 major fixes**: moved the Trending strip under ICYMI inside the scroll-snap container, created OG link-preview images and meta tags, fixed the entertainment section that was completely invisible (opacity bug + text color mismatch), and resolved the ICYMI scroll-snap trap that prevented users from scrolling past Top Stories.

---

## What Changed

### 1. Trending Strip Relocated (commit `fc9ae8e`)
- **Moved** the trending strip (`#trendingStrip`) from below `.page-wrap` (between Entertainment and the old location) to **inside `.ss-items`** after the ICYMI gallery strip
- Layout order inside `.ss-items` is now: **Top Stories → ICYMI Strip → Trending Strip**
- Wrapped in a `.scroll-section` div with horizontal overflow and a `→` scroll arrow

### 2. OG Link Preview / Social Sharing (commit `fc9ae8e`)
- **Created** `img/og-image.jpg` (1200×630) and `img/og-image-twitter.jpg` (800×420) using Python PIL
  - Downtown LA background with dark gradient overlays
  - HIRECAR wordmark, gold separator, "MarketWatch!" text, gold accent "!"
  - "{NEWS+MEDIA}" subtitle, "Auto Operator Intelligence · Los Angeles" tagline
  - "HIRECAR LLC · Est. November 2024" at bottom
- **Added** Open Graph meta tags after `<title>` (~line 13):
  - `og:type`, `og:title`, `og:description`, `og:image`, `og:image:width/height`, `og:url`, `og:site_name`
  - Twitter Card: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
  - General: `meta name="description"`
- Image URL: `https://hirecar-marketwatch.pages.dev/img/og-image.jpg`

### 3. Entertainment Section Images (commit `fc9ae8e`)
- **Replaced** all 4 ent-card Unsplash images with topic-relevant selections:

| Card | Topic | Unsplash Photo ID |
|------|-------|-------------------|
| 1 | Road Trip Culture | `photo-1469854523086-cc02fe5d8800` (open desert highway) |
| 2 | Family Mobility | `photo-1551524559-8af4e6624178` (PCH coastal road) |
| 3 | Collision + Recovery | `photo-1619642751034-765dfdf7c58e` (auto mechanic) |
| 4 | Private Driver Life | `photo-1494976388531-d1058494cdd8` (car at night in city) |

### 4. Dark-Mode `background` Shorthand Fix (commit `fc9ae8e`)
- **Line ~5834:** Changed `background: transparent !important` → `background-color: transparent !important`
- **Root cause:** The CSS `background` shorthand resets ALL sub-properties including `background-image`. This was wiping out the inline `background-image` on `.ent-card` elements in dark mode.
- **Affected selectors:** `.ent-section, .ent-card, .member-cta, .svc-section, .svc-item, .rh-section, .rh-car-card, footer` (all within `body.dark-mode`)

### 5. Entertainment Section Opacity Fix (commit `9690c11`)
- **Root cause:** Two duplicate IntersectionObserver scroll-reveal blocks (lines ~10868 and ~11393) both targeted `.ent-card`, setting `opacity: 0`. The second observer would reset opacity after the first revealed the cards.
- **Fix:** Removed `.ent-card` from both `querySelectorAll` selectors. Entertainment cards now render immediately without fade-in animation.
- Also renamed second observer's variables (`revealEls2`, `revealObs2`) and added guard `if (el.style.opacity === '1') return` to prevent re-zeroing already-revealed elements.

### 6. Entertainment Text Color Fix (commit `9690c11`)
- Cards always have a dark gradient overlay (`linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 60%)`)
- Old text colors used CSS variables that resolve to dark colors:

| Element | Old Color | New Color |
|---------|-----------|-----------|
| `.ent-cat` | `var(--muted)` → `#9aa3ad` | `rgba(255,255,255,.65)` |
| `.ent-title` | `var(--ink)` → `#111820` | `#fff` |
| `.ent-desc` | `var(--mid)` → `#6b7280` | `rgba(255,255,255,.7)` |

### 7. ICYMI Scroll-Snap Trap Fix (commit `9690c11`)
- **Line ~1208:** Changed `.sticky-stories` from `scroll-snap-type: y mandatory` → `scroll-snap-type: y proximity`
- **Root cause:** `mandatory` forced the browser to always snap to the nearest snap point, trapping users inside the Top Stories/ICYMI/Trending container. They couldn't fling-scroll past it.
- **`proximity`** only snaps when scroll position is near a snap point, allowing users to scroll freely through and out of the container.

---

## Architecture Reference

### File Structure
```
index.html          — 12,980 lines (ALL HTML + CSS + JS in one file)
img/                — 133 local images (hero carousel, OG images, backgrounds)
CNAME               — hirecar-marketwatch.pages.dev
.github/            — GitHub Actions / deploy config
```

### Page Section Order (top → bottom)
```
Line  ~7480   Mobile Apply Bar
Line  ~7480   Remote Hub (Remote mode only)
Line  ~8129   Utility Bar (ticker + member actions)
Line  ~8221   Masthead (HIRECAR | MarketWatch! branding)
Line  ~8386   Edition + Weather Bar
Line  ~8468   Primary Nav (mega-menu dropdowns)
Line  ~8801   HIRECREDIT Lead Module
Line  ~8914   Gradient Bridge (dark→light)
Line  ~8918   Page Wrap #1 — Top Stories
Line  ~8921     └ Section: Top Stories (sticky scroll-snap)
Line  ~8923       └ .sticky-stories container
Line  ~8926         └ .ss-hero-wrap (sticky hero image)
Line  ~8968         └ .ss-items (scroll-snap children)
Line  ~9017           └ ICYMI Gallery Strip
Line  ~9035           └ Trending Strip
Line  ~9079   Entertainment Section (full-width, 4 image cards)
Line  ~9122   Page Wrap #2 — Credit Repair + Auto Insurance
Line  ~9228     └ Mobility Scroll Section
Line  ~9292   Page Wrap #3
Line  ~9326   Member Module (CTA)
Line  ~9353   HIRECAR Services (horizontal scroll)
Line  ~9505   Company Bar
Line  ~9541   Footer
Line  ~9616   Script Block #1 (carousel, dark mode, etc.)
Line ~12246   Script Block #2 (data population, observers)
Line ~12801   Quick-Jump Nav
Line ~12956   Mobile Bottom Nav
```

### CSS Architecture (~lines 1–7000)
- **CSS Variables** defined on `:root` (line ~38): `--ink: #111820`, `--muted: #9aa3ad`, `--mid: #6b7280`, `--cta`, `--border`, `--white`
- **Desktop-first** with `@media (max-width: 768px)` and `@media (max-width: 480px)` breakpoints
- **Dark mode** via `body.dark-mode` class (toggled in JS) with `!important` overrides starting at line ~5817
- **Scroll-snap** on `.sticky-stories` (vertical, proximity) and `.rh-rail` (vertical, mandatory)

### JS Architecture (~lines 9616–12980)
- Two large `DOMContentLoaded` script blocks (duplicated patterns, needs cleanup)
- **Key systems:**
  - Hero Ken Burns carousel (`heroCarousel` IIFE)
  - Dark-mode toggle + auto-detection
  - Sticky Stories active-card detection + hero crossfade
  - IntersectionObserver scroll-reveal for `.art-row, .card, .side-art, .icymi-item, .rt-tile`
  - Counter animation for stats row
  - Wix iframe height notification (`notifyHeight()`)
  - Live clock in masthead
  - Quick-Jump dot navigation
  - Breaking News ticker
  - ICYMI hover-carousel

### Deployment
- **Repo:** `kenetbc-afk/hirecar-marketwatch` on GitHub
- **Host:** Cloudflare Pages → `hirecar-marketwatch.pages.dev`
- **Deploy trigger:** Push to `main` branch
- **Build:** Static — no build step, serves `index.html` directly

---

## Known Issues / Gotchas

| Issue | Details |
|-------|---------|
| **Duplicate JS blocks** | Two near-identical `DOMContentLoaded` listeners (block 1 ~line 9616, block 2 ~line 12246). Both have scroll-reveal observers, `notifyHeight()`, stats counters. Should be consolidated. |
| **Dark-mode class mismatch** | Dark-mode CSS targets `.ent-card-name` and `.ent-card-role` (lines 5839, 5847) but actual HTML uses `.ent-title` and `.ent-cat`. The overrides don't match. Currently worked around by hard-coding light colors on the base classes. |
| **Local image paths** | Local `img/` paths break on dev server when parent dir contains `:` character. Use Unsplash URLs for dev, or serve from the deployed Cloudflare URL. |
| **`.ss-items::after` spacer** | 45vh spacer after the last item inside `.ss-items`. Creates empty dead space at the bottom of the scroll-snap container. May need reducing. |
| **`overscroll-behavior-y: auto`** | Set on `.sticky-stories`. In Wix iframe context, this lets scroll chain to parent. In standalone context, allows escaping the container. Monitor if users still get stuck. |
| **Entertainment card gradient** | Fixed at `rgba(0,0,0,.85)` to `rgba(0,0,0,.2)`. Very dark at bottom — could be lightened for better image visibility. |

---

## Per-Item Scroll-Margin-Top (Top Stories)
```
Item 0: scroll-margin-top: 61px
Item 1: scroll-margin-top: 30px
Item 2: scroll-margin-top: 35px
```
These are set inline by JS to fine-tune snap positioning relative to the sticky hero.

---

## Dev Server
- **Start:** `python3 serve.py` (or `python3 -m http.server 8080`) from project root
- **Preview Server ID:** `525277aa-b26a-493f-8d41-e21ee67307ef` (port 8080)
- **Note:** Reload after edits; no hot-reload.

---

## What's Next (Owner Direction Needed)
- Consolidate duplicate JS blocks
- Review mobile scroll UX end-to-end (ICYMI → Trending → Entertainment flow)
- Additional entertainment content / more cards
- Owner mentioned "a couple more changes" — awaiting direction
