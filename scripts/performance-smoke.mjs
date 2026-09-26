// Lightweight performance smoke checks for pure Readis utility logic.
// These are bounded sanity checks, not formal device, battery or production load tests.
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { filterReports } from '../src/utils/reportUtils.js';
import { haversineDistanceKm } from '../src/utils/distanceUtils.js';
import { calculateReadinessBreakdown } from '../src/utils/guideUtils.js';

function time(label, fn, maxMs) {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  assert.ok(elapsed <= maxMs, `${label} took ${elapsed.toFixed(2)}ms, above ${maxMs}ms threshold`);
  console.log(`PASS ${label}: ${elapsed.toFixed(2)}ms <= ${maxMs}ms`);
  return result;
}

const areas = ['East', 'West', 'North', 'South', 'Central'];
const types = ['Flood', 'Fire', 'Storm', 'Power Outage'];
const reports = Array.from({ length: 2000 }, (_, i) => ({
  id: `r-${i}`,
  area: areas[i % areas.length],
  type: types[i % types.length],
  location: `Block ${i} Tampines`,
  description: i % 3 === 0 ? 'Water on path' : 'Routine report',
  postalCode: String(520000 + i),
  createdAt: i
}));

const filtered = time('filter 2,000 reports by area/type/search', () => filterReports({ reports, selectedArea: 'East', selectedType: 'Flood', searchText: 'water' }), 250);
assert.ok(filtered.length > 0, 'filter returns matching reports');

const distanceTotal = time('calculate 25,000 Haversine distances', () => {
  let total = 0;
  for (let i = 0; i < 25000; i += 1) {
    total += haversineDistanceKm({ latitude: 1.3 + i * 0.000001, longitude: 103.8 }, { latitude: 1.35, longitude: 103.9 });
  }
  return total;
}, 250);
assert.ok(distanceTotal > 0, 'distance total is positive');

const guides = Array.from({ length: 1000 }, (_, i) => ({ id: `g-${i}`, category: i % 2 === 0 ? 'team' : 'community', type: types[i % types.length] }));
const progress = Object.fromEntries(guides.map((guide, i) => [guide.id, { score: i % 3, totalQuestions: 3, pointsEarned: i % 2 === 0 ? 40 : 20 }]));
const readiness = time('calculate readiness over 1,000 guides', () => calculateReadinessBreakdown(progress, guides), 250);
assert.ok(readiness.readinessScore >= 0 && readiness.readinessScore <= 100, 'readiness stays within 0-100');

console.log('PASS performance smoke: utility-level timing checks completed');
