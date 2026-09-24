import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import type { AppPreferences, ThemePreference, TimerPreferences } from '../types';
import { loadPreferences, savePreferences, clearAllAppData } from '../utils/storage';
import { soundEngine } from '../audio/soundEngine';

interface PreferencesContextType {
  preferences: AppPreferences;
  updateTimerPreferences: (timerPrefs: Partial<TimerPreferences>) => void;
  setTheme: (theme: ThemePreference) => void;
  setSubtleTexture: (enabled: boolean) => void;
  setSoundMixerMasterVolume: (vol: number) => void;
  setSoundMixerMuted: (muted: boolean) => void;
  setChannelVolume: (channelId: string, vol: number) => void;
  resetAllData: () => void;
  effectiveTheme: 'light' | 'dark';
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() => loadPreferences());
  const [, startTransition] = useTransition();

  // Determine system theme
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    preferences.theme === 'system' ? (systemIsDark ? 'dark' : 'light') : preferences.theme;

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  // Persist preferences on change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const updateTimerPreferences = useCallback((timerPrefs: Partial<TimerPreferences>) => {
    startTransition(() => {
      setPreferences(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          ...timerPrefs,
        },
      }));
    });
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    startTransition(() => {
      setPreferences(prev => ({
        ...prev,
        theme,
      }));
    });
  }, []);

  const setSubtleTexture = useCallback((enabled: boolean) => {
    startTransition(() => {
      setPreferences(prev => ({
        ...prev,
        subtleTexture: enabled,
      }));
    });
  }, []);

  const setSoundMixerMasterVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setPreferences(prev => ({
      ...prev,
      soundMixerMasterVolume: clamped,
    }));
    soundEngine.setMasterVolume(clamped, preferences.soundMixerMuted);
  }, [preferences.soundMixerMuted]);

  const setSoundMixerMuted = useCallback((muted: boolean) => {
    setPreferences(prev => ({
      ...prev,
      soundMixerMuted: muted,
    }));
    soundEngine.setMasterVolume(preferences.soundMixerMasterVolume, muted);
  }, [preferences.soundMixerMasterVolume]);

  const setChannelVolume = useCallback((channelId: string, vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setPreferences(prev => ({
      ...prev,
      channelVolumes: {
        ...prev.channelVolumes,
        [channelId]: clamped,
      },
    }));
  }, []);

  const resetAllData = useCallback(() => {
    soundEngine.stopAll();
    clearAllAppData();
    window.location.reload();
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateTimerPreferences,
        setTheme,
        setSubtleTexture,
        setSoundMixerMasterVolume,
        setSoundMixerMuted,
        setChannelVolume,
        resetAllData,
        effectiveTheme,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextType {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
