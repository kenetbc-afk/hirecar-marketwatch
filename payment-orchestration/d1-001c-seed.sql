-- Migration 001c: Seed product data

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00001', 'HIRECAR Standard Membership', 'standard', 'membership', 2900, 'usd', 'bimonthly', 2, 'Entry-level membership. Billed every two months at $29.', 'prod_U5XWipFt8cj4Cx', 'price_1T7NCvA95N4c0ts1j6393yzD', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00002', 'HIRECAR Operator Membership', 'operator', 'membership', 5900, 'usd', 'bimonthly', 2, 'Mid-tier membership. Billed every two months at $59.', 'prod_U5XWNeWwEKiWCf', 'price_1T7NCxA95N4c0ts17epbpXmg', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00003', 'HIRECAR First Class Membership', 'first_class', 'membership', 9900, 'usd', 'month', 1, 'Premium membership. Billed monthly at $99.', 'prod_U5XWRAHiodwAFe', 'price_1T7MRnA95N4c0ts1kGLJdkbL', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00004', 'HIRECAR Elite Membership (Monthly)', 'elite', 'membership', 19900, 'usd', 'month', 1, 'Top-tier membership. Billed monthly at $199.', 'prod_U5XWJDSLiyUrN1', 'price_1T7MRoA95N4c0ts10Jk6s521', 1);

INSERT OR IGNORE INTO products (product_id, name, tier, type, price_cents, currency, billing_interval, billing_interval_count, description, stripe_product_id, stripe_price_id, active) VALUES ('PROD-HC-00005', 'HIRECAR Elite Membership (Annual)', 'elite', 'membership', 199000, 'usd', 'year', 1, 'Top-tier annual membership. Billed annually at $1,990.', 'prod_U5XWJDSLiyUrN1', 'price_1T7N5lA95N4c0ts1Q4AIB2IC', 1);
