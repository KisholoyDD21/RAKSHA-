const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      /* response wasn't JSON — keep the generic message */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Incidents / community reports
  getIncidents: () => request('/incidents'),
  createIncident: (data) => request('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  voteIncident: (id, voterId, vote) =>
    request(`/incidents/${id}/vote`, { method: 'POST', body: JSON.stringify({ voterId, vote }) }),
  updateIncident: (id, patch, token) =>
    request(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: authHeader(token) }),

  // Facilities
  getFacilities: (params) => request(`/facilities${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  createFacility: (data, token) =>
    request('/facilities', { method: 'POST', body: JSON.stringify(data), headers: authHeader(token) }),
  updateFacility: (id, patch, token) =>
    request(`/facilities/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: authHeader(token) }),

  // Broadcasts
  getBroadcasts: () => request('/broadcasts'),
  createBroadcast: (data, token) =>
    request('/broadcasts', { method: 'POST', body: JSON.stringify(data), headers: authHeader(token) }),

  // SOS
  getSOS: () => request('/sos'),
  createSOS: (data) => request('/sos', { method: 'POST', body: JSON.stringify(data) }),
  updateSOS: (id, patch, token) =>
    request(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: authHeader(token) }),

  // Family safety
  getFamily: (groupCode) => request(`/family/${encodeURIComponent(groupCode)}`),
  checkinFamily: (groupCode, data) =>
    request(`/family/${encodeURIComponent(groupCode)}/checkin`, { method: 'POST', body: JSON.stringify(data) }),

  // Smart safe routing
  getSafeRoute: (origin, destination) =>
    request('/routing/safe-route', { method: 'POST', body: JSON.stringify({ origin, destination }) }),

  // AI hazard assistant
  askAI: (query, userLocationLabel) =>
    request('/ai/assist', { method: 'POST', body: JSON.stringify({ query, userLocationLabel }) }),

  // Area alert
  getAreaAlert: () => request('/alert'),

  // Admin
  adminLogin: (passcode) => request('/admin/login', { method: 'POST', body: JSON.stringify({ passcode }) }),
};
