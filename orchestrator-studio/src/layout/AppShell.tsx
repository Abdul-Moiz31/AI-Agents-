import { Outlet } from 'react-router-dom';
import { NavTabs } from '../components/NavTabs.js';
import { TopBar } from '../components/TopBar.js';
import { useAppState } from '../context/AppStateContext.js';

export function AppShell() {
  const { meta } = useAppState();

  return (
    <div className="app-shell">
      <TopBar meta={meta} />
      <NavTabs />
      <div className="app-shell__main">
        <Outlet />
      </div>
    </div>
  );
}
