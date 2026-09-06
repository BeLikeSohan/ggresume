'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, LayoutTemplate } from 'lucide-react';
import { TEMPLATES_LIST } from '@/templates/registry';
import { TemplateId } from '@/types/resume';

interface PreviewToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  pageSizeLabel?: string;
  className?: string;
  templateId?: string;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  pageSizeLabel = 'A4 (210 × 297 mm)',
  className = '',
  templateId = 'classic',
  onChangeTemplate,
}) => {
  return (
    <div
      className={`preview-toolbar h-12 bg-slate-100/95 backdrop-blur border-b border-slate-300 px-4 flex items-center justify-between z-20 flex-shrink-0 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            Preview:
          </span>
          <span className="text-xs font-medium text-slate-500 hidden md:inline">
            {pageSizeLabel}
          </span>
        </div>

        {/* Quick Template Selector */}
        {onChangeTemplate && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
            <LayoutTemplate size={14} className="text-slate-500 hidden sm:inline" />
            <select
              value={templateId}
              onChange={(e) => onChangeTemplate(e.target.value as TemplateId)}
              className="text-xs font-semibold bg-white text-slate-800 border border-slate-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              aria-label="Select resume template"
            >
              {TEMPLATES_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
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
