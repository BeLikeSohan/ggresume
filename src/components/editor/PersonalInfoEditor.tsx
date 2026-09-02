'use client';

import React from 'react';
import { PersonalInfo } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { User } from 'lucide-react';

export interface PersonalInfoEditorProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <User size={16} className="text-slate-500" />
          Personal Information
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Header details displayed at the top of your resume.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          label="Full Name"
          placeholder="e.g. Washiul Alam Shohan"
          value={data.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. hello@washiul.com"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="relative">
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (555) 019-2834"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        <Input
          label="Location"
          placeholder="e.g. San Francisco, CA"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Website / Portfolio"
            placeholder="e.g. washiul.com"
            value={data.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />

          <Input
            label="GitHub Profile"
            placeholder="e.g. github.com/belikesohan"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
          />
        </div>

        <Input
          label="LinkedIn Profile (Optional)"
          placeholder="e.g. linkedin.com/in/washiul-alam"
          value={data.linkedin || ''}
          onChange={(e) => handleChange('linkedin', e.target.value)}
        />
      </div>
    </div>
  );
};
