# Embedding the Pricing Page in Wix
**Quick guide for adding the HIRECAR pricing page to hirecar.la**

---

## Option A: Wix HTML iFrame (Simplest)

1. **Upload `pricing.html`** to your Wix site's Media Manager
   - Or host it on Cloudflare Pages (free)

2. **Add to Wix:**
   - Open the Wix Editor for hirecar.la
   - Add Element → Embed → Custom Element or HTML iFrame
   - Paste the URL of your hosted pricing.html
   - Set to full-width, height ~1400px

## Option B: Cloudflare Pages (Recommended)

This gives you a clean URL like `pricing.hirecar.la`:

```bash
# From the wix-pricing-page folder:
wrangler pages project create hirecar-pricing
wrangler pages deploy . --project-name=hirecar-pricing
```

Then add a CNAME record:
- `pricing` → `hirecar-pricing.pages.dev`

Embed in Wix via iFrame pointing to `https://pricing.hirecar.la`

## Option C: Direct Wix Page

If you prefer native Wix over embedded HTML:
1. Create a new page called "Pricing" in the Wix Editor
2. Use the design tokens and copy from pricing.html as reference
3. Add Stripe Payment Link buttons manually for each tier
4. The payment links are already configured and working:

| Tier | Payment Link |
|------|-------------|
| Standard ($29/2mo) | `https://buy.stripe.com/test_00w8wO3F95E7e720yZ43S0f` |
| Operator ($59/2mo) | `https://buy.stripe.com/test_cNi5kCcbF2rV3soa9z43S0g` |
| Elite Annual ($1,990/yr) | `https://buy.stripe.com/test_5kQbJ05Nh0jN8MI1D343S0e` |

## Stripe Metadata Setup

**Important:** Before going live, add tier metadata to each Stripe Payment Link so the enrollment bot knows which tier to assign:

```bash
# Using Stripe CLI:
stripe payment_links update plink_STANDARD --metadata[tier]=standard
stripe payment_links update plink_OPERATOR --metadata[tier]=operator
stripe payment_links update plink_ELITE    --metadata[tier]=elite
```

Or in the Stripe Dashboard:
1. Go to Payment Links → click each link → Edit
2. Under "After payment" or metadata section, add: key=`tier`, value=`standard` (or `operator`, `first_class`, `elite`)

---

*All payment links are currently in TEST/SANDBOX mode. Switch to live keys before launch.*
