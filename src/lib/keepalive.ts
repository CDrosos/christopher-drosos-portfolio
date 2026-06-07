import { getInsforgeBaseUrl, getInsforgeClient, isInsforgeConfigured } from './insforge';

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
      detail: 'Backend is responding',
    };
  } catch (error) {
    return {
      name: 'Backend health',
      ok: false,
      detail: error instanceof Error ? error.message : 'Network error',
    };
  }
}

async function writePing(): Promise<KeepaliveStep> {
  const client = getInsforgeClient();
  const now = new Date().toISOString();

  const { error } = await client.database.from('activity_pings').insert([
    {
      pinged_at: now,
      source: 'web',
      user_agent: navigator.userAgent.slice(0, 255),
    },
  ]);

  if (error) {
    const message = error.message ?? 'Database write failed';
    const needsSchema = /relation|does not exist|permission|policy/i.test(message);

    return {
      name: 'Database ping',
      ok: false,
      detail: needsSchema
        ? `${message}. Run insforge/schema.sql in Database Studio after restoring the project.`
        : message,
    };
  }

  localStorage.setItem(LOCAL_LAST_PING_KEY, now);

  return {
    name: 'Database ping',
    ok: true,
    detail: `Recorded keepalive at ${new Date(now).toLocaleString()}`,
  };
}

async function readRecentPings(): Promise<Array<{ pinged_at: string; source: string }>> {
  const client = getInsforgeClient();

  const { data, error } = await client.database
    .from('activity_pings')
    .select('pinged_at, source')
    .order('pinged_at', { ascending: false })
    .limit(5);

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
          detail: 'Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your .env file.',
        },
      ],
      lastPingAt: getLocalLastPing(),
      recentPings: [],
    };
  }

  const steps: KeepaliveStep[] = [];
  const health = await checkHealth();
  steps.push(health);

  if (health.ok) {
    steps.push(await writePing());
  } else {
    steps.push({
      name: 'Database ping',
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
  };
}
