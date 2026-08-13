import { Router } from 'express';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireOneOf, clampString } from '../middleware/validate.js';

const router = Router();
const STATUSES = ['safe', 'help_needed', 'unknown'];

// Family groups are keyed by a short shareable code, e.g. "SUNRISE-42".
// This is intentionally low-friction (no accounts) — anyone with the code
// can check in or read the group's status, the same trust model as
// sharing a WhatsApp group link.

router.get('/:groupCode', asyncRoute(async (req, res) => {
  const all = await store.readAll('family');
  const group = all.filter((m) => m.groupCode === req.params.groupCode.toUpperCase());
  res.json(group);
}));

router.post('/:groupCode/checkin', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['userId', 'name', 'status']);
  requireOneOf(body.status, STATUSES, 'status');

  const groupCode = req.params.groupCode.toUpperCase();
  const all = await store.readAll('family');
  const existingIdx = all.findIndex((m) => m.groupCode === groupCode && m.userId === body.userId);

  const record = {
    groupCode,
    userId: clampString(body.userId, 100, 'userId'),
    name: clampString(body.name, 60, 'name'),
    status: body.status,
    lat: typeof body.location?.lat === 'number' ? body.location.lat : null,
    lng: typeof body.location?.lng === 'number' ? body.location.lng : null,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx === -1) {
    all.push(record);
  } else {
    all[existingIdx] = record;
  }
  await store.writeAll('family', all);

  req.app.get('io')?.emit('family:changed', { reason: 'checkin', groupCode });
  res.status(201).json(record);
}));

export default router;
