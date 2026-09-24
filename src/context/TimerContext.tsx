import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { TimerMode, StoredTimerState } from '../types';
import { usePreferences } from './PreferencesContext';
import { useHistory } from './HistoryContext';
import { useTasks } from './TasksContext';
import { getDurationSecondsForMode, getNextMode, calculateRemainingSeconds } from '../timer/timerCore';
import { loadStoredTimerState, saveStoredTimerState } from '../utils/storage';
import { soundEngine } from '../audio/soundEngine';
import { formatTimeRemaining } from '../utils/formatters';

interface TimerContextType {
  mode: TimerMode;
  isRunning: boolean;
  durationSeconds: number;
  remainingSeconds: number;
  progressPercent: number; // 0 to 100
  completedFocusCount: number;
  currentCycleGoal: number;
  selectedTaskId: string | null;
  statusMessage: string;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  selectMode: (mode: TimerMode) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const { addCompletedSession } = useHistory();
  const { selectedTaskId, getTaskById } = useTasks();

  // Load initial state or defaults synchronously from localStorage
  const [initialSaved] = useState<StoredTimerState | null>(() => loadStoredTimerState());

  const [mode, setMode] = useState<TimerMode>(() => {
    return initialSaved ? initialSaved.mode : 'focus';
  });

  const [completedFocusCount, setCompletedFocusCount] = useState<number>(() => {
    return initialSaved ? initialSaved.completedFocusCount || 0 : 0;
  });

  const [durationSeconds, setDurationSeconds] = useState<number>(() => {
    if (initialSaved) return initialSaved.durationSeconds;
    return getDurationSecondsForMode('focus', preferences.timer);
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (initialSaved) {
      if (initialSaved.isRunning && initialSaved.endTimestampMs) {
        const now = Date.now();
        if (now >= initialSaved.endTimestampMs) {
          return 0;
        }
        return calculateRemainingSeconds(true, initialSaved.durationSeconds, initialSaved.remainingSeconds, initialSaved.endTimestampMs, now);
      }
      return initialSaved.remainingSeconds;
    }
    return getDurationSecondsForMode('focus', preferences.timer);
  });

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    if (initialSaved && initialSaved.isRunning && initialSaved.endTimestampMs) {
      return Date.now() < initialSaved.endTimestampMs;
    }
    return false;
  });

  const [endTimestampMs, setEndTimestampMs] = useState<number | null>(() => {
    if (initialSaved && initialSaved.isRunning && initialSaved.endTimestampMs) {
      return Date.now() < initialSaved.endTimestampMs ? initialSaved.endTimestampMs : null;
    }
    return null;
  });

  const [statusMessage, setStatusMessage] = useState<string>(() => {
    if (initialSaved) {
      if (initialSaved.isRunning && initialSaved.endTimestampMs) {
        return Date.now() >= initialSaved.endTimestampMs
          ? (initialSaved.mode === 'focus' ? 'Session completed while away' : 'Break ended while away')
          : (initialSaved.mode === 'focus' ? 'Focusing' : 'Resting');
      }
      return 'Paused';
    }
    return 'Ready to begin focus';
  });

  // Track session start timestamp to record session history faithfully
  const sessionStartedAtRef = useRef<number>(Date.now());
  // Prevent double completion trigger
  const completionTriggeredRef = useRef<boolean>(false);

  // Check if session completed while away and record it once
  useEffect(() => {
    if (initialSaved && initialSaved.isRunning && initialSaved.endTimestampMs) {
      const now = Date.now();
      if (now >= initialSaved.endTimestampMs) {
        if (initialSaved.mode === 'focus') {
          const taskSnapshot = initialSaved.selectedTaskId ? getTaskById(initialSaved.selectedTaskId)?.title : undefined;
          addCompletedSession({
            mode: 'focus',
            startedAt: initialSaved.lastUpdatedMs - initialSaved.durationSeconds * 1000,
            completedAt: initialSaved.endTimestampMs,
            durationSeconds: initialSaved.durationSeconds,
            taskTitleSnapshot: taskSnapshot,
            taskId: initialSaved.selectedTaskId || undefined,
          });
        }
        const next = getNextMode(initialSaved.mode, initialSaved.completedFocusCount || 0, preferences.timer.longBreakInterval);
        setMode(next.nextMode);
        setCompletedFocusCount(next.nextCompletedCount);
        const nextDur = getDurationSecondsForMode(next.nextMode, preferences.timer);
        setDurationSeconds(nextDur);
        setRemainingSeconds(nextDur);
      }
    }
  }, []);

  // Timer interval using requestAnimationFrame or setInterval with timestamp math
  useEffect(() => {
    if (!isRunning || endTimestampMs === null) return;

    completionTriggeredRef.current = false;

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const diffMs = endTimestampMs - now;
      const rem = Math.max(0, Math.ceil(diffMs / 1000));

      if (rem <= 0) {
        window.clearInterval(intervalId);
        if (!completionTriggeredRef.current) {
          completionTriggeredRef.current = true;
          handleSessionCompletion();
        }
      } else {
        setRemainingSeconds(rem);
      }
    }, 250); // 250ms check ensures smooth, drift-free timestamp updates

    return () => window.clearInterval(intervalId);
  }, [isRunning, endTimestampMs, durationSeconds]);

  // Persist timer state to survive reloads
  useEffect(() => {
    const state: StoredTimerState = {
      version: 1,
      mode,
      isRunning,
      durationSeconds,
      remainingSeconds,
      endTimestampMs,
      completedFocusCount,
      selectedTaskId,
      lastUpdatedMs: Date.now(),
    };
    saveStoredTimerState(state);
  }, [mode, isRunning, durationSeconds, remainingSeconds, endTimestampMs, completedFocusCount, selectedTaskId]);

  // Document title updates
  useEffect(() => {
    const formatted = formatTimeRemaining(remainingSeconds);
    const modeName = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    if (isRunning) {
      document.title = `${formatted} · ${modeName} | STILL`;
    } else {
      document.title = 'STILL — Calm Focus Workspace';
    }
  }, [remainingSeconds, mode, isRunning]);

  // Handle session completion
  const handleSessionCompletion = useCallback(() => {
    setIsRunning(false);
    setEndTimestampMs(null);
    setRemainingSeconds(0);

    // Play chime if enabled
    if (preferences.timer.completionSoundEnabled) {
      soundEngine.playCompletionChime(preferences.timer.completionSoundVolume);
    }

    // Record session if it was a focus mode session
    if (mode === 'focus') {
      const activeTask = getTaskById(selectedTaskId);
      addCompletedSession({
        mode: 'focus',
        startedAt: sessionStartedAtRef.current,
        completedAt: Date.now(),
        durationSeconds,
        taskTitleSnapshot: activeTask ? activeTask.title : undefined,
        taskId: selectedTaskId || undefined,
      });
    }

    // Determine next mode
    const { nextMode, nextCompletedCount } = getNextMode(
      mode,
      completedFocusCount,
      preferences.timer.longBreakInterval
    );

    setMode(nextMode);
    setCompletedFocusCount(nextCompletedCount);

    const nextDur = getDurationSecondsForMode(nextMode, preferences.timer);
    setDurationSeconds(nextDur);
    setRemainingSeconds(nextDur);

    if (preferences.timer.autoStartNextSession) {
      const now = Date.now();
      const endMs = now + nextDur * 1000;
      sessionStartedAtRef.current = now;
      setEndTimestampMs(endMs);
      setIsRunning(true);
      setStatusMessage(nextMode === 'focus' ? 'Focus started automatically' : 'Break started automatically');
    } else {
      setStatusMessage(mode === 'focus' ? 'Focus complete. Time to rest.' : 'Break finished. Ready when you are.');
    }
  }, [mode, durationSeconds, completedFocusCount, preferences.timer, selectedTaskId, getTaskById, addCompletedSession]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    const durToRun = remainingSeconds > 0 ? remainingSeconds : durationSeconds;
    const targetEnd = now + durToRun * 1000;
    sessionStartedAtRef.current = now - (durationSeconds - durToRun) * 1000;
    setEndTimestampMs(targetEnd);
    setIsRunning(true);
    setStatusMessage(mode === 'focus' ? 'Focus in progress' : 'Resting');
  }, [remainingSeconds, durationSeconds, mode]);

  const pauseTimer = useCallback(() => {
    if (!isRunning || endTimestampMs === null) return;
    const now = Date.now();
    const rem = calculateRemainingSeconds(true, durationSeconds, remainingSeconds, endTimestampMs, now);
    setRemainingSeconds(rem);
    setEndTimestampMs(null);
    setIsRunning(false);
    setStatusMessage('Paused');
  }, [isRunning, endTimestampMs, durationSeconds, remainingSeconds]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setEndTimestampMs(null);
    const dur = getDurationSecondsForMode(mode, preferences.timer);
    setDurationSeconds(dur);
    setRemainingSeconds(dur);
    setStatusMessage('Reset to beginning');
  }, [mode, preferences.timer]);

  const skipTimer = useCallback(() => {
    setIsRunning(false);
    setEndTimestampMs(null);

    // Reset or skipped sessions must NOT count as completed focus sessions
    const { nextCompletedCount } = getNextMode(
      mode,
      completedFocusCount,
      preferences.timer.longBreakInterval
    );

    // For skip: if skipping focus, don't increment completedFocusCount
    const effectiveCount = mode === 'focus' ? completedFocusCount : nextCompletedCount;
    const effectiveNextMode = mode === 'focus' ? 'shortBreak' : 'focus';

    setMode(effectiveNextMode);
    setCompletedFocusCount(effectiveCount);

    const nextDur = getDurationSecondsForMode(effectiveNextMode, preferences.timer);
    setDurationSeconds(nextDur);
    setRemainingSeconds(nextDur);
    setStatusMessage(`Skipped to ${effectiveNextMode === 'focus' ? 'Focus' : 'Break'}`);
  }, [mode, completedFocusCount, preferences.timer]);

  const selectMode = useCallback(
    (newMode: TimerMode) => {
      if (isRunning) {
        setIsRunning(false);
        setEndTimestampMs(null);
      }
      setMode(newMode);
      const dur = getDurationSecondsForMode(newMode, preferences.timer);
      setDurationSeconds(dur);
      setRemainingSeconds(dur);
      setStatusMessage(`Switched to ${newMode === 'focus' ? 'Focus' : newMode === 'shortBreak' ? 'Short Break' : 'Long Break'}`);
    },
    [isRunning, preferences.timer]
  );

  const progressPercent =
    durationSeconds > 0
      ? Math.max(0, Math.min(100, ((durationSeconds - remainingSeconds) / durationSeconds) * 100))
      : 0;

  return (
    <TimerContext.Provider
      value={{
        mode,
        isRunning,
        durationSeconds,
        remainingSeconds,
        progressPercent,
        completedFocusCount,
        currentCycleGoal: preferences.timer.longBreakInterval,
        selectedTaskId,
        statusMessage,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        selectMode,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export function useTimer(): TimerContextType {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return ctx;
}
