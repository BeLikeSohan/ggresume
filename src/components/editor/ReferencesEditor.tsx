'use client';

import React from 'react';
import { Reference, ReferenceStyle } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  AlignLeft,
  FileText,
} from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';

export interface ReferencesEditorProps {
  references: Reference[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (references: Reference[]) => void;
  style?: ReferenceStyle;
  onStyleChange?: (style: ReferenceStyle) => void;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
}

const STYLE_OPTIONS: {
  id: ReferenceStyle;
  title: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'grid',
    title: '2-Col Grid',
    desc: 'Side-by-side cards',
    icon: LayoutGrid,
  },
  {
    id: 'stacked',
    title: 'Stacked List',
    desc: 'Full-width vertical list',
    icon: List,
  },
  {
    id: 'compact',
    title: 'Compact Inline',
    desc: 'Space-saving 1-liners',
    icon: AlignLeft,
  },
  {
    id: 'upon-request',
    title: 'Upon Request',
    desc: 'Clean single statement',
    icon: FileText,
  },
];

export const ReferencesEditor: React.FC<ReferencesEditorProps> = ({
  references,
  title,
  onTitleChange,
  onChange,
  style = 'grid',
  onStyleChange,
  customText,
  onCustomTextChange,
}) => {
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

  const handleUpdate = (id: string, field: keyof Reference, value: any) => {
    onChange(
      references.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleToggleVisibility = (id: string) => {
    const target = references.find((r) => r.id === id);
    if (!target) return;
    handleUpdate(id, 'hidden', !target.hidden);
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
    <div className="space-y-6">
      <SectionHeaderWithTitle
        icon={Users}
        defaultTitle="References"
        value={title}
        onChange={onTitleChange}
        description="Professional and academic mentors who can vouch for your expertise."
        rightAction={
          style !== 'upon-request' ? (
            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddReference}>
              Add Reference
            </Button>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      {style === 'upon-request' ? (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <Input
            label="Reference Statement"
            placeholder="Available upon request."
            value={customText ?? 'Available upon request.'}
            onChange={(e) => onCustomTextChange?.(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            This statement appears on your resume in place of individual contact details to conserve space.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {references.length === 0 && (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs text-slate-500 mb-2">No references added yet.</p>
              <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={handleAddReference}>
                Add Reference
              </Button>
            </div>
          )}

          {references.map((refItem, index) => (
            <div
              key={refItem.id}
              className={`p-4 bg-white border rounded-xl shadow-xs space-y-3 transition-all ${
                refItem.hidden
                  ? 'border-slate-200 bg-slate-50/50 opacity-70'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    Reference #{index + 1}
                  </span>
                  {refItem.hidden && (
                    <span className="px-1.5 py-0.2 text-[10px] font-medium bg-amber-100 text-amber-800 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(refItem.id)}
                    className={`p-1 transition rounded ${
                      refItem.hidden
                        ? 'text-slate-400 hover:text-slate-600'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    title={refItem.hidden ? 'Show on resume' : 'Hide from resume'}
                  >
                    {refItem.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
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
                  label="Contact (Email or Phone)"
                  placeholder="e.g. s.jenkins@berkeley.edu"
                  value={refItem.contact}
                  onChange={(e) => handleUpdate(refItem.id, 'contact', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Style & Layout Selector (at the bottom) */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Layout & Presentation Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = style === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStyleChange?.(opt.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    size={14}
                    className={isSelected ? 'text-white' : 'text-slate-600'}
                  />
                  <span className="text-xs font-bold leading-tight">{opt.title}</span>
                </div>
                <div
                  className={`text-[10px] leading-snug ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
