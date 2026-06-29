import { readFileSync } from 'fs';

const project = JSON.parse(readFileSync('.insforge/project.json', 'utf8'));

async function runSql(label, sql) {
  const res = await fetch(`${project.oss_host}/api/database/advance/rawsql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${project.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  console.log(`${label}:`, res.status, text.slice(0, 200));
  if (!res.ok) throw new Error(`Failed SQL: ${label}`);
}

await runSql('schema', readFileSync('insforge/schema.sql', 'utf8'));
await runSql('seed', readFileSync('insforge/seed-portfolio-sites.sql', 'utf8'));
console.log('Database schema and seed applied.');
