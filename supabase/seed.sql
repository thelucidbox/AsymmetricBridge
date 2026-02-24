-- Asymmetric Bridge: Seed Data
-- Starter signal_statuses for the default thesis (Fabian's 6 Dominos)
-- Safe to re-run: uses ON CONFLICT DO NOTHING

-- Domino 1: SaaS Compression
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (1, 'Public SaaS Net Revenue Retention', 'green', false, 'seed'),
  (1, 'Indeed SaaS Job Postings', 'green', false, 'seed'),
  (1, 'Y Combinator Replace-X Batch %', 'green', false, 'seed'),
  (1, 'Enterprise AI Spend vs SaaS Spend', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;

-- Domino 2: White-Collar Displacement
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (2, 'JOLTS: Professional Services Openings', 'green', false, 'seed'),
  (2, 'BLS Information Sector Employment', 'green', false, 'seed'),
  (2, 'Challenger Gray Tech Layoff Announcements', 'green', false, 'seed'),
  (2, 'Initial Jobless Claims Composition', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;

-- Domino 3: Friction Collapse
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (3, 'DoorDash/Uber Take Rate Compression', 'green', false, 'seed'),
  (3, 'Visa/Mastercard Transaction Volume', 'green', false, 'seed'),
  (3, 'Stablecoin Transaction Volume', 'green', false, 'seed'),
  (3, 'Real Estate Commission Compression', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;

-- Domino 4: Ghost GDP
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (4, 'GDP Growth vs. Wage Growth Spread', 'green', false, 'seed'),
  (4, 'M2 Velocity of Money', 'green', false, 'seed'),
  (4, 'Consumer Confidence vs. CEO Confidence', 'green', false, 'seed'),
  (4, 'Labor Share of GDP', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;

-- Domino 5: Financial Contagion
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (5, 'PE-Backed Company Default Rate', 'green', false, 'seed'),
  (5, 'Alt Manager Stock Prices (BX, APO, KKR)', 'green', false, 'seed'),
  (5, 'Prime Mortgage Delinquency Rate', 'green', false, 'seed'),
  (5, 'NAIC Insurance Regulatory Actions', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;

-- Domino 6: Policy Response
INSERT INTO signal_statuses (domino_id, signal_name, status, is_override, updated_by)
VALUES
  (6, 'AI Legislation Activity', 'green', false, 'seed'),
  (6, 'Fed Language on AI Displacement', 'green', false, 'seed'),
  (6, 'Federal Tax Receipts', 'green', false, 'seed'),
  (6, 'Deficit-to-GDP Trajectory', 'green', false, 'seed')
ON CONFLICT (domino_id, signal_name) DO NOTHING;
