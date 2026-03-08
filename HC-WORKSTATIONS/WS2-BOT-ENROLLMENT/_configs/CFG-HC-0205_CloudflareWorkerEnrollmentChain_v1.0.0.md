---
document_id: HC-CFG-014-A
title: Cloudflare Worker — Enrollment Chain (Replaces Make.com)
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
replaces: Make.com Scenario HC-SCN-001 (ID 4293592)
---

# Cloudflare Worker — Enrollment Chain

## 1. Overview

A single Cloudflare Worker at `api.hirecar.io/enroll` replaces the entire Make.com 7-module enrollment chain. It runs as a serverless function on Cloudflare's edge network — zero cost on the free tier (100K requests/day), no per-operation limits, no third-party dependency.

| Field | Value |
|-------|-------|
| **Worker Name** | `hirecar-enrollment-chain` |
| **Route** | `api.hirecar.io/enroll` |
| **Method** | POST |
| **Runtime** | Cloudflare Workers (V8 isolate) |
| **Free Tier** | 100,000 requests/day, 10ms CPU/request |
| **Timeout** | 30 seconds (Bundled plan: 50s if needed) |
| **Notifications** | Slack #hirecar-enrollment-pipeline |
| **Previously** | Make.com Scenario 4293592, Team 1939114 |

---

## 2. Enrollment Chain Steps

The Worker executes these 7 steps sequentially. If any step fails, it logs the error, posts to Slack, and returns a partial-success response to Zoho CRM so the record reflects how far the chain got.

```
POST api.hirecar.io/enroll
     │
     ├─ Step 1: Validate payload + generate 6-digit PIN
     │
     ├─ Step 2: Create Bit.ai playbook (HTTP → Bit.ai API)
     │
     ├─ Step 3: Set playbook password to generated PIN
     │
     ├─ Step 4: Create PassKit wallet pass (HTTP → PassKit API)
     │
     ├─ Step 5: Send welcome email (HTTP → SendGrid API)
     │
     ├─ Step 6: Send SMS with pass URL + PIN (HTTP → Twilio API)
     │
     ├─ Step 7: Update Zoho CRM record → ACTIVE
     │
     └─ Step 8: Post enrollment confirmation to Slack
```

---

## 3. Worker Source Code

```typescript
// src/index.ts — hirecar-enrollment-chain

export interface Env {
  // API Keys (stored as Worker Secrets)
  BITAI_API_KEY: string;
  PASSKIT_API_KEY: string;
  PASSKIT_TIER_ID: string;
  SENDGRID_API_KEY: string;
  SENDGRID_TEMPLATE_ID: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ZOHO_CLIENT_ID: string;
  ZOHO_CLIENT_SECRET: string;
  ZOHO_REFRESH_TOKEN: string;
  SLACK_WEBHOOK_URL: string;
  WEBHOOK_SECRET: string;
}

interface EnrollmentPayload {
  event: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  dispute_id: string;
  score_range: string;
  negative_items: string;
  advisor_name: string;
  membership_tier: string;
  dispute_date: string;
  record_id: string;
}

interface ChainResult {
  success: boolean;
  pin?: string;
  playbookUrl?: string;
  passUrl?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  crmUpdated?: boolean;
  slackNotified?: boolean;
  error?: string;
  failedStep?: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Verify webhook secret
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload: EnrollmentPayload = await request.json();

    // Validate required fields
    const required = ['client_name', 'client_email', 'client_phone', 'dispute_id', 'record_id'];
    for (const field of required) {
      if (!payload[field as keyof EnrollmentPayload]) {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const result: ChainResult = { success: false };

    try {
      // ── Step 1: Generate 6-digit PIN ──
      const pin = String(Math.floor(Math.random() * 900000) + 100000);
      result.pin = pin;

      // ── Step 2: Create Bit.ai playbook ──
      const playbookRes = await fetch('https://api.bit.ai/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.BITAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Credit Dispute Playbook — ${payload.client_name}`,
          content: buildPlaybookHTML(payload),
        }),
      });

      if (!playbookRes.ok) throw new Error(`Bit.ai failed: ${playbookRes.status}`);
      const playbookData = await playbookRes.json() as { url: string; id: string };
      result.playbookUrl = playbookData.url;

      // ── Step 3: Set playbook password ──
      await fetch(`https://api.bit.ai/v1/documents/${playbookData.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${env.BITAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pin }),
      });

      // ── Step 4: Create PassKit wallet pass ──
      const passRes = await fetch('https://api.pub1.passkit.io/members/member', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.PASSKIT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: env.PASSKIT_TIER_ID,
          person: {
            displayName: payload.client_name,
            emailAddress: payload.client_email,
          },
          externalId: `HC-${payload.dispute_id}`,
          metaData: {
            dispute_id: payload.dispute_id,
            playbook_url: result.playbookUrl,
            access_pin: pin,
            advisor: payload.advisor_name,
            tier: payload.membership_tier,
          },
        }),
      });

      if (!passRes.ok) throw new Error(`PassKit failed: ${passRes.status}`);
      const passData = await passRes.json() as { id: string };
      result.passUrl = `https://pub1.pskt.io/${passData.id}`;

      // ── Step 5: Send welcome email via SendGrid ──
      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: payload.client_email, name: payload.client_name }],
            dynamic_template_data: {
              client_name: payload.client_name,
              dispute_id: payload.dispute_id,
              pass_url: result.passUrl,
              playbook_url: result.playbookUrl,
              access_pin: pin,
              advisor_name: payload.advisor_name,
              membership_tier: payload.membership_tier,
            },
          }],
          from: { email: 'welcome@hirecar.la', name: 'HIRECAR' },
          template_id: env.SENDGRID_TEMPLATE_ID,
        }),
      });

      result.emailSent = emailRes.ok;

      // ── Step 6: Send SMS via Twilio ──
      const twilioAuth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
      const smsRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: payload.client_phone,
            From: env.TWILIO_PHONE_NUMBER,
            Body: [
              `Welcome to HIRECAR, ${payload.client_name}!`,
              `Your Access Pass: ${result.passUrl}`,
              `Playbook PIN: ${pin}`,
              `Add your pass to Apple/Google Wallet to get started.`,
            ].join('\n'),
          }),
        }
      );

      result.smsSent = smsRes.ok;

      // ── Step 7: Update Zoho CRM record → ACTIVE ──
      const zohoToken = await getZohoToken(env);
      const crmRes = await fetch(
        `https://www.zohoapis.com/crm/v2/HC_Enrollment/${payload.record_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Zoho-oauthtoken ${zohoToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [{
              Enrollment_Status: 'ACTIVE',
              Access_PIN: pin,
              Pass_URL: result.passUrl,
              Playbook_URL: result.playbookUrl,
            }],
          }),
        }
      );

      result.crmUpdated = crmRes.ok;

      // ── Step 8: Post to Slack ──
      const slackRes = await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✅ New enrollment complete`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '✅ Enrollment Complete' },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Client:*\n${payload.client_name}` },
                { type: 'mrkdwn', text: `*Dispute:*\n${payload.dispute_id}` },
                { type: 'mrkdwn', text: `*Tier:*\n${payload.membership_tier}` },
                { type: 'mrkdwn', text: `*Advisor:*\n${payload.advisor_name}` },
              ],
            },
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `Pass: ${result.passUrl} | Email: ${result.emailSent ? '✓' : '✗'} | SMS: ${result.smsSent ? '✓' : '✗'}` },
              ],
            },
          ],
        }),
      });

      result.slackNotified = slackRes.ok;
      result.success = true;

      return Response.json(result, { status: 200 });

    } catch (error: any) {
      result.error = error.message;

      // Post failure to Slack
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Enrollment failed for ${payload.client_name}: ${error.message}`,
          }),
        });
      } catch { /* silent */ }

      return Response.json(result, { status: 500 });
    }
  },
};

// ── Helper: Zoho OAuth token refresh ──
async function getZohoToken(env: Env): Promise<string> {
  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      refresh_token: env.ZOHO_REFRESH_TOKEN,
    }),
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ── Helper: Build playbook HTML ──
function buildPlaybookHTML(payload: EnrollmentPayload): string {
  return `
    <h1>Credit Dispute Playbook</h1>
    <h2>${payload.client_name} — ${payload.dispute_id}</h2>
    <p>Score Range: ${payload.score_range}</p>
    <p>Negative Items: ${payload.negative_items}</p>
    <p>Advisor: ${payload.advisor_name}</p>
    <p>Tier: ${payload.membership_tier}</p>
    <hr>
    <h3>Section 1: Bureau Dispute Letters</h3>
    <p>[Template content generated based on negative items]</p>
    <h3>Section 2: Score Optimization Timeline</h3>
    <p>[30/60/90-day milestones based on score range]</p>
  `;
}
```

---

## 4. Wrangler Configuration

```toml
# wrangler.toml
name = "hirecar-enrollment-chain"
main = "src/index.ts"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

# Route: api.hirecar.io/enroll
routes = [
  { pattern = "api.hirecar.io/enroll", zone_name = "hirecar.io" }
]

# Secrets (set via `wrangler secret put <NAME>`)
# BITAI_API_KEY
# PASSKIT_API_KEY
# PASSKIT_TIER_ID
# SENDGRID_API_KEY
# SENDGRID_TEMPLATE_ID
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_PHONE_NUMBER
# ZOHO_CLIENT_ID
# ZOHO_CLIENT_SECRET
# ZOHO_REFRESH_TOKEN
# SLACK_WEBHOOK_URL
# WEBHOOK_SECRET
```

---

## 5. Secrets Setup

Run these commands to set all API credentials as Worker secrets:

```bash
# Bit.ai
wrangler secret put BITAI_API_KEY

# PassKit
wrangler secret put PASSKIT_API_KEY
wrangler secret put PASSKIT_TIER_ID

# SendGrid
wrangler secret put SENDGRID_API_KEY
wrangler secret put SENDGRID_TEMPLATE_ID

# Twilio
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER

# Zoho OAuth
wrangler secret put ZOHO_CLIENT_ID
wrangler secret put ZOHO_CLIENT_SECRET
wrangler secret put ZOHO_REFRESH_TOKEN

# Slack
wrangler secret put SLACK_WEBHOOK_URL

# Webhook auth
wrangler secret put WEBHOOK_SECRET
```

---

## 6. Deployment

```bash
# Deploy the Worker
wrangler deploy

# Verify it's live
curl -X POST https://api.hirecar.io/enroll \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"event":"test","client_name":"Test","client_email":"test@test.com","client_phone":"+10000000000","dispute_id":"DSP-2026-TEST","record_id":"test"}'
```

---

## 7. DNS Setup

Add these DNS records in Cloudflare:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| AAAA | api.hirecar.io | 100:: | Proxied (orange cloud) |

The Worker route in `wrangler.toml` binds `api.hirecar.io/enroll` to this Worker.

---

## 8. Zoho CRM Webhook Update

The Zoho workflow rule HC-WF-001 webhook URL changes from:

```
❌ OLD: https://hook.us2.make.com/6txbms8rrr21592d7786venatn5esfnf
✅ NEW: https://api.hirecar.io/enroll
```

The payload remains identical (see HC-CFG-010-A Section 3), but must add:
- **Authorization header:** `Bearer {WEBHOOK_SECRET}`
- **New field:** `record_id` — the Zoho record ID (`${HC_Enrollment.id}`)

---

## 9. Why Cloudflare Workers over Make.com

| Factor | Make.com (Free) | Cloudflare Workers (Free) |
|--------|----------------|--------------------------|
| **Monthly limit** | 1,000 ops (≈135 enrollments) | 100,000 requests/day (3M/month) |
| **Scenario limit** | 2 scenarios | Unlimited Workers |
| **Execution time** | 5 min timeout | 30s (sufficient) |
| **Cost at scale** | $9/mo for 10K ops | Free up to 100K req/day |
| **Vendor lock-in** | Make.com platform | Standard JS/TS, portable |
| **Slack integration** | Requires separate module | Native fetch() to webhook |
| **Latency** | ~2-5s (cloud function chain) | ~50-200ms (edge) |

---

## 10. Implementation Checklist

- [ ] Initialize Worker project: `wrangler init hirecar-enrollment-chain`
- [ ] Write `src/index.ts` (code above)
- [ ] Set all 13 secrets via `wrangler secret put`
- [ ] Add DNS record: `api.hirecar.io` AAAA → Cloudflare
- [ ] Deploy: `wrangler deploy`
- [ ] Update Zoho CRM webhook URL in HC-WF-001
- [ ] Add `record_id` field to Zoho webhook payload
- [ ] Add `Authorization: Bearer {secret}` header to Zoho webhook
- [ ] Create Slack incoming webhook for #hirecar-enrollment-pipeline
- [ ] Test: send test enrollment → verify all 8 steps complete
- [ ] Delete Make.com scenario 4293592, webhook 1960245, folder 213883

---

*Document Control: HC-CFG-014-A | WS2-BOT-ENROLLMENT | 2026-03-04*
