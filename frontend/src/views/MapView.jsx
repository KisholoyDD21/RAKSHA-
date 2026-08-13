import { useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Navigation, Crosshair, RouteOff } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useTranslation } from '../i18n/useTranslation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { LoadingState } from '../components/StateBlocks.jsx';
import { api } from '../api/client.js';
import { INCIDENT_TYPE_ICON, FACILITY_TYPE_ICON, ALERT_COLOR_HEX, severityToAlertColor } from '../utils/typeConfig.js';
import { timeAgo, formatDistance, formatDuration } from '../utils/format.js';

const MUMBAI_CENTER = [19.09, 72.87];
const FACILITY_LABEL = { shelter: 'S', hospital: 'H', police: 'P', fire_station: 'F', relief_camp: 'R', resource_point: 'X' };
const FACILITY_TYPES = Object.keys(FACILITY_LABEL);

function dotIcon(colorHex, size = 20) {
  return L.divIcon({
    className: 'raksha-marker',
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${colorHex};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function badgeIcon(letter) {
  return L.divIcon({
    className: 'raksha-marker',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:#14201c;color:#f6f3ea;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)">${letter}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function crosshairIcon(colorHex) {
  return L.divIcon({
    className: 'raksha-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${colorHex};border:3px solid #fff;box-shadow:0 0 0 2px ${colorHex}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function ClickCapture({ onClick }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export function MapView() {
  const { incidents, facilities, loading } = useData();
  const { location, requestLocation } = useGeolocation();
  const { t } = useTranslation();

  const [visibleTypes, setVisibleTypes] = useState(() => new Set(FACILITY_TYPES));
  const [showIncidents, setShowIncidents] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [routingOpen, setRoutingOpen] = useState(false);
  const [pickingField, setPickingField] = useState(null); // 'origin' | 'destination' | null
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const toggleType = (type) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleMapClick = useCallback(
    (point) => {
      if (pickingField === 'origin') { setOrigin(point); setPickingField(null); }
      else if (pickingField === 'destination') { setDestination(point); setPickingField(null); }
    },
    [pickingField]
  );

  const useMyLocationFor = async (field) => {
    try {
      const loc = await requestLocation();
      if (field === 'origin') setOrigin(loc);
      else setDestination(loc);
    } catch {
      /* useGeolocation already tracks the error for display elsewhere */
    }
  };

  const findRoute = async () => {
    if (!origin || !destination) return;
    setRouteLoading(true);
    setRouteError(null);
    try {
      const result = await api.getSafeRoute(origin, destination);
      setRoute(result);
    } catch (err) {
      setRouteError(err.message);
    } finally {
      setRouteLoading(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setOrigin(null);
    setDestination(null);
    setRouteError(null);
  };

  const visibleFacilities = useMemo(
    () => facilities.filter((f) => visibleTypes.has(f.type)),
    [facilities, visibleTypes]
  );
  const activeIncidents = useMemo(() => incidents.filter((i) => i.status !== 'resolved'), [incidents]);
  const recommendedRoute = route?.routes?.find((r) => r.id === route.recommendedId) || route?.routes?.[0];

  if (loading) return <LoadingState label={t('common.loading')} />;

  return (
    <div style={{ position: 'relative' }}>
      <div className="section-header">
        <h2>{t('map.title')}</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn--outline btn--sm" onClick={() => setFiltersOpen((v) => !v)} type="button">
            <Layers size={16} /> {t('map.layers')}
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => setRoutingOpen((v) => !v)} type="button">
            <Navigation size={16} /> {t('map.planRoute')}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="chip-group">
            <button
              type="button"
              className={`chip${showIncidents ? ' active' : ''}`}
              onClick={() => setShowIncidents((v) => !v)}
            >
              {t('map.hazards')}
            </button>
            {FACILITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`chip${visibleTypes.has(type) ? ' active' : ''}`}
                onClick={() => toggleType(type)}
              >
                {t(`shelters.${type}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {routingOpen && (
        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h4 style={{ marginBottom: 'var(--space-3)' }}>{t('map.planRoute')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <RoutePointRow
              label={t('map.origin')}
              point={origin}
              picking={pickingField === 'origin'}
              onPick={() => setPickingField('origin')}
              onUseLocation={() => useMyLocationFor('origin')}
            />
            <RoutePointRow
              label={t('map.destination')}
              point={destination}
              picking={pickingField === 'destination'}
              onPick={() => setPickingField('destination')}
              onUseLocation={() => useMyLocationFor('destination')}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <button className="btn btn--primary" disabled={!origin || !destination || routeLoading} onClick={findRoute} type="button">
              <Navigation size={16} /> {routeLoading ? t('common.loading') : t('map.findRoute')}
            </button>
            {route && (
              <button className="btn btn--ghost" onClick={clearRoute} type="button">
                <RouteOff size={16} /> {t('map.clearRoute')}
              </button>
            )}
          </div>
          {routeError && <p style={{ color: 'var(--alert-red)', marginTop: 'var(--space-2)', fontSize: 13 }}>{routeError}</p>}
          {recommendedRoute && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: 13 }}>
              <p style={{ margin: 0 }}>
                <strong>{t('map.routeVia')}:</strong>{' '}
                {recommendedRoute.source === 'osrm' ? t('map.sourceOsrm') : t('map.sourceGrid')}
              </p>
              <p className="mono" style={{ margin: '4px 0 0', color: 'var(--ink-soft)' }}>
                {t('map.distance')} {formatDistance(recommendedRoute.distanceMeters)} · {t('map.duration')} {formatDuration(recommendedRoute.durationSeconds)}
                {recommendedRoute.hazardHits.length > 0 && ` · ${recommendedRoute.hazardHits.length} ${t('map.hazardsAvoided')}`}
              </p>
              {recommendedRoute.warning && (
                <p style={{ color: 'var(--alert-orange)', marginTop: 4 }}>{recommendedRoute.warning}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--line)', height: '60vh', minHeight: 380 }}>
        <MapContainer center={MUMBAI_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCapture onClick={handleMapClick} />

          {showIncidents &&
            activeIncidents.map((incident) => {
              const color = ALERT_COLOR_HEX[severityToAlertColor(incident.severity, incident.status)];
              return (
                <Marker key={incident.id} position={[incident.lat, incident.lng]} icon={dotIcon(color, 20 + incident.severity)}>
                  <Popup>
                    <strong style={{ textTransform: 'capitalize' }}>{t(`report.types.${incident.type}`)}</strong>
                    <div style={{ fontSize: 12, margin: '4px 0' }}>
                      {t('map.severity')} {incident.severity}/5 · {timeAgo(incident.createdAt)}
                    </div>
                    {incident.description && <p style={{ fontSize: 13, margin: '4px 0' }}>{incident.description}</p>}
                    <StatusBadge color={severityToAlertColor(incident.severity, incident.status)}>
                      {t(`report.status.${incident.status}`)}
                    </StatusBadge>
                  </Popup>
                </Marker>
              );
            })}

          {visibleFacilities.map((facility) => (
            <Marker key={facility.id} position={[facility.lat, facility.lng]} icon={badgeIcon(FACILITY_LABEL[facility.type])}>
              <Popup>
                <strong>{facility.name}</strong>
                <div style={{ fontSize: 12, margin: '4px 0' }}>{t(`shelters.${facility.type}`)}</div>
                <StatusBadge color={facility.status === 'open' ? 'green' : facility.status === 'full' ? 'orange' : 'neutral'}>
                  {t(`shelters.status.${facility.status}`)}
                </StatusBadge>
                {facility.capacity != null && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {t('shelters.occupancy')}: {facility.occupancy}/{facility.capacity}
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          {origin && <Marker position={[origin.lat, origin.lng]} icon={crosshairIcon('#1E7B45')} />}
          {destination && <Marker position={[destination.lat, destination.lng]} icon={crosshairIcon('#B3261E')} />}
          {recommendedRoute && (
            <Polyline
              positions={recommendedRoute.coordinates.map((c) => [c.lat, c.lng])}
              pathOptions={{ color: '#14201C', weight: 5, opacity: 0.85 }}
            />
          )}
        </MapContainer>
      </div>
      {pickingField && (
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 'var(--space-2)' }}>
          <Crosshair size={14} style={{ verticalAlign: 'middle' }} /> Tap the map to set the {pickingField}.
        </p>
      )}
      {!filtersOpen && !routingOpen && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 'var(--space-2)' }}>{t('map.tapForDetails')}</p>
      )}
    </div>
  );
}

function RoutePointRow({ label, point, picking, onPick, onUseLocation }) {
  return (
    <div className="card-row" style={{ alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</div>
        <div className="mono" style={{ fontSize: 13 }}>
          {point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : '—'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button type="button" className={`btn btn--sm ${picking ? 'btn--primary' : 'btn--outline'}`} onClick={onPick}>
          <Crosshair size={14} /> {picking ? 'Tap map…' : 'Pick'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onUseLocation}>
          <Crosshair size={14} /> GPS
        </button>
      </div>
    </div>
  );
}
