import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import type { SessionRecord } from '../types';
import { loadHistory, saveHistory } from '../utils/storage';
import { generateId } from '../utils/formatters';

interface HistoryContextType {
  history: SessionRecord[];
  addCompletedSession: (record: Omit<SessionRecord, 'id'>) => void;
  clearHistory: () => void;
  totalFocusSeconds: number;
  totalCompletedSessions: number;
  groupedByDay: Record<string, SessionRecord[]>;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

// Format date key in user's local timezone (YYYY-MM-DD)
export function getLocalDateKey(timestampMs: number): string {
  const d = new Date(timestampMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SessionRecord[]>(() => loadHistory());
  const [, startTransition] = useTransition();

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addCompletedSession = useCallback((record: Omit<SessionRecord, 'id'>) => {
    const newRecord: SessionRecord = {
      ...record,
      id: generateId(),
    };
    startTransition(() => {
      setHistory(prev => [newRecord, ...prev]);
    });
  }, []);

  const clearHistory = useCallback(() => {
    startTransition(() => {
      setHistory([]);
    });
  }, []);

  // Compute aggregated stats
  const totalFocusSeconds = history
    .filter(s => s.mode === 'focus')
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const totalCompletedSessions = history.filter(s => s.mode === 'focus').length;

  // Group by local day
  const groupedByDay: Record<string, SessionRecord[]> = {};
  for (const session of history) {
    const dayKey = getLocalDateKey(session.completedAt);
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(session);
  }

  return (
    <HistoryContext.Provider
      value={{
        history,
        addCompletedSession,
        clearHistory,
        totalFocusSeconds,
        totalCompletedSessions,
        groupedByDay,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export function useHistory(): HistoryContextType {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return ctx;
}
