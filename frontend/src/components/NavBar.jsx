import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Map, Siren, Tent, FilePlus2, Radio, Users, HeartPulse, MessageCircle, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.js';

const PRIMARY = [
  { to: '/map', icon: Map, key: 'nav.map' },
  { to: '/sos', icon: Siren, key: 'nav.sos' },
  { to: '/shelters', icon: Tent, key: 'nav.shelters' },
  { to: '/report', icon: FilePlus2, key: 'nav.report' },
];

const SECONDARY = [
  { to: '/broadcasts', icon: Radio, key: 'nav.broadcasts' },
  { to: '/family', icon: Users, key: 'nav.family' },
  { to: '/first-aid', icon: HeartPulse, key: 'nav.firstAid' },
  { to: '/assistant', icon: MessageCircle, key: 'nav.assistant' },
  { to: '/admin', icon: LayoutDashboard, key: 'nav.admin' },
  { to: '/settings', icon: Settings, key: 'nav.settings' },
];

export function NavBar() {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="nav-bar" aria-label="Primary">
      <div className="nav-bar__primary">
        {PRIMARY.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMoreOpen(false)}
          >
            <Icon />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="nav-item nav-more-toggle"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          {moreOpen ? <X /> : <Menu />}
          <span>More</span>
        </button>
      </div>

      <div className="nav-more-sheet" hidden={!moreOpen}>
        {SECONDARY.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMoreOpen(false)}
          >
            <Icon />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
