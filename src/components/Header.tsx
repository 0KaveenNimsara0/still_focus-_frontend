import React from 'react';
import { NavLink } from 'react-router-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../utils/formatters';

interface HeaderProps {
  distractionFree: boolean;
  onToggleDistractionFree: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  distractionFree,
  onToggleDistractionFree,
}) => {
  return (
    <header
      className={cn(
        'w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between transition-opacity duration-300',
        distractionFree ? 'opacity-40 hover:opacity-100' : 'opacity-100'
      )}
      role="banner"
    >
      <div className="flex items-center gap-3">
        <NavLink
          to="/"
          className="group flex items-baseline gap-2.5 no-underline transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65816D] rounded"
          aria-label="STILL home page"
        >
          <span className="font-semibold tracking-[0.25em] text-sm uppercase text-[var(--text-app)]">
            STILL
          </span>
          <span className="text-xs text-[var(--text-subtle)] font-normal hidden sm:inline">
            A little room for your attention
          </span>
        </NavLink>
      </div>

      <nav className="flex items-center gap-1 sm:gap-2 text-xs" aria-label="Main Navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'px-3 py-1.5 rounded-full transition-colors font-medium',
              isActive
                ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]'
            )
          }
        >
          Workspace
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            cn(
              'px-3 py-1.5 rounded-full transition-colors font-medium',
              isActive
                ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]'
            )
          }
        >
          History
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'px-3 py-1.5 rounded-full transition-colors font-medium',
              isActive
                ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]'
            )
          }
        >
          Settings
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            cn(
              'px-3 py-1.5 rounded-full transition-colors font-medium',
              isActive
                ? 'bg-[var(--sage-muted)] text-[var(--text-app)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]'
            )
          }
        >
          About
        </NavLink>

        <div className="h-4 w-px bg-[var(--border-app)] mx-1" aria-hidden="true" />

        <button
          onClick={onToggleDistractionFree}
          className={cn(
            'p-1.5 rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-app)] hover:bg-[var(--surface-hover)]',
            distractionFree && 'text-[var(--accent-app)] bg-[var(--accent-light)]'
          )}
          title={distractionFree ? 'Exit distraction-free mode' : 'Enter distraction-free mode'}
          aria-label={distractionFree ? 'Exit distraction-free mode' : 'Enter distraction-free mode'}
        >
          {distractionFree ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </nav>
    </header>
  );
};
