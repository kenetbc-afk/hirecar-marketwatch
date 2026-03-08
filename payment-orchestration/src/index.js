/**
 * HIRECAR Payment Orchestration API — Main Entry Point
 * ═══════════════════════════════════════════════════════
 * Worker: api.hirecar.la
 * Architecture: ARCH-HC-0302 v1.1.0
 *
 * This is the main router that wires together all HIRE Bot modules:
 *  - payment-orchestrator.js  → Bots #08, #17, #18, #19, #20
 *  - product-sync-worker.js   → Bot #14
 *  - sms-integration.js       → Bots #17, #20 (SMS layer)
 *  - hire-bot-registry.js     → Fleet registry (reference only)
 *
 * All routes are prefixed under api.hirecar.la/
 */

// ═══════════════════════════════════════════════════════
// MODULE IMPORTS
// ═══════════════════════════════════════════════════════

import { registerPaymentRoutes } from './payment-orchestrator.js';
import { registerSyncRoutes } from './product-sync-worker.js';
import { registerSMSRoutes } from './sms-integration.js';
import { registerEnrollmentRoutes, EnrollmentBot } from './enrollment-flow.js';
import { HIRE_BOT_REGISTRY, getBot, getBotsByStatus } from './hire-bot-registry.js';

// ═══════════════════════════════════════════════════════
// CORS & SECURITY HEADERS
// ═══════════════════════════════════════════════════════

// Allowed origins: production + Cloudflare Pages test domains
const ALLOWED_ORIGINS = [
  'https://hirecar.la',
  'https://www.hirecar.la',
  'https://pricing.hirecar.la',
];
const PAGES_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.hirecar-(site|pricing)\.pages\.dev$/;

function getCorsHeaders(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || PAGES_ORIGIN_RE.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HIRE-Bot-ID',
    'Access-Control-Max-Age': '86400',
  };
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-HIRE-API-Version': '1.1.0',
};

function withHeaders(response, request) {
  const headers = new Headers(response.headers);
  Object.entries({ ...getCorsHeaders(request), ...SECURITY_HEADERS }).forEach(([k, v]) => {
    headers.set(k, v);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ═══════════════════════════════════════════════════════
// SIMPLE ROUTER
// ═══════════════════════════════════════════════════════

class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, handler) {
    // Convert route pattern to regex: /api/invoices/:id → /api/invoices/([^/]+)
    const paramNames = [];
    const regexStr = pattern.replace(/:([a-zA-Z_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      method: method.toUpperCase(),
      regex: new RegExp(`^${regexStr}$`),
      paramNames,
      handler,
    });
  }

  get(pattern, handler) { this.add('GET', pattern, handler); }
  post(pattern, handler) { this.add('POST', pattern, handler); }
  put(pattern, handler) { this.add('PUT', pattern, handler); }
  delete(pattern, handler) { this.add('DELETE', pattern, handler); }

  match(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method && route.method !== 'ALL') continue;
      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// ROUTE REGISTRATION
// ═══════════════════════════════════════════════════════

const router = new Router();

// ── Health & Meta Routes ──

router.get('/api/health', async (request, env, params) => {
  const activeBots = getBotsByStatus('active');
  return Response.json({
    status: 'healthy',
    service: 'hirecar-payment-api',
    version: '1.1.0',
    architecture: 'ARCH-HC-0302',
    environment: env.ENVIRONMENT || 'unknown',
    timestamp: new Date().toISOString(),
    bots: {
      total: Object.keys(HIRE_BOT_REGISTRY).length,
      active: activeBots.length,
      activeList: activeBots.map(b => `${b.id} — ${b.name}`),
    },
  });
});

router.get('/api/bots', async (request, env, params) => {
  return Response.json({
    registry: HIRE_BOT_REGISTRY,
    active: getBotsByStatus('active').map(b => ({
      id: b.id,
      name: b.name,
      version: b.version,
      classification: b.classification,
      status: b.status,
    })),
  });
});

router.get('/api/bots/:number', async (request, env, params) => {
  const bot = getBot(parseInt(params.number));
  if (!bot) {
    return Response.json({ error: `Bot #${params.number} not found` }, { status: 404 });
  }
  return Response.json(bot);
});

// ── Register sub-module routes ──
// Each module's registerXxxRoutes function adds routes to our router

registerPaymentRoutes(router);
registerSyncRoutes(router);
registerSMSRoutes(router);
registerEnrollmentRoutes(router);

// ═══════════════════════════════════════════════════════
// CRON HANDLERS
// ═══════════════════════════════════════════════════════

async function handleCron(event, env, ctx) {
  const cronTime = event.cron;

  switch (cronTime) {
    // Daily lane evaluation at 6 AM UTC
    case '0 6 * * *': {
      console.log('[CRON] Running daily lane evaluation — HIRE Bot #19');
      try {
        // Get all active members
        const members = await env.DB.prepare(
          `SELECT member_id, current_lane, hbi_score, days_in_lane
           FROM member_lanes WHERE current_lane != 'exit'`
        ).all();

        let transitions = 0;
        for (const member of members.results || []) {
          // Update days_in_lane
          await env.DB.prepare(
            `UPDATE member_lanes SET days_in_lane = days_in_lane + 1,
             last_evaluated = datetime('now') WHERE member_id = ?`
          ).bind(member.member_id).run();
          // Lane evaluation logic would call evaluateLane() from payment-orchestrator
        }
        console.log(`[CRON] Lane evaluation complete. ${members.results?.length || 0} members evaluated.`);
      } catch (err) {
        console.error('[CRON] Lane evaluation failed:', err.message);
      }
      break;
    }

    // Hourly cash receipt expiry check
    case '0 * * * *': {
      console.log('[CRON] Checking expired cash receipts — HIRE Bot #20');
      try {
        const expired = await env.DB.prepare(
          `UPDATE cash_receipts
           SET confirmation_status = 'expired', expired_at = datetime('now')
           WHERE confirmation_status = 'pending'
           AND datetime(logged_at, '+24 hours') < datetime('now')`
        ).run();
        console.log(`[CRON] Expired ${expired.meta?.changes || 0} cash receipts.`);

        // Send 12h reminders
        const needsReminder = await env.DB.prepare(
          `SELECT receipt_id, payer_phone, amount_applied_cents, payer_member_id
           FROM cash_receipts
           WHERE confirmation_status = 'pending'
           AND reminder_sent_at IS NULL
           AND datetime(logged_at, '+12 hours') < datetime('now')
           AND datetime(logged_at, '+24 hours') > datetime('now')`
        ).all();

        for (const receipt of needsReminder.results || []) {
          // Would call sendCashReminder() from sms-integration
          await env.DB.prepare(
            `UPDATE cash_receipts SET reminder_sent_at = datetime('now')
             WHERE receipt_id = ?`
          ).bind(receipt.receipt_id).run();
        }
        console.log(`[CRON] Sent ${needsReminder.results?.length || 0} cash receipt reminders.`);
      } catch (err) {
        console.error('[CRON] Cash receipt expiry check failed:', err.message);
      }
      break;
    }

    // Product sync health every 6 hours
    case '0 */6 * * *': {
      console.log('[CRON] Product sync health check — HIRE Bot #14');
      try {
        const unhealthy = await env.DB.prepare(
          `SELECT product_id, name, sync_status, last_synced_at
           FROM products
           WHERE active = 1 AND (sync_status != 'synced' OR last_synced_at IS NULL)`
        ).all();

        if (unhealthy.results?.length > 0) {
          console.warn(`[CRON] ${unhealthy.results.length} products need sync attention.`);
          // Would post to Slack webhook for ops alert
        }
      } catch (err) {
        console.error('[CRON] Sync health check failed:', err.message);
      }
      break;
    }

    default:
      console.log(`[CRON] Unhandled cron: ${cronTime}`);
  }
}

// ═══════════════════════════════════════════════════════
// WORKER ENTRY POINT
// ═══════════════════════════════════════════════════════

export default {
  /**
   * HTTP request handler — main entry point for api.hirecar.la
   */
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return withHeaders(new Response(null, { status: 204 }), request);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Route matching
    const matched = router.match(request.method, pathname);
    if (matched) {
      try {
        // Attach params to request so sub-modules can use request.params.xxx
        request.params = matched.params;
        const response = await matched.handler(request, env, matched.params);
        return withHeaders(response, request);
      } catch (err) {
        console.error(`[ERROR] ${request.method} ${pathname}:`, err.message);
        return withHeaders(
          Response.json(
            {
              error: 'Internal server error',
              message: env.ENVIRONMENT === 'test' ? err.message : undefined,
              bot: 'HIRE Bot API v1.1.0',
            },
            { status: 500 }
          ),
          request
        );
      }
    }

    // 404 fallback
    return withHeaders(
      Response.json(
        {
          error: 'Not Found',
          path: pathname,
          hint: 'Try GET /api/health or GET /api/bots for available endpoints.',
        },
        { status: 404 }
      ),
      request
    );
  },

  /**
   * Scheduled (cron) handler
   */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(event, env, ctx));
  },
};
