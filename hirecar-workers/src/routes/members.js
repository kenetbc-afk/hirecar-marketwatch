// ═══════════════════════════════════════════════════════
// Members API — CRUD for HIRECAR members
// ═══════════════════════════════════════════════════════

import { json, generateMemberId, logEvent } from '../lib/helpers.js';
import { notifyServiceActivated } from '../lib/slack.js';

/**
 * GET /api/members
 * List members with optional filters
 */
export async function listMembers(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const tier = url.searchParams.get('tier');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM members WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (tier) {
    query += ' AND tier = ?';
    params.push(tier);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();
  return json({ members: results.results, count: results.results.length });
}

/**
 * GET /api/members/:id
 * Get a single member
 */
export async function getMember(memberId, env) {
  const member = await env.DB.prepare(
    'SELECT * FROM members WHERE member_id = ?'
  ).bind(memberId).first();

  if (!member) {
    return json({ error: 'Member not found' }, 404);
  }

  // Also fetch their payment history
  const payments = await env.DB.prepare(
    'SELECT * FROM payments WHERE member_id = ? OR member_email = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(memberId, member.email).all();

  return json({ ...member, payments: payments.results });
}

/**
 * POST /api/members
 * Enroll a new member
 */
export async function createMember(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!data.name || !data.email) {
    return json({ error: 'Missing required fields: name, email' }, 400);
  }

  // Check for duplicate email
  const existing = await env.DB.prepare(
    'SELECT member_id FROM members WHERE email = ?'
  ).bind(data.email.trim().toLowerCase()).first();

  if (existing) {
    return json({ error: 'Member with this email already exists', member_id: existing.member_id }, 409);
  }

  // Generate next member ID
  const countResult = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM members'
  ).first();
  const memberId = generateMemberId((countResult?.count || 0) + 1);

  const member = {
    member_id: memberId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    tier: data.tier || 'standard',
    phase: 'intake',
    scores: data.scores ? JSON.stringify(data.scores) : null,
    status: 'active',
  };

  await env.DB.prepare(
    `INSERT INTO members (member_id, name, email, phone, tier, phase, scores, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    member.member_id, member.name, member.email, member.phone,
    member.tier, member.phase, member.scores, member.status
  ).run();

  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  await env.DB.prepare(
    `INSERT INTO daily_stats (stat_date, member_count)
     VALUES (?, 1)
     ON CONFLICT(stat_date) DO UPDATE SET member_count = member_count + 1`
  ).bind(today).run();

  await logEvent(env.DB, {
    type: 'member.enrolled',
    entityType: 'member',
    entityId: memberId,
    payload: { tier: member.tier, email: member.email },
  });

  // Convert lead to member if they exist
  await env.DB.prepare(
    `UPDATE leads SET status = 'converted', updated_at = datetime('now')
     WHERE email = ? AND status != 'converted'`
  ).bind(member.email).run();

  // Notify
  await notifyServiceActivated(env, member).catch(() => {});

  return json({ success: true, member_id: memberId, ...member }, 201);
}

/**
 * PUT /api/members/:id
 * Update member details
 */
export async function updateMember(memberId, request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const existing = await env.DB.prepare(
    'SELECT * FROM members WHERE member_id = ?'
  ).bind(memberId).first();

  if (!existing) {
    return json({ error: 'Member not found' }, 404);
  }

  const updates = {
    name: data.name || existing.name,
    phone: data.phone !== undefined ? data.phone : existing.phone,
    tier: data.tier || existing.tier,
    phase: data.phase || existing.phase,
    scores: data.scores ? JSON.stringify(data.scores) : existing.scores,
    pass_id: data.pass_id || existing.pass_id,
    status: data.status || existing.status,
  };

  await env.DB.prepare(
    `UPDATE members SET
      name = ?, phone = ?, tier = ?, phase = ?, scores = ?, pass_id = ?, status = ?,
      updated_at = datetime('now')
     WHERE member_id = ?`
  ).bind(
    updates.name, updates.phone, updates.tier, updates.phase,
    updates.scores, updates.pass_id, updates.status, memberId
  ).run();

  await logEvent(env.DB, {
    type: 'member.updated',
    entityType: 'member',
    entityId: memberId,
    payload: data,
  });

  return json({ success: true, member_id: memberId, ...updates });
}
