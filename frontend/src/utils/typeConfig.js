// Central mapping of incident/facility "type" enums to icon + color, so the
// map, report form, and admin dashboard all render the same taxonomy
// consistently instead of each screen inventing its own.

export const INCIDENT_TYPE_ICON = {
  flood: 'Waves',
  fire: 'Flame',
  accident: 'Car',
  roadblock: 'Construction',
  landslide: 'Mountain',
  storm: 'CloudLightning',
  earthquake: 'Activity',
  building_collapse: 'Building2',
  power_outage: 'ZapOff',
  chemical_leak: 'Biohazard',
  other: 'CircleAlert',
};

export const FACILITY_TYPE_ICON = {
  shelter: 'Tent',
  hospital: 'Cross',
  police: 'ShieldCheck',
  fire_station: 'Siren',
  relief_camp: 'Home',
  resource_point: 'PackageSearch',
};

export const ALERT_COLOR_HEX = {
  green: '#1E7B45',
  yellow: '#C99A1E',
  orange: '#C1521C',
  red: '#B3261E',
};

export function severityToAlertColor(severity, status) {
  if (status === 'resolved') return 'green';
  if (status === 'disputed') return 'yellow';
  if (severity >= 4) return 'red';
  if (severity === 3) return 'orange';
  return 'yellow';
}
