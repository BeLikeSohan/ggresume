'use client';

import React from 'react';
import { SkillCategory } from '@/types/resume';
import { Button } from '@/components/ui/Button';
import { Cpu, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';
import { RichTextarea } from '@/components/common/RichTextarea';

export interface SkillsEditorProps {
  skills: SkillCategory[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (skills: SkillCategory[]) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills,
  title,
  onTitleChange,
  onChange,
}) => {
  const handleAddCategory = () => {
    const newCategory: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: 'New Category',
      items: '',
    };
    onChange([...skills, newCategory]);
  };

  const handleUpdate = (id: string, field: keyof SkillCategory, value: string | boolean) => {
    onChange(
      skills.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleDelete = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;
    const newSkills = [...skills];
    const [moved] = newSkills.splice(index, 1);
    newSkills.splice(targetIndex, 0, moved);
    onChange(newSkills);
  };

  return (
    <div className="space-y-4">
      <SectionHeaderWithTitle
        icon={Cpu}
        defaultTitle="Skills"
        value={title}
        onChange={onTitleChange}
        description="Categorized technical and functional skill lists separated by commas."
        rightAction={
          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddCategory}>
            Add Category
          </Button>
        }
      />

      <div className="space-y-3">
        {skills.map((skill, index) => {
          return (
            <div
              key={skill.id}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={skill.category}
                    onChange={(e) => handleUpdate(skill.id, 'category', e.target.value)}
                    placeholder="Category Name (e.g. Frameworks & Databases)"
                    className={`font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 w-full max-w-xs truncate ${
                      skill.hidden ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  />
                  {skill.hidden && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      Hidden
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdate(skill.id, 'hidden', !skill.hidden)}
                    className={`p-1 transition cursor-pointer ${
                      skill.hidden
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title={skill.hidden ? 'Show on resume' : 'Hide from resume'}
                  >
                    {skill.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === skills.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1 cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <RichTextarea
                  placeholder="e.g. Go, Java, Python, **PostgreSQL**, **Redis**, Docker, Kubernetes"
                  rows={2}
                  showBullets={false}
                  value={skill.items}
                  onChange={(text) => handleUpdate(skill.id, 'items', text)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
