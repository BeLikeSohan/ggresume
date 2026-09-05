export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  customLinks?: ProfileLink[];
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string; // e.g., "**Spring Boot**, **NestJS**, Gin, FastAPI, React"
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  highlights: string[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  technologies: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  organization: string;
  contact: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  location?: string;
  description?: string;
  highlights?: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export type FontFamily =
  | 'source-sans'
  | 'inter'
  | 'roboto'
  | 'open-sans'
  | 'lato'
  | 'plus-jakarta-sans'
  | 'literata'
  | 'merriweather'
  | 'lora'
  | 'eb-garamond';

export interface ResumeSettings {
  fontSize: 'compact' | 'standard' | 'spacious';
  lineSpacing: 'compact' | 'standard' | 'relaxed';
  pageMargin: 'compact' | 'standard' | 'relaxed';
  fontFamily: FontFamily | string;
  bulletStyle: 'square' | 'disc' | 'dash';
  dividerThickness: number; // in px e.g. 1.5
  accentColor: string; // e.g. #000000
  sectionOrder: string[]; // ['profile', 'skills', 'experience', 'projects', 'education', 'references', ...]
  hiddenSections: string[];
  pageBreakBefore?: string[]; // Optional manual section IDs that should start on a new page
  sectionTitles?: Record<string, string>; // Custom titles for sections (e.g., { profile: "Summary", skills: "Technical Expertise" })
}

export interface ResumeData {
  personal: PersonalInfo;
  profile: string;
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  references: Reference[];
  customSections: CustomSection[];
  settings: ResumeSettings;
}

export interface ResumeDocument {
  id: string;
  userId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  data: ResumeData;
}
