import { Router } from 'express';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireLatLng } from '../middleware/validate.js';
import { getSafeRoutes } from '../services/routingEngine.js';

const router = Router();

router.post('/safe-route', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['origin', 'destination']);
  requireLatLng(body.origin, 'origin');
  requireLatLng(body.destination, 'destination');

  const incidents = await store.readAll('incidents');
  const result = await getSafeRoutes({ origin: body.origin, destination: body.destination, incidents });
  res.json(result);
}));

export default router;
