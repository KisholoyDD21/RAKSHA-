import { useState } from 'react';
import { Camera, X, MapPin, ThumbsUp, ThumbsDown, Crosshair } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useTranslation } from '../i18n/useTranslation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { TypeIcon } from '../components/TypeIcon.jsx';
import { EmptyState } from '../components/StateBlocks.jsx';
import { INCIDENT_TYPE_ICON, severityToAlertColor } from '../utils/typeConfig.js';
import { compressImageToDataUrl, timeAgo } from '../utils/format.js';

const INCIDENT_TYPES = Object.keys(INCIDENT_TYPE_ICON);

export function ReportView() {
  const { incidents, submitReport, voteOnIncident } = useData();
  const { location, requestLocation } = useGeolocation();
  const { t } = useTranslation();

  const [type, setType] = useState('flood');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(3);
  const [photo, setPhoto] = useState(null);
  const [reportLocation, setReportLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPhoto(dataUrl);
    } catch {
      /* silently ignore a bad file — the form still works without a photo */
    }
  };

  const useLocation = async () => {
    try {
      const loc = await requestLocation();
      setReportLocation(loc);
    } catch {
      /* handled via useGeolocation's own error state if the caller wants it */
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportLocation) {
      setFeedback({ type: 'error', text: t('report.needLocation') });
      return;
    }
    setSubmitting(true);
    const result = await submitReport({
      type,
      location: reportLocation,
      severity,
      description,
      imageDataUrl: photo,
    });
    setSubmitting(false);
    setFeedback({ type: 'ok', text: result.queued ? t('report.queuedOffline') : t('report.submitted') });
    setDescription('');
    setPhoto(null);
    setReportLocation(null);
    setSeverity(3);
  };

  const recent = [...incidents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);

  return (
    <div>
      <div className="section-header">
        <h2>{t('report.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="field">
          <label>{t('report.type')}</label>
          <div className="chip-group">
            {INCIDENT_TYPES.map((incidentType) => (
              <button
                key={incidentType}
                type="button"
                className={`chip${type === incidentType ? ' active' : ''}`}
                onClick={() => setType(incidentType)}
              >
                {t(`report.types.${incidentType}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="report-description">{t('report.description')}</label>
          <textarea
            id="report-description"
            className="textarea"
            placeholder={t('report.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="field">
          <label>{t('report.severity')}</label>
          <div className="chip-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                data-severity={n}
                className={`chip chip--severity${severity === n ? ' active' : ''}`}
                onClick={() => setSeverity(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="field-hint">{t('report.severityHint')}</span>
        </div>

        <div className="field">
          <label>{t('report.location')}</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={useLocation}>
              <Crosshair size={14} /> {t('report.useMyLocation')}
            </button>
            {reportLocation && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {reportLocation.lat.toFixed(4)}, {reportLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
          <span className="field-hint">{t('report.pickOnMap')}</span>
        </div>

        <div className="field">
          <label>{t('report.addPhoto')}</label>
          {photo ? (
            <div style={{ position: 'relative', width: 140 }}>
              <img src={photo} alt="" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }} />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="btn btn--sm"
                style={{ position: 'absolute', top: 4, right: 4, background: '#fff', padding: 4 }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="btn btn--outline btn--sm" style={{ width: 'fit-content' }}>
              <Camera size={14} /> {t('report.addPhoto')}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {feedback && (
          <p style={{ fontSize: 13, color: feedback.type === 'error' ? 'var(--alert-red)' : 'var(--alert-green)', marginBottom: 'var(--space-3)' }}>
            {feedback.text}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? t('common.loading') : t('report.submit')}
        </button>
      </form>

      <h3 style={{ marginBottom: 'var(--space-3)' }}>Recent reports</h3>
      {recent.length === 0 && <EmptyState label={t('common.noResults')} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {recent.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} onVote={voteOnIncident} t={t} />
        ))}
      </div>
    </div>
  );
}

function IncidentCard({ incident, onVote, t }) {
  const [voting, setVoting] = useState(false);
  const color = severityToAlertColor(incident.severity, incident.status);

  const vote = async (choice) => {
    setVoting(true);
    try {
      await onVote(incident.id, choice);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-row">
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <TypeIcon iconName={INCIDENT_TYPE_ICON[incident.type]} color={color} />
          <div>
            <div style={{ fontWeight: 700 }}>{t(`report.types.${incident.type}`)}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {t('map.severity')} {incident.severity}/5 · {timeAgo(incident.createdAt)}
            </div>
          </div>
        </div>
        <StatusBadge color={color}>{t(`report.status.${incident.status}`)}</StatusBadge>
      </div>

      {incident.description && <p style={{ fontSize: 13, marginTop: 'var(--space-2)' }}>{incident.description}</p>}
      {incident.imageDataUrl && (
        <img src={incident.imageDataUrl} alt="" style={{ marginTop: 'var(--space-2)', borderRadius: 'var(--radius-md)', maxHeight: 180 }} />
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', alignItems: 'center' }}>
        <button type="button" className="btn btn--outline btn--sm" disabled={voting} onClick={() => vote('confirm')}>
          <ThumbsUp size={14} /> {t('report.confirmReport')} ({incident.confirmCount})
        </button>
        <button type="button" className="btn btn--ghost btn--sm" disabled={voting} onClick={() => vote('dispute')}>
          <ThumbsDown size={14} /> {t('report.disputeReport')} ({incident.disputeCount})
        </button>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginLeft: 'auto' }}>
          {t('report.confidence')}: {incident.confidence}%
        </span>
      </div>
    </div>
  );
}
