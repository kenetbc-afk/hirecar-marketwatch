# HIRECAR MarketWatch — Session Handoff
**Date:** 2026-03-05 → 2026-03-06
**Commit:** `b874091` on `main` — pushed to `kenetbc-afk/hirecar-marketwatch`
**Status:** All changes deployed to GitHub Pages

---

## What Was Done This Session

### Mobile Hero Redesign (index.html only)
Completely reworked the mobile credit module hero section across two breakpoints (`768px` and `480px`). Desktop is untouched.

**Layout changes:**
- Overlay text repositioned to upper third (`top: 18%` / `16%`) — "stands on top" of the image
- Heavy dark gradient bleeds at top (0.92 opacity through header) and bottom (0.95 opacity under buttons), clearing in the middle to let the image breathe
- CTA buttons pulled up into the hero using negative margin overlap (`margin-top: -52vh; min-height: 52vh; justify-content: flex-end`)
- Buttons constrained to proportional width (`max-width: 280px` / `240px`) and centered with `margin: 0 auto` — no longer stretching edge-to-edge
- CTA panel background removed (`background: none`) — hero gradient handles all dark bleed

**Carousel image tuning:**
- All desktop zoom transforms stripped (`transform: none !important`)
- Per-slide `object-position` tuned for portrait mobile crop (values biased 30-50% horizontal, not desktop values)
- All 9 slides: city-slide, porsche-911, ferrari-road, mercedes-amg, cars-disney, collision-night, la-mural, storage-accident, dtla-buildings

**Sizing (768px → 480px):**
- Button font: 11px → 10.5px
- Button padding: 10px 16px → 9px 14px
- Actions container: max-width 320px → 260px
- Hero height: calc(75vh + 48px) → calc(70vh + 48px)
- Module-main overlap: -52vh → -50vh

### Skill Document Created
`hirecar-skills/mobile-hero-redesign-v2.md` — full architecture reference, gradient values, focal point table, button sizing table, key learnings, quick-reference for future modifications.

### Dev Server Config
`.claude/launch.json` updated — all 3 servers configured:
- `hirecar-marketwatch` — python3 serve.py on port 8080
- `hirecar-workers` — npm --prefix hirecar-workers run dev on port 8787
- `payment-orchestration` — npm --prefix payment-orchestration run dev on port 8788

---

## File Locations

| What | Where |
|------|-------|
| Landing page | `index.html` (~7300 lines) |
| 768px mobile hero CSS | ~lines 3135-3260 |
| 480px mobile overrides | ~lines 3417-3439 |
| Desktop carousel (DO NOT TOUCH from mobile) | ~lines 463-522 |
| Session skill doc | `hirecar-skills/mobile-hero-redesign-v2.md` |
| Dev server config | `.claude/launch.json` |
| Local dev server | `serve.py` (python3 serve.py 8080) |
| Auto-memory | Updated with mobile hero reference + git -C workaround |

---

## Known Issues / Not Changed

1. **Other page files are modified but uncommitted** — `about/`, `booking/`, `contact/`, `entertainment/`, `home/`, `membership/`, `playbooks/`, `services/`, `terms/` all show as modified in git status. These were NOT part of this session's work.

2. **Many untracked files** — dozens of `.docx`, images, workflow files, etc. in the repo root. Not committed.

3. **Unsplash ORB errors** — pre-existing `ERR_BLOCKED_BY_ORB` on some Unsplash cross-origin image fetches. Not caused by this session's changes, exists throughout the page for non-carousel images.

4. **Git credential warning** — `gh auth git-credential` path doesn't exist (`/tmp/gh-install/gh_2.67.0_macOS_amd64/bin/gh`). Push still works but shows error messages. May want to reinstall `gh` CLI.

5. **Git committer identity** — commits use auto-detected `hirecarken@hirecarkens-MacBook-Pro.local`. Can be fixed with `git config --global user.name` and `user.email`.

---

## To Continue Next Session

### Start dev server
```
python3 serve.py 8080
```
Or use Claude Preview: `preview_start("hirecar-marketwatch")`

### Git commands (use -C flag for this repo)
```bash
git -C "/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!" status
git -C "/Users/hirecarken/Desktop/DOC CRTL/:HIRECAR MARKET WATCH!" log --oneline -5
```

### Quick CSS edits reference
- **Move text up/down:** `.credit-overlay { top: 18% }` (768px breakpoint ~line 3196)
- **Adjust button width:** `.credit-cta-primary, .credit-cta-secondary { max-width: 280px }` (~line 3256)
- **Adjust image framing:** `.carousel-slide.{class} { object-position: X% Y% !important }` (~lines 3157-3165)
- **Darken/lighten bleed:** `rgba(0,0,0,.XX)` values in `.credit-icon::before` gradient (~lines 3170-3179)
- **Button overlap depth:** `.credit-module-main { margin-top: -52vh; min-height: 52vh }` (~line 3241) — both values must match

### Suggested next steps
- Review and commit the other modified page files (about/, booking/, etc.)
- Clean up untracked files (commit or .gitignore)
- Fix git identity config
- Reinstall `gh` CLI if needed
- Test on actual device (not just preview) to verify touch targets and scroll behavior
