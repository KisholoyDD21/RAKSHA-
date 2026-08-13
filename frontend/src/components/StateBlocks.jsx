import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state-block">
      <Loader2 className="spin" size={28} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ label }) {
  return (
    <div className="state-block">
      <Inbox size={28} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ label, onRetry }) {
  return (
    <div className="state-block">
      <AlertCircle size={28} />
      <span>{label}</span>
      {onRetry && (
        <button className="btn btn--outline btn--sm" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
