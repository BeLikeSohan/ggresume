'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseResumeZoomOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  step?: number;
}

export function useResumeZoom(options: UseResumeZoomOptions = {}) {
  const { initialScale = 0.9, minScale = 0.35, maxScale = 1.4, step = 0.08 } = options;

  const [scale, setScale] = useState<number>(initialScale);

  // Responsive default scaling on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScale(0.44);
      } else if (width < 1024) {
        setScale(0.68);
      } else if (width < 1440) {
        setScale(0.82);
      } else {
        setScale(0.92);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(maxScale, Math.round((s + step) * 100) / 100));
  }, [maxScale, step]);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(minScale, Math.round((s - step) * 100) / 100));
  }, [minScale, step]);

  const resetZoom = useCallback(() => {
    setScale(0.9);
  }, []);

  return {
    scale,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
