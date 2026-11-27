import { useEffect, useState, type ReactNode } from 'react';
import { Smartphone, Globe, Code2, ExternalLink, Linkedin, Gamepad2, Layers, type LucideIcon } from 'lucide-react';
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

const profileLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  {
    href: 'https://www.linkedin.com/in/christopher-drosos-88561417',
    label: 'LinkedIn Profile',
    icon: Linkedin,
  },
  {
    href: 'https://codecanyon.net/user/c_drosos/portfolio',
    label: 'CodeCanyon Profile',
    icon: Code2,
  },
  {
    href: 'https://play.google.com/store/apps/developer?id=Christopher+Drosos',
    label: 'Google Play Free Apps',
    icon: Gamepad2,
  },
  {
    href: 'https://play.google.com/store/apps/developer?id=Chr.+Drosos',
    label: 'Google Play Apps w/ Ads',
    icon: Layers,
  },
];

const navLinks = [
  { href: '#android', label: 'Apps' },
  { href: '#websites', label: 'Sites' },
  { href: '#code', label: 'Code' },
];

const PREVIEW_TIMEOUT_MS = 12000;

type Tone = 'cyan' | 'fuchsia' | 'emerald';

const toneClass: Record<Tone, { card: string; title: string; icon: string; spinner: string; iconWrap: string }> = {
  cyan: {
    card: 'hover:border-cyan-800/80 hover:shadow-[0_20px_50px_-28px_rgba(34,211,238,0.7)]',
    title: 'group-hover:text-cyan-300 group-focus-visible:text-cyan-300',
    icon: 'text-slate-500 group-hover:text-cyan-300 group-focus-visible:text-cyan-300',
    spinner: 'border-cyan-500/40 border-t-cyan-300',
    iconWrap: 'bg-cyan-950/40 text-cyan-300 ring-cyan-800/40',
  },
  fuchsia: {
    card: 'hover:border-fuchsia-800/80 hover:shadow-[0_20px_50px_-28px_rgba(217,70,239,0.65)]',
    title: 'group-hover:text-fuchsia-300 group-focus-visible:text-fuchsia-300',
    icon: 'text-slate-500 group-hover:text-fuchsia-300 group-focus-visible:text-fuchsia-300',
    spinner: 'border-fuchsia-500/40 border-t-fuchsia-300',
    iconWrap: 'bg-fuchsia-950/40 text-fuchsia-300 ring-fuchsia-800/40',
  },
  emerald: {
    card: 'hover:border-emerald-800/80 hover:shadow-[0_20px_50px_-28px_rgba(52,211,153,0.6)]',
    title: 'group-hover:text-emerald-300 group-focus-visible:text-emerald-300',
    icon: 'text-slate-500 group-hover:text-emerald-300 group-focus-visible:text-emerald-300',
    spinner: 'border-emerald-500/40 border-t-emerald-300',
    iconWrap: 'bg-emerald-950/40 text-emerald-300 ring-emerald-800/40',
  },
};

function techItems(tech: string): string[] {
  return tech.split(',').map((item) => item.trim()).filter(Boolean);
}

function displayHost(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function TechChips({ items, className }: { items: string[]; className: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className={`rounded-md px-2 py-1 font-mono text-[11px] leading-none ${className}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProfileLink({ href, label, icon: Icon, compact = false }: { href: string; label: string; icon: LucideIcon; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-700/90 bg-slate-900/80 text-slate-100 transition duration-300 hover:border-cyan-700 hover:bg-cyan-950/50 hover:text-cyan-200 ${compact ? 'px-4 py-2 text-sm' : 'w-full px-5 py-2.5 sm:w-auto'}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}

function SectionHeading({ id, icon: Icon, tone, title, children, className = 'mb-8 sm:mb-10' }: { id: string; icon: LucideIcon; tone: Tone; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className={`rounded-xl p-3 ring-1 ${toneClass[tone].iconWrap}`}>
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </div>
      <div>
        <h2 id={id} className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function PreviewStatus({ tone }: { tone: Tone }) {
  return (
    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/55 text-slate-400">
      <div className={`mb-2 h-5 w-5 animate-spin rounded-full border-2 ${toneClass[tone].spinner}`} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Loading</span>
    </div>
  );
}

const cardClass = (tone: Tone) =>
  `group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-card backdrop-blur-sm motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 ${toneClass[tone].card}`;

const ScreenshotCard = ({ web }: { web: Website }) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (web.isDead) return;
    const timer = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, PREVIEW_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded, web.isDead]);

  const fallbackSrc = `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(web.url)}`;
  const showShot = !web.isDead && !timedOut;

  return (
    <a href={web.url} target="_blank" rel="noreferrer noopener" className={cardClass('fuchsia')}>
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-slate-800/70 bg-slate-950 sm:h-48">
        {web.isDead ? (
          <>
            <img
              src="/hero.png"
              alt=""
              className="h-full w-full object-cover opacity-40 grayscale motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:grayscale-0 motion-safe:group-hover:opacity-70"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 motion-safe:transition motion-safe:duration-500 group-hover:text-fuchsia-200">
              <Globe className="mb-2 h-10 w-10 drop-shadow-lg" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Offline</span>
            </div>
          </>
        ) : showShot ? (
          <img
            src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(web.url)}?w=800`}
            alt={`${web.name} homepage preview`}
            className={`h-full w-full object-cover object-top motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-[1.03] ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setTimedOut(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <img src={fallbackSrc} alt="" className="h-16 w-16 object-contain opacity-60 motion-safe:transition motion-safe:duration-500 group-hover:scale-110 group-hover:opacity-100" />
        )}

        {showShot && !loaded && <PreviewStatus tone="fuchsia" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className={`truncate text-lg font-semibold text-white motion-safe:transition-colors ${toneClass.fuchsia.title}`}>{web.name}</span>
          <ExternalLink className={`mt-1 h-4 w-4 shrink-0 ${toneClass.fuchsia.icon}`} aria-hidden="true" />
        </div>
        {displayHost(web.url).toLowerCase() !== web.name.toLowerCase() && (
          <p className="mt-2 truncate font-mono text-xs text-slate-400">{displayHost(web.url)}</p>
        )}
        <div className="mt-auto border-t border-slate-800/80 pt-4">
          <TechChips items={web.type} className="border border-fuchsia-900/60 bg-fuchsia-950/40 text-fuchsia-200" />
        </div>
      </div>
    </a>
  );
};

const AppCard = ({ app, index }: { app: { title: string; desc: string; tech: string; link: string }; index: number }) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const canTryShot = index < 2;

  useEffect(() => {
    if (!canTryShot) return;
    const timer = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, PREVIEW_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [canTryShot, loaded]);

  const showDynamicScreenshot = canTryShot && !timedOut;
  const imgSrc = showDynamicScreenshot
    ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(app.link)}?w=800`
    : '/android.png';

  return (
    <a href={app.link} target="_blank" rel="noreferrer noopener" className={cardClass('cyan')}>
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-slate-800/70 bg-slate-950 sm:h-48">
        <img
          src={imgSrc}
          alt=""
          className={`h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03] ${showDynamicScreenshot ? 'object-top' : 'object-center'} ${showDynamicScreenshot && !loaded ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setTimedOut(true)}
          loading="lazy"
          decoding="async"
        />
        {showDynamicScreenshot && !loaded && <PreviewStatus tone="cyan" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className={`text-xl font-semibold text-white motion-safe:transition-colors ${toneClass.cyan.title}`}>{app.title}</h3>
          <ExternalLink className={`mt-1 h-4 w-4 shrink-0 ${toneClass.cyan.icon}`} aria-hidden="true" />
        </div>
        <p className="mb-6 text-slate-300">{app.desc}</p>
        <div className="mt-auto border-t border-slate-800/80 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Technologies</p>
          <TechChips items={techItems(app.tech)} className="border border-slate-700/80 bg-slate-800/80 text-slate-200" />
        </div>
      </div>
    </a>
  );
};

const CodeCard = ({ code }: { code: { title: string; desc: string; tech: string; link: string } }) => (
  <a href={code.link} target="_blank" rel="noreferrer noopener" className={cardClass('emerald')}>
    <div className="relative h-44 w-full overflow-hidden border-b border-slate-800/70 bg-slate-950 sm:h-48">
      <img
        src="/code.png"
        alt=""
        className="h-full w-full object-cover opacity-75 motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03] group-hover:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className={`text-xl font-semibold text-white motion-safe:transition-colors ${toneClass.emerald.title}`}>{code.title}</h3>
        <ExternalLink className={`mt-1 h-4 w-4 shrink-0 ${toneClass.emerald.icon}`} aria-hidden="true" />
      </div>
      <p className="mb-6 text-slate-300">{code.desc}</p>
      <div className="mt-auto border-t border-slate-800/80 pt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Technologies</p>
        <TechChips items={techItems(code.tech)} className="border border-emerald-900/50 bg-emerald-950/40 text-emerald-200" />
      </div>
    </div>
  </a>
);

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

  useEffect(() => {
    if (websiteFilter === 'All') return;
    const stillExists = websites.some((site) => site.type.includes(websiteFilter));
    if (!stillExists) setWebsiteFilter('All');
  }, [websites, websiteFilter]);

  const categories = Array.from(new Set(websites.flatMap((site) => site.type))).sort((a, b) => a.localeCompare(b));
  const filteredWebsites = websiteFilter === 'All'
    ? websites
    : websites.filter((site) => site.type.includes(websiteFilter));

  const websiteSummary = websiteFilter === 'All'
    ? `${filteredWebsites.length} websites`
    : `${filteredWebsites.length} in ${websiteFilter}`;

  return (
    <div id="top" className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cyan-300 focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-1.5 text-sm font-bold tracking-tight">
              <span className="text-cyan-300">C</span>
              <span className="text-fuchsia-300">D</span>
            </span>
            <span className="hidden truncate font-semibold text-white sm:block">Christopher Drosos</span>
          </a>
          <nav aria-label="Portfolio sections" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="h-px bg-gradient-to-r from-cyan-400/0 via-cyan-300/80 to-fuchsia-400/80" />
      </header>

      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0">
          <img src="/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="bg-grid absolute inset-0 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(8,47,73,0.55),_rgba(2,6,23,0.88)_55%,_#020617)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/90">Portfolio</p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Christopher P. <span className="text-cyan-300">Drosos</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-slate-300 sm:text-2xl">
            Software Developer specializing in <strong className="font-semibold text-fuchsia-300">Websites</strong>, <strong className="font-semibold text-cyan-300">Android Applications</strong>, and Software Engineering.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            {profileLinks.map((link) => (
              <ProfileLink key={link.href} {...link} />
            ))}
          </div>

          <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3 sm:max-w-2xl sm:gap-4">
            {[
              { value: apps.length, label: 'Android apps' },
              { value: websites.length, label: 'Websites' },
              { value: codeExamples.length, label: 'Code examples' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800/80 bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4">
                <dd className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</dd>
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main id="content" className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:space-y-28 sm:px-6 sm:py-24">
        <section id="android" aria-labelledby="android-heading" className="scroll-mt-24">
          <SectionHeading id="android-heading" icon={Smartphone} tone="cyan" title="Android Applications">
            <p className="mt-1 text-sm text-slate-400">{apps.length} published projects</p>
          </SectionHeading>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {apps.map((app, index) => (
              <AppCard key={app.title} app={app} index={index} />
            ))}
          </div>
        </section>

        <section id="websites" aria-labelledby="websites-heading" className="scroll-mt-24">
          <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="websites-heading" icon={Globe} tone="fuchsia" title="Websites" className="mb-0">
              <p className="mt-1 text-sm text-slate-400">{websiteSummary}</p>
            </SectionHeading>
            <div role="group" aria-label="Filter websites by category" className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
              {['All', ...categories].map((category) => {
                const selected = websiteFilter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setWebsiteFilter(category)}
                    className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition duration-300 ${selected ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow-[0_0_18px_rgba(192,38,211,0.35)]' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredWebsites.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {filteredWebsites.map((web) => (
                <ScreenshotCard key={web.url} web={web} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-10 text-center text-slate-300">
              No websites in this category.
            </p>
          )}
        </section>

        <section id="code" aria-labelledby="code-heading" className="scroll-mt-24">
          <SectionHeading id="code-heading" icon={Code2} tone="emerald" title="Code Examples">
            <p className="mt-1 text-sm text-slate-400">{codeExamples.length} public repositories</p>
          </SectionHeading>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {codeExamples.map((code) => (
              <CodeCard key={code.title} code={code} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {profileLinks.map((link) => (
              <ProfileLink key={link.href} {...link} compact />
            ))}
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Christopher P. Drosos. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
