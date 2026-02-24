-- Migration 006: Auth + Row Level Security
-- Adds user_id isolation for multi-user Supabase deployments
-- Backward compatible: existing data keeps user_id = 'personal'
-- Personal mode (no auth) continues to work via COALESCE fallback

-- ============================================================
-- 1. Add user_id columns to per-user tables
-- ============================================================

-- signal_statuses: per-user signal tracking
ALTER TABLE signal_statuses
  ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'personal';

-- Update unique constraint to include user_id
ALTER TABLE signal_statuses
  DROP CONSTRAINT IF EXISTS signal_statuses_domino_id_signal_name_key;
ALTER TABLE signal_statuses
  ADD CONSTRAINT signal_statuses_user_domino_signal_key
  UNIQUE (user_id, domino_id, signal_name);

-- signal_history: per-user audit trail
ALTER TABLE signal_history
  ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'personal';

-- digests: per-user generated digests
ALTER TABLE digests
  ADD COLUMN IF NOT EXISTS user_id text NOT NULL DEFAULT 'personal';

-- Indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_signal_statuses_user ON signal_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_history_user ON signal_history(user_id);
CREATE INDEX IF NOT EXISTS idx_digests_user ON digests(user_id);

-- ============================================================
-- 2. Enable Row Level Security on ALL tables
-- ============================================================

ALTER TABLE signal_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE threshold_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS Policies — Per-user tables
-- COALESCE(auth.uid()::text, 'personal') means:
--   - Authenticated user → uses their UUID
--   - Unauthenticated (anon key) → defaults to 'personal'
-- ============================================================

-- signal_statuses
CREATE POLICY "Users read own signal statuses"
  ON signal_statuses FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users insert own signal statuses"
  ON signal_statuses FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users update own signal statuses"
  ON signal_statuses FOR UPDATE
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users delete own signal statuses"
  ON signal_statuses FOR DELETE
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

-- signal_history
CREATE POLICY "Users read own signal history"
  ON signal_history FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users insert own signal history"
  ON signal_history FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'personal'));

-- predictions (already has user_id column)
CREATE POLICY "Users read own predictions"
  ON predictions FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users update own predictions"
  ON predictions FOR UPDATE
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

-- portfolio_snapshots (already has user_id column)
CREATE POLICY "Users read own portfolio snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users insert own portfolio snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'personal'));

-- digests
CREATE POLICY "Users read own digests"
  ON digests FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, 'personal'));

CREATE POLICY "Users insert own digests"
  ON digests FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'personal'));

-- ============================================================
-- 4. RLS Policies — Shared tables (read/write by all)
-- These contain public API data or system configuration
-- ============================================================

-- signal_data_points (live API data, shared across users)
CREATE POLICY "Anyone can read signal data points"
  ON signal_data_points FOR SELECT USING (true);

CREATE POLICY "Anyone can insert signal data points"
  ON signal_data_points FOR INSERT WITH CHECK (true);

-- live_data_cache (API response cache, shared)
CREATE POLICY "Anyone can read live data cache"
  ON live_data_cache FOR SELECT USING (true);

CREATE POLICY "Anyone can insert live data cache"
  ON live_data_cache FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update live data cache"
  ON live_data_cache FOR UPDATE USING (true);

-- assessments (system-level analysis, shared)
CREATE POLICY "Anyone can read assessments"
  ON assessments FOR SELECT USING (true);

CREATE POLICY "Anyone can manage assessments"
  ON assessments FOR ALL USING (true);

-- threshold_config (shared signal configuration)
CREATE POLICY "Anyone can read threshold config"
  ON threshold_config FOR SELECT USING (true);

CREATE POLICY "Anyone can manage threshold config"
  ON threshold_config FOR ALL USING (true);
