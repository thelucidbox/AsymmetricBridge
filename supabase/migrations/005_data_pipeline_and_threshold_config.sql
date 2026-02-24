-- Migration 005: Data pipeline + threshold config
-- Enables server-side cron to evaluate all auto signals (not just manual entries)
-- and unifies threshold definitions in a single source of truth

-- Add unique constraint so client can upsert daily data points per signal
ALTER TABLE signal_data_points
  ADD CONSTRAINT uq_signal_data_points_daily
  UNIQUE (domino_id, signal_name, date);

-- Threshold definitions — single source of truth for both client and cron
CREATE TABLE IF NOT EXISTS threshold_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domino_id int NOT NULL,
  signal_name text NOT NULL,
  comparator text NOT NULL CHECK (comparator IN ('lt', 'gt', 'custom')),
  amber_value numeric,
  red_value numeric,
  custom_rule jsonb,
  enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (domino_id, signal_name)
);

-- Seed threshold config from the hardcoded definitions
INSERT INTO threshold_config (domino_id, signal_name, comparator, amber_value, red_value) VALUES
  (1, 'Public SaaS Net Revenue Retention', 'lt', 120, 110),
  (2, 'JOLTS: Professional Services Openings', 'lt', 1.8, 1.5),
  (2, 'Initial Jobless Claims Composition', 'gt', 280, 350),
  (3, 'Stablecoin Transaction Volume', 'gt', 1000, 2000),
  (4, 'M2 Velocity of Money', 'lt', 1.15, 1.0),
  (4, 'Consumer Confidence vs. CEO Confidence', 'lt', 98, 95),
  (4, 'Labor Share of GDP', 'lt', 55, 52),
  (5, 'Alt Manager Stock Prices (BX, APO, KKR)', 'lt', -15, -25)
ON CONFLICT (domino_id, signal_name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_threshold_config_signal
  ON threshold_config(domino_id, signal_name);
