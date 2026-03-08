// ═══════════════════════════════════════════════════════
// Daily Digest — Cron-triggered summary
// Runs at 04:00 UTC (8:00 PM PST) via wrangler cron
// ═══════════════════════════════════════════════════════

import { notifyDailyDigest, notifyError } from '../lib/slack.js';
import { logEvent } from '../lib/helpers.js';

/**
 * Called by the scheduled() handler in index.js
 */
export async function runDailyDigest(env) {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Gather today's stats from daily_stats table
    const dailyRow = await env.DB.prepare(
      'SELECT * FROM daily_stats WHERE stat_date = ?'
    ).bind(today).first();

    // Get recent high-value leads (score >= 70, last 24h)
    const hotLeads = await env.DB.prepare(
      `SELECT name, email, score, source FROM leads
       WHERE score >= 70 AND created_at >= datetime('now', '-1 day')
       ORDER BY score DESC LIMIT 5`
    ).all();

    // Get total active members count
    const memberCount = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM members WHERE status = 'active'`
    ).first();

    // Get recent payments summary (last 24h)
    const recentPayments = await env.DB.prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM payments
       WHERE status = 'completed' AND created_at >= datetime('now', '-1 day')`
    ).first();

    // Get pending/uncontacted leads count
    const pendingLeads = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM leads WHERE status = 'new'`
    ).first();

    // Build stats object
    const stats = {
      date: today,
      leads: {
        new_today: dailyRow?.lead_count || 0,
        avg_score: dailyRow?.lead_avg_score ? Math.round(dailyRow.lead_avg_score) : 0,
        pending_total: pendingLeads?.count || 0,
        hot_leads: hotLeads?.results || [],
      },
      payments: {
        count_today: dailyRow?.payment_count || recentPayments?.count || 0,
        total_today: dailyRow?.payment_total || recentPayments?.total || 0,
      },
      members: {
        active_total: memberCount?.count || 0,
        new_today: dailyRow?.member_count || 0,
      },
      passes: {
        issued_today: dailyRow?.passes_issued || 0,
      },
    };

    // Send to Slack
    await notifyDailyDigest(env, stats);

    // Log the digest event
    await logEvent(env.DB, {
      type: 'digest.sent',
      entityType: 'system',
      entityId: 'daily-digest',
      payload: stats,
    });

    console.log(`Daily digest sent for ${today}`);
  } catch (err) {
    console.error(`Digest error: ${err.message}`);
    await notifyError(env, {
      source: 'Daily Digest Cron',
      error: err.message,
      context: `Date: ${today}`,
    }).catch(() => {});
  }
}
