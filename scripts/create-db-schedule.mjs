import { readFileSync } from 'fs';

const project = JSON.parse(readFileSync('.insforge/project.json', 'utf8'));
const envLocal = readFileSync('.env.local', 'utf8');
const anonKey = envLocal.match(/NEXT_PUBLIC_INSFORGE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!anonKey) {
  throw new Error('Missing anon key in .env.local');
}

const payload = {
  name: 'weekly-db-keepalive',
  cronSchedule: '0 9 * * 1',
  functionUrl: `${project.oss_host}/api/database/records/activity_pings`,
  httpMethod: 'POST',
  headers: {
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  },
  body: { source: 'cron' },
};

const res = await fetch(`${project.oss_host}/api/schedules`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${project.api_key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log(res.status, text);
if (!res.ok) process.exit(1);
