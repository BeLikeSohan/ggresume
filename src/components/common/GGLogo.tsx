'use client';

import React from 'react';
import Image from 'next/image';

interface GGLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showWordmark?: boolean;
  className?: string;
  variant?: 'small' | 'big' | 'full';
  imageWidth?: number;
  imageHeight?: number;
  boxClassName?: string;
}

export const GGLogo: React.FC<GGLogoProps> = ({
  size = 'md',
  showWordmark = false,
  className = '',
  variant = 'big',
  imageWidth,
  imageHeight,
  boxClassName,
}) => {
  const isSmallVariant = variant === 'small';
  const imageSrc = isSmallVariant ? '/ggresume-logo-small.png' : '/ggresume-logo.png';

  // True aspect ratio presets:
  // big logo is 2078x757 (~2.74:1)
  // small logo is 754x560 (~1.35:1)
  const dimensions = isSmallVariant
    ? {
        sm: { width: 36, height: 27, box: 'h-7 w-auto' },
        md: { width: 48, height: 36, box: 'h-9 w-auto' },
        lg: { width: 72, height: 54, box: 'h-12 w-auto' },
        xl: { width: 96, height: 71, box: 'h-16 w-auto' },
        '2xl': { width: 128, height: 95, box: 'h-20 w-auto' },
      }[size]
    : {
        sm: { width: 96, height: 35, box: 'h-8 w-auto' },
        md: { width: 120, height: 44, box: 'h-10 w-auto' },
        lg: { width: 150, height: 55, box: 'h-11 sm:h-12 w-auto' },
        xl: { width: 180, height: 66, box: 'h-12 sm:h-13 w-auto' },
        '2xl': { width: 220, height: 80, box: 'h-16 w-auto' },
      }[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }[size];

  const finalWidth = imageWidth || dimensions.width;
  const finalHeight = imageHeight || dimensions.height;
  const finalBoxClass = boxClassName || dimensions.box;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${finalBoxClass} relative flex items-center justify-center flex-shrink-0`}
        aria-label="GGResume logo"
      >
        <Image
          src={imageSrc}
          alt="GGResume"
          width={finalWidth}
          height={finalHeight}
          className="h-full w-auto max-h-full object-contain drop-shadow-xs"
          priority
        />
      </div>

      {/* Optional Wordmark */}
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
