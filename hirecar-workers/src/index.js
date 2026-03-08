// ═══════════════════════════════════════════════════════
// HIRECAR API — Cloudflare Worker
// Main router for all endpoints
// Replaces Make.com scenarios with edge-native pipelines
// ═══════════════════════════════════════════════════════

import { json, handleCors } from './lib/helpers.js';
import { handleStripeWebhook, handlePaypalIPN } from './routes/payments.js';
import { handleLeadCapture, listLeads, getLead, updateLead } from './routes/leads.js';
import { listMembers, getMember, createMember, updateMember } from './routes/members.js';
import { runDailyDigest } from './routes/digest.js';

export default {
  /**
   * HTTP request handler
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleCors();
    }

    // Optional: simple API key auth for non-webhook routes
    if (path.startsWith('/api/') && env.API_KEY) {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.API_KEY}`) {
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    try {
      // ── Webhook Endpoints ────────────────────────────
      if (path === '/webhooks/stripe' && method === 'POST') {
        return await handleStripeWebhook(request, env);
      }
      if (path === '/webhooks/paypal' && method === 'POST') {
        return await handlePaypalIPN(request, env);
      }
      if (path === '/webhooks/leads' && method === 'POST') {
        return await handleLeadCapture(request, env);
      }

      // ── Members API ──────────────────────────────────
      if (path === '/api/members' && method === 'GET') {
        return await listMembers(request, env);
      }
      if (path === '/api/members' && method === 'POST') {
        return await createMember(request, env);
      }
      const memberMatch = path.match(/^\/api\/members\/([^/]+)$/);
      if (memberMatch) {
        if (method === 'GET') return await getMember(memberMatch[1], env);
        if (method === 'PUT') return await updateMember(memberMatch[1], request, env);
      }

      // ── Leads API ────────────────────────────────────
      if (path === '/api/leads' && method === 'GET') {
        return await listLeads(request, env);
      }
      const leadMatch = path.match(/^\/api\/leads\/([^/]+)$/);
      if (leadMatch) {
        if (method === 'GET') return await getLead(leadMatch[1], env);
        if (method === 'PUT') return await updateLead(leadMatch[1], request, env);
      }

      // ── Payments API (read-only) ─────────────────────
      if (path === '/api/payments' && method === 'GET') {
        return await listPayments(request, env);
      }

      // ── Stats / Dashboard ────────────────────────────
      if (path === '/api/stats' && method === 'GET') {
        return await getStats(env);
      }
      if (path === '/api/stats/daily' && method === 'GET') {
        return await getDailyStats(request, env);
      }

      // ── Health Check ─────────────────────────────────
      if (path === '/health' || path === '/') {
        return json({
          status: 'ok',
          service: 'hirecar-api',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        });
      }

      // ── 404 ──────────────────────────────────────────
      return json({ error: 'Not found', path }, 404);

    } catch (err) {
      console.error(`Unhandled error: ${err.message}`);
      return json({ error: 'Internal server error' }, 500);
    }
  },

  /**
   * Cron trigger handler — runs daily digest
   */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailyDigest(env));
  },
};

// ── Inline helpers for simple read endpoints ──────────

async function listPayments(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const method = url.searchParams.get('method');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM payments WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (method) {
    query += ' AND method = ?';
    params.push(method);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();
  return json({ payments: results.results, count: results.results.length });
}

async function getStats(env) {
  const [members, leads, payments, todayStats] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM members`).first(),
    env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as pending, AVG(score) as avg_score FROM leads`).first(),
    env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) as revenue FROM payments`).first(),
    env.DB.prepare(`SELECT * FROM daily_stats WHERE stat_date = ?`).bind(new Date().toISOString().split('T')[0]).first(),
  ]);

  return json({
    members: { total: members?.total || 0, active: members?.active || 0 },
    leads: { total: leads?.total || 0, pending: leads?.pending || 0, avg_score: Math.round(leads?.avg_score || 0) },
    payments: { total: payments?.total || 0, lifetime_revenue: payments?.revenue || 0 },
    today: todayStats || {},
  });
}

async function getDailyStats(request, env) {
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90);

  const results = await env.DB.prepare(
    `SELECT * FROM daily_stats WHERE stat_date >= date('now', '-' || ? || ' days') ORDER BY stat_date DESC`
  ).bind(days).all();

  return json({ stats: results.results, days });
}
