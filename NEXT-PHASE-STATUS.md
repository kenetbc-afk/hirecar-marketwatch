# HIRECAR Payment Orchestration — Status & Next Steps
**Date:** March 5, 2026
**Architecture:** ARCH-HC-0302 v1.1.0
**Worker:** api.hirecar.la (hirecar-api)

---

## What's Live & Working

The entire enrollment pipeline is operational. When a customer completes a Stripe checkout, the Worker receives the webhook, creates the member record, sends a Slack notification to the HIRECAR channel, and fires a Brevo welcome email — all confirmed working on March 4.

**Infrastructure deployed:**

- Cloudflare Worker at `api.hirecar.la` — version `d9756de6`, 6 bots active, D1 + KV bindings confirmed
- Stripe webhook endpoint (`playful-victory`) listening to 5 events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
- Cloudflare Pages site at `1eb815ef.hirecar-pricing.pages.dev` — 17 HTML pages deployed
- All P1 secrets set: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BREVO_API_KEY`, `SLACK_WEBHOOK_URL`
- 4 active Stripe products (v3 FINAL): Standard $29/bimonthly, Operator $59/bimonthly, First Class $99/monthly, Elite $199/monthly or $1,990/annual
- 8 deprecated Stripe products archived

**Source modules (6 files, ~148KB total):**

| File | Size | Bots | Purpose |
|------|------|------|---------|
| payment-orchestrator.js | 37KB | #08, #17-#20 | Hub-and-spoke payment engine, lane evaluation, product sync |
| enrollment-flow.js | 25KB | #01 | 8-step enrollment pipeline, member CRUD, stats views |
| sms-integration.js | 33KB | #17, #20 | Brevo/Twilio SMS, cash receipt confirmation replies |
| product-sync-worker.js | 24KB | #14 | Stripe↔Wix↔FanBasis product catalog sync |
| hire-bot-registry.js | 16KB | All | 20-bot fleet metadata registry |
| index.js | 12KB | — | Router, CORS, cron handlers, health endpoint |

---

## Pending Redeploy (3 Fixes Ready)

Three production-hardening fixes have been written but are **not yet deployed**. The current live version (`d9756de6`) does not include them. Run:

```bash
cd payment-orchestration
npx wrangler deploy
```

**Fix 1 — Stripe Webhook Signature Verification** (`payment-orchestrator.js`)
Added `verifyStripeSignature()` using Web Crypto API (HMAC-SHA256) with constant-time comparison and 300-second timestamp tolerance. The webhook route now verifies signatures before processing events, with a fallback for test/dev when `STRIPE_WEBHOOK_SECRET` is missing.

**Fix 2 — CORS Regex** (`index.js`)
Updated the Pages test domain regex from `hirecar-site.pages.dev` to `hirecar-(site|pricing).pages.dev` to match the actual Cloudflare Pages project name.

**Fix 3 — Tier Detection** (`enrollment-flow.js`)
Stripe's `checkout.session.completed` webhook does not include `line_items` by default, so every enrollment was defaulting to Standard tier. Converted `extractCustomerData()` to async and added a Stripe API call to fetch line_items (`GET /v1/checkout/sessions/{id}/line_items`). Now correctly detects the purchased tier.

---

## D1 Database Schema (Ready to Execute)

A comprehensive schema file has been created at `payment-orchestration/schema/001_full_schema.sql` covering all 12 tables and 4 views used across the codebase. Run:

```bash
npx wrangler d1 execute hirecar-db --file=./schema/001_full_schema.sql
```

Tables: `members`, `member_scores`, `audit_log`, `invoices`, `payments`, `cash_receipts`, `member_lanes`, `lane_history`, `products`, `sync_log`, `sms_audit_log`, `disputes`

Views: `v_invoice_balances`, `v_member_distribution`, `v_enrollment_funnel`, `v_lane_distribution`

Also seeds the 5 active product catalog entries (4 products, Elite has monthly + annual prices).

---

## Next Phase — DNS Cutover & Production Launch

**Step 1: Deploy fixes + initialize database**
```bash
cd payment-orchestration
npx wrangler deploy
npx wrangler d1 execute hirecar-db --file=./schema/001_full_schema.sql
```

**Step 2: Verify on test domain**
Run test checkouts against `1eb815ef.hirecar-pricing.pages.dev`. Confirm tier detection now works (check Slack notification shows correct tier instead of always "Standard").

**Step 3: DNS cutover from Wix to Cloudflare Pages**
This is the agreed staged approach — test on pages.dev, then switch DNS, then cancel Wix.

1. In Cloudflare DNS for `hirecar.la`, add a CNAME record: `www` → `hirecar-pricing.pages.dev`
2. In Cloudflare Pages project settings, add custom domain: `www.hirecar.la`
3. Verify the site loads at `https://www.hirecar.la`
4. Update the root domain (`hirecar.la`) similarly
5. Remove the old Wix DNS records
6. Cancel Wix subscription

**Step 4: Production environment switch**
```bash
npx wrangler deploy --env production
```
This sets `ENVIRONMENT = "live"` (currently running as `"test"`).

---

## Future Work (Beyond This Phase)

- **Cron jobs operational check** — Lane evaluation (daily 6AM UTC), cash receipt expiry (hourly), product sync health (every 6h) are defined in `wrangler.toml` but need the D1 tables to exist first
- **SMS integration activation** — Twilio/Brevo transactional SMS numbers need to be provisioned and the `TWILIO_FROM_NUMBER` updated from placeholder
- **PayPal spoke** — `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` need to be set for the PayPal payment spoke
- **FanBasis integration** — `FANBASIS_ZAPIER_WEBHOOK_URL` and `FANBASIS_API_KEY` need to be set
- **Wix API sync** — `WIX_API_KEY` needs to be set for product catalog sync to Wix
- **Rate limiting** — Add Cloudflare rate limiting rules for the webhook and API endpoints
- **Monitoring dashboard** — Build a Cloudflare Analytics or Grafana dashboard for bot health metrics
