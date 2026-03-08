-- Migration 003b: Enrollment Indexes and Views

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_stripe ON members(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_member ON audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);

CREATE VIEW IF NOT EXISTS v_member_distribution AS
SELECT
  tier,
  COUNT(*) as member_count,
  SUM(amount_paid) / 100.0 as total_revenue,
  AVG(JULIANDAY('now') - JULIANDAY(enrolled_at)) as avg_tenure_days
FROM members
WHERE status = 'active'
GROUP BY tier;

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
