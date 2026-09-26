// Provides the lightweight REST service used for optional community synchronisation.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4000);
const STORE = process.env.READIS_STORE_PATH || path.join(__dirname, 'data', 'store.json');
const MAX_BODY = 6 * 1024 * 1024;

// Reads the small JSON datastore and returns an empty store if it cannot be loaded.
function readStore() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); }
  catch { return { reports: [], guides: [] }; }
}
// Writes the latest report and guide data back to the JSON datastore.
function writeStore(store) { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(store, null, 2)); }
// Sends a JSON HTTP response with the basic CORS headers used by the prototype.
function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
  res.end(JSON.stringify(data));
}
// Collects and parses a request body while rejecting oversized or invalid JSON.
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > MAX_BODY) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('bad_json')); } });
    req.on('error', reject);
  });
}

// Routes health checks, updates, publishing and vote requests for the prototype API.
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  const store = readStore();
  try {
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, serverTime: Date.now() });
    if (req.method === 'GET' && url.pathname === '/updates') {
      const since = Number(url.searchParams.get('since') || 0);
      return send(res, 200, {
        reports: store.reports.filter(x => Number(x.updatedAt || x.createdAt || 0) > since),
        guides: store.guides.filter(x => Number(x.updatedAt || x.createdAt || 0) > since),
        serverTime: Date.now()
      });
    }
    if (req.method === 'POST' && url.pathname === '/reports') {
      const item = await body(req); item.updatedAt = Date.now();
      const index = store.reports.findIndex(x => x.id === item.id);
      if (index >= 0) store.reports[index] = item; else store.reports.unshift(item);
      writeStore(store); return send(res, 201, item);
    }
    if (req.method === 'POST' && url.pathname === '/guides') {
      const item = await body(req); item.updatedAt = Date.now();
      const index = store.guides.findIndex(x => x.id === item.id);
      if (index >= 0) store.guides[index] = item; else store.guides.unshift(item);
      writeStore(store); return send(res, 201, item);
    }
    let m = url.pathname.match(/^\/reports\/([^/]+)\/upvote$/);
    if (req.method === 'POST' && m) {
      const item = store.reports.find(x => x.id === decodeURIComponent(m[1]));
      if (!item) return send(res, 404, { error: 'not_found' });
      item.votes = Number(item.votes || 0) + 1; item.updatedAt = Date.now(); writeStore(store); return send(res, 200, item);
    }
    m = url.pathname.match(/^\/guides\/([^/]+)\/upvote$/);
    if (req.method === 'POST' && m) {
      const item = store.guides.find(x => x.id === decodeURIComponent(m[1]));
      if (!item) return send(res, 404, { error: 'not_found' });
      item.votes = Number(item.votes || 0) + 1; item.updatedAt = Date.now(); writeStore(store); return send(res, 200, item);
    }
    return send(res, 404, { error: 'not_found' });
  } catch (error) {
    return send(res, error.message === 'too_large' ? 413 : 400, { error: error.message });
  }
});
// Starts the local API so devices on the same network can connect during testing.
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`Readis community API listening on http://0.0.0.0:${PORT}`));
}

module.exports = { server, readStore, writeStore };
