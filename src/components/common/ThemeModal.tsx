'use client';

import React, { useState, useEffect } from 'react';
import { TEMPLATES_LIST } from '@/templates/registry';
import { TemplateDefinition, TemplateCategory } from '@/templates/types';
import { TemplateId, ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/data/defaultResume';
import { X, Check } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId?: string;
  resumeData: ResumeData;
  onSelectTemplate: (templateId: TemplateId) => void;
}

// Mini preview rendering actual resume template scaled to fit card
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

  const scale = 0.245;

  return (
    <div className="w-full h-[255px] bg-slate-100 rounded-lg overflow-hidden relative flex items-start justify-center border border-slate-200 select-none pointer-events-none">
      <div
        className="origin-top"
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

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTemplateId = 'classic',
  resumeData,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-7xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-label="Select Theme"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Select Theme</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid with Live Previews - 4 Per Row on Large Screens */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((t) => {
              const isActive = t.id === currentTemplateId;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTemplate(t.id as TemplateId);
                    onClose();
                  }}
                  className={`group rounded-xl border-2 p-2.5 transition-all cursor-pointer flex flex-col bg-white ${
                    isActive
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Miniature Scaled Live Preview */}
                  <div className="mb-2">
                    <TemplateMiniPreview template={t} data={displayData} />
                  </div>

                  {/* Title, Category & Active Status */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        · {t.category}
                      </span>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        <Check size={13} className="stroke-[3]" />
                      </span>
                    )}
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
