'use client';

import React from 'react';
import { Reference } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface ReferencesEditorProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

export const ReferencesEditor: React.FC<ReferencesEditorProps> = ({ references, onChange }) => {
  const handleAddReference = () => {
    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      name: 'Reference Name',
      role: 'Job Title',
      organization: 'Company or University',
      contact: 'email@example.com',
    };
    onChange([...references, newRef]);
  };

  const handleUpdate = (id: string, field: keyof Reference, value: string) => {
    onChange(
      references.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDelete = (id: string) => {
    onChange(references.filter((r) => r.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= references.length) return;
    const newRefs = [...references];
    const [moved] = newRefs.splice(index, 1);
    newRefs.splice(targetIndex, 0, moved);
    onChange(newRefs);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            References
          </h3>
          <p className="text-xs text-slate-500">
            Professional and academic mentors who can vouch for your expertise.
          </p>
        </div>
        <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddReference}>
          Add Reference
        </Button>
      </div>

      <div className="space-y-3">
        {references.map((refItem, index) => (
          <div
            key={refItem.id}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 transition-all hover:border-slate-300"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Reference #{index + 1}
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
                  disabled={index === references.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(refItem.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                  title="Delete reference"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={refItem.name}
                onChange={(e) => handleUpdate(refItem.id, 'name', e.target.value)}
              />
              <Input
                label="Role / Title"
                placeholder="e.g. Professor of Computer Science"
                value={refItem.role}
                onChange={(e) => handleUpdate(refItem.id, 'role', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Organization / Company"
                placeholder="e.g. University of California, Berkeley"
                value={refItem.organization}
                onChange={(e) => handleUpdate(refItem.id, 'organization', e.target.value)}
              />
              <Input
                label="Email / Contact Info"
                placeholder="e.g. s.jenkins@berkeley.edu"
                value={refItem.contact}
                onChange={(e) => handleUpdate(refItem.id, 'contact', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
