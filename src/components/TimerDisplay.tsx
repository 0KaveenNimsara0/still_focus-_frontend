import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TasksContext';
import { formatTimeRemaining, cn } from '../utils/formatters';
import type { TimerMode } from '../types';

export const TimerDisplay: React.FC = () => {
  const {
    mode,
    isRunning,
    remainingSeconds,
    progressPercent,
    completedFocusCount,
    currentCycleGoal,
    selectedTaskId,
    statusMessage,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    selectMode,
  } = useTimer();

  const { getTaskById, toggleTaskCompletion } = useTasks();
  const activeTask = getTaskById(selectedTaskId);

  const formattedTime = formatTimeRemaining(remainingSeconds);

  const modes: { id: TimerMode; label: string }[] = [
    { id: 'focus', label: 'Focus' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center p-6 sm:p-10 w-full max-w-lg mx-auto text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Mode selection tabs */}
      <div
        className="flex items-center gap-1.5 p-1 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-full mb-8 shadow-xs"
        role="tablist"
        aria-label="Timer Mode"
      >
        {modes.map(m => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => selectMode(m.id)}
            className={cn(
              'px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150',
              mode === m.id
                ? 'bg-[var(--accent-app)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Countdown numerals */}
      <div className="relative flex flex-col items-center justify-center my-2 select-none">
        <div
          className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tighter text-[var(--text-app)] font-mono tabular-nums leading-none py-2"
          aria-label={`Time remaining: ${formattedTime}`}
        >
          {formattedTime}
        </div>

        {/* Subtle progress ring / bar */}
        <div
          className="w-48 sm:w-64 h-1 bg-[var(--border-subtle)] rounded-full mt-4 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Timer session progress"
        >
          <div
            className="h-full bg-[var(--accent-app)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active task snapshot chip */}
      {activeTask && (
        <div className="mt-6 flex items-center gap-2 max-w-xs px-3.5 py-1.5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-full text-xs text-[var(--text-muted)]">
          <button
            onClick={() => toggleTaskCompletion(activeTask.id)}
            className={cn(
              'transition-colors',
              activeTask.isCompleted ? 'text-[var(--accent-app)]' : 'text-[var(--text-subtle)] hover:text-[var(--text-app)]'
            )}
            title={activeTask.isCompleted ? 'Mark uncompleted' : 'Mark task completed'}
            aria-label={activeTask.isCompleted ? 'Mark uncompleted' : 'Mark task completed'}
          >
            <CheckCircle2 size={14} />
          </button>
          <span className={cn('truncate', activeTask.isCompleted && 'line-through opacity-60')}>
            {activeTask.title}
          </span>
        </div>
      )}

      {/* Primary and secondary timer controls */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8">
        <button
          onClick={resetTimer}
          className="p-3 text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)] rounded-full transition-colors border border-transparent hover:border-[var(--border-app)]"
          title="Reset timer to beginning"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="px-8 py-3.5 bg-[var(--accent-app)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm rounded-full shadow-xs transition-all flex items-center gap-2 active:scale-98"
          title={isRunning ? 'Pause timer' : 'Start timer'}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <>
              <Pause size={18} fill="currentColor" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={skipTimer}
          className="p-3 text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)] rounded-full transition-colors border border-transparent hover:border-[var(--border-app)]"
          title="Skip to next session"
          aria-label="Skip session"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Cycle indicators & quiet status message */}
      <div className="mt-8 flex flex-col items-center gap-2 text-xs text-[var(--text-subtle)]">
        <div className="flex items-center gap-1.5" title={`Session ${completedFocusCount} of ${currentCycleGoal} completed before long break`}>
          {Array.from({ length: currentCycleGoal }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index < completedFocusCount
                  ? 'bg-[var(--accent-app)] scale-110'
                  : 'bg-[var(--border-app)]'
              )}
            />
          ))}
          <span className="ml-2 font-mono text-[11px]">
            {completedFocusCount}/{currentCycleGoal}
          </span>
        </div>

        <p className="font-light tracking-wide text-xs text-[var(--text-muted)]">
          {statusMessage}
        </p>
      </div>
    </div>
  );
};
