# HIRECAR Cross-Platform Product Sync — Execution Guide

## Overview
Products currently exist **ONLY in Stripe** (TEST mode). This guide covers syncing them to PayPal, FanBasis, and Wix.

## Current Product State (Stripe — Source of Truth)

| Internal ID | Tier | Amount | Billing | Stripe Product | Stripe Price |
|-------------|------|--------|---------|----------------|--------------|
| PROD-HC-00001 | Standard | $29 | Bimonthly | `prod_U5XWipFt8cj4Cx` | `price_1T7NCvA95N4c0ts1j6393yzD` |
| PROD-HC-00002 | Operator | $59 | Bimonthly | `prod_U5XWNeWwEKiWCf` | `price_1T7NCxA95N4c0ts17epbpXmg` |
| PROD-HC-00003 | First Class | $99 | Monthly | `prod_U5XWRAHiodwAFe` | `price_1T7MRnA95N4c0ts1kGLJdkbL` |
| PROD-HC-00004 | Elite (Monthly) | $199 | Monthly | `prod_U5XWJDSLiyUrN1` | `price_1T7MRoA95N4c0ts10Jk6s521` |
| PROD-HC-00005 | Elite (Annual) | $1,990 | Annual | `prod_U5XWJDSLiyUrN1` | `price_1T7N5lA95N4c0ts1Q4AIB2IC` |

## Platform Sync Procedures

### 1. PayPal — Billing Plans

**Prerequisites:**
- PayPal Business account
- REST API credentials (Client ID + Secret)
- Sandbox mode for testing

**API Flow:**
```
POST /v1/billing/plans
{
  "product_id": "{paypal_product_id}",
  "name": "HIRECAR {Tier} Membership",
  "billing_cycles": [{
    "frequency": { "interval_unit": "MONTH", "interval_count": 2 },
    "tenure_type": "REGULAR",
    "pricing_scheme": { "fixed_price": { "value": "29.00", "currency_code": "USD" } }
  }],
  "payment_preferences": {
    "auto_bill_outstanding": true,
    "payment_failure_threshold": 3
  }
}
```

**Steps:**
1. Create PayPal Catalog Products (one per tier)
2. Create Billing Plans (one per price point)
3. Store plan IDs in D1 `products.paypal_plan_id`
4. Test subscription creation flow

### 2. FanBasis — Product Catalog

**Prerequisites:**
- FanBasis account at fanbasis.com
- Zapier integration webhook URL
- API key (if direct API available)

**Integration Method:** Zapier webhook → FanBasis product creation
- Webhook URL stored in `FANBASIS_ZAPIER_WEBHOOK_URL`
- Product data sent as JSON payload
- FanBasis product ID returned async (webhook callback or polling)

**Steps:**
1. Set up FanBasis account
2. Configure Zapier → FanBasis product creation Zap
3. Send product data via webhook
4. Map FanBasis product IDs back to D1

### 3. Wix — Store Products

**Prerequisites:**
- Wix site: hirecar.la (ID: `e3b1f751-8a2e-4f91-9242-44d46b35fc4f`)
- Wix Stores app installed
- API key with write permissions

**API Flow:**
```
POST https://www.wixapis.com/stores/v1/products
{
  "product": {
    "name": "HIRECAR Standard Membership",
    "productType": "digital",
    "priceData": { "price": 29.00 },
    "description": "Entry-level automotive services membership...",
    "ribbons": [{ "text": "Most Popular" }]
  }
}
```

**Steps:**
1. Install Wix Stores app on hirecar.la
2. Generate API key with store management scope
3. Create products via REST API
4. Store Wix product IDs in D1
5. Configure pricing page to display membership tiers

## Sync Execution Order

1. **PayPal** (highest priority — backup payment processor)
2. **Wix** (pricing page needs products for display)
3. **FanBasis** (BNPL/crypto checkout — can run in parallel)

## Automated Sync (Post-Deployment)

Once the Worker is deployed at `api.hirecar.la`:
```bash
# Sync all products to all platforms
curl -X POST https://api.hirecar.la/api/products/sync-all \
  -H "Authorization: Bearer {admin_token}"

# Sync a single product
curl -X POST https://api.hirecar.la/api/products/PROD-HC-00001/sync \
  -H "Authorization: Bearer {admin_token}"

# Check sync health
curl https://api.hirecar.la/api/sync/health
```

## Owner Action Items

| Priority | Action | Status |
|----------|--------|--------|
| P0 | Create PayPal Business account (sandbox) | ⬜ Pending |
| P0 | Set up FanBasis account at fanbasis.com | ⬜ Pending |
| P0 | Generate Wix API key with store scope | ⬜ Pending |
| P1 | Configure PayPal webhook → api.hirecar.la/webhooks/paypal | ⬜ Pending |
| P1 | Set up Zapier → FanBasis product Zap | ⬜ Pending |
| P1 | Install Wix Stores app on hirecar.la | ⬜ Pending |
| P2 | Switch Stripe from TEST to LIVE mode | ⬜ Pending |
| P2 | Configure Stripe webhook → api.hirecar.la/webhooks/stripe | ⬜ Pending |
| P2 | Update hirecar.la pricing page with product links | ⬜ Pending |
