// ═══════════════════════════════════════════════════════
// Slack Notification Module — HIRECAR, LLC
// Channel routing:
//   #hirecar        → ops alerts, payments, errors, SLA
//   🔒 sales-talk   → hot leads (score ≥ 70), payments
//   #homebase       → daily digest summary
// ═══════════════════════════════════════════════════════

/**
 * Post a message to a Slack webhook URL
 */
async function postToSlack(webhookUrl, text) {
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured, skipping notification');
    return false;
  }
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    console.error(`Slack post failed: ${res.status} ${await res.text()}`);
  }
  return res.ok;
}

/**
 * New Lead notification
 * → #hirecar (all leads)
 * → 🔒 sales-talk (hot leads only, score ≥ 70)
 */
export async function notifyNewLead(env, lead) {
  const emoji = lead.score >= 70 ? ':fire:' : lead.score >= 40 ? ':clipboard:' : ':memo:';
  const priority = lead.score >= 70 ? 'HOT' : lead.score >= 40 ? 'WARM' : 'LOGGED';

  const msg = [
    `${emoji} *NEW LEAD — ${priority}*`,
    '━━━━━━━━━━━━━━━━━━',
    `*Name:* ${lead.name}`,
    `*Email:* ${lead.email}`,
    `*Phone:* ${lead.phone || 'N/A'}`,
    `*Score:* ${lead.score}/100`,
    `*Source:* ${lead.source || 'unknown'}`,
    `*Goals:* ${lead.goals || 'N/A'}`,
    lead.is_returning ? ':repeat: _Returning lead — previously seen_' : '',
    '━━━━━━━━━━━━━━━━━━',
    `_Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].filter(Boolean).join('\n');

  // All leads → #hirecar
  await postToSlack(env.SLACK_HIRECAR_WEBHOOK_URL, msg);

  // Hot leads also → 🔒 sales-talk
  if (lead.score >= 70) {
    await postToSlack(env.SLACK_SALES_WEBHOOK_URL, msg);
  }
}

/**
 * Payment Received notification
 * → #hirecar + 🔒 sales-talk
 */
export async function notifyPayment(env, payment) {
  const msg = [
    ':moneybag: *PAYMENT RECEIVED*',
    '━━━━━━━━━━━━━━━━━━',
    `*Amount:* $${payment.amount.toFixed(2)}`,
    `*Email:* ${payment.member_email}`,
    `*Method:* ${payment.method}`,
    `*Reference:* \`${payment.provider_ref}\``,
    '━━━━━━━━━━━━━━━━━━',
    `_Processed ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].join('\n');

  await postToSlack(env.SLACK_HIRECAR_WEBHOOK_URL, msg);
  await postToSlack(env.SLACK_SALES_WEBHOOK_URL, msg);
}

/**
 * Service Activated notification
 * → #hirecar
 */
export async function notifyServiceActivated(env, member) {
  const tierEmoji = {
    'standard': ':car:',
    'operator': ':blue_car:',
    'first-class': ':racing_car:',
    'elite': ':trophy:',
  };

  const msg = [
    `${tierEmoji[member.tier] || ':rocket:'} *SERVICE ACTIVATED*`,
    '━━━━━━━━━━━━━━━━━━',
    `*Member:* ${member.name}`,
    `*ID:* \`${member.member_id}\``,
    `*Tier:* ${member.tier.toUpperCase()}`,
    `*Phase:* ${member.phase}`,
    `*Pass ID:* ${member.pass_id || 'pending'}`,
    '━━━━━━━━━━━━━━━━━━',
    `_Activated ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].join('\n');

  await postToSlack(env.SLACK_HIRECAR_WEBHOOK_URL, msg);
}

/**
 * SLA Warning notification
 * → #hirecar
 */
export async function notifySlaWarning(env, { task_name, deadline, owner, action }) {
  const msg = [
    ':warning: *SLA RISK*',
    '━━━━━━━━━━━━━━━━━━',
    `*Task:* ${task_name}`,
    `*Deadline:* ${deadline}`,
    `*Owner:* ${owner}`,
    `*Action Required:* ${action}`,
    '━━━━━━━━━━━━━━━━━━',
    `_Alert ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].join('\n');

  await postToSlack(env.SLACK_HIRECAR_WEBHOOK_URL, msg);
}

/**
 * Daily Digest notification
 * → #homebase (your starred hub)
 */
export async function notifyDailyDigest(env, stats) {
  const revenue = (stats.payments?.total_today || 0).toFixed(2);
  const hotLeadsList = (stats.leads?.hot_leads || [])
    .map(l => `  • ${l.name} (score: ${l.score}, src: ${l.source})`)
    .join('\n');

  const msg = [
    `:bar_chart: *HIRECAR DAILY DIGEST — ${stats.date}*`,
    '━━━━━━━━━━━━━━━━━━',
    '',
    '*:busts_in_silhouette: LEADS*',
    `  New today: *${stats.leads?.new_today || 0}*`,
    `  Avg score: *${stats.leads?.avg_score || 0}*/100`,
    `  Pending (uncontacted): *${stats.leads?.pending_total || 0}*`,
    hotLeadsList ? `  :fire: *Hot leads:*\n${hotLeadsList}` : '',
    '',
    '*:moneybag: PAYMENTS*',
    `  Transactions: *${stats.payments?.count_today || 0}*`,
    `  Revenue: *$${revenue}*`,
    '',
    '*:busts_in_silhouette: MEMBERS*',
    `  Active total: *${stats.members?.active_total || 0}*`,
    `  New enrollments today: *${stats.members?.new_today || 0}*`,
    '',
    '*:credit_card: PASSES*',
    `  Issued today: *${stats.passes?.issued_today || 0}*`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    `_Generated ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].filter(Boolean).join('\n');

  // Digest goes to #homebase
  await postToSlack(env.SLACK_HOMEBASE_WEBHOOK_URL, msg);
}

/**
 * Error alert
 * → #hirecar (ops channel)
 */
export async function notifyError(env, { source, error, context }) {
  const msg = [
    ':x: *PIPELINE ERROR*',
    '━━━━━━━━━━━━━━━━━━',
    `*Source:* ${source}`,
    `*Error:* ${error}`,
    `*Context:* ${context || 'N/A'}`,
    '━━━━━━━━━━━━━━━━━━',
    `_${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST_`,
  ].join('\n');

  await postToSlack(env.SLACK_HIRECAR_WEBHOOK_URL, msg);
}
