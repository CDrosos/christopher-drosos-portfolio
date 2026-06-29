import { readFileSync } from 'fs';

const project = JSON.parse(readFileSync('.insforge/project.json', 'utf8'));
const envLocal = readFileSync('.env.local', 'utf8');
const anonKey = envLocal.match(/NEXT_PUBLIC_INSFORGE_ANON_KEY=(.+)/)?.[1]?.trim();
const apiKey = project.api_key;
const base = project.oss_host;

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};

async function deleteSchedule(id) {
  const res = await fetch(`${base}/api/schedules/${id}`, { method: 'DELETE', headers });
  console.log('delete', id, res.status);
}

async function createSchedule(payload) {
  const res = await fetch(`${base}/api/schedules`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('create', payload.name, res.status, text);
  if (!res.ok) process.exit(1);
}

const oldIds = [
  'a67c466b-3e2b-494e-a027-c0ab1f82a7e1',
  '77b62b3b-ab8d-4cb5-a9d2-2fe9e625e060',
];

for (const id of oldIds) {
  await deleteSchedule(id);
}

await createSchedule({
  name: 'daily-backend-health',
  cronSchedule: '0 7 * * *',
  functionUrl: `${base}/api/health`,
  httpMethod: 'GET',
});

await createSchedule({
  name: 'daily-db-keepalive',
  cronSchedule: '0 8 * * *',
  functionUrl: `${base}/api/database/rpc/touch_portfolio`,
  httpMethod: 'POST',
  headers: {
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: { p_source: 'cron' },
});

console.log('Daily schedules created.');
