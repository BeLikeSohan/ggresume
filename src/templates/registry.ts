import { TemplateDefinition } from './types';
import { ClassicTemplate } from './classic/ClassicTemplate';
import { ModernTemplate } from './modern/ModernTemplate';
import { ExecutiveTemplate } from './executive/ExecutiveTemplate';
import { CompactTemplate } from './compact/CompactTemplate';
import { MinimalTemplate } from './minimal/MinimalTemplate';
import { SidebarTemplate } from './sidebar/SidebarTemplate';

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic Elegance',
    tagline: 'Standard single-column FlowCV style',
    description:
      'The time-tested, highly readable ATS-friendly standard with solid divider lines and customizable headers.',
    category: 'classic',
    badge: 'Standard',
    previewGradient: 'from-slate-800 to-slate-950',
    accentColorDefault: '#000000',
    defaultSettings: {
      fontFamily: 'source-sans',
      bulletStyle: 'square',
      dividerThickness: 1.5,
      accentColor: '#000000',
    },
    component: ClassicTemplate,
  },
  modern: {
    id: 'modern',
    name: 'Modern Accent',
    tagline: 'Sleek design with capsule accents',
    description:
      'Contemporary layout featuring subtle vertical accent capsules, categorized skill tags, and crisp typography.',
    category: 'modern',
    badge: 'Popular',
    previewGradient: 'from-teal-600 to-emerald-800',
    accentColorDefault: '#0f766e',
    defaultSettings: {
      fontFamily: 'plus-jakarta-sans',
      bulletStyle: 'disc',
      dividerThickness: 1.5,
      accentColor: '#0f766e',
    },
    component: ModernTemplate,
  },
  executive: {
    id: 'executive',
    name: 'Executive Suite',
    tagline: 'Sophisticated academic & leadership serif',
    description:
      'Authoritative, centered header layout with elegant EB Garamond serif typography and refined divider borders.',
    category: 'executive',
    badge: 'Leadership',
    previewGradient: 'from-slate-900 to-indigo-950',
    accentColorDefault: '#1e293b',
    defaultSettings: {
      fontFamily: 'eb-garamond',
      bulletStyle: 'square',
      dividerThickness: 1.0,
      accentColor: '#1e293b',
    },
    component: ExecutiveTemplate,
  },
  compact: {
    id: 'compact',
    name: 'Compact Technical',
    tagline: 'Maximized density for engineers & tech leads',
    description:
      'High information density with 2-column skills grid, compact badges, and tight line hierarchy. Fits more on 1 page.',
    category: 'technical',
    badge: '1-Page Fit',
    previewGradient: 'from-blue-600 to-indigo-800',
    accentColorDefault: '#2563eb',
    defaultSettings: {
      fontFamily: 'inter',
      bulletStyle: 'square',
      dividerThickness: 1.0,
      accentColor: '#2563eb',
      fontSize: 9.5,
      lineSpacing: 1.28,
      pageMargin: 36,
    },
    component: CompactTemplate,
  },
  sidebar: {
    id: 'sidebar',
    name: 'Modern 2-Column',
    tagline: 'Balanced sidebar layout for rich profiles',
    description:
      'Left-hand sidebar for contact details, skills, and education, paired with an expansive main content timeline.',
    category: 'modern',
    badge: '2-Column',
    previewGradient: 'from-sky-700 to-cyan-900',
    accentColorDefault: '#0369a1',
    defaultSettings: {
      fontFamily: 'inter',
      bulletStyle: 'disc',
      dividerThickness: 1.25,
      accentColor: '#0369a1',
      pageMargin: 38,
    },
    component: SidebarTemplate,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    tagline: 'Pure typography without heavy borders',
    description:
      'Spacious, ultra-clean aesthetic focusing purely on hierarchy, whitespace, and sharp typographic contrast.',
    category: 'classic',
    badge: 'Minimal',
    previewGradient: 'from-zinc-600 to-zinc-900',
    accentColorDefault: '#334155',
    defaultSettings: {
      fontFamily: 'lato',
      bulletStyle: 'disc',
      dividerThickness: 1.0,
      accentColor: '#334155',
    },
    component: MinimalTemplate,
  },
};

export const TEMPLATES_LIST: TemplateDefinition[] = Object.values(TEMPLATE_REGISTRY);

export function getTemplate(id?: string): TemplateDefinition {
  if (id && TEMPLATE_REGISTRY[id]) {
    return TEMPLATE_REGISTRY[id];
  }
  return TEMPLATE_REGISTRY['classic'];
}
