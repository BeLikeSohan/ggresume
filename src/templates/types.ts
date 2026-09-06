import React from 'react';
import { ResumeData, ResumeSettings } from '@/types/resume';

export interface ContactDisplayItem {
  id: string;
  type: 'email' | 'phone' | 'location' | 'profile';
  icon: string;
  text: string;
  href?: string;
}

export interface PageSectionSlot {
  sectionKey: string;
  itemIndices?: number[];
  isContinuation?: boolean;
}

export interface ResumePage {
  slots: PageSectionSlot[];
  isFirstPage: boolean;
}

export interface MeasuredItem {
  index: number;
  height: number;
}

export interface MeasuredSection {
  totalHeight: number;
  headerHeight: number;
  items: MeasuredItem[];
}

export interface TemplateProps {
  data: ResumeData;
  scale?: number;
  isPrinting?: boolean;
  showPageGuide?: boolean;
}

export type TemplateCategory = 'all' | 'classic' | 'modern' | 'technical' | 'executive';

export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: TemplateCategory;
  badge?: string;
  previewGradient?: string;
  accentColorDefault?: string;
  defaultSettings?: Partial<ResumeSettings>;
  component: React.ForwardRefExoticComponent<
    TemplateProps & React.RefAttributes<HTMLDivElement>
  >;
}
