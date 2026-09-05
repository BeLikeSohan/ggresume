'use client';

import React, { useMemo, useState } from 'react';
import { PersonalInfo, ProfileLink, HeaderStyle } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { User, Layout } from 'lucide-react';
import { ProfileLinksEditor } from './ProfileLinksEditor';
import { HeaderStyleSelector } from '@/components/common/HeaderStyleSelector';

export interface PersonalInfoEditorProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  headerStyle?: HeaderStyle;
  onHeaderStyleChange?: (style: HeaderStyle) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  data,
  onChange,
  headerStyle = 'grid',
  onHeaderStyleChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'styling'>('content');

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
      {/* Header Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <User size={16} className="text-slate-500" />
          Personal Profile
        </h3>
        <p className="text-xs text-slate-500">
          Candidate information and header layout displayed at the top of your resume.
        </p>
      </div>

      {/* Sub-Tabs: Content vs Styling */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('content')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'content'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User size={13} />
          <span>Profile Info</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('styling')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'styling'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layout size={13} />
          <span>Profile Styling</span>
        </button>
      </div>

      {/* Tab 1: Profile Content & Details */}
      {activeSubTab === 'content' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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
      )}

      {/* Tab 2: Header Styling Options */}
      {activeSubTab === 'styling' && onHeaderStyleChange && (
        <div className="space-y-3 animate-in fade-in duration-150 pt-1">
          <HeaderStyleSelector
            value={headerStyle}
            onChange={onHeaderStyleChange}
            compact={false}
          />
        </div>
      )}
    </div>
  );
};
