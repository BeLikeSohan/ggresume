'use client';

import React, { useState, useEffect } from 'react';
import { TEMPLATES_LIST } from '@/templates/registry';
import { TemplateDefinition, TemplateCategory } from '@/templates/types';
import { TemplateId, ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/data/defaultResume';
import { X, Check, Sparkles } from 'lucide-react';

export interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId?: string;
  resumeData: ResumeData;
  onSelectTemplate: (templateId: TemplateId) => void;
}

// Mini preview rendering actual resume template scaled to fit compact single-column card
const TemplateMiniPreview: React.FC<{
  template: TemplateDefinition;
  data: ResumeData;
}> = ({ template, data }) => {
  const TemplateComponent = template.component;

  const previewData: ResumeData = {
    ...data,
    settings: {
      ...data.settings,
      templateId: template.id,
      fontFamily: data.settings?.fontFamily || template.defaultSettings?.fontFamily || 'inter',
      accentColor: data.settings?.accentColor || template.accentColorDefault || '#000000',
    },
  };

  const scale = 0.36;

  return (
    <div className="w-full h-[290px] bg-slate-50 rounded-lg overflow-hidden relative flex items-start justify-center border border-slate-200/80 shadow-2xs select-none pointer-events-none group-hover:border-slate-300 transition-colors">
      <div
        className="origin-top flex-shrink-0"
        style={{
          width: '794px',
          height: '1123px',
          transform: `scale(${scale})`,
          marginTop: '3px',
        }}
      >
        <TemplateComponent
          data={previewData}
          scale={1}
          isPrinting={false}
          showPageGuide={false}
        />
      </div>
    </div>
  );
};

export const ThemePanel: React.FC<ThemePanelProps> = ({
  isOpen,
  onClose,
  currentTemplateId = 'classic',
  resumeData,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);

  // Handle smooth enter/exit animations
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsAnimated(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isRendered) return null;

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'technical', label: 'Technical' },
    { id: 'executive', label: 'Executive' },
  ];

  const filteredTemplates = TEMPLATES_LIST.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const displayData =
    resumeData && resumeData.personal && resumeData.personal.fullName?.trim()
      ? resumeData
      : defaultResumeData;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Theme Selection Panel">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isAnimated ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Right Side Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div
          className={`pointer-events-auto w-screen max-w-[340px] sm:max-w-[360px] bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out ${
            isAnimated ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Resume Themes
              </h2>
              <p className="text-[11px] text-slate-500">
                Click a theme to preview live
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              aria-label="Close panel"
              title="Close panel (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/70">
            {categories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? TEMPLATES_LIST.length
                  : TEMPLATES_LIST.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Single Resume Per Row Theme List */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="flex flex-col space-y-3.5">
              {filteredTemplates.map((t) => {
                const isActive = t.id === currentTemplateId;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTemplate(t.id as TemplateId);
                    }}
                    className={`group rounded-xl border-2 p-3 transition-all cursor-pointer flex flex-col bg-white ${
                      isActive
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Header Row: Title, Tag, Badge, Active Status */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-blue-600' : 'text-slate-900'
                          }`}
                        >
                          {t.name}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize font-medium shrink-0">
                          · {t.category}
                        </span>
                        {t.badge && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border shrink-0 ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {t.badge}
                          </span>
                        )}
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md shrink-0">
                          <Check size={11} className="stroke-[3]" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-700 shrink-0">
                          Select
                        </span>
                      )}
                    </div>

                    {/* Tagline / Description */}
                    {t.tagline && (
                      <p className="text-[11px] text-slate-500 mb-2 leading-tight line-clamp-1">
                        {t.tagline}
                      </p>
                    )}

                    {/* Single Row Scaled Live Miniature Preview */}
                    <TemplateMiniPreview template={t} data={displayData} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
