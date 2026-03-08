-- Migration 001b: Create all indexes

CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_source ON invoices(source_doc_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_platform ON payments(platform);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(platform_tx_id);

CREATE INDEX IF NOT EXISTS idx_cash_member ON cash_receipts(payer_member_id);
CREATE INDEX IF NOT EXISTS idx_cash_receiver ON cash_receipts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_cash_status ON cash_receipts(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_cash_invoice ON cash_receipts(invoice_id);

CREATE INDEX IF NOT EXISTS idx_lane_member ON lane_history(member_id);
CREATE INDEX IF NOT EXISTS idx_lane_new ON lane_history(new_lane);
CREATE INDEX IF NOT EXISTS idx_lane_changed ON lane_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_mlane_lane ON member_lanes(current_lane);
CREATE INDEX IF NOT EXISTS idx_mlane_advisor ON member_lanes(assigned_advisor);

CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status);

CREATE INDEX IF NOT EXISTS idx_sync_event ON sync_log(event_id);
CREATE INDEX IF NOT EXISTS idx_sync_product ON sync_log(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_log(status);
