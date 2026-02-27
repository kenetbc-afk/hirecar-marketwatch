# HIRECAR.LA — Site Architecture & Page Drafts
## Republishing Blueprint · February 2026

---

## Design System Tokens (Inherited from MarketWatch v21)

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#111820` | Primary text, headers |
| `--cta` | `#c9920a` | Gold CTA, accents |
| `--live` | `#c0392b` | Breaking/live badges |
| `--member` | `#0f4c75` | Member accent blue |
| Serif | Cormorant Garant | Headlines, display |
| Sans | Nunito Sans | Body, UI |
| Mono | DM Mono | Labels, data, code |

---

## Page Types & Design Language

### 1. MARKETPLACE FRAMEWORK (Editorial/Intelligence)
**Pages:** Home, MarketWatch Hub, News Categories, Individual Articles
**Feel:** LA Times / PYMNTS editorial — newspaper grid, data intelligence, gold CTA bars
**Components:** Ticker bar, hero area, card grids, MCI intelligence bar, trending strip
**File:** `01-home-marketplace.html`

### 2. BIO PAGES (Biographical/Corporate)
**Pages:** About HIRECAR, About Ken Eckman, Contact Us
**Feel:** Premium corporate bio — large hero portraits, timeline, founder story
**Components:** Full-bleed hero, story timeline, team cards, philosophy blocks
**File:** `02-about-bio.html`, `02b-contact.html`

### 3. LEGAL PAGES (Formal/Structured)
**Pages:** Terms & Conditions, Privacy Policy
**Feel:** Clean, structured, high-contrast — inspired by Stripe/Apple legal pages
**Components:** Table of contents sidebar, numbered sections, last-updated badge
**File:** `03-terms-legal.html`

### 4. PLAYBOOKS & STANDARDS (Apple Developer Docs)
**Pages:** Operator Playbooks Hub, HBI Scoring, BRE Standards, PIFR Protocol, VDI Checklist, Custody Log Standards
**Feel:** developer.apple.com/documentation — sidebar nav, hierarchical content, code-like formatting
**Components:** Left sidebar tree nav, breadcrumbs, versioned docs, status badges, expandable sections
**File:** `04-playbooks-standards.html`

### 5. GAMIFIED PAGES (Interactive/Achievement)
**Pages:** Services Hub, Appointment Booking, Credit Repair Intake, SeedXchange Application
**Feel:** Gamified progress — level indicators, achievement cards, progress bars, unlockable tiers
**Components:** Service cards with status, progress tracker, qualification meter, step wizard
**File:** `05-services-gamified.html`, `05b-appointment-booking.html`

### 6. MEMBERS PAGE (Exclusive/VIP)
**Pages:** First Class Membership
**Feel:** Luxury tier — dark, gold accents, exclusive access gates, perk reveals
**Components:** Tier comparison, perk cards with unlock animation, member dashboard preview
**File:** `06-members-firstclass.html`

---

## CMS Collections to Create

| Collection ID | Purpose | Fields |
|---------------|---------|--------|
| `HirecarPlaybooks` | Playbook/Standards docs | title, slug, category, version, status, content, lastUpdated |
| `HirecarServices` | Service catalog | name, category, status, description, icon, ctaUrl, tier |
| `HirecarArticles` | MarketWatch articles | title, slug, category, author, publishDate, excerpt, content, heroImage |
| `HirecarTeam` | Team bios | name, title, bio, photo, social |

---

## Blog Categories to Create
- Credit Repair
- Collision + Claims
- Operator Standards
- Recovery + PIFR
- Auto Insurance
- Small Business Funding
- Mobility + Rentals
- Roadside + Emergency
- Entertainment
- MARKETWATCH Intelligence
- Operator Playbooks

---

## Wix API Actions Required
1. Create CMS collections (HirecarPlaybooks, HirecarServices, HirecarArticles, HirecarTeam)
2. Create blog categories
3. Create initial blog posts (editorial content)
4. Create Pricing Plan (First Class Membership - $1,380/yr)
5. Create Booking Services (CreditWithKen sessions, appointments)
6. Upload media assets via Media Manager
