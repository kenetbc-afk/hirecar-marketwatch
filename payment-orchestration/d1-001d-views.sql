-- Migration 001d: Create views

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
