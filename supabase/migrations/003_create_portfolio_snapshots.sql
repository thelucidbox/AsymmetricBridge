-- Migration 003: Portfolio snapshots for Performance Lab
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'personal',
  captured_at TIMESTAMPTZ DEFAULT now(),
  source_format TEXT,
  positions JSONB NOT NULL,
  leg_breakdown JSONB,
  alignment_score NUMERIC,
  summary JSONB
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_snapshots(user_id);
