import { Router } from 'express';
import * as store from '../db/store.js';
import { asyncRoute } from '../middleware/validate.js';
import { computeAreaAlert } from '../services/alertLevel.js';

const router = Router();

router.get('/', asyncRoute(async (req, res) => {
  const incidents = await store.readAll('incidents');
  res.json(computeAreaAlert(incidents));
}));

export default router;
