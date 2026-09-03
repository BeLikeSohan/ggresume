'use client';

import React, { useState } from 'react';
import { CustomSection, CustomSectionItem, ResumeData } from '@/types/resume';
import { PersonalInfoEditor } from './PersonalInfoEditor';
import { ProfileEditor } from './ProfileEditor';
import { SkillsEditor } from './SkillsEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { EducationEditor } from './EducationEditor';
import { ReferencesEditor } from './ReferencesEditor';
import { CustomSectionsEditor } from './CustomSectionsEditor';
import { SettingsEditor } from './SettingsEditor';
import {
  User,
  FileText,
  Cpu,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Users,
  Layers,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export type TabType =
  | 'personal'
  | 'profile'
  | 'skills'
  | 'experiences'
  | 'projects'
  | 'educations'
  | 'references'
  | 'custom'
  | 'settings';

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const customSections = data.customSections || [];
  const customTitles = data.settings?.sectionTitles || {};

  // Friendly display names for all sections (standard + custom)
  const sectionNames: Record<string, string> = {
    profile: customTitles.profile || 'Profile',
    skills: customTitles.skills || 'Skills',
    experiences: customTitles.experiences || 'Professional Experience',
    projects: customTitles.projects || 'Projects',
    educations: customTitles.educations || 'Education',
    references: customTitles.references || 'References',
    ...Object.fromEntries(customSections.map((s) => [s.id, s.title || 'Untitled Section'])),
  };

  const navItems: NavItem[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'profile', label: sectionNames.profile || 'Profile', icon: FileText },
    { id: 'skills', label: sectionNames.skills || 'Skills', icon: Cpu, badge: data.skills?.length },
    {
      id: 'experiences',
      label: customTitles.experiences ? (customTitles.experiences.length > 12 ? 'Experience' : customTitles.experiences) : 'Experience',
      icon: Briefcase,
      badge: data.experiences?.length,
    },
    { id: 'projects', label: sectionNames.projects || 'Projects', icon: FolderGit2, badge: data.projects?.length },
    { id: 'educations', label: sectionNames.educations || 'Education', icon: GraduationCap, badge: data.educations?.length },
    { id: 'references', label: sectionNames.references || 'References', icon: Users, badge: data.references?.length },
    { id: 'custom', label: 'Custom', icon: Layers, badge: customSections.length || undefined },
    { id: 'settings', label: 'Styling', icon: Settings },
  ];

  const handleUpdateSectionTitle = (sectionKey: string, newTitle: string) => {
    onChange({
      ...data,
      settings: {
        ...data.settings,
        sectionTitles: {
          ...(data.settings?.sectionTitles || {}),
          [sectionKey]: newTitle,
        },
      },
    });
  };

  const handleCreateCustomSection = (
    title: string,
    initialItems?: CustomSectionItem[]
  ) => {
    const newSecId = `custom-${Date.now()}`;
    const newSec: CustomSection = {
      id: newSecId,
      title: title.trim(),
      items:
        initialItems && initialItems.length > 0
          ? initialItems
          : [
              {
                id: `item-${Date.now()}`,
                title: 'Item Title / Award / Certification',
                subtitle: 'Issuing Organization',
                date: '2024',
                description: 'Description of key achievements or scope.',
                highlights: [],
              },
            ],
    };

    const currentSections = data.customSections || [];
    const currentOrder = data.settings?.sectionOrder || [
      'profile',
      'skills',
      'experiences',
      'projects',
      'educations',
      'references',
    ];
    const newOrder = currentOrder.includes(newSecId)
      ? currentOrder
      : [...currentOrder, newSecId];

    onChange({
      ...data,
      customSections: [...currentSections, newSec],
      settings: {
        ...data.settings,
        sectionOrder: newOrder,
      },
    });
  };

  const handleDeleteCustomSection = (id: string) => {
    const currentSections = data.customSections || [];
    const currentOrder = data.settings?.sectionOrder || [];
    const currentHidden = data.settings?.hiddenSections || [];
    const currentBreaks = data.settings?.pageBreakBefore || [];

    onChange({
      ...data,
      customSections: currentSections.filter((s) => s.id !== id),
      settings: {
        ...data.settings,
        sectionOrder: currentOrder.filter((secId) => secId !== id),
        hiddenSections: currentHidden.filter((secId) => secId !== id),
        pageBreakBefore: currentBreaks.filter((secId) => secId !== id),
      },
    });
  };

  const handleUpdateCustomSections = (newCustomSections: CustomSection[]) => {
    onChange({
      ...data,
      customSections: newCustomSections,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Tab Navigation Ribbon */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-2 pt-2 overflow-x-auto scrollbar-thin">
        <div className="flex space-x-1 min-w-max pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                <span className="truncate max-w-[120px]">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {activeTab === 'personal' && (
          <PersonalInfoEditor
            data={data.personal}
            onChange={(personal) => onChange({ ...data, personal })}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditor
            value={data.profile}
            title={data.settings?.sectionTitles?.profile}
            onTitleChange={(t) => handleUpdateSectionTitle('profile', t)}
            onChange={(profile) => onChange({ ...data, profile })}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsEditor
            skills={data.skills}
            title={data.settings?.sectionTitles?.skills}
            onTitleChange={(t) => handleUpdateSectionTitle('skills', t)}
            onChange={(skills) => onChange({ ...data, skills })}
          />
        )}

        {activeTab === 'experiences' && (
          <ExperienceEditor
            experiences={data.experiences}
            title={data.settings?.sectionTitles?.experiences}
            onTitleChange={(t) => handleUpdateSectionTitle('experiences', t)}
            onChange={(experiences) => onChange({ ...data, experiences })}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsEditor
            projects={data.projects}
            title={data.settings?.sectionTitles?.projects}
            onTitleChange={(t) => handleUpdateSectionTitle('projects', t)}
            onChange={(projects) => onChange({ ...data, projects })}
          />
        )}

        {activeTab === 'educations' && (
          <EducationEditor
            educations={data.educations}
            title={data.settings?.sectionTitles?.educations}
            onTitleChange={(t) => handleUpdateSectionTitle('educations', t)}
            onChange={(educations) => onChange({ ...data, educations })}
          />
        )}

        {activeTab === 'references' && (
          <ReferencesEditor
            references={data.references}
            title={data.settings?.sectionTitles?.references}
            onTitleChange={(t) => handleUpdateSectionTitle('references', t)}
            onChange={(references) => onChange({ ...data, references })}
          />
        )}

        {activeTab === 'custom' && (
          <CustomSectionsEditor
            customSections={customSections}
            onCreateSection={handleCreateCustomSection}
            onDeleteSection={handleDeleteCustomSection}
            onUpdateCustomSections={handleUpdateCustomSections}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsEditor
            settings={data.settings}
            onChange={(settings) => onChange({ ...data, settings })}
            sectionNames={sectionNames}
          />
        )}
      </div>
    </div>
  );
};
