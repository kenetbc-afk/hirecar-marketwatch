// ═══════════════════════════════════════════════════════
// Email Module — Brevo (formerly Sendinblue)
// Free tier: 300 emails/day (~9,000/month)
// API docs: https://developers.brevo.com/reference
// ═══════════════════════════════════════════════════════

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send an email via Brevo SMTP API
 * @param {string} apiKey - Brevo API key
 * @param {object} opts - { to, from, fromName, subject, html, text }
 */
async function sendEmail(apiKey, { to, from, fromName, subject, html, text }) {
  const body = {
    sender: { email: from, name: fromName || 'HIRECAR' },
    to: [{ email: to }],
    subject,
  };

  if (html) body.htmlContent = html;
  if (text) body.textContent = text;
  if (!html && !text) body.textContent = subject;

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Brevo error: ${res.status} ${err}`);
    throw new Error(`Brevo ${res.status}: ${err}`);
  }

  return true;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(env, payment) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #111820; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HIRECAR</h1>
        <p style="color: #c9920a; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">AUTO OPERATOR INTELLIGENCE</p>
      </div>
      <div style="padding: 32px 24px; background: #ffffff;">
        <h2 style="color: #111820; margin: 0 0 16px;">Payment Confirmed</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">$${payment.amount.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Method</td><td style="padding: 8px 0; text-align: right;">${payment.method}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 13px;">${payment.provider_ref}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #666; font-size: 14px;">Thank you for your membership. Your access pass and playbook remain active.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">HIRECAR, LLC dba HIRECREDIT &middot; Los Angeles, CA</p>
        <p style="color: #999; font-size: 12px; margin: 4px 0 0;">Questions? Reply to this email or visit hirecar.la/support</p>
      </div>
    </div>
  `;

  return sendEmail(env.BREVO_API_KEY, {
    to: payment.member_email,
    from: 'noreply@hirecar.la',
    fromName: 'HIRECAR',
    subject: `HIRECAR Payment Confirmed — $${payment.amount.toFixed(2)}`,
    html,
  });
}

/**
 * Send high-priority lead follow-up email
 */
export async function sendLeadFollowUp(env, lead) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #111820; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HIRECAR</h1>
        <p style="color: #c9920a; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">AUTO OPERATOR INTELLIGENCE</p>
      </div>
      <div style="padding: 32px 24px; background: #ffffff;">
        <h2 style="color: #111820; margin: 0 0 16px;">Welcome, ${lead.name}</h2>
        <p>Thank you for your interest in HIRECAR. We received your information and a member of our team will reach out shortly.</p>
        <p>Based on what you shared, we believe our <strong>credit repair and operator intelligence</strong> services can help you reach your goals.</p>
        <div style="background: #fef3d0; border-left: 4px solid #c9920a; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-weight: bold;">What happens next?</p>
          <p style="margin: 8px 0 0;">A HIRECAR advisor will contact you within 24 hours to discuss your personalized plan.</p>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">HIRECAR, LLC dba HIRECREDIT &middot; Los Angeles, CA</p>
      </div>
    </div>
  `;

  return sendEmail(env.BREVO_API_KEY, {
    to: lead.email,
    from: 'members@hirecar.la',
    fromName: 'HIRECAR Members',
    subject: 'Welcome to HIRECAR — Next Steps',
    html,
  });
}

/**
 * Send nurture email (lower-score leads)
 */
export async function sendNurtureEmail(env, lead) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #111820; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HIRECAR</h1>
      </div>
      <div style="padding: 32px 24px; background: #ffffff;">
        <h2 style="color: #111820;">Hi ${lead.name},</h2>
        <p>Thanks for reaching out to HIRECAR. We help rideshare and delivery operators build stronger credit and grow their businesses.</p>
        <p>When you are ready to take the next step, visit <a href="https://hirecar.la" style="color: #0f4c75;">hirecar.la</a> or reply to this email.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px;">HIRECAR, LLC &middot; Los Angeles, CA</p>
      </div>
    </div>
  `;

  return sendEmail(env.BREVO_API_KEY, {
    to: lead.email,
    from: 'members@hirecar.la',
    fromName: 'HIRECAR',
    subject: 'HIRECAR — Building Better Credit for Operators',
    html,
  });
}

/**
 * Send error alert to ops
 */
export async function sendErrorAlert(env, { source, error }) {
  return sendEmail(env.BREVO_API_KEY, {
    to: 'ops@hirecar.la',
    from: 'noreply@hirecar.la',
    fromName: 'HIRECAR Alerts',
    subject: `[ALERT] ${source} Error — ${new Date().toISOString()}`,
    text: `Pipeline error in ${source}:\n\n${error}\n\nCheck Cloudflare Workers logs for details.`,
  });
}
