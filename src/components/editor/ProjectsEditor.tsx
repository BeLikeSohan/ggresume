'use client';

import React, { useState } from 'react';
import { Project } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FolderGit2, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';
import { RichTextarea } from '@/components/common/RichTextarea';

export interface ProjectsEditorProps {
  projects: Project[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (projects: Project[]) => void;
}

function highlightsToText(highlights: string[] | undefined): string {
  if (!highlights || highlights.length === 0) return '';
  return highlights.join('\n');
}

function textToHighlights(text: string): string[] {
  if (!text) return [];
  return text.split('\n');
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
      highlights: ['• **Led full-stack development** using modern best practices and scalable architecture.'],
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

  return (
    <div className="space-y-4">
      <SectionHeaderWithTitle
        icon={FolderGit2}
        defaultTitle="Projects"
        value={title}
        onChange={onTitleChange}
        description="Showcase standout projects, open-source work, and key features built."
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
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === projects.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : proj.id)}
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
                      label="Project Name"
                      placeholder="e.g. Distributed Task Scheduler"
                      value={proj.title}
                      onChange={(e) => handleUpdate(proj.id, 'title', e.target.value)}
                    />
                    <Input
                      label="Subtitle / Role / Context"
                      placeholder="e.g. Open Source Contributor / Creator"
                      value={proj.subtitle}
                      onChange={(e) => handleUpdate(proj.id, 'subtitle', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Key Technologies / Stack"
                      placeholder="e.g. Go, gRPC, etcd, Prometheus, Docker"
                      value={proj.technologies}
                      onChange={(e) => handleUpdate(proj.id, 'technologies', e.target.value)}
                    />
                    <Input
                      label="Project URL / Repository Link"
                      placeholder="e.g. https://github.com/yourname/project"
                      value={proj.link || ''}
                      onChange={(e) => handleUpdate(proj.id, 'link', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Start Date (Optional)"
                      placeholder="e.g. Jan 2024"
                      value={proj.startDate || ''}
                      onChange={(e) => handleUpdate(proj.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End Date (Optional)"
                      placeholder="e.g. Present"
                      value={proj.endDate || ''}
                      onChange={(e) => handleUpdate(proj.id, 'endDate', e.target.value)}
                    />
                  </div>

                  {/* Accomplishments Rich Text Field */}
                  <div className="pt-2 border-t border-slate-200">
                    <RichTextarea
                      label="Accomplishments & Bullet Points"
                      helperText="Each line or bullet point is rendered with your chosen bullet marker. Use the formatting toolbar or shortcuts (Ctrl+B) to highlight key skills."
                      placeholder={`• Architected high-throughput message processing pipeline handling **10k ops/sec**.\n• Integrated automated CI test suites achieving **95%** test coverage.\n• Deployed containerized microservices to AWS with zero downtime.`}
                      rows={5}
                      value={highlightsToText(proj.highlights)}
                      onChange={(text) => handleUpdate(proj.id, 'highlights', textToHighlights(text))}
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
