# HIRECAR Membership Card Design Specification
**Document ID:** HC-DSN-001-A
**Version:** 1.0
**Date:** March 4, 2026
**Status:** Draft — Ready for PassKit Implementation
**Purpose:** Visual and technical specification for HIRECAR membership cards across 4 tiers. This spec guides the PassKit dashboard design and configuration for Apple Wallet (pkpass) and Google Pay compatibility.

---

## 1. Overview

Each HIRECAR member receives a digital membership card delivered via Apple Wallet and Google Pay. Cards serve three purposes: tier identification, member verification (via QR code), and brand reinforcement. There are four card tiers corresponding to HIRECAR's membership levels.

**Card Format:** Apple Wallet `.pkpass` (Generic Pass type) + Google Pay Loyalty Card
**QR Code Payload:** Member profile URL — `https://hub.hirecar.io/member/[MEMBER-ID]`
**Fallback:** Member ID string `HC-2026-XXXXX` if URL is not yet live

---

## 2. Shared Design Elements (All Tiers)

### 2.1 Dimensions & Layout
- **Apple Wallet:** Standard pass dimensions (320 × 440 pt @2x = 640 × 880 px)
- **Google Pay:** Recommended 1032 × 336 px hero image; logo 660 × 660 px
- **Safe zone:** 16pt inset from all edges for critical content

### 2.2 Typography
- **Brand Name:** Georgia Bold, 22pt, ALL CAPS, letter-spacing 2px
- **Member Name:** Segoe UI Bold, 16pt, Title Case
- **Member ID:** Segoe UI Regular, 12pt, monospace appearance
- **Tier Badge:** Segoe UI Bold, 10pt, ALL CAPS, letter-spacing 1px
- **Fallback fonts:** Helvetica Neue, Arial (if custom fonts unavailable in PassKit)

### 2.3 Logo
- **HIRECAR wordmark** in Georgia Bold
- Positioned top-left on all cards
- Color varies by tier (see individual specs below)
- Dimensions: 140 × 28 pt (Apple), scaled proportionally for Google Pay

### 2.4 QR Code
- Position: bottom-center of card
- Size: 80 × 80 pt (Apple Wallet), scaled for Google Pay
- Format: QR Code (ISO/IEC 18004)
- Error correction: Level M (15%)
- Foreground: matches tier accent color
- Background: white with 4pt quiet zone
- Payload: `https://hub.hirecar.io/member/[MEMBER-ID]`

### 2.5 Card Back / Secondary Fields
All tiers share the same back-of-card fields:

| Field | Label | Value |
|-------|-------|-------|
| Tier | Membership | [Standard / Operator / First Class / Elite] |
| Since | Member Since | [MM/YYYY] |
| Phase | Current Phase | [Phase 1–4] |
| Support | Support | support@hirecar.la |
| Phone | Phone | (213) 768-6311 |
| Website | Website | hirecar.la |

---

## 3. Tier-Specific Designs

### 3.1 Standard Tier

**Visual Identity:** Clean, professional, accessible

| Element | Specification |
|---------|--------------|
| **Background** | Linear gradient: `#B0B8C1` (top) → `#D1D5DB` (bottom) — Silver/gray |
| **Brand Wordmark** | Color: `#111820` (Ink) |
| **Member Name** | Color: `#111820` |
| **Member ID** | Color: `#4B5563` |
| **Tier Badge** | Text: "STANDARD" — Background: `#111820`, Text: `#FFFFFF`, Rounded pill shape (16pt height, 8pt border-radius) |
| **QR Foreground** | `#111820` |
| **Accent Line** | 2pt horizontal rule below brand, color `#9CA3AF` |
| **Icons** | None — clean minimal design |

**Layout (top to bottom):**
1. HIRECAR wordmark (top-left)
2. Gray accent line
3. Member Name (centered, vertically centered)
4. Member ID: `HC-2026-XXXXX` (centered, below name)
5. STANDARD badge (centered, below ID)
6. QR Code (bottom-center)

---

### 3.2 Operator Tier

**Visual Identity:** Warm, aspirational, gold-forward

| Element | Specification |
|---------|--------------|
| **Background** | Linear gradient: `#C9920A` (top-left) → `#A67708` (bottom-right) — Gold |
| **Brand Wordmark** | Color: `#FFFFFF` |
| **Member Name** | Color: `#FFFFFF` |
| **Member ID** | Color: `rgba(255,255,255,0.8)` |
| **Tier Badge** | Text: "OPERATOR" — Background: `#111820`, Text: `#C9920A`, Rounded pill |
| **QR Foreground** | `#111820` |
| **Accent Line** | 2pt horizontal rule below brand, color `rgba(255,255,255,0.3)` |
| **Benefits Icon** | Small star icon (★) next to badge — `#FFFFFF`, 12pt. Indicates upgraded benefits |

**Layout (top to bottom):**
1. HIRECAR wordmark (top-left)
2. White accent line
3. Member Name (centered)
4. Member ID (centered)
5. ★ OPERATOR badge (centered)
6. QR Code (bottom-center)

---

### 3.3 First Class Tier

**Visual Identity:** Premium, sleek, authoritative

| Element | Specification |
|---------|--------------|
| **Background** | Solid: `#111820` (Ink/Black matte) — no gradient, pure dark elegance |
| **Brand Wordmark** | Color: `#C9920A` (Gold) |
| **Member Name** | Color: `#C9920A` (Gold) |
| **Member ID** | Color: `rgba(201,146,10,0.7)` |
| **Tier Badge** | Text: "FIRST CLASS" — Background: `#C9920A`, Text: `#111820`, Rounded pill |
| **QR Foreground** | `#C9920A` (Gold QR on white) |
| **Accent Line** | 2pt horizontal rule, color `#C9920A` |
| **Premium Icon** | Crown icon (♛) next to badge — `#C9920A`, 14pt. Indicates premium tier |
| **Subtle Texture** | Optional: very faint diagonal line pattern at 3% opacity in `#1a2a3a` for depth |

**Layout (top to bottom):**
1. HIRECAR wordmark in gold (top-left)
2. Gold accent line
3. Member Name in gold (centered)
4. Member ID in muted gold (centered)
5. ♛ FIRST CLASS badge (centered)
6. QR Code with gold foreground (bottom-center)

---

### 3.4 Elite Tier

**Visual Identity:** Exclusive, holographic-inspired, unmistakable

| Element | Specification |
|---------|--------------|
| **Background** | Linear gradient simulating iridescence: `#111820` → `#1a2a3a` → `#0F4C75` → `#111820` (45° angle). Apple Wallet: use the darkest variant since animation isn't supported. Google Pay: same static gradient |
| **Brand Wordmark** | Color: `#C9920A` (Gold) |
| **Member Name** | Color: `#FFFFFF` |
| **Member ID** | Color: `rgba(255,255,255,0.7)` |
| **Tier Badge** | Text: "ELITE" — Background: linear gradient `#C9920A` → `#E8B931`, Text: `#111820`, Rounded pill, slightly larger (18pt height) |
| **QR Foreground** | `#C9920A` |
| **Accent Line** | 2pt horizontal rule, gradient from `#C9920A` → `#0F4C75` → `#C9920A` |
| **All-Access Icon** | Shield icon (🛡) next to badge — `#C9920A`, 14pt. Represents full protection / all-access |
| **Holographic Effect** | For digital mockups: subtle rainbow gradient overlay at 8-10% opacity. Colors: `#FF6B6B`, `#4ECDC4`, `#45B7D1`, `#96E6A1` cycling across a 45° angle. In PassKit, approximate with the blue-shift gradient background |
| **Edge Highlight** | 1pt border inset, color `rgba(201,146,10,0.3)` — subtle gold frame |

**Layout (top to bottom):**
1. HIRECAR wordmark in gold (top-left)
2. Iridescent accent line
3. Member Name in white (centered)
4. Member ID (centered)
5. 🛡 ELITE badge with gradient fill (centered)
6. QR Code with gold foreground (bottom-center)

---

## 4. Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Ink | `#111820` | Text, dark backgrounds |
| Gold | `#C9920A` | Brand accent, Operator bg, premium text |
| Gold Light | `#E8B931` | Elite badge gradient end |
| Blue | `#0F4C75` | Member Blue, Elite gradient accent |
| White | `#FFFFFF` | Text on dark, QR background |
| Silver Light | `#D1D5DB` | Standard gradient end |
| Silver Dark | `#B0B8C1` | Standard gradient start |
| Gray | `#9CA3AF` | Standard accent line |

---

## 5. PassKit Implementation Notes

### 5.1 Apple Wallet (pkpass)
- **Pass Type:** Generic Pass (`generic`)
- **Required Assets:**
  - `icon.png` / `icon@2x.png` — HIRECAR "H" monogram (29 × 29 pt / 58 × 58 px)
  - `logo.png` / `logo@2x.png` — HIRECAR wordmark (160 × 50 pt / 320 × 100 px)
  - `strip.png` / `strip@2x.png` — Tier background (320 × 123 pt / 640 × 246 px)
- **barcode:** QR format, message = member profile URL, altText = Member ID
- **Colors:** Set `backgroundColor`, `foregroundColor`, `labelColor` per tier
- **Relevance:** Can set relevant locations (LA area) for lock screen suggestions

### 5.2 Google Pay
- **Object Type:** Loyalty Object
- **Required Assets:**
  - Hero image (1032 × 336 px) — tier-specific background with brand + member info
  - Logo (660 × 660 px) — HIRECAR icon/monogram
- **Barcode:** QR format, same payload as Apple
- **Colors:** Set `hexBackgroundColor` per tier
- **Loyalty Points:** Can be mapped to "Phase" (1–4) as a progress indicator

### 5.3 Dynamic Fields
These fields are populated per-member from the enrollment system:

| Field Key | Source | Example |
|-----------|--------|---------|
| `memberName` | Enrollment form → Full Name | "Marcus Johnson" |
| `memberId` | Auto-generated | "HC-2026-00142" |
| `tier` | Enrollment form → Selected Tier | "Operator" |
| `memberSince` | Enrollment date | "03/2026" |
| `phase` | Default Phase 1, updated manually | "Phase 1: Intake" |
| `qrPayload` | Computed | "https://hub.hirecar.io/member/HC-2026-00142" |

### 5.4 Update Triggers
Cards should be updated (push notification to wallet) when:
- Member upgrades/downgrades tier (background + badge change)
- Member advances to a new phase (phase field update)
- Member ID or name correction

---

## 6. Mockup Descriptions (for Designer Reference)

Since this is a specification document, here are verbal descriptions for creating visual mockups:

### Standard Card Mockup
Imagine a silver credit card. Soft gray gradient from darker at top to lighter at bottom. "HIRECAR" in dark ink at top-left. A thin gray line spans the width below the brand. Centered in the middle third: member name in dark text, member ID below it in slightly lighter gray. A small dark pill-shaped badge reads "STANDARD" in white. At the bottom center, a small QR code in dark ink on a white square.

### Operator Card Mockup
A warm gold card — like a premium debit card. Rich gold gradient across the surface. "HIRECAR" in white at top-left. Faint white line below. Member name and ID in white, centered. A dark pill badge with gold "OPERATOR" text and a small white star beside it. QR code at bottom in dark ink on white.

### First Class Card Mockup
Pure black matte card — the kind you'd see at a VIP lounge. "HIRECAR" glows in gold at top-left. Gold accent line. Member name in gold, ID in a softer gold. A gold pill badge with dark "FIRST CLASS" text and a gold crown symbol. Gold-toned QR code on white at bottom. Optionally, very subtle diagonal texture lines barely visible in the black.

### Elite Card Mockup
The showpiece. Dark card base, but with a subtle color-shift gradient that hints at deep blue and teal within the darkness — like a holographic card catching light. "HIRECAR" in gold at top-left. An accent line that shifts from gold to blue and back. Member name in crisp white, ID below. A slightly oversized badge with a gold-to-bright-gold gradient reading "ELITE" with a gold shield icon. A subtle gold border frames the entire card. QR code at bottom with gold foreground.

---

## 7. File Deliverables Checklist

| # | Asset | Format | Status |
|---|-------|--------|--------|
| 1 | Standard card mockup | PNG (640 × 880 px) | ☐ Pending |
| 2 | Operator card mockup | PNG (640 × 880 px) | ☐ Pending |
| 3 | First Class card mockup | PNG (640 × 880 px) | ☐ Pending |
| 4 | Elite card mockup | PNG (640 × 880 px) | ☐ Pending |
| 5 | HIRECAR icon (all tiers) | PNG (58 × 58 px @2x) | ☐ Pending |
| 6 | HIRECAR logo (all tiers) | PNG (320 × 100 px @2x) | ☐ Pending |
| 7 | Strip images (per tier) | PNG (640 × 246 px @2x) | ☐ Pending |
| 8 | Google Pay hero (per tier) | PNG (1032 × 336 px) | ☐ Pending |
| 9 | Google Pay logo | PNG (660 × 660 px) | ☐ Pending |
| 10 | PassKit project config | JSON / PassKit Dashboard | ☐ Pending |

---

*This specification is a design guide for PassKit dashboard configuration. WS2 Task 2.10 handles the actual API integration for card generation and delivery.*
