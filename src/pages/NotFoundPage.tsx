import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
      <Compass size={44} className="text-[var(--text-subtle)] mb-4 animate-spin-slow opacity-60" />
      <h1 className="text-3xl font-light text-[var(--text-app)] mb-2">
        Page Not Found
      </h1>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6">
        The path you were looking for does not exist in this workspace. Take a breath and return to the main room.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-app)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium rounded-full shadow-xs transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Return to Workspace</span>
      </Link>
    </div>
  );
};
