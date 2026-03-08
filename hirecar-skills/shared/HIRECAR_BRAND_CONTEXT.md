---
document_id: HC-CFG-002-A
title: HIRECAR Brand Context & Design Tokens
version: 1.0
date: 2026-03-04
status: ACTIVE
classification: Internal — All Workstations
---

# HIRECAR Brand Context & Design Tokens
**HC-CFG-002-A** | Rev A | 2026-03-04

---

## 1. Brand Identity

**Company:** HIRECAR
**Tagline:** Auto Operator Intelligence
**Markets:** Los Angeles, San Francisco
**Audience:** Rideshare operators (Uber/Lyft drivers), fleet operators, automotive service clients
**Domain:** hirecar.la
**Dashboard:** Member dashboard on Vercel

---

## 2. Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#111820` | Primary text, dark backgrounds |
| `--cta-gold` | `#C9920A` | CTAs, buttons, accent highlights |
| `--live-red` | `#C0392B` | Alerts, live indicators, urgent status |
| `--member-blue` | `#0F4C75` | Member areas, dashboard accents, links |

### Typography
| Role | Font | Fallback |
|------|------|----------|
| Headings | Cormorant Garamond | Georgia, serif |
| Body | Nunito Sans | Arial, sans-serif |
| Code / Data | DM Mono | Courier New, monospace |

### Spacing Scale
```
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

### Border Radius
```
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 16px
--radius-pill: 9999px
```

---

## 3. Architecture Overview

### Ecosystem Scale
- **140 bots** across 16 departments
- **5-phase client journey:** Intake → Recovery → Rebuilding → Operating → Scaling
- **6 scoring systems:** HBI (Health), VDI (Vehicle), BRE (Business), CRI (Credit), FPI (Financial), MSI (Member)
- **4-tier membership:** Standard → Operator → First Class → Elite

### Tech Stack
| Layer | Technology | Hosting |
|-------|-----------|---------|
| Public Site | Next.js / Static | Cloudflare Pages (free) |
| Member Dashboard | Next.js App Router | Vercel (free) |
| Automation | Cloudflare Workers | Free plan (10M requests/mo) |
| DNS | GoDaddy | — |
| Email | Brevo | Free tier |
| CRM | Zoho CRM | Free tier |
| Payments | Stripe + PayPal + CashApp + 9 BNPL | — |

### Cloudflare Worker Deployment
- **Endpoint:** https://api.hirecar.la
- **Routes:** /api/enroll, /api/leads, /api/sms/*, /webhooks/stripe, /health
- **Plan:** Free (10M requests/month, unlimited CPU time)

### PassKit Integration
- **API Endpoint:** `https://api.pub1.passkit.io`
- **API Key:** `H_LUGJ5bEP7E0mpEKBCDGe-jIFea6hTk_zXphmpd7DM5lSiV8QL8oB9lcCu0ElRHTl33Wuahii0wQLnyB0Q1j3qWkiB-jL-SSDM68H62zDS47HQjKej-wTYjrEkKQAjdqk3O9EIWCP5OzHZn8D48Wfrkt5KO_RLlThUYTH6WfQNqjHgLqr7zK15AgyizEk0AlXTxxgU0bOcddz-SSydrfo47j7gBzm0l9KkckAhn9L4n9rLH-TAIjxeT0MihhVQJekQAyZvW6FvY5bSqvmUtzxWvGKOmUg5kICliSzn5d8UmzQqB5KpKtEvg_iHWBtY1`
- **Pass Type:** Generic (Apple Wallet + Google Wallet)
- **Auth:** Bearer token in Authorization header
- **⚠️ ROTATE AFTER SESSION** — Store in environment variable, never hardcode in production

---

## 4. Document Control Convention

### Document ID Format
```
HC-{TYPE}-{SEQ}-{REV}
```

### Type Codes
| Code | Type | Description |
|------|------|-------------|
| PLN | Plan | Project plans, roadmaps |
| ARC | Architecture | System design, technical specs |
| SOP | Procedure | Standard operating procedures |
| WPK | Workspace Package | Deployment instruction sets |
| TMP | Template | Reusable templates |
| RPT | Report | Analysis, readiness, status reports |
| EAP | Executive Package | Leadership/board deliverables |
| LGL | Legal | Terms, privacy, compliance |
| CNT | Content | Marketing, copy, playbooks |
| CFG | Configuration | Settings, tokens, manifests |

### Revision Convention
- Rev A = Initial release
- Rev B, C, D... = Sequential revisions
- Each revision requires change log entry

### File Naming
```
HIRECAR_{Description}_{Version}.{ext}
WS{N}_{Description}_Package.{ext}
```

---

## 5. Department Map (16 Departments)

1. **Intake & Onboarding** — New client registration, eligibility screening
2. **Vehicle Diagnostics** — VDI scoring, inspection workflows
3. **Credit & Finance** — CRI scoring, credit repair pathways, FICO optimization
4. **Insurance Operations** — Policy comparison, claims tracking
5. **Fleet Management** — Multi-vehicle operator dashboards
6. **Maintenance & Repair** — Service scheduling, vendor network
7. **Compliance & Licensing** — DMV, TLC, rideshare platform compliance
8. **Member Services** — Tier management, support escalation
9. **Marketing & Content** — BitDocs, playbooks, email campaigns
10. **Payments & Billing** — Stripe, PayPal, BNPL processing
11. **Data & Analytics** — Scoring systems, reporting dashboards
12. **Technology & DevOps** — Infrastructure, CI/CD, monitoring
13. **Legal & Privacy** — Terms, CCPA compliance, dispute resolution
14. **Partnerships & Referrals** — Vendor network, affiliate programs
15. **Training & Education** — Operator guides, financial literacy
16. **Executive & Strategy** — Leadership dashboards, KPIs

---

## 6. Scoring Systems Reference

### HBI — Health & Business Index
Overall operator health combining all sub-scores. Range: 0-100.

### VDI — Vehicle Diagnostics Index
Vehicle condition, maintenance history, mileage, inspection status. Range: 0-100.

### BRE — Business Readiness Evaluation
Business registration, insurance, licensing, platform compliance. Range: 0-100.

### CRI — Credit Readiness Index
FICO score bracket, credit utilization, dispute status, improvement trajectory. Range: 0-100.

### FPI — Financial Performance Index
Revenue trends, expense ratios, savings rate, debt-to-income. Range: 0-100.

### MSI — Member Satisfaction Index
Engagement, support tickets, referral activity, platform usage. Range: 0-100.

---

## 7. Membership Tiers

| Tier | Requirement | Benefits |
|------|-------------|----------|
| **Standard** | Registration complete | Basic access, single vehicle |
| **Operator** | HBI ≥ 50, 90 days active | Priority support, fleet tools |
| **First Class** | HBI ≥ 70, 180 days, referrals | Premium rates, multi-vehicle |
| **Elite** | HBI ≥ 85, 365 days, mentor status | Concierge, fleet expansion loans |

---

## 8. Logo & Asset Status

> **⚠️ LOGO FILES NOT YET PROVIDED**
> No logo PNG/SVG/JPG files are present in the repository.
> Required assets for deployment:
> - `hirecar-logo-primary.svg` — Full logo (dark background)
> - `hirecar-logo-light.svg` — Light version (white background)
> - `hirecar-icon.svg` — Icon/favicon mark
> - `hirecar-logo-primary.png` — Raster fallback (min 512px)
> - `og-image.png` — Social sharing image (1200×630)
>
> **Action Required:** Upload logo files to `/hirecar-skills/shared/assets/` before deployment.

---

*Document Control: HC-CFG-002-A | Classification: Internal | Generated: 2026-03-04*
