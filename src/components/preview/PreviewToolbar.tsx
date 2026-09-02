'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface PreviewToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  pageSizeLabel?: string;
  className?: string;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  pageSizeLabel = 'A4 (210 × 297 mm)',
  className = '',
}) => {
  return (
    <div
      className={`preview-toolbar h-12 bg-slate-100/90 backdrop-blur border-b border-slate-300 px-4 flex items-center justify-between z-20 flex-shrink-0 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">Preview:</span>
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
          {pageSizeLabel}
        </span>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-xs font-mono font-medium text-slate-700 w-12 text-center select-none">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={onZoomReset}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition ml-1"
          title="Fit to Screen"
          aria-label="Fit to Screen"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};
