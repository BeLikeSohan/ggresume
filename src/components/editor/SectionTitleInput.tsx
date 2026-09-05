'use client';

import React from 'react';
import { LucideIcon, Type } from 'lucide-react';

export interface SectionTitleInputProps {
  icon?: LucideIcon;
  defaultTitle: string;
  value?: string;
  onChange?: (newTitle: string) => void;
  description?: string;
  rightAction?: React.ReactNode;
}

export const SectionHeaderWithTitle: React.FC<SectionTitleInputProps> = ({
  icon: Icon,
  defaultTitle,
  value,
  onChange,
  description,
  rightAction,
}) => {
  const displayValue = value !== undefined ? value : defaultTitle;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 mb-4 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-slate-600 flex-shrink-0" />}
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Section Heading
          </span>
        </div>
        {rightAction}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
          <Type size={14} />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={defaultTitle}
          className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 leading-normal">
          {description}
        </p>
      )}
    </div>
  );
};
