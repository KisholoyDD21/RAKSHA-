import { Router } from 'express';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, clampString } from '../middleware/validate.js';
import { getAIAssistance } from '../services/aiAssistant.js';
import { computeAreaAlert } from '../services/alertLevel.js';

const router = Router();

router.post('/assist', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['query']);
  const query = clampString(body.query, 500, 'query');

  const incidents = await store.readAll('incidents');
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const areaAlert = computeAreaAlert(incidents);

  const result = await getAIAssistance({
    query,
    context: {
      activeIncidents,
      areaAlert,
      userLocationLabel: body.userLocationLabel || null,
    },
  });

  res.json(result);
}));

export default router;
