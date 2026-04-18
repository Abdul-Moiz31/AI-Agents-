import { NavLink } from 'react-router-dom';

const tabs: { to: string; end?: boolean; label: string; hint: string }[] = [
  { to: '/', end: true, label: 'Home', hint: 'Overview' },
  { to: '/console', label: 'Console', hint: 'Unified agent' },
  { to: '/tools', label: 'Tools', hint: 'Specialists' },
];

export function NavTabs() {
  return (
    <nav className="subnav" aria-label="Primary">
      <div className="subnav__inner">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `subnav__link${isActive ? ' is-active' : ''}`}
          >
            <span className="subnav__label">{t.label}</span>
            <span className="subnav__hint">{t.hint}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
