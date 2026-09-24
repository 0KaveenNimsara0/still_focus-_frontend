import type { TimerMode, TimerPreferences } from '../types';

export function getDurationSecondsForMode(mode: TimerMode, prefs: TimerPreferences): number {
  switch (mode) {
    case 'focus':
      return Math.max(1, Math.round(prefs.focusDurationMinutes * 60));
    case 'shortBreak':
      return Math.max(1, Math.round(prefs.shortBreakDurationMinutes * 60));
    case 'longBreak':
      return Math.max(1, Math.round(prefs.longBreakDurationMinutes * 60));
  }
}

export function getNextMode(
  currentMode: TimerMode,
  completedFocusCount: number,
  longBreakInterval: number
): { nextMode: TimerMode; nextCompletedCount: number } {
  if (currentMode === 'focus') {
    const updatedCount = completedFocusCount + 1;
    if (updatedCount >= longBreakInterval && longBreakInterval > 0) {
      return { nextMode: 'longBreak', nextCompletedCount: 0 };
    }
    return { nextMode: 'shortBreak', nextCompletedCount: updatedCount };
  } else {
    // Both shortBreak and longBreak lead back to focus
    return { nextMode: 'focus', nextCompletedCount: completedFocusCount };
  }
}

export function calculateRemainingSeconds(
  isRunning: boolean,
  durationSeconds: number,
  remainingSeconds: number,
  endTimestampMs: number | null,
  currentNowMs: number
): number {
  if (!isRunning || endTimestampMs === null) {
    return Math.max(0, Math.min(durationSeconds, remainingSeconds));
  }
  const diffMs = endTimestampMs - currentNowMs;
  return Math.max(0, Math.ceil(diffMs / 1000));
}
