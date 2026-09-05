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
  hidden?: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  highlights: string[];
  hidden?: boolean;
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
  hidden?: boolean;
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

export type HeaderStyle =
  | 'grid'
  | 'centered'
  | 'left-inline'
  | 'split'
  | 'banner';

export type SectionSpacing = 'compact' | 'standard' | 'spacious';

export interface ResumeSettings {
  fontSize: number | 'compact' | 'standard' | 'spacious'; // e.g. 10.0 (in pt)
  lineSpacing: number | 'compact' | 'standard' | 'relaxed'; // e.g. 1.35 (multiplier)
  pageMargin: number | 'compact' | 'standard' | 'relaxed'; // e.g. 45.0 (in pt)
  sectionSpacing?: number | 'compact' | 'standard' | 'spacious'; // e.g. 13.5 (in pt)
  fontFamily: FontFamily | string;
  bulletStyle: 'square' | 'disc' | 'dash';
  dividerThickness: number; // in pt e.g. 1.5
  accentColor: string; // e.g. #000000
  sectionOrder: string[]; // ['profile', 'skills', 'experience', 'projects', 'education', 'references', ...]
  hiddenSections: string[];
  pageBreakBefore?: string[]; // Optional manual section IDs that should start on a new page
  sectionTitles?: Record<string, string>; // Custom titles for sections (e.g., { profile: "Summary", skills: "Technical Expertise" })
  headerStyle?: HeaderStyle;
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
