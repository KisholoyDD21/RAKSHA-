import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as store from '../db/store.js';
import { asyncRoute, requireFields, requireLatLng, requireOneOf, requireSeverity, clampString, ValidationError } from '../middleware/validate.js';
import { computeStatus, computeConfidence, computePriorityScore, STATUS } from '../services/verification.js';
import { incidentAlertColor } from '../services/alertLevel.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const INCIDENT_TYPES = [
  'flood', 'fire', 'accident', 'roadblock', 'landslide', 'storm',
  'earthquake', 'building_collapse', 'power_outage', 'chemical_leak', 'other',
];

const MAX_IMAGE_BYTES = 1_500_000; // ~1.5MB after client-side compression

function enrich(incident) {
  return {
    ...incident,
    confidence: computeConfidence(incident),
    priorityScore: computePriorityScore(incident),
    alertColor: incidentAlertColor(incident),
    confirmCount: incident.confirms.length,
    disputeCount: incident.disputes.length,
  };
}

router.get('/', asyncRoute(async (req, res) => {
  const incidents = await store.readAll('incidents');
  res.json(incidents.map(enrich).sort((a, b) => b.priorityScore - a.priorityScore));
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const incident = await store.find('incidents', (i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(enrich(incident));
}));

router.post('/', asyncRoute(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['type', 'location', 'severity']);
  requireOneOf(body.type, INCIDENT_TYPES, 'type');
  requireLatLng(body.location, 'location');
  const severity = requireSeverity(body.severity);

  if (body.imageDataUrl && typeof body.imageDataUrl === 'string' && body.imageDataUrl.length > MAX_IMAGE_BYTES) {
    throw new ValidationError('Image too large — compress before upload (max ~1.5MB as base64)');
  }

  const incident = {
    id: randomUUID(),
    type: body.type,
    lat: body.location.lat,
    lng: body.location.lng,
    severity,
    description: clampString(body.description, 500, 'description'),
    imageDataUrl: body.imageDataUrl || null,
    reporterName: clampString(body.reporterName, 60, 'reporterName') || 'Anonymous',
    reporterId: clampString(body.reporterId, 100, 'reporterId') || 'unknown',
    status: STATUS.UNVERIFIED,
    confirms: [],
    disputes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await store.insert('incidents', incident);
  req.app.get('io')?.emit('incidents:changed', { reason: 'created', id: incident.id });
  res.status(201).json(enrich(incident));
}));

router.post('/:id/vote', asyncRoute(async (req, res) => {
  const { voterId, vote } = req.body || {};
  requireFields(req.body || {}, ['voterId', 'vote']);
  requireOneOf(vote, ['confirm', 'dispute'], 'vote');

  const incident = await store.find('incidents', (i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const cleanVoterId = clampString(voterId, 100, 'voterId');
  const confirms = incident.confirms.filter((v) => v !== cleanVoterId);
  const disputes = incident.disputes.filter((v) => v !== cleanVoterId);

  if (vote === 'confirm') confirms.push(cleanVoterId);
  else disputes.push(cleanVoterId);

  const newStatus = computeStatus({ confirms, disputes, currentStatus: incident.status });
  const updated = await store.update('incidents', incident.id, { confirms, disputes, status: newStatus });

  req.app.get('io')?.emit('incidents:changed', { reason: 'voted', id: incident.id });
  res.json(enrich(updated));
}));

router.patch('/:id', requireAdmin, asyncRoute(async (req, res) => {
  const { status, severity } = req.body || {};
  const patch = {};
  if (status !== undefined) {
    requireOneOf(status, Object.values(STATUS), 'status');
    patch.status = status;
  }
  if (severity !== undefined) {
    patch.severity = requireSeverity(severity);
  }
  if (Object.keys(patch).length === 0) {
    throw new ValidationError('Provide at least one of: status, severity');
  }

  const updated = await store.update('incidents', req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Incident not found' });

  req.app.get('io')?.emit('incidents:changed', { reason: 'updated', id: updated.id });
  res.json(enrich(updated));
}));

export default router;
