#!/bin/bash
# ═══════════════════════════════════════════════════════
# HIRECAR Payment Orchestration — Deployment Script
# ARCH-HC-0302 Implementation
# ═══════════════════════════════════════════════════════
# Prerequisites:
#   npm install -g wrangler
#   wrangler login
# ═══════════════════════════════════════════════════════

set -e
echo "═══════════════════════════════════════════════════"
echo " HIRECAR Payment Orchestration Deployment"
echo " Architecture: ARCH-HC-0302 v1.1.0"
echo "═══════════════════════════════════════════════════"
echo ""

# ── Step 1: Create D1 Database ──
echo "[1/7] Creating D1 database: hirecar-db..."
DB_OUTPUT=$(wrangler d1 create hirecar-db 2>&1 || true)
echo "$DB_OUTPUT"

# Extract database_id from output
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
if [ -n "$DB_ID" ]; then
  echo "  ✓ Database ID: $DB_ID"
  echo "  → Update wrangler.toml: database_id = \"$DB_ID\""
  # Auto-update wrangler.toml
  sed -i "s/database_id = \"TO_BE_CREATED\"/database_id = \"$DB_ID\"/" wrangler.toml
else
  echo "  ⚠ Database may already exist. Check wrangler.toml manually."
fi
echo ""

# ── Step 2: Create KV Namespace ──
echo "[2/7] Creating KV namespace: HIRECAR_KV..."
KV_OUTPUT=$(wrangler kv namespace create HIRECAR_KV 2>&1 || true)
echo "$KV_OUTPUT"

KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)
if [ -n "$KV_ID" ]; then
  echo "  ✓ KV Namespace ID: $KV_ID"
  sed -i "s/id = \"TO_BE_CREATED\"/id = \"$KV_ID\"/" wrangler.toml
else
  echo "  ⚠ KV namespace may already exist. Check wrangler.toml manually."
fi
echo ""

# ── Step 3: Run D1 Migration ──
echo "[3/7] Running D1 migration: d1-migration-001-payment-orchestration.sql..."
wrangler d1 execute hirecar-db --file=d1-migration-001-payment-orchestration.sql
echo "  ✓ Migration complete."
echo ""

# ── Step 4: Set Secrets ──
echo "[4/7] Setting secrets (interactive — enter each when prompted)..."
echo "  You will be prompted for each secret value."
echo ""

SECRETS=(
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "PAYPAL_CLIENT_ID"
  "PAYPAL_SECRET"
  "BREVO_API_KEY"
  "TWILIO_ACCOUNT_SID"
  "TWILIO_AUTH_TOKEN"
  "SLACK_WEBHOOK_URL"
  "FANBASIS_ZAPIER_WEBHOOK_URL"
  "FANBASIS_API_KEY"
  "WIX_API_KEY"
)

for SECRET in "${SECRETS[@]}"; do
  echo "  Setting $SECRET..."
  wrangler secret put "$SECRET" || echo "  ⚠ Skipped $SECRET (enter manually later)"
done
echo ""

# ── Step 5: Deploy Worker ──
echo "[5/7] Deploying Worker: hirecar-payment-api..."
wrangler deploy
echo "  ✓ Worker deployed."
echo ""

# ── Step 6: Verify Deployment ──
echo "[6/7] Verifying deployment..."
sleep 3
HEALTH=$(curl -s https://api.hirecar.la/api/health 2>/dev/null || echo '{"status":"unreachable"}')
echo "  Health check response: $HEALTH"
echo ""

# ── Step 7: Summary ──
echo "[7/7] Deployment Summary"
echo "═══════════════════════════════════════════════════"
echo "  Worker:    hirecar-payment-api"
echo "  Domain:    api.hirecar.la"
echo "  Database:  hirecar-db (D1)"
echo "  KV:        HIRECAR_KV"
echo "  Crons:     Lane eval (6AM UTC), Cash expiry (hourly), Sync health (6h)"
echo ""
echo "  API Endpoints:"
echo "    GET  /api/health              — Service health"
echo "    GET  /api/bots                — Bot fleet registry"
echo "    POST /api/invoices            — Create invoice"
echo "    POST /api/cash/log            — Log cash receipt"
echo "    POST /api/sms/cash-confirm    — Send cash confirmation SMS"
echo "    POST /api/products/:id/sync   — Sync product to all platforms"
echo "    POST /webhooks/stripe         — Stripe webhook handler"
echo "    POST /webhooks/paypal         — PayPal webhook handler"
echo "    POST /webhooks/sms/inbound    — Inbound SMS handler"
echo ""
echo "  Next Steps:"
echo "    1. Configure Stripe webhook → api.hirecar.la/webhooks/stripe"
echo "    2. Configure PayPal IPN → api.hirecar.la/webhooks/paypal"
echo "    3. Configure Brevo webhook → api.hirecar.la/webhooks/sms/inbound"
echo "    4. Set up DNS route: api.hirecar.la → Worker"
echo "    5. Switch ENVIRONMENT from 'test' to 'live' when ready"
echo "═══════════════════════════════════════════════════"
echo "  Deployment complete! 🚀"
