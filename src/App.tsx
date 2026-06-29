import { useState, useEffect } from 'react';
import { Smartphone, Globe, Code2, ExternalLink, Linkedin, Gamepad2, Layers } from 'lucide-react';
import { fallbackWebsites } from './data/fallback-websites';
import { fetchPortfolioSites } from './lib/portfolio-sites';
import { pingBackendFromPortfolio } from './lib/keepalive';
import type { Website } from './types/website';

const apps = [
  {
    title: 'KinoStats',
    desc: 'Statistics for a Keno like game.',
    tech: 'C#, xamarin.android, in-app-purchase, ads, xamarin.essentials, androidx, android-fragments',
    link: 'https://play.google.com/store/apps/details?id=com.cdrosos.kinostats'
  },
  {
    title: 'SUF - Simple Feedback',
    desc: 'Simple customer feedback collection app.',
    tech: 'C#, xamarin.android, sqlite, bar-chart',
    link: 'https://play.google.com/store/apps/details?id=com.cdrosos.simplecustomerfeedback'
  },
  {
    title: 'MyProgress',
    desc: 'Progress Tracking App',
    tech: 'C#, xamarin.android, sqlite, bar-chart, Parse Server, ListView',
    link: 'https://codecanyon.net/item/myprogress-progress-tracking-app-visual-studio-project-for-xamarinandroid-with-parse-server/21060522'
  },
  {
    title: 'Total Share',
    desc: 'Business presentation with feedback form',
    tech: 'C#, xamarin.android, sqlite, bar-chart, Parse Server, ListView',
    link: 'https://codecanyon.net/item/total-share-business-presentation-feedback-form/22025641'
  }
];

const codeExamples = [
  {
    title: 'dotNet_Assignments (GitLab)',
    desc: 'C# Example from 3 month training session in Agile Actors.',
    tech: 'C#, T-SQL, WebAPI, ASP.NET, Testing, Asynchronous programming',
    link: 'https://gitlab.com/CDrosos/dotNet_Assignments'
  },
  {
    title: 'TradingSignals (GitHub)',
    desc: 'Expert Advisor example for use in MetaTrader 4. Including auto-trading bots.',
    tech: 'MQL4, MetaTrader',
    link: 'https://github.com/CDrosos/TradingSignals'
  }
];

const ScreenshotCard = ({ web }: { web: Website }) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (web.isDead) return;
    const timer = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, 38000);
    return () => clearTimeout(timer);
  }, [loaded, web.isDead]);

  const fallbackSrc = `https://www.google.com/s2/favicons?sz=128&domain_url=${web.url}`;

  return (
    <a href={web.url} target="_blank" rel="noreferrer" className="flex flex-col group h-full rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] hover:border-fuchsia-900/50">
      <div className="h-40 w-full relative overflow-hidden bg-slate-950 border-b border-slate-800/50 flex items-center justify-center">
        
        {web.isDead ? (
          <>
            <img 
              src="/hero.png" 
              alt="Offline Preview" 
              className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
              loading="lazy"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-fuchsia-300 transition-colors duration-500">
              <Globe className="w-10 h-10 opacity-80 mb-2 drop-shadow-lg" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 drop-shadow-lg">Offline</span>
            </div>
          </>
        ) : !timedOut ? (
          <img 
            src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(web.url)}?w=600`}
            alt={`${web.name} preview`} 
            className={`w-full h-full object-cover object-top transition-all duration-700 ${loaded ? 'opacity-80 group-hover:opacity-100 group-hover:scale-105' : 'opacity-0'}`} 
            onLoad={() => setLoaded(true)}
            onError={() => setTimedOut(true)}
            loading="lazy"
          />
        ) : (
          <img src={fallbackSrc} alt="fallback logo" className="w-16 h-16 object-contain opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
        )}
        
        {!loaded && !timedOut && !web.isDead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40">
            <div className="w-5 h-5 border-2 border-fuchsia-500/50 border-t-fuchsia-400 rounded-full animate-spin mb-2"></div>
            <span className="text-[10px] font-medium tracking-widest uppercase">Loading</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none"></div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-white group-hover:text-fuchsia-400 transition-colors truncate pr-4">{web.name}</span>
          <ExternalLink className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-fuchsia-400 opacity-50 group-hover:opacity-100 transition-colors" />
        </div>
        <p className="text-sm text-slate-400 mt-2 mb-4 truncate">{web.url.replace(/^https?:\/\/(www\.)?/, '')}</p>
        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <div className="flex flex-wrap gap-2">
            {web.type.map((t, idx) => (
              <span key={idx} className="px-2 py-1 bg-fuchsia-950/40 text-fuchsia-300 border border-fuchsia-900/50 text-[10px] rounded-md font-mono">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
};

const AppCard = ({ app, index }: { app: { title: string, desc: string, tech: string, link: string }, index: number }) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (index >= 2) return; // Only apply dynamic screenshots for the first 2 apps as requested
    const timer = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, 38000);
    return () => clearTimeout(timer);
  }, [loaded, index]);

  const showDynamicScreenshot = index < 2 && !timedOut;
  const imgSrc = showDynamicScreenshot 
    ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(app.link)}?w=600` 
    : "/android.png";

  return (
    <a href={app.link} target="_blank" rel="noreferrer" className="flex flex-col group h-full rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:border-cyan-900/50">
      <div className="h-40 w-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
        <img 
          src={imgSrc} 
          alt={`${app.title} Preview`} 
          className={`w-full h-full object-cover object-top transition-all duration-500 ${(showDynamicScreenshot && !loaded) ? 'opacity-0' : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'}`} 
          onLoad={() => setLoaded(true)}
          onError={() => setTimedOut(true)}
          loading="lazy"
        />
        
        {showDynamicScreenshot && !loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40">
            <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mb-2"></div>
            <span className="text-[10px] font-medium tracking-widest uppercase">Loading</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
      </div>
      <div className="p-8 pt-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{app.title}</h3>
          <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
        <p className="text-slate-400 mb-6">{app.desc}</p>
        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {app.tech.split(', ').map((t, idx) => (
              <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded-md font-mono">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
};

function App() {
  const [websites, setWebsites] = useState<Website[]>(fallbackWebsites);
  const [websiteFilter, setWebsiteFilter] = useState('All');

  useEffect(() => {
    void (async () => {
      await pingBackendFromPortfolio();
      const { sites } = await fetchPortfolioSites();
      setWebsites(sites);
    })();
  }, []);

  const allCategories = ['All', ...Array.from(new Set(websites.flatMap(w => w.type)))].sort();
  const filteredWebsites = websiteFilter === 'All' 
    ? websites 
    : websites.filter(w => w.type.includes(websiteFilter));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0">
          <img src="/hero.png" alt="Hero background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-950/80 to-slate-950"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Christopher P. <span className="text-cyan-400">Drosos</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light mb-10">
            Software Developer specializing in <strong className="text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]">Websites</strong>, <strong className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Android Applications</strong>, and Software Engineering.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.linkedin.com/in/christopher-drosos-88561417" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 transition-all border border-slate-700 hover:border-cyan-800 duration-300">
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn Profile</span>
            </a>
            <a href="https://codecanyon.net/user/c_drosos/portfolio" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 transition-all border border-slate-700 hover:border-cyan-800 duration-300">
              <Code2 className="w-5 h-5" />
              <span>CodeCanyon Profile</span>
            </a>
            <a href="https://play.google.com/store/apps/developer?id=Christopher+Drosos" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 transition-all border border-slate-700 hover:border-cyan-800 duration-300">
              <Gamepad2 className="w-5 h-5" />
              <span>Google Play Free Apps</span>
            </a>
            <a href="https://play.google.com/store/apps/developer?id=Chr.+Drosos" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 transition-all border border-slate-700 hover:border-cyan-800 duration-300">
              <Layers className="w-5 h-5" />
              <span>Google Play Apps w/ Ads</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        
        {/* Android Applications Section */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-cyan-900/30 rounded-lg text-cyan-400">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white">Android Applications</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, i) => (
              <AppCard key={i} app={app} index={i} />
            ))}
          </div>
        </section>

        {/* Websites Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-fuchsia-900/30 rounded-lg text-fuchsia-400">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white">Websites</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setWebsiteFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${websiteFilter === cat ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((web) => (
              <ScreenshotCard key={web.name} web={web} />
            ))}
          </div>
        </section>

        {/* Code Examples Section */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-emerald-900/30 rounded-lg text-emerald-400">
              <Code2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white">Code Examples</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {codeExamples.map((code, i) => (
              <a key={i} href={code.link} target="_blank" rel="noreferrer" className="flex flex-col group h-full rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(52,211,153,0.1)] hover:border-emerald-900/50">
                <div className="h-40 w-full relative overflow-hidden bg-slate-950">
                  <img src="/code.png" alt="Code Example Background" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>
                <div className="p-8 pt-4 flex-1 flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{code.title}</h3>
                     <ExternalLink className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-emerald-400" />
                   </div>
                   <p className="text-slate-400 mb-6">{code.desc}</p>
                   <div className="mt-auto pt-4 border-t border-slate-800/50">
                     <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Technologies</p>
                     <p className="text-sm font-mono text-emerald-400/80 leading-relaxed">{code.tech}</p>
                   </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-12 text-center text-slate-500">
        <p>© {new Date().getFullYear()} Christopher P. Drosos. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
