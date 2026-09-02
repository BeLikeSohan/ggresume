'use client';

import React from 'react';

interface GGLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const GGLogo: React.FC<GGLogoProps> = ({
  size = 'md',
  showWordmark = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: { box: 'w-8 h-8 rounded-lg', svg: 20 },
    md: { box: 'w-9 h-9 rounded-xl', svg: 22 },
    lg: { box: 'w-11 h-11 rounded-2xl', svg: 26 },
  }[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark: Geometric 'gg' tile */}
      <div
        className={`${iconDimensions.box} bg-gradient-to-b from-slate-900 to-black text-white flex items-center justify-center shadow-xs ring-1 ring-white/15 group-hover:ring-white/25 transition-all duration-150 flex-shrink-0`}
        aria-label="GGResume logo"
      >
        <svg
          width={iconDimensions.svg}
          height={iconDimensions.svg}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform -translate-y-[0.5px]"
        >
          {/* Left 'g' */}
          <circle
            cx="10.5"
            cy="12.5"
            r="4.5"
            stroke="white"
            strokeWidth="2.5"
          />
          <path
            d="M15 8v11.5c0 3.2-2.4 5-5.5 5-2.2 0-4-1-4.8-2.2"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right 'g' */}
          <circle
            cx="21.5"
            cy="12.5"
            r="4.5"
            stroke="white"
            strokeWidth="2.5"
          />
          <path
            d="M26 8v11.5c0 3.2-2.4 5-5.5 5-2.2 0-4-1-4.8-2.2"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`${textSizes} font-bold tracking-tight text-slate-900 leading-none`}
        >
          <span className="font-black text-slate-950 tracking-tight">GG</span>
          <span className="text-slate-700 font-semibold tracking-tight">Resume</span>
        </span>
      )}
    </div>
  );
};
