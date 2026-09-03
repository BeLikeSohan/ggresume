'use client';

import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  size = 'md',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: { container: 'w-6 h-6', stroke: 2.5 },
    md: { container: 'w-9 h-9', stroke: 3 },
    lg: { container: 'w-12 h-12', stroke: 3.5 },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3.5 animate-in fade-in duration-200">
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Outer subtle static track ring */}
        <svg
          className="w-full h-full text-slate-200"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            className="opacity-70"
          />
        </svg>

        {/* Animated active spinning arc */}
        <svg
          className="absolute inset-0 w-full h-full text-slate-900 animate-spin"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: '0.85s' }}
        >
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="55"
          />
        </svg>
      </div>

      {label && (
        <p className="text-xs font-medium text-slate-500 tracking-tight animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[42vh] w-full py-12">
      {content}
    </div>
  );
};
