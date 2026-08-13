export function StatusBadge({ color = 'neutral', children }) {
  return <span className={`badge badge--${color}`}>{children}</span>;
}
