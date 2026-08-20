import { useData } from '../context/DataContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useTranslation } from '../i18n/useTranslation.js';
import { SUPPORTED_LANGUAGES } from '../i18n/translations.js';

export function AlertStrip() {
  const { areaAlert } = useData();
  const { profile, updateProfile } = useUser();
  const { t } = useTranslation();

  const level = areaAlert?.level || 'green';
  const headline = areaAlert
    ? level === 'red'
      ? t('alert.redHeadline').replace('{count}', areaAlert.activeCount || 1)
      : t(`alert.${level}Headline`)
    : '…';

  return (
    <div className="alert-strip" data-level={level} role="status">
      <span className="alert-strip__badge">{t(`alert.${level}`)}</span>
      <span className="alert-strip__headline">{headline}</span>
      <select
        className="alert-strip__lang"
        value={profile.language}
        onChange={(e) => updateProfile({ language: e.target.value })}
        aria-label="Language"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
