'use client';

import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, Sparkles } from 'lucide-react';

export interface ProfileEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <FileText size={16} className="text-slate-500" />
          Profile / Professional Summary
        </h3>
        <p className="text-xs text-slate-500">
          A concise summary of your background, key technologies, and expertise.
        </p>
      </div>

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
          <strong>Bold</strong> button above to emphasize core frameworks and skills, just like in
          the original resume layout.
        </div>
      </div>
    </div>
  );
};
