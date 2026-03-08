-- ═══════════════════════════════════════════════════════════════
-- HIRECAR D1 Database — Full Schema Migration
-- Database: hirecar-db (ada3c40f-a4d9-4b3c-9b40-dde656f6f099)
-- Architecture: ARCH-HC-0302 v1.1.0
-- ═══════════════════════════════════════════════════════════════
--
-- Run with:
--   npx wrangler d1 execute hirecar-db --file=./schema/001_full_schema.sql --remote
--
-- Tables:
--   1. members           — Bot #01 enrollment registry
--   2. member_scores      — HBI/CRI/BRE/FPI/VDI/MSI scoring engine
--   3. audit_log          — Immutable event log
--   4. invoices           — Unified invoice ledger (Bot #08)
--   5. payments           — Multi-platform payment records
--   6. cash_receipts      — Cash protocol flow (Bot #20)
--   7. member_lanes       — 4-lane lifecycle engine (Bot #19)
--   8. lane_history       — Lane transition audit trail
--   9. products           — Stripe-synced product catalog (Bot #14)
--  10. sync_log           — Cross-platform sync events
--  11. sms_audit_log      — SMS delivery tracking (Bot #17)
--  12. disputes           — Cash receipt dispute cases
--
-- Views:
--   v_invoice_balances    — Real-time invoice balance calculations
--   v_member_distribution — Tier breakdown stats
--   v_enrollment_funnel   — 30-day enrollment pipeline
--   v_lane_distribution   — Lane population counts
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- 0. CLEAN SLATE — Drop existing objects (safe for test/sandbox)
-- ───────────────────────────────────────────────────────────────
-- Views must be dropped first (they depend on tables)
DROP VIEW IF EXISTS v_invoice_balances;
DROP VIEW IF EXISTS v_member_distribution;
DROP VIEW IF EXISTS v_enrollment_funnel;
DROP VIEW IF EXISTS v_lane_distribution;

-- Tables in reverse dependency order
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS sms_audit_log;
DROP TABLE IF EXISTS sync_log;
DROP TABLE IF EXISTS lane_history;
DROP TABLE IF EXISTS member_lanes;
DROP TABLE IF EXISTS cash_receipts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS member_scores;
DROP TABLE IF EXISTS members;


-- ───────────────────────────────────────────────────────────────
-- 1. MEMBERS — Bot #01 Enrollment Registry
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS members (
  member_id              TEXT PRIMARY KEY,
  email                  TEXT NOT NULL,
  name                   TEXT DEFAULT '',
  phone                  TEXT DEFAULT '',
  tier                   TEXT NOT NULL CHECK(tier IN ('standard','operator','first_class','elite')),
  status                 TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled','suspended')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  product_id             TEXT,
  price_id               TEXT,
  bot_access             TEXT DEFAULT '[]',
  enrollment_source      TEXT DEFAULT 'stripe_checkout',
  amount_paid            INTEGER DEFAULT 0,
  currency               TEXT DEFAULT 'usd',
  enrolled_at            TEXT NOT NULL DEFAULT (datetime('now')),
  upgraded_at            TEXT,
  cancelled_at           TEXT,
  updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_stripe ON members(stripe_customer_id);


-- ───────────────────────────────────────────────────────────────
-- 2. MEMBER_SCORES — HBI Scoring Engine
-- ───────────────────────────────────────────────────────────────
-- Six-axis scoring model:
--   HBI = HIRECAR Business Index (composite)
--   CRI = Credit Reliability Index
--   BRE = Business Revenue Efficiency
--   FPI = Fleet Performance Index
--   VDI = Vendor Dependability Index
--   MSI = Member Satisfaction Index

CREATE TABLE IF NOT EXISTS member_scores (
  member_id       TEXT PRIMARY KEY REFERENCES members(member_id),
  hbi_score       INTEGER DEFAULT 500,
  cri_score       INTEGER DEFAULT 500,
  bre_score       INTEGER DEFAULT 500,
  fpi_score       INTEGER DEFAULT 500,
  vdi_score       INTEGER DEFAULT 500,
  msi_score       INTEGER DEFAULT 500,
  lane            TEXT DEFAULT 'revenue' CHECK(lane IN ('revenue','cure','remedy','exit')),
  lane_updated_at TEXT,
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);


-- ───────────────────────────────────────────────────────────────
-- 3. AUDIT_LOG — Immutable Event Trail
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type      TEXT NOT NULL,
  member_id       TEXT,
  tier            TEXT,
  details         TEXT DEFAULT '{}',
  bot_id          TEXT,
  duration_ms     INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_member ON audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);


-- ───────────────────────────────────────────────────────────────
-- 4. INVOICES — Unified Invoice Ledger (Bot #08)
-- ───────────────────────────────────────────────────────────────
-- Hub of the payment orchestration layer.
-- source_type: 'subscription', 'service', 'fleet', 'custom'

CREATE TABLE IF NOT EXISTS invoices (
  invoice_id        TEXT PRIMARY KEY,
  member_id         TEXT NOT NULL REFERENCES members(member_id),
  source_type       TEXT NOT NULL DEFAULT 'subscription',
  source_doc_id     TEXT,
  description       TEXT DEFAULT '',
  total_due_cents   INTEGER NOT NULL DEFAULT 0,
  total_paid_cents  INTEGER NOT NULL DEFAULT 0,
  currency          TEXT DEFAULT 'usd',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','partial','paid','overdue','cancelled','refunded')),
  due_date          TEXT,
  paid_at           TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);


-- ───────────────────────────────────────────────────────────────
-- 5. PAYMENTS — Multi-Platform Payment Records
-- ───────────────────────────────────────────────────────────────
-- Spoke platforms: stripe, paypal, cashapp, fanbasis, cash, crypto

CREATE TABLE IF NOT EXISTS payments (
  payment_id        TEXT PRIMARY KEY,
  invoice_id        TEXT REFERENCES invoices(invoice_id),
  member_id         TEXT NOT NULL REFERENCES members(member_id),
  platform          TEXT NOT NULL CHECK(platform IN ('stripe','paypal','cashapp','fanbasis','cash','crypto')),
  platform_tx_id    TEXT,
  amount_cents      INTEGER NOT NULL DEFAULT 0,
  currency          TEXT DEFAULT 'usd',
  status            TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','failed','refunded','disputed')),
  metadata          TEXT DEFAULT '{}',
  confirmed_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_platform ON payments(platform);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);


-- ───────────────────────────────────────────────────────────────
-- 6. CASH_RECEIPTS — Cash Protocol (Bot #20)
-- ───────────────────────────────────────────────────────────────
-- 3-step flow: log → SMS confirm → ledger entry
-- Confirmation window: 24 hours, reminder at 12 hours

CREATE TABLE IF NOT EXISTS cash_receipts (
  receipt_id           TEXT PRIMARY KEY,
  invoice_id           TEXT REFERENCES invoices(invoice_id),
  payer_member_id      TEXT REFERENCES members(member_id),
  receiver_id          TEXT,
  receiver_name        TEXT,
  amount_applied_cents INTEGER NOT NULL DEFAULT 0,
  amount_tendered_cents INTEGER DEFAULT 0,
  change_given_cents   INTEGER DEFAULT 0,
  denominations        TEXT DEFAULT '{}',
  payer_phone          TEXT,
  receiver_phone       TEXT,
  notes                TEXT,
  confirmation_status  TEXT NOT NULL DEFAULT 'pending' CHECK(confirmation_status IN ('pending','confirmed','expired','disputed')),
  payment_id           TEXT REFERENCES payments(payment_id),
  dispute_case_id      TEXT,
  logged_at            TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at         TEXT,
  expired_at           TEXT,
  disputed_at          TEXT,
  reminder_sent_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_cash_payer ON cash_receipts(payer_member_id);
CREATE INDEX IF NOT EXISTS idx_cash_invoice ON cash_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_cash_status ON cash_receipts(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_cash_logged ON cash_receipts(logged_at);


-- ───────────────────────────────────────────────────────────────
-- 7. MEMBER_LANES — 4-Lane Lifecycle Engine (Bot #19)
-- ───────────────────────────────────────────────────────────────
-- Lanes: Revenue → Cure → Remedy → Exit
-- Daily cron evaluates all active members at 06:00 UTC

CREATE TABLE IF NOT EXISTS member_lanes (
  member_id        TEXT PRIMARY KEY REFERENCES members(member_id),
  current_lane     TEXT NOT NULL DEFAULT 'revenue' CHECK(current_lane IN ('revenue','cure','remedy','exit')),
  entered_lane_at  TEXT DEFAULT (datetime('now')),
  days_in_lane     INTEGER DEFAULT 0,
  cure_attempts    INTEGER DEFAULT 0,
  hbi_score        INTEGER DEFAULT 500,
  last_evaluated   TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lanes_current ON member_lanes(current_lane);
CREATE INDEX IF NOT EXISTS idx_lanes_hbi ON member_lanes(hbi_score);


-- ───────────────────────────────────────────────────────────────
-- 8. LANE_HISTORY — Lane Transition Audit Trail
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lane_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id        TEXT NOT NULL REFERENCES members(member_id),
  previous_lane    TEXT,
  new_lane         TEXT NOT NULL,
  trigger_type     TEXT NOT NULL,
  trigger_detail   TEXT DEFAULT '{}',
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lane_hist_member ON lane_history(member_id);
CREATE INDEX IF NOT EXISTS idx_lane_hist_created ON lane_history(created_at);


-- ───────────────────────────────────────────────────────────────
-- 9. PRODUCTS — Stripe-Synced Product Catalog (Bot #14)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  product_id         TEXT PRIMARY KEY,
  stripe_product_id  TEXT,
  stripe_price_id    TEXT,
  name               TEXT NOT NULL,
  tier               TEXT,
  price_cents        INTEGER DEFAULT 0,
  billing_interval   TEXT DEFAULT 'month',
  interval_count     INTEGER DEFAULT 1,
  currency           TEXT DEFAULT 'usd',
  active             INTEGER NOT NULL DEFAULT 1,
  sync_status        TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed','stale')),
  last_synced_at     TEXT,
  wix_product_id     TEXT,
  fanbasis_id        TEXT,
  metadata           TEXT DEFAULT '{}',
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_stripe ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status);


-- ───────────────────────────────────────────────────────────────
-- 10. SYNC_LOG — Cross-Platform Sync Events (Bot #14)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sync_log (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type        TEXT NOT NULL,
  event_id          TEXT,
  source_platform   TEXT NOT NULL,
  target_platform   TEXT NOT NULL,
  product_id        TEXT,
  status            TEXT NOT NULL CHECK(status IN ('success','failed','skipped')),
  error_message     TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_product ON sync_log(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_created ON sync_log(created_at);


-- ───────────────────────────────────────────────────────────────
-- 11. SMS_AUDIT_LOG — SMS Delivery Tracking (Bot #17)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sms_audit_log (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_phone        TEXT NOT NULL,
  message_type           TEXT NOT NULL,
  template_name          TEXT,
  provider_used          TEXT,
  message_id             TEXT,
  recipient_reference_id TEXT,
  status                 TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent','delivered','failed','processed')),
  error_message          TEXT,
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_audit_log(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_sms_type ON sms_audit_log(message_type);
CREATE INDEX IF NOT EXISTS idx_sms_created ON sms_audit_log(created_at);


-- ───────────────────────────────────────────────────────────────
-- 12. DISPUTES — Cash Receipt Dispute Cases
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disputes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_id      TEXT REFERENCES cash_receipts(receipt_id),
  dispute_type    TEXT NOT NULL DEFAULT 'cash_receipt_dispute',
  status          TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','investigating','resolved','closed')),
  resolution      TEXT,
  initiated_by    TEXT DEFAULT 'customer',
  resolved_at     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_disputes_receipt ON disputes(receipt_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);


-- ═══════════════════════════════════════════════════════════════
-- VIEWS — Computed Reporting Layers
-- ═══════════════════════════════════════════════════════════════


-- ── Invoice Balances (real-time) ──
CREATE VIEW IF NOT EXISTS v_invoice_balances AS
SELECT
  i.invoice_id,
  i.member_id,
  i.source_type,
  i.source_doc_id,
  i.description,
  i.total_due_cents,
  i.total_paid_cents,
  (i.total_due_cents - i.total_paid_cents) AS balance_cents,
  i.currency,
  CASE
    WHEN i.status = 'paid' THEN 'paid'
    WHEN i.total_paid_cents >= i.total_due_cents THEN 'paid'
    WHEN i.total_paid_cents > 0 THEN 'partial'
    WHEN i.due_date IS NOT NULL AND i.due_date < datetime('now') THEN 'overdue'
    ELSE 'pending'
  END AS invoice_status,
  i.due_date,
  i.paid_at,
  i.created_at
FROM invoices i;


-- ── Member Distribution by Tier ──
-- Matches enrollment-flow.js v_member_distribution
CREATE VIEW IF NOT EXISTS v_member_distribution AS
SELECT
  tier,
  COUNT(*) AS member_count,
  SUM(amount_paid) / 100.0 AS total_revenue,
  AVG(JULIANDAY('now') - JULIANDAY(enrolled_at)) AS avg_tenure_days
FROM members
WHERE status = 'active'
GROUP BY tier;


-- ── Enrollment Funnel (last 30 days) ──
-- Matches enrollment-flow.js v_enrollment_funnel
CREATE VIEW IF NOT EXISTS v_enrollment_funnel AS
SELECT
  DATE(created_at) AS enroll_date,
  COUNT(*) AS enrollments,
  SUM(CASE WHEN event_type = 'enrollment' THEN 1 ELSE 0 END) AS new_members,
  SUM(CASE WHEN event_type = 'upgrade' THEN 1 ELSE 0 END) AS upgrades,
  AVG(duration_ms) AS avg_pipeline_ms
FROM audit_log
WHERE created_at > datetime('now', '-30 days')
  AND event_type IN ('enrollment', 'upgrade')
GROUP BY DATE(created_at)
ORDER BY enroll_date DESC;


-- ── Lane Distribution ──
CREATE VIEW IF NOT EXISTS v_lane_distribution AS
SELECT
  current_lane,
  COUNT(*) AS member_count,
  AVG(hbi_score) AS avg_hbi,
  AVG(days_in_lane) AS avg_days_in_lane,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM member_lanes), 1) AS pct_of_total
FROM member_lanes
GROUP BY current_lane
ORDER BY
  CASE current_lane
    WHEN 'revenue' THEN 1
    WHEN 'cure' THEN 2
    WHEN 'remedy' THEN 3
    WHEN 'exit' THEN 4
  END;


-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — Initial Product Catalog (v3 FINAL active tiers)
-- ═══════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO products (product_id, stripe_product_id, stripe_price_id, name, tier, price_cents, billing_interval, interval_count, active)
VALUES
  ('PROD-STD-001', 'prod_U5XWipFt8cj4Cx', 'price_1T7NCvA95N4c0ts1j6393yzD', 'HIRECAR Standard', 'standard', 2900, 'month', 2, 1),
  ('PROD-OPR-001', 'prod_U5XWNeWwEKiWCf', 'price_1T7NCxA95N4c0ts17epbpXmg', 'HIRECAR Operator', 'operator', 5900, 'month', 2, 1),
  ('PROD-FC-001',  'prod_U5XWRAHiodwAFe', 'price_1T7MRnA95N4c0ts1kGLJdkbL', 'HIRECAR First Class', 'first_class', 9900, 'month', 1, 1),
  ('PROD-ELT-001', 'prod_U5XWJDSLiyUrN1', 'price_1T7MRoA95N4c0ts10Jk6s521', 'HIRECAR Elite Monthly', 'elite', 19900, 'month', 1, 1),
  ('PROD-ELT-002', 'prod_U5XWJDSLiyUrN1', 'price_1T7N5lA95N4c0ts1Q4AIB2IC', 'HIRECAR Elite Annual', 'elite', 199000, 'year', 1, 1);
