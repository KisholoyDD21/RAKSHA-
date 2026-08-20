import { useCallback, useMemo, useRef, useState } from 'react';
import { Siren, MessageCircle, Phone, MapPin, RotateCcw } from 'lucide-react';

import { useGeolocation } from '../hooks/useGeolocation.js';
import { useUser } from '../context/UserContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTranslation } from '../i18n/useTranslation.js';
import { api } from '../api/client.js';
import { haversineDistance } from '../utils/geo.js';
import { formatDistance } from '../utils/format.js';

const HOLD_DURATION_MS = 2000;
const SOS_TYPES = ['medical', 'fire', 'flood', 'trapped', 'violence', 'accident', 'other'];

export function SOSView() {
  const { profile } = useUser();
  const { facilities } = useData();
  const { requestLocation } = useGeolocation();
  const { t } = useTranslation();

  const [type, setType] = useState('medical');
  const [phase, setPhase] = useState('idle'); // idle | locating | sent | error
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const setProgress = (value) => wrapRef.current?.style.setProperty('--progress', value);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
  }, []);

  const triggerSOS = useCallback(async () => {
    setPhase('locating');
    try {
      const loc = await requestLocation();
      setLocation(loc);
      await api.createSOS({ type, location: loc, userId: profile.userId, userName: profile.name || 'Anonymous' });
      setPhase('sent');
    } catch (err) {
      setErrorMsg(err.message || t('sos.locationDenied'));
      setPhase('error');
    }
  }, [requestLocation, type, profile.userId, profile.name, t]);

  const tick = useCallback(
    (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min(1, (timestamp - startRef.current) / HOLD_DURATION_MS);
      setProgress(progress);
      if (progress >= 1) {
        rafRef.current = null;
        triggerSOS();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [triggerSOS]
  );

  const startHold = (e) => {
    e.preventDefault();
    if (phase !== 'idle') return;
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    setPhase('idle');
    setLocation(null);
    setErrorMsg(null);
    cancelHold();
  };

  const nearestFacilities = useMemo(() => {
    if (!location) return [];
    return facilities
      .filter((f) => f.status !== 'closed')
      .map((f) => ({ ...f, distanceMeters: haversineDistance(location, f) }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);
  }, [facilities, location]);

  const mapsLink = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '';
  const shareMessage = location
    ? (t('sos.shareMessage') || 'EMERGENCY — I need help ({type}). My live location: {link} — sent via RAKSHA')
        .replace('{type}', t(`sos.types.${type}`))
        .replace('{link}', mapsLink)
    : '';

  return (
    <div>
      <div className="section-header">
        <h2>{t('sos.title')}</h2>
      </div>

      {phase === 'idle' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 'var(--space-3)' }}>{t('sos.typeLabel')}</p>
          <div className="chip-group" style={{ marginBottom: 'var(--space-4)' }}>
            {SOS_TYPES.map((sosType) => (
              <button
                key={sosType}
                type="button"
                className={`chip${type === sosType ? ' active' : ''}`}
                onClick={() => setType(sosType)}
              >
                {t(`sos.types.${sosType}`)}
              </button>
            ))}
          </div>

          <div
            ref={wrapRef}
            className="sos-button-wrap"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
          >
            <button type="button" className="sos-button" aria-label={t('sos.holdToConfirm')}>
              <Siren />
              <span className="sos-button__label">SOS</span>
              <span className="sos-button__sub">{t('sos.holdInstructions')}</span>
            </button>
          </div>
        </>
      )}

      {phase === 'locating' && (
        <div className="state-block">
          <Siren className="spin" size={32} />
          <span>{t('sos.locating')}</span>
        </div>
      )}

      {phase === 'error' && (
        <div className="state-block">
          <Siren size={32} />
          <span>{errorMsg}</span>
          <button className="btn btn--primary" onClick={reset} type="button">
            <RotateCcw size={16} /> {t('common.retry')}
          </button>
        </div>
      )}

      {phase === 'sent' && (
        <div>
          <div className="card" style={{ borderColor: 'var(--alert-red)', marginBottom: 'var(--space-4)' }}>
            <div className="card-row">
              <div>
                <h3 style={{ color: 'var(--alert-red)' }}>{t('sos.sent')}</h3>
                <p className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
                  <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
                </p>
              </div>
              <StatusBadgeLike t={t} />
            </div>
          </div>

          <h4 style={{ marginBottom: 'var(--space-3)' }}>{t('sos.nearestHelp')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            {nearestFacilities.map((f) => (
              <div key={f.id} className="card card-row" style={{ padding: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{t(`shelters.${f.type}`)}</div>
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{formatDistance(f.distanceMeters)}</div>
              </div>
            ))}
          </div>

          <h4 style={{ marginBottom: 'var(--space-2)' }}>{t('sos.notifyContacts')}</h4>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 'var(--space-3)' }}>{t('sos.notifyHint')}</p>
          {profile.emergencyContacts.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{t('sos.noContacts')}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            {profile.emergencyContacts.map((contact, idx) => {
              const digits = (contact.phone || '').replace(/[^\d+]/g, '');
              const waLink = `https://wa.me/${digits.replace('+', '')}?text=${encodeURIComponent(shareMessage)}`;
              const smsLink = `sms:${digits}?body=${encodeURIComponent(shareMessage)}`;
              return (
                <div key={idx} className="card card-row" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{contact.name}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <a className="btn btn--sm btn--outline" href={waLink} target="_blank" rel="noreferrer">
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    <a className="btn btn--sm btn--outline" href={smsLink}>
                      <Phone size={14} /> SMS
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn--outline btn--block" onClick={reset} type="button">
            <RotateCcw size={16} /> {t('sos.sendAnother')}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadgeLike({ t }) {
  return <span className="badge badge--red">{t ? t('sos.active') : 'ACTIVE'}</span>;
}
