// Demo seed data, geographically anchored to Mumbai (a city with a very
// real, well-documented monsoon flood-response context) so the map looks
// and behaves like a real deployment rather than scattered placeholder pins.
//
// Facility names are realistic-but-generic (neighbourhood + civic function,
// e.g. "Kurla Relief Shelter — Municipal School No. 4") rather than the
// names of specific real hospitals/institutions, so the demo can never be
// mistaken for a live feed about a real, named facility's actual capacity.
// Swap in verified real facility data before any real-world use.

import { randomUUID } from 'crypto';

const now = () => new Date().toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const seedFacilities = [
  // --- Hospitals ---
  { id: randomUUID(), type: 'hospital', name: 'Bandra General Hospital', lat: 19.0596, lng: 72.8295, capacity: 400, occupancy: 340, status: 'open', phone: '022-2640-1000', notes: 'Trauma center, 24x7 emergency ward', updatedAt: now() },
  { id: randomUUID(), type: 'hospital', name: 'Sion Municipal Hospital', lat: 19.0430, lng: 72.8619, capacity: 550, occupancy: 480, status: 'open', phone: '022-2407-6381', notes: 'Level 1 trauma, burns unit', updatedAt: now() },
  { id: randomUUID(), type: 'hospital', name: 'Andheri Community Hospital', lat: 19.1136, lng: 72.8697, capacity: 300, occupancy: 210, status: 'open', phone: '022-2683-2200', notes: 'ICU + dialysis available', updatedAt: now() },
  { id: randomUUID(), type: 'hospital', name: 'Byculla Civic Hospital', lat: 18.9750, lng: 72.8332, capacity: 250, occupancy: 240, status: 'open', phone: '022-2300-1122', notes: 'Nearing capacity — divert non-critical', updatedAt: now() },
  { id: randomUUID(), type: 'hospital', name: 'Powai Multispeciality Hospital', lat: 19.1176, lng: 72.9060, capacity: 180, occupancy: 90, status: 'open', phone: '022-2570-4400', notes: '', updatedAt: now() },

  // --- Shelters ---
  { id: randomUUID(), type: 'shelter', name: 'Kurla Relief Shelter — Municipal School No. 4', lat: 19.0728, lng: 72.8826, capacity: 500, occupancy: 260, status: 'open', phone: '022-2506-1188', notes: 'Dry bedding, generator backup', updatedAt: now() },
  { id: randomUUID(), type: 'shelter', name: 'Dadar Community Hall Shelter', lat: 19.0178, lng: 72.8478, capacity: 300, occupancy: 300, status: 'full', phone: '022-2444-7712', notes: 'At capacity — redirecting to Worli', updatedAt: now() },
  { id: randomUUID(), type: 'shelter', name: 'Chembur Municipal School Shelter', lat: 19.0522, lng: 72.9005, capacity: 350, occupancy: 120, status: 'open', phone: '022-2528-3300', notes: '', updatedAt: now() },
  { id: randomUUID(), type: 'shelter', name: 'Malad Sports Complex Shelter', lat: 19.1874, lng: 72.8484, capacity: 600, occupancy: 180, status: 'open', phone: '022-2889-4410', notes: 'Large open hall, wheelchair accessible', updatedAt: now() },
  { id: randomUUID(), type: 'shelter', name: 'Borivali Relief Shelter — Municipal School No. 9', lat: 19.2307, lng: 72.8567, capacity: 280, occupancy: 40, status: 'open', phone: '022-2892-1145', notes: '', updatedAt: now() },

  // --- Relief camps ---
  { id: randomUUID(), type: 'relief_camp', name: 'Worli Sea Face Relief Camp', lat: 19.0176, lng: 72.8162, capacity: 400, occupancy: 210, status: 'open', phone: '022-2493-2200', notes: 'Food + medical desk on site', updatedAt: now() },
  { id: randomUUID(), type: 'relief_camp', name: 'Vikhroli Relief Camp', lat: 19.1075, lng: 72.9264, capacity: 250, occupancy: 60, status: 'open', phone: '022-2578-9012', notes: '', updatedAt: now() },
  { id: randomUUID(), type: 'relief_camp', name: 'Mankhurd Relief Camp', lat: 19.0463, lng: 72.9330, capacity: 300, occupancy: 275, status: 'open', phone: '022-2556-3321', notes: 'Nearing capacity', updatedAt: now() },

  // --- Police stations ---
  { id: randomUUID(), type: 'police', name: 'Colaba Police Station', lat: 18.9067, lng: 72.8147, capacity: null, occupancy: null, status: 'open', phone: '022-2202-0400', notes: '', updatedAt: now() },
  { id: randomUUID(), type: 'police', name: 'Ghatkopar Police Station', lat: 19.0864, lng: 72.9081, capacity: null, occupancy: null, status: 'open', phone: '022-2501-1220', notes: '', updatedAt: now() },
  { id: randomUUID(), type: 'police', name: 'Santacruz Police Station', lat: 19.0808, lng: 72.8412, capacity: null, occupancy: null, status: 'open', phone: '022-2618-0033', notes: '', updatedAt: now() },

  // --- Fire stations ---
  { id: randomUUID(), type: 'fire_station', name: 'Dadar Fire Station', lat: 19.0210, lng: 72.8430, capacity: null, occupancy: null, status: 'open', phone: '101', notes: '3 engines, 1 rescue tender', updatedAt: now() },
  { id: randomUUID(), type: 'fire_station', name: 'Andheri Fire Station', lat: 19.1190, lng: 72.8460, capacity: null, occupancy: null, status: 'open', phone: '101', notes: '', updatedAt: now() },
  { id: randomUUID(), type: 'fire_station', name: 'Byculla Fire Station', lat: 18.9770, lng: 72.8300, capacity: null, occupancy: null, status: 'open', phone: '101', notes: '', updatedAt: now() },

  // --- Resource points (food/water/charging/medical) ---
  { id: randomUUID(), type: 'resource_point', name: 'Sion Circle Supply Point', lat: 19.0400, lng: 72.8600, capacity: null, occupancy: null, status: 'open', phone: '', notes: 'Drinking water, ORS, power bank charging', updatedAt: now() },
  { id: randomUUID(), type: 'resource_point', name: 'Kurla Station Supply Point', lat: 19.0700, lng: 72.8790, capacity: null, occupancy: null, status: 'open', phone: '', notes: 'Food packets, first aid desk', updatedAt: now() },
  { id: randomUUID(), type: 'resource_point', name: 'Bandra Bandstand Charging Point', lat: 19.0450, lng: 72.8200, capacity: null, occupancy: null, status: 'open', phone: '', notes: 'Solar charging, phone-only', updatedAt: now() },
];

export const seedIncidents = [
  {
    id: randomUUID(), type: 'flood', lat: 19.0380, lng: 72.8580, severity: 4,
    description: 'Waterlogging near Hindmata junction, water above knee-level. Vehicles stalled, avoid the underpass.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-1',
    status: 'verified', confirms: ['u1', 'u2', 'u3', 'u4'], disputes: [],
    createdAt: hoursAgo(2), updatedAt: hoursAgo(1),
  },
  {
    id: randomUUID(), type: 'flood', lat: 19.0715, lng: 72.8810, severity: 5,
    description: 'Severe flooding along Kurla station approach road. Water entering ground-floor shops.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-2',
    status: 'verified', confirms: ['u1', 'u5', 'u6'], disputes: [],
    createdAt: hoursAgo(1.5), updatedAt: hoursAgo(0.5),
  },
  {
    id: randomUUID(), type: 'roadblock', lat: 19.0460, lng: 72.8420, severity: 3,
    description: 'Fallen tree blocking both lanes near Mahim causeway approach.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-3',
    status: 'verified', confirms: ['u2', 'u7'], disputes: [],
    createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
  },
  {
    id: randomUUID(), type: 'fire', lat: 18.9800, lng: 72.8350, severity: 5,
    description: 'Structure fire reported in a warehouse near Byculla. Heavy smoke visible.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-4',
    status: 'verified', confirms: ['u1', 'u2', 'u3', 'u4', 'u5'], disputes: [],
    createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.1),
  },
  {
    id: randomUUID(), type: 'landslide', lat: 19.1050, lng: 72.9100, severity: 4,
    description: 'Slope slippage near a hillside settlement in Powai after continuous rain. Some structures at risk.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-5',
    status: 'unverified', confirms: ['u3'], disputes: [],
    createdAt: hoursAgo(4), updatedAt: hoursAgo(4),
  },
  {
    id: randomUUID(), type: 'power_outage', lat: 19.1900, lng: 72.8500, severity: 2,
    description: 'Power outage across several blocks in Malad West since this morning.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-6',
    status: 'verified', confirms: ['u1', 'u8'], disputes: [],
    createdAt: hoursAgo(6), updatedAt: hoursAgo(5),
  },
  {
    id: randomUUID(), type: 'accident', lat: 19.0990, lng: 72.8480, severity: 3,
    description: 'Multi-vehicle collision near Vile Parle flyover. Lane partially blocked.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-7',
    status: 'unverified', confirms: [], disputes: [],
    createdAt: hoursAgo(0.3), updatedAt: hoursAgo(0.3),
  },
  {
    id: randomUUID(), type: 'flood', lat: 19.0250, lng: 72.8550, severity: 3,
    description: 'Ankle-deep waterlogging reported near Dadar TT circle, slowly rising.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-8',
    status: 'disputed', confirms: ['u2'], disputes: ['u4', 'u9'],
    createdAt: hoursAgo(1), updatedAt: hoursAgo(0.4),
  },
  {
    id: randomUUID(), type: 'building_collapse', lat: 18.9720, lng: 72.8280, severity: 5,
    description: 'Partial wall collapse of an old structure near Byculla. Area cordoned off, unconfirmed if anyone trapped.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-9',
    status: 'verified', confirms: ['u1', 'u2', 'u3'], disputes: [],
    createdAt: hoursAgo(0.8), updatedAt: hoursAgo(0.2),
  },
  {
    id: randomUUID(), type: 'chemical_leak', lat: 19.0530, lng: 72.9050, severity: 4,
    description: 'Reported chemical odor and mild eye irritation near an industrial unit in Chembur. Source unconfirmed.',
    imageDataUrl: null, reporterName: 'Anonymous', reporterId: 'seed-reporter-10',
    status: 'unverified', confirms: ['u5'], disputes: [],
    createdAt: hoursAgo(1.2), updatedAt: hoursAgo(1.2),
  },
];

export const seedBroadcasts = [
  {
    id: randomUUID(), category: 'weather', priority: 'orange',
    title: 'Heavy rainfall warning — next 24 hours',
    message: 'IMD has issued an orange alert for Mumbai city and suburbs. Heavy to very heavy rainfall expected. Avoid low-lying areas (Hindmata, Kurla, Sion, Milan Subway) during high tide windows.',
    createdAt: hoursAgo(5),
  },
  {
    id: randomUUID(), category: 'evacuation', priority: 'red',
    title: 'Evacuation advisory — Byculla industrial block',
    message: 'Residents within 500m of the Byculla warehouse fire are advised to evacuate to Dadar Community Hall or Worli Sea Face Relief Camp. Avoid Clare Road until further notice.',
    createdAt: hoursAgo(0.4),
  },
  {
    id: randomUUID(), category: 'shelter_update', priority: 'yellow',
    title: 'Dadar shelter at capacity',
    message: 'Dadar Community Hall Shelter has reached full capacity. Please proceed to Chembur Municipal School Shelter or Worli Sea Face Relief Camp instead.',
    createdAt: hoursAgo(1),
  },
];

export const ALERT_LEVELS = ['green', 'yellow', 'orange', 'red'];
