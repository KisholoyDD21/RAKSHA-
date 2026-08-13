import { useState } from 'react';
import { Radio, Send } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useTranslation } from '../i18n/useTranslation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { EmptyState } from '../components/StateBlocks.jsx';
import { api } from '../api/client.js';
import { timeAgo } from '../utils/format.js';

const CATEGORIES = ['evacuation', 'road_closure', 'weather', 'shelter_update', 'safety_instruction', 'general'];
const PRIORITIES = ['green', 'yellow', 'orange', 'red'];

export function BroadcastsView() {
  const { broadcasts, refetchAll } = useData();
  const { profile } = useUser();
  const { t } = useTranslation();

  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('yellow');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isAdmin = !!profile.adminToken;

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);
    try {
      await api.createBroadcast({ category, priority, title, message }, profile.adminToken);
      setTitle('');
      setMessage('');
      setFeedback({ type: 'ok', text: t('broadcasts.sent') });
      await refetchAll();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>{t('broadcasts.title')}</h2>
      </div>

      {isAdmin && (
        <form onSubmit={handleSend} className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ marginBottom: 'var(--space-3)' }}>{t('broadcasts.newBroadcast')}</h4>

          <div className="field">
            <label>{t('broadcasts.category')}</label>
            <div className="chip-group">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={`chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
                  {t(`broadcasts.categories.${c}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('broadcasts.priority')}</label>
            <div className="chip-group">
              {PRIORITIES.map((p) => (
                <button key={p} type="button" className={`chip${priority === p ? ' active' : ''}`} onClick={() => setPriority(p)}>
                  {t(`alert.${p}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="broadcast-title">{t('broadcasts.titleLabel')}</label>
            <input id="broadcast-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
          </div>

          <div className="field">
            <label htmlFor="broadcast-message">{t('broadcasts.message')}</label>
            <textarea
              id="broadcast-message"
              className="textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={800}
            />
          </div>

          {feedback && (
            <p style={{ fontSize: 13, color: feedback.type === 'error' ? 'var(--alert-red)' : 'var(--alert-green)' }}>{feedback.text}</p>
          )}

          <button type="submit" className="btn btn--primary" disabled={sending}>
            <Send size={16} /> {t('broadcasts.send')}
          </button>
        </form>
      )}

      {broadcasts.length === 0 && <EmptyState label={t('common.noResults')} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {broadcasts.map((b) => (
          <div key={b.id} className="card">
            <div className="card-row">
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <span className="type-icon" style={{ background: 'var(--paper-muted)', color: 'var(--ink)' }}>
                  <Radio size={18} />
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {t(`broadcasts.categories.${b.category}`)} · {timeAgo(b.createdAt)}
                  </div>
                </div>
              </div>
              <StatusBadge color={b.priority}>{t(`alert.${b.priority}`)}</StatusBadge>
            </div>
            <p style={{ fontSize: 14, marginTop: 'var(--space-3)' }}>{b.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
