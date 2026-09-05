'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';
import { FormattedText } from '../preview/FormattedText';
import { RichTextarea } from '@/components/common/RichTextarea';

export interface ProfileEditorProps {
  value: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (value: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  value,
  title = 'Profile',
  onTitleChange,
  onChange,
}) => {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-4">
      {/* Section Header with default "Profile" populated */}
      <SectionHeaderWithTitle
        icon={FileText}
        defaultTitle="Profile"
        value={title || 'Profile'}
        onChange={onTitleChange}
        description="Concise summary of your background, core technical focus, and career achievements."
        rightAction={
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            title="Toggle formatted live preview"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
        }
      />

      {/* Rich Editor Component */}
      <RichTextarea
        value={value}
        onChange={onChange}
        rows={6}
        placeholder="Backend Software Engineer with 3+ years of experience in **Go**, **Java**, and **PostgreSQL**..."
      />

      {/* Live Formatted Text Preview */}
      {showPreview && value && value.trim() && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>Formatted Output Preview</span>
          </div>
          <div className="text-xs text-slate-800 leading-relaxed font-sans select-text">
            <FormattedText text={value} />
          </div>
        </div>
      )}
    </div>
  );
};
