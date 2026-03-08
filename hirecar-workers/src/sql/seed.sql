-- ═══════════════════════════════════════════════════════
-- HIRECAR Test Seed Data
-- Run with: npm run db:seed
-- ═══════════════════════════════════════════════════════

-- Test Members
INSERT OR IGNORE INTO members (member_id, name, email, phone, tier, phase, status)
VALUES
  ('HC-2026-00001', 'Test Member Alpha', 'alpha@test.hirecar.la', '213-555-0101', 'standard', 'intake', 'active'),
  ('HC-2026-00002', 'Test Member Bravo', 'bravo@test.hirecar.la', '213-555-0102', 'operator', 'recovery', 'active'),
  ('HC-2026-00003', 'Test Member Charlie', 'charlie@test.hirecar.la', '213-555-0103', 'first-class', 'rebuilding', 'active');

-- Test Leads
INSERT OR IGNORE INTO leads (lead_id, name, email, phone, score, source, goals, status, assigned_to)
VALUES
  ('lead-test-001', 'Lead Hot', 'hot@test.hirecar.la', '310-555-0201', 85, 'referral', 'Need a vehicle for Uber, also want to repair my credit score', 'qualified', 'sales-team'),
  ('lead-test-002', 'Lead Warm', 'warm@test.hirecar.la', '310-555-0202', 55, 'website', 'Looking into credit building options', 'new', 'nurture-queue'),
  ('lead-test-003', 'Lead Cool', 'cool@test.hirecar.la', NULL, 20, 'ad', 'Just browsing', 'new', 'low-priority');

-- Test Payment
INSERT OR IGNORE INTO payments (payment_id, member_id, member_email, amount, currency, method, provider_ref, status)
VALUES
  ('pi_test_001', 'HC-2026-00001', 'alpha@test.hirecar.la', 29.00, 'usd', 'stripe', 'pi_test_001', 'completed');

-- Test Daily Stats
INSERT OR IGNORE INTO daily_stats (stat_date, lead_count, lead_avg_score, payment_count, payment_total, member_count, passes_issued)
VALUES
  (date('now'), 3, 53, 1, 29.00, 3, 0);
