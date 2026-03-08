-- Migration 003a: Enrollment Tables (no indexes, no views)

CREATE TABLE IF NOT EXISTS members (
  member_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  product_id TEXT,
  price_id TEXT,
  bot_access TEXT DEFAULT '[]',
  enrollment_source TEXT DEFAULT 'stripe_checkout',
  amount_paid INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  upgraded_at TEXT,
  cancelled_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS member_scores (
  member_id TEXT PRIMARY KEY,
  hbi_score INTEGER DEFAULT 500,
  cri_score INTEGER DEFAULT 500,
  bre_score INTEGER DEFAULT 500,
  fpi_score INTEGER DEFAULT 500,
  vdi_score INTEGER DEFAULT 500,
  msi_score INTEGER DEFAULT 500,
  lane TEXT DEFAULT 'revenue',
  lane_updated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  member_id TEXT,
  tier TEXT,
  details TEXT DEFAULT '{}',
  duration_ms INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
