import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireLatLng, requireOneOf, clampString } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const SOS_TYPES = ['medical', 'fire', 'flood', 'trapped', 'violence', 'accident', 'other'];
const STATUSES = ['active', 'responding', 'resolved'];

router.get('/', asyncRoute(async (req, res) => {
  const records = await store.readAll('sos');
  res.json(records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}));

router.post('/', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['type', 'location', 'userId']);
  requireOneOf(body.type, SOS_TYPES, 'type');
  requireLatLng(body.location, 'location');

  const record = {
    id: randomUUID(),
    type: body.type,
    lat: body.location.lat,
    lng: body.location.lng,
    userId: clampString(body.userId, 100, 'userId'),
    userName: clampString(body.userName, 60, 'userName') || 'Anonymous',
    notes: clampString(body.notes, 300, 'notes'),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await store.insert('sos', record);
  req.app.get('io')?.emit('sos:changed', { reason: 'created', id: record.id });
  res.status(201).json(record);
}));

router.patch('/:id', requireAdmin, asyncRoute(async (req, res) => {
  const { status } = req.body || {};
  requireOneOf(status, STATUSES, 'status');
  const updated = await store.update('sos', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'SOS record not found' });
  req.app.get('io')?.emit('sos:changed', { reason: 'updated', id: updated.id });
  res.json(updated);
}));

export default router;
