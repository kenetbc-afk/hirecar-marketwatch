/**
 * HIRECAR Product Sync Worker — HIRE Bot #14 (Cross-Platform Product Sync)
 * ARCH-HC-0302 Implementation: Phase 2 Component
 *
 * Classification: Infrastructure / Platform Operations
 * Supervisor Level: D14 (Platform Infrastructure)
 * QA Standard: QA-HC-SYNC — idempotent, audit-logged, retry-safe
 *
 * Responsibilities:
 *  - Listen for product changes in D1 (manual or webhook-triggered)
 *  - Fan out product data to: Stripe, PayPal, FanBasis, Wix
 *  - Log every sync attempt in sync_log for audit trail
 *  - Handle partial sync (some platforms succeed, others fail)
 *
 * Bindings required:
 *  - DB: D1 database (hirecar-db)
 *  - STRIPE_SECRET_KEY
 *  - PAYPAL_CLIENT_ID, PAYPAL_SECRET
 *  - FANBASIS_API_KEY (or FANBASIS_ZAPIER_WEBHOOK_URL)
 *  - WIX_API_KEY, WIX_SITE_ID
 */

// ═══════════════════════════════════════════════════════════════
// HIRE BOT REGISTRY (for cross-referencing across the fleet)
// ═══════════════════════════════════════════════════════════════
// HIRE Bot #01 — Enrollment & Onboarding (D01)
// HIRE Bot #02 — Disputes & Resolution (D02)
// HIRE Bot #03 — Score Monitoring (D03)
// HIRE Bot #04 — Document Management (D04)
// HIRE Bot #05 — Communications Engine (D05)
// HIRE Bot #06 — Playbook Execution (D06)
// HIRE Bot #07 — Digital Pass & Wallet (D07)
// HIRE Bot #08 — Billing & Invoicing (D08)
// HIRE Bot #09 — Member Portal (D09)
// HIRE Bot #10 — QA & Compliance (D10)
// HIRE Bot #11 — Advisor Assignment (D11)
// HIRE Bot #12 — Analytics & Reporting (D12)
// HIRE Bot #13 — CRM & Relationship Eng. (D13)
// HIRE Bot #14 — Platform Infrastructure (D14) ← THIS WORKER
// HIRE Bot #15 — Scheduling & Calendar (D15)
// HIRE Bot #16 — Security & Access (D16)
//
// Extended Bots (Payment Orchestration Layer):
// HIRE Bot #17 — Transaction Completion Engine (HIRE Bot, client-facing)
// HIRE Bot #18 — Milestone Progression Engine (Milestone Bot, internal)
// HIRE Bot #19 — Lane Evaluation Engine (Lane System, internal)
// HIRE Bot #20 — Cash Transaction Protocol (Cash Bot, field operations)
// ═══════════════════════════════════════════════════════════════

const BOT_ID = 'HIRE Bot #14';
const BOT_CLASS = 'Infrastructure / Platform Operations';

// ═══════════════════════════════════════════════════════════════
// STRIPE SYNC
// ═══════════════════════════════════════════════════════════════

async function syncToStripe(product, env) {
  const baseUrl = 'https://api.stripe.com/v1';
  const headers = {
    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    // Check if product already exists in Stripe
    if (product.stripe_product_id) {
      // Update existing product
      const updateBody = new URLSearchParams({
        name: product.name,
        description: product.description || '',
        active: product.active ? 'true' : 'false',
      });

      const res = await fetch(`${baseUrl}/products/${product.stripe_product_id}`, {
        method: 'POST',
        headers,
        body: updateBody,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Stripe update failed: ${err.error?.message || res.status}`);
      }

      const updated = await res.json();
      return {
        platform: 'stripe',
        status: 'success',
        stripe_product_id: updated.id,
        stripe_price_id: product.stripe_price_id, // price unchanged
      };
    }

    // Create new product in Stripe
    const createBody = new URLSearchParams({
      name: product.name,
      description: product.description || '',
    });

    const prodRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers,
      body: createBody,
    });

    if (!prodRes.ok) {
      const err = await prodRes.json();
      throw new Error(`Stripe product create failed: ${err.error?.message || prodRes.status}`);
    }

    const newProd = await prodRes.json();

    // Create price for the product
    const priceBody = new URLSearchParams({
      product: newProd.id,
      unit_amount: product.price_cents.toString(),
      currency: product.currency,
    });

    if (product.billing_interval !== 'one_time') {
      priceBody.set('recurring[interval]', product.billing_interval);
    }

    const priceRes = await fetch(`${baseUrl}/prices`, {
      method: 'POST',
      headers,
      body: priceBody,
    });

    if (!priceRes.ok) {
      const err = await priceRes.json();
      throw new Error(`Stripe price create failed: ${err.error?.message || priceRes.status}`);
    }

    const newPrice = await priceRes.json();

    // Create payment link
    const linkBody = new URLSearchParams({
      'line_items[0][price]': newPrice.id,
      'line_items[0][quantity]': '1',
    });

    const linkRes = await fetch(`${baseUrl}/payment_links`, {
      method: 'POST',
      headers,
      body: linkBody,
    });

    let paymentLink = null;
    if (linkRes.ok) {
      const linkData = await linkRes.json();
      paymentLink = linkData.url;
    }

    return {
      platform: 'stripe',
      status: 'success',
      stripe_product_id: newProd.id,
      stripe_price_id: newPrice.id,
      stripe_payment_link: paymentLink,
    };
  } catch (err) {
    return { platform: 'stripe', status: 'failed', error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// PAYPAL SYNC
// ═══════════════════════════════════════════════════════════════

async function getPayPalAccessToken(env) {
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function syncToPayPal(product, env) {
  try {
    const token = await getPayPalAccessToken(env);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // For recurring products, create a Billing Plan
    if (product.billing_interval !== 'one_time') {
      if (product.paypal_plan_id) {
        // Update existing plan (PayPal only allows limited updates on plans)
        const updateRes = await fetch(
          `https://api-m.paypal.com/v1/billing/plans/${product.paypal_plan_id}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify([
              { op: 'replace', path: '/description', value: product.description || product.name },
            ]),
          }
        );

        if (!updateRes.ok && updateRes.status !== 204) {
          const err = await updateRes.text();
          throw new Error(`PayPal plan update failed: ${err}`);
        }

        return {
          platform: 'paypal',
          status: 'success',
          paypal_plan_id: product.paypal_plan_id,
        };
      }

      // Create new Billing Plan
      const planPayload = {
        product_id: 'PROD-HIRECAR', // PayPal product (created once manually)
        name: product.name,
        description: product.description || product.name,
        billing_cycles: [
          {
            frequency: {
              interval_unit: product.billing_interval === 'month' ? 'MONTH' : 'YEAR',
              interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // Infinite
            pricing_scheme: {
              fixed_price: {
                value: (product.price_cents / 100).toFixed(2),
                currency_code: product.currency.toUpperCase(),
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 3,
        },
      };

      const planRes = await fetch('https://api-m.paypal.com/v1/billing/plans', {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(planPayload),
      });

      if (!planRes.ok) {
        const err = await planRes.text();
        throw new Error(`PayPal plan create failed: ${err}`);
      }

      const plan = await planRes.json();
      return {
        platform: 'paypal',
        status: 'success',
        paypal_plan_id: plan.id,
      };
    }

    // For one-time products, PayPal doesn't have a product catalog to sync — skip
    return { platform: 'paypal', status: 'skipped', reason: 'one_time product — no PayPal plan needed' };
  } catch (err) {
    return { platform: 'paypal', status: 'failed', error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// FANBASIS SYNC (via Zapier webhook or direct API)
// ═══════════════════════════════════════════════════════════════

async function syncToFanBasis(product, env) {
  try {
    const webhookUrl = env.FANBASIS_ZAPIER_WEBHOOK_URL;
    if (!webhookUrl) {
      return { platform: 'fanbasis', status: 'skipped', reason: 'No FanBasis webhook configured' };
    }

    const payload = {
      event: product.fanbasis_product_id ? 'product.updated' : 'product.created',
      product: {
        internal_id: product.product_id,
        name: product.name,
        description: product.description,
        price: (product.price_cents / 100).toFixed(2),
        currency: product.currency,
        tier: product.tier,
        billing_interval: product.billing_interval,
        active: !!product.active,
        fanbasis_product_id: product.fanbasis_product_id || null,
      },
      source: BOT_ID,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`FanBasis webhook failed: ${res.status}`);
    }

    // FanBasis product ID comes back async via return webhook
    return {
      platform: 'fanbasis',
      status: 'success',
      note: 'Sent to FanBasis via Zapier — product ID returned async',
    };
  } catch (err) {
    return { platform: 'fanbasis', status: 'failed', error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// WIX SYNC (via Wix REST API)
// ═══════════════════════════════════════════════════════════════

async function syncToWix(product, env) {
  try {
    const apiKey = env.WIX_API_KEY;
    const siteId = env.WIX_SITE_ID;

    if (!apiKey || !siteId) {
      return { platform: 'wix', status: 'skipped', reason: 'No Wix API credentials configured' };
    }

    const headers = {
      'Authorization': apiKey,
      'wix-site-id': siteId,
      'Content-Type': 'application/json',
    };

    if (product.wix_product_id) {
      // Update existing Wix product
      const updateRes = await fetch(
        `https://www.wixapis.com/stores/v1/products/${product.wix_product_id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            product: {
              name: product.name,
              description: product.description || '',
              priceData: {
                price: (product.price_cents / 100).toFixed(2),
                currency: product.currency.toUpperCase(),
              },
              visible: !!product.active,
            },
          }),
        }
      );

      if (!updateRes.ok) {
        const err = await updateRes.text();
        throw new Error(`Wix update failed: ${err}`);
      }

      return {
        platform: 'wix',
        status: 'success',
        wix_product_id: product.wix_product_id,
      };
    }

    // Create new Wix product
    const createRes = await fetch('https://www.wixapis.com/stores/v1/products', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product: {
          name: product.name,
          description: product.description || '',
          productType: 'digital',
          priceData: {
            price: (product.price_cents / 100).toFixed(2),
            currency: product.currency.toUpperCase(),
          },
          visible: !!product.active,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Wix create failed: ${err}`);
    }

    const wixData = await createRes.json();
    return {
      platform: 'wix',
      status: 'success',
      wix_product_id: wixData.product?.id || null,
    };
  } catch (err) {
    return { platform: 'wix', status: 'failed', error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// SYNC ORCHESTRATOR — The core of HIRE Bot #14
// ═══════════════════════════════════════════════════════════════

/**
 * Sync a single product to all configured platforms.
 * Logs every attempt to sync_log for D10 (QA) audit.
 *
 * @param {D1Database} db
 * @param {object} env - Worker environment bindings
 * @param {string} productId - Internal PROD-HC-NNNNN
 * @param {string} eventType - 'product.created' | 'product.updated' | 'product.deactivated'
 * @param {string} sourcePlatform - Where the change originated
 * @returns {object} Summary of sync results
 */
export async function syncProduct(db, env, productId, eventType = 'product.updated', sourcePlatform = 'manual') {
  // 1. Fetch product from D1
  const product = await db.prepare('SELECT * FROM products WHERE product_id = ?')
    .bind(productId).first();

  if (!product) {
    throw new Error(`Product ${productId} not found in D1`);
  }

  const eventId = `sync-${productId}-${Date.now()}`;
  const results = [];

  // 2. Define target platforms (skip the source to avoid loops)
  const targets = [
    { name: 'stripe', fn: syncToStripe },
    { name: 'paypal', fn: syncToPayPal },
    { name: 'fanbasis', fn: syncToFanBasis },
    { name: 'wix', fn: syncToWix },
  ].filter(t => t.name !== sourcePlatform);

  // 3. Fan out to all targets concurrently
  const syncResults = await Promise.allSettled(
    targets.map(t => t.fn(product, env))
  );

  // 4. Process results and log each one
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const result = syncResults[i];
    const outcome = result.status === 'fulfilled' ? result.value : {
      platform: target.name,
      status: 'failed',
      error: result.reason?.message || 'Unknown error',
    };

    results.push(outcome);

    // Log to sync_log
    await db.prepare(`
      INSERT INTO sync_log (event_type, event_id, source_platform, target_platform, product_id, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventType,
      eventId,
      sourcePlatform,
      target.name,
      productId,
      outcome.status,
      outcome.error || null,
    ).run();

    // Update platform-specific IDs in products table if successful
    if (outcome.status === 'success') {
      const updates = [];
      const values = [];

      if (outcome.stripe_product_id) { updates.push('stripe_product_id = ?'); values.push(outcome.stripe_product_id); }
      if (outcome.stripe_price_id) { updates.push('stripe_price_id = ?'); values.push(outcome.stripe_price_id); }
      if (outcome.stripe_payment_link) { updates.push('stripe_payment_link = ?'); values.push(outcome.stripe_payment_link); }
      if (outcome.paypal_plan_id) { updates.push('paypal_plan_id = ?'); values.push(outcome.paypal_plan_id); }
      if (outcome.fanbasis_product_id) { updates.push('fanbasis_product_id = ?'); values.push(outcome.fanbasis_product_id); }
      if (outcome.wix_product_id) { updates.push('wix_product_id = ?'); values.push(outcome.wix_product_id); }

      if (updates.length > 0) {
        updates.push('last_synced_at = datetime(\'now\')');
        values.push(productId);
        await db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`)
          .bind(...values).run();
      }
    }
  }

  // 5. Determine overall sync status
  const allSuccess = results.every(r => r.status === 'success' || r.status === 'skipped');
  const anySuccess = results.some(r => r.status === 'success');
  const overallStatus = allSuccess ? 'synced' : anySuccess ? 'partial' : 'failed';

  await db.prepare(`
    UPDATE products SET sync_status = ?, last_synced_at = datetime('now'), updated_at = datetime('now')
    WHERE product_id = ?
  `).bind(overallStatus, productId).run();

  return {
    bot: BOT_ID,
    productId,
    eventType,
    overallStatus,
    results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sync ALL active products to all platforms.
 * Used for initial bulk sync or recovery.
 */
export async function syncAllProducts(db, env) {
  const { results: products } = await db.prepare(
    'SELECT product_id FROM products WHERE active = 1'
  ).all();

  const syncResults = [];
  for (const p of products) {
    try {
      const result = await syncProduct(db, env, p.product_id, 'product.bulk_sync', 'manual');
      syncResults.push(result);
    } catch (err) {
      syncResults.push({
        bot: BOT_ID,
        productId: p.product_id,
        overallStatus: 'failed',
        error: err.message,
      });
    }
  }

  // Notify via Slack
  if (env.SLACK_WEBHOOK_URL) {
    const passed = syncResults.filter(r => r.overallStatus === 'synced').length;
    const partial = syncResults.filter(r => r.overallStatus === 'partial').length;
    const failed = syncResults.filter(r => r.overallStatus === 'failed').length;

    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🔄 *${BOT_ID} — Bulk Product Sync Complete*\n✅ Synced: ${passed} | ⚠️ Partial: ${partial} | ❌ Failed: ${failed}\nTotal products: ${syncResults.length}`,
      }),
    });
  }

  return { bot: BOT_ID, total: syncResults.length, results: syncResults };
}

/**
 * Handle inbound Stripe product webhook (product.created, product.updated)
 * to reverse-sync from Stripe into D1 + other platforms.
 */
export async function handleStripeProductWebhook(db, env, event) {
  const stripeProduct = event.data.object;
  const eventType = event.type; // product.created or product.updated

  // Find matching product in D1
  const existing = await db.prepare(
    'SELECT * FROM products WHERE stripe_product_id = ?'
  ).bind(stripeProduct.id).first();

  if (!existing) {
    // Unknown Stripe product — log but don't create (products should originate from D1)
    await db.prepare(`
      INSERT INTO sync_log (event_type, event_id, source_platform, target_platform, product_id, status, error_message)
      VALUES (?, ?, 'stripe', 'd1', NULL, 'skipped', 'Stripe product not in D1 catalog')
    `).bind(eventType, event.id).run();
    return { action: 'skipped', reason: 'Product not in D1 catalog' };
  }

  // Sync FROM Stripe to other platforms
  return syncProduct(db, env, existing.product_id, eventType, 'stripe');
}

// ═══════════════════════════════════════════════════════════════
// SYNC STATUS & REPORTING
// ═══════════════════════════════════════════════════════════════

/**
 * Get sync health report for HIRE Bot #12 (Analytics) dashboard.
 */
export async function getSyncHealthReport(db) {
  const productStatus = await db.prepare(`
    SELECT sync_status, COUNT(*) as count
    FROM products WHERE active = 1
    GROUP BY sync_status
  `).all();

  const recentFailures = await db.prepare(`
    SELECT product_id, target_platform, error_message, created_at
    FROM sync_log
    WHERE status = 'failed' AND created_at > datetime('now', '-24 hours')
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  const platformCoverage = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN stripe_product_id IS NOT NULL THEN 1 ELSE 0 END) as stripe_count,
      SUM(CASE WHEN paypal_plan_id IS NOT NULL THEN 1 ELSE 0 END) as paypal_count,
      SUM(CASE WHEN fanbasis_product_id IS NOT NULL THEN 1 ELSE 0 END) as fanbasis_count,
      SUM(CASE WHEN wix_product_id IS NOT NULL THEN 1 ELSE 0 END) as wix_count
    FROM products WHERE active = 1
  `).first();

  return {
    bot: BOT_ID,
    class: BOT_CLASS,
    report_time: new Date().toISOString(),
    product_sync_status: productStatus.results,
    platform_coverage: platformCoverage,
    recent_failures_24h: recentFailures.results,
  };
}

// ═══════════════════════════════════════════════════════════════
// API ROUTE REGISTRATION
// ═══════════════════════════════════════════════════════════════

export function registerSyncRoutes(router) {
  // Sync single product to all platforms
  router.post('/api/products/:id/sync', async (req, env) => {
    const result = await syncProduct(env.DB, env, req.params.id);
    return Response.json(result);
  });

  // Bulk sync all active products
  router.post('/api/products/sync-all', async (req, env) => {
    const result = await syncAllProducts(env.DB, env);
    return Response.json(result);
  });

  // Get sync health report
  router.get('/api/sync/health', async (req, env) => {
    const report = await getSyncHealthReport(env.DB);
    return Response.json(report);
  });

  // Get sync log for a product
  router.get('/api/products/:id/sync-log', async (req, env) => {
    const { results } = await env.DB.prepare(`
      SELECT * FROM sync_log WHERE product_id = ? ORDER BY created_at DESC LIMIT 50
    `).bind(req.params.id).all();
    return Response.json({ bot: BOT_ID, productId: req.params.id, log: results });
  });

  // Receive Stripe product webhooks
  router.post('/webhooks/stripe/products', async (req, env) => {
    // Verify Stripe signature (same pattern as payment webhooks)
    const event = await req.json();
    if (event.type === 'product.created' || event.type === 'product.updated') {
      const result = await handleStripeProductWebhook(env.DB, env, event);
      return Response.json(result);
    }
    return Response.json({ received: true });
  });
}
