# WS1 Owner Action Checklist
**HIRECAR Infrastructure & Payments — Critical Path**
*Updated: 2026-03-04 | Execute in order*

---

## Phase 1: Accounts & Credentials (Do These First)

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) → Sign up with business email
- Complete business verification (HIRECAR, LLC)
- Go to **Developers → API Keys** → Copy:
  - `pk_test_...` (Publishable key)
  - `sk_test_...` (Secret key)
- **Stay in TEST MODE** until all integrations verified
- ⏱ ~15 min | Unblocks: Payment webhooks, end-to-end testing

### 2. Create Cloudflare Account
- Go to [cloudflare.com](https://cloudflare.com) → Sign up
- **Add site:** Enter `hirecar.la` (or `hirecar.io` if using that domain)
- Cloudflare will scan existing DNS records — **review and confirm**
- Copy the two Cloudflare nameservers provided
- Install Wrangler CLI: `npm install -g wrangler && wrangler login`
- ⏱ ~10 min | Unblocks: Workers deployment, DNS, SSL

### 3. Update GoDaddy Nameservers
- Log into GoDaddy → Domain Settings for hirecar.la
- Change nameservers to the two Cloudflare nameservers
- ⚠️ **IMPORTANT:** Before changing, ensure Zoho MX records are in Cloudflare DNS panel
- DNS propagation takes 1–48 hours (usually under 2 hours)
- ⏱ ~5 min | Unblocks: SSL, site deployment, custom API domain

### 4. Configure Zoho Mail
- Go to [mail.zoho.com/cpanel](https://mail.zoho.com/cpanel)
- Verify domain `hirecar.la` (add MX + TXT records in Cloudflare DNS)
- MX records: `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50)
- TXT record for SPF: `v=spf1 include:zoho.com ~all`
- ⏱ ~15 min | Unblocks: Email addresses

### 5. Create Brevo Account (Email — 300/day free)
- Go to [brevo.com](https://www.brevo.com) → Sign up (free account)
- **Verify domain:** Settings → Senders, Domains & Dedicated IPs → Domains → Add `hirecar.la`
- Add the DKIM + SPF DNS records Brevo provides to Cloudflare DNS
- **Generate API Key:** Settings → SMTP & API → API Keys → Generate → Copy `xkeysib-xxxxx`
- Free tier: **300 emails/day** (~9,000/month) — covers transactional at launch
- When marketing campaigns need 500-1K/day, upgrade Starter ($9/mo for 5K/mo) or add Amazon SES (~$3/mo for 30K)
- ⏱ ~15 min | Unblocks: Transactional email from Workers

### 6. Set Up Slack Webhooks ✅ WORKSPACE EXISTS
- Your workspace `HIRECAR, LLC` is confirmed active
- Channels confirmed: `#hirecar`, `🔒 sales-talk`, `#homebase`
- **Remaining:** Create 3 Incoming Webhooks:
  1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From Scratch
  2. Name: `HIRECAR Bot` → Workspace: HIRECAR, LLC
  3. Features → Incoming Webhooks → Toggle ON
  4. Add webhook to `#hirecar` → Copy URL
  5. Add webhook to `sales-talk` → Copy URL
  6. Add webhook to `#homebase` → Copy URL
- ⏱ ~10 min | Unblocks: All Slack notifications from Workers

### 7. PayPal Business Account (Lower Priority)
- Go to [paypal.com/business](https://www.paypal.com/business) → Sign up
- Get IPN URL from PayPal Settings → Notifications
- Can defer if Stripe is primary
- ⏱ ~20 min | Unblocks: PayPal payment processing

---

## Phase 2: Deploy Cloudflare Workers (I Built This)

Once you have Cloudflare + Wrangler installed, follow `hirecar-workers/DEPLOY.md`:

```
cd hirecar-workers
wrangler d1 create hirecar-db        # → paste ID into wrangler.toml
wrangler kv namespace create HIRECAR_KV   # → paste ID into wrangler.toml
npm run db:migrate                   # → create tables
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put BREVO_API_KEY
wrangler secret put SLACK_HIRECAR_WEBHOOK_URL
wrangler secret put SLACK_SALES_WEBHOOK_URL
wrangler secret put SLACK_HOMEBASE_WEBHOOK_URL
wrangler secret put PAYPAL_RECEIVER_EMAIL
npm run deploy                       # → live at hirecar-api.*.workers.dev
```

---

## Phase 3: Verification (After Deployment)

- [ ] `curl https://your-worker.workers.dev/health` returns `status: ok`
- [ ] Test lead: POST to `/webhooks/leads` → appears in D1 + Slack `#hirecar`
- [ ] Test Stripe: send test webhook → payment logged + Slack notification
- [ ] Hot lead (score ≥ 70) → appears in both `#hirecar` AND `🔒 sales-talk`
- [ ] Daily digest fires at 8 PM PST → posts to `#homebase`
- [ ] Verify hirecar.la loads over HTTPS
- [ ] Verify all 5 Zoho email addresses can send/receive
- [ ] Verify Brevo domain authentication passes (DKIM/SPF)
- [ ] Run full QA checklist per QA-HC-0003

---

## Current Status

| Item | Status |
|---|---|
| **BACKEND (Cloudflare Workers)** | |
| API Router (index.js) | ✅ Built — 12 endpoints + cron |
| D1 Database Schema | ✅ Built — 5 tables, indexes, seed data |
| Payment Pipeline (Stripe + PayPal) | ✅ Built — signature verify, D1 writes, notifications |
| Lead Capture Pipeline | ✅ Built — scoring, dedup, auto-assign, CRUD |
| Members API | ✅ Built — enroll, update, payment history |
| Daily Digest Cron | ✅ Built — aggregates stats → Slack |
| Slack Notifications | ✅ Built — 6 notification types, 3-channel routing |
| Email Templates (Brevo) | ✅ Built — 4 branded templates |
| **SLACK WORKSPACE** | |
| HIRECAR, LLC workspace | ✅ Confirmed active |
| #hirecar (ops channel) | ✅ Exists |
| 🔒 sales-talk (sales channel) | ✅ Exists |
| #homebase (digest channel) | ✅ Exists |
| Incoming Webhooks configured | ⏳ Owner action needed (Step 6 above) |
| **MAKE.COM (SUPERSEDED)** | |
| ~~Make.com upgrade~~ | ~~❌ No longer needed~~ — replaced by Cloudflare Workers |
| Lead Capture scenario | 🔄 Exists but superseded by Workers |
| Leads data store | 🔄 Exists but superseded by D1 |
| **EXTERNAL ACCOUNTS** | |
| Cloudflare account | ❌ Owner action needed (Step 2) |
| Stripe account | ❌ Owner action needed (Step 1) |
| Brevo account (email) | ❌ Owner action needed (Step 5) |
| Zoho Mail setup | ❌ Owner action needed (Step 4) |
| DNS / Nameservers | ❌ Owner action needed (Step 3) |
| PayPal Business | ❌ Owner action needed (Step 7) |
