'use client';

import React, { useState } from 'react';
import { Experience } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Bold } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';

export interface ExperienceEditorProps {
  experiences: Experience[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (experiences: Experience[]) => void;
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
      highlights: ['Designed and developed high-impact features using **relevant technologies**.'],
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

  // Bullet highlights
  const handleAddHighlight = (expId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, highlights: [...exp.highlights, ''] }
          : exp
      )
    );
  };

  const handleUpdateHighlight = (expId: string, index: number, value: string) => {
    onChange(
      experiences.map((exp) => {
        if (exp.id === expId) {
          const newHighlights = [...exp.highlights];
          newHighlights[index] = value;
          return { ...exp, highlights: newHighlights };
        }
        return exp;
      })
    );
  };

  const handleDeleteHighlight = (expId: string, index: number) => {
    onChange(
      experiences.map((exp) => {
        if (exp.id === expId) {
          const newHighlights = exp.highlights.filter((_, i) => i !== index);
          return { ...exp, highlights: newHighlights };
        }
        return exp;
      })
    );
  };

  const handleBoldHighlight = (expId: string, index: number, inputId: string) => {
    if (typeof document === 'undefined') return;
    const textarea = document.getElementById(inputId) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;

    const currentText = exp.highlights[index] || '';
    if (start === end) {
      const updated = currentText.substring(0, start) + '**bold phrase**' + currentText.substring(end);
      handleUpdateHighlight(expId, index, updated);
    } else {
      const selected = currentText.substring(start, end);
      const updated = currentText.substring(0, start) + `**${selected}**` + currentText.substring(end);
      handleUpdateHighlight(expId, index, updated);
    }
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
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === experiences.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                    title="Delete experience"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    className="p-1 text-slate-500 hover:text-slate-900 transition ml-1"
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

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Bullet Points (Accomplishments)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddHighlight(exp.id)}
                        className="text-xs text-slate-900 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Plus size={12} />
                        Add Bullet
                      </button>
                    </div>

                    <div className="space-y-2">
                      {exp.highlights.map((highlight, hIndex) => {
                        const inputId = `exp-${exp.id}-h-${hIndex}`;
                        return (
                          <div key={hIndex} className="relative flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-mono w-4 text-right flex-shrink-0">
                              •
                            </span>
                            <div className="relative flex-1">
                              <textarea
                                id={inputId}
                                rows={2}
                                value={highlight}
                                onChange={(e) =>
                                  handleUpdateHighlight(exp.id, hIndex, e.target.value)
                                }
                                placeholder="Engineered scalable service reducing p99 latency by 35% using Go and Redis..."
                                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2 pr-8 focus:border-slate-900 focus:outline-none transition resize-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleBoldHighlight(exp.id, hIndex, inputId)}
                                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                                title="Make selected text bold (**bold**)"
                              >
                                <Bold size={13} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteHighlight(exp.id, hIndex)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition flex-shrink-0"
                              title="Delete bullet"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
