# HIRECAR API — Deployment Guide

> Cloudflare Workers + D1 backend replacing Make.com scenarios.
> Free tier: 100K requests/day, 5GB database, unlimited routes.

---

## Prerequisites

You need ONE thing first: a **Cloudflare account** (free).

Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)

Then install Wrangler CLI:

```bash
npm install -g wrangler
wrangler login
```

---

## Step 1: Create D1 Database

```bash
cd hirecar-workers
wrangler d1 create hirecar-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "hirecar-db"
database_id = "paste-your-id-here"
```

---

## Step 2: Create KV Namespace

```bash
wrangler kv namespace create HIRECAR_KV
```

Copy the `id` and paste it into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "paste-your-id-here"
```

---

## Step 3: Run Database Migration

```bash
# Create tables
npm run db:migrate

# (Optional) Load test data
npm run db:seed
```

---

## Step 4: Set Secrets

Set each secret one at a time. Wrangler will prompt for the value:

```bash
# Stripe
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_SECRET_KEY

# Email (Brevo)
wrangler secret put BREVO_API_KEY

# Slack (Incoming Webhook URLs — one per channel)
wrangler secret put SLACK_HIRECAR_WEBHOOK_URL
wrangler secret put SLACK_SALES_WEBHOOK_URL
wrangler secret put SLACK_HOMEBASE_WEBHOOK_URL

# PayPal
wrangler secret put PAYPAL_RECEIVER_EMAIL

# (Optional) API key for /api/ routes
wrangler secret put API_KEY
```

### Where to get these:

| Secret | Where |
|--------|-------|
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `BREVO_API_KEY` | Brevo → Settings → SMTP & API → API Keys → Generate |
| `SLACK_HIRECAR_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks → Add to `#hirecar` |
| `SLACK_SALES_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks → Add to `🔒 sales-talk` |
| `SLACK_HOMEBASE_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks → Add to `#homebase` |
| `PAYPAL_RECEIVER_EMAIL` | Your PayPal business email |
| `API_KEY` | Generate any strong random string |

---

## Step 5: Deploy

```bash
# Deploy to production
npm run deploy

# Or deploy to staging first
npm run deploy:staging
```

Your API will be live at: `https://hirecar-api.<your-subdomain>.workers.dev`

---

## Step 6: Configure Webhook URLs

Once deployed, give these URLs to your payment providers:

### Stripe
Go to Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://hirecar-api.<subdomain>.workers.dev/webhooks/stripe`
- Events: `payment_intent.succeeded`, `invoice.paid`, `charge.refunded`, `customer.subscription.created`

### PayPal
Go to PayPal Developer → IPN Settings:
- URL: `https://hirecar-api.<subdomain>.workers.dev/webhooks/paypal`

### Lead Forms
Point your website forms to:
- URL: `https://hirecar-api.<subdomain>.workers.dev/webhooks/leads`
- Method: POST
- Body: `{ "name": "...", "email": "...", "phone": "...", "source": "website", "goals": "..." }`

---

## Step 7: (Optional) Custom Domain

Once your domain is on Cloudflare DNS:

1. Uncomment the routes in `wrangler.toml`:
```toml
routes = [
  { pattern = "api.hirecar.la/*", zone_name = "hirecar.la" }
]
```

2. Redeploy: `npm run deploy`

---

## API Endpoints Reference

### Webhooks (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/stripe` | Stripe webhook events |
| POST | `/webhooks/paypal` | PayPal IPN notifications |
| POST | `/webhooks/leads` | Lead form submissions |

### API (requires Bearer token if API_KEY is set)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/members` | List members (?status=active&tier=standard) |
| POST | `/api/members` | Enroll new member |
| GET | `/api/members/:id` | Get member + payment history |
| PUT | `/api/members/:id` | Update member |
| GET | `/api/leads` | List leads (?status=new&min_score=50) |
| GET | `/api/leads/:id` | Get single lead |
| PUT | `/api/leads/:id` | Update lead status/assignment |
| GET | `/api/payments` | List payments (?method=stripe&status=completed) |
| GET | `/api/stats` | Dashboard summary stats |
| GET | `/api/stats/daily` | Daily stats (?days=30) |
| GET | `/health` | Health check |

### Cron
| Schedule | Description |
|----------|-------------|
| `0 4 * * *` (04:00 UTC / 8PM PST) | Daily digest → Slack |

---

## Local Development

```bash
npm run dev
```

This starts a local dev server with Miniflare. D1 runs as local SQLite.

Test locally:
```bash
# Health check
curl http://localhost:8787/health

# Submit a test lead
curl -X POST http://localhost:8787/webhooks/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com","phone":"310-555-0000","source":"website","goals":"Need a car for Uber and want to build credit"}'

# List leads
curl http://localhost:8787/api/leads
```

---

## Troubleshooting

**"D1_ERROR: no such table"** — Run `npm run db:migrate` first.

**Stripe signature failures** — Make sure `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret (not the API key).

**PayPal IPN not verifying** — Ensure you're using the live IPN URL (`ipnpb.paypal.com`), not sandbox.

**Slack not posting** — Verify webhook URLs are correct. Test with: `curl -X POST -d '{"text":"test"}' YOUR_WEBHOOK_URL`
