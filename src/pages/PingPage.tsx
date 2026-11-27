import { useEffect, useState } from 'react';
import { CheckCircle2, Globe, Home, Loader2, RefreshCw, Store, Building2, Plane } from 'lucide-react';
import { runKeepalive, type KeepaliveResult } from '../lib/keepalive';

const categoryIcons: Record<string, typeof Globe> = {
  'E-shop': Store,
  Company: Building2,
  'Travel Agency': Plane,
};

function getCategoryIcon(category: string) {
  return categoryIcons[category] ?? Globe;
}

export default function PingPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<KeepaliveResult | null>(null);

  const executeRefresh = async () => {
    setLoading(true);
    const next = await runKeepalive();
    setResult(next);
    setLoading(false);
  };

  useEffect(() => {
    void executeRefresh();
  }, []);

  const stats = result?.stats;
  const isHealthy = result?.ok ?? false;
  const lastUpdated = result?.lastPingAt ? new Date(result.lastPingAt) : null;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <div className="h-px bg-gradient-to-r from-cyan-400/0 via-cyan-300/80 to-fuchsia-400/80" />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-fuchsia-900/30 text-fuchsia-400 mb-5">
            <Globe className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Portfolio Overview</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Live snapshot of the websites showcased in this portfolio — e-shops, company sites, travel agencies, and more.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {loading ? (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin shrink-0" />
              ) : isHealthy ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <Globe className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="text-sm text-slate-500">Current status</p>
                <p className="text-xl font-semibold text-white">
                  {loading
                    ? 'Loading portfolio data...'
                    : isHealthy
                      ? 'Portfolio is up to date'
                      : 'Showing cached overview'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void executeRefresh()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-fuchsia-950 hover:text-fuchsia-300 border border-slate-700 hover:border-fuchsia-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-4">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
                <p className="text-3xl font-bold text-white">{stats.totalSites}</p>
                <p className="text-sm text-slate-400 mt-1">Websites in portfolio</p>
              </div>
              <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-6 text-center">
                <p className="text-3xl font-bold text-emerald-400">{stats.activeSites}</p>
                <p className="text-sm text-slate-400 mt-1">Currently online</p>
              </div>
              <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-6 text-center">
                <p className="text-3xl font-bold text-amber-400">{stats.offlineSites}</p>
                <p className="text-sm text-slate-400 mt-1">Archived / offline</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">By category</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(stats.categoryCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, count]) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div
                        key={category}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                      >
                        <div className="p-2 rounded-lg bg-fuchsia-900/30 text-fuchsia-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{category}</p>
                          <p className="text-sm text-slate-500">
                            {count} site{count === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Featured websites</h2>
              <ul className="space-y-2">
                {stats.sites
                  .filter((site) => !site.isDead)
                  .slice(0, 8)
                  .map((site) => (
                    <li key={site.name}>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 hover:border-fuchsia-800/50 hover:bg-slate-900 transition-colors group"
                      >
                        <span className="font-medium text-white group-hover:text-fuchsia-300 transition-colors">
                          {site.name}
                        </span>
                        <span className="text-xs text-slate-500">{site.type.join(' · ')}</span>
                      </a>
                    </li>
                  ))}
              </ul>
              {stats.activeSites > 8 && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                  And {stats.activeSites - 8} more on the main portfolio page.
                </p>
              )}
            </div>
          </>
        ) : !loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center mb-8">
            <p className="text-slate-300">
              Portfolio statistics are not available right now. You can still browse all projects on the main page.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fuchsia-600 px-6 py-3 font-medium text-white transition-colors hover:bg-fuchsia-500"
          >
            <Home className="w-4 h-4" />
            View full portfolio
          </a>
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          Christopher P. Drosos — Software Developer
        </p>
      </div>
    </div>
  );
}
