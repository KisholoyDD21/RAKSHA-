import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStatus, computeConfidence, computePriorityScore, STATUS } from '../services/verification.js';

test('a fresh report with no votes is unverified with neutral 50% confidence', () => {
  const status = computeStatus({ confirms: [], disputes: [], currentStatus: STATUS.UNVERIFIED });
  assert.equal(status, STATUS.UNVERIFIED);
  assert.equal(computeConfidence({ confirms: [], disputes: [] }), 50);
});

test('three net confirms flips status to verified', () => {
  const status = computeStatus({ confirms: ['a', 'b', 'c'], disputes: [], currentStatus: STATUS.UNVERIFIED });
  assert.equal(status, STATUS.VERIFIED);
});

test('two confirms is not yet enough to verify', () => {
  const status = computeStatus({ confirms: ['a', 'b'], disputes: [], currentStatus: STATUS.UNVERIFIED });
  assert.equal(status, STATUS.UNVERIFIED);
});

test('disputes outnumbering confirms (2+) flips status to disputed', () => {
  const status = computeStatus({ confirms: ['a'], disputes: ['x', 'y', 'z'], currentStatus: STATUS.UNVERIFIED });
  assert.equal(status, STATUS.DISPUTED);
});

test('a single dispute alone does not trigger disputed (avoids one troll flipping a report)', () => {
  const status = computeStatus({ confirms: [], disputes: ['x'], currentStatus: STATUS.UNVERIFIED });
  assert.equal(status, STATUS.UNVERIFIED);
});

test('resolved status is sticky regardless of new votes', () => {
  const status = computeStatus({ confirms: [], disputes: ['a', 'b', 'c'], currentStatus: STATUS.RESOLVED });
  assert.equal(status, STATUS.RESOLVED);
});

test('confidence increases monotonically with more confirms', () => {
  const c0 = computeConfidence({ confirms: [], disputes: [] });
  const c1 = computeConfidence({ confirms: ['a'], disputes: [] });
  const c2 = computeConfidence({ confirms: ['a', 'b'], disputes: [] });
  assert.ok(c1 > c0);
  assert.ok(c2 > c1);
});

test('priority score ranks higher severity above lower severity, all else equal', () => {
  const now = new Date().toISOString();
  const low = computePriorityScore({ severity: 1, confirms: [], disputes: [], createdAt: now });
  const high = computePriorityScore({ severity: 5, confirms: [], disputes: [], createdAt: now });
  assert.ok(high > low);
});

test('priority score decays as a report ages', () => {
  const fresh = computePriorityScore({ severity: 3, confirms: [], disputes: [], createdAt: new Date().toISOString() });
  const stale = computePriorityScore({
    severity: 3, confirms: [], disputes: [],
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  });
  assert.ok(fresh > stale);
});
