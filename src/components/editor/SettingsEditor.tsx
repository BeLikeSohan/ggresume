'use client';

import React from 'react';
import { ResumeSettings } from '@/types/resume';
import { Settings, ArrowUp, ArrowDown, Eye, EyeOff, SplitSquareVertical } from 'lucide-react';

export interface SettingsEditorProps {
  settings: ResumeSettings;
  onChange: (settings: ResumeSettings) => void;
  sectionNames: Record<string, string>;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings,
  onChange,
  sectionNames,
}) => {
  const handleUpdate = <K extends keyof ResumeSettings>(key: K, value: ResumeSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.sectionOrder.length) return;
    const newOrder = [...settings.sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    handleUpdate('sectionOrder', newOrder);
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    const isHidden = settings.hiddenSections.includes(sectionKey);
    const newHidden = isHidden
      ? settings.hiddenSections.filter((k) => k !== sectionKey)
      : [...settings.hiddenSections, sectionKey];
    handleUpdate('hiddenSections', newHidden);
  };

  const togglePageBreak = (sectionKey: string) => {
    const rawBreaks = settings.pageBreakBefore || [];
    const currentBreaks =
      rawBreaks.length === 1 && rawBreaks[0] === 'educations' ? [] : rawBreaks;
    const hasBreak = currentBreaks.includes(sectionKey);
    const newBreaks = hasBreak
      ? currentBreaks.filter((k) => k !== sectionKey)
      : [...currentBreaks, sectionKey];
    handleUpdate('pageBreakBefore', newBreaks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Settings size={16} className="text-slate-500" />
          Layout, Typography & Density
        </h3>
        <p className="text-xs text-slate-500">
          Fine-tune font size, margins, and density to fit your resume perfectly into 1 or 2 pages.
        </p>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Font Family
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'source-sans', label: 'Source Sans 3', sub: '(Original)' },
            { id: 'inter', label: 'Inter', sub: 'Modern' },
            { id: 'roboto', label: 'Roboto', sub: 'Clean' },
            { id: 'merriweather', label: 'Merriweather', sub: 'Serif' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleUpdate('fontFamily', f.id as any)}
              className={`p-2.5 rounded-lg border text-left transition ${
                settings.fontFamily === f.id
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{f.label}</div>
              <div className={`text-[10px] ${settings.fontFamily === f.id ? 'text-slate-300' : 'text-slate-400'}`}>
                {f.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size & Spacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Font Size */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Font Size
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {(['compact', 'standard', 'spacious'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleUpdate('fontSize', size)}
                className={`flex-1 py-1 text-xs font-medium capitalize rounded-md transition ${
                  settings.fontSize === size
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Line Spacing */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Line Spacing
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {(['compact', 'standard', 'relaxed'] as const).map((space) => (
              <button
                key={space}
                type="button"
                onClick={() => handleUpdate('lineSpacing', space)}
                className={`flex-1 py-1 text-xs font-medium capitalize rounded-md transition ${
                  settings.lineSpacing === space
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {space}
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Page Margins
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {(['compact', 'standard', 'relaxed'] as const).map((margin) => (
              <button
                key={margin}
                type="button"
                onClick={() => handleUpdate('pageMargin', margin)}
                className={`flex-1 py-1 text-xs font-medium capitalize rounded-md transition ${
                  settings.pageMargin === margin
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {margin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bullet Style & Accent Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bullet Style */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Bullet Marker Style
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {[
              { id: 'square', label: '■ Square (Original)' },
              { id: 'disc', label: '● Circle' },
              { id: 'dash', label: '— Dash' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleUpdate('bulletStyle', b.id as any)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  settings.bulletStyle === b.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider Thickness */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Divider Line Thickness
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {[
              { val: 1, label: '1.0 pt' },
              { val: 1.5, label: '1.5 pt (Original)' },
              { val: 2, label: '2.0 pt' },
            ].map((thick) => (
              <button
                key={thick.val}
                type="button"
                onClick={() => handleUpdate('dividerThickness', thick.val)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  settings.dividerThickness === thick.val
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {thick.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section Reorder & Visibility */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Section Order & Visibility
        </label>
        <p className="text-xs text-slate-500">
          Use the arrows to rearrange sections on your resume or toggle the eye icon to hide/show them.
        </p>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          {settings.sectionOrder.map((secKey, index) => {
            const isHidden = settings.hiddenSections.includes(secKey);
            const title = sectionNames[secKey] || secKey;

            return (
              <div
                key={secKey}
                className={`px-3 py-2 flex items-center justify-between text-xs transition ${
                  isHidden ? 'bg-slate-50 text-slate-400' : 'text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(secKey)}
                    className={`p-1 rounded hover:bg-slate-200 transition ${
                      isHidden ? 'text-slate-400' : 'text-slate-700'
                    }`}
                    title={isHidden ? 'Show section' : 'Hide section'}
                  >
                    {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <span className={`font-semibold ${isHidden ? 'line-through text-slate-400' : ''}`}>
                    {title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {index > 0 && (() => {
                    const rawBreaks = settings.pageBreakBefore || [];
                    const currentBreaks =
                      rawBreaks.length === 1 && rawBreaks[0] === 'educations' ? [] : rawBreaks;
                    const hasPageBreak = currentBreaks.includes(secKey);
                    return (
                      <button
                        type="button"
                        onClick={() => togglePageBreak(secKey)}
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition flex items-center gap-1 ${
                          hasPageBreak
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
                            : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                        }`}
                        title="Toggle starting this section on a new page"
                      >
                        <SplitSquareVertical size={11} />
                        {hasPageBreak ? 'New Page' : 'Break'}
                      </button>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => handleMoveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(index, 'down')}
                    disabled={index === settings.sectionOrder.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
