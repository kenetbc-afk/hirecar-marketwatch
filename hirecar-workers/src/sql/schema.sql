-- ═══════════════════════════════════════════════════════
-- HIRECAR D1 Database Schema
-- Replaces Make.com data stores: Members, Payments, Leads
-- ═══════════════════════════════════════════════════════

-- Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  member_id    TEXT PRIMARY KEY,          -- HC-2026-00001
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  phone        TEXT,
  tier         TEXT DEFAULT 'standard',   -- standard | operator | first-class | elite
  phase        TEXT DEFAULT 'intake',     -- intake | recovery | rebuilding | operating | scaling
  scores       TEXT,                      -- JSON blob for credit scores
  pass_id      TEXT,                      -- PassKit pass ID
  enrollment_date TEXT DEFAULT (datetime('now')),
  status       TEXT DEFAULT 'active',     -- active | suspended | cancelled
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Payments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  payment_id   TEXT PRIMARY KEY,          -- Stripe pi_xxx or PayPal txn_xxx
  member_id    TEXT,
  member_email TEXT NOT NULL,
  amount       REAL NOT NULL,
  currency     TEXT DEFAULT 'usd',
  method       TEXT NOT NULL,             -- stripe | paypal | cashapp
  provider_ref TEXT,                      -- raw provider reference ID
  status       TEXT DEFAULT 'completed',  -- completed | refunded | pending | failed
  metadata     TEXT,                      -- JSON blob for extra data
  created_at   TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(member_email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);

-- Leads ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  lead_id      TEXT PRIMARY KEY,          -- auto-generated UUID
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  score        INTEGER DEFAULT 0,         -- 0-100 lead score
  source       TEXT,                      -- website | referral | social | ad
  goals        TEXT,                      -- free text
  status       TEXT DEFAULT 'new',        -- new | contacted | qualified | converted | lost
  assigned_to  TEXT,
  notes        TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(created_at);

-- Events (audit log) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type   TEXT NOT NULL,             -- payment.received | lead.created | member.enrolled | etc
  entity_type  TEXT,                      -- payment | lead | member
  entity_id    TEXT,
  payload      TEXT,                      -- JSON event data
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(created_at);

-- Daily Stats (for digest) ────────────────────────────
CREATE TABLE IF NOT EXISTS daily_stats (
  stat_date       TEXT PRIMARY KEY,       -- YYYY-MM-DD
  lead_count      INTEGER DEFAULT 0,
  lead_avg_score  REAL DEFAULT 0,
  payment_count   INTEGER DEFAULT 0,
  payment_total   REAL DEFAULT 0,
  member_count    INTEGER DEFAULT 0,
  passes_issued   INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);
