import React, { useState } from 'react';
import { useHistory } from '../context/HistoryContext';
import { formatDurationHuman } from '../utils/formatters';
import { Clock, CheckCircle2, Calendar, Trash2, ShieldAlert } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const {
    history,
    clearHistory,
    totalFocusSeconds,
    totalCompletedSessions,
    groupedByDay,
  } = useHistory();

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Sorted day keys (most recent first)
  const sortedDays = Object.keys(groupedByDay).sort().reverse();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header and overview stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[var(--text-app)] mb-1">
            Focus History
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Sessions recorded locally on this device. Days are grouped using your browser’s local timezone.
          </p>
        </div>

        {history.length > 0 && (
          <div>
            {showConfirmClear ? (
              <div className="flex items-center gap-2 bg-[var(--surface-hover)] p-2 rounded-xl border border-[var(--border-app)] text-xs">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="text-[var(--text-muted)]">Clear all records?</span>
                <button
                  onClick={() => {
                    clearHistory();
                    setShowConfirmClear(false);
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-1 text-[var(--text-subtle)] hover:text-[var(--text-app)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)] hover:text-red-600 transition-colors px-3 py-1.5 rounded-full border border-[var(--border-app)] hover:border-red-300"
              >
                <Trash2 size={13} />
                <span>Clear history</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overview Cards (Real data, no fabricated streaks or gamification scores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-[var(--sage-muted)] text-[var(--text-app)] rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-subtle)] block">Total Focused Time</span>
            <span className="text-2xl font-mono text-[var(--text-app)]">
              {formatDurationHuman(totalFocusSeconds)}
            </span>
          </div>
        </div>

        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-[var(--sage-muted)] text-[var(--text-app)] rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-[var(--text-subtle)] block">Completed Sessions</span>
            <span className="text-2xl font-mono text-[var(--text-app)]">
              {totalCompletedSessions}
            </span>
          </div>
        </div>
      </div>

      {/* Session History List */}
      {history.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl">
          <Calendar size={32} className="mx-auto text-[var(--text-subtle)] mb-3 opacity-60" />
          <h2 className="text-base font-normal text-[var(--text-app)] mb-1">
            No focus sessions recorded yet
          </h2>
          <p className="text-xs text-[var(--text-subtle)] max-w-sm mx-auto">
            Start a focus session from the workspace. When you finish, your completed time and associated task title snapshot will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map(dayKey => {
            const daySessions = groupedByDay[dayKey] || [];
            const dayTotalSeconds = daySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

            // Nicely formatted date label
            const dateObj = new Date(daySessions[0].completedAt);
            const dateFormatted = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={dayKey}
                className="bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Day Header with total */}
                <div className="px-5 py-3.5 bg-[var(--surface-hover)] border-b border-[var(--border-app)] flex items-center justify-between text-xs">
                  <div className="font-medium text-[var(--text-app)] flex items-center gap-2">
                    <Calendar size={13} className="text-[var(--accent-app)]" />
                    <span>{dateFormatted}</span>
                  </div>
                  <span className="font-mono text-[var(--text-subtle)]">
                    {formatDurationHuman(dayTotalSeconds)} ({daySessions.length} sessions)
                  </span>
                </div>

                {/* Day Sessions Table */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {daySessions.map(session => {
                    const timeString = new Date(session.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={session.id}
                        className="px-5 py-3 flex items-center justify-between text-xs hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[var(--text-subtle)] w-14">
                            {timeString}
                          </span>
                          <div>
                            <span className="font-medium capitalize text-[var(--text-app)]">
                              {session.mode} session
                            </span>
                            {session.taskTitleSnapshot && (
                              <span className="ml-2 text-[var(--text-subtle)] text-[11px] bg-[var(--surface-hover)] px-2 py-0.5 rounded-full border border-[var(--border-app)]">
                                {session.taskTitleSnapshot}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="font-mono text-[var(--text-app)]">
                          {formatDurationHuman(session.durationSeconds)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
