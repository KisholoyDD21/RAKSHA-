// Small, dependency-free geospatial helpers. A library like turf.js could
// do all of this, but the routing engine only needs three primitives
// (distance, point-to-segment distance, destination point), so hand-rolling
// them keeps the dependency list short and the math auditable.

const EARTH_RADIUS_M = 6_371_000;

export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two {lat,lng} points, in meters. */
export function haversineDistance(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

/**
 * Approximate shortest distance (meters) from point p to the segment a-b.
 * Projects onto an equirectangular local plane around the segment, which
 * is accurate enough at city scale (a few tens of km) without dragging in
 * a full geodesy library.
 */
export function pointToSegmentDistance(p, a, b) {
  const latRef = toRad(a.lat);
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos(latRef);

  const toXY = (pt) => ({
    x: (pt.lng - a.lng) * mPerDegLng,
    y: (pt.lat - a.lat) * mPerDegLat,
  });

  const P = toXY(p);
  const A = { x: 0, y: 0 };
  const B = toXY(b);

  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const lenSq = ABx * ABx + ABy * ABy;

  let t = lenSq === 0 ? 0 : ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closest = { x: A.x + t * ABx, y: A.y + t * ABy };
  const dx = P.x - closest.x;
  const dy = P.y - closest.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Bounding box around a set of {lat,lng} points, padded by paddingMeters. */
export function boundingBox(points, paddingMeters = 500) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const latPad = paddingMeters / 111_320;
  const lngPad = paddingMeters / (111_320 * Math.cos(toRad(lats[0])));
  return {
    minLat: Math.min(...lats) - latPad,
    maxLat: Math.max(...lats) + latPad,
    minLng: Math.min(...lngs) - lngPad,
    maxLng: Math.max(...lngs) + lngPad,
  };
}
