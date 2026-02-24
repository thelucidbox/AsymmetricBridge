-- Migration 004: Digests table for signal digest engine
CREATE TABLE IF NOT EXISTS digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  content_md TEXT,
  threat_level TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  escalation_count INTEGER DEFAULT 0,
  deescalation_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_digests_generated ON digests(generated_at DESC);
