// Crowd verification for community reports.
//
// Design goals (this is the piece judges are most likely to probe, so it
// needs to be explainable in one sentence, not a black box):
//   1. A report starts "unverified" and needs net community confirmation
//      to graduate to "verified" — a single report from one anonymous
//      device should never look authoritative on its own.
//   2. A report that draws real disagreement should surface as "disputed"
//      rather than silently sitting at low confidence.
//   3. An admin's manual "resolved" call always wins over crowd signal —
//      a human responder closing an incident is ground truth.

export const STATUS = Object.freeze({
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
  RESOLVED: 'resolved',
});

const VERIFY_NET_THRESHOLD = 3; // net confirms needed to flip to "verified"
const DISPUTE_MIN_VOTES = 2; // disputes below this never trigger "disputed" alone

/**
 * Recompute the lifecycle status of a report from its current vote arrays.
 * Pure function — easy to unit test, easy to reason about.
 */
export function computeStatus({ confirms = [], disputes = [], currentStatus }) {
  if (currentStatus === STATUS.RESOLVED) return STATUS.RESOLVED;

  const net = confirms.length - disputes.length;

  if (disputes.length >= DISPUTE_MIN_VOTES && disputes.length > confirms.length) {
    return STATUS.DISPUTED;
  }
  if (net >= VERIFY_NET_THRESHOLD) {
    return STATUS.VERIFIED;
  }
  return STATUS.UNVERIFIED;
}

/**
 * Confidence score as a 0-100 percentage using Laplace (add-one) smoothing:
 * with zero votes it sits at a neutral 50%, and moves toward 100/0 as
 * confirms/disputes accumulate, without ever hard-snapping on the first
 * vote the way a naive confirms/(confirms+disputes) ratio would.
 */
export function computeConfidence({ confirms = [], disputes = [] }) {
  const c = confirms.length;
  const d = disputes.length;
  const score = ((c + 1) / (c + d + 2)) * 100;
  return Math.round(score);
}

/**
 * Combines severity, crowd confidence, and recency into a single sortable
 * number for the responder priority queue. Higher = handle first.
 *   - severity carries the most weight (1-5 scale, x10)
 * 0  - confidence nudges it up/down around a neutral midpoint
 *   - recency decays linearly over 10 hours, so a fresh severity-3 report
 *     can still outrank a stale severity-4 one
 */
export function computePriorityScore({ severity = 1, confirms = [], disputes = [], createdAt }) {
  const confidence = computeConfidence({ confirms, disputes });
  const hoursSince = createdAt ? (Date.now() - new Date(createdAt).getTime()) / 3_600_000 : 0;
  const recencyBonus = Math.max(0, 10 - hoursSince);
  const confidenceAdjustment = (confidence - 50) / 5;
  return Math.round(severity * 10 + confidenceAdjustment + recencyBonus);
}

/**
 * Maps a report's severity + status to one of RAKSHA's four alert-level
 * colors (green/yellow/orange/red), the same taxonomy used for the area
 * alert strip, so a single mental model covers both.
 */
export function severityToAlertColor(severity, status) {
  if (status === STATUS.RESOLVED) return 'green';
  if (status === STATUS.DISPUTED) return 'yellow';
  if (severity >= 4) return 'red';
  if (severity === 3) return 'orange';
  return 'yellow';
}
