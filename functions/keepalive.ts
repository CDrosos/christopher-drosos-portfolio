/**
 * InsForge edge function (Deno). Deployed on InsForge, not as a Cloudflare
 * Pages Function — the portfolio Worker only proxies /ping here.
 * Keep-alive for InsForge Free-tier pause prevention.
 * UptimeRobot does not execute JS — this endpoint must do real backend work on GET.
 */
import { createClient } from 'npm:@insforge/sdk';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

type CheckResult = { name: string; ok: boolean; detail?: string; ms: number };

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; error?: string; ms: number }> {
  const start = Date.now();
  try {
    return { value: await fn(), ms: Date.now() - start };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), ms: Date.now() - start };
  }
}

function resolveSource(req: Request, url: URL): string {
  const q = url.searchParams.get('source');
  if (q) return q;
  const header = req.headers.get('x-keepalive-source');
  if (header) return header;
  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  if (ua.includes('uptimerobot')) return 'uptimerobot';
  if (ua.includes('github')) return 'github-actions';
  if (ua.includes('vercel')) return 'vercel-rewrite';
  return 'http';
}

function wantsJson(req: Request, url: URL): boolean {
  if (url.searchParams.get('format') === 'json') return true;
  const accept = req.headers.get('accept') || '';
  return accept.includes('application/json') && !accept.includes('text/html');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderHtml(payload: Record<string, unknown>, checks: CheckResult[]): Response {
  const ok = payload.ok === true;
  const rows = checks
    .map(
      (c) =>
        `<tr>
          <td>${escapeHtml(c.name)}</td>
          <td style="color:${c.ok ? '#34d399' : '#f87171'}">${c.ok ? 'OK' : 'FAIL'}</td>
          <td>${escapeHtml(c.detail || '')}</td>
          <td>${c.ms}ms</td>
        </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio Keep-Alive</title>
  <style>
    body { margin:0; min-height:100vh; font-family: ui-sans-serif, system-ui, sans-serif;
      background:#020617; color:#e2e8f0; }
    main { max-width:760px; margin:0 auto; padding:2.5rem 1.25rem 3rem; }
    h1 { font-size:1.75rem; margin:0 0 .5rem; color:#fff; }
    .status { display:inline-block; margin:1rem 0; padding:.35rem .8rem; border-radius:999px;
      font-weight:700; letter-spacing:.04em;
      background:${ok ? '#064e3b' : '#7f1d1d'}; color:${ok ? '#6ee7b7' : '#fecaca'}; }
    .meta { line-height:1.7; margin-bottom:1.5rem; color:#94a3b8; }
    .meta strong { color:#f8fafc; }
    table { width:100%; border-collapse:collapse; background:rgba(15,23,42,.7); border-radius:12px; overflow:hidden; }
    th, td { text-align:left; padding:.65rem .75rem; border-bottom:1px solid #1e293b; font-size:.95rem; }
    th { font-size:.75rem; text-transform:uppercase; letter-spacing:.06em; color:#64748b; }
    .hint { margin-top:1.75rem; font-size:.88rem; color:#64748b; line-height:1.55; }
    code { background:#0f172a; padding:.1rem .35rem; border-radius:4px; color:#cbd5e1; }
  </style>
</head>
<body>
  <main>
    <h1>Christopher Drosos · Keep-Alive</h1>
    <div class="status">${ok ? 'LIVE' : 'DEGRADED'}</div>
    <div class="meta">
      <div>Sites: <strong>${escapeHtml(String(payload.total_sites ?? '—'))}</strong>
        (<strong>${escapeHtml(String(payload.active_sites ?? '—'))}</strong> active /
         <strong>${escapeHtml(String(payload.offline_sites ?? '—'))}</strong> offline)</div>
      <div>Source: <strong>${escapeHtml(String(payload.source ?? '—'))}</strong></div>
      <div>Touched at: <strong>${escapeHtml(String(payload.touched_at ?? '—'))}</strong></div>
    </div>
    <table>
      <thead><tr><th>Check</th><th>Status</th><th>Detail</th><th>Time</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="hint">
      This endpoint hits InsForge health + database so Free-tier inactivity pause does not trigger.
      Point UptimeRobot at <code>/ping</code> or
      <code>https://t75mmygz.eu-central.insforge.app/functions/keepalive</code> at least once per day.
      If the project is already paused, restore it from the InsForge dashboard — pings cannot unpause it.
    </p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: ok ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const source = resolveSource(req, url);
  const baseUrl = Deno.env.get('INSFORGE_BASE_URL') || Deno.env.get('INSFORGE_INTERNAL_URL');
  const anonKey = Deno.env.get('ANON_KEY');

  const checks: CheckResult[] = [];
  let touch: Record<string, unknown> | null = null;

  {
    const result = await timed(async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      if (!res.ok) throw new Error(`health HTTP ${res.status}`);
      return await res.json();
    });
    checks.push({
      name: 'api_health',
      ok: !result.error,
      detail: result.error || result.value?.status || 'ok',
      ms: result.ms,
    });
  }

  if (baseUrl && anonKey) {
    const client = createClient({ baseUrl, anonKey });
    const result = await timed(async () => {
      const { data, error } = await client.database.rpc('touch_portfolio', {
        p_source: source,
      });
      if (error) throw new Error(error.message || String(error));
      return data as Record<string, unknown>;
    });
    touch = result.value || null;
    checks.push({
      name: 'touch_portfolio',
      ok: !result.error && !!result.value,
      detail: result.error || `sites=${result.value?.total_sites}`,
      ms: result.ms,
    });
  } else {
    checks.push({
      name: 'touch_portfolio',
      ok: false,
      detail: 'Missing INSFORGE_BASE_URL or ANON_KEY',
      ms: 0,
    });
  }

  const allOk = checks.every((c) => c.ok);
  const payload = {
    ok: allOk,
    service: 'portfolio-keepalive',
    source,
    total_sites: touch?.total_sites ?? null,
    active_sites: touch?.active_sites ?? null,
    offline_sites: touch?.offline_sites ?? null,
    touched_at: touch?.touched_at ?? new Date().toISOString(),
    checks,
  };

  if (wantsJson(req, url)) {
    return new Response(JSON.stringify(payload, null, 2), {
      status: allOk ? 200 : 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return renderHtml(payload, checks);
}
