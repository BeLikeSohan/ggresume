'use client';

import React from 'react';
import { Education } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface EducationEditorProps {
  educations: Education[];
  onChange: (educations: Education[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ educations, onChange }) => {
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: 'BSc in Computer Science',
      institution: 'University Name',
      location: 'City, Country',
      startDate: '2020',
      endDate: '2024',
      details: 'Major in Software Engineering',
    };
    onChange([...educations, newEdu]);
  };

  const handleUpdate = (id: string, field: keyof Education, value: string) => {
    onChange(
      educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const handleDelete = (id: string) => {
    onChange(educations.filter((edu) => edu.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= educations.length) return;
    const newEducations = [...educations];
    const [moved] = newEducations.splice(index, 1);
    newEducations.splice(targetIndex, 0, moved);
    onChange(newEducations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <GraduationCap size={16} className="text-slate-500" />
            Education
          </h3>
          <p className="text-xs text-slate-500">
            Degrees, academic background, and relevant coursework.
          </p>
        </div>
        <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddEducation}>
          Add Education
        </Button>
      </div>

      <div className="space-y-3">
        {educations.map((edu, index) => (
          <div
            key={edu.id}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 transition-all hover:border-slate-300"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Education #{index + 1}
              </span>
              <div className="flex items-center gap-1">
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
                  disabled={index === educations.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(edu.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                  title="Delete education"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Degree / Major"
                placeholder="e.g. B.S. in Computer Science"
                value={edu.degree}
                onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
              />
              <Input
                label="University / Institution"
                placeholder="e.g. University of California, Berkeley"
                value={edu.institution}
                onChange={(e) => handleUpdate(edu.id, 'institution', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Start Date"
                placeholder="e.g. 2017"
                value={edu.startDate}
                onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
              />
              <Input
                label="End Date"
                placeholder="e.g. 2021"
                value={edu.endDate}
                onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
              />
              <Input
                label="Location"
                placeholder="e.g. Berkeley, CA"
                value={edu.location}
                onChange={(e) => handleUpdate(edu.id, 'location', e.target.value)}
              />
            </div>

            <Input
              label="Specialization / Minor / Details (Optional)"
              placeholder="e.g. Specialization in Distributed Systems and Software Architecture"
              value={edu.details || ''}
              onChange={(e) => handleUpdate(edu.id, 'details', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
