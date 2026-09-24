import { describe, it, expect } from 'vitest';
import { getDurationSecondsForMode, getNextMode, calculateRemainingSeconds } from './timerCore';
import type { TimerPreferences } from '../types';

const mockPrefs: TimerPreferences = {
  focusDurationMinutes: 25,
  shortBreakDurationMinutes: 5,
  longBreakDurationMinutes: 15,
  longBreakInterval: 4,
  autoStartNextSession: false,
  completionSoundEnabled: true,
  completionSoundVolume: 0.6,
};

describe('timerCore', () => {
  describe('getDurationSecondsForMode', () => {
    it('returns exact duration seconds for each mode', () => {
      expect(getDurationSecondsForMode('focus', mockPrefs)).toBe(1500);
      expect(getDurationSecondsForMode('shortBreak', mockPrefs)).toBe(300);
      expect(getDurationSecondsForMode('longBreak', mockPrefs)).toBe(900);
    });

    it('enforces a minimum duration of 1 second', () => {
      const edgePrefs: TimerPreferences = {
        ...mockPrefs,
        focusDurationMinutes: 0,
      };
      expect(getDurationSecondsForMode('focus', edgePrefs)).toBe(1);
    });
  });

  describe('getNextMode & cycle intervals', () => {
    it('cycles from focus to short break if under longBreakInterval', () => {
      const res1 = getNextMode('focus', 0, 4);
      expect(res1.nextMode).toBe('shortBreak');
      expect(res1.nextCompletedCount).toBe(1);

      const res2 = getNextMode('focus', 1, 4);
      expect(res2.nextMode).toBe('shortBreak');
      expect(res2.nextCompletedCount).toBe(2);

      const res3 = getNextMode('focus', 2, 4);
      expect(res3.nextMode).toBe('shortBreak');
      expect(res3.nextCompletedCount).toBe(3);
    });

    it('triggers long break once interval threshold is reached and resets counter', () => {
      const res4 = getNextMode('focus', 3, 4);
      expect(res4.nextMode).toBe('longBreak');
      expect(res4.nextCompletedCount).toBe(0);
    });

    it('returns to focus after short break and preserves counter', () => {
      const res = getNextMode('shortBreak', 2, 4);
      expect(res.nextMode).toBe('focus');
      expect(res.nextCompletedCount).toBe(2);
    });

    it('returns to focus after long break and preserves counter', () => {
      const res = getNextMode('longBreak', 0, 4);
      expect(res.nextMode).toBe('focus');
      expect(res.nextCompletedCount).toBe(0);
    });
  });

  describe('calculateRemainingSeconds', () => {
    it('returns paused remaining seconds if timer is not running', () => {
      expect(calculateRemainingSeconds(false, 1500, 1200, null, 100000)).toBe(1200);
      expect(calculateRemainingSeconds(false, 1500, 1600, null, 100000)).toBe(1500);
    });

    it('calculates remaining seconds accurately using timestamps', () => {
      const endTimestamp = 200000;
      // 10 seconds before deadline
      expect(calculateRemainingSeconds(true, 1500, 1500, endTimestamp, 190000)).toBe(10);
      // 1.2 seconds before deadline rounds up to 2 seconds for smooth display
      expect(calculateRemainingSeconds(true, 1500, 1500, endTimestamp, 198800)).toBe(2);
      // At deadline
      expect(calculateRemainingSeconds(true, 1500, 1500, endTimestamp, 200000)).toBe(0);
      // Past deadline (e.g. background tab delayed execution)
      expect(calculateRemainingSeconds(true, 1500, 1500, endTimestamp, 250000)).toBe(0);
    });
  });
});
