'use client';

import React, { useState } from 'react';
import { ResumeSettings, TemplateId } from '@/types/resume';
import {
  Settings,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  SplitSquareVertical,
  GripVertical,
  Palette,
} from 'lucide-react';
import { HeaderStyleSelector } from '@/components/common/HeaderStyleSelector';
import { NumericSliderControl } from '@/components/common/NumericSliderControl';
import { TemplateSelector } from './TemplateSelector';
import { getTemplate } from '@/templates/registry';
import {
  resolveFontSize,
  resolveLineSpacing,
  resolveSectionSpacing,
  resolvePageMargin,
  resolveDividerThickness,
} from '@/lib/layoutMetrics';

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
  const currentOrder = settings.sectionOrder || [
    'profile',
    'skills',
    'experiences',
    'projects',
    'educations',
    'references',
  ];
  // Include any custom section id in sectionNames that might not yet be in sectionOrder
  const missingKeys = Object.keys(sectionNames).filter(
    (k) => !currentOrder.includes(k)
  );
  const effectiveSectionOrder = [...currentOrder, ...missingKeys];

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleUpdate = <K extends keyof ResumeSettings>(
    key: K,
    value: ResumeSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleSelectTemplate = (
    templateId: TemplateId,
    applyDefaults: boolean = false
  ) => {
    if (applyDefaults) {
      const templateDef = getTemplate(templateId);
      const defaults = templateDef.defaultSettings || {};
      onChange({
        ...settings,
        templateId,
        ...defaults,
      });
    } else {
      handleUpdate('templateId', templateId);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= effectiveSectionOrder.length) return;
    const newOrder = [...effectiveSectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    handleUpdate('sectionOrder', newOrder);
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    const hidden = settings.hiddenSections || [];
    const isHidden = hidden.includes(sectionKey);
    const newHidden = isHidden
      ? hidden.filter((k) => k !== sectionKey)
      : [...hidden, sectionKey];
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...effectiveSectionOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    handleUpdate('sectionOrder', newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Template & Layout Choice */}
      <div className="pb-6 border-b border-slate-200">
        <TemplateSelector
          currentTemplateId={settings.templateId || 'classic'}
          settings={settings}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>

      {/* 2. Color Palette & Accent */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Palette size={16} className="text-slate-500" />
          Color & Theme Styling
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Accent Color
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { color: '#000000', label: 'Classic Black' },
              { color: '#1e293b', label: 'Slate Navy' },
              { color: '#0f766e', label: 'Teal Emerald' },
              { color: '#2563eb', label: 'Tech Blue' },
              { color: '#0369a1', label: 'Ocean Sky' },
              { color: '#7c3aed', label: 'Royal Violet' },
              { color: '#991b1b', label: 'Burgundy' },
              { color: '#334155', label: 'Graphite' },
            ].map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => handleUpdate('accentColor', p.color)}
                className={`w-8 h-8 rounded-full border-2 transition flex items-center justify-center cursor-pointer ${
                  settings.accentColor === p.color
                    ? 'border-blue-600 scale-110 shadow-xs'
                    : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: p.color }}
                title={p.label}
              />
            ))}

            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
              <input
                type="color"
                value={settings.accentColor || '#000000'}
                onChange={(e) => handleUpdate('accentColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                title="Custom color picker"
              />
              <span className="text-xs font-mono text-slate-600">
                {settings.accentColor || '#000000'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography & Sizing */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <Settings size={16} className="text-slate-500" />
            Typography & Layout Density
          </h3>
          <p className="text-xs text-slate-500">
            Fine-tune font family, margins, and density to fit your resume
            perfectly into 1 or 2 pages.
          </p>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Font Family
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'source-sans', label: 'Source Sans 3', sub: 'Original' },
              { id: 'inter', label: 'Inter', sub: 'Modern' },
              { id: 'roboto', label: 'Roboto', sub: 'Clean' },
              { id: 'open-sans', label: 'Open Sans', sub: 'Neutral' },
              { id: 'lato', label: 'Lato', sub: 'Balanced' },
              {
                id: 'plus-jakarta-sans',
                label: 'Plus Jakarta',
                sub: 'Contemporary',
              },
              { id: 'literata', label: 'Literata', sub: 'Editorial Serif' },
              { id: 'merriweather', label: 'Merriweather', sub: 'Classic Serif' },
              { id: 'lora', label: 'Lora', sub: 'Elegant Serif' },
              {
                id: 'eb-garamond',
                label: 'EB Garamond',
                sub: 'Academic Serif',
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleUpdate('fontFamily', f.id as any)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  settings.fontFamily === f.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{f.label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    settings.fontFamily === f.id
                      ? 'text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {f.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size, Spacing & Margin Numeric Controls - 1 Per Row */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Size, Spacing & Margins
          </label>
          <div className="flex flex-col space-y-3">
            {/* Font Size */}
            <NumericSliderControl
              label="Font Size"
              value={resolveFontSize(settings.fontSize)}
              min={8.0}
              max={13.0}
              step={0.5}
              unit="pt"
              decimals={1}
              description="Base body font size across resume"
              onChange={(val) => handleUpdate('fontSize', val)}
            />

            {/* Line Spacing */}
            <NumericSliderControl
              label="Line Spacing"
              value={resolveLineSpacing(settings.lineSpacing)}
              min={1.05}
              max={1.85}
              step={0.05}
              unit="x"
              decimals={2}
              description="Line height multiplier"
              onChange={(val) => handleUpdate('lineSpacing', val)}
            />

            {/* Section Spacing */}
            <NumericSliderControl
              label="Section Spacing"
              value={resolveSectionSpacing(settings.sectionSpacing)}
              min={4.0}
              max={28.0}
              step={0.5}
              unit="pt"
              decimals={1}
              description="Vertical gap between sections"
              onChange={(val) => handleUpdate('sectionSpacing', val)}
            />

            {/* Page Margins */}
            <NumericSliderControl
              label="Page Margins"
              value={resolvePageMargin(settings.pageMargin).horizontal}
              min={20}
              max={65}
              step={1}
              unit="pt"
              decimals={0}
              description="Outer page margin padding"
              onChange={(val) => handleUpdate('pageMargin', val)}
            />
          </div>
        </div>

        {/* Bullet Style & Divider Thickness - 1 Per Row */}
        <div className="flex flex-col space-y-3 pt-2 border-t border-slate-200">
          {/* Bullet Style */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Bullet Marker Style
            </label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
              {[
                { id: 'square', label: '■ Square' },
                { id: 'disc', label: '● Circle' },
                { id: 'dash', label: '— Dash' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleUpdate('bulletStyle', b.id as any)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
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

          {/* Divider Thickness Numeric Slider */}
          <NumericSliderControl
            label="Divider Line Thickness"
            value={resolveDividerThickness(settings.dividerThickness)}
            min={0.5}
            max={3.0}
            step={0.25}
            unit="pt"
            decimals={2}
            description="Section title border line width"
            onChange={(val) => handleUpdate('dividerThickness', val)}
          />
        </div>

        {/* Header & Personal Layout Style */}
        <div className="pt-2 border-t border-slate-200">
          <HeaderStyleSelector
            value={settings.headerStyle || 'grid'}
            onChange={(headerStyle) => handleUpdate('headerStyle', headerStyle)}
          />
        </div>

        {/* Section Reorder & Visibility */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Section Order & Visibility
          </label>
          <p className="text-xs text-slate-500">
            Drag and drop sections or use the arrows to rearrange them. Toggle the
            eye icon to show/hide sections.
          </p>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {effectiveSectionOrder.map((secKey, index) => {
              const isHidden = (settings.hiddenSections || []).includes(secKey);
              const title = sectionNames[secKey] || secKey;
              const isBeingDragged = draggedIndex === index;
              const isDropTarget =
                dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={secKey}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`px-3 py-2 flex items-center justify-between text-xs transition select-none ${
                    isBeingDragged
                      ? 'opacity-40 bg-slate-100 border-dashed border-slate-300'
                      : isDropTarget
                      ? 'bg-blue-50/80 ring-2 ring-blue-500/30 z-10'
                      : isHidden
                      ? 'bg-slate-50 text-slate-400'
                      : 'bg-white text-slate-800 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 transition"
                      title="Drag to reorder"
                    >
                      <GripVertical size={15} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionVisibility(secKey);
                      }}
                      className={`p-1 rounded hover:bg-slate-200 transition ${
                        isHidden ? 'text-slate-400' : 'text-slate-700'
                      }`}
                      title={isHidden ? 'Show section' : 'Hide section'}
                    >
                      {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <span
                      className={`font-semibold ${
                        isHidden ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {title}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {index > 0 &&
                      (() => {
                        const rawBreaks = settings.pageBreakBefore || [];
                        const currentBreaks =
                          rawBreaks.length === 1 &&
                          rawBreaks[0] === 'educations'
                            ? []
                            : rawBreaks;
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
                      disabled={index === effectiveSectionOrder.length - 1}
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
    </div>
  );
};
