import { useEffect, useMemo, useState } from 'react';
import { Navigation, Phone, MapPin } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useTranslation } from '../i18n/useTranslation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { TypeIcon } from '../components/TypeIcon.jsx';
import { EmptyState } from '../components/StateBlocks.jsx';
import { FACILITY_TYPE_ICON } from '../utils/typeConfig.js';
import { haversineDistance } from '../utils/geo.js';
import { formatDistance } from '../utils/format.js';

const FILTERS = ['all', 'shelter', 'hospital', 'relief_camp', 'police', 'fire_station', 'resource_point'];
const STATUS_COLOR = { open: 'green', full: 'orange', closed: 'neutral' };

export function SheltersView() {
  const { facilities } = useData();
  const { location, requestLocation } = useGeolocation();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    requestLocation().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    let result = filter === 'all' ? facilities : facilities.filter((f) => f.type === filter);
    if (location) {
      result = result
        .map((f) => ({ ...f, distanceMeters: haversineDistance(location, f) }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
    return result;
  }, [facilities, filter, location]);

  return (
    <div>
      <div className="section-header">
        <h2>{t('shelters.title')}</h2>
        <p>{location ? t('shelters.sortedByDistance') : t('shelters.enableLocation')}</p>
      </div>

      <div className="chip-group" style={{ marginBottom: 'var(--space-4)' }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {t(`shelters.${f}`)}
          </button>
        ))}
      </div>

      {list.length === 0 && <EmptyState label={t('common.noResults')} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {list.map((facility) => (
          <div key={facility.id} className="card">
            <div className="card-row">
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <TypeIcon iconName={FACILITY_TYPE_ICON[facility.type]} />
                <div>
                  <div style={{ fontWeight: 700 }}>{facility.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{t(`shelters.${facility.type}`)}</div>
                </div>
              </div>
              {facility.distanceMeters != null && (
                <div className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{formatDistance(facility.distanceMeters)}</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              <StatusBadge color={STATUS_COLOR[facility.status]}>{t(`shelters.status.${facility.status}`)}</StatusBadge>
              {facility.capacity != null && (
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {t('shelters.occupancy')}: <strong>{facility.occupancy}</strong>/{facility.capacity}
                </span>
              )}
            </div>

            {facility.notes && <p style={{ fontSize: 13, marginTop: 'var(--space-2)', color: 'var(--ink-soft)' }}>{facility.notes}</p>}

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              <a
                className="btn btn--outline btn--sm"
                href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={14} /> {t('common.getDirections')}
              </a>
              {facility.phone && (
                <a className="btn btn--ghost btn--sm" href={`tel:${facility.phone}`}>
                  <Phone size={14} /> {t('common.call')}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
