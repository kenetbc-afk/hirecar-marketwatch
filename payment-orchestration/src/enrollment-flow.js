// ═══════════════════════════════════════════════════════════════════
// HIRE Bot #01 — Enrollment & Onboarding Worker Module
// BOT-HC-0101 v1.0.0
// ═══════════════════════════════════════════════════════════════════
// Handles the complete member enrollment pipeline:
//   Stripe checkout.session.completed → D1 member record →
//   Welcome email (Brevo) → Slack notification → HBI initialization
// ═══════════════════════════════════════════════════════════════════

// ── Tier Configuration ──
const TIER_CONFIG = {
  'prod_U5XWipFt8cj4Cx': { tier: 'standard',    name: 'Standard',    botAccess: [1],               hbiBase: 500 },
  'prod_U5XWNeWwEKiWCf': { tier: 'operator',     name: 'Operator',    botAccess: [1,2,3,4,5],       hbiBase: 550 },
  'prod_U5XWRAHiodwAFe': { tier: 'first_class',  name: 'First Class', botAccess: Array.from({length:16},(_,i)=>i+1), hbiBase: 600 },
  'prod_U5XWJDSLiyUrN1': { tier: 'elite',        name: 'Elite',       botAccess: Array.from({length:20},(_,i)=>i+1), hbiBase: 700 },
};

// ── Member ID Generator ──
function generateMemberId() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `HC-${year}-${seq}`;
}

// ── Enrollment Pipeline ──
export class EnrollmentBot {
  constructor(env) {
    this.env = env;
    this.db = env.DB;
    this.kv = env.KV;
  }

  // ─────────────────────────────────────
  // Main: Process Stripe checkout.session.completed
  // ─────────────────────────────────────
  async processCheckoutCompleted(session) {
    const startTime = Date.now();
    const results = { steps: [], errors: [] };

    try {
      // Step 1: Extract customer data from Stripe session (async — fetches line_items from API)
      const customerData = await this.extractCustomerData(session);
      results.steps.push({ step: 'extract', status: 'ok', data: customerData });

      // Step 2: Check for duplicate enrollment
      const existing = await this.checkDuplicate(customerData.email);
      if (existing) {
        results.steps.push({ step: 'dedup', status: 'existing', memberId: existing.member_id });
        // Upgrade path: if new tier > existing tier, upgrade
        if (this.shouldUpgrade(existing.tier, customerData.tier)) {
          return await this.processUpgrade(existing, customerData, results);
        }
        return { action: 'duplicate', memberId: existing.member_id, results };
      }
      results.steps.push({ step: 'dedup', status: 'new' });

      // Step 3: Create member record in D1
      const memberId = generateMemberId();
      await this.createMemberRecord(memberId, customerData);
      results.steps.push({ step: 'create_member', status: 'ok', memberId });

      // Step 4: Initialize HBI scoring
      await this.initializeHBI(memberId, customerData.tier);
      results.steps.push({ step: 'init_hbi', status: 'ok' });

      // Step 5: Cache member in KV for fast lookups
      await this.cacheMember(memberId, customerData);
      results.steps.push({ step: 'cache', status: 'ok' });

      // Step 6: Send welcome email via Brevo
      const emailResult = await this.sendWelcomeEmail(customerData, memberId);
      results.steps.push({ step: 'welcome_email', status: emailResult.ok ? 'sent' : 'failed' });

      // Step 7: Create PassKit digital membership pass (Bot #07)
      const passResult = await this.createPassKitPass(customerData, memberId);
      results.steps.push({ step: 'passkit_pass', status: passResult.ok ? 'created' : 'skipped' });

      // Step 8: Post Slack notification
      const slackResult = await this.postSlackNotification(customerData, memberId);
      results.steps.push({ step: 'slack', status: slackResult.ok ? 'sent' : 'failed' });

      // Step 9: Log enrollment event
      await this.logEnrollmentEvent(memberId, customerData, startTime);
      results.steps.push({ step: 'audit_log', status: 'ok' });

      return {
        action: 'enrolled',
        memberId,
        tier: customerData.tier,
        durationMs: Date.now() - startTime,
        results,
      };

    } catch (error) {
      results.errors.push({ step: 'pipeline', error: error.message });
      // Still try to notify on failure
      await this.postErrorNotification(error, session).catch(() => {});
      throw error;
    }
  }

  // ─────────────────────────────────────
  // Step 1: Extract customer data
  // ─────────────────────────────────────
  // NOTE: Stripe's checkout.session.completed webhook does NOT include
  // line_items by default. We fetch them from the API to get the product ID
  // for accurate tier detection.
  async extractCustomerData(session) {
    let productId = session.line_items?.data?.[0]?.price?.product
                 || session.metadata?.product_id
                 || null;
    let priceId = session.line_items?.data?.[0]?.price?.id || '';

    // If line_items not present in webhook payload, fetch from Stripe API
    if (!productId && this.env.STRIPE_SECRET_KEY && session.id) {
      try {
        const resp = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${this.env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        if (resp.ok) {
          const lineItems = await resp.json();
          const firstItem = lineItems.data?.[0];
          productId = firstItem?.price?.product || null;
          priceId = firstItem?.price?.id || priceId;
          console.log(`[EnrollmentBot] Fetched line_items from Stripe API — product: ${productId}, price: ${priceId}`);
        } else {
          console.warn(`[EnrollmentBot] Failed to fetch line_items: ${resp.status} ${resp.statusText}`);
        }
      } catch (err) {
        console.warn(`[EnrollmentBot] Error fetching line_items from Stripe: ${err.message}`);
      }
    }

    const tierConfig = TIER_CONFIG[productId] || TIER_CONFIG['prod_U5XWipFt8cj4Cx']; // Default: Standard

    if (!productId) {
      console.warn(`[EnrollmentBot] No product ID found — defaulting to Standard tier. Session: ${session.id}`);
    }

    return {
      email: session.customer_details?.email || session.customer_email || '',
      name: session.customer_details?.name || '',
      phone: session.customer_details?.phone || '',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      productId,
      priceId,
      tier: tierConfig.tier,
      tierName: tierConfig.name,
      botAccess: tierConfig.botAccess,
      hbiBase: tierConfig.hbiBase,
      amountPaid: session.amount_total || 0,
      currency: session.currency || 'usd',
      source: session.metadata?.source || 'stripe_checkout',
    };
  }

  // ─────────────────────────────────────
  // Step 2: Duplicate check
  // ─────────────────────────────────────
  async checkDuplicate(email) {
    if (!email) return null;
    const result = await this.db.prepare(
      'SELECT member_id, tier, status, stripe_customer_id FROM members WHERE email = ? AND status != ?'
    ).bind(email.toLowerCase(), 'cancelled').first();
    return result || null;
  }

  shouldUpgrade(currentTier, newTier) {
    const tierOrder = { standard: 1, operator: 2, first_class: 3, elite: 4 };
    return (tierOrder[newTier] || 0) > (tierOrder[currentTier] || 0);
  }

  async processUpgrade(existing, customerData, results) {
    await this.db.prepare(
      `UPDATE members SET
        tier = ?,
        stripe_subscription_id = ?,
        bot_access = ?,
        upgraded_at = datetime('now'),
        updated_at = datetime('now')
       WHERE member_id = ?`
    ).bind(
      customerData.tier,
      customerData.stripeSubscriptionId,
      JSON.stringify(customerData.botAccess),
      existing.member_id
    ).run();

    results.steps.push({ step: 'upgrade', status: 'ok', from: existing.tier, to: customerData.tier });

    // Notify about upgrade
    await this.postSlackNotification(customerData, existing.member_id, 'upgrade');

    return { action: 'upgraded', memberId: existing.member_id, from: existing.tier, to: customerData.tier, results };
  }

  // ─────────────────────────────────────
  // Step 3: Create member record
  // ─────────────────────────────────────
  async createMemberRecord(memberId, data) {
    await this.db.prepare(
      `INSERT INTO members (
        member_id, email, name, phone, tier, status,
        stripe_customer_id, stripe_subscription_id,
        product_id, price_id, bot_access,
        enrollment_source, amount_paid, currency,
        enrolled_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      memberId,
      data.email.toLowerCase(),
      data.name,
      data.phone,
      data.tier,
      data.stripeCustomerId,
      data.stripeSubscriptionId,
      data.productId,
      data.priceId,
      JSON.stringify(data.botAccess),
      data.source,
      data.amountPaid,
      data.currency
    ).run();
  }

  // ─────────────────────────────────────
  // Step 4: Initialize HBI scoring
  // ─────────────────────────────────────
  async initializeHBI(memberId, tier) {
    const config = Object.values(TIER_CONFIG).find(c => c.tier === tier) || TIER_CONFIG['prod_U5XWipFt8cj4Cx'];

    await this.db.prepare(
      `INSERT INTO member_scores (
        member_id, hbi_score, cri_score, bre_score, fpi_score, vdi_score, msi_score,
        lane, lane_updated_at, updated_at
      ) VALUES (?, ?, 500, 500, 500, 500, 500, 'revenue', datetime('now'), datetime('now'))`
    ).bind(memberId, config.hbiBase).run();
  }

  // ─────────────────────────────────────
  // Step 5: Cache in KV
  // ─────────────────────────────────────
  async cacheMember(memberId, data) {
    const cacheData = {
      memberId,
      email: data.email,
      name: data.name,
      tier: data.tier,
      botAccess: data.botAccess,
      stripeCustomerId: data.stripeCustomerId,
      enrolledAt: new Date().toISOString(),
    };
    // TTL: 7 days — refreshed on each access
    await this.kv.put(`member:${memberId}`, JSON.stringify(cacheData), { expirationTtl: 604800 });
    // Email → memberId index
    await this.kv.put(`email:${data.email.toLowerCase()}`, memberId, { expirationTtl: 604800 });
  }

  // ─────────────────────────────────────
  // Step 6: Welcome email via Brevo
  // ─────────────────────────────────────
  async sendWelcomeEmail(data, memberId) {
    const brevoKey = this.env.BREVO_API_KEY;
    if (!brevoKey) return { ok: false, reason: 'no_api_key' };

    const tierBenefits = {
      standard:    ['HIRE Bot #01 enrollment assistant', 'Credit monitoring dashboard', 'Community access'],
      operator:    ['5 specialized HIRE Bots', 'Priority service matching', 'HBI optimization tools', 'Strategy calls'],
      first_class: ['Full 16-bot HIRE Fleet', 'Fleet management dashboard', 'Dedicated account manager', 'Cash protocol'],
      elite:       ['All 20 HIRE Bots + Payment Layer', 'SeedXchange partnership', 'Custom API access', 'Crypto channels'],
    };

    const benefits = tierBenefits[data.tier] || tierBenefits.standard;

    const htmlBody = `
    <div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F5F5; padding: 0;">
      <div style="background: linear-gradient(135deg, #111820 0%, #0F4C75 100%); color: #FFFFFF; padding: 40px 32px; text-align: center;">
        <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; margin: 0 0 8px;">Welcome to HIRECAR</h1>
        <p style="color: #C9920A; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">${data.tierName} Member</p>
      </div>
      <div style="background: #FFFFFF; padding: 32px;">
        <p>Hey ${data.name || 'there'},</p>
        <p>You're officially in the <strong>${data.tierName}</strong> lane. Your member ID is <code style="background: #F5F5F5; padding: 2px 8px; border-radius: 4px; font-family: 'DM Mono', monospace;">${memberId}</code>.</p>
        <p style="font-weight: 700; margin-top: 24px;">Here's what you've unlocked:</p>
        <ul style="padding-left: 20px;">
          ${benefits.map(b => `<li style="padding: 4px 0;">${b}</li>`).join('')}
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://hirecar.la/dashboard" style="display: inline-block; background: #C9920A; color: #FFFFFF; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700;">Access Your Dashboard</a>
        </div>
        <p style="color: #6B7280; font-size: 13px;">Questions? Reply to this email or reach us on Slack. We're here to help you own the road.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #6B7280; font-size: 11px;">
        <p>&copy; 2026 HIRECAR, LLC dba HIRECREDIT</p>
      </div>
    </div>`;

    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'HIRECAR', email: 'hello@hirecar.la' },
          to: [{ email: data.email, name: data.name }],
          subject: `Welcome to HIRECAR ${data.tierName} — You're In!`,
          htmlContent: htmlBody,
          tags: ['enrollment', `tier:${data.tier}`],
        }),
      });
      return { ok: resp.ok, status: resp.status };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }

  // ─────────────────────────────────────
  // Step 7: PassKit digital membership pass (Bot #07)
  // ─────────────────────────────────────
  async createPassKitPass(data, memberId) {
    const apiKey = this.env.PASSKIT_API_KEY;
    const programId = this.env.PASSKIT_PROGRAM_ID;
    if (!apiKey || !programId) return { ok: false, reason: 'passkit_not_configured' };

    try {
      const tierNames = { standard: 'Standard', operator: 'Operator', first_class: 'First Class', elite: 'Elite' };
      const resp = await fetch('https://api.pub1.passkit.io/members/member', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: programId,
          externalId: memberId,
          tierId: data.tier || 'standard',
          person: {
            forename: data.name ? data.name.split(' ')[0] : '',
            surname: data.name ? data.name.split(' ').slice(1).join(' ') : '',
            emailAddress: data.email,
          },
          metaData: {
            memberId: memberId,
            tier: tierNames[data.tier] || 'Standard',
            portalLink: 'https://hirecar-portal.pages.dev',
            enrolledAt: new Date().toISOString(),
          },
        }),
      });

      if (resp.ok) {
        const result = await resp.json();
        console.log(`[PassKit Bot #07] Pass created for ${memberId}: ${result.id || 'ok'}`);
        return { ok: true, passId: result.id };
      } else {
        const errBody = await resp.text();
        console.error(`[PassKit Bot #07] Failed: ${resp.status} ${errBody}`);
        return { ok: false, reason: `${resp.status}: ${errBody}` };
      }
    } catch (err) {
      console.error(`[PassKit Bot #07] Error: ${err.message}`);
      return { ok: false, reason: err.message };
    }
  }

  // ─────────────────────────────────────
  // Step 8: Slack notification
  // ─────────────────────────────────────
  async postSlackNotification(data, memberId, type = 'new') {
    const webhookUrl = this.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return { ok: false, reason: 'no_webhook' };

    const emoji = type === 'upgrade' ? '⬆️' : '🎉';
    const action = type === 'upgrade' ? 'UPGRADED' : 'NEW MEMBER';
    const amount = (data.amountPaid / 100).toFixed(2);

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${action}: ${data.name || data.email}*\n` +
                `> *Tier:* ${data.tierName}  |  *ID:* \`${memberId}\`\n` +
                `> *Amount:* $${amount} ${data.currency.toUpperCase()}  |  *Source:* ${data.source}\n` +
                `> *Email:* ${data.email}${data.phone ? `  |  *Phone:* ${data.phone}` : ''}`,
        },
      },
    ];

    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      return { ok: resp.ok };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }

  // ─────────────────────────────────────
  // Step 8: Audit log
  // ─────────────────────────────────────
  async logEnrollmentEvent(memberId, data, startTime) {
    await this.db.prepare(
      `INSERT INTO audit_log (
        event_type, member_id, tier, details, duration_ms, created_at
      ) VALUES ('enrollment', ?, ?, ?, ?, datetime('now'))`
    ).bind(
      memberId,
      data.tier,
      JSON.stringify({
        email: data.email,
        source: data.source,
        stripeCustomerId: data.stripeCustomerId,
        amount: data.amountPaid,
      }),
      Date.now() - startTime
    ).run();
  }

  // ─────────────────────────────────────
  // Error notification
  // ─────────────────────────────────────
  async postErrorNotification(error, session) {
    const webhookUrl = this.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *ENROLLMENT FAILURE*\n` +
              `> Error: ${error.message}\n` +
              `> Session: ${session?.id || 'unknown'}\n` +
              `> Email: ${session?.customer_details?.email || 'unknown'}`,
      }),
    });
  }
}

// ── D1 Migration for Members & Scores Tables ──
export const ENROLLMENT_MIGRATION = `
-- ═══════════════════════════════════════════════════
-- D1 Migration 003: Members & Enrollment Tables
-- BOT-HC-0101 — HIRE Bot #01 Enrollment Schema
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS members (
  member_id         TEXT PRIMARY KEY,
  email             TEXT NOT NULL,
  name              TEXT DEFAULT '',
  phone             TEXT DEFAULT '',
  tier              TEXT NOT NULL CHECK(tier IN ('standard','operator','first_class','elite')),
  status            TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled','suspended')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  product_id        TEXT,
  price_id          TEXT,
  bot_access        TEXT DEFAULT '[]',
  enrollment_source TEXT DEFAULT 'stripe_checkout',
  amount_paid       INTEGER DEFAULT 0,
  currency          TEXT DEFAULT 'usd',
  enrolled_at       TEXT NOT NULL DEFAULT (datetime('now')),
  upgraded_at       TEXT,
  cancelled_at      TEXT,
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_stripe ON members(stripe_customer_id);

CREATE TABLE IF NOT EXISTS member_scores (
  member_id    TEXT PRIMARY KEY REFERENCES members(member_id),
  hbi_score    INTEGER DEFAULT 500,
  cri_score    INTEGER DEFAULT 500,
  bre_score    INTEGER DEFAULT 500,
  fpi_score    INTEGER DEFAULT 500,
  vdi_score    INTEGER DEFAULT 500,
  msi_score    INTEGER DEFAULT 500,
  lane         TEXT DEFAULT 'revenue' CHECK(lane IN ('revenue','cure','remedy','exit')),
  lane_updated_at TEXT,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type   TEXT NOT NULL,
  member_id    TEXT,
  tier         TEXT,
  details      TEXT DEFAULT '{}',
  duration_ms  INTEGER DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_member ON audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);

-- View: Active member counts by tier
CREATE VIEW IF NOT EXISTS v_member_distribution AS
SELECT
  tier,
  COUNT(*) as member_count,
  SUM(amount_paid) / 100.0 as total_revenue,
  AVG(JULIANDAY('now') - JULIANDAY(enrolled_at)) as avg_tenure_days
FROM members
WHERE status = 'active'
GROUP BY tier;

-- View: Enrollment funnel (last 30 days)
CREATE VIEW IF NOT EXISTS v_enrollment_funnel AS
SELECT
  DATE(created_at) as enroll_date,
  COUNT(*) as enrollments,
  SUM(CASE WHEN event_type = 'enrollment' THEN 1 ELSE 0 END) as new_members,
  SUM(CASE WHEN event_type = 'upgrade' THEN 1 ELSE 0 END) as upgrades,
  AVG(duration_ms) as avg_pipeline_ms
FROM audit_log
WHERE created_at > datetime('now', '-30 days')
  AND event_type IN ('enrollment', 'upgrade')
GROUP BY DATE(created_at)
ORDER BY enroll_date DESC;
`;

// ── Route Registration ──
export function registerEnrollmentRoutes(router) {

  // POST /api/enroll — Manual enrollment (admin)
  router.post('/api/enroll', async (request, env, params) => {
    const bot = new EnrollmentBot(env);
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.tier) {
      return Response.json({ error: 'email and tier required' }, { status: 400 });
    }

    const tierConfig = Object.values(TIER_CONFIG).find(c => c.tier === body.tier);
    if (!tierConfig) {
      return Response.json({ error: 'Invalid tier. Use: standard, operator, first_class, elite' }, { status: 400 });
    }

    // Build a synthetic session-like object
    const syntheticSession = {
      customer_details: { email: body.email, name: body.name || '', phone: body.phone || '' },
      customer: body.stripeCustomerId || null,
      subscription: body.stripeSubscriptionId || null,
      line_items: { data: [{ price: { product: Object.keys(TIER_CONFIG).find(k => TIER_CONFIG[k].tier === body.tier) } }] },
      amount_total: body.amountPaid || 0,
      currency: body.currency || 'usd',
      metadata: { source: 'manual_enrollment' },
    };

    try {
      const result = await bot.processCheckoutCompleted(syntheticSession);
      return Response.json({ bot: 'HIRE Bot #01', version: '1.0.0', ...result });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  });

  // GET /api/members — List members
  router.get('/api/members', async (request, env, params) => {
    const url = new URL(request.url);
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status') || 'active';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT * FROM members WHERE status = ?';
    const binds = [status];

    if (tier) {
      query += ' AND tier = ?';
      binds.push(tier);
    }

    query += ' ORDER BY enrolled_at DESC LIMIT ? OFFSET ?';
    binds.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...binds).all();

    return Response.json({
      bot: 'HIRE Bot #01',
      members: result.results,
      count: result.results.length,
      filters: { tier, status, limit, offset },
    });
  });

  // GET /api/members/:id — Single member detail
  router.get('/api/members/:id', async (request, env, params) => {
    const memberId = params.id;

    // Try KV cache first
    const cached = await env.KV.get(`member:${memberId}`);
    if (cached) {
      const member = JSON.parse(cached);
      member._source = 'cache';
      return Response.json({ bot: 'HIRE Bot #01', member });
    }

    // Fall back to D1
    const member = await env.DB.prepare(
      'SELECT m.*, s.hbi_score, s.lane FROM members m LEFT JOIN member_scores s ON m.member_id = s.member_id WHERE m.member_id = ?'
    ).bind(memberId).first();

    if (!member) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }

    member._source = 'database';
    return Response.json({ bot: 'HIRE Bot #01', member });
  });

  // GET /api/members/stats — Dashboard stats
  router.get('/api/members/stats', async (request, env, params) => {
    const distribution = await env.DB.prepare('SELECT * FROM v_member_distribution').all();
    const funnel = await env.DB.prepare('SELECT * FROM v_enrollment_funnel').all();
    const totalActive = await env.DB.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").first();

    return Response.json({
      bot: 'HIRE Bot #01',
      stats: {
        totalActiveMembers: totalActive?.count || 0,
        tierDistribution: distribution.results,
        enrollmentFunnel: funnel.results,
      },
    });
  });
}
