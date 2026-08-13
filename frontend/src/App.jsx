import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AlertStrip } from './components/AlertStrip.jsx';
import { NavBar } from './components/NavBar.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';

import { MapView } from './views/MapView.jsx';
import { SOSView } from './views/SOSView.jsx';
import { SheltersView } from './views/SheltersView.jsx';
import { ReportView } from './views/ReportView.jsx';
import { BroadcastsView } from './views/BroadcastsView.jsx';
import { FamilyView } from './views/FamilyView.jsx';
import { FirstAidView } from './views/FirstAidView.jsx';
import { AIAssistantView } from './views/AIAssistantView.jsx';
import { AdminView } from './views/AdminView.jsx';
import { SettingsView } from './views/SettingsView.jsx';

export default function App() {
  const location = useLocation();
  const isConsole = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell" data-surface={isConsole ? 'console' : 'paper'}>
      <AlertStrip />
      <div className="app-body">
        <NavBar />
        <main className={`app-main${isConsole ? ' app-main--console' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/sos" element={<SOSView />} />
            <Route path="/shelters" element={<SheltersView />} />
            <Route path="/report" element={<ReportView />} />
            <Route path="/broadcasts" element={<BroadcastsView />} />
            <Route path="/family" element={<FamilyView />} />
            <Route path="/first-aid" element={<FirstAidView />} />
            <Route path="/assistant" element={<AIAssistantView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </main>
      </div>
      <OfflineBanner />
    </div>
  );
}
