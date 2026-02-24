-- Migration 002: Predictions table for conviction ledger
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'personal',
  signal_id UUID REFERENCES signal_statuses(id),
  type TEXT NOT NULL CHECK (type IN ('threshold', 'direction', 'range')),
  condition JSONB NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  scored_at TIMESTAMPTZ,
  outcome TEXT CHECK (outcome IS NULL OR outcome IN ('hit', 'miss', 'partial')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_signal ON predictions(signal_id);
