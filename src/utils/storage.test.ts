import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPreferences,
  savePreferences,
  loadTasks,
  saveTasks,
  loadHistory,
  saveHistory,
  clearAllAppData,
  DEFAULT_PREFERENCES,
} from './storage';
import type { TaskItem, SessionRecord } from '../types';

describe('storage utility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads default preferences when localStorage is empty', () => {
    const prefs = loadPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it('saves and loads customized preferences safely', () => {
    const customPrefs = {
      ...DEFAULT_PREFERENCES,
      theme: 'dark' as const,
      timer: {
        ...DEFAULT_PREFERENCES.timer,
        focusDurationMinutes: 50,
      },
    };
    savePreferences(customPrefs);
    const loaded = loadPreferences();
    expect(loaded.theme).toBe('dark');
    expect(loaded.timer.focusDurationMinutes).toBe(50);
  });

  it('recovers gracefully from malformed JSON in localStorage', () => {
    window.localStorage.setItem('still_preferences_v1', '{invalid-json');
    const prefs = loadPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it('saves and retrieves tasks', () => {
    const testTasks: TaskItem[] = [
      { id: '1', title: 'Task 1', isCompleted: false, createdAt: Date.now() },
      { id: '2', title: 'Task 2', isCompleted: true, createdAt: Date.now() },
    ];
    saveTasks(testTasks);
    const loaded = loadTasks();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].title).toBe('Task 1');
  });

  it('saves and retrieves session history records', () => {
    const records: SessionRecord[] = [
      {
        id: 'rec-1',
        mode: 'focus',
        startedAt: Date.now() - 1500000,
        completedAt: Date.now(),
        durationSeconds: 1500,
        taskTitleSnapshot: 'Focus task',
      },
    ];
    saveHistory(records);
    const loaded = loadHistory();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].taskTitleSnapshot).toBe('Focus task');
  });

  it('clears all application storage keys on clearAllAppData()', () => {
    saveTasks([{ id: '1', title: 'T', isCompleted: false, createdAt: 1 }]);
    saveHistory([{ id: '1', mode: 'focus', startedAt: 0, completedAt: 1, durationSeconds: 1 }]);
    clearAllAppData();
    expect(window.localStorage.getItem('still_tasks_v1')).toBeNull();
    expect(window.localStorage.getItem('still_history_v1')).toBeNull();
  });
});
