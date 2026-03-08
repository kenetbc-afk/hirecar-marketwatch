// ═══════════════════════════════════════════════════════
// Shared Helpers
// ═══════════════════════════════════════════════════════

/**
 * Generate a UUID-like ID for database records
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Generate HIRECAR member ID format: HC-YYYY-NNNNN
 */
export function generateMemberId(sequenceNum) {
  const year = new Date().getFullYear();
  const seq = String(sequenceNum).padStart(5, '0');
  return `HC-${year}-${seq}`;
}

/**
 * JSON response helper
 */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
    },
  });
}

/**
 * CORS preflight handler
 */
export function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Verify Stripe webhook signature
 * Uses HMAC-SHA256 per Stripe's v1 signature scheme
 */
export async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  const parts = {};
  sigHeader.split(',').forEach(pair => {
    const [key, val] = pair.split('=');
    parts[key] = val;
  });

  const timestamp = parts['t'];
  const signature = parts['v1'];

  if (!timestamp || !signature) return false;

  // Reject if timestamp is > 5 minutes old
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === signature;
}

/**
 * Score a lead based on form data
 * Returns 0–100 score
 */
export function scoreLead(lead) {
  let score = 0;

  // Has vehicle or rideshare mention
  if (lead.goals && /vehicle|car|uber|lyft|rideshare|doordash|instacart/i.test(lead.goals)) {
    score += 20;
  }

  // Goals mention credit repair/building
  if (lead.goals && /credit|repair|build|score|dispute|improve/i.test(lead.goals)) {
    score += 15;
  }

  // Source weighting
  const sourceScores = { referral: 25, partner: 25, website: 15, social: 10, ad: 5 };
  score += sourceScores[lead.source?.toLowerCase()] || 5;

  // Has phone number (higher intent)
  if (lead.phone && lead.phone.replace(/\D/g, '').length >= 10) {
    score += 10;
  }

  // Email quality (not disposable)
  const disposable = /mailinator|guerrilla|tempmail|throwaway|yopmail/i;
  if (lead.email && !disposable.test(lead.email)) {
    score += 10;
  }

  // Goals length indicates engagement
  if (lead.goals && lead.goals.length > 50) {
    score += 10;
  }

  // Has name (basic completeness)
  if (lead.name && lead.name.trim().length > 2) {
    score += 5;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Log an event to the events table
 */
export async function logEvent(db, { type, entityType, entityId, payload }) {
  await db.prepare(
    `INSERT INTO events (event_type, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)`
  ).bind(type, entityType, entityId, JSON.stringify(payload)).run();
}

/**
 * Today's date as YYYY-MM-DD (UTC)
 */
export function todayUTC() {
  return new Date().toISOString().split('T')[0];
}
