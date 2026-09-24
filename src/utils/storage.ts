import type { AppPreferences, StoredTimerState, TaskItem, SessionRecord } from '../types';

export const STORAGE_KEYS = {
  PREFERENCES: 'still_preferences_v1',
  TIMER_STATE: 'still_timer_state_v1',
  TASKS: 'still_tasks_v1',
  HISTORY: 'still_history_v1',
} as const;

export const DEFAULT_PREFERENCES: AppPreferences = {
  timer: {
    focusDurationMinutes: 25,
    shortBreakDurationMinutes: 5,
    longBreakDurationMinutes: 15,
    longBreakInterval: 4,
    autoStartNextSession: false,
    completionSoundEnabled: true,
    completionSoundVolume: 0.6,
  },
  theme: 'system',
  subtleTexture: false,
  soundMixerMasterVolume: 0.7,
  soundMixerMuted: false,
  channelVolumes: {
    rain: 0.5,
    waves: 0.4,
    forest: 0.4,
    noise: 0.25,
  },
};

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'sample-task-1',
    title: 'Review quiet notes',
    isCompleted: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-task-2',
    title: 'Sketch structure for chapter 3',
    isCompleted: false,
    createdAt: Date.now() - 1800000,
  },
];

// Helper to check if localStorage is accessible
function isStorageAvailable(): boolean {
  try {
    const testKey = '__still_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadPreferences(): AppPreferences {
  if (!isStorageAvailable()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES;

    // Gracefully merge with defaults in case of missing keys
    return {
      timer: {
        focusDurationMinutes: Number(parsed.timer?.focusDurationMinutes) || DEFAULT_PREFERENCES.timer.focusDurationMinutes,
        shortBreakDurationMinutes: Number(parsed.timer?.shortBreakDurationMinutes) || DEFAULT_PREFERENCES.timer.shortBreakDurationMinutes,
        longBreakDurationMinutes: Number(parsed.timer?.longBreakDurationMinutes) || DEFAULT_PREFERENCES.timer.longBreakDurationMinutes,
        longBreakInterval: Number(parsed.timer?.longBreakInterval) || DEFAULT_PREFERENCES.timer.longBreakInterval,
        autoStartNextSession: Boolean(parsed.timer?.autoStartNextSession ?? DEFAULT_PREFERENCES.timer.autoStartNextSession),
        completionSoundEnabled: Boolean(parsed.timer?.completionSoundEnabled ?? DEFAULT_PREFERENCES.timer.completionSoundEnabled),
        completionSoundVolume: typeof parsed.timer?.completionSoundVolume === 'number' ? parsed.timer.completionSoundVolume : DEFAULT_PREFERENCES.timer.completionSoundVolume,
      },
      theme: ['light', 'dark', 'system'].includes(parsed.theme) ? parsed.theme : 'system',
      subtleTexture: Boolean(parsed.subtleTexture ?? false),
      soundMixerMasterVolume: typeof parsed.soundMixerMasterVolume === 'number' ? parsed.soundMixerMasterVolume : DEFAULT_PREFERENCES.soundMixerMasterVolume,
      soundMixerMuted: Boolean(parsed.soundMixerMuted ?? false),
      channelVolumes: {
        ...DEFAULT_PREFERENCES.channelVolumes,
        ...(parsed.channelVolumes && typeof parsed.channelVolumes === 'object' ? parsed.channelVolumes : {}),
      },
    };
  } catch (e) {
    console.warn('[STILL] Failed to read preferences from storage, using defaults:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: AppPreferences): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.warn('[STILL] Failed to persist preferences:', e);
  }
}

export function loadStoredTimerState(): StoredTimerState | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return null;
    return parsed as StoredTimerState;
  } catch {
    return null;
  }
}

export function saveStoredTimerState(state: StoredTimerState | null): void {
  if (!isStorageAvailable()) return;
  try {
    if (state === null) {
      window.localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
    } else {
      window.localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
    }
  } catch (e) {
    console.warn('[STILL] Failed to persist timer state:', e);
  }
}

export function loadTasks(): TaskItem[] {
  if (!isStorageAvailable()) return DEFAULT_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TASKS;
    return parsed.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string');
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('[STILL] Failed to persist tasks:', e);
  }
}

export function loadHistory(): SessionRecord[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(s => s && typeof s.id === 'string' && typeof s.durationSeconds === 'number');
  } catch {
    return [];
  }
}

export function saveHistory(records: SessionRecord[]): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
  } catch (e) {
    console.warn('[STILL] Failed to persist history:', e);
  }
}

export function clearAllAppData(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    window.localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
    window.localStorage.removeItem(STORAGE_KEYS.TASKS);
    window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.warn('[STILL] Failed to clear app data:', e);
  }
}
