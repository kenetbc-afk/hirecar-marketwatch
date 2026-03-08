// ═══════════════════════════════════════════════════════
// Payment Pipeline — Replaces Make.com Scenario 1
// Handles Stripe webhooks + PayPal IPN
// ═══════════════════════════════════════════════════════

import { json, verifyStripeSignature, generateId, logEvent } from '../lib/helpers.js';
import { notifyPayment, notifyError } from '../lib/slack.js';
import { sendPaymentConfirmation, sendErrorAlert } from '../lib/email.js';

/**
 * POST /webhooks/stripe
 * Receives Stripe webhook events
 */
export async function handleStripeWebhook(request, env) {
  const rawBody = await request.text();

  // Verify signature if secret is configured
  if (env.STRIPE_WEBHOOK_SECRET) {
    const sig = request.headers.get('Stripe-Signature');
    const valid = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return json({ error: 'Invalid signature' }, 401);
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Process supported event types
  const handlers = {
    'payment_intent.succeeded': handlePaymentSuccess,
    'invoice.paid': handleInvoicePaid,
    'charge.refunded': handleRefund,
    'customer.subscription.created': handleSubscriptionCreated,
  };

  const handler = handlers[event.type];
  if (!handler) {
    // Acknowledge unhandled events (Stripe expects 200)
    return json({ received: true, handled: false });
  }

  try {
    await handler(event, env);
    return json({ received: true, handled: true });
  } catch (err) {
    console.error(`Stripe handler error: ${err.message}`);
    // Still return 200 to prevent Stripe retries on our logic errors
    await notifyError(env, {
      source: 'Stripe Webhook',
      error: err.message,
      context: `Event: ${event.type}, ID: ${event.id}`,
    }).catch(() => {});
    return json({ received: true, error: err.message }, 200);
  }
}

/**
 * Handle payment_intent.succeeded
 */
async function handlePaymentSuccess(event, env) {
  const obj = event.data.object;
  const payment = {
    payment_id: obj.id,
    member_email: obj.receipt_email || obj.metadata?.email || 'unknown',
    member_id: obj.metadata?.member_id || null,
    amount: obj.amount / 100,
    currency: obj.currency || 'usd',
    method: 'stripe',
    provider_ref: obj.id,
    status: 'completed',
  };

  // Write to D1
  await env.DB.prepare(
    `INSERT OR REPLACE INTO payments (payment_id, member_id, member_email, amount, currency, method, provider_ref, status, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    payment.payment_id, payment.member_id, payment.member_email,
    payment.amount, payment.currency, payment.method,
    payment.provider_ref, payment.status, JSON.stringify(obj.metadata || {})
  ).run();

  // Log event
  await logEvent(env.DB, {
    type: 'payment.received',
    entityType: 'payment',
    entityId: payment.payment_id,
    payload: { amount: payment.amount, method: 'stripe', email: payment.member_email },
  });

  // Update daily stats
  await updateDailyPaymentStats(env.DB, payment.amount);

  // Send notifications (non-blocking)
  await Promise.allSettled([
    notifyPayment(env, payment),
    payment.member_email !== 'unknown'
      ? sendPaymentConfirmation(env, payment)
      : Promise.resolve(),
  ]);
}

/**
 * Handle invoice.paid (subscription payments)
 */
async function handleInvoicePaid(event, env) {
  const invoice = event.data.object;
  const payment = {
    payment_id: `inv-${invoice.id}`,
    member_email: invoice.customer_email || 'unknown',
    member_id: invoice.metadata?.member_id || null,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency || 'usd',
    method: 'stripe',
    provider_ref: invoice.id,
    status: 'completed',
  };

  await env.DB.prepare(
    `INSERT OR REPLACE INTO payments (payment_id, member_id, member_email, amount, currency, method, provider_ref, status, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    payment.payment_id, payment.member_id, payment.member_email,
    payment.amount, payment.currency, payment.method,
    payment.provider_ref, payment.status, JSON.stringify({ invoice_id: invoice.id, subscription_id: invoice.subscription })
  ).run();

  await logEvent(env.DB, {
    type: 'payment.received',
    entityType: 'payment',
    entityId: payment.payment_id,
    payload: { amount: payment.amount, method: 'stripe', type: 'invoice', email: payment.member_email },
  });

  await updateDailyPaymentStats(env.DB, payment.amount);
  await Promise.allSettled([
    notifyPayment(env, payment),
    sendPaymentConfirmation(env, payment),
  ]);
}

/**
 * Handle charge.refunded
 */
async function handleRefund(event, env) {
  const charge = event.data.object;
  const refundAmount = (charge.amount_refunded || charge.amount) / 100;

  await env.DB.prepare(
    `INSERT INTO payments (payment_id, member_email, amount, method, provider_ref, status, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    `ref-${charge.id}`, charge.receipt_email || 'unknown',
    -refundAmount, 'stripe', charge.id, 'refunded',
    JSON.stringify({ original_charge: charge.id })
  ).run();

  await logEvent(env.DB, {
    type: 'payment.refunded',
    entityType: 'payment',
    entityId: charge.id,
    payload: { amount: refundAmount, email: charge.receipt_email },
  });
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(event, env) {
  const sub = event.data.object;
  await logEvent(env.DB, {
    type: 'subscription.created',
    entityType: 'member',
    entityId: sub.metadata?.member_id || sub.customer,
    payload: { subscription_id: sub.id, status: sub.status, plan: sub.items?.data?.[0]?.price?.id },
  });
}

/**
 * POST /webhooks/paypal
 * Receives PayPal IPN notifications
 */
export async function handlePaypalIPN(request, env) {
  const rawBody = await request.text();

  // Step 1: Verify IPN with PayPal
  const verifyRes = await fetch('https://ipnpb.paypal.com/cgi-bin/webscr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `cmd=_notify-validate&${rawBody}`,
  });

  const verifyText = await verifyRes.text();
  if (verifyText.trim() !== 'VERIFIED') {
    console.error('PayPal IPN verification failed');
    return json({ error: 'IPN not verified' }, 400);
  }

  // Step 2: Parse IPN data
  const params = new URLSearchParams(rawBody);
  const paymentStatus = params.get('payment_status');

  if (paymentStatus !== 'Completed') {
    return json({ received: true, status: paymentStatus });
  }

  // Step 3: Verify receiver email matches ours
  const receiverEmail = params.get('receiver_email') || params.get('business');
  if (env.PAYPAL_RECEIVER_EMAIL && receiverEmail !== env.PAYPAL_RECEIVER_EMAIL) {
    console.error(`PayPal receiver mismatch: ${receiverEmail}`);
    return json({ error: 'Receiver mismatch' }, 400);
  }

  const payment = {
    payment_id: `pp-${params.get('txn_id')}`,
    member_email: params.get('payer_email') || 'unknown',
    amount: parseFloat(params.get('mc_gross') || '0'),
    method: 'paypal',
    provider_ref: params.get('txn_id'),
    status: 'completed',
  };

  try {
    // Write to D1
    await env.DB.prepare(
      `INSERT OR REPLACE INTO payments (payment_id, member_email, amount, method, provider_ref, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      payment.payment_id, payment.member_email, payment.amount,
      payment.method, payment.provider_ref, payment.status,
      JSON.stringify({ payer_id: params.get('payer_id'), item_name: params.get('item_name') })
    ).run();

    await logEvent(env.DB, {
      type: 'payment.received',
      entityType: 'payment',
      entityId: payment.payment_id,
      payload: { amount: payment.amount, method: 'paypal', email: payment.member_email },
    });

    await updateDailyPaymentStats(env.DB, payment.amount);
    await Promise.allSettled([
      notifyPayment(env, payment),
      sendPaymentConfirmation(env, payment),
    ]);

    return json({ received: true, handled: true });
  } catch (err) {
    await notifyError(env, { source: 'PayPal IPN', error: err.message }).catch(() => {});
    return json({ received: true, error: err.message }, 200);
  }
}

/**
 * Increment daily payment stats
 */
async function updateDailyPaymentStats(db, amount) {
  const today = new Date().toISOString().split('T')[0];
  await db.prepare(
    `INSERT INTO daily_stats (stat_date, payment_count, payment_total)
     VALUES (?, 1, ?)
     ON CONFLICT(stat_date) DO UPDATE SET
       payment_count = payment_count + 1,
       payment_total = payment_total + ?`
  ).bind(today, amount, amount).run();
}
