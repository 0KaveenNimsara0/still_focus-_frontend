import React, { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import type { ThemePreference } from '../types';
import { Sun, Moon, Monitor, Sliders, Bell, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/formatters';

export const SettingsPage: React.FC = () => {
  const {
    preferences,
    updateTimerPreferences,
    setTheme,
    setSubtleTexture,
    resetAllData,
  } = usePreferences();

  const [confirmReset, setConfirmReset] = useState(false);

  const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={15} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={15} /> },
    { value: 'system', label: 'System', icon: <Monitor size={15} /> },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-app)] mb-1">
          Preferences & Data
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Configure timer intervals, theme tokens, and manage client-side state.
        </p>
      </div>

      <div className="space-y-6">
        {/* Timer Durations Section */}
        <div className="p-6 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sliders size={16} className="text-[var(--accent-app)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-app)]">
              Timer Durations
            </h2>
          </div>
          <p className="text-xs text-[var(--text-subtle)] mb-5">
            Note: Changes will take effect when the current session completes or when you reset the timer. Running sessions are preserved.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-app)] mb-1">
                Focus (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={preferences.timer.focusDurationMinutes}
                onChange={e =>
                  updateTimerPreferences({
                    focusDurationMinutes: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[var(--surface-hover)] border border-[var(--border-app)] rounded-lg text-[var(--text-app)] focus:outline-none focus:border-[var(--accent-app)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-app)] mb-1">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={preferences.timer.shortBreakDurationMinutes}
                onChange={e =>
                  updateTimerPreferences({
                    shortBreakDurationMinutes: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[var(--surface-hover)] border border-[var(--border-app)] rounded-lg text-[var(--text-app)] focus:outline-none focus:border-[var(--accent-app)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-app)] mb-1">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={preferences.timer.longBreakDurationMinutes}
                onChange={e =>
                  updateTimerPreferences({
                    longBreakDurationMinutes: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[var(--surface-hover)] border border-[var(--border-app)] rounded-lg text-[var(--text-app)] focus:outline-none focus:border-[var(--accent-app)]"
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <label className="block text-xs font-medium text-[var(--text-app)] mb-1">
              Long Break Interval (completed focus sessions)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={preferences.timer.longBreakInterval}
                onChange={e =>
                  updateTimerPreferences({
                    longBreakInterval: parseInt(e.target.value) || 4,
                  })
                }
                className="w-48 accent-[var(--accent-app)] h-1.5 cursor-pointer bg-[var(--border-app)] rounded-lg"
              />
              <span className="text-xs font-mono text-[var(--text-app)]">
                Every {preferences.timer.longBreakInterval} sessions
              </span>
            </div>
          </div>
        </div>

        {/* Behavior & Sound */}
        <div className="p-6 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-[var(--accent-app)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-app)]">
              Session Automation & Chimes
            </h2>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-medium block text-[var(--text-app)]">
                Auto-start next session
              </span>
              <span className="text-[11px] text-[var(--text-subtle)] block">
                Automatically transition between focus and break modes when time elapses
              </span>
            </div>
            <button
              onClick={() =>
                updateTimerPreferences({
                  autoStartNextSession: !preferences.timer.autoStartNextSession,
                })
              }
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                preferences.timer.autoStartNextSession
                  ? 'bg-[var(--accent-app)]'
                  : 'bg-[var(--border-app)]'
              )}
              aria-label="Toggle auto-start next session"
            >
              <div
                className={cn(
                  'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                  preferences.timer.autoStartNextSession ? 'left-5' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-medium block text-[var(--text-app)]">
                Completion chime
              </span>
              <span className="text-[11px] text-[var(--text-subtle)] block">
                Play a gentle acoustic chime when a session finishes
              </span>
            </div>
            <button
              onClick={() =>
                updateTimerPreferences({
                  completionSoundEnabled: !preferences.timer.completionSoundEnabled,
                })
              }
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                preferences.timer.completionSoundEnabled
                  ? 'bg-[var(--accent-app)]'
                  : 'bg-[var(--border-app)]'
              )}
              aria-label="Toggle completion sound"
            >
              <div
                className={cn(
                  'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                  preferences.timer.completionSoundEnabled ? 'left-5' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="p-6 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[var(--accent-app)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-app)]">
              Appearance
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-app)] mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2">
              {themeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors',
                    preferences.theme === opt.value
                      ? 'bg-[var(--accent-app)] text-white border-[var(--accent-app)]'
                      : 'bg-[var(--surface-hover)] border-[var(--border-app)] text-[var(--text-muted)] hover:text-[var(--text-app)]'
                  )}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-medium block text-[var(--text-app)]">
                Subtle paper texture
              </span>
              <span className="text-[11px] text-[var(--text-subtle)] block">
                Add an understated tactile grain to the background
              </span>
            </div>
            <button
              onClick={() => setSubtleTexture(!preferences.subtleTexture)}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                preferences.subtleTexture ? 'bg-[var(--accent-app)]' : 'bg-[var(--border-app)]'
              )}
              aria-label="Toggle subtle texture"
            >
              <div
                className={cn(
                  'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                  preferences.subtleTexture ? 'left-5' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Local Storage Data Management */}
        <div className="p-6 bg-[var(--surface-app)] border border-red-200 dark:border-red-950/40 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <RefreshCw size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Local Data Controls
            </h2>
          </div>
          <p className="text-xs text-[var(--text-subtle)] mb-4">
            STILL stores preferences, task items, timer states, and history in your browser’s localStorage. No data is ever transmitted to a server.
          </p>

          {confirmReset ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-xs">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block text-red-700 dark:text-red-400">
                  Reset everything?
                </span>
                <span className="text-[11px] text-red-600/80">
                  This permanently removes your tasks, saved history, and custom settings.
                </span>
              </div>
              <button
                onClick={resetAllData}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-[var(--text-subtle)] hover:text-[var(--text-app)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors"
            >
              Reset All Local App Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
