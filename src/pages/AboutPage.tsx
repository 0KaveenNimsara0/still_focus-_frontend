import React from 'react';
import { Shield, HardDrive, Heart, Code2, Volume2, Clock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-[var(--text-app)] mb-2">
          About STILL
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          STILL is a quiet, distraction-free focus workspace designed as an antidote to productivity hype, competitive streaks, and noisy dashboards. It is “a little room for your attention.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-app)] font-medium text-xs uppercase tracking-wider">
            <Shield size={16} />
            <span>Zero Tracking & Zero Accounts</span>
          </div>
          <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
            There are no sign-ups, no user accounts, no analytics SDKs, and no telemetry trackers. The app runs completely on your machine.
          </p>
        </div>

        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-app)] font-medium text-xs uppercase tracking-wider">
            <HardDrive size={16} />
            <span>Local Storage Persistence</span>
          </div>
          <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
            Your tasks, history, and sound preferences stay in your browser’s localStorage. They are never transmitted over the network or stored in external databases.
          </p>
        </div>

        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-app)] font-medium text-xs uppercase tracking-wider">
            <Volume2 size={16} />
            <span>Procedural Sound Synthesis</span>
          </div>
          <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
            Ambient sound textures (Gentle Rain, Ocean Swell, Forest Wind, Pink Noise) and session completion chimes are generated procedurally in real time via the Web Audio API without bulky audio files or third-party license complications.
          </p>
        </div>

        <div className="p-5 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-app)] font-medium text-xs uppercase tracking-wider">
            <Clock size={16} />
            <span>Reliable Timestamp Math</span>
          </div>
          <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
            The timer calculates elapsed time based on system timestamps rather than trusting variable interval ticks. If your computer sleeps or you switch tabs, STILL restores exact elapsed time without fabricating extra sessions.
          </p>
        </div>
      </div>

      <div className="p-6 bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-app)]">
          <Code2 size={16} className="text-[var(--accent-app)]" />
          <span>Open Source & MIT License</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          STILL is fully open-source software under the permissive MIT license. You can inspect the code, host it privately on your own static servers, or adapt it to your workflow.
        </p>
        <div className="text-xs text-[var(--text-subtle)] pt-2 border-t border-[var(--border-subtle)]">
          Built with React 19, TypeScript, Tailwind CSS, Lucide Icons, and Web Audio API.
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-subtle)] py-4">
        <span>Crafted with</span>
        <Heart size={13} className="text-[var(--accent-app)] fill-current" />
        <span>for deep work and calm focus.</span>
      </div>
    </div>
  );
};
