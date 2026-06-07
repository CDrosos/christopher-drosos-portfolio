import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Home, Loader2, RefreshCw, XCircle } from 'lucide-react';
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
              Visit this page once a week so your free InsForge project stays active.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Status</p>
              <p className="text-xl font-semibold text-white mt-1">
                {loading ? 'Running keepalive...' : result?.ok ? 'Project is active' : 'Action needed'}
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
                <span>Contacting InsForge backend and database...</span>
              </div>
            )}
          </div>
        </div>

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
            <p className="text-xs text-slate-500 mt-2">Free projects pause after ~7 days of inactivity.</p>
          </div>
        </div>

        {result?.recentPings.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mb-6">
            <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3">Recent pings</p>
            <ul className="space-y-2 text-sm">
              {result.recentPings.map((ping) => (
                <li key={ping.pinged_at} className="flex justify-between gap-4 text-slate-300">
                  <span>{new Date(ping.pinged_at).toLocaleString()}</span>
                  <span className="text-slate-500">{ping.source}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5 text-sm text-amber-100/90 mb-8">
          <p className="font-semibold text-amber-300 mb-2">If the project is paused</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-100/80">
            <li>Open your <a className="underline hover:text-white" href="https://insforge.dev/dashboard/project/a4284b91-72a3-4e56-a2a3-768a510d8051" target="_blank" rel="noreferrer">InsForge dashboard</a> if the project shows as paused.</li>
            <li>Run the SQL in <code className="text-amber-200">insforge/schema.sql</code> via Database Studio.</li>
            <li>Set <code className="text-amber-200">VITE_INSFORGE_URL</code> and <code className="text-amber-200">VITE_INSFORGE_ANON_KEY</code> in <code className="text-amber-200">.env</code>.</li>
            <li>Reload this page to record a new keepalive ping.</li>
          </ol>
        </div>

        {!isInsforgeConfigured && (
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 text-sm text-rose-100/90 mb-8">
            InsForge environment variables are not configured. Copy <code className="text-rose-200">.env.example</code> to <code className="text-rose-200">.env</code> and fill in your project URL and anon key from the InsForge dashboard.
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
