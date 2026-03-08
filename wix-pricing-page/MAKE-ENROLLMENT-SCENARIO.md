# ⚠️ DEPRECATED: Make.com Enrollment Scenario
**BOT-HC-0101-MAKE** | HIRECAR Enrollment Pipeline [ARCHIVED]
*For: Org 6735282 / Team 1939114*
*Status: DEPRECATED as of 2026-03-04*

---

## DEPRECATION NOTICE

**This document describes a legacy Make.com scenario that is no longer in use.**

As of March 4, 2026, the enrollment automation has been migrated to a **Cloudflare Worker** at `api.hirecar.la/enroll`. Direct Stripe webhooks to `/webhooks/stripe` are now processed by the Worker without Make.com intermediation.

**Historical reference:** This scenario was HC-SCN-001 (7 modules, Make.com Free Plan constraint).

---

## Previous Scenario Overview

The original Make.com scenario connected Stripe checkout events to an enrollment pipeline, with a Slack fallback notification in case of failure.

**Trigger:** Stripe → `checkout.session.completed`
**Actions:** Worker API call → Slack notification → Error handling

---

## Scenario Blueprint (2-Module Design)

### Module 1: Stripe Webhook (Trigger)
- **App:** Stripe
- **Module:** Watch Events
- **Event Type:** `checkout.session.completed`
- **Connection:** Use your Stripe connection (test mode)
- **Output:** Full checkout session object

### Module 2: HTTP Request → Worker API
- **App:** HTTP
- **Module:** Make a Request
- **URL:** `https://api.hirecar.la/api/enroll`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{WORKER_API_KEY}}`
- **Body (JSON):**
```json
{
  "email": "{{1.data.object.customer_details.email}}",
  "name": "{{1.data.object.customer_details.name}}",
  "phone": "{{1.data.object.customer_details.phone}}",
  "tier": "{{1.data.object.metadata.tier}}",
  "stripeCustomerId": "{{1.data.object.customer}}",
  "stripeSubscriptionId": "{{1.data.object.subscription}}",
  "amountPaid": "{{1.data.object.amount_total}}",
  "currency": "{{1.data.object.currency}}"
}
```

### Error Handler (on Module 2 failure)
- **App:** Slack
- **Module:** Send a Message
- **Channel:** `#hirecar`
- **Message:**
```
🚨 *ENROLLMENT RELAY FAILED*
> Customer: {{1.data.object.customer_details.email}}
> Amount: ${{1.data.object.amount_total / 100}}
> Error: {{2.error.message}}
> ⚠️ Manual enrollment required — check Stripe dashboard
```

---

## Setup Instructions

### Step 1: Create Scenario
1. Go to [make.com](https://www.make.com) → Scenarios → Create New
2. Name: `HIRECAR Enrollment Pipeline`
3. Folder: Create folder `HIRECAR`

### Step 2: Add Stripe Trigger
1. Add module → Search "Stripe" → **Watch Events**
2. Create connection → paste your Stripe Secret Key (`sk_test_...`)
3. Event type: `checkout.session.completed`
4. Click OK → Run Once to test

### Step 3: Add HTTP Module
1. Add module → Search "HTTP" → **Make a Request**
2. Configure URL, method, headers, and body as above
3. Map Stripe output fields using the `{{1.xxx}}` references

### Step 4: Add Error Handler
1. Right-click Module 2 → Add Error Handler
2. Add Slack module → Send Message
3. Connect to your HIRECAR Slack workspace
4. Select `#hirecar` channel
5. Map the error message template

### Step 5: Scheduling
- **Interval:** Instant (webhook-triggered)
- **Operations budget:** This uses ~2 ops per enrollment
- **Free tier limit:** 1,000 ops/month = ~500 enrollments/month

---

## Tier Mapping via Stripe Metadata

When creating Stripe Payment Links or checkout sessions, add metadata to map the tier:

| Product | Metadata Key | Metadata Value |
|---------|-------------|----------------|
| Standard ($29/2mo) | `tier` | `standard` |
| Operator ($59/2mo) | `tier` | `operator` |
| First Class ($99/mo) | `tier` | `first_class` |
| Elite ($199/mo or $1,990/yr) | `tier` | `elite` |

**How to add metadata to Payment Links:**
1. Stripe Dashboard → Payment Links → Edit
2. Scroll to "After payment" section
3. Add custom field or use the API:
```
stripe payment_links update plink_xxx --metadata[tier]=operator
```

---

## Current Implementation: Direct Stripe Webhook (Cloudflare Worker)

**This is now the primary and only approach.** Stripe webhooks are sent directly to the Cloudflare Worker:

1. Stripe Dashboard → Developers → Webhooks → Endpoint Configured
2. **URL:** `https://api.hirecar.la/webhooks/stripe`
3. **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Webhook signing secret stored as `STRIPE_WEBHOOK_SECRET` in Worker environment (`wrangler.toml`)

The Worker's Stripe webhook handler processes all payment events and sends success/error notifications directly to Slack via `SLACK_WEBHOOK_URL`.

**No Make.com intermediation required.** This eliminates Make.com ops consumption and provides native Cloudflare platform benefits.

---

## Why the Migration Happened

The legacy Make.com approach faced constraints:
- **Free Plan Limitation:** 2 scenarios / 1,000 ops/month
- **Cost:** Payment pipeline + enrollment chain consumed ~900 ops/month
- **Latency:** Multi-module chain (7 modules) added processing delay
- **Maintenance:** Module updates required scenario reconfiguration

The Cloudflare Worker solution provides:
- **Unlimited executions:** 100K requests/day free tier
- **Lower latency:** Single Worker invocation vs. multi-module chain
- **Simpler ops:** Direct webhook integration, no scenario management
- **Native integrations:** Slack webhook, Brevo email, Twilio SMS in Worker code

---

*Document: BOT-HC-0101-MAKE [ARCHIVED] | Classification: Internal — Operations | 2026-03-04*
*Current implementation: See HC-CFG-014-A (Cloudflare Worker Enrollment Chain)*
