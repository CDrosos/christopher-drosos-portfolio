-- Run this in InsForge: Database → Database Studio → SQL
-- Creates a small table used by /ping to touch the database each visit.

CREATE TABLE IF NOT EXISTS activity_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'web',
  user_agent TEXT
);

ALTER TABLE activity_pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_pings_anon_insert" ON activity_pings;
DROP POLICY IF EXISTS "activity_pings_anon_select" ON activity_pings;

CREATE POLICY "activity_pings_anon_insert"
  ON activity_pings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "activity_pings_anon_select"
  ON activity_pings
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS activity_pings_pinged_at_idx
  ON activity_pings (pinged_at DESC);
