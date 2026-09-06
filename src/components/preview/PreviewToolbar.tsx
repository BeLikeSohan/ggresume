'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, LayoutTemplate, ChevronDown } from 'lucide-react';
import { getTemplate } from '@/templates/registry';

interface PreviewToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  pageSizeLabel?: string;
  className?: string;
  templateId?: string;
  onOpenThemes?: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  pageSizeLabel = 'A4 (210 × 297 mm)',
  className = '',
  templateId = 'classic',
  onOpenThemes,
}) => {
  const currentTemplate = getTemplate(templateId);

  return (
    <div
      className={`preview-toolbar h-12 bg-slate-100/90 backdrop-blur border-b border-slate-300 px-4 flex items-center justify-between z-20 flex-shrink-0 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Preview:</span>
          <span className="text-xs font-medium text-slate-500 hidden md:inline">
            {pageSizeLabel}
          </span>
        </div>

        {/* Theme Selector Trigger Button */}
        {onOpenThemes && (
          <div className="flex items-center pl-2 border-l border-slate-300">
            <button
              type="button"
              onClick={onOpenThemes}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-md shadow-2xs transition cursor-pointer select-none"
              title="Change resume theme"
              aria-haspopup="dialog"
            >
              <LayoutTemplate size={13} className="text-slate-500" />
              <span>
                Theme:{' '}
                <strong className="font-semibold text-slate-900">
                  {currentTemplate.name}
                </strong>
              </span>
              <ChevronDown size={12} className="text-slate-400 ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition cursor-pointer"
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
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={onZoomReset}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition ml-1 cursor-pointer"
          title="Fit to Screen"
          aria-label="Fit to Screen"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};
