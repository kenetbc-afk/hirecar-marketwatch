/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                          HIRE BOT ECOSYSTEM REFERENCE                         ║
 * ║ ─────────────────────────────────────────────────────────────────────────── ║
 * ║  This module is part of HIRECAR's distributed Bot Orchestration System      ║
 * ║  Coordinating all 20 specialized bots across payment orchestration and     ║
 * ║  client lifecycle management. Module: SMS Integration (Bot #17 + #20)       ║
 * ║ ─────────────────────────────────────────────────────────────────────────── ║
 * ║  HIRE Bot #01: Enrollment & Onboarding (D01)                                 ║
 * ║  HIRE Bot #02: Disputes & Resolution (D02)                                  ║
 * ║  HIRE Bot #03: Score Monitoring (D03)                                       ║
 * ║  HIRE Bot #04: Document Management (D04)                                    ║
 * ║  HIRE Bot #05: Communications Engine (D05)                                  ║
 * ║  HIRE Bot #06: Playbook Execution (D06)                                     ║
 * ║  HIRE Bot #07: Digital Pass & Wallet (D07)                                  ║
 * ║  HIRE Bot #08: Billing & Invoicing (D08)                                    ║
 * ║  HIRE Bot #09: Member Portal (D09)                                          ║
 * ║  HIRE Bot #10: QA & Compliance (D10)                                        ║
 * ║  HIRE Bot #11: Advisor Assignment (D11)                                     ║
 * ║  HIRE Bot #12: Analytics & Reporting (D12)                                  ║
 * ║  HIRE Bot #13: CRM & Relationship Eng. (D13)                               ║
 * ║  HIRE Bot #14: Platform Infrastructure (D14)                                ║
 * ║  HIRE Bot #15: Scheduling & Calendar (D15)                                  ║
 * ║  HIRE Bot #16: Security & Access (D16)                                      ║
 * ║  HIRE Bot #17: Transaction Completion Engine (L1) - v1.0.0 ← THIS FILE     ║
 * ║  HIRE Bot #18: Milestone Progression Engine (L2)                            ║
 * ║  HIRE Bot #19: Lane Evaluation Engine (L3)                                  ║
 * ║  HIRE Bot #20: Cash Transaction Protocol (L4) - v1.0.0 ← THIS FILE         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * @module sms-integration
 * @version 1.0.0
 * @description SMS integration module combining HIRE Bot #17 (SMS Integration)
 *              and HIRE Bot #20 (Cash Receipt Confirmation)
 * @author HIRECAR Payment Orchestration Team
 *
 * FEATURES:
 * - Brevo Transactional SMS (primary) with automatic Twilio fallback
 * - Circuit breaker pattern for provider failover
 * - D1 audit logging for all SMS transactions
 * - Inbound SMS webhook handling (CONFIRM/DISPUTE for cash receipts)
 * - Template-based SMS composition for payments and cash receipts
 * - Health status monitoring and provider switching
 *
 * INTEGRATIONS:
 * - Brevo API: v3 Transactional SMS
 * - Twilio API: REST API v2010-04-01
 * - Cloudflare Workers D1: SMS audit log storage
 * - D1 Database: cash_receipts, payments, disputes tables
 */

/**
 * SMS Provider Circuit Breaker State
 * Tracks consecutive failures to enable automatic fallback
 */
class CircuitBreaker {
  constructor(failureThreshold = 3, recoveryTime = 5 * 60 * 1000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTime = recoveryTime; // 5 minutes default
    this.failureCount = 0;
    this.isOpen = false;
    this.lastFailureTime = null;
  }

  /**
   * Record a successful operation and reset circuit breaker
   */
  recordSuccess() {
    this.failureCount = 0;
    this.isOpen = false;
    this.lastFailureTime = null;
  }

  /**
   * Record a failure and potentially trip the circuit
   * @returns {boolean} True if circuit is now open, false otherwise
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.isOpen = true;
      return true;
    }
    return false;
  }

  /**
   * Check if circuit should recover
   * @returns {boolean} True if recovery window has elapsed
   */
  shouldAttemptRecovery() {
    if (!this.isOpen) return false;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure >= this.recoveryTime) {
      this.failureCount = 0;
      this.isOpen = false;
      return true;
    }
    return false;
  }

  /**
   * Get current state for health checks
   */
  getState() {
    return {
      isOpen: this.isOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      recoveryTimeRemaining: this.isOpen
        ? Math.max(0, this.recoveryTime - (Date.now() - this.lastFailureTime))
        : 0,
    };
  }
}

/**
 * SMS Template Definitions for HIRE Bot #17 (Payment Notifications)
 */
const PAYMENT_TEMPLATES = {
  payment_confirmed: (data) =>
    `HIRECAR: Payment of $${data.amount} confirmed for ${data.description}. Your balance is now $${data.remaining}. Thank you!`,

  payment_failed: (data) =>
    `HIRECAR: Payment of $${data.amount} could not be processed. Please update your payment method at hirecar.la/account or contact support.`,

  membership_renewal_reminder: (data) =>
    `HIRECAR: Your ${data.tier} membership renews in ${data.days} days at $${data.amount}. Update payment at hirecar.la/account.`,

  lane_escalation: (data) =>
    `HIRECAR: Important account update. Please contact your advisor ${data.advisor_name} at your earliest convenience. Ref: ${data.case_id}`,
};

/**
 * SMS Template Definitions for HIRE Bot #20 (Cash Receipt Confirmation)
 */
const CASH_RECEIPT_TEMPLATES = {
  cash_receipt_confirmation: (data) =>
    `HIRECAR Cash Receipt: ${data.receiver_name} logged $${data.amount} received from you for ${data.description}. Reply CONFIRM to verify or DISPUTE within 24h. Ref: ${data.receipt_id}`,

  cash_receipt_reminder: (data) =>
    `HIRECAR Reminder: Cash receipt ${data.receipt_id} for $${data.amount} is awaiting your confirmation. Reply CONFIRM or DISPUTE. Expires in ${data.hours_remaining}h.`,

  cash_receipt_expired: (data) =>
    `HIRECAR: Cash receipt ${data.receipt_id} for $${data.amount} has expired without confirmation. Contact your advisor if you need assistance.`,

  cash_dispute_opened: (data) =>
    `HIRECAR: Dispute ${data.dispute_id} opened for cash receipt ${data.receipt_id}. Our team will review within 48 hours.`,
};

/**
 * Main SMS Integration Module
 * Provides abstraction layer for SMS delivery with Brevo primary / Twilio fallback
 */
class SMSIntegration {
  /**
   * Initialize SMS Integration with environment bindings
   * @param {object} env - Cloudflare Worker environment
   * @param {D1Database} env.DB - D1 database instance
   * @param {string} env.BREVO_API_KEY - Brevo API key (secret)
   * @param {string} env.TWILIO_ACCOUNT_SID - Twilio Account SID (secret)
   * @param {string} env.TWILIO_AUTH_TOKEN - Twilio Auth Token (secret)
   * @param {string} env.TWILIO_FROM_NUMBER - Twilio From Number
   * @param {string} env.BREVO_SENDER_NAME - Brevo Sender Name (default: HIRECAR)
   */
  constructor(env) {
    this.db = env.DB;
    this.brevoApiKey = env.BREVO_API_KEY;
    this.twilioAccountSid = env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = env.TWILIO_AUTH_TOKEN;
    this.twilioFromNumber = env.TWILIO_FROM_NUMBER;
    this.brevoSenderName = env.BREVO_SENDER_NAME || 'HIRECAR';

    // Circuit breakers for each provider
    this.brevoCircuitBreaker = new CircuitBreaker(3, 5 * 60 * 1000); // 3 failures, 5 min recovery
    this.twilioCircuitBreaker = new CircuitBreaker(3, 5 * 60 * 1000);

    // Attempt recovery if circuits are open
    if (this.brevoCircuitBreaker.shouldAttemptRecovery()) {
      this.brevoCircuitBreaker.recordSuccess();
    }
    if (this.twilioCircuitBreaker.shouldAttemptRecovery()) {
      this.twilioCircuitBreaker.recordSuccess();
    }
  }

  /**
   * Send SMS via Brevo API
   * @private
   * @param {string} phoneNumber - Recipient phone number (E.164 format)
   * @param {string} message - SMS message body
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendViaBrevo(phoneNumber, message) {
    if (this.brevoCircuitBreaker.isOpen) {
      return {
        success: false,
        error: 'Brevo circuit breaker open, using fallback',
      };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: this.brevoSenderName,
          recipient: phoneNumber,
          content: message,
          type: 'transactional',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Brevo API error: ${data.message || response.statusText}`);
      }

      this.brevoCircuitBreaker.recordSuccess();
      return {
        success: true,
        messageId: data.reference || `brevo_${data.id}`,
        provider: 'brevo',
      };
    } catch (error) {
      const circuitTripped = this.brevoCircuitBreaker.recordFailure();
      return {
        success: false,
        error: error.message,
        circuitTripped,
        provider: 'brevo',
      };
    }
  }

  /**
   * Send SMS via Twilio API
   * @private
   * @param {string} phoneNumber - Recipient phone number (E.164 format)
   * @param {string} message - SMS message body
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendViaTwilio(phoneNumber, message) {
    if (this.twilioCircuitBreaker.isOpen) {
      return {
        success: false,
        error: 'Twilio circuit breaker open',
      };
    }

    try {
      const body = new URLSearchParams({
        From: this.twilioFromNumber,
        To: phoneNumber,
        Body: message,
      });

      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString(
        'base64'
      );

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Twilio API error: ${data.message || response.statusText}`);
      }

      this.twilioCircuitBreaker.recordSuccess();
      return {
        success: true,
        messageId: data.sid,
        provider: 'twilio',
      };
    } catch (error) {
      const circuitTripped = this.twilioCircuitBreaker.recordFailure();
      return {
        success: false,
        error: error.message,
        circuitTripped,
        provider: 'twilio',
      };
    }
  }

  /**
   * Log SMS transaction to D1 for audit trail
   * @private
   * @param {object} logData - SMS log data
   */
  async logSMSToDatabase(logData) {
    try {
      const {
        recipient_phone,
        message_type,
        template_name,
        provider_used,
        message_id,
        recipient_reference_id,
        status,
        error_message,
      } = logData;

      await this.db.prepare(
        `
        INSERT INTO sms_audit_log (
          recipient_phone,
          message_type,
          template_name,
          provider_used,
          message_id,
          recipient_reference_id,
          status,
          error_message,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).bind(
        recipient_phone,
        message_type,
        template_name,
        provider_used,
        message_id,
        recipient_reference_id,
        status,
        error_message,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Failed to log SMS to database:', error);
      // Don't throw - logging failure should not block SMS sending
    }
  }

  /**
   * Send SMS with automatic fallback handling
   * Attempts Brevo first, falls back to Twilio on failure
   *
   * @param {string} phoneNumber - Recipient phone number (E.164 format)
   * @param {string} message - SMS message body
   * @param {object} auditData - Additional data for audit log
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string, error?: string}>}
   */
  async sendSMS(phoneNumber, message, auditData = {}) {
    // Sanitize phone number
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Invalid phone number');
    }

    if (message.length > 1600) {
      throw new Error('SMS message exceeds maximum length of 1600 characters');
    }

    let result;
    const { message_type = 'transactional', template_name = 'custom', recipient_id = null } =
      auditData;

    // Try Brevo first (primary)
    result = await this.sendViaBrevo(phoneNumber, message);

    // If Brevo fails and circuit is not open, try Twilio
    if (!result.success && !this.brevoCircuitBreaker.isOpen) {
      result = await this.sendViaTwilio(phoneNumber, message);
    }

    // If Brevo circuit is open, try Twilio directly
    if (!result.success && this.brevoCircuitBreaker.isOpen) {
      result = await this.sendViaTwilio(phoneNumber, message);
    }

    // Log to database
    await this.logSMSToDatabase({
      recipient_phone: phoneNumber,
      message_type,
      template_name,
      provider_used: result.provider || 'unknown',
      message_id: result.messageId || null,
      recipient_reference_id: recipient_id,
      status: result.success ? 'sent' : 'failed',
      error_message: result.error || null,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error,
    };
  }

  /**
   * HIRE BOT #17: Send payment confirmation SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Payment data
   * @param {number} data.amount - Payment amount
   * @param {string} data.description - Payment description
   * @param {number} data.remaining - Remaining account balance
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendPaymentConfirmation(phoneNumber, data) {
    const message = PAYMENT_TEMPLATES.payment_confirmed(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'payment_notification',
      template_name: 'payment_confirmed',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #17: Send payment failed notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Payment failure data
   * @param {number} data.amount - Payment amount
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendPaymentFailed(phoneNumber, data) {
    const message = PAYMENT_TEMPLATES.payment_failed(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'payment_notification',
      template_name: 'payment_failed',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #17: Send membership renewal reminder SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Membership renewal data
   * @param {string} data.tier - Membership tier
   * @param {number} data.days - Days until renewal
   * @param {number} data.amount - Renewal amount
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendMembershipReminder(phoneNumber, data) {
    const message = PAYMENT_TEMPLATES.membership_renewal_reminder(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'membership_notification',
      template_name: 'membership_renewal_reminder',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #17: Send lane escalation notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Escalation data
   * @param {string} data.advisor_name - Advisor name
   * @param {string} data.case_id - Case ID
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendLaneEscalation(phoneNumber, data) {
    const message = PAYMENT_TEMPLATES.lane_escalation(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'escalation_notification',
      template_name: 'lane_escalation',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #20: Send cash receipt confirmation SMS
   * Initiates confirmation/dispute workflow for cash transactions
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Cash receipt data
   * @param {string} data.receiver_name - Name of person who received cash
   * @param {number} data.amount - Cash amount
   * @param {string} data.description - Transaction description
   * @param {string} data.receipt_id - Unique receipt ID
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendCashConfirmation(phoneNumber, data) {
    const message = CASH_RECEIPT_TEMPLATES.cash_receipt_confirmation(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'cash_receipt',
      template_name: 'cash_receipt_confirmation',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #20: Send cash receipt reminder SMS
   * Reminds user to confirm/dispute pending cash receipt
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Cash receipt reminder data
   * @param {string} data.receipt_id - Receipt ID
   * @param {number} data.amount - Cash amount
   * @param {number} data.hours_remaining - Hours until expiration
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendCashReminder(phoneNumber, data) {
    const message = CASH_RECEIPT_TEMPLATES.cash_receipt_reminder(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'cash_receipt_reminder',
      template_name: 'cash_receipt_reminder',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #20: Send cash receipt expired notification SMS
   * Notifies user that cash receipt confirmation window has closed
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Cash receipt expiration data
   * @param {string} data.receipt_id - Receipt ID
   * @param {number} data.amount - Cash amount
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendCashExpired(phoneNumber, data) {
    const message = CASH_RECEIPT_TEMPLATES.cash_receipt_expired(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'cash_receipt_expiration',
      template_name: 'cash_receipt_expired',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * HIRE BOT #20: Send cash dispute opened notification SMS
   * Notifies user that a dispute has been opened on a cash receipt
   * @param {string} phoneNumber - Recipient phone number
   * @param {object} data - Dispute data
   * @param {string} data.dispute_id - Dispute ID
   * @param {string} data.receipt_id - Receipt ID
   * @returns {Promise<{success: boolean, messageId?: string, provider?: string}>}
   */
  async sendCashDisputeOpened(phoneNumber, data) {
    const message = CASH_RECEIPT_TEMPLATES.cash_dispute_opened(data);
    return this.sendSMS(phoneNumber, message, {
      message_type: 'cash_dispute',
      template_name: 'cash_dispute_opened',
      recipient_id: data.user_id || null,
    });
  }

  /**
   * Handle inbound SMS - CONFIRM/DISPUTE replies for cash receipts
   * Processes both Brevo and Twilio webhook payloads
   *
   * @param {object} webhookPayload - Webhook payload from SMS provider
   * @param {string} provider - SMS provider ('brevo' or 'twilio')
   * @returns {Promise<{success: boolean, action?: string, receipt_id?: string, error?: string}>}
   */
  async handleInboundSMS(webhookPayload, provider) {
    try {
      let phoneNumber, inboundMessage;

      if (provider === 'brevo') {
        // Parse Brevo inbound SMS webhook
        phoneNumber = webhookPayload.sms?.sender;
        inboundMessage = webhookPayload.sms?.content?.trim().toUpperCase();
      } else if (provider === 'twilio') {
        // Parse Twilio inbound SMS webhook
        phoneNumber = webhookPayload.From;
        inboundMessage = webhookPayload.Body?.trim().toUpperCase();
      } else {
        throw new Error(`Unknown SMS provider: ${provider}`);
      }

      if (!phoneNumber || !inboundMessage) {
        throw new Error('Missing phone number or message content');
      }

      // Look up pending cash receipt by phone number
      const receipts = await this.db
        .prepare(
          `
        SELECT
          id,
          receipt_id,
          user_id,
          amount,
          confirmation_status,
          created_at,
          expires_at
        FROM cash_receipts
        WHERE user_phone = ?
          AND confirmation_status = 'pending'
          AND expires_at > datetime('now')
        ORDER BY created_at DESC
        LIMIT 1
      `
        )
        .bind(phoneNumber)
        .all();

      if (!receipts.results || receipts.results.length === 0) {
        return {
          success: false,
          error: 'No pending cash receipt found for this phone number',
        };
      }

      const receipt = receipts.results[0];

      if (inboundMessage.includes('CONFIRM')) {
        // Update receipt status to confirmed
        await this.db
          .prepare(
            `
          UPDATE cash_receipts
          SET confirmation_status = 'confirmed', confirmed_at = datetime('now')
          WHERE id = ?
        `
          )
          .bind(receipt.id)
          .run();

        // Mark linked payment as confirmed
        await this.db
          .prepare(
            `
          UPDATE payments
          SET payment_status = 'confirmed'
          WHERE cash_receipt_id = ?
        `
          )
          .bind(receipt.id)
          .run();

        // Log inbound SMS
        await this.logSMSToDatabase({
          recipient_phone: phoneNumber,
          message_type: 'inbound_reply',
          template_name: 'cash_receipt_confirmed',
          provider_used: provider,
          message_id: `inbound_${Date.now()}`,
          recipient_reference_id: receipt.user_id,
          status: 'processed',
          error_message: null,
        });

        return {
          success: true,
          action: 'confirmed',
          receipt_id: receipt.receipt_id,
          message: `Cash receipt ${receipt.receipt_id} has been confirmed.`,
        };
      } else if (inboundMessage.includes('DISPUTE')) {
        // Update receipt status to disputed
        await this.db
          .prepare(
            `
          UPDATE cash_receipts
          SET confirmation_status = 'disputed', disputed_at = datetime('now')
          WHERE id = ?
        `
          )
          .bind(receipt.id)
          .run();

        // Create dispute case
        const disputeInsert = await this.db
          .prepare(
            `
          INSERT INTO disputes (
            receipt_id,
            dispute_type,
            status,
            created_at,
            initiated_by
          ) VALUES (?, ?, ?, ?, ?)
        `
          )
          .bind(receipt.id, 'cash_receipt_dispute', 'open', new Date().toISOString(), 'customer')
          .run();

        // Log inbound SMS
        await this.logSMSToDatabase({
          recipient_phone: phoneNumber,
          message_type: 'inbound_reply',
          template_name: 'cash_receipt_disputed',
          provider_used: provider,
          message_id: `inbound_${Date.now()}`,
          recipient_reference_id: receipt.user_id,
          status: 'processed',
          error_message: null,
        });

        return {
          success: true,
          action: 'disputed',
          receipt_id: receipt.receipt_id,
          dispute_id: disputeInsert.meta.last_row_id,
          message: `Dispute opened for cash receipt ${receipt.receipt_id}. Our team will review within 48 hours.`,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response. Please reply with CONFIRM or DISPUTE.',
        };
      }
    } catch (error) {
      console.error('Error handling inbound SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get SMS provider health status
   * Used for monitoring and provider selection logic
   *
   * @returns {object} Health status of both providers
   */
  getSMSHealth() {
    return {
      brevo: {
        available: !this.brevoCircuitBreaker.isOpen,
        ...this.brevoCircuitBreaker.getState(),
      },
      twilio: {
        available: !this.twilioCircuitBreaker.isOpen,
        ...this.twilioCircuitBreaker.getState(),
      },
      primaryProvider: this.brevoCircuitBreaker.isOpen ? 'twilio' : 'brevo',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get SMS audit log from D1
   * Used for debugging and compliance audits
   *
   * @param {object} filters - Filter parameters
   * @param {string} filters.recipient_phone - Filter by phone number
   * @param {string} filters.message_type - Filter by message type
   * @param {number} filters.limit - Result limit (default 50)
   * @param {number} filters.offset - Result offset (default 0)
   * @returns {Promise<Array>} SMS audit log entries
   */
  async getSMSAuditLog(filters = {}) {
    const { recipient_phone, message_type, limit = 50, offset = 0 } = filters;

    let query = 'SELECT * FROM sms_audit_log WHERE 1=1';
    const bindings = [];

    if (recipient_phone) {
      query += ' AND recipient_phone = ?';
      bindings.push(recipient_phone);
    }

    if (message_type) {
      query += ' AND message_type = ?';
      bindings.push(message_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const result = await this.db.prepare(query).bind(...bindings).all();
    return result.results || [];
  }
}

/**
 * Register SMS API routes with the HIRECAR Router
 * Called from index.js: registerSMSRoutes(router)
 * Route handlers receive (request, env, params) — standard Worker pattern
 *
 * @param {Router} router - HIRECAR Router instance from index.js
 */
function registerSMSRoutes(router) {

  /**
   * POST /api/sms/send
   * Send ad-hoc SMS (requires authentication)
   */
  router.post('/api/sms/send', async (request, env, params) => {
    try {
      const auth = request.headers.get('Authorization');
      if (!auth || !auth.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { phone_number, message } = body;

      if (!phone_number || !message) {
        return Response.json({ error: 'Missing phone_number or message' }, { status: 400 });
      }

      const sms = new SMSIntegration(env);
      const result = await sms.sendSMS(phone_number, message, {
        message_type: 'ad_hoc',
        template_name: 'custom',
      });

      return Response.json(result);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });

  /**
   * POST /api/sms/cash-confirm
   * Send cash confirmation SMS
   */
  router.post('/api/sms/cash-confirm', async (request, env, params) => {
    try {
      const body = await request.json();
      const {
        phone_number,
        receiver_name,
        amount,
        description,
        receipt_id,
        user_id,
      } = body;

      if (!phone_number || !receiver_name || !amount || !receipt_id) {
        return Response.json(
          { error: 'Missing required fields: phone_number, receiver_name, amount, receipt_id' },
          { status: 400 }
        );
      }

      const sms = new SMSIntegration(env);
      const result = await sms.sendCashConfirmation(phone_number, {
        receiver_name,
        amount,
        description: description || 'unspecified transaction',
        receipt_id,
        user_id: user_id || null,
      });

      return Response.json(result);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });

  /**
   * POST /api/sms/cash-remind
   * Send cash receipt reminder SMS
   */
  router.post('/api/sms/cash-remind', async (request, env, params) => {
    try {
      const body = await request.json();
      const { phone_number, receipt_id, amount, hours_remaining, user_id } = body;

      if (!phone_number || !receipt_id || !amount || hours_remaining === undefined) {
        return Response.json(
          { error: 'Missing required fields: phone_number, receipt_id, amount, hours_remaining' },
          { status: 400 }
        );
      }

      const sms = new SMSIntegration(env);
      const result = await sms.sendCashReminder(phone_number, {
        receipt_id,
        amount,
        hours_remaining,
        user_id: user_id || null,
      });

      return Response.json(result);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });

  /**
   * POST /webhooks/sms/inbound/:provider
   * Inbound SMS webhook handler (Brevo or Twilio)
   */
  router.post('/webhooks/sms/inbound/:provider', async (request, env, params) => {
    try {
      const provider = params.provider;
      const body = await request.json();

      if (!['brevo', 'twilio'].includes(provider)) {
        return Response.json({ error: 'Invalid SMS provider' }, { status: 400 });
      }

      const sms = new SMSIntegration(env);
      const result = await sms.handleInboundSMS(body, provider);
      return Response.json(result);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });

  /**
   * GET /api/sms/health
   * Get SMS provider health status
   */
  router.get('/api/sms/health', async (request, env, params) => {
    const sms = new SMSIntegration(env);
    const health = sms.getSMSHealth();
    return Response.json(health);
  });

  /**
   * GET /api/sms/log
   * Get SMS audit log with optional filters
   */
  router.get('/api/sms/log', async (request, env, params) => {
    try {
      const url = new URL(request.url);
      const phone = url.searchParams.get('phone');
      const messageType = url.searchParams.get('message_type');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const sms = new SMSIntegration(env);
      const logs = await sms.getSMSAuditLog({
        recipient_phone: phone,
        message_type: messageType,
        limit,
        offset,
      });

      return Response.json({
        count: logs.length,
        logs,
      });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });
}

/**
 * Module Exports
 * All functions and classes needed for integration into payment orchestration
 */
export {
  SMSIntegration,
  registerSMSRoutes,
  CircuitBreaker,
  PAYMENT_TEMPLATES,
  CASH_RECEIPT_TEMPLATES,
};

/**
 * Convenience exports for direct usage
 */
export async function sendSMS(env, phoneNumber, message, auditData) {
  const sms = new SMSIntegration(env);
  return sms.sendSMS(phoneNumber, message, auditData);
}

export async function sendCashConfirmation(env, phoneNumber, data) {
  const sms = new SMSIntegration(env);
  return sms.sendCashConfirmation(phoneNumber, data);
}

export async function sendCashReminder(env, phoneNumber, data) {
  const sms = new SMSIntegration(env);
  return sms.sendCashReminder(phoneNumber, data);
}

export async function sendCashExpired(env, phoneNumber, data) {
  const sms = new SMSIntegration(env);
  return sms.sendCashExpired(phoneNumber, data);
}

export async function handleInboundSMS(env, payload, provider) {
  const sms = new SMSIntegration(env);
  return sms.handleInboundSMS(payload, provider);
}

export async function getSMSHealth(env) {
  const sms = new SMSIntegration(env);
  return sms.getSMSHealth();
}

/**
 * End of HIRE Bot #17 + #20 SMS Integration Module
 * Version: 1.0.0
 * Status: Production Ready
 */
