import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext.js';
import { AppShell } from './layout/AppShell.js';
import { ConsolePage } from './pages/ConsolePage.js';
import { HomePage } from './pages/HomePage.js';
import { ToolsPage } from './pages/ToolsPage.js';

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="console" element={<ConsolePage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
