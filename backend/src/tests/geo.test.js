import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistance, pointToSegmentDistance } from '../utils/geo.js';

test('haversineDistance returns ~0 for identical points', () => {
  const p = { lat: 19.076, lng: 72.8777 };
  assert.ok(haversineDistance(p, p) < 1);
});

test('haversineDistance matches a known real-world distance (roughly)', () => {
  // Bandra to Colaba, Mumbai — straight-line distance is approximately 15-17km.
  const bandra = { lat: 19.0596, lng: 72.8295 };
  const colaba = { lat: 18.9067, lng: 72.8147 };
  const d = haversineDistance(bandra, colaba);
  assert.ok(d > 14000 && d < 19000, `expected ~15-17km, got ${Math.round(d / 1000)}km`);
});

test('pointToSegmentDistance is ~0 for a point on the segment', () => {
  const a = { lat: 19.0, lng: 72.8 };
  const b = { lat: 19.1, lng: 72.9 };
  const midpoint = { lat: 19.05, lng: 72.85 };
  const d = pointToSegmentDistance(midpoint, a, b);
  assert.ok(d < 50, `expected near-zero distance, got ${d}m`);
});

test('pointToSegmentDistance grows for a point far off the segment', () => {
  const a = { lat: 19.0, lng: 72.8 };
  const b = { lat: 19.1, lng: 72.8 }; // due-north segment
  const farPoint = { lat: 19.05, lng: 73.0 }; // well to the east
  const d = pointToSegmentDistance(farPoint, a, b);
  assert.ok(d > 15000, `expected a large offset distance, got ${d}m`);
});
