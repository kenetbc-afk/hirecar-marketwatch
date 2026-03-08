-- -----------------------------------------------------------
-- HIRECAR Payment Orchestration - D1 Schema Migration 001
-- ARCH-HC-0302 Implementation: Phase 1 (Unified Invoice Ledger)
-- -----------------------------------------------------------
-- Run against: hirecar-db (D1 database on Cloudflare)
-- Date: 2026-03-04
-- Author: HIRECAR Engineering
-- -----------------------------------------------------------

-- 1. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('membership', 'service', 'quote', 'credit_service')),
  source_doc_id TEXT NOT NULL,
  description TEXT,
  total_due_cents INTEGER NOT NULL,
  total_paid_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'disputed', 'cancelled')),
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_source ON invoices(source_doc_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);

-- 2. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('stripe', 'paypal', 'cashapp', 'fanbasis', 'cash', 'crypto')),
  platform_tx_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'disputed')),
  metadata TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_platform ON payments(platform);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(platform_tx_id);

-- 3. CASH RECEIPTS
CREATE TABLE IF NOT EXISTS cash_receipts (
  receipt_id TEXT PRIMARY KEY,
  payment_id TEXT,
  invoice_id TEXT NOT NULL,
  payer_member_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  receiver_name TEXT,
  amount_applied_cents INTEGER NOT NULL,
  amount_tendered_cents INTEGER NOT NULL,
  change_given_cents INTEGER NOT NULL DEFAULT 0,
  denominations TEXT NOT NULL,
  payer_phone TEXT,
  receiver_phone TEXT,
  confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'disputed', 'expired')),
  confirmation_sms_sid TEXT,
  confirmed_at TEXT,
  disputed_at TEXT,
  dispute_case_id TEXT,
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  reminder_sent_at TEXT,
  expired_at TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cash_member ON cash_receipts(payer_member_id);
CREATE INDEX IF NOT EXISTS idx_cash_receiver ON cash_receipts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_cash_status ON cash_receipts(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_cash_invoice ON cash_receipts(invoice_id);

-- 4. LANE HISTORY
CREATE TABLE IF NOT EXISTS lane_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL,
  previous_lane TEXT CHECK (previous_lane IS NULL OR previous_lane IN ('revenue', 'cure', 'remedy')),
  new_lane TEXT NOT NULL CHECK (new_lane IN ('revenue', 'cure', 'remedy', 'exit')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('initial_assignment', 'payment_failure', 'partial_stall', 'hbi_drop', 'milestone_miss', 'membership_cancel', 'membership_failure', 'cash_dispute', 'outreach_failure', 'recovery', 'escalation', 'de_escalation', 'manual_override', 'exit_voluntary', 'exit_involuntary')),
  trigger_detail TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_lane_member ON lane_history(member_id);
CREATE INDEX IF NOT EXISTS idx_lane_new ON lane_history(new_lane);
CREATE INDEX IF NOT EXISTS idx_lane_changed ON lane_history(changed_at);

-- 5. MEMBER LANE STATUS
CREATE TABLE IF NOT EXISTS member_lanes (
  member_id TEXT PRIMARY KEY,
  current_lane TEXT NOT NULL DEFAULT 'revenue' CHECK (current_lane IN ('revenue', 'cure', 'remedy', 'exit')),
  entered_lane_at TEXT NOT NULL DEFAULT (datetime('now')),
  days_in_lane INTEGER NOT NULL DEFAULT 0,
  cure_attempts INTEGER NOT NULL DEFAULT 0,
  assigned_advisor TEXT,
  last_evaluated TEXT NOT NULL DEFAULT (datetime('now')),
  hbi_score INTEGER,
  hbi_trend TEXT DEFAULT 'stable' CHECK (hbi_trend IN ('rising', 'stable', 'declining'))
);

CREATE INDEX IF NOT EXISTS idx_mlane_lane ON member_lanes(current_lane);
CREATE INDEX IF NOT EXISTS idx_mlane_advisor ON member_lanes(assigned_advisor);

-- 6. PRODUCT CATALOG
CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'operator', 'first_class', 'elite')),
  type TEXT NOT NULL DEFAULT 'membership' CHECK (type IN ('membership', 'service', 'addon')),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_interval TEXT DEFAULT 'month' CHECK (billing_interval IN ('one_time', 'month', 'bimonthly', 'year')),
  billing_interval_count INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  stripe_payment_link TEXT,
  paypal_plan_id TEXT,
  fanbasis_product_id TEXT,
  wix_product_id TEXT,
  last_synced_at TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'partial', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status);

-- 7. SYNC LOG
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  target_platform TEXT NOT NULL,
  product_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_event ON sync_log(event_id);
CREATE INDEX IF NOT EXISTS idx_sync_product ON sync_log(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_log(status);

-- 8. SEED: v3 Products
INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00001', 'HIRECAR Standard Membership', 'standard', 'membership', 2900, 'usd', 'bimonthly', 2, 'Entry-level automotive services membership. Billed every two months at $29.', 'prod_U5XWipFt8cj4Cx', 'price_1T7NCvA95N4c0ts1j6393yzD', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00002', 'HIRECAR Operator Membership', 'operator', 'membership', 5900, 'usd', 'bimonthly', 2, 'Mid-tier membership for rideshare drivers and fleet operators. Billed every two months at $59.', 'prod_U5XWNeWwEKiWCf', 'price_1T7NCxA95N4c0ts17epbpXmg', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00003', 'HIRECAR First Class Membership', 'first_class', 'membership', 9900, 'usd', 'month', 1, 'Premium membership for multi-service operators. Billed monthly at $99.', 'prod_U5XWRAHiodwAFe', 'price_1T7MRnA95N4c0ts1kGLJdkbL', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00004', 'HIRECAR Elite Membership (Monthly)', 'elite', 'membership', 19900, 'usd', 'month', 1, 'Top-tier membership for enterprise operators. Billed monthly at $199.', 'prod_U5XWJDSLiyUrN1', 'price_1T7MRoA95N4c0ts10Jk6s521', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00005', 'HIRECAR Elite Membership (Annual)', 'elite', 'membership', 199000, 'usd', 'year', 1, 'Top-tier annual membership. Billed annually at $1,990.', 'prod_U5XWJDSLiyUrN1', 'price_1T7N5lA95N4c0ts1Q4AIB2IC', 1);

-- 9. RECONCILIATION VIEW
CREATE VIEW IF NOT EXISTS v_invoice_balances AS
SELECT
  i.invoice_id,
  i.member_id,
  i.source_type,
  i.source_doc_id,
  i.total_due_cents,
  COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_cents ELSE 0 END), 0) AS total_confirmed_cents,
  i.total_due_cents - COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_cents ELSE 0 END), 0) AS remaining_cents,
  COUNT(CASE WHEN p.status = 'confirmed' THEN 1 END) AS payment_count,
  COUNT(CASE WHEN p.platform = 'cash' THEN 1 END) AS cash_payment_count,
  GROUP_CONCAT(DISTINCT p.platform) AS platforms_used,
  i.status AS invoice_status,
  i.due_date,
  i.created_at
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.invoice_id
GROUP BY i.invoice_id;

-- 10. LANE DISTRIBUTION VIEW
CREATE VIEW IF NOT EXISTS v_lane_distribution AS
SELECT
  current_lane,
  COUNT(*) AS member_count,
  AVG(days_in_lane) AS avg_days_in_lane,
  AVG(hbi_score) AS avg_hbi_score,
  SUM(CASE WHEN hbi_trend = 'declining' THEN 1 ELSE 0 END) AS declining_count
FROM member_lanes
WHERE current_lane != 'exit'
GROUP BY current_lane;

-- 11. CASH AUDIT VIEW
CREATE VIEW IF NOT EXISTS v_cash_audit AS
SELECT
  cr.receipt_id,
  cr.payer_member_id,
  cr.receiver_id,
  cr.receiver_name,
  cr.amount_applied_cents,
  cr.denominations,
  cr.confirmation_status,
  cr.logged_at,
  cr.confirmed_at,
  cr.notes,
  i.source_doc_id,
  i.total_due_cents
FROM cash_receipts cr
JOIN invoices i ON i.invoice_id = cr.invoice_id
ORDER BY cr.logged_at DESC;
