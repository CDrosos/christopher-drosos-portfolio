import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL as string | undefined;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined;

export const isInsforgeConfigured = Boolean(baseUrl && anonKey);

export function getInsforgeClient() {
  if (!baseUrl || !anonKey) {
    throw new Error('Missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY');
  }

  return createClient({ baseUrl, anonKey });
}

export function getInsforgeBaseUrl() {
  return baseUrl ?? '';
}
