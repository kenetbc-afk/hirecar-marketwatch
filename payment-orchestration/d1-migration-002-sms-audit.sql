-- -----------------------------------------------------------
-- HIRECAR Payment Orchestration - D1 Schema Migration 002
-- SMS Audit Log + Dispute Cases (HIRE Bot #17 + #20)
-- -----------------------------------------------------------
-- Run after: d1-migration-001-payment-orchestration.sql
-- Date: 2026-03-04
-- -----------------------------------------------------------

-- 1. SMS AUDIT LOG
CREATE TABLE IF NOT EXISTS sms_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  provider TEXT NOT NULL CHECK (provider IN ('brevo', 'twilio')),
  provider_msg_id TEXT,
  template_id TEXT,
  recipient_phone TEXT NOT NULL,
  sender_name TEXT DEFAULT 'HIRECAR',
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received', 'queued')),
  error_message TEXT,
  member_id TEXT,
  receipt_id TEXT,
  invoice_id TEXT,
  bot_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sms_member ON sms_audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_sms_receipt ON sms_audit_log(receipt_id);
CREATE INDEX IF NOT EXISTS idx_sms_status ON sms_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_sms_direction ON sms_audit_log(direction);
CREATE INDEX IF NOT EXISTS idx_sms_created ON sms_audit_log(created_at);

-- 2. DISPUTE CASES
CREATE TABLE IF NOT EXISTS disputes (
  dispute_id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('cash_receipt', 'payment', 'membership', 'service')),
  receipt_id TEXT,
  invoice_id TEXT,
  payment_id TEXT,
  reason TEXT,
  evidence TEXT,
  amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_member', 'resolved_provider', 'escalated', 'closed')),
  resolution TEXT,
  resolved_by TEXT,
  opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  review_started TEXT,
  resolved_at TEXT,
  assigned_advisor TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_disputes_member ON disputes(member_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_type ON disputes(dispute_type);
CREATE INDEX IF NOT EXISTS idx_disputes_receipt ON disputes(receipt_id);
CREATE INDEX IF NOT EXISTS idx_disputes_priority ON disputes(priority);

-- 3. PROCESSOR STATUS
CREATE TABLE IF NOT EXISTS processor_status (
  platform TEXT PRIMARY KEY CHECK (platform IN ('stripe', 'paypal', 'cashapp', 'fanbasis', 'brevo', 'twilio')),
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down', 'circuit_open')),
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_success_at TEXT,
  last_failure_at TEXT,
  circuit_opened_at TEXT,
  error_message TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('stripe', 'healthy');
INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('paypal', 'healthy');
INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('cashapp', 'healthy');
INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('fanbasis', 'healthy');
INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('brevo', 'healthy');
INSERT OR IGNORE INTO processor_status (platform, status) VALUES ('twilio', 'healthy');

-- 4. DISPUTE SUMMARY VIEW
CREATE VIEW IF NOT EXISTS v_dispute_summary AS
SELECT
  d.dispute_id,
  d.member_id,
  d.dispute_type,
  d.amount_cents,
  d.status,
  d.priority,
  d.assigned_advisor,
  d.opened_at,
  d.resolved_at,
  CASE
    WHEN d.resolved_at IS NOT NULL
    THEN CAST((julianday(d.resolved_at) - julianday(d.opened_at)) * 24 AS INTEGER)
    ELSE CAST((julianday('now') - julianday(d.opened_at)) * 24 AS INTEGER)
  END AS hours_open,
  cr.receipt_id AS cash_receipt_ref,
  cr.amount_applied_cents AS cash_amount
FROM disputes d
LEFT JOIN cash_receipts cr ON cr.receipt_id = d.receipt_id
ORDER BY
  CASE d.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  d.opened_at ASC;
