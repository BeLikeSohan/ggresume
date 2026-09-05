'use client';

import React, { useState } from 'react';
import { Experience } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';
import { RichTextarea } from '@/components/common/RichTextarea';

export interface ExperienceEditorProps {
  experiences: Experience[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (experiences: Experience[]) => void;
}

function highlightsToText(highlights: string[] | undefined): string {
  if (!highlights || highlights.length === 0) return '';
  return highlights.join('\n');
}

function textToHighlights(text: string): string[] {
  if (!text) return [];
  return text.split('\n');
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experiences,
  title,
  onTitleChange,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    experiences.length > 0 ? experiences[0].id : null
  );

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      role: 'Software Engineer',
      company: 'Company Name',
      location: 'Remote',
      startDate: '2024',
      endDate: 'Present',
      isCurrent: true,
      highlights: ['• Designed and developed high-impact features using **relevant technologies**.'],
    };
    onChange([...experiences, newExp]);
    setExpandedId(newExp.id);
  };

  const handleUpdate = (id: string, field: keyof Experience, value: any) => {
    onChange(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleDelete = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const newExps = [...experiences];
    const [moved] = newExps.splice(index, 1);
    newExps.splice(targetIndex, 0, moved);
    onChange(newExps);
  };

  return (
    <div className="space-y-4">
      <SectionHeaderWithTitle
        icon={Briefcase}
        defaultTitle="Professional Experience"
        value={title}
        onChange={onTitleChange}
        description="Work history, freelance roles, and measurable contributions."
        rightAction={
          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddExperience}>
            Add Experience
          </Button>
        }
      />

      <div className="space-y-3">
        {experiences.map((exp, index) => {
          const isExpanded = expandedId === exp.id;

          return (
            <div
              key={exp.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all"
            >
              {/* Header Bar */}
              <div
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
                onClick={() => setExpandedId(isExpanded ? null : exp.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-slate-800 truncate">
                    {exp.role || 'Untitled Role'}
                  </span>
                  {exp.company && (
                    <span className="text-xs text-slate-500 italic truncate">
                      at {exp.company}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === experiences.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1 cursor-pointer"
                    title="Delete experience"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    className="p-1 text-slate-500 hover:text-slate-900 transition ml-1 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              {isExpanded && (
                <div className="p-4 space-y-3.5 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Job Title / Role"
                      placeholder="e.g. Senior Backend Engineer"
                      value={exp.role}
                      onChange={(e) => handleUpdate(exp.id, 'role', e.target.value)}
                    />
                    <Input
                      label="Company / Client"
                      placeholder="e.g. Acme Cloud Systems"
                      value={exp.company}
                      onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Start Date"
                      placeholder="e.g. 2023"
                      value={exp.startDate}
                      onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End Date"
                      placeholder="e.g. Present"
                      value={exp.endDate}
                      onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                    />
                    <Input
                      label="Location / Type"
                      placeholder="e.g. San Francisco, CA (or Remote)"
                      value={exp.location}
                      onChange={(e) => handleUpdate(exp.id, 'location', e.target.value)}
                    />
                  </div>

                  {/* Accomplishments Rich Text Field */}
                  <div className="pt-2 border-t border-slate-200">
                    <RichTextarea
                      label="Accomplishments / Bullet Points"
                      helperText="Each line or bullet point is rendered with your chosen bullet marker. Use the formatting toolbar or shortcuts (Ctrl+B) to highlight key skills."
                      placeholder={`• Designed and developed high-impact microservices using **Go** and **PostgreSQL**.\n• Reduced API response times by **45%** by implementing distributed Redis caching.\n• Mentored 4 engineers and established CI/CD automated test pipelines.`}
                      rows={5}
                      value={highlightsToText(exp.highlights)}
                      onChange={(text) => handleUpdate(exp.id, 'highlights', textToHighlights(text))}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
