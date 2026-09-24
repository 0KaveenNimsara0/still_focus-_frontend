export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerPreferences {
  focusDurationMinutes: number;
  shortBreakDurationMinutes: number;
  longBreakDurationMinutes: number;
  longBreakInterval: number; // completed focus sessions before long break
  autoStartNextSession: boolean;
  completionSoundEnabled: boolean;
  completionSoundVolume: number; // 0 to 1
}

export interface StoredTimerState {
  version: number;
  mode: TimerMode;
  isRunning: boolean;
  durationSeconds: number;
  remainingSeconds: number; // calculated snapshot when paused or saved
  endTimestampMs: number | null; // null if paused / not running
  completedFocusCount: number; // count of completed focus sessions in current cycle
  selectedTaskId: string | null;
  lastUpdatedMs: number;
}

export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  taskTitleSnapshot?: string;
  taskId?: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppPreferences {
  timer: TimerPreferences;
  theme: ThemePreference;
  subtleTexture: boolean;
  soundMixerMasterVolume: number;
  soundMixerMuted: boolean;
  channelVolumes: Record<string, number>;
}
