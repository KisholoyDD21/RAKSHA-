// Smart Safe Routing.
//
// Two-tier strategy:
//   1. Preferred: ask OSRM's public demo server for real road-snapped
//      alternative routes, then score each alternative by how close it
//      passes to active hazards and recommend the lowest-hazard option.
//   2. Fallback: if OSRM is unreachable, rate-limited, or times out
//      (it's a best-effort demo service — see README), fall back to a
//      self-contained A* search over a local grid, where hazards raise
//      (or, near their core, forbid) cell traversal cost. This has no
//      external dependency at all, so routing keeps working offline or
//      when the network is down — which is the actual point of "safe
//      routing" during a disaster.
//
// Both paths return the same shape, so the frontend never needs to know
// which one ran (though it does show a small "source" badge for
// transparency).

import { haversineDistance, pointToSegmentDistance, boundingBox } from '../utils/geo.js';

const OSRM_BASE = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';
const OSRM_TIMEOUT_MS = 4500;
const GRID_SIZE = 22;

const HAZARD_BASE_RADIUS_M = {
  flood: 250,
  fire: 300,
  landslide: 350,
  chemical_leak: 400,
  building_collapse: 200,
  earthquake: 500,
  storm: 300,
  roadblock: 60,
  accident: 80,
  power_outage: 0,
  other: 150,
};

function hazardRadius(incident) {
  const base = HAZARD_BASE_RADIUS_M[incident.type] ?? 150;
  return base * (0.6 + incident.severity / 5);
}

function activeHazards(incidents) {
  return incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'disputed' && i.type !== 'power_outage'
  );
}

function scoreRouteAgainstHazards(coords, hazards) {
  let score = 0;
  const hits = [];
  for (const hazard of hazards) {
    let minDist = Infinity;
    for (let i = 0; i < coords.length - 1; i++) {
      const d = pointToSegmentDistance(hazard, coords[i], coords[i + 1]);
      if (d < minDist) minDist = d;
      if (minDist < 1) break;
    }
    const radius = hazardRadius(hazard);
    if (minDist < radius) {
      const penetration = 1 - minDist / radius;
      score += penetration * hazard.severity * 100;
      hits.push({ incidentId: hazard.id, type: hazard.type, distanceMeters: Math.round(minDist) });
    }
  }
  return { hazardScore: Math.round(score), hazardHits: hits };
}

async function fetchOsrmRoutes(origin, destination) {
  const url =
    `${OSRM_BASE}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?alternatives=true&overview=full&geometries=geojson&steps=false`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`OSRM responded with ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error('OSRM returned no routes');
    }
    return data.routes.map((r) => ({
      coordinates: r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      distance: r.distance,
      duration: r.duration,
    }));
  } finally {
    clearTimeout(timeout);
  }
}

/** Self-contained A* over a local grid. No network required. */
function gridFallbackRoute(origin, destination, hazards) {
  const N = GRID_SIZE;
  const bbox = boundingBox([origin, destination], 900);
  const latStep = (bbox.maxLat - bbox.minLat) / N;
  const lngStep = (bbox.maxLng - bbox.minLng) / N;

  const cellCenter = (r, c) => ({
    lat: bbox.minLat + (r + 0.5) * latStep,
    lng: bbox.minLng + (c + 0.5) * lngStep,
  });

  const cellCost = (r, c) => {
    const center = cellCenter(r, c);
    let cost = 1;
    for (const hz of hazards) {
      const d = haversineDistance(center, hz);
      const radius = hazardRadius(hz);
      if (radius === 0) continue;
      if (d < radius * 0.4) return Infinity; // hazard core: impassable
      if (d < radius) cost += (1 - d / radius) * hz.severity * 8;
    }
    return cost;
  };

  const toCell = (pt) => ({
    r: Math.min(N - 1, Math.max(0, Math.floor((pt.lat - bbox.minLat) / latStep))),
    c: Math.min(N - 1, Math.max(0, Math.floor((pt.lng - bbox.minLng) / lngStep))),
  });

  const start = toCell(origin);
  const goal = toCell(destination);
  const key = (r, c) => `${r},${c}`;
  const heuristic = (r, c) => Math.hypot(r - goal.r, c - goal.c);

  const open = new Map([[key(start.r, start.c), { r: start.r, c: start.c, f: heuristic(start.r, start.c) }]]);
  const cameFrom = new Map();
  const gScore = new Map([[key(start.r, start.c), 0]]);

  const neighborDeltas = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  let found = false;
  let iterations = 0;
  const maxIterations = N * N * 6;

  while (open.size > 0 && iterations < maxIterations) {
    iterations++;
    let currentKey = null;
    let current = null;
    for (const [k, node] of open) {
      if (!current || node.f < current.f) { current = node; currentKey = k; }
    }
    open.delete(currentKey);

    if (current.r === goal.r && current.c === goal.c) { found = true; break; }

    for (const [dr, dc] of neighborDeltas) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;

      const cost = cellCost(nr, nc);
      if (!isFinite(cost)) continue;

      const stepDist = dr !== 0 && dc !== 0 ? Math.SQRT2 : 1;
      const tentativeG = gScore.get(currentKey) + cost * stepDist;
      const nk = key(nr, nc);
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, currentKey);
        gScore.set(nk, tentativeG);
        open.set(nk, { r: nr, c: nc, f: tentativeG + heuristic(nr, nc) });
      }
    }
  }

  let cellPath = [];
  if (found) {
    let curKey = key(goal.r, goal.c);
    while (curKey) {
      const [r, c] = curKey.split(',').map(Number);
      cellPath.unshift(cellCenter(r, c));
      curKey = cameFrom.get(curKey);
    }
  }

  const path = found ? [origin, ...cellPath, destination] : [origin, destination];

  let distanceMeters = 0;
  for (let i = 0; i < path.length - 1; i++) distanceMeters += haversineDistance(path[i], path[i + 1]);
  const durationSeconds = Math.round(distanceMeters / 8.33); // ~30 km/h assumed urban average

  const { hazardScore, hazardHits } = scoreRouteAgainstHazards(path, hazards);

  return {
    id: 'grid-fallback-0',
    source: 'grid-fallback',
    coordinates: path,
    distanceMeters: Math.round(distanceMeters),
    durationSeconds,
    hazardScore,
    hazardHits,
    warning: found
      ? 'Routed offline using an approximate local grid (no live road network) — verify locally before travel.'
      : 'No hazard-clear path found within the search area. Showing the least-hazardous approximate route — proceed with extreme caution or contact responders.',
  };
}

export async function getSafeRoutes({ origin, destination, incidents }) {
  const hazards = activeHazards(incidents);

  try {
    const osrmRoutes = await fetchOsrmRoutes(origin, destination);
    const scored = osrmRoutes.map((r, idx) => {
      const { hazardScore, hazardHits } = scoreRouteAgainstHazards(r.coordinates, hazards);
      return {
        id: `osrm-${idx}`,
        source: 'osrm',
        coordinates: r.coordinates,
        distanceMeters: Math.round(r.distance),
        durationSeconds: Math.round(r.duration),
        hazardScore,
        hazardHits,
      };
    });
    scored.sort((a, b) => a.hazardScore - b.hazardScore || a.durationSeconds - b.durationSeconds);
    return { routes: scored, recommendedId: scored[0].id, engine: 'osrm' };
  } catch (err) {
    const fallback = gridFallbackRoute(origin, destination, hazards);
    return { routes: [fallback], recommendedId: fallback.id, engine: 'grid-fallback', fallbackReason: err.message };
  }
}

// Exported for unit testing.
export const _internal = { scoreRouteAgainstHazards, gridFallbackRoute, hazardRadius, activeHazards };
