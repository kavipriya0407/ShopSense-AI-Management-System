import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; height?: string; className?: string }> = ({
  count = 1,
  height = 'h-6',
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl glass-card space-y-3">
          <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  );
};
