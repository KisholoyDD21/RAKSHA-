import { useUser } from '../context/UserContext.jsx';
import { translate } from './translations.js';

export function useTranslation() {
  const { profile } = useUser();
  const t = (path) => translate(profile.language, path);
  return { t, lang: profile.language };
}
