// Defensive API boundary checks for the prototype backend.
// These are not penetration tests; they verify predictable handling of bad input and unsupported requests.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = await mkdtemp(path.join(tmpdir(), 'readis-security-smoke-'));
const storePath = path.join(tmp, 'store.json');
const port = 4700 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${port}`;

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function waitForHealth() {
  for (let i = 0; i < 50; i += 1) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await wait(100);
  }
  throw new Error('backend did not become healthy');
}

const child = spawn(process.execPath, ['backend/server.js'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), READIS_STORE_PATH: storePath },
  stdio: ['ignore', 'pipe', 'pipe']
});

try {
  await waitForHealth();

  let response = await fetch(`${base}/missing-route`);
  assert.equal(response.status, 404, 'unknown route returns 404');

  response = await fetch(`${base}/reports/missing/upvote`, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
  assert.equal(response.status, 404, 'missing report upvote returns 404');

  response = await fetch(`${base}/reports`, { method: 'POST', body: '{bad json', headers: { 'Content-Type': 'application/json' } });
  assert.equal(response.status, 400, 'malformed JSON returns 400');

  response = await fetch(`${base}/reports`, {
    method: 'POST',
    body: JSON.stringify({ id: 'oversize', description: 'x'.repeat(6 * 1024 * 1024 + 20) }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(response.status, 413, 'oversized body returns 413');

  response = await fetch(`${base}/health`, { method: 'OPTIONS' });
  assert.equal(response.status, 204, 'OPTIONS preflight returns 204');

  console.log('PASS security smoke: unsupported routes, bad JSON, oversized body and preflight handling');
} finally {
  child.kill('SIGTERM');
  await wait(100);
  await rm(tmp, { recursive: true, force: true });
}
