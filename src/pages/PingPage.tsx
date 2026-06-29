import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Globe, Home, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { daysSince, getLocalLastPing, runKeepalive, type KeepaliveResult } from '../lib/keepalive';
import { isInsforgeConfigured } from '../lib/insforge';

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
  ) : (
    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
  );
}

export default function PingPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<KeepaliveResult | null>(null);
  const localLastPing = getLocalLastPing();
  const daysSinceLastPing = daysSince(result?.lastPingAt ?? localLastPing);

  const executePing = async () => {
    setLoading(true);
    const next = await runKeepalive();
    setResult(next);
    setLoading(false);
  };

  useEffect(() => {
    void executePing();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-cyan-900/30 text-cyan-400">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">InsForge Keepalive</h1>
            <p className="text-slate-400 mt-1">
              This page talks to the InsForge backend and database so the free project stays active.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-900/30 bg-cyan-950/20 p-5 text-sm text-cyan-100/90 mb-6">
          <p className="font-semibold text-cyan-300 mb-2">Why the warning still appeared</p>
          <p className="text-cyan-100/80">
            Opening only the portfolio homepage does not count as backend activity. InsForge pauses free projects after
            ~7 days without API/database usage on <code className="text-cyan-200">*.insforge.app</code>. This page and
            the portfolio now load sites from the database on every visit.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Status</p>
              <p className="text-xl font-semibold text-white mt-1">
                {loading ? 'Running keepalive...' : result?.ok ? 'Backend is active' : 'Action needed'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void executePing()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 border border-slate-700 hover:border-cyan-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Ping again
            </button>
          </div>

          <div className="space-y-3">
            {(result?.steps ?? []).map((step) => (
              <div
                key={step.name}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <StatusIcon ok={step.ok} />
                <div>
                  <p className="font-medium text-white">{step.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{step.detail}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calling backend health, portfolio stats, and database keepalive...</span>
              </div>
            )}
          </div>
        </div>

        {result?.stats && (
          <div className="rounded-2xl border border-fuchsia-900/40 bg-fuchsia-950/20 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-fuchsia-400" />
              <p className="font-semibold text-fuchsia-200">Portfolio database snapshot</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Total sites</p>
                <p className="text-2xl font-bold text-white">{result.stats.totalSites}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Active</p>
                <p className="text-2xl font-bold text-emerald-400">{result.stats.activeSites}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Offline</p>
                <p className="text-2xl font-bold text-amber-400">{result.stats.offlineSites}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.stats.categoryCounts).map(([category, count]) => (
                <span
                  key={category}
                  className="px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-300"
                >
                  {category}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-sm text-slate-500">Last successful ping</p>
            <p className="text-lg font-semibold text-white mt-2">
              {result?.lastPingAt || localLastPing
                ? new Date(result?.lastPingAt ?? localLastPing!).toLocaleString()
                : 'No ping recorded yet'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-sm text-slate-500">Days since last ping</p>
            <p className={`text-lg font-semibold mt-2 ${daysSinceLastPing !== null && daysSinceLastPing >= 6 ? 'text-amber-400' : 'text-white'}`}>
              {daysSinceLastPing === null ? '—' : `${daysSinceLastPing} day${daysSinceLastPing === 1 ? '' : 's'}`}
            </p>
            <p className="text-xs text-slate-500 mt-2">Visit every 5–6 days, or rely on daily auto-pings.</p>
          </div>
        </div>

        {result?.recentPings.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mb-6">
            <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3">Recent pings</p>
            <ul className="space-y-2 text-sm">
              {result.recentPings.map((ping) => (
                <li key={`${ping.pinged_at}-${ping.source}`} className="flex justify-between gap-4 text-slate-300">
                  <span>{new Date(ping.pinged_at).toLocaleString()}</span>
                  <span className="text-slate-500">{ping.source}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!isInsforgeConfigured && (
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 text-sm text-rose-100/90 mb-8">
            Backend env vars are missing from this deployment build. Set deployment env vars and redeploy so this page
            can reach the InsForge API.
          </div>
        )}

        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to portfolio
        </a>
      </div>
    </div>
  );
}
