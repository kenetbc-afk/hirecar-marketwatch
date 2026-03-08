# HIRECAR MarketWatch — Session Handoff
**Date:** March 7, 2026
**Engineer:** Claude (AI pair-programmer)
**Owner:** Ken Eckman

---

## Summary

Completed the **StickyScroll vertical stories section** — an Aceternity UI–inspired scroll-snap experience replacing the earlier horizontal swipe layout. This session finalized the JS active-card detection, implemented snap-lock behavior, unified the background to solid black, and tuned card sizing + text positioning per owner feedback.

---

## What Changed

### 1. StickyScroll JS Engine (`index.html` ~line 9849–9913)
- **Replaced** dead `storiesSwipe` horizontal IIFE with new `stickyStories` IIFE
- **Active card detection:** Offset-based comparison (`itemTop = offsetTop + wrapOffset` vs `scrollTop`) — robust against spacer sizing and sticky positioning
- **Hero crossfade:** Toggles `.active` class on `.ss-hero-img` elements for opacity-based image transitions
- **Snap-lock:** Window scroll listener detects when `#sec-stories` label reaches `headerH + 40px`, then auto-scrolls page to lock the stories section below the header
- **Header height CSS var:** Dynamically measures `.masthead` + `.util-bar` heights, sets `--ss-header-h` custom property

### 2. CSS Layout (desktop ~line 1158–1293, mobile ~line 5065–5091)
| Property | Desktop | Mobile (≤768px) |
|---|---|---|
| `.sticky-stories` height | `calc(100vh - var(--ss-header-h, 100px))` | `calc(100vh - var(--ss-header-h, 96px))` |
| `.sticky-stories` background | `#000` (solid black) | inherited |
| `.ss-hero-wrap` height | `50%` / `min-height: 240px` | `42%` / `min-height: 200px` |
| `.ss-item` min-height | `46vh` | `42vh` |
| `.ss-item` padding | `0 20px 6vh` | `0 16px 9.5vh` |
| `.ss-item` justify-content | `flex-end` | `flex-end` |
| `.ss-spacer` | `calc(100vh - var(--ss-header-h, 100px) - 38vh)` | inherited |
| `#sec-stories` | `sticky, top: var(--ss-header-h), bg: #000` | inherited |
| `overscroll-behavior-y` | `contain` | inherited |

### 3. Text Positioning
- Content (`category → title → blurb → byline`) uses `justify-content: flex-end` with bottom padding to sit **right above the "LIVE COVERAGE" badge** on the hero image
- 12px gap between byline bottom and badge top (measured and verified)

### 4. `populateFromData()` Update (~line 11819)
- Selectors changed from `.story-card` / `.story-cat-tag` / `.story-title` / `.story-blurb` → `.ss-item` / `.ss-item-cat` / `.ss-item-title` / `.ss-item-blurb`

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Offset-based active detection (not progress %) | Progress breakpoints broke when spacer distorted distribution; offset comparison is robust |
| `wrapOffset` added to item offsets | Items' `offsetParent` is `.ss-items` wrapper, not the scroll container — must add wrapper's `offsetTop` |
| `overscroll-behavior-y: contain` | Prevents scroll chaining — inner container scroll doesn't bleed to outer page |
| `--ss-header-h` CSS variable from JS | Responsive to any header height changes without hardcoding pixel values |
| Spacer formula `100vh - headerH - 38vh` | Ensures `maxScroll ≥ lastCardOffset` so all snap points are reachable |
| `justify-content: flex-end` + `padding-bottom` | Positions text content above the hero badge responsively without hardcoded pixel offsets |

---

## Verified Behavior (Mobile 375×812)

| Check | Result |
|---|---|
| Card 0 active at start | ✅ |
| Card 1 active at offset 645 | ✅ |
| Card 2 active at offset 986 | ✅ |
| Hero image crossfade | ✅ |
| maxScroll (1018) ≥ card 2 (986) | ✅ |
| Snap-lock engages at headerH=89px | ✅ |
| Text sits above LIVE COVERAGE (12px gap) | ✅ |
| Zero console errors | ✅ |

---

## Files Modified

| File | Change |
|---|---|
| `index.html` | StickyScroll CSS + HTML + JS + populateFromData() |
| `about/index.html` | Minor updates (prior session) |
| `booking/index.html` | Minor updates (prior session) |
| `contact/index.html` | Minor updates (prior session) |
| `entertainment/index.html` | Layout updates (prior session) |
| `home/index.html` | Minor updates (prior session) |
| `membership/index.html` | Minor updates (prior session) |
| `playbooks/index.html` | Minor updates (prior session) |
| `services/index.html` | Minor updates (prior session) |
| `terms/index.html` | Minor updates (prior session) |

---

## Known Considerations

1. **Content pipeline:** `data/articles.json` feeds `populateFromData()` — new articles will auto-populate the 3 story cards
2. **Spacer math is viewport-dependent:** If card min-heights change, recalculate spacer to maintain `maxScroll ≥ lastCardOffset`
3. **Snap-lock 900ms cooldown:** Prevents retriggering during smooth-scroll animation; may need tuning on slower devices
4. **Desktop hero is 50% height vs mobile 42%:** Bottom padding values differ (6vh desktop, 9.5vh mobile) to keep text above badge at both sizes
5. **Scroll-snap + sticky:** Tested on WebKit (Safari/Chrome); Firefox scroll-snap-type behavior is consistent but verify if targeting

---

## Dev Server

```bash
python3 serve.py 8080
# or use .claude/launch.json: "dev" configuration
```

---

*Prepared for Cloudflare Pages deployment via GitHub push.*
