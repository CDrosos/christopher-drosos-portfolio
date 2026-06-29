import { fallbackWebsites } from '../data/fallback-websites';
import type { Website } from '../types/website';
import { getInsforgeClient, isInsforgeConfigured } from './insforge';

type PortfolioSiteRow = {
  name: string;
  url: string;
  categories: string[];
  is_dead: boolean;
  sort_order: number;
};

function mapRow(row: PortfolioSiteRow): Website {
  return {
    name: row.name,
    url: row.url,
    type: row.categories,
    isDead: row.is_dead || undefined,
  };
}

export async function fetchPortfolioSites(): Promise<{
  sites: Website[];
  source: 'database' | 'fallback';
}> {
  if (!isInsforgeConfigured) {
    return { sites: fallbackWebsites, source: 'fallback' };
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('portfolio_sites')
      .select('name, url, categories, is_dead, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data?.length) {
      return { sites: fallbackWebsites, source: 'fallback' };
    }

    return {
      sites: (data as PortfolioSiteRow[]).map(mapRow),
      source: 'database',
    };
  } catch {
    return { sites: fallbackWebsites, source: 'fallback' };
  }
}

export type PortfolioStats = {
  totalSites: number;
  activeSites: number;
  offlineSites: number;
  categoryCounts: Record<string, number>;
  sites: Website[];
};

export async function fetchPortfolioStats(): Promise<PortfolioStats | null> {
  if (!isInsforgeConfigured) return null;

  const { sites, source } = await fetchPortfolioSites();
  if (source !== 'database') return null;

  const activeSites = sites.filter((site) => !site.isDead).length;
  const categoryCounts: Record<string, number> = {};

  for (const site of sites) {
    for (const category of site.type) {
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    }
  }

  return {
    totalSites: sites.length,
    activeSites,
    offlineSites: sites.length - activeSites,
    categoryCounts,
    sites,
  };
}
