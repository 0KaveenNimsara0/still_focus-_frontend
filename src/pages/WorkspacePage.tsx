import React, { useState } from 'react';
import { TimerDisplay } from '../components/TimerDisplay';
import { TaskList } from '../components/TaskList';
import { SoundMixer } from '../components/SoundMixer';
import { Minimize2, CheckCircle2, Sliders } from 'lucide-react';
import { cn } from '../utils/formatters';

interface WorkspacePageProps {
  distractionFree: boolean;
  onExitDistractionFree: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  distractionFree,
  onExitDistractionFree,
}) => {
  const [mobileTab, setMobileTab] = useState<'tasks' | 'sounds'>('tasks');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col justify-center">
      {distractionFree ? (
        /* Distraction-Free Mode: Centered timer with minimal floating exit button */
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[70vh] py-6 animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--surface-app)] border border-[var(--border-app)] rounded-3xl p-2 sm:p-6 shadow-xs">
            <TimerDisplay />
          </div>
          <button
            type="button"
            onClick={onExitDistractionFree}
            className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[var(--text-muted)] hover:text-[var(--text-app)] bg-[var(--surface-app)] border border-[var(--border-app)] hover:border-[var(--accent-app)] transition-colors shadow-2xs cursor-pointer"
            title="Exit distraction-free mode"
          >
            <Minimize2 size={14} />
            <span>Show workspace panels</span>
          </button>
        </div>
      ) : (
        /* Standard Workspace Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Focus Area (Center/Left) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[var(--surface-app)] border border-[var(--border-app)] rounded-3xl p-2 sm:p-6 shadow-xs">
              <TimerDisplay />
            </div>

            {/* Desktop sound mixer placed underneath the timer */}
            <div className="hidden lg:block">
              <SoundMixer />
            </div>
          </div>

          {/* Narrow Task Panel (Desktop right) & Mobile Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden items-center justify-center p-1 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-xl mb-1">
              <button
                onClick={() => setMobileTab('tasks')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors',
                  mobileTab === 'tasks'
                    ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                    : 'text-[var(--text-muted)]'
                )}
              >
                <CheckCircle2 size={13} />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setMobileTab('sounds')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors',
                  mobileTab === 'sounds'
                    ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                    : 'text-[var(--text-muted)]'
                )}
              >
                <Sliders size={13} />
                <span>Ambient Sound</span>
              </button>
            </div>

            {/* Desktop always renders TaskList; Mobile switches between TaskList and SoundMixer */}
            <div className={cn('w-full', mobileTab !== 'tasks' && 'hidden lg:block')}>
              <TaskList />
            </div>

            <div className={cn('w-full lg:hidden', mobileTab !== 'sounds' && 'hidden')}>
              <SoundMixer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
