// Dependency-free API smoke tests for the optional Readis community backend.
// Starts the local backend on a temporary port and validates publish/update/vote flow.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = await mkdtemp(path.join(tmpdir(), 'readis-api-smoke-'));
const storePath = path.join(tmp, 'store.json');
const port = 4100 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${port}`;

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function waitForHealth() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return;
    } catch {}
    await wait(100);
  }
  throw new Error('backend did not become healthy');
}
async function json(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const child = spawn(process.execPath, ['backend/server.js'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), READIS_STORE_PATH: storePath },
  stdio: ['ignore', 'pipe', 'pipe']
});

try {
  await waitForHealth();
  let result = await json('/health');
  assert.equal(result.response.status, 200, 'health returns 200');
  assert.equal(result.body.ok, true, 'health payload is ok');

  const report = {
    id: 'api-smoke-report',
    type: 'Flood',
    area: 'East',
    address: 'Tampines Ave 5',
    description: 'Seeded smoke-test report',
    latitude: 1.353,
    longitude: 103.944,
    votes: 0,
    createdAt: 1
  };
  result = await json('/reports', { method: 'POST', body: JSON.stringify(report) });
  assert.equal(result.response.status, 201, 'POST /reports returns 201');
  assert.equal(result.body.id, report.id, 'created report ID is preserved');
  assert.ok(Number.isFinite(result.body.updatedAt), 'report updatedAt is added');

  result = await json('/updates?since=0');
  assert.equal(result.response.status, 200, 'GET /updates returns 200');
  assert.equal(result.body.reports.some((item) => item.id === report.id), true, 'created report appears in updates');

  result = await json('/reports/api-smoke-report/upvote', { method: 'POST', body: '{}' });
  assert.equal(result.response.status, 200, 'report upvote returns 200');
  assert.equal(result.body.votes, 1, 'report vote increments');

  const guide = {
    id: 'api-smoke-guide',
    category: 'community',
    title: 'Seeded Smoke Guide',
    type: 'Flood',
    summary: 'Guide seeded by API smoke test',
    contentBlocks: [{ id: 'b1', type: 'text', text: 'Stay away from flooded paths.' }],
    quiz: [{ id: 'q1', question: 'What should you avoid?', options: ['Flood water', 'Shelter'], answerIndex: 0 }],
    votes: 0,
    createdAt: 1
  };
  result = await json('/guides', { method: 'POST', body: JSON.stringify(guide) });
  assert.equal(result.response.status, 201, 'POST /guides returns 201');
  assert.equal(result.body.id, guide.id, 'created guide ID is preserved');

  result = await json('/guides/api-smoke-guide/upvote', { method: 'POST', body: '{}' });
  assert.equal(result.response.status, 200, 'guide upvote returns 200');
  assert.equal(result.body.votes, 1, 'guide vote increments');

  const stored = JSON.parse(await readFile(storePath, 'utf8'));
  assert.equal(stored.reports.length, 1, 'temporary store contains one report');
  assert.equal(stored.guides.length, 1, 'temporary store contains one guide');
  console.log('PASS api smoke: health, reports, updates, guide publish and votes');
} finally {
  child.kill('SIGTERM');
  await wait(100);
  await rm(tmp, { recursive: true, force: true });
}
