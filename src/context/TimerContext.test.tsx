import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerProvider, useTimer } from './TimerContext';
import { PreferencesProvider } from './PreferencesContext';
import { TasksProvider } from './TasksContext';
import { HistoryProvider, useHistory } from './HistoryContext';

// Test Consumer component to inspect and trigger timer behaviors
const TestConsumer: React.FC = () => {
  const {
    mode,
    isRunning,
    remainingSeconds,
    completedFocusCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  } = useTimer();

  const { history } = useHistory();

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="is-running">{isRunning ? 'running' : 'stopped'}</div>
      <div data-testid="remaining">{remainingSeconds}</div>
      <div data-testid="completed-count">{completedFocusCount}</div>
      <div data-testid="history-count">{history.length}</div>
      <button data-testid="btn-start" onClick={startTimer}>Start</button>
      <button data-testid="btn-pause" onClick={pauseTimer}>Pause</button>
      <button data-testid="btn-reset" onClick={resetTimer}>Reset</button>
      <button data-testid="btn-skip" onClick={skipTimer}>Skip</button>
    </div>
  );
};

const renderWithProviders = () => {
  return render(
    <PreferencesProvider>
      <TasksProvider>
        <HistoryProvider>
          <TimerProvider>
            <TestConsumer />
          </TimerProvider>
        </HistoryProvider>
      </TasksProvider>
    </PreferencesProvider>
  );
};

describe('TimerContext behavioral integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('starts, pauses, and resumes accurately', () => {
    renderWithProviders();

    expect(screen.getByTestId('mode').textContent).toBe('focus');
    expect(screen.getByTestId('is-running').textContent).toBe('stopped');
    expect(screen.getByTestId('remaining').textContent).toBe('1500'); // 25 mins

    // Start timer
    act(() => {
      fireEvent.click(screen.getByTestId('btn-start'));
    });
    expect(screen.getByTestId('is-running').textContent).toBe('running');

    // Advance 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByTestId('remaining').textContent).toBe('1490');

    // Pause timer
    act(() => {
      fireEvent.click(screen.getByTestId('btn-pause'));
    });
    expect(screen.getByTestId('is-running').textContent).toBe('stopped');

    // Advance another 10 seconds while paused - remaining should not decrease
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByTestId('remaining').textContent).toBe('1490');
  });

  it('resets timer duration to the beginning', () => {
    renderWithProviders();

    act(() => {
      fireEvent.click(screen.getByTestId('btn-start'));
    });

    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(screen.getByTestId('remaining').textContent).toBe('1470');

    act(() => {
      fireEvent.click(screen.getByTestId('btn-reset'));
    });
    expect(screen.getByTestId('remaining').textContent).toBe('1500');
    expect(screen.getByTestId('is-running').textContent).toBe('stopped');
  });

  it('records completion exactly once and advances cycle count', () => {
    renderWithProviders();

    act(() => {
      fireEvent.click(screen.getByTestId('btn-start'));
    });

    // Advance past session completion (25 minutes = 1,500,000 ms)
    act(() => {
      vi.advanceTimersByTime(1505000);
    });

    // Should transition to short break
    expect(screen.getByTestId('mode').textContent).toBe('shortBreak');
    expect(screen.getByTestId('completed-count').textContent).toBe('1');
    expect(screen.getByTestId('history-count').textContent).toBe('1');

    // Advance further - should not duplicate history entries
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByTestId('history-count').textContent).toBe('1');
  });

  it('does NOT count skipped sessions as completed focus sessions', () => {
    renderWithProviders();

    act(() => {
      fireEvent.click(screen.getByTestId('btn-start'));
      vi.advanceTimersByTime(20000);
      fireEvent.click(screen.getByTestId('btn-skip'));
    });

    // Should transition to break without adding to completed focus count or history
    expect(screen.getByTestId('mode').textContent).toBe('shortBreak');
    expect(screen.getByTestId('completed-count').textContent).toBe('0');
    expect(screen.getByTestId('history-count').textContent).toBe('0');
  });
});
