# HIRECAR Stripe Product Catalog — v3 FINAL (Updated 2026-03-04)

## Active Products & Prices

| Tier | Product | Stripe Product ID | Stripe Price ID | Billing | Amount | Payment Link |
|------|---------|-------------------|-----------------|---------|--------|--------------|
| Standard | HIRECAR Standard Membership | `prod_U5XWipFt8cj4Cx` | `price_1T7NCvA95N4c0ts1j6393yzD` | **Bimonthly** (every 2 months) | $29.00 | [Test Link](https://buy.stripe.com/test_00w8wO3F95E7e720yZ43S0f) |
| Operator | HIRECAR Operator Membership | `prod_U5XWNeWwEKiWCf` | `price_1T7NCxA95N4c0ts17epbpXmg` | **Bimonthly** (every 2 months) | $59.00 | [Test Link](https://buy.stripe.com/test_cNi5kCcbF2rV3soa9z43S0g) |
| First Class | HIRECAR First Class Membership | `prod_U5XWRAHiodwAFe` | `price_1T7MRnA95N4c0ts1kGLJdkbL` | Monthly | $99.00 | (existing v3 link) |
| Elite (Monthly) | HIRECAR Elite Membership | `prod_U5XWJDSLiyUrN1` | `price_1T7MRoA95N4c0ts10Jk6s521` | Monthly | $199.00 | (existing v3 link) |
| Elite (Annual) | HIRECAR Elite Membership | `prod_U5XWJDSLiyUrN1` | `price_1T7N5lA95N4c0ts1Q4AIB2IC` | Annual | $1,990.00 | [Test Link](https://buy.stripe.com/test_5kQbJ05Nh0jN8MI1D343S0e) |

## Billing Structure

- **Standard & Operator**: Billed every 2 months (bimonthly) at the same price point
- **First Class**: Billed monthly
- **Elite**: Monthly (primary) + Annual option (saves ~$398/year vs monthly)

## Deprecated Products (TO ARCHIVE in Stripe Dashboard)

### v1 (Credit-First — Obsolete)
- `prod_U5XKFRqoPQQRiX`
- `prod_U5XLW3djBlBre7`
- `prod_U5XMbOXCvg1381`
- `prod_U5XMWQAZBo6515`

### v2 (LA/SF-Specific — Obsolete)
- `prod_U5XOy6WKE0UulB`
- `prod_U5XOZ91a1LKBxJ`
- `prod_U5XOxhGUg1WqlZ`
- `prod_U5XOplZE8YZFvJ`

### Old v3 Prices (Monthly — Replaced by Bimonthly for Standard/Operator)
- `price_1T7MRjA95N4c0ts1E3ALSGeQ` (Standard monthly — replaced by `price_1T7NCvA95N4c0ts1j6393yzD` bimonthly)
- `price_1T7MRlA95N4c0ts1TOBQV6ae` (Operator monthly — replaced by `price_1T7NCxA95N4c0ts17epbpXmg` bimonthly)

## Stripe Account
- Account: `acct_1T78EAA95N4c0ts1`
- Mode: **TEST/SANDBOX** (switch to LIVE before launch)

## Internal Product IDs (D1 Catalog)
| Internal ID | Tier | Billing |
|-------------|------|---------|
| PROD-HC-00001 | Standard | Bimonthly |
| PROD-HC-00002 | Operator | Bimonthly |
| PROD-HC-00003 | First Class | Monthly |
| PROD-HC-00004 | Elite (Monthly) | Monthly |
| PROD-HC-00005 | Elite (Annual) | Annual |
