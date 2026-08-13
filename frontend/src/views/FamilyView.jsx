import { useEffect, useState } from 'react';
import { Users, Share2, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

import { useUser } from '../context/UserContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useTranslation } from '../i18n/useTranslation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { LoadingState, EmptyState } from '../components/StateBlocks.jsx';
import { api } from '../api/client.js';
import { timeAgo } from '../utils/format.js';

const STATUS_COLOR = { safe: 'green', help_needed: 'red', unknown: 'neutral' };

function randomCode() {
  const words = ['SUNRISE', 'MONSOON', 'HARBOR', 'RIDGE', 'DELTA', 'ANCHOR', 'ORBIT', 'GRANITE'];
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${Math.floor(10 + Math.random() * 90)}`;
}

export function FamilyView() {
  const { profile, updateProfile } = useUser();
  const { socket } = useSocket();
  const { location, requestLocation } = useGeolocation();
  const { t } = useTranslation();

  const [codeInput, setCodeInput] = useState(profile.familyGroupCode || '');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const activeGroup = profile.familyGroupCode;

  const loadMembers = async (code) => {
    if (!code) return;
    setLoading(true);
    try {
      const data = await api.getFamily(code);
      setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeGroup) loadMembers(activeGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  useEffect(() => {
    if (!socket || !activeGroup) return undefined;
    const handler = (payload) => {
      if (payload.groupCode === activeGroup) loadMembers(activeGroup);
    };
    socket.on('family:changed', handler);
    return () => socket.off('family:changed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, activeGroup]);

  const joinOrCreate = (code) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    updateProfile({ familyGroupCode: clean });
  };

  const checkIn = async (status) => {
    setCheckingIn(true);
    let loc = location;
    try {
      if (!loc) loc = await requestLocation();
    } catch {
      /* proceed without location — status is still worth sending */
    }
    try {
      await api.checkinFamily(activeGroup, {
        userId: profile.userId,
        name: profile.name || 'Anonymous',
        status,
        location: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
      });
      await loadMembers(activeGroup);
    } finally {
      setCheckingIn(false);
    }
  };

  const shareCode = async () => {
    const text = `Join my RAKSHA family safety group with code: ${activeGroup}`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* user cancelled — fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable — the code is already visible on screen to copy manually */
    }
  };

  if (!activeGroup) {
    return (
      <div>
        <div className="section-header"><h2>{t('family.title')}</h2></div>
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="field">
            <label>{t('family.joinGroup')}</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                className="input"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. SUNRISE-42"
              />
              <button className="btn btn--primary" type="button" onClick={() => joinOrCreate(codeInput)}>
                {t('family.checkIn')}
              </button>
            </div>
            <span className="field-hint">{t('family.groupCodeHint')}</span>
          </div>
          <button className="btn btn--outline btn--block" type="button" onClick={() => joinOrCreate(randomCode())}>
            <Users size={16} /> {t('family.createGroup')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2>{t('family.title')}</h2>
        <p className="mono">{activeGroup}</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <button className="btn btn--primary" disabled={checkingIn} onClick={() => checkIn('safe')} type="button">
          <CheckCircle2 size={16} /> {t('family.iAmSafe')}
        </button>
        <button className="btn btn--danger" disabled={checkingIn} onClick={() => checkIn('help_needed')} type="button">
          <AlertTriangle size={16} /> {t('family.iNeedHelp')}
        </button>
        <button className="btn btn--outline" onClick={shareCode} type="button">
          <Share2 size={16} /> {t('family.shareCode')}
        </button>
      </div>

      {loading && <LoadingState label={t('common.loading')} />}
      {!loading && members.length === 0 && <EmptyState label={t('family.noMembers')} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {members.map((m) => (
          <div key={m.userId} className="card card-row">
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <HelpCircle size={18} style={{ opacity: 0 }} />
              <div>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {t('family.lastUpdated')}: {timeAgo(m.updatedAt)}
                </div>
              </div>
            </div>
            <StatusBadge color={STATUS_COLOR[m.status] || 'neutral'}>{t(`family.${m.status === 'safe' ? 'iAmSafe' : m.status === 'help_needed' ? 'iNeedHelp' : 'unknown'}`)}</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}
