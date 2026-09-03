'use client';

import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, Sparkles } from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';

export interface ProfileEditorProps {
  value: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (value: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  value,
  title,
  onTitleChange,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <SectionHeaderWithTitle
        icon={FileText}
        defaultTitle="Profile"
        value={title}
        onChange={onTitleChange}
        description="Concise summary of your background, core technical focus, and industry achievements."
      />

      <Textarea
        label="Summary Text"
        rows={6}
        value={value}
        onTextChange={onChange}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Backend Software Engineer with 2 years of experience..."
        helperText="Pro-tip: Highlight key technologies in bold using **keyword** (e.g. **Java/Spring Boot** or **Docker**)."
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 text-amber-600 flex-shrink-0" />
        <div>
          <span className="font-semibold">Bold ATS Keywords:</span> Select any text and click the{' '}
          <strong>Bold</strong> button above to emphasize core frameworks and skills.
        </div>
      </div>
    </div>
  );
};
