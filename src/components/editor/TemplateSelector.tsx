'use client';

import React, { useState } from 'react';
import { TEMPLATES_LIST, getTemplate } from '@/templates/registry';
import { TemplateCategory, TemplateDefinition } from '@/templates/types';
import { ResumeSettings, TemplateId } from '@/types/resume';
import { LayoutTemplate, Check, Sparkles, Wand2 } from 'lucide-react';

interface TemplateSelectorProps {
  currentTemplateId?: string;
  settings: ResumeSettings;
  onSelectTemplate: (templateId: TemplateId, applyDefaults?: boolean) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplateId = 'classic',
  settings: _settings,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: 'All Layouts' },
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'technical', label: 'Technical' },
    { id: 'executive', label: 'Executive' },
  ];

  const filteredTemplates = TEMPLATES_LIST.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const activeTemplate = getTemplate(currentTemplateId);

  // Render a mini visual skeleton representing the template's layout structure
  const renderTemplateThumbnail = (t: TemplateDefinition, isActive: boolean) => {
    switch (t.id) {
      case 'sidebar':
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex gap-1.5 border border-slate-200 overflow-hidden select-none">
            <div className="w-1/3 bg-slate-200/80 rounded-xs flex flex-col gap-1 p-1">
              <div
                className="w-full h-1.5 rounded-xs"
                style={{ backgroundColor: t.accentColorDefault || '#0369a1' }}
              />
              <div className="w-3/4 h-1 bg-slate-300 rounded-xs" />
              <div className="w-full h-1 bg-slate-300 rounded-xs" />
              <div className="w-1/2 h-1 bg-slate-300 rounded-xs mt-1" />
              <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
            </div>
            <div className="w-2/3 flex flex-col gap-1 p-0.5">
              <div
                className="w-1/2 h-2 rounded-xs"
                style={{ backgroundColor: t.accentColorDefault || '#0369a1' }}
              />
              <div className="w-full h-1 bg-slate-300 rounded-xs" />
              <div className="w-5/6 h-1 bg-slate-300 rounded-xs" />
              <div className="w-full h-1 bg-slate-300 rounded-xs mt-1" />
              <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
            </div>
          </div>
        );

      case 'executive':
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex flex-col items-center gap-1 border border-slate-200 overflow-hidden select-none">
            <div
              className="w-2/5 h-2 rounded-xs"
              style={{ backgroundColor: t.accentColorDefault || '#1e293b' }}
            />
            <div className="w-3/5 h-1 bg-slate-300 rounded-xs" />
            <div className="w-full h-0.5 bg-slate-300 rounded-xs mt-1" />
            <div className="w-full flex flex-col gap-0.5 mt-0.5">
              <div className="w-1/3 h-1 bg-slate-400 rounded-xs" />
              <div className="w-full h-1 bg-slate-300 rounded-xs" />
              <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex flex-col gap-1 border border-slate-200 overflow-hidden select-none">
            <div className="flex justify-between items-center">
              <div
                className="w-1/3 h-2 rounded-xs"
                style={{ backgroundColor: t.accentColorDefault || '#2563eb' }}
              />
              <div className="w-1/4 h-1 bg-slate-300 rounded-xs" />
            </div>
            <div className="w-full h-0.5 bg-blue-200 rounded-xs" />
            <div className="grid grid-cols-2 gap-1 mt-0.5">
              <div className="h-2 bg-slate-200 rounded-xs" />
              <div className="h-2 bg-slate-200 rounded-xs" />
            </div>
            <div className="w-full h-1 bg-slate-300 rounded-xs mt-0.5" />
            <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
          </div>
        );

      case 'modern':
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex flex-col gap-1 border border-slate-200 overflow-hidden select-none">
            <div
              className="w-1/2 h-2.5 rounded-xs"
              style={{ backgroundColor: t.accentColorDefault || '#0f766e' }}
            />
            <div className="w-2/3 h-1 bg-slate-300 rounded-xs" />
            <div className="flex items-center gap-1 mt-1">
              <div
                className="w-1 h-3 rounded-full"
                style={{ backgroundColor: t.accentColorDefault || '#0f766e' }}
              />
              <div className="w-1/4 h-1.5 bg-slate-400 rounded-xs" />
              <div className="flex-1 h-0.5 bg-slate-200 rounded-xs" />
            </div>
            <div className="w-full h-1 bg-slate-300 rounded-xs" />
          </div>
        );

      case 'minimal':
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex flex-col gap-1 border border-slate-200 overflow-hidden select-none">
            <div className="w-1/2 h-2 bg-slate-800 rounded-xs font-light" />
            <div className="w-2/3 h-1 bg-slate-300 rounded-xs mb-1" />
            <div
              className="w-1/4 h-1 font-bold uppercase tracking-wider"
              style={{ backgroundColor: t.accentColorDefault || '#334155' }}
            />
            <div className="w-full h-1 bg-slate-300 rounded-xs" />
            <div className="w-4/5 h-1 bg-slate-300 rounded-xs" />
          </div>
        );

      default: // classic
        return (
          <div className="w-full h-20 rounded bg-slate-100 p-2 flex flex-col gap-1 border border-slate-200 overflow-hidden select-none">
            <div className="w-1/2 h-2.5 bg-slate-900 rounded-xs" />
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="h-1 bg-slate-300 rounded-xs" />
              <div className="h-1 bg-slate-300 rounded-xs" />
            </div>
            <div className="w-full h-0.5 bg-slate-400 rounded-xs" />
            <div className="w-full h-1 bg-slate-300 rounded-xs mt-0.5" />
            <div className="w-5/6 h-1 bg-slate-300 rounded-xs" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <LayoutTemplate size={16} className="text-slate-500" />
            Resume Template & Layout
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose from professionally crafted, ATS-compliant resume templates.
          </p>
        </div>

        {activeTemplate.badge && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
            <Sparkles size={10} />
            Active: {activeTemplate.name}
          </span>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map((t) => {
          const isActive = t.id === currentTemplateId;

          return (
            <div
              key={t.id}
              onClick={() => onSelectTemplate(t.id as TemplateId, false)}
              className={`group relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Badge & Active Checkmark */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {t.badge || t.category}
                </span>

                {isActive ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                    <Check size={12} className="stroke-[3]" />
                    Selected
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    Click to apply
                  </span>
                )}
              </div>

              {/* Layout Skeleton Visual Thumbnail */}
              <div className="mb-2.5">{renderTemplateThumbnail(t, isActive)}</div>

              {/* Title & Tagline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {t.description}
                </p>
              </div>

              {/* Apply Defaults Quick Action */}
              {isActive && t.defaultSettings && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(t.id as TemplateId, true);
                  }}
                  className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-blue-700 hover:text-blue-900 transition"
                  title="Apply recommended fonts, colors, and dividers for this template"
                >
                  <Wand2 size={11} />
                  Reset to Template Recommended Styling
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
