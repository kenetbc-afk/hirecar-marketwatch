// ═══════════════════════════════════════════════════════
// Lead Capture Pipeline — Replaces Make.com Scenario 2
// Handles form submissions, scores leads, routes them
// ═══════════════════════════════════════════════════════

import { json, generateId, scoreLead, logEvent } from '../lib/helpers.js';
import { notifyNewLead } from '../lib/slack.js';
import { sendLeadFollowUp } from '../lib/email.js';

/**
 * POST /webhooks/leads
 * Receives lead form submissions from website, landing pages, etc.
 */
export async function handleLeadCapture(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate required fields
  if (!data.email || !data.name) {
    return json({ error: 'Missing required fields: name, email' }, 400);
  }

  // Normalize input
  const lead = {
    lead_id: generateId('lead'),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    source: data.source?.toLowerCase() || 'website',
    goals: data.goals?.trim() || null,
    status: 'new',
    assigned_to: null,
    notes: data.notes?.trim() || null,
  };

  // Score the lead
  lead.score = scoreLead(lead);

  // Auto-assign based on score
  if (lead.score >= 70) {
    lead.assigned_to = 'sales-team';
    lead.status = 'qualified';
  } else if (lead.score >= 40) {
    lead.assigned_to = 'nurture-queue';
    lead.status = 'new';
  } else {
    lead.assigned_to = 'low-priority';
    lead.status = 'new';
  }

  try {
    // Check for duplicate email (update existing lead if found)
    const existing = await env.DB.prepare(
      `SELECT lead_id, score, status FROM leads WHERE email = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(lead.email).first();

    if (existing) {
      // Update existing lead with new info (keep higher score)
      await env.DB.prepare(
        `UPDATE leads SET
          name = ?, phone = COALESCE(?, phone), score = MAX(?, score),
          source = ?, goals = COALESCE(?, goals), notes = COALESCE(?, notes),
          assigned_to = ?, updated_at = datetime('now')
         WHERE lead_id = ?`
      ).bind(
        lead.name, lead.phone, lead.score,
        lead.source, lead.goals, lead.notes,
        lead.assigned_to, existing.lead_id
      ).run();

      lead.lead_id = existing.lead_id;
      lead.is_returning = true;
    } else {
      // Insert new lead
      await env.DB.prepare(
        `INSERT INTO leads (lead_id, name, email, phone, score, source, goals, status, assigned_to, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        lead.lead_id, lead.name, lead.email, lead.phone,
        lead.score, lead.source, lead.goals, lead.status,
        lead.assigned_to, lead.notes
      ).run();
    }

    // Log the event
    await logEvent(env.DB, {
      type: existing ? 'lead.updated' : 'lead.created',
      entityType: 'lead',
      entityId: lead.lead_id,
      payload: { score: lead.score, source: lead.source, assigned_to: lead.assigned_to },
    });

    // Update daily stats
    await updateDailyLeadStats(env.DB, lead.score);

    // Send notifications (non-blocking)
    await Promise.allSettled([
      notifyNewLead(env, lead),
      lead.score >= 40
        ? sendLeadFollowUp(env, lead)
        : Promise.resolve(), // Low-score leads get nurture email later via cron
    ]);

    return json({
      success: true,
      lead_id: lead.lead_id,
      score: lead.score,
      assigned_to: lead.assigned_to,
      is_returning: !!existing,
    });
  } catch (err) {
    console.error(`Lead capture error: ${err.message}`);
    return json({ error: 'Failed to process lead', detail: err.message }, 500);
  }
}

/**
 * GET /api/leads
 * List leads with optional filters
 */
export async function listLeads(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const minScore = url.searchParams.get('min_score');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (minScore) {
    query += ' AND score >= ?';
    params.push(parseInt(minScore));
  }

  query += ' ORDER BY score DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();
  return json({ leads: results.results, count: results.results.length });
}

/**
 * GET /api/leads/:id
 * Get a single lead by ID
 */
export async function getLead(leadId, env) {
  const lead = await env.DB.prepare(
    'SELECT * FROM leads WHERE lead_id = ?'
  ).bind(leadId).first();

  if (!lead) {
    return json({ error: 'Lead not found' }, 404);
  }
  return json(lead);
}

/**
 * PUT /api/leads/:id
 * Update lead status, assignment, notes
 */
export async function updateLead(leadId, request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const existing = await env.DB.prepare(
    'SELECT * FROM leads WHERE lead_id = ?'
  ).bind(leadId).first();

  if (!existing) {
    return json({ error: 'Lead not found' }, 404);
  }

  const updates = {
    status: data.status || existing.status,
    assigned_to: data.assigned_to || existing.assigned_to,
    notes: data.notes !== undefined ? data.notes : existing.notes,
    score: data.score !== undefined ? data.score : existing.score,
  };

  await env.DB.prepare(
    `UPDATE leads SET status = ?, assigned_to = ?, notes = ?, score = ?, updated_at = datetime('now')
     WHERE lead_id = ?`
  ).bind(updates.status, updates.assigned_to, updates.notes, updates.score, leadId).run();

  await logEvent(env.DB, {
    type: 'lead.updated',
    entityType: 'lead',
    entityId: leadId,
    payload: updates,
  });

  return json({ success: true, lead_id: leadId, ...updates });
}

/**
 * Increment daily lead stats
 */
async function updateDailyLeadStats(db, score) {
  const today = new Date().toISOString().split('T')[0];
  // Use a running average approach
  await db.prepare(
    `INSERT INTO daily_stats (stat_date, lead_count, lead_avg_score)
     VALUES (?, 1, ?)
     ON CONFLICT(stat_date) DO UPDATE SET
       lead_count = lead_count + 1,
       lead_avg_score = (lead_avg_score * lead_count + ?) / (lead_count + 1)`
  ).bind(today, score, score).run();
}
