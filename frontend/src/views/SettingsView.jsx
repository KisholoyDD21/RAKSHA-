import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { useUser } from '../context/UserContext.jsx';
import { useTranslation } from '../i18n/useTranslation.js';
import { SUPPORTED_LANGUAGES } from '../i18n/translations.js';

export function SettingsView() {
  const { profile, updateProfile, addEmergencyContact, removeEmergencyContact } = useUser();
  const { t } = useTranslation();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    addEmergencyContact({ name: contactName.trim(), phone: contactPhone.trim() });
    setContactName('');
    setContactPhone('');
  };

  return (
    <div>
      <div className="section-header">
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="field">
          <label htmlFor="settings-lang-select">{t('settings.language')} (22 Available)</label>
          <select
            id="settings-lang-select"
            className="select"
            style={{ marginBottom: 'var(--space-3)' }}
            value={profile.language}
            onChange={(e) => updateProfile({ language: e.target.value })}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} ({l.code.toUpperCase()})
              </option>
            ))}
          </select>
          <div className="chip-group" style={{ maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`chip${profile.language === l.code ? ' active' : ''}`}
                onClick={() => updateProfile({ language: l.code })}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="settings-name">{t('settings.yourName')}</label>
          <input
            id="settings-name"
            className="input"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            placeholder={t('settings.yourNamePlaceholder')}
            maxLength={60}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: 'var(--space-3)' }}>{t('settings.emergencyContacts')}</h3>
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        {profile.emergencyContacts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {profile.emergencyContacts.map((c, i) => (
              <div key={i} className="card-row" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.phone}</div>
                </div>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeEmergencyContact(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddContact} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: '1 1 140px' }}
            placeholder={t('settings.contactName')}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <input
            className="input"
            style={{ flex: '1 1 140px' }}
            placeholder={t('settings.contactPhone')}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <button type="submit" className="btn btn--outline">
            <Plus size={16} /> {t('settings.addContact')}
          </button>
        </form>
      </div>

      <div className="field">
        <label htmlFor="settings-family-code">{t('settings.familyGroupCode')}</label>
        <input
          id="settings-family-code"
          className="input"
          value={profile.familyGroupCode}
          onChange={(e) => updateProfile({ familyGroupCode: e.target.value.toUpperCase() })}
          placeholder="e.g. SUNRISE-42"
        />
      </div>

      <h3 style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-2)' }}>{t('settings.about')}</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        {t('settings.aboutText')} {t('settings.deviceId')} <span className="mono">{profile.userId.slice(0, 8)}…</span>
      </p>
    </div>
  );
}
