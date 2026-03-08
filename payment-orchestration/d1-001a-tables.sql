-- Migration 001a: Create all tables (no indexes, no views)

DROP TABLE IF EXISTS sync_log;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS member_lanes;
DROP TABLE IF EXISTS lane_history;
DROP TABLE IF EXISTS cash_receipts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;

DROP VIEW IF EXISTS v_invoice_balances;
DROP VIEW IF EXISTS v_lane_distribution;
DROP VIEW IF EXISTS v_cash_audit;

CREATE TABLE invoices (
  invoice_id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_doc_id TEXT NOT NULL,
  description TEXT,
  total_due_cents INTEGER NOT NULL,
  total_paid_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE TABLE payments (
  payment_id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_tx_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE cash_receipts (
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
  confirmation_status TEXT NOT NULL DEFAULT 'pending',
  confirmation_sms_sid TEXT,
  confirmed_at TEXT,
  disputed_at TEXT,
  dispute_case_id TEXT,
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  reminder_sent_at TEXT,
  expired_at TEXT,
  notes TEXT
);

CREATE TABLE lane_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL,
  previous_lane TEXT,
  new_lane TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_detail TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL DEFAULT 'system'
);

CREATE TABLE member_lanes (
  member_id TEXT PRIMARY KEY,
  current_lane TEXT NOT NULL DEFAULT 'revenue',
  entered_lane_at TEXT NOT NULL DEFAULT (datetime('now')),
  days_in_lane INTEGER NOT NULL DEFAULT 0,
  cure_attempts INTEGER NOT NULL DEFAULT 0,
  assigned_advisor TEXT,
  last_evaluated TEXT NOT NULL DEFAULT (datetime('now')),
  hbi_score INTEGER,
  hbi_trend TEXT DEFAULT 'stable'
);

CREATE TABLE products (
  product_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'membership',
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_interval TEXT DEFAULT 'month',
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
  sync_status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  target_platform TEXT NOT NULL,
  product_id TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
