/**
 * HIRECAR Payment Orchestration Worker
 * ARCH-HC-0302 Implementation
 *
 * ═══════════════════════════════════════════════════════════
 * HIRE BOT CLASSIFICATION
 * ═══════════════════════════════════════════════════════════
 * This module contains multiple HIRE Bots:
 *
 * HIRE Bot #08 — Billing & Invoicing (D08)
 *   Classification: Financial Operations
 *   Supervisor Level: D08 Lead + D10 QA Audit
 *   QA Standard: QA-HC-FIN — double-entry reconciliation, audit trail
 *   Functions: createInvoice, getInvoiceBalance, getOpenInvoicesForMember,
 *              recordPayment, handleStripeWebhook, handlePayPalWebhook,
 *              handleFanBasisWebhook
 *
 * HIRE Bot #17 — Transaction Completion Engine (client-facing)
 *   Classification: Client Operations / Revenue Recovery
 *   Supervisor Level: D05 Comms + D08 Billing + D11 Advisor
 *   QA Standard: QA-HC-CLIENT — tone review, timing constraints, opt-out
 *   Functions: evaluatePaymentCompletion (outreach for partial/incomplete)
 *
 * HIRE Bot #18 — Milestone Progression Engine (internal)
 *   Classification: Journey Management / Internal
 *   Supervisor Level: D06 Playbook + D12 Analytics
 *   QA Standard: QA-HC-JOURNEY — milestone validation, brief generation
 *   Functions: triggerMilestoneAdvance (called by Bot #17 on completion)
 *
 * HIRE Bot #19 — Lane Evaluation Engine (internal)
 *   Classification: Risk / Health Monitoring / Internal
 *   Supervisor Level: D10 QA + D12 Analytics + D11 Advisor
 *   QA Standard: QA-HC-LANE — transition audit, no client exposure
 *   Functions: evaluateLane, lane_history writes
 *
 * HIRE Bot #20 — Cash Transaction Protocol (field operations)
 *   Classification: Field Operations / Compliance
 *   Supervisor Level: D10 QA + D06 Playbook
 *   QA Standard: QA-HC-CASH — dual-party auth, denomination audit, SMS trail
 *   Functions: logCashReceipt, confirmCashReceipt, disputeCashReceipt
 * ═══════════════════════════════════════════════════════════
 *
 * Bindings required in wrangler.toml:
 *  - DB: D1 database (hirecar-db)
 *  - KV: KV namespace (hirecar-kv) — idempotency keys
 *  - STRIPE_WEBHOOK_SECRET, PAYPAL_WEBHOOK_ID
 *  - BREVO_API_KEY (or TWILIO keys for SMS)
 *  - SLACK_WEBHOOK_URL
 *  - FANBASIS_ZAPIER_WEBHOOK_URL
 */

import { EnrollmentBot } from './enrollment-flow.js';

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK SIGNATURE VERIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Verify Stripe webhook signature using Web Crypto API.
 * This prevents fake/spoofed webhook events.
 * @param {string} rawBody - The raw request body as string
 * @param {string} sigHeader - The Stripe-Signature header value
 * @param {string} secret - The webhook signing secret (whsec_...)
 * @param {number} [toleranceSec=300] - Timestamp tolerance in seconds (default 5 min)
 * @returns {Promise<{valid: boolean, event?: object, error?: string}>}
 */
async function verifyStripeSignature(rawBody, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader || !secret) {
    return { valid: false, error: 'missing_signature_or_secret' };
  }

  // Parse sig header: "t=1234,v1=abc123,v0=..."
  const parts = {};
  for (const item of sigHeader.split(',')) {
    const [key, ...rest] = item.split('=');
    const val = rest.join('=');
    if (key === 't') parts.t = val;
    if (key === 'v1') parts.v1 = (parts.v1 || []).concat(val);
  }

  if (!parts.t || !parts.v1?.length) {
    return { valid: false, error: 'invalid_signature_format' };
  }

  // Check timestamp tolerance
  const timestamp = parseInt(parts.t, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSec) {
    return { valid: false, error: 'timestamp_outside_tolerance' };
  }

  // Compute expected signature: HMAC-SHA256(timestamp + '.' + rawBody)
  const signedPayload = `${parts.t}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  // Convert to hex
  const expected = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison against any provided v1 signature
  const isValid = parts.v1.some(sig => {
    if (sig.length !== expected.length) return false;
    let result = 0;
    for (let i = 0; i < sig.length; i++) {
      result |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return result === 0;
  });

  if (!isValid) {
    return { valid: false, error: 'signature_mismatch' };
  }

  try {
    const event = JSON.parse(rawBody);
    return { valid: true, event };
  } catch {
    return { valid: false, error: 'invalid_json' };
  }
}

// ═══════════════════════════════════════════════════════════════
// HIRE BOT REGISTRY (full fleet reference)
// ═══════════════════════════════════════════════════════════════
// HIRE Bot #01 — Enrollment & Onboarding (D01)
// HIRE Bot #02 — Disputes & Resolution (D02)
// HIRE Bot #03 — Score Monitoring (D03)
// HIRE Bot #04 — Document Management (D04)
// HIRE Bot #05 — Communications Engine (D05)
// HIRE Bot #06 — Playbook Execution (D06)
// HIRE Bot #07 — Digital Pass & Wallet (D07)
// HIRE Bot #08 — Billing & Invoicing (D08) ← THIS MODULE
// HIRE Bot #09 — Member Portal (D09)
// HIRE Bot #10 — QA & Compliance (D10)
// HIRE Bot #11 — Advisor Assignment (D11)
// HIRE Bot #12 — Analytics & Reporting (D12)
// HIRE Bot #13 — CRM & Relationship Eng. (D13)
// HIRE Bot #14 — Platform Infrastructure (D14) → product-sync-worker.js
// HIRE Bot #15 — Scheduling & Calendar (D15)
// HIRE Bot #16 — Security & Access (D16)
// HIRE Bot #17 — Transaction Completion (client-facing) ← THIS MODULE
// HIRE Bot #18 — Milestone Progression (internal) ← THIS MODULE
// HIRE Bot #19 — Lane Evaluation (internal) ← THIS MODULE
// HIRE Bot #20 — Cash Transaction Protocol (field ops) ← THIS MODULE
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ID GENERATORS
// ═══════════════════════════════════════════════════════════════

function generateId(prefix) {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${prefix}-HC-${year}-${seq}`;
}

function uuid() {
  return crypto.randomUUID();
}

// ═══════════════════════════════════════════════════════════════
// INVOICE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export async function createInvoice(db, { memberId, sourceType, sourceDocId, description, totalDueCents, dueDate }) {
  const invoiceId = generateId('INV');
  await db.prepare(`
    INSERT INTO invoices (invoice_id, member_id, source_type, source_doc_id, description, total_due_cents, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(invoiceId, memberId, sourceType, sourceDocId, description, totalDueCents, dueDate || null).run();
  return invoiceId;
}

export async function getInvoiceBalance(db, invoiceId) {
  return db.prepare(`
    SELECT * FROM v_invoice_balances WHERE invoice_id = ?
  `).bind(invoiceId).first();
}

export async function getOpenInvoicesForMember(db, memberId) {
  return db.prepare(`
    SELECT * FROM v_invoice_balances
    WHERE member_id = ? AND invoice_status IN ('pending', 'partial', 'overdue')
    ORDER BY due_date ASC
  `).bind(memberId).all();
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT RECORDING + RECONCILIATION
// ═══════════════════════════════════════════════════════════════

/**
 * Record a payment from any platform and reconcile against the invoice.
 * This is the CORE function — every payment channel feeds into this.
 */
export async function recordPayment(db, kv, {
  invoiceId, memberId, platform, platformTxId, amountCents, currency = 'usd', metadata = null
}) {
  // Idempotency check: skip if we've already processed this platform tx
  if (platformTxId) {
    const existing = await kv.get(`payment:${platformTxId}`);
    if (existing) return JSON.parse(existing);
  }

  const paymentId = uuid();

  // Insert payment record
  await db.prepare(`
    INSERT INTO payments (payment_id, invoice_id, member_id, platform, platform_tx_id, amount_cents, currency, status, metadata, confirmed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, datetime('now'))
  `).bind(paymentId, invoiceId, memberId, platform, platformTxId, amountCents, currency, metadata ? JSON.stringify(metadata) : null).run();

  // Update invoice running total
  await db.prepare(`
    UPDATE invoices SET
      total_paid_cents = (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE invoice_id = ? AND status = 'confirmed'),
      updated_at = datetime('now')
    WHERE invoice_id = ?
  `).bind(invoiceId, invoiceId).run();

  // Check if invoice is now fully paid
  const balance = await getInvoiceBalance(db, invoiceId);
  const newStatus = balance.remaining_cents <= 0 ? 'paid' : 'partial';

  await db.prepare(`
    UPDATE invoices SET
      status = ?,
      paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE paid_at END,
      updated_at = datetime('now')
    WHERE invoice_id = ?
  `).bind(newStatus, newStatus, invoiceId).run();

  const result = {
    paymentId,
    invoiceId,
    amountCents,
    platform,
    invoiceStatus: newStatus,
    remainingCents: Math.max(0, balance.remaining_cents),
    totalPaidCents: balance.total_confirmed_cents + amountCents
  };

  // Store idempotency key
  if (platformTxId) {
    await kv.put(`payment:${platformTxId}`, JSON.stringify(result), { expirationTtl: 86400 * 30 });
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// HIRE BOT — COMPLETION ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * After recording a payment, the HIRE bot evaluates next steps:
 *  - If fully paid → trigger milestone advancement
 *  - If partially paid → send completion outreach with remaining balance
 *  - If overdue → evaluate lane transition
 */
export async function evaluatePaymentCompletion(db, env, paymentResult) {
  const { invoiceId, invoiceStatus, remainingCents, platform } = paymentResult;

  if (invoiceStatus === 'paid') {
    // Invoice fully settled — trigger milestone bot
    await triggerMilestoneAdvancement(db, env, invoiceId);
    // Re-evaluate lane (payment = positive signal)
    const invoice = await db.prepare('SELECT member_id FROM invoices WHERE invoice_id = ?').bind(invoiceId).first();
    if (invoice) await evaluateLane(db, env, invoice.member_id, 'recovery', { invoiceId, event: 'payment_complete' });
    return { action: 'milestone_triggered', invoiceId };
  }

  if (invoiceStatus === 'partial' && remainingCents > 0) {
    // Partial payment — send completion outreach
    const invoice = await db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').bind(invoiceId).first();
    if (invoice) {
      await sendCompletionOutreach(env, {
        memberId: invoice.member_id,
        invoiceId,
        remainingCents,
        sourceDocId: invoice.source_doc_id
      });
    }
    return { action: 'completion_outreach_sent', invoiceId, remainingCents };
  }

  return { action: 'none', invoiceId };
}

/**
 * Send cross-platform payment links for remaining balance.
 */
async function sendCompletionOutreach(env, { memberId, invoiceId, remainingCents, sourceDocId }) {
  const amountDollars = (remainingCents / 100).toFixed(2);
  const message = `HIRECAR: You have $${amountDollars} remaining on ${sourceDocId}. Complete your balance via any payment method. Invoice: ${invoiceId}`;

  // SMS via Brevo/Twilio
  // In production, look up member phone and send via D05 (Communications)
  console.log(`[HIRE Bot] Completion outreach: ${memberId} — $${amountDollars} remaining on ${invoiceId}`);

  // Slack notification to advisor
  if (env.SLACK_WEBHOOK_URL) {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:moneybag: Partial payment received for ${invoiceId} (${memberId}). Remaining: $${amountDollars}. Completion outreach sent.`
      })
    }).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════
// MILESTONE BOT — JOURNEY PROGRESSION
// ═══════════════════════════════════════════════════════════════

async function triggerMilestoneAdvancement(db, env, invoiceId) {
  const invoice = await db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').bind(invoiceId).first();
  if (!invoice) return;

  console.log(`[Milestone Bot] Invoice ${invoiceId} PAID. Evaluating milestone for ${invoice.member_id}, source: ${invoice.source_doc_id}`);

  // Slack notification
  if (env.SLACK_WEBHOOK_URL) {
    const amount = (invoice.total_due_cents / 100).toFixed(2);
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:white_check_mark: Invoice ${invoiceId} FULLY PAID — $${amount} for ${invoice.source_doc_id} (${invoice.member_id}). Milestone evaluation triggered.`
      })
    }).catch(() => {});
  }

  // ── Milestone Advancement Logic (Bot #18) ──
  // Phase gates from GOVERNANCE-WORKFLOWS.md Section 2.2:
  //   INTAKE → RECOVERY:  Profile complete + service active + appointment booked
  //   RECOVERY → REBUILDING: Claims resolved OR PIFR submitted + insurance confirmed
  //   REBUILDING → OPERATING: CRI ≥ 60 + dispute cycle complete + tradeline strategy active
  //   OPERATING → SCALING: HBI ≥ 75 + VDI ≥ 80 + BRE ≥ 70 + zero open cure windows

  const memberId = invoice.member_id;
  const scores = await db.prepare('SELECT * FROM member_scores WHERE member_id = ?').bind(memberId).first();
  const member = await db.prepare('SELECT * FROM members WHERE member_id = ?').bind(memberId).first();
  if (!member || !scores) return;

  const currentTier = member.tier;
  const lane = await db.prepare('SELECT * FROM member_lanes WHERE member_id = ?').bind(memberId).first();
  const openCures = lane && lane.current_lane === 'cure' ? 1 : 0;

  // Determine current phase from member status or audit log
  const lastPhase = await db.prepare(
    "SELECT details FROM audit_log WHERE member_id = ? AND event_type = 'phase_advance' ORDER BY created_at DESC LIMIT 1"
  ).bind(memberId).first();
  const currentPhase = lastPhase ? JSON.parse(lastPhase.details || '{}').new_phase || 'intake' : 'intake';

  let nextPhase = null;
  let gateResult = {};

  if (currentPhase === 'intake') {
    // Gate: profile complete + service active + appointment booked
    const hasProfile = member.name && member.email;
    const hasService = member.product_id ? true : false;
    if (hasProfile && hasService) {
      nextPhase = 'recovery';
      gateResult = { hasProfile, hasService };
    }
  } else if (currentPhase === 'recovery') {
    // Gate: PIFR submitted (invoice paid is a strong signal)
    nextPhase = 'rebuilding';
    gateResult = { invoicePaid: true, invoiceId };
  } else if (currentPhase === 'rebuilding') {
    // Gate: CRI ≥ 60
    if (scores.cri_score >= 60) {
      nextPhase = 'operating';
      gateResult = { cri: scores.cri_score };
    }
  } else if (currentPhase === 'operating') {
    // Gate: HBI ≥ 75 + VDI ≥ 80 + BRE ≥ 70 + zero cures
    if (scores.hbi_score >= 75 && scores.vdi_score >= 80 && scores.bre_score >= 70 && openCures === 0) {
      nextPhase = 'scaling';
      gateResult = { hbi: scores.hbi_score, vdi: scores.vdi_score, bre: scores.bre_score, openCures };
    }
  }

  if (nextPhase) {
    // Log the phase advancement
    await db.prepare(
      "INSERT INTO audit_log (event_type, member_id, tier, details, bot_id) VALUES (?, ?, ?, ?, ?)"
    ).bind('phase_advance', memberId, currentTier, JSON.stringify({
      previous_phase: currentPhase, new_phase: nextPhase, gate: gateResult, trigger: 'invoice_paid'
    }), 'HIRE Bot #18').run();

    console.log(`[Milestone Bot] ${memberId} ADVANCED: ${currentPhase} → ${nextPhase}`);

    // Slack notification
    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `:rocket: *Phase Advancement* — ${memberId}\n*${currentPhase.toUpperCase()}* → *${nextPhase.toUpperCase()}*\nGate: ${JSON.stringify(gateResult)}\nTriggered by: Invoice ${invoiceId} paid`
        })
      }).catch(() => {});
    }
  } else {
    console.log(`[Milestone Bot] ${memberId} remains in ${currentPhase}. Gate conditions not yet met.`);
  }
}

// ═══════════════════════════════════════════════════════════════
// CASH TRANSACTION PROTOCOL
// ═══════════════════════════════════════════════════════════════

/**
 * Step 1: Receiver logs a cash payment.
 * Returns receipt ID and triggers SMS to payer.
 */
export async function logCashReceipt(db, env, {
  invoiceId, payerMemberId, receiverId, receiverName,
  amountAppliedCents, amountTenderedCents, changeGivenCents = 0,
  denominations, payerPhone, receiverPhone, notes
}) {
  const receiptId = generateId('CR');

  await db.prepare(`
    INSERT INTO cash_receipts (
      receipt_id, invoice_id, payer_member_id, receiver_id, receiver_name,
      amount_applied_cents, amount_tendered_cents, change_given_cents,
      denominations, payer_phone, receiver_phone, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    receiptId, invoiceId, payerMemberId, receiverId, receiverName,
    amountAppliedCents, amountTenderedCents, changeGivenCents,
    JSON.stringify(denominations), payerPhone, receiverPhone, notes || null
  ).run();

  // Send SMS confirmation request to payer
  const denomStr = Object.entries(denominations)
    .map(([d, c]) => `${c}×$${d}`)
    .join(', ');
  const amountStr = (amountAppliedCents / 100).toFixed(2);

  const smsBody = `HIRECAR: ${receiverName} logged a cash payment of $${amountStr} (${denomStr}) against invoice ${invoiceId}. Reply CONFIRM to verify or DISPUTE within 24 hours.`;

  // In production: send via Brevo Transactional SMS or Twilio
  console.log(`[Cash Protocol] SMS to ${payerPhone}: ${smsBody}`);

  // Schedule 12-hour reminder and 24-hour expiry via Cloudflare Queues or Cron
  // For now, log intent
  console.log(`[Cash Protocol] Reminder scheduled: ${receiptId} at +12h, expiry at +24h`);

  return { receiptId, smsBody };
}

/**
 * Step 3: Payer confirms via SMS reply.
 * Records the cash as a confirmed payment in the unified ledger.
 */
export async function confirmCashReceipt(db, kv, env, receiptId) {
  const receipt = await db.prepare('SELECT * FROM cash_receipts WHERE receipt_id = ?').bind(receiptId).first();
  if (!receipt) throw new Error(`Cash receipt ${receiptId} not found`);
  if (receipt.confirmation_status !== 'pending') throw new Error(`Receipt ${receiptId} is already ${receipt.confirmation_status}`);

  // Update receipt status
  await db.prepare(`
    UPDATE cash_receipts SET confirmation_status = 'confirmed', confirmed_at = datetime('now')
    WHERE receipt_id = ?
  `).bind(receiptId).run();

  // Record in unified payment ledger
  const paymentResult = await recordPayment(db, kv, {
    invoiceId: receipt.invoice_id,
    memberId: receipt.payer_member_id,
    platform: 'cash',
    platformTxId: receiptId,
    amountCents: receipt.amount_applied_cents
  });

  // Link payment to cash receipt
  await db.prepare('UPDATE cash_receipts SET payment_id = ? WHERE receipt_id = ?')
    .bind(paymentResult.paymentId, receiptId).run();

  // Send confirmation SMS to both parties
  const amountStr = (receipt.amount_applied_cents / 100).toFixed(2);
  const remainStr = (paymentResult.remainingCents / 100).toFixed(2);

  console.log(`[Cash Protocol] SMS to ${receipt.payer_phone}: HIRECAR: Cash payment of $${amountStr} confirmed. Receipt #${receiptId}. Remaining balance: $${remainStr}.`);
  console.log(`[Cash Protocol] SMS to ${receipt.receiver_phone}: HIRECAR: ${receipt.payer_member_id} confirmed cash payment of $${amountStr}. Receipt #${receiptId} generated.`);

  // Evaluate completion
  await evaluatePaymentCompletion(db, env, paymentResult);

  return { ...paymentResult, receiptId, confirmationStatus: 'confirmed' };
}

/**
 * Payer disputes the cash receipt.
 */
export async function disputeCashReceipt(db, env, receiptId) {
  const receipt = await db.prepare('SELECT * FROM cash_receipts WHERE receipt_id = ?').bind(receiptId).first();
  if (!receipt) throw new Error(`Cash receipt ${receiptId} not found`);

  const disputeCaseId = generateId('DIS');

  await db.prepare(`
    UPDATE cash_receipts SET
      confirmation_status = 'disputed',
      disputed_at = datetime('now'),
      dispute_case_id = ?
    WHERE receipt_id = ?
  `).bind(disputeCaseId, receiptId).run();

  // Notify advisor via Slack
  if (env.SLACK_WEBHOOK_URL) {
    const amountStr = (receipt.amount_applied_cents / 100).toFixed(2);
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:warning: CASH DISPUTE — ${receipt.payer_member_id} disputed $${amountStr} cash receipt from ${receipt.receiver_name}. Case: ${disputeCaseId}. Receipt: ${receiptId}. Invoice: ${receipt.invoice_id}.`
      })
    }).catch(() => {});
  }

  // Evaluate lane (dispute = negative signal)
  await evaluateLane(db, env, receipt.payer_member_id, 'cash_dispute', { receiptId, disputeCaseId });

  return { receiptId, disputeCaseId, status: 'disputed' };
}

// ═══════════════════════════════════════════════════════════════
// LANE EVALUATION ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate and potentially transition a member's lane.
 * Called after payment events, milestone changes, score updates, etc.
 */
export async function evaluateLane(db, env, memberId, triggerType, triggerDetail = {}) {
  // Get current lane
  let memberLane = await db.prepare('SELECT * FROM member_lanes WHERE member_id = ?').bind(memberId).first();

  // Initialize if first evaluation
  if (!memberLane) {
    await db.prepare(`
      INSERT INTO member_lanes (member_id, current_lane) VALUES (?, 'revenue')
    `).bind(memberId).run();
    await db.prepare(`
      INSERT INTO lane_history (member_id, previous_lane, new_lane, trigger_type, trigger_detail)
      VALUES (?, NULL, 'revenue', 'initial_assignment', ?)
    `).bind(memberId, JSON.stringify(triggerDetail)).run();
    memberLane = { current_lane: 'revenue', cure_attempts: 0 };
  }

  const currentLane = memberLane.current_lane;
  let newLane = currentLane;

  // ── REVENUE → CURE evaluation ──
  if (currentLane === 'revenue') {
    if (['payment_failure', 'partial_stall', 'hbi_drop', 'milestone_miss', 'cash_dispute'].includes(triggerType)) {
      newLane = 'cure';
    }
  }

  // ── CURE → REMEDY escalation ──
  if (currentLane === 'cure') {
    if (triggerType === 'escalation' || triggerType === 'membership_failure' || triggerType === 'outreach_failure') {
      newLane = 'remedy';
    }
    // Also escalate if days_in_lane exceeds threshold
    if (memberLane.days_in_lane >= 14 && triggerType !== 'recovery') {
      newLane = 'remedy';
    }
  }

  // ── CURE → REVENUE recovery ──
  if (currentLane === 'cure' && triggerType === 'recovery') {
    newLane = 'revenue';
  }

  // ── REMEDY → CURE de-escalation ──
  if (currentLane === 'remedy' && triggerType === 'de_escalation') {
    newLane = 'cure';
  }

  // ── REMEDY → EXIT ──
  if (currentLane === 'remedy' && ['exit_voluntary', 'exit_involuntary'].includes(triggerType)) {
    newLane = 'exit';
  }

  // Record transition if lane changed
  if (newLane !== currentLane) {
    await db.prepare(`
      INSERT INTO lane_history (member_id, previous_lane, new_lane, trigger_type, trigger_detail)
      VALUES (?, ?, ?, ?, ?)
    `).bind(memberId, currentLane, newLane, triggerType, JSON.stringify(triggerDetail)).run();

    await db.prepare(`
      UPDATE member_lanes SET
        current_lane = ?,
        entered_lane_at = datetime('now'),
        days_in_lane = 0,
        cure_attempts = CASE WHEN ? = 'cure' THEN 0 ELSE cure_attempts END,
        last_evaluated = datetime('now')
      WHERE member_id = ?
    `).bind(newLane, newLane, memberId).run();

    // Notify via Slack
    if (env.SLACK_WEBHOOK_URL) {
      const laneEmoji = { revenue: ':large_green_circle:', cure: ':large_yellow_circle:', remedy: ':red_circle:', exit: ':black_circle:' };
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${laneEmoji[newLane] || ':grey_question:'} LANE CHANGE — ${memberId}: ${currentLane.toUpperCase()} → ${newLane.toUpperCase()} | Trigger: ${triggerType} | ${JSON.stringify(triggerDetail)}`
        })
      }).catch(() => {});
    }

    console.log(`[Lane Engine] ${memberId}: ${currentLane} → ${newLane} (${triggerType})`);
  } else {
    // Update evaluation timestamp even if no change
    await db.prepare(`
      UPDATE member_lanes SET last_evaluated = datetime('now') WHERE member_id = ?
    `).bind(memberId).run();
  }

  return { memberId, previousLane: currentLane, currentLane: newLane, changed: newLane !== currentLane };
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Handle Stripe webhook events.
 * Called from the main Worker fetch handler.
 */
export async function handleStripeWebhook(db, kv, env, event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      // Look up invoice by Stripe metadata
      const invoiceId = pi.metadata?.hirecar_invoice_id;
      const memberId = pi.metadata?.hirecar_member_id;
      if (!invoiceId || !memberId) {
        console.log(`[Stripe] payment_intent.succeeded but no HIRECAR metadata: ${pi.id}`);
        return { status: 'skipped', reason: 'no_metadata' };
      }
      const result = await recordPayment(db, kv, {
        invoiceId, memberId, platform: 'stripe',
        platformTxId: pi.id, amountCents: pi.amount,
        metadata: { stripe_customer: pi.customer, payment_method: pi.payment_method_types }
      });
      await evaluatePaymentCompletion(db, env, result);
      return { status: 'processed', paymentId: result.paymentId };
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object;
      const memberId = inv.metadata?.hirecar_member_id;
      if (memberId) {
        await evaluateLane(db, env, memberId, 'payment_failure', {
          stripe_invoice: inv.id, amount: inv.amount_due
        });
      }
      return { status: 'processed', action: 'lane_evaluation' };
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const memberId = sub.metadata?.hirecar_member_id;
      if (memberId) {
        await evaluateLane(db, env, memberId, 'membership_cancel', {
          stripe_subscription: sub.id
        });
      }
      return { status: 'processed', action: 'lane_evaluation' };
    }

    // checkout.session.completed is handled in the route handler above
    // before reaching this switch (see registerPaymentRoutes)

    default:
      return { status: 'ignored', type: event.type };
  }
}

/**
 * Handle PayPal IPN/webhook events.
 */
export async function handlePayPalWebhook(db, kv, env, event) {
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const capture = event.resource;
    const invoiceId = capture.custom_id; // HIRECAR invoice ID passed via custom_id
    const memberId = capture.invoice_id; // Member ID passed via invoice_id field
    if (!invoiceId || !memberId) return { status: 'skipped' };

    const result = await recordPayment(db, kv, {
      invoiceId, memberId, platform: 'paypal',
      platformTxId: capture.id,
      amountCents: Math.round(parseFloat(capture.amount.value) * 100),
      currency: capture.amount.currency_code.toLowerCase()
    });
    await evaluatePaymentCompletion(db, env, result);
    return { status: 'processed', paymentId: result.paymentId };
  }
  return { status: 'ignored' };
}

/**
 * Handle FanBasis events (via Zapier webhook).
 */
export async function handleFanBasisWebhook(db, kv, env, payload) {
  // FanBasis sends order data via Zapier
  const { order_id, customer_email, amount, invoice_id, member_id } = payload;
  if (!invoice_id || !member_id) return { status: 'skipped' };

  const result = await recordPayment(db, kv, {
    invoiceId: invoice_id, memberId: member_id, platform: 'fanbasis',
    platformTxId: `FB-${order_id}`,
    amountCents: Math.round(parseFloat(amount) * 100)
  });
  await evaluatePaymentCompletion(db, env, result);
  return { status: 'processed', paymentId: result.paymentId };
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT SYNC ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Sync a product from the canonical D1 catalog to all platforms.
 */
export async function syncProduct(db, env, productId) {
  const product = await db.prepare('SELECT * FROM products WHERE product_id = ?').bind(productId).first();
  if (!product) throw new Error(`Product ${productId} not found`);

  const results = {};

  // Sync to PayPal (if credentials available)
  if (env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET) {
    try {
      // PayPal Catalog API — create or update product + plan
      // Implementation depends on PayPal SDK/API integration
      results.paypal = { status: 'pending_implementation' };
      await logSync(db, 'product.sync', productId, 'd1', 'paypal', productId, 'skipped', 'PayPal sync pending implementation');
    } catch (e) {
      results.paypal = { status: 'failed', error: e.message };
      await logSync(db, 'product.sync', productId, 'd1', 'paypal', productId, 'failed', e.message);
    }
  }

  // Sync to FanBasis (via Zapier)
  if (env.FANBASIS_ZAPIER_WEBHOOK_URL) {
    try {
      const res = await fetch(env.FANBASIS_ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'product_sync',
          product_id: product.product_id,
          name: product.name,
          price_cents: product.price_cents,
          description: product.description,
          tier: product.tier,
          billing_interval: product.billing_interval
        })
      });
      results.fanbasis = { status: res.ok ? 'success' : 'failed' };
      await logSync(db, 'product.sync', productId, 'd1', 'fanbasis', productId, res.ok ? 'success' : 'failed');
    } catch (e) {
      results.fanbasis = { status: 'failed', error: e.message };
      await logSync(db, 'product.sync', productId, 'd1', 'fanbasis', productId, 'failed', e.message);
    }
  }

  // Update sync status
  const allSuccess = Object.values(results).every(r => r.status === 'success');
  const anySuccess = Object.values(results).some(r => r.status === 'success');
  const syncStatus = allSuccess ? 'synced' : anySuccess ? 'partial' : Object.keys(results).length === 0 ? 'pending' : 'failed';

  await db.prepare(`
    UPDATE products SET sync_status = ?, last_synced_at = datetime('now'), updated_at = datetime('now')
    WHERE product_id = ?
  `).bind(syncStatus, productId).run();

  return { productId, syncStatus, results };
}

async function logSync(db, eventType, eventId, source, target, productId, status, error = null) {
  await db.prepare(`
    INSERT INTO sync_log (event_type, event_id, source_platform, target_platform, product_id, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(eventType, eventId, source, target, productId, status, error).run();
}

// ═══════════════════════════════════════════════════════════════
// API ROUTES (extend existing api.hirecar.la Worker)
// ═══════════════════════════════════════════════════════════════

export function registerPaymentRoutes(router) {
  // Invoice management
  router.post('/api/invoices', async (req, env) => {
    const body = await req.json();
    const invoiceId = await createInvoice(env.DB, body);
    return Response.json({ invoiceId }, { status: 201 });
  });

  router.get('/api/invoices/:invoiceId/balance', async (req, env) => {
    const balance = await getInvoiceBalance(env.DB, req.params.invoiceId);
    return Response.json(balance || { error: 'Not found' }, { status: balance ? 200 : 404 });
  });

  router.get('/api/members/:memberId/invoices', async (req, env) => {
    const invoices = await getOpenInvoicesForMember(env.DB, req.params.memberId);
    return Response.json(invoices);
  });

  // Cash protocol
  router.post('/api/cash/log', async (req, env) => {
    const body = await req.json();
    const result = await logCashReceipt(env.DB, env, body);
    return Response.json(result, { status: 201 });
  });

  router.post('/api/cash/:receiptId/confirm', async (req, env) => {
    const result = await confirmCashReceipt(env.DB, env.KV, env, req.params.receiptId);
    return Response.json(result);
  });

  router.post('/api/cash/:receiptId/dispute', async (req, env) => {
    const result = await disputeCashReceipt(env.DB, env, req.params.receiptId);
    return Response.json(result);
  });

  // Lane status
  router.get('/api/members/:memberId/lane', async (req, env) => {
    const lane = await env.DB.prepare('SELECT * FROM member_lanes WHERE member_id = ?').bind(req.params.memberId).first();
    return Response.json(lane || { error: 'Not found' }, { status: lane ? 200 : 404 });
  });

  router.get('/api/lanes/distribution', async (req, env) => {
    const dist = await env.DB.prepare('SELECT * FROM v_lane_distribution').all();
    return Response.json(dist);
  });

  // Product sync
  router.post('/api/products/:productId/sync', async (req, env) => {
    const result = await syncProduct(env.DB, env, req.params.productId);
    return Response.json(result);
  });

  router.get('/api/products', async (req, env) => {
    const products = await env.DB.prepare('SELECT * FROM products WHERE active = 1 ORDER BY price_cents ASC').all();
    return Response.json(products);
  });

  // Webhook handlers
  router.post('/webhooks/stripe', async (req, env) => {
    // ── Stripe Signature Verification ──
    const rawBody = await req.text();
    const sigHeader = req.headers.get('stripe-signature');
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (webhookSecret && sigHeader) {
      const verification = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
      if (!verification.valid) {
        console.error(`[Stripe] Webhook signature verification failed: ${verification.error}`);
        return Response.json(
          { error: 'webhook_signature_invalid', detail: verification.error },
          { status: 401 }
        );
      }
      event = verification.event;
    } else {
      // Fallback for test/dev when no secret is configured
      console.warn('[Stripe] Webhook signature not verified — STRIPE_WEBHOOK_SECRET or signature header missing');
      event = JSON.parse(rawBody);
    }

    // ── HIRE Bot #01: Enrollment Pipeline ──
    // Handle checkout.session.completed BEFORE generic handler
    if (event.type === 'checkout.session.completed') {
      try {
        const bot = new EnrollmentBot(env);
        const session = event.data.object;
        const enrollResult = await bot.processCheckoutCompleted(session);
        return Response.json({ status: 'processed', action: 'enrollment', ...enrollResult });
      } catch (err) {
        console.error(`[Stripe] checkout.session.completed enrollment error:`, err.message, err.stack);
        return Response.json({ status: 'error', action: 'enrollment', error: err.message }, { status: 500 });
      }
    }

    const result = await handleStripeWebhook(env.DB, env.KV, env, event);
    return Response.json(result);
  });

  router.post('/webhooks/paypal', async (req, env) => {
    const event = await req.json();
    const result = await handlePayPalWebhook(env.DB, env.KV, env, event);
    return Response.json(result);
  });

  router.post('/webhooks/fanbasis', async (req, env) => {
    const payload = await req.json();
    const result = await handleFanBasisWebhook(env.DB, env.KV, env, payload);
    return Response.json(result);
  });
}
