# HIRECAR MarketWatch — Mobile Carousel Handoff

**Date:** 2026-03-06
**Author:** Previous session (Claude)
**For:** Incoming contributor continuing mobile carousel work
**Project:** HIRECAR MarketWatch landing page — `index.html`

---

## Project Context

HIRECAR MarketWatch is a static HTML site hosted on GitHub Pages. All CSS, HTML, and JS live inline in a single file: `index.html`. The landing page has a full-bleed hero carousel (the "credit module") that displays city/car imagery behind a credit-repair headline and CTA buttons.

The current task is building a **mobile-specific image carousel** that runs independently from the desktop carousel. Desktop uses curated landscape/wide shots; mobile needs portrait-friendly LA city and car imagery reviewed by the site owner one image at a time.

**File path (with shell escaping note):**
```
/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!/index.html
```
The `!` in the directory name causes zsh escaping issues. Use quotes or `git -C "/path/to/repo"` for git commands.

---

## What Has Been Completed

### Task 1: Mobile Credit Module Recentering (DONE)

- `.credit-overlay` repositioned from `top: 18%` to true center: `top: 50%; transform: translate(-50%, -55%)`
- `.credit-headline` uses `display: flex; flex-direction: column; align-items: center`
- `.collision-text` padding-left zeroed and green dot hidden on mobile for true centering
- `.credit-sub` centered with `max-width: 90%; margin: 0 auto`
- CTA panel uses `margin-top: -42vh; min-height: 42vh; justify-content: flex-end`
- Buttons: `max-width: 300px` + `margin: 0 auto`
- Gradient overlay rebalanced for readability
- 480px breakpoint updated to match

### Task 2: Mobile/Desktop Split Carousel (IN PROGRESS)

**Architecture — 3 layers:**

1. **Base CSS (line 524):** `carousel-slide.mobile-slide { display: none !important; }`
2. **768px CSS:** Desktop slides hidden, mobile slides shown
3. **JS:** Uses `matchMedia('(max-width: 768px)')` to filter slides, auto-rebuilds on viewport change

**Image 1.jpg (Tesla airport sunset) is added and working.**

---

## What Needs to Be Done Next

### For each image (2–18), follow this pattern:

**Step 1 — HTML:** Add after the last mobile slide:
```html
<img class="carousel-slide mobile-slide mobile-N" src="img/N.jpg" alt="description" loading="lazy">
```

**Step 2 — CSS:** Add at 768px breakpoint:
```css
.carousel-slide.mobile-N { object-position: X% Y% !important; }
```

**Step 3 — Preview:** Reload mobile (375×812), get owner approval: keep / adjust / skip.

---

## Image Candidates

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

## Key Line References

| What | ~Lines | Search Landmark |
|------|--------|-----------------|
| Desktop carousel CSS (DO NOT EDIT) | 463-524 | `.carousel-slide.city-slide` |
| Mobile-slide base hide rule | 524 | `.carousel-slide.mobile-slide { display: none` |
| 768px mobile CSS | 3145-3313 | `/* Mobile carousel — hide desktop slides` |
| 480px overrides | 3420-3448 | `@media (max-width: 480px)` |
| Carousel HTML | 6175-6195 | `<!-- ═══ HIRECREDIT LEAD MODULE` |
| Mobile slide HTML | 6190-6191 | `<!-- ═══ MOBILE-ONLY SLIDES ═══ -->` |
| Carousel JS | 7344-7396 | `// 5b-pre. Credit hero image carousel` |

---

## Rules

1. **NEVER touch desktop carousel styles** (lines 463-522)
2. **Mobile slides use `.mobile-slide.mobile-N`** — always include both classes
3. **Always test both viewports** after changes
4. **Green collision dot is hidden on mobile** — intentional for centering
5. **Carousel dots hidden on mobile** — auto-rotates without user interaction
6. **Use `!important`** on all mobile slide rules
7. **JS handles viewport switching automatically** via `matchMedia`

---

## Dev Setup

```bash
cd "/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!"
python3 serve.py 8080
# Git:
git -C "/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!" status
```

---

## Quick-Start Checklist

- [ ] Verify image 1 still displays on mobile
- [ ] Verify desktop carousel is untouched
- [ ] Add image 2 (`img/2.jpeg`)
- [ ] Show owner for approval
- [ ] Continue through images 3–18 one at a time
- [ ] Clean up any skipped images
- [ ] Final pass: test mobile + desktop end-to-end

---

*End of handoff document.*
