'use client';

import React from 'react';
import { HeaderStyle } from '@/types/resume';
import { Layout, Check } from 'lucide-react';

export interface HeaderStyleOption {
  id: HeaderStyle;
  label: string;
  sub: string;
  iconVisual: React.ReactNode;
}

export const HEADER_STYLE_OPTIONS: HeaderStyleOption[] = [
  {
    id: 'grid',
    label: '2-Column Grid',
    sub: 'Classic & Balanced',
    iconVisual: (
      <div className="w-full flex flex-col gap-1 p-1">
        <div className="w-12 h-2 bg-current rounded-xs opacity-90" />
        <div className="grid grid-cols-2 gap-1 mt-0.5">
          <div className="h-1 bg-current rounded-xs opacity-60" />
          <div className="h-1 bg-current rounded-xs opacity-60" />
          <div className="h-1 bg-current rounded-xs opacity-60" />
          <div className="h-1 bg-current rounded-xs opacity-60" />
        </div>
      </div>
    ),
  },
  {
    id: 'centered',
    label: 'Centered Inline',
    sub: 'Academic / Minimalist',
    iconVisual: (
      <div className="w-full flex flex-col items-center gap-1 p-1">
        <div className="w-14 h-2 bg-current rounded-xs opacity-90" />
        <div className="w-20 h-1 bg-current rounded-xs opacity-60 mt-0.5" />
      </div>
    ),
  },
  {
    id: 'left-inline',
    label: 'Left-Aligned Inline',
    sub: 'Modern & Compact',
    iconVisual: (
      <div className="w-full flex flex-col items-start gap-1 p-1">
        <div className="w-14 h-2 bg-current rounded-xs opacity-90" />
        <div className="w-20 h-1 bg-current rounded-xs opacity-60 mt-0.5" />
      </div>
    ),
  },
  {
    id: 'split',
    label: 'Split Header',
    sub: 'Executive & Corporate',
    iconVisual: (
      <div className="w-full flex items-center justify-between p-1">
        <div className="w-10 h-3 bg-current rounded-xs opacity-90" />
        <div className="flex flex-col items-end gap-0.5">
          <div className="w-8 h-1 bg-current rounded-xs opacity-60" />
          <div className="w-8 h-1 bg-current rounded-xs opacity-60" />
          <div className="w-8 h-1 bg-current rounded-xs opacity-60" />
        </div>
      </div>
    ),
  },
  {
    id: 'banner',
    label: 'Accent Border',
    sub: 'Creative & Bold',
    iconVisual: (
      <div className="w-full flex items-stretch gap-1.5 p-1">
        <div className="w-1 bg-current rounded-xs" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-10 h-2 bg-current rounded-xs opacity-90" />
          <div className="grid grid-cols-2 gap-1">
            <div className="h-1 bg-current rounded-xs opacity-60" />
            <div className="h-1 bg-current rounded-xs opacity-60" />
          </div>
        </div>
      </div>
    ),
  },
];

interface HeaderStyleSelectorProps {
  value?: HeaderStyle;
  onChange: (style: HeaderStyle) => void;
  compact?: boolean;
}

export const HeaderStyleSelector: React.FC<HeaderStyleSelectorProps> = ({
  value = 'grid',
  onChange,
  compact = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Layout size={13} className="text-slate-500" />
          Header & Profile Styling
        </label>
      </div>

      <div
        className={`grid gap-2 ${
          compact
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {HEADER_STYLE_OPTIONS.map((opt) => {
          const isSelected = (value || 'grid') === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group cursor-pointer ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Visual preview thumbnail */}
              <div
                className={`w-full h-9 rounded-lg flex items-center justify-center mb-2 transition ${
                  isSelected
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
                }`}
              >
                {opt.iconVisual}
              </div>

              {/* Label & Description */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight truncate">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <Check size={12} className="text-white flex-shrink-0" />
                  )}
                </div>
                <div
                  className={`text-[10px] mt-0.5 truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {opt.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
