---
document_id: HC-QA-020-A
title: WS2 End-to-End QA Validation Checklist
version: 1.0
date: 2026-03-04
status: READY FOR EXECUTION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
---

# WS2 End-to-End QA Validation Checklist

## Test Environment

| Field | Value |
|-------|-------|
| **Enrollment Worker** | `hirecar-enrollment-chain` (Cloudflare Workers) |
| **Worker Route** | `https://api.hirecar.io/enroll` |
| **Slack Channel** | #hirecar-enrollment-pipeline |
| **Config Doc** | HC-CFG-014-A |
| **Test Date** | ________ |
| **Tester** | ________ |

---

## Phase 1: Zoho CRM Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 1.1 | HC_Enrollment custom module exists | Module visible in CRM | ☐ |
| 1.2 | All 18 custom fields created | Fields match HC-CFG-010-A spec | ☐ |
| 1.3 | Score_Range picklist values | 300-579, 580-669, 670-739, 740-799, 800-850 | ☐ |
| 1.4 | Membership_Tier picklist values | Standard, Operator, First Class, Elite | ☐ |
| 1.5 | Enrollment_Status picklist values | LEAD, QUALIFIED, ENROLLED, ACTIVE, SUSPENDED | ☐ |
| 1.6 | Blueprint: 4 states configured | LEAD → QUALIFIED → ENROLLED → ACTIVE | ☐ |
| 1.7 | Blueprint: LEAD→QUALIFIED gate | Requires email + phone + score_range | ☐ |
| 1.8 | Blueprint: QUALIFIED→ENROLLED gate | Requires Access_PIN populated | ☐ |
| 1.9 | Blueprint: ENROLLED→ACTIVE gate | Requires Pass_URL + Playbook_URL | ☐ |
| 1.10 | Workflow Rule HC-WF-001 active | Fires on QUALIFIED status | ☐ |
| 1.11 | Webhook payload matches spec | All 9 fields present in JSON | ☐ |
| 1.12 | generateEnrollmentPIN function | Returns unique 6-digit PIN | ☐ |
| 1.13 | PIN collision check | 1000 sequential PINs, 0 collisions | ☐ |
| 1.14 | Dispute_ID auto-number format | DSP-2026-0001 pattern | ☐ |

---

## Phase 2: Cloudflare Worker Enrollment Chain Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 2.1 | Worker deployed at api.hirecar.io/enroll | Route responds to POST | ☐ |
| 2.2 | Auth: missing Bearer token rejected | 401 Unauthorized | ☐ |
| 2.3 | Auth: valid Bearer token accepted | Payload processed | ☐ |
| 2.4 | Validation: missing required fields | 400 with field name in error | ☐ |
| 2.5 | Step 1: PIN generation | 6-digit numeric PIN (100000-999999) | ☐ |
| 2.6 | Step 2: Bit.ai playbook created | Playbook URL returned, title contains client name | ☐ |
| 2.7 | Step 3: Playbook password set | PIN-protected, unlocks with generated PIN | ☐ |
| 2.8 | Step 4: PassKit pass created | Pass URL returned, externalId = HC-{dispute_id} | ☐ |
| 2.9 | Step 5: SendGrid email sent | Delivered within 30s, dynamic template data correct | ☐ |
| 2.10 | Step 6: Twilio SMS sent | Delivered within 15s, contains pass URL + PIN | ☐ |
| 2.11 | Step 7: Zoho CRM record updated | Enrollment_Status = ACTIVE, PIN/URLs populated | ☐ |
| 2.12 | Step 8: Slack notification posted | Message in #hirecar-enrollment-pipeline with client details | ☐ |
| 2.13 | Full chain execution time | All 8 steps complete < 30 seconds | ☐ |
| 2.14 | Error handling: API failure mid-chain | Partial result returned, Slack failure alert posted | ☐ |
| 2.15 | Error handling: invalid payload | 400 error, no side effects | ☐ |

---

## Phase 3: Welcome Pass Page Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 3.1 | Page loads at hirecar.la/welcome-pass | 200 OK, renders correctly | ☐ |
| 3.2 | Mobile rendering (iPhone 14) | Full content visible, no horizontal scroll | ☐ |
| 3.3 | Mobile rendering (Pixel 7) | Full content visible, no horizontal scroll | ☐ |
| 3.4 | Desktop rendering (1440px) | Centered, max-width respected | ☐ |
| 3.5 | Typography: Cormorant Garamond loads | Headings render in display font | ☐ |
| 3.6 | Typography: Nunito Sans loads | Body text renders in body font | ☐ |
| 3.7 | Colors match spec | Background #111820, gold #C9920A | ☐ |
| 3.8 | Status checkmarks visible | 3 green checkmark items | ☐ |
| 3.9 | Steps numbered correctly | 1-4 with gold circle numbers | ☐ |
| 3.10 | Support links functional | SMS, email, web links all work | ☐ |
| 3.11 | Analytics: pass_added event fires | dataLayer push on page load | ☐ |
| 3.12 | Accessibility: screen reader test | All content accessible, proper heading hierarchy | ☐ |
| 3.13 | Page load time | < 2 seconds on 3G | ☐ |

---

## Phase 4: Member Portal Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 4.1 | hub.hirecar.io resolves | DNS points to Cloudflare Pages | ☐ |
| 4.2 | OAuth login flow initiates | Redirects to Zoho Accounts | ☐ |
| 4.3 | OAuth callback processes | Token exchange completes, session created | ☐ |
| 4.4 | Score Overview dashboard loads | HBI hero + 5 sub-scores display | ☐ |
| 4.5 | Pass Status page loads | Pass details, status badge, QR visible | ☐ |
| 4.6 | Playbook Access page loads | Link + masked PIN, reveal toggle works | ☐ |
| 4.7 | Payment History page loads | Table renders, date filter works | ☐ |
| 4.8 | Unauthenticated redirect | Non-logged-in users redirect to /login | ☐ |
| 4.9 | Session expiry handling | Expired session redirects to login | ☐ |
| 4.10 | Mobile responsive | All pages render correctly on mobile | ☐ |
| 4.11 | WCAG 2.1 AA audit | 0 critical violations | ☐ |
| 4.12 | Load test: 100 concurrent users | p95 response < 3 seconds | ☐ |

---

## Phase 5: Scoring Systems Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 5.1 | CRI calculates on enrollment | Score 0-100, based on score_range + negatives | ☐ |
| 5.2 | VDI calculates on enrollment | Score 0-100, based on intake form | ☐ |
| 5.3 | BRE calculates on enrollment | Score 0-100, based on business readiness | ☐ |
| 5.4 | FPI calculates on enrollment | Score 0-100, based on financial data | ☐ |
| 5.5 | MSI defaults to 50 at enrollment | Neutral baseline | ☐ |
| 5.6 | HBI composite calculation | HBI = (CRI×0.30 + BRE×0.25 + FPI×0.20 + VDI×0.15 + MSI×0.10) × 10 | ☐ |
| 5.7 | HBI range validation | 0 ≤ HBI ≤ 1000 | ☐ |
| 5.8 | Component range validation | 0 ≤ each ≤ 100 | ☐ |
| 5.9 | Scores write to Zoho CRM | All 6 fields populated in HC_Enrollment | ☐ |
| 5.10 | Score change notification | ≥5pt change triggers PassKit push | ☐ |
| 5.11 | Score history logged | Each calc stored with timestamp + delta | ☐ |
| 5.12 | 10 test enrollments scored | All produce valid, non-zero scores | ☐ |

---

## Phase 6: Bot Fleet Validation

| # | Test | Expected | Pass/Fail |
|---|------|----------|-----------|
| 6.1 | bot.hirecar.io resolves | DNS points to Cloudflare Workers | ☐ |
| 6.2 | Health check sweep (all 140) | 140/140 bots respond "healthy" | ☐ |
| 6.3 | Department routing works | Requests route to correct department | ☐ |
| 6.4 | Unknown route returns 404 | Invalid paths handled gracefully | ☐ |
| 6.5 | Queue depth monitoring active | Alerts fire when queue > 10 | ☐ |
| 6.6 | Slack alerts configured | #hirecar-bot-ops receives failure alerts | ☐ |
| 6.7 | Bot failure recovery | Failed bot auto-restarts within 60s | ☐ |
| 6.8 | Concurrent request handling | 100 requests/s sustained for 60s | ☐ |

---

## Phase 7: End-to-End Integration Test

### Test Scenario: Full Enrollment Flow

**Test Data:**
```json
{
  "client_name": "Jane Test-Smith",
  "client_email": "test@hirecar.la",
  "client_phone": "+12135550199",
  "score_range": "580-669",
  "negative_items": "2 collections, 1 charge-off, 1 late payment",
  "advisor_name": "Ken Eckman",
  "membership_tier": "Standard"
}
```

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| E2E-1 | Create HC_Enrollment record in Zoho | Record created in LEAD status | ☐ |
| E2E-2 | Move to QUALIFIED status | Webhook fires to Cloudflare Worker | ☐ |
| E2E-3 | Worker processes all 8 steps | < 30 seconds total | ☐ |
| E2E-4 | Verify Bit.ai playbook exists | Accessible at returned URL | ☐ |
| E2E-5 | Verify playbook password | Unlocks with generated PIN | ☐ |
| E2E-6 | Verify PassKit pass | Installable on iOS/Android | ☐ |
| E2E-7 | Verify welcome email | Received with correct template data | ☐ |
| E2E-8 | Verify SMS | Received with pass URL + PIN | ☐ |
| E2E-9 | Verify Zoho record updated | Status=ACTIVE, PIN/URLs populated | ☐ |
| E2E-10 | Add pass to wallet | Pass appears in Apple/Google Wallet | ☐ |
| E2E-11 | Welcome page redirect | hirecar.la/welcome-pass displays | ☐ |
| E2E-12 | Login to member portal | OAuth flow, dashboard loads | ☐ |
| E2E-13 | Verify scores on dashboard | All 6 scores display correctly | ☐ |
| E2E-14 | Verify pass status page | Pass details match enrollment data | ☐ |
| E2E-15 | Open playbook from portal | Playbook link works, PIN unlocks | ☐ |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| WS2 Owner | | | |
| Director | | | |

### Gate Criteria for Production Go-Live

All of the following must be true:
- [ ] All Phase 1–6 tests pass (100%)
- [ ] All E2E integration tests pass (E2E-1 through E2E-15)
- [ ] Zero P1 defects open
- [ ] Zero P2 defects older than 24 hours
- [ ] Performance: enrollment chain < 30s, portal p95 < 3s
- [ ] PassKit project moved from Draft → Live
- [ ] SendGrid domain authentication verified for hirecar.la
- [ ] Twilio phone number verified and messaging service active
- [ ] API keys rotated after testing
- [ ] All documents pass BOT-HC-0002 QA validation scan

---

*Document Control: HC-QA-020-A | WS2-BOT-ENROLLMENT | 2026-03-04*
