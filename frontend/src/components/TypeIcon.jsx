import { DynamicIcon } from './DynamicIcon.jsx';
import { ALERT_COLOR_HEX } from '../utils/typeConfig.js';

/** Small colored icon chip used on map popups, lists, and the report form. */
export function TypeIcon({ iconName, color = 'ink' }) {
  const bg = ALERT_COLOR_HEX[color] || null;
  const style = bg
    ? { background: `${bg}22`, color: bg }
    : { background: 'var(--paper-muted)', color: 'var(--ink-soft)' };
  return (
    <span className="type-icon" style={style}>
      <DynamicIcon name={iconName} />
    </span>
  );
}
