'use client';

import React from 'react';
import { SkillCategory } from '@/types/resume';
import { Button } from '@/components/ui/Button';
import { Cpu, Plus, Trash2, ArrowUp, ArrowDown, Bold } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';

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

  const handleUpdate = (id: string, field: keyof SkillCategory, value: string) => {
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

  const handleBoldSelection = (id: string, inputId: string) => {
    if (typeof document === 'undefined') return;
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const item = skills.find((s) => s.id === id);
    if (!item) return;

    const currentText = item.items || '';
    if (start === end) {
      const updated = currentText.substring(0, start) + '**Skill**' + currentText.substring(end);
      handleUpdate(id, 'items', updated);
    } else {
      const selected = currentText.substring(start, end);
      const updated = currentText.substring(0, start) + `**${selected}**` + currentText.substring(end);
      handleUpdate(id, 'items', updated);
    }
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
          const inputId = `skill-items-${skill.id}`;
          return (
            <div
              key={skill.id}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => handleUpdate(skill.id, 'category', e.target.value)}
                  placeholder="Category Name (e.g. Frameworks)"
                  className="font-semibold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 w-48"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === skills.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id={inputId}
                  type="text"
                  value={skill.items}
                  onChange={(e) => handleUpdate(skill.id, 'items', e.target.value)}
                  placeholder="Java, Go, Python, TypeScript, Spring Boot, Docker"
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-10 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleBoldSelection(skill.id, inputId)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded transition"
                  title="Make selected skill bold (**skill**)"
                >
                  <Bold size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
