import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireOneOf, clampString } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const CATEGORIES = ['evacuation', 'road_closure', 'weather', 'shelter_update', 'safety_instruction', 'general'];
const PRIORITIES = ['green', 'yellow', 'orange', 'red'];

router.get('/', asyncRoute(async (req, res) => {
  const broadcasts = await store.readAll('broadcasts');
  res.json(broadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}));

router.post('/', requireAdmin, asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['category', 'title', 'message']);
  requireOneOf(body.category, CATEGORIES, 'category');
  const priority = body.priority && PRIORITIES.includes(body.priority) ? body.priority : 'yellow';

  const broadcast = {
    id: randomUUID(),
    category: body.category,
    priority,
    title: clampString(body.title, 120, 'title'),
    message: clampString(body.message, 800, 'message'),
    createdAt: new Date().toISOString(),
  };

  await store.insert('broadcasts', broadcast);
  req.app.get('io')?.emit('broadcasts:changed', { reason: 'created', id: broadcast.id });
  res.status(201).json(broadcast);
}));

export default router;
