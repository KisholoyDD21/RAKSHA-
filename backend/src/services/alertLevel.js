// Computes a single area-wide alert level from the current set of active
// incidents, using the same four-tier vocabulary India's IMD uses for
// public weather warnings (green/yellow/orange/red = all-clear / watch /
// be-prepared / take-action). This is the one signal shown on the
// persistent alert strip on every screen — the whole app's "spine".

const LEVEL_RANK = { green: 0, yellow: 1, orange: 2, red: 3 };

export function incidentAlertColor(incident) {
  if (incident.status === 'resolved') return 'green';
  if (incident.severity >= 4) return 'red';
  if (incident.severity === 3) return 'orange';
  return 'yellow';
}

export function computeAreaAlert(incidents) {
  const active = incidents.filter((i) => i.status !== 'resolved');
  if (active.length === 0) {
    return { level: 'green', label: 'All Clear', headline: 'No active hazards reported in your area.', activeCount: 0 };
  }

  let worst = 'green';
  for (const incident of active) {
    const color = incidentAlertColor(incident);
    if (LEVEL_RANK[color] > LEVEL_RANK[worst]) worst = color;
  }

  const redCount = active.filter((i) => incidentAlertColor(i) === 'red').length;
  const label = { green: 'All Clear', yellow: 'Watch', orange: 'Be Prepared', red: 'Take Action' }[worst];

  const headline =
    worst === 'red'
      ? `${redCount} severe incident${redCount === 1 ? '' : 's'} active — avoid affected zones and follow shelter guidance.`
      : worst === 'orange'
      ? 'Elevated hazard activity in the area. Review safe routes before heading out.'
      : worst === 'yellow'
      ? 'Isolated reports being monitored. No immediate action needed.'
      : 'No active hazards reported in your area.';

  return { level: worst, label, headline, activeCount: active.length };
}
