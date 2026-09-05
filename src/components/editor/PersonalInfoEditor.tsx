'use client';

import React, { useMemo } from 'react';
import { PersonalInfo, ProfileLink } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { ProfileLinksEditor } from './ProfileLinksEditor';

export interface PersonalInfoEditorProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Resolve links list seamlessly with fallback to legacy fields
  const currentLinks = useMemo<ProfileLink[]>(() => {
    if (data.customLinks && Array.isArray(data.customLinks)) {
      return data.customLinks;
    }
    const legacyLinks: ProfileLink[] = [];
    if (data.github?.trim()) {
      legacyLinks.push({
        id: 'legacy-gh',
        label: 'GitHub',
        url: data.github.trim(),
        icon: 'github',
      });
    }
    if (data.linkedin?.trim()) {
      legacyLinks.push({
        id: 'legacy-li',
        label: 'LinkedIn',
        url: data.linkedin.trim(),
        icon: 'linkedin',
      });
    }
    if (data.website?.trim()) {
      legacyLinks.push({
        id: 'legacy-web',
        label: 'Portfolio',
        url: data.website.trim(),
        icon: 'globe',
      });
    }
    return legacyLinks;
  }, [data.customLinks, data.github, data.linkedin, data.website]);

  const handleLinksChange = (newLinks: ProfileLink[]) => {
    // Keep legacy fields synchronized for backward compatibility
    const ghLink = newLinks.find(
      (l) => l.icon === 'github' || l.label.toLowerCase().includes('github')
    );
    const liLink = newLinks.find(
      (l) => l.icon === 'linkedin' || l.label.toLowerCase().includes('linkedin')
    );
    const webLink = newLinks.find(
      (l) =>
        l.icon === 'globe' ||
        l.icon === 'website' ||
        l.label.toLowerCase().includes('portfolio') ||
        l.label.toLowerCase().includes('website')
    );

    onChange({
      ...data,
      customLinks: newLinks,
      github: ghLink ? ghLink.url : '',
      linkedin: liLink ? liLink.url : '',
      website: webLink ? webLink.url : '',
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
          value={data.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. hello@washiul.com"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +1 (555) 019-2834"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <Input
          label="Location (Optional)"
          placeholder="e.g. San Francisco, CA"
          value={data.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      {/* Profile Links Subsection */}
      <ProfileLinksEditor
        links={currentLinks}
        onChange={handleLinksChange}
      />
    </div>
  );
};
