# HIRECAR MarketWatch — Session Handoff

**Date:** 2026-03-10 (updated)
**Author:** Claude (multi-session)
**For:** Incoming contributor continuing site refinement
**Project:** HIRECAR MarketWatch landing page — `index.html`

---

## Project Context

HIRECAR MarketWatch is a static HTML site deployed via **Cloudflare Pages** from GitHub (`main` branch auto-deploys). All CSS, HTML, and JS live inline in a single file: `index.html`. The landing page features a full-bleed hero carousel with **Ken Burns zoom effect** (city/car LA imagery), credit-repair headline overlay, and CTA buttons.

**File path (with shell escaping note):**
```
/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!/index.html
```
The `!` in the directory name causes **zsh escaping issues**. Standard quoting doesn't work. Use `find` + `xargs` for git commands:
```bash
find "/Users/hirecarken/Desktop/DOC CRTL" -maxdepth 1 -name ":HIRECAR*" -print0 | xargs -0 -I{} git -C '{}' status
```

**GitHub repo:** `kenetbc-afk/hirecar-marketwatch`

---

## What Has Been Completed (All Sessions)

### Hero Carousel — Ken Burns Effect (DONE)
- 9 slides (kb0–kb8) with cross-dissolve transitions and per-slide zoom animations
- Custom `@keyframes` for 3 slides that start pre-zoomed (Ritz, Audi, Airport)
- Per-slide `object-position` and `transform-origin` for optimal cropping
- JS auto-advances with `setInterval`, restarts animation via reflow trick

### Image Removal — 36.jpg "Do Not Enter" (DONE)
- DTLA architecture image with visible red "do not enter" signs removed
- All subsequent slides renumbered (kb4→kb3, kb5→kb4, etc.)
- Custom keyframe selectors updated to match new numbering

### Ritz Building Crop (kb0 — 32.jpg) (DONE)
- `object-position: 30% 50%` — anchored left to feature white car
- `transform-origin: 30% 50%` — zoom focuses on same point
- Custom `kbZoomIn0`: scale 1.00 → 1.20 (fully zoomed out, natural Ken Burns)

### Audi Crop (kb6 — IMG_0256.jpg) (DONE)
- `object-position: center 55%` with matching `transform-origin`
- Custom `kbZoomIn7`: scale 1.50 → 1.70

### Airport Crop (kb7 — la-palace-theatre.jpg) (DONE)
- `object-position: center 40%` with matching `transform-origin`
- Custom `kbZoomIn8`: scale 1.35 → 1.55

### Section Gaps Closed (DONE)
- `.ent-section` margin: `12px 0 32px` → `0`
- `.member-module` margin: `32px 0` → `0`

### Dark Mode Background Unification (DONE)
- ALL dark-mode section backgrounds unified to `#000` (was a patchwork of navy shades: `#0d1117`, `#060c18`, `#080e1a`, `#070d1a`, etc.)
- Desktop + mobile `@media` overrides both updated
- Affected selectors: `body.dark-mode`, `.ent-section`, `.member-module`, `.co-bar`, `.trending-strip`, `.primary-nav`, `.mci-bar`, `.edition-bar`, `.svc-scroll-section`, `footer`, `.page-wrap + .page-wrap`

### Mobile Credit Module Recentering (DONE)
- `.credit-overlay` centered: `top: 50%; transform: translate(-50%, -55%)`
- CTA panel, buttons, headline all centered for mobile
- Green collision dot hidden on mobile for symmetry

### Top Stories — Expanded to 5 Articles (DONE — 2026-03-10)
- Added **4th article** (data-idx="3"): "LA Fleet Operators Face Parts Shortage as OEM Backlogs Stretch to 14 Weeks" — Fleet & Operations category
- Added **5th article** (data-idx="4"): "California DMV Tightens Salvage Title Rules, Raising Rebuild Costs for LA Operators" — Regulation & Compliance category
- Added matching hero images for both articles (Unsplash sources)
- Added `scroll-margin-top` CSS for items 3 and 4 to tune snap alignment
- JS active-card detection uses dynamic `items.length` — no JS changes needed

### Scroll-Snap: Proximity to Mandatory (DONE — 2026-03-10)
- Changed `stickyStories` from `scroll-snap-type: y proximity` to `scroll-snap-type: y mandatory`
- Stories now lock to each card when scrolling — no in-between stops

### Viewport Zoom Prevention (DONE — 2026-03-10)
- Viewport meta updated: `maximum-scale=1.0, user-scalable=no`
- Prevents pinch-to-zoom on mobile to maintain layout integrity

### Entertainment Section — Standalone with Scroll-Snap (DONE — 2026-03-10)
- **Problem:** Browser DOM parser was nesting `#sec-ent` inside `.ss-items` despite source HTML placing it outside `.page-wrap`. Entertainment was rolling with the story cards.
- **Fix:** Restructured HTML closing tags:
  - `.ss-items` now closes immediately after `.ss-spacer`
  - ICYMI strip (`icymi-strip`) moved inside `stickyStories` but outside `ss-items`
  - Trending strip (`scroll-section`) moved inside `page-wrap` but outside `stickyStories`
  - Entertainment section (`#sec-ent`) lives inside `page-wrap` but outside `stickyStories`
- **Page-level scroll-snap:** Added `scroll-snap-type: y proximity` on `body` and `scroll-snap-align: start` on `.ent-section`
- Entertainment now snaps into view when user scrolls past the stories

### Current DOM Structure (after restructure)
```
body
  page-wrap
    sec-stories (section-label)
    stickyStories (scroll-snap: y mandatory)
      ss-hero-wrap (sticky hero images)
      ss-items (5x ss-item + ss-spacer)
      icymi-strip (In Case You Missed It)
    sec-ent / ent-section (scroll-snap-align: start)
    scroll-section (trending strip)
```

---

## Current Carousel State (9 Slides)

| kb# | File | Description | Custom Zoom | Object-Position |
|-----|------|-------------|-------------|-----------------|
| 0 | 32.jpg | Ritz Carlton + white car, urban road | kbZoomIn0 (1.00→1.20) | 30% 50% |
| 1 | 31.jpg | LA night skyline (portrait) | default (1.00→1.25) | center 100% |
| 2 | 40.jpg | LA aerial skyline | default | 55% 50% |
| 3 | 50.jpg | 6th St Viaduct night skyline | default | 75% 50% |
| 4 | 14.jpg | Santa Monica Pier sunset (portrait) | default | center 50% |
| 5 | 18.jpg | LA scene (portrait) | default | center 50% |
| 6 | IMG_0256.jpg | Audi coastal sunset | kbZoomIn7 (1.50→1.70) | center 55% |
| 7 | la-palace-theatre.jpg | Airport terminal sunset | kbZoomIn8 (1.35→1.55) | center 40% |
| 8 | pexels-thekameragrapher-16433702.jpg | LA cityscape | default | center bottom |

---

## Key Line References

| What | ~Line | Search Landmark |
|------|-------|-----------------|
| Ken Burns hero-kb base CSS | 5193 | `.carousel-slide.hero-kb {` |
| Per-slide object-position rules | 5204–5212 | `data-kb="0"` through `data-kb="8"` |
| Per-slide animation selectors | 5223–5231 | `.hero-kb[data-kb="0"].active` |
| @keyframes (kbZoomIn, 0, 7, 8) | 5234–5253 | `@keyframes kbZoomIn` |
| Mobile-slide base hide rule | 611 | `.carousel-slide.mobile-slide { display: none` |
| Carousel HTML (9 slides) | 8840–8855 | `<!-- ═══ HIRECREDIT LEAD MODULE` |
| Carousel JS (restartZoom, advanceSlide) | 10412–10440 | `function restartZoom` |

---

## How the Ken Burns System Works

### CSS Architecture
1. **Base rule** (`.carousel-slide.hero-kb`): `object-fit: cover`, absolute positioning, full viewport
2. **Per-slide positioning** (`[data-kb="N"]`): `object-position` crops the image, `transform-origin` sets zoom focal point
3. **Animation trigger** (`.hero-kb.active`): Applies the Ken Burns keyframe on `.active` class
4. **Custom keyframes** (`kbZoomIn0`, `kbZoomIn7`, `kbZoomIn8`): Override default zoom range per slide (kb0 is fully zoomed out; kb6/kb7 start pre-zoomed for tighter crops)

### JS Logic
```
restartZoom(slide) → resets animation via reflow trick
startSlide(i) → restartZoom + add .active
advanceSlide() → restartZoom next, add .active, setTimeout remove .active from current
Runs on setInterval(SLIDE_DURATION)
```

### Adding/Modifying a Slide Crop
1. Set `object-position` on `[data-kb="N"]` to frame the subject
2. If a tighter crop is needed, create a custom `@keyframes kbZoomInN` with higher scale values
3. Add a selector `.hero-kb[data-kb="N"].active` pointing to the custom keyframe
4. Set `transform-origin` to match `object-position` so zoom targets the right area

---

## Mobile Carousel (Separate — IN PROGRESS)

A **mobile-specific carousel** was started in a previous session but only image 1 (1.jpg, Tesla airport sunset) was added. This uses a separate system from the desktop Ken Burns carousel:

- `.mobile-slide` class on `<img>` tags (hidden by default at line 611)
- 768px media query shows mobile slides, hides desktop `.hero-kb` slides
- JS uses `matchMedia('(max-width: 768px)')` to filter which slides run

### Remaining: Add images 2–18 one at a time
For each image, add HTML, CSS `object-position`, preview at 375×812, get owner approval.

| # | File | Description | Orientation | Status |
|---|------|-------------|-------------|--------|
| 1 | 1.jpg | Tesla parking lot + airplane, purple sunset | Landscape | ✅ ADDED |
| 2 | 2.jpeg | DTLA arts district skyline at night w/ murals | Landscape | Pending |
| 3 | 3.jpg | 4th St mural wall, LA street art | Landscape | Pending |
| 4 | 4.jpg | 6th St Bridge lit up, DTLA skyline dusk | Landscape | Pending |
| 5 | 5.jpg | 110 freeway light trails, highway signs, DTLA night | Landscape | Pending |
| 6 | 6.jpg | Grand Ave / City National Bank / The Broad, dusk | Portrait | Pending |
| 7 | 7.jpg | Hollywood/Vine street, pink hazy sunset | Portrait | Pending |
| 8 | 8.jpg | Griffith viewpoint, DTLA skyline at night | Landscape | Pending |
| 9 | 9.jpg | DTLA palms + tower at night | Portrait | Pending |
| 10 | 10.jpg | DTLA golden hour street canyon | Portrait | Pending |
| 11 | 11.jpg | Industrial LA overpass, DTLA skyline, overcast | Landscape | Pending |
| 12 | 12.jpg | Aerial DTLA from residential street, daytime | Landscape | Pending |
| 13 | 13.jpg | Rooftop hangout, DTLA skyline, blue sky | Portrait | Pending |
| 14 | 14.jpg | Santa Monica Pier ferris wheel, crescent moon | Portrait | Pending |
| 15 | 15.jpg | "Made in Downtown LA" billboard | Landscape | Pending |
| 16 | 16.jpg | Black Rolls Royce, palms, colorful DTLA | Portrait | Pending |
| 17 | 17.jpg | Solo high-rise tower, cloudy sky | Portrait | Pending |
| 18 | 18.jpg | Audi R8, California plate, palms, golden hour | Portrait | Pending |

**Tip:** Portrait images (6, 7, 9, 10, 13, 14, 16, 17, 18) tend to work better on mobile.

---

### OG Thumbnail Updated (DONE)
- Fresh 1200×630 Playwright screenshot of the front page as it appears on first load
- Shows headline, Ritz imagery, nav, CTAs
- `og:image:height` meta tag corrected to 630

## Git History (Recent Commits)

```
[pending] Top Stories 5 articles, Entertainment standalone section, scroll-snap updates
7bd3553 Mobile carousel: pure pull-in zoom, Kobe blend, slide 2 skyline crop
490c023 Update HANDOFF.md — Ritz now zoomed out at 30% left anchor, OG thumbnail section added
a856d19 Zoom out Ritz white car fully (scale 1.00→1.20), anchor left at 30%
8052a64 Ritz 200% crop anchored bottom, update OG thumbnail to match front page
97c592a Update HANDOFF.md with current carousel state, line refs, and session history
```

---

## Rules

1. **NEVER touch desktop carousel base styles** — Ken Burns CSS starts at line ~5193
2. **Per-slide rules use `!important`** — required to override base `object-position`
3. **`transform-origin` must match `object-position`** on any slide with a custom zoom
4. **Test both mobile + desktop** after any change
5. **Green collision dot hidden on mobile** — intentional
6. **Carousel dots hidden on mobile** — auto-rotates
7. **JS handles viewport switching automatically** via `matchMedia`
8. **Use `find` + `xargs` for git** — zsh can't handle the `!` in the directory name

---

## Dev Setup

```bash
# Navigate (must use find workaround for git):
find "/Users/hirecarken/Desktop/DOC CRTL" -maxdepth 1 -name ":HIRECAR*" -print0 | xargs -0 -I{} git -C '{}' status

# Local dev server:
python3 "/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!/serve.py" 8080

# Or use Claude Preview with launch.json config (server ID may change between sessions)
```

---

## CSS Variables (:root)

```css
:root {
  --ink: #111820;  --ink-2: #1e2530;  --ink-3: #2d3540;
  --bg: #ffffff;   --white: #ffffff;
  --cta: #c9920a;  --cta-hover: #b07d06;
  --member: #0f4c75;
  --border: #dde1e7;
}
```

Dark mode backgrounds: **all `#000`** (unified this session).

---

*End of handoff document.*
