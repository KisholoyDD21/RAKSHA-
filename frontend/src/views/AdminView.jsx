import { useMemo, useState } from 'react';
import { LogIn, LogOut, CheckCircle2, AlertOctagon, Siren, Home, Percent } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { TypeIcon } from '../components/TypeIcon.jsx';
import { api } from '../api/client.js';
import { INCIDENT_TYPE_ICON, severityToAlertColor } from '../utils/typeConfig.js';
import { timeAgo } from '../utils/format.js';
import { useTranslation } from '../i18n/useTranslation.js';

export function AdminView() {
  const { profile, setAdminToken } = useUser();
  const { t } = useTranslation();

  if (!profile.adminToken) return <AdminLogin onLoggedIn={setAdminToken} t={t} />;
  return <Dashboard token={profile.adminToken} onLogout={() => setAdminToken(null)} t={t} />;
}

function AdminLogin({ onLoggedIn, t }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.adminLogin(passcode);
      onLoggedIn(token);
    } catch {
      setError(t('admin.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '10vh auto' }}>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>{t('admin.login')}</h2>
      <form onSubmit={submit} className="card">
        <div className="field">
          <label htmlFor="admin-passcode">{t('admin.passcode')}</label>
          <input
            id="admin-passcode"
            type="password"
            className="input"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p style={{ color: 'var(--alert-red)', fontSize: 13, marginBottom: 'var(--space-3)' }}>{error}</p>}
        <button className="btn btn--primary btn--block" disabled={loading} type="submit">
          <LogIn size={16} /> {t('admin.loginButton')}
        </button>
        <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 'var(--space-3)' }}>
          {t('admin.demoHint')} <code className="mono">raksha-demo</code> {t('admin.demoHintSuffix')}
        </p>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout, t }) {
  const { incidents, facilities, refetchAll } = useData();
  const [busyId, setBusyId] = useState(null);

  const activeIncidents = useMemo(() => incidents.filter((i) => i.status !== 'resolved'), [incidents]);
  const verifiedShare = incidents.length
    ? Math.round((incidents.filter((i) => i.status === 'verified').length / incidents.length) * 100)
    : 0;
  const avgOccupancy = useMemo(() => {
    const withCapacity = facilities.filter((f) => f.capacity);
    if (withCapacity.length === 0) return 0;
    const pct = withCapacity.reduce((sum, f) => sum + f.occupancy / f.capacity, 0) / withCapacity.length;
    return Math.round(pct * 100);
  }, [facilities]);

  const resolveIncident = async (id) => {
    setBusyId(id);
    try {
      await api.updateIncident(id, { status: 'resolved' }, token);
      await refetchAll();
    } finally {
      setBusyId(null);
    }
  };

  const updateOccupancy = async (facility, value) => {
    const occupancy = Number(value);
    if (!Number.isFinite(occupancy)) return;
    await api.updateFacility(facility.id, { occupancy }, token);
    await refetchAll();
  };

  return (
    <div>
      <div className="section-header">
        <h2>{t('admin.title')}</h2>
        <button className="btn btn--outline btn--sm" onClick={onLogout} type="button">
          <LogOut size={14} /> {t('admin.logout')}
        </button>
      </div>

      <div className="stat-grid">
        <StatCard icon={AlertOctagon} value={activeIncidents.length} label={t('admin.activeIncidents')} />
        <StatCard icon={Siren} value={incidents.filter((i) => i.status === 'unverified').length} label={t('admin.unverified')} />
        <StatCard icon={Percent} value={`${verifiedShare}%`} label={t('admin.verifiedShare')} />
        <StatCard icon={Home} value={`${avgOccupancy}%`} label={t('admin.avgShelterOccupancy')} />
      </div>

      <h3 style={{ marginBottom: 'var(--space-3)' }}>{t('admin.priorityQueue')}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {activeIncidents.slice(0, 20).map((incident) => {
          const color = severityToAlertColor(incident.severity, incident.status);
          return (
            <div key={incident.id} className="card card-row">
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', minWidth: 0 }}>
                <TypeIcon iconName={INCIDENT_TYPE_ICON[incident.type]} color={color} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {t(`report.types.${incident.type}`)}
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>P{incident.priorityScore}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {incident.description || '—'} · {timeAgo(incident.createdAt, t)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                <StatusBadge color={color}>{t(`report.status.${incident.status}`)}</StatusBadge>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={busyId === incident.id}
                  onClick={() => resolveIncident(incident.id)}
                >
                  <CheckCircle2 size={14} /> {t('admin.markResolved')}
                </button>
              </div>
            </div>
          );
        })}
        {activeIncidents.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>{t('common.noResults')}</p>}
      </div>

      <h3 style={{ marginBottom: 'var(--space-3)' }}>{t('admin.manageFacilities')}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {facilities.map((facility) => (
          <div key={facility.id} className="card card-row">
            <div>
              <div style={{ fontWeight: 700 }}>{facility.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{t(`shelters.${facility.type}`) || facility.type}</div>
            </div>
            {facility.capacity != null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  className="input mono"
                  style={{ width: 80 }}
                  defaultValue={facility.occupancy}
                  min={0}
                  max={facility.capacity}
                  onBlur={(e) => updateOccupancy(facility, e.target.value)}
                />
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>/ {facility.capacity}</span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="stat-card">
      <Icon size={18} style={{ color: 'var(--ink-soft)', marginBottom: 8 }} />
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
