import { test } from 'node:test';
import assert from 'node:assert/strict';
import { _internal } from '../services/routingEngine.js';

const { gridFallbackRoute, scoreRouteAgainstHazards } = _internal;

test('grid fallback routes around a severe hazard sitting directly on the straight-line path', () => {
  const origin = { lat: 19.0, lng: 72.8 };
  const destination = { lat: 19.1, lng: 72.9 };
  const hazard = { id: 'test-hazard', type: 'fire', severity: 5, lat: 19.05, lng: 72.85, status: 'verified' };

  const route = gridFallbackRoute(origin, destination, [hazard]);
  const straightLineScore = scoreRouteAgainstHazards([origin, destination], [hazard]).hazardScore;

  assert.ok(route.coordinates.length > 2, 'expected intermediate waypoints, not a straight line through the hazard');
  assert.ok(
    route.hazardScore < straightLineScore,
    `expected routed hazardScore (${route.hazardScore}) below the naive straight-line score (${straightLineScore})`
  );
});

test('grid fallback returns a clean direct route with zero hazard score when nothing is nearby', () => {
  const origin = { lat: 19.0, lng: 72.8 };
  const destination = { lat: 19.02, lng: 72.82 };
  const route = gridFallbackRoute(origin, destination, []);
  assert.equal(route.hazardScore, 0);
  assert.equal(route.hazardHits.length, 0);
});

test('a route further from the hazard scores lower than one that grazes it', () => {
  const hazard = { id: 'h1', type: 'flood', severity: 4, lat: 19.05, lng: 72.85, status: 'verified' };
  const grazing = [{ lat: 19.0, lng: 72.8 }, { lat: 19.051, lng: 72.851 }, { lat: 19.1, lng: 72.9 }];
  const distant = [{ lat: 19.0, lng: 72.8 }, { lat: 19.2, lng: 72.7 }, { lat: 19.1, lng: 72.9 }];

  const grazingScore = scoreRouteAgainstHazards(grazing, [hazard]).hazardScore;
  const distantScore = scoreRouteAgainstHazards(distant, [hazard]).hazardScore;

  assert.ok(distantScore < grazingScore);
});

test('grid fallback never throws, even when the destination sits inside a hazard core', () => {
  const origin = { lat: 19.0, lng: 72.8 };
  const destination = { lat: 19.05, lng: 72.85 };
  const hazard = { id: 'h1', type: 'chemical_leak', severity: 20, lat: destination.lat, lng: destination.lng, status: 'verified' };

  assert.doesNotThrow(() => {
    const route = gridFallbackRoute(origin, destination, [hazard]);
    assert.ok(route.coordinates.length >= 2);
    assert.equal(route.coordinates[route.coordinates.length - 1].lat, destination.lat);
  });
});
