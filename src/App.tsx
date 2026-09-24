import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import { TasksProvider } from './context/TasksContext';
import { HistoryProvider } from './context/HistoryContext';
import { TimerProvider } from './context/TimerContext';
import { AudioMixerProvider } from './context/AudioMixerContext';
import { Header } from './components/Header';
import { WorkspacePage } from './pages/WorkspacePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { cn } from './utils/formatters';

const AppContent: React.FC = () => {
  const { preferences } = usePreferences();
  const [distractionFree, setDistractionFree] = useState(false);

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col transition-colors duration-200',
        preferences.subtleTexture && 'bg-textured'
      )}
    >
      <Header
        distractionFree={distractionFree}
        onToggleDistractionFree={() => setDistractionFree(!distractionFree)}
      />

      <main className="flex-1 flex flex-col" role="main">
        <Routes>
          <Route
            path="/"
            element={
              <WorkspacePage
                distractionFree={distractionFree}
                onExitDistractionFree={() => setDistractionFree(false)}
              />
            }
          />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!distractionFree && (
        <footer className="py-4 text-center text-[11px] text-[var(--text-subtle)] border-t border-[var(--border-subtle)]">
          <span>STILL &middot; A little room for your attention</span>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <PreferencesProvider>
        <TasksProvider>
          <HistoryProvider>
            <TimerProvider>
              <AudioMixerProvider>
                <AppContent />
              </AudioMixerProvider>
            </TimerProvider>
          </HistoryProvider>
        </TasksProvider>
      </PreferencesProvider>
    </HashRouter>
  );
};

export default App;
