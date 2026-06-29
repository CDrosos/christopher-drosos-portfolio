import { getInsforgeBaseUrl, getInsforgeClient, isInsforgeConfigured } from './insforge';
import { fetchPortfolioStats, type PortfolioStats } from './portfolio-sites';

export type KeepaliveStep = {
  name: string;
  ok: boolean;
  detail: string;
};

export type KeepaliveResult = {
  ok: boolean;
  steps: KeepaliveStep[];
  lastPingAt: string | null;
  recentPings: Array<{ pinged_at: string; source: string }>;
  stats: PortfolioStats | null;
};

const LOCAL_LAST_PING_KEY = 'insforge-last-keepalive';

export function getLocalLastPing(): string | null {
  return localStorage.getItem(LOCAL_LAST_PING_KEY);
}

export function daysSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function checkHealth(): Promise<KeepaliveStep> {
  const baseUrl = getInsforgeBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (response.status === 503) {
      return {
        name: 'Backend health',
        ok: false,
        detail: 'Project is paused (503). Restore it from the InsForge dashboard, then try again.',
      };
    }

    if (!response.ok) {
      return {
        name: 'Backend health',
        ok: false,
        detail: `Health check failed with HTTP ${response.status}`,
      };
    }

    return {
      name: 'Backend health',
      ok: true,
      detail: 'Backend API is responding',
    };
  } catch (error) {
    return {
      name: 'Backend health',
      ok: false,
      detail: error instanceof Error ? error.message : 'Network error',
    };
  }
}

async function touchPortfolioDatabase(): Promise<{ step: KeepaliveStep; stats: PortfolioStats | null }> {
  const client = getInsforgeClient();
  const now = new Date().toISOString();

  const { data: rpcData, error: rpcError } = await client.database.rpc('touch_portfolio', {
    p_source: 'web',
  });

  if (rpcError) {
    const message = rpcError.message ?? 'Database touch failed';
    const needsSchema = /function|relation|does not exist|permission|policy/i.test(message);

    const { error: insertError } = await client.database.from('activity_pings').insert([
      {
        pinged_at: now,
        source: 'web-fallback',
        user_agent: navigator.userAgent.slice(0, 255),
      },
    ]);

    if (insertError) {
      return {
        step: {
          name: 'Database keepalive',
          ok: false,
          detail: needsSchema
            ? `${message}. Run insforge/schema.sql and insforge/seed-portfolio-sites.sql in Database Studio.`
            : message,
        },
        stats: null,
      };
    }

    localStorage.setItem(LOCAL_LAST_PING_KEY, now);
    const stats = await fetchPortfolioStats();

    return {
      step: {
        name: 'Database keepalive',
        ok: true,
        detail: stats
          ? `Fallback ping recorded. Loaded ${stats.totalSites} portfolio sites from database.`
          : 'Fallback ping recorded.',
      },
      stats,
    };
  }

  localStorage.setItem(LOCAL_LAST_PING_KEY, now);

  const payload = rpcData as {
    total_sites?: number;
    active_sites?: number;
    offline_sites?: number;
    touched_at?: string;
  };

  const stats = await fetchPortfolioStats();

  return {
    step: {
      name: 'Database keepalive',
      ok: true,
      detail: `Touched database: ${payload.total_sites ?? stats?.totalSites ?? 0} sites (${payload.active_sites ?? stats?.activeSites ?? 0} active, ${payload.offline_sites ?? stats?.offlineSites ?? 0} offline).`,
    },
    stats,
  };
}

async function readRecentPings(): Promise<Array<{ pinged_at: string; source: string }>> {
  const client = getInsforgeClient();

  const { data, error } = await client.database
    .from('activity_pings')
    .select('pinged_at, source')
    .order('pinged_at', { ascending: false })
    .limit(8);

  if (error || !data) return [];
  return data as Array<{ pinged_at: string; source: string }>;
}

export async function runKeepalive(): Promise<KeepaliveResult> {
  if (!isInsforgeConfigured) {
    return {
      ok: false,
      steps: [
        {
          name: 'Configuration',
          ok: false,
          detail: 'Backend env vars missing in this build. Redeploy with VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY.',
        },
      ],
      lastPingAt: getLocalLastPing(),
      recentPings: [],
      stats: null,
    };
  }

  const steps: KeepaliveStep[] = [];
  const health = await checkHealth();
  steps.push(health);

  let stats: PortfolioStats | null = null;

  if (health.ok) {
    const touch = await touchPortfolioDatabase();
    steps.push(touch.step);
    stats = touch.stats;
  } else {
    steps.push({
      name: 'Database keepalive',
      ok: false,
      detail: 'Skipped because the backend is not active.',
    });
  }

  const recentPings = health.ok ? await readRecentPings() : [];
  const lastPingAt = recentPings[0]?.pinged_at ?? getLocalLastPing();

  return {
    ok: steps.every((step) => step.ok),
    steps,
    lastPingAt,
    recentPings,
    stats,
  };
}

export async function pingBackendFromPortfolio(): Promise<void> {
  if (!isInsforgeConfigured) return;

  try {
    const client = getInsforgeClient();
    await Promise.all([
      fetch(`${getInsforgeBaseUrl()}/api/health`, { cache: 'no-store' }),
      client.database.from('portfolio_sites').select('id', { count: 'exact', head: true }),
    ]);
  } catch {
    // Portfolio should still render from fallback data.
  }
}
