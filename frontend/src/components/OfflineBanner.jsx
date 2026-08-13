import { WifiOff, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useTranslation } from '../i18n/useTranslation.js';

export function OfflineBanner() {
  const { isOnline, pendingReports } = useData();
  const { t } = useTranslation();

  if (isOnline && pendingReports.length === 0) return null;

  return (
    <div className="offline-banner" role="status">
      {isOnline ? <RefreshCw size={18} /> : <WifiOff size={18} />}
      <span>
        {!isOnline
          ? t('common.offlineBanner')
          : `Syncing ${pendingReports.length} queued report${pendingReports.length === 1 ? '' : 's'}…`}
      </span>
    </div>
  );
}
