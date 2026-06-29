CREATE TABLE IF NOT EXISTS activity_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'web',
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS portfolio_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  is_dead BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_pings_anon_insert ON activity_pings;
DROP POLICY IF EXISTS activity_pings_anon_select ON activity_pings;
DROP POLICY IF EXISTS portfolio_sites_anon_select ON portfolio_sites;

CREATE POLICY activity_pings_anon_insert
  ON activity_pings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY activity_pings_anon_select
  ON activity_pings FOR SELECT TO anon USING (true);

CREATE POLICY portfolio_sites_anon_select
  ON portfolio_sites FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS activity_pings_pinged_at_idx ON activity_pings (pinged_at DESC);
CREATE INDEX IF NOT EXISTS portfolio_sites_sort_order_idx ON portfolio_sites (sort_order, name);

CREATE OR REPLACE FUNCTION touch_portfolio(p_source TEXT DEFAULT 'rpc')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count INTEGER;
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM portfolio_sites;
  SELECT COUNT(*) INTO active_count FROM portfolio_sites WHERE NOT is_dead;

  INSERT INTO activity_pings (source, pinged_at)
  VALUES (COALESCE(NULLIF(p_source, ''), 'rpc'), NOW());

  RETURN json_build_object(
    'total_sites', total_count,
    'active_sites', active_count,
    'offline_sites', total_count - active_count,
    'touched_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION touch_portfolio(TEXT) TO anon;
