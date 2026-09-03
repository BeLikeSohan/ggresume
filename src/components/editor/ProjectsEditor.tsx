'use client';

import React, { useState } from 'react';
import { Project } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FolderGit2, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Bold } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';

export interface ProjectsEditorProps {
  projects: Project[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (projects: Project[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects,
  title,
  onTitleChange,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  const handleAddProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Project',
      subtitle: 'Platform / App Subtitle',
      technologies: 'React, Node.js, PostgreSQL, Docker',
      link: 'https://github.com/username/repo',
      highlights: ['**Led full-stack development** using modern best practices and scalable architecture.'],
    };
    onChange([...projects, newProject]);
    setExpandedId(newProject.id);
  };

  const handleUpdate = (id: string, field: keyof Project, value: any) => {
    onChange(
      projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
    );
  };

  const handleDelete = (id: string) => {
    onChange(projects.filter((proj) => proj.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const newProjects = [...projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);
    onChange(newProjects);
  };

  // Highlights
  const handleAddHighlight = (projId: string) => {
    onChange(
      projects.map((proj) =>
        proj.id === projId
          ? { ...proj, highlights: [...proj.highlights, ''] }
          : proj
      )
    );
  };

  const handleUpdateHighlight = (projId: string, index: number, value: string) => {
    onChange(
      projects.map((proj) => {
        if (proj.id === projId) {
          const newHighlights = [...proj.highlights];
          newHighlights[index] = value;
          return { ...proj, highlights: newHighlights };
        }
        return proj;
      })
    );
  };

  const handleDeleteHighlight = (projId: string, index: number) => {
    onChange(
      projects.map((proj) => {
        if (proj.id === projId) {
          const newHighlights = proj.highlights.filter((_, i) => i !== index);
          return { ...proj, highlights: newHighlights };
        }
        return proj;
      })
    );
  };

  const handleBoldHighlight = (projId: string, index: number, inputId: string) => {
    if (typeof document === 'undefined') return;
    const textarea = document.getElementById(inputId) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    const currentText = proj.highlights[index] || '';
    if (start === end) {
      const updated = currentText.substring(0, start) + '**key accomplishment**' + currentText.substring(end);
      handleUpdateHighlight(projId, index, updated);
    } else {
      const selected = currentText.substring(start, end);
      const updated = currentText.substring(0, start) + `**${selected}**` + currentText.substring(end);
      handleUpdateHighlight(projId, index, updated);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeaderWithTitle
        icon={FolderGit2}
        defaultTitle="Projects"
        value={title}
        onChange={onTitleChange}
        description="Open-source projects, system architectures, and products you built."
        rightAction={
          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddProject}>
            Add Project
          </Button>
        }
      />

      <div className="space-y-3">
        {projects.map((proj, index) => {
          const isExpanded = expandedId === proj.id;

          return (
            <div
              key={proj.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all"
            >
              {/* Header Bar */}
              <div
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
                onClick={() => setExpandedId(isExpanded ? null : proj.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-slate-800 truncate">
                    {proj.title || 'Untitled Project'}
                  </span>
                  {proj.subtitle && (
                    <span className="text-xs text-slate-500 italic truncate">
                      — {proj.subtitle}
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
                    disabled={index === projects.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : proj.id)}
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
                      label="Project Title"
                      placeholder="e.g. Distributed Task Queue"
                      value={proj.title}
                      onChange={(e) => handleUpdate(proj.id, 'title', e.target.value)}
                    />
                    <Input
                      label="Subtitle / Role"
                      placeholder="e.g. Core Maintainer"
                      value={proj.subtitle}
                      onChange={(e) => handleUpdate(proj.id, 'subtitle', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label="Technologies Used"
                        placeholder="e.g. Rust, Tokio, gRPC, Redis"
                        value={proj.technologies}
                        onChange={(e) => handleUpdate(proj.id, 'technologies', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Live Link / GitHub"
                      placeholder="e.g. github.com/user/project"
                      value={proj.link || ''}
                      onChange={(e) => handleUpdate(proj.id, 'link', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Start Date"
                      placeholder="e.g. Jan 2024"
                      value={proj.startDate || ''}
                      onChange={(e) => handleUpdate(proj.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End Date"
                      placeholder="e.g. Present"
                      value={proj.endDate || ''}
                      onChange={(e) => handleUpdate(proj.id, 'endDate', e.target.value)}
                    />
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Bullet Points (Accomplishments & Tech Details)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddHighlight(proj.id)}
                        className="text-xs text-slate-900 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Plus size={12} />
                        Add Bullet
                      </button>
                    </div>

                    <div className="space-y-2">
                      {proj.highlights.map((highlight, hIndex) => {
                        const inputId = `proj-${proj.id}-h-${hIndex}`;
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
                                  handleUpdateHighlight(proj.id, hIndex, e.target.value)
                                }
                                placeholder="Architected raft consensus engine handling 10k ops/sec..."
                                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2 pr-8 focus:border-slate-900 focus:outline-none transition resize-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleBoldHighlight(proj.id, hIndex, inputId)}
                                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                                title="Make selected text bold (**bold**)"
                              >
                                <Bold size={13} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteHighlight(proj.id, hIndex)}
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
