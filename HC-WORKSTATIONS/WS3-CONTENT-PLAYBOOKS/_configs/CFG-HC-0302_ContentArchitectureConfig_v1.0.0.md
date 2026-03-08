---
document_id: HC-CFG-020-A
title: Content Architecture & Access Matrix
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS3 Content Playbooks
workstation: WS3-CONTENT-PLAYBOOKS
---

# Content Architecture & Access Matrix

## 1. Content Delivery Strategy

HIRECAR content follows the **Evidence Velocity Doctrine (EVD)**: every piece of content produces a clear next action, a timestamp, and connects the member to the next phase of their journey.

| Attribute | Value |
|---|---|
| Content Platform | Bit.ai (playbook hosting) |
| Landing Pages | Next.js on Cloudflare Pages |
| Blog / SEO | docs.hirecar.io/blog (Next.js ISR) |
| CDN | cdn.hirecar.io (Cloudflare) |
| Short Links | go.hirecar.io (Cloudflare redirect rules) |
| Email Templates | SendGrid dynamic templates |
| Video | YouTube channel + embedded players |

---

## 2. Bernays Consent Engineering Structure

Every playbook chapter follows a 4-part structure:

1. **THEME** — Why this matters to you as a rideshare operator (emotional connection)
2. **STRATEGY** — What you need to do (clear, actionable framework)
3. **APPROACH** — How to do it step-by-step using HIRECAR tools (tactical execution)
4. **CHAIN REACTION** — What this unlocks for you next (motivation + milestone gate)

---

## 3. Content Access Matrix

Content is gated by membership tier and journey phase.

### 3.1 Journey Phases

| Phase | Name | Content Types | Delivery Channel | Tier Access |
|---|---|---|---|---|
| Phase 1 | Intake | Welcome playbook, Getting Started guide | Bit.ai + Email | All tiers |
| Phase 2 | Recovery | Credit repair playbook, Dispute letter templates | Bit.ai + Hub | All tiers |
| Phase 3 | Rebuilding | Business credit guide, Vendor credit playbook | Bit.ai + Hub | Operator+ |
| Phase 4 | Operating | Fleet management guide, Tax optimization playbook | Hub + PDF | First Class+ |
| Phase 5 | Scaling | Scaling playbook, Investment strategy guide | Hub + PDF | Elite only |

### 3.2 Tier Entitlements

| Content Asset | Standard | Operator | First Class | Elite |
|---|---|---|---|---|
| Q1 Credit Playbook (Ch 1-4) | ✅ | ✅ | ✅ | ✅ |
| Dispute Letter Templates (5) | ✅ | ✅ | ✅ | ✅ |
| Credit Tracker Tool | ✅ | ✅ | ✅ | ✅ |
| Business Credit Guide | ❌ | ✅ | ✅ | ✅ |
| Vendor Credit Playbook | ❌ | ✅ | ✅ | ✅ |
| Fleet Management Guide | ❌ | ❌ | ✅ | ✅ |
| Tax Optimization Playbook | ❌ | ❌ | ✅ | ✅ |
| Scaling Playbook | ❌ | ❌ | ❌ | ✅ |
| Investment Strategy Guide | ❌ | ❌ | ❌ | ✅ |
| Priority support channel | ❌ | ❌ | ✅ | ✅ |
| 1:1 advisor sessions | ❌ | ❌ | ❌ | ✅ |

---

## 4. Content Personalization

Content is personalized using merge fields populated from the Zoho CRM HC_Enrollment module.

### 4.1 Merge Fields

| Field | Source (Zoho API Name) | Used In |
|---|---|---|
| `{{member_name}}` | Client_Name | Playbooks, emails, dashboard |
| `{{pin}}` | Access_PIN | Welcome email, welcome pass page |
| `{{tier}}` | Membership_Tier | Playbooks, dashboard, gating |
| `{{hbi_score}}` | HBI_Score | Dashboard, playbook recommendations |
| `{{enrollment_date}}` | Dispute_Date | Welcome email, timeline calculations |
| `{{score_range}}` | Score_Range | Playbook chapter recommendations |
| `{{dispute_id}}` | Dispute_ID | Dispute tracking, correspondence |
| `{{advisor_name}}` | Advisor_Name | Welcome email, support contacts |
| `{{phase}}` | (derived from Enrollment_Status) | Content gating, dashboard |

### 4.2 Content Recommendation Logic

| HBI Score | Phase | Recommended Content |
|---|---|---|
| 0-199 (Critical) | Phase 2 | Ch 1-2 priority, all dispute templates |
| 200-399 (Needs Work) | Phase 2 | Ch 2-3 priority, debt validation template |
| 400-599 (Fair) | Phase 2-3 | Ch 3-4, begin business credit guide |
| 600-799 (Good) | Phase 3-4 | Ch 4, business credit, vendor credit |
| 800-1000 (Excellent) | Phase 4-5 | Fleet guide, scaling playbook, investment |

---

## 5. SEO Content Calendar

| Month | Blog Posts (4/mo) | Guide (quarterly) | Case Study (quarterly) |
|---|---|---|---|
| Q2 2026 Apr | Rideshare credit basics, Dispute letter how-to, Insurance vs credit score, FCRA rights | Business Credit 101 for Drivers | Pilot member success story |
| Q2 2026 May | Fleet financing options, Credit monitoring apps, Debt-to-income ratio, Building tradelines | — | — |
| Q2 2026 Jun | Mid-year credit checkup, Collections defense, Score simulator tips, Vehicle loan refinancing | Tax Deductions for Rideshare | Operator tier upgrade story |

---

## 6. Video Content Categories

| Category | Cadence | Examples |
|---|---|---|
| Tutorials | 2/month | How to read your credit report, Filing a dispute step-by-step |
| Success Stories | 1/month | Member spotlight: from 500 to 720 in 6 months |
| Market Updates | 1/month | New rideshare financing options, Credit industry changes |
| Quick Tips | 2/month | 60-second tips: authorized user strategy, secured card picks |

---

## 7. Implementation Checklist

- [ ] Create Bit.ai workspace "HIRECAR Playbooks" with 5 phase collections
- [ ] Build master templates with merge fields for each playbook type
- [ ] Set up Bit.ai API access for Cloudflare Worker (enrollment chain Step 2)
- [ ] Deploy landing pages to Cloudflare Pages
- [ ] Configure go.hirecar.io short link redirects
- [ ] Set up docs.hirecar.io/blog with Next.js ISR
- [ ] Configure Google Search Console + Analytics for docs.hirecar.io
- [ ] Set up YouTube channel with branded profile
- [ ] Configure youtube-watcher (SKL-HC-1305) for upload notifications
- [ ] Build content recommendation engine in hub.hirecar.io
- [ ] Set up personalized email digests via SendGrid
- [ ] Test content gating across all 4 tiers

---

*Document Control: HC-CFG-020-A | WS3-CONTENT-PLAYBOOKS | 2026-03-04*
