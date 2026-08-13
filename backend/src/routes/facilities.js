import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireLatLng, requireOneOf, clampString, ValidationError } from '../middleware/validate.js';
import { haversineDistance } from '../utils/geo.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const FACILITY_TYPES = ['shelter', 'hospital', 'police', 'fire_station', 'relief_camp', 'resource_point'];
const STATUSES = ['open', 'full', 'closed'];

router.get('/', asyncRoute(async (req, res) => {
  const facilities = await store.readAll('facilities');
  const { lat, lng, type } = req.query;

  let result = facilities;
  if (type) result = result.filter((f) => f.type === type);

  if (lat !== undefined && lng !== undefined) {
    const origin = { lat: Number(lat), lng: Number(lng) };
    result = result
      .map((f) => ({ ...f, distanceMeters: Math.round(haversineDistance(origin, f)) }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  res.json(result);
}));

router.post('/', requireAdmin, asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['type', 'name', 'location']);
  requireOneOf(body.type, FACILITY_TYPES, 'type');
  requireLatLng(body.location, 'location');

  const facility = {
    id: randomUUID(),
    type: body.type,
    name: clampString(body.name, 100, 'name'),
    lat: body.location.lat,
    lng: body.location.lng,
    capacity: Number.isFinite(body.capacity) ? body.capacity : null,
    occupancy: Number.isFinite(body.occupancy) ? body.occupancy : null,
    status: body.status && STATUSES.includes(body.status) ? body.status : 'open',
    phone: clampString(body.phone, 30, 'phone'),
    notes: clampString(body.notes, 300, 'notes'),
    updatedAt: new Date().toISOString(),
  };

  await store.insert('facilities', facility);
  req.app.get('io')?.emit('facilities:changed', { reason: 'created', id: facility.id });
  res.status(201).json(facility);
}));

router.patch('/:id', requireAdmin, asyncRoute(async (req, res) => {
  const { occupancy, status, capacity, notes } = req.body || {};
  const patch = {};
  if (occupancy !== undefined) {
    if (!Number.isFinite(occupancy) || occupancy < 0) throw new ValidationError('occupancy must be a non-negative number');
    patch.occupancy = occupancy;
  }
  if (capacity !== undefined) {
    if (!Number.isFinite(capacity) || capacity < 0) throw new ValidationError('capacity must be a non-negative number');
    patch.capacity = capacity;
  }
  if (status !== undefined) {
    requireOneOf(status, STATUSES, 'status');
    patch.status = status;
  }
  if (notes !== undefined) patch.notes = clampString(notes, 300, 'notes');

  if (Object.keys(patch).length === 0) throw new ValidationError('Provide at least one field to update');

  const updated = await store.update('facilities', req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Facility not found' });

  req.app.get('io')?.emit('facilities:changed', { reason: 'updated', id: updated.id });
  res.json(updated);
}));

export default router;
