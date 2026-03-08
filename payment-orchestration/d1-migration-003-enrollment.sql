-- -----------------------------------------------------------
-- D1 Migration 003: Members & Enrollment Tables
-- BOT-HC-0101 - HIRE Bot #01 Enrollment Schema
-- -----------------------------------------------------------

-- 1. Members Table
CREATE TABLE IF NOT EXISTS members (
  member_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  tier TEXT NOT NULL CHECK(tier IN ('standard','operator','first_class','elite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled','suspended')),
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

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_stripe ON members(stripe_customer_id);

-- 2. Member Scores (HBI + Sub-Scores)
CREATE TABLE IF NOT EXISTS member_scores (
  member_id TEXT PRIMARY KEY,
  hbi_score INTEGER DEFAULT 500,
  cri_score INTEGER DEFAULT 500,
  bre_score INTEGER DEFAULT 500,
  fpi_score INTEGER DEFAULT 500,
  vdi_score INTEGER DEFAULT 500,
  msi_score INTEGER DEFAULT 500,
  lane TEXT DEFAULT 'revenue' CHECK(lane IN ('revenue','cure','remedy','exit')),
  lane_updated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  member_id TEXT,
  tier TEXT,
  details TEXT DEFAULT '{}',
  duration_ms INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_member ON audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);

-- 4. Member Distribution View
CREATE VIEW IF NOT EXISTS v_member_distribution AS
SELECT
  tier,
  COUNT(*) as member_count,
  SUM(amount_paid) / 100.0 as total_revenue,
  AVG(JULIANDAY('now') - JULIANDAY(enrolled_at)) as avg_tenure_days
FROM members
WHERE status = 'active'
GROUP BY tier;

-- 5. Enrollment Funnel View
CREATE VIEW IF NOT EXISTS v_enrollment_funnel AS
SELECT
  DATE(created_at) as enroll_date,
  COUNT(*) as enrollments,
  SUM(CASE WHEN event_type = 'enrollment' THEN 1 ELSE 0 END) as new_members,
  SUM(CASE WHEN event_type = 'upgrade' THEN 1 ELSE 0 END) as upgrades,
  AVG(duration_ms) as avg_pipeline_ms
FROM audit_log
WHERE created_at > datetime('now', '-30 days')
  AND event_type IN ('enrollment', 'upgrade')
GROUP BY DATE(created_at)
ORDER BY enroll_date DESC;
