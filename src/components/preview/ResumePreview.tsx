'use client';

import React, { forwardRef, useState, useEffect, useLayoutEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { FormattedText } from './FormattedText';
import { SectionHeader } from './SectionHeader';
import { BulletMarker } from './BulletMarker';
import {
  EmailIcon,
  LocationIcon,
  GithubIcon,
  PhoneIcon,
  GlobeIcon,
  LinkedinIcon,
  ExternalLinkIcon,
  ProfileIcon,
} from './Icons';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ContactDisplayItem {
  id: string;
  type: 'email' | 'phone' | 'location' | 'profile';
  icon: string;
  text: string;
  href?: string;
}

export function getPersonalContactItems(personal: ResumeData['personal']): ContactDisplayItem[] {
  if (!personal) return [];
  const items: ContactDisplayItem[] = [];

  if (personal.email && personal.email.trim()) {
    items.push({
      id: 'contact-email',
      type: 'email',
      icon: 'email',
      text: personal.email.trim(),
      href: `mailto:${personal.email.trim()}`,
    });
  }

  if (personal.phone && personal.phone.trim()) {
    items.push({
      id: 'contact-phone',
      type: 'phone',
      icon: 'phone',
      text: personal.phone.trim(),
      href: `tel:${personal.phone.trim()}`,
    });
  }

  if (personal.location && personal.location.trim()) {
    items.push({
      id: 'contact-location',
      type: 'location',
      icon: 'location',
      text: personal.location.trim(),
    });
  }

  // Profile links: use customLinks if provided, or legacy fields as fallback
  if (
    personal.customLinks &&
    Array.isArray(personal.customLinks) &&
    personal.customLinks.length > 0
  ) {
    personal.customLinks.forEach((link, idx) => {
      if (link.url && link.url.trim()) {
        const rawUrl = link.url.trim();
        const displayUrl = rawUrl.replace(/^https?:\/\//, '');
        const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        items.push({
          id: link.id || `profile-link-${idx}`,
          type: 'profile',
          icon: link.icon || 'link',
          text: displayUrl,
          href,
        });
      }
    });
  } else {
    // Legacy fallbacks
    if (personal.github && personal.github.trim()) {
      const raw = personal.github.trim();
      items.push({
        id: 'contact-github',
        type: 'profile',
        icon: 'github',
        text: raw.replace(/^https?:\/\//, ''),
        href: raw.startsWith('http') ? raw : `https://${raw}`,
      });
    }
    if (personal.linkedin && personal.linkedin.trim()) {
      const raw = personal.linkedin.trim();
      items.push({
        id: 'contact-linkedin',
        type: 'profile',
        icon: 'linkedin',
        text: raw.replace(/^https?:\/\//, ''),
        href: raw.startsWith('http') ? raw : `https://${raw}`,
      });
    }
    if (personal.website && personal.website.trim()) {
      const raw = personal.website.trim();
      items.push({
        id: 'contact-website',
        type: 'profile',
        icon: 'globe',
        text: raw.replace(/^https?:\/\//, ''),
        href: raw.startsWith('http') ? raw : `https://${raw}`,
      });
    }
  }

  return items;
}

function estimateHeaderHeight(
  data: ResumeData,
  fontSize: 'compact' | 'standard' | 'spacious' = 'standard'
): number {
  const nameHeight = fontSize === 'compact' ? 24 : fontSize === 'spacious' ? 32 : 28;
  const mt = 11;
  const items = getPersonalContactItems(data.personal);
  const rows = Math.max(Math.ceil(items.length / 2), 1);
  const contactHeight = rows * 26;
  return nameHeight + mt + contactHeight;
}

function estimateSectionHeight(
  key: string,
  data: ResumeData,
  fontSize: 'compact' | 'standard' | 'spacious' = 'standard',
  lineSpacing: 'compact' | 'standard' | 'relaxed' = 'standard'
): number {
  const fontMultiplier = fontSize === 'compact' ? 0.95 : fontSize === 'spacious' ? 1.15 : 1.0;
  const lineMultiplier = lineSpacing === 'compact' ? 0.95 : lineSpacing === 'relaxed' ? 1.15 : 1.0;
  const scale = fontMultiplier * lineMultiplier;

  const TITLE_HEIGHT = Math.round(34 * fontMultiplier);
  const BASE_LINE_HEIGHT = Math.round(18 * scale);
  const ITEM_HEADER_HEIGHT = Math.round(22 * fontMultiplier);

  switch (key) {
    case 'profile':
      if (!data.profile) return 0;
      const lines = Math.max(1, Math.ceil(data.profile.length / 80));
      return TITLE_HEIGHT + lines * BASE_LINE_HEIGHT + 8;
    case 'skills':
      if (!data.skills || data.skills.length === 0) return 0;
      return TITLE_HEIGHT + data.skills.length * Math.round(22 * scale) + 8;
    case 'experiences':
      if (!data.experiences || data.experiences.length === 0) return 0;
      return (
        TITLE_HEIGHT +
        data.experiences.reduce((acc, exp) => {
          const highlightLines = (exp.highlights || []).reduce((hAcc, h) => {
            return hAcc + Math.max(1, Math.ceil(h.length / 75)) * BASE_LINE_HEIGHT;
          }, 0);
          return acc + ITEM_HEADER_HEIGHT + highlightLines + 10;
        }, 0)
      );
    case 'projects':
      if (!data.projects || data.projects.length === 0) return 0;
      return (
        TITLE_HEIGHT +
        data.projects.reduce((acc, proj) => {
          const highlightLines = (proj.highlights || []).reduce((hAcc, h) => {
            return hAcc + Math.max(1, Math.ceil(h.length / 75)) * BASE_LINE_HEIGHT;
          }, 0);
          return acc + ITEM_HEADER_HEIGHT + highlightLines + 10;
        }, 0)
      );
    case 'educations':
      if (!data.educations || data.educations.length === 0) return 0;
      return TITLE_HEIGHT + data.educations.length * Math.round(44 * scale) + 8;
    case 'references':
      if (!data.references || data.references.length === 0) return 0;
      return TITLE_HEIGHT + data.references.length * Math.round(36 * scale) + 8;
    default: {
      const customSec = (data.customSections || []).find((c) => c.id === key);
      if (!customSec || !customSec.items || customSec.items.length === 0) return 0;
      return (
        TITLE_HEIGHT +
        customSec.items.reduce((acc, item) => {
          const descLines = item.description
            ? Math.max(1, Math.ceil(item.description.length / 75)) * BASE_LINE_HEIGHT
            : 0;
          const highlightLines = (item.highlights || []).reduce((hAcc, h) => {
            return hAcc + Math.max(1, Math.ceil(h.length / 75)) * BASE_LINE_HEIGHT;
          }, 0);
          return acc + ITEM_HEADER_HEIGHT + descLines + highlightLines + 10;
        }, 0)
      );
    }
  }
}

function calculatePages(
  visibleSections: string[],
  manualBreaks: string[],
  usableHeight: number,
  measuredHeights: Record<string, number>,
  headerHeight: number,
  data: ResumeData,
  fontSize: 'compact' | 'standard' | 'spacious' = 'standard',
  lineSpacing: 'compact' | 'standard' | 'relaxed' = 'standard'
): { sections: string[]; isFirstPage: boolean }[] {
  if (visibleSections.length === 0) {
    return [{ sections: [], isFirstPage: true }];
  }

  // 14.2pt header margin-bottom in px: 14.2 * (96 / 72) = 18.93px
  const HEADER_MB_PX = 18.93;

  const manualBreakSet = new Set(manualBreaks);
  const pages: { sections: string[]; isFirstPage: boolean }[] = [];
  let currentSections: string[] = [];
  let isFirstPage = true;
  let currentHeight = headerHeight + HEADER_MB_PX;

  for (const secKey of visibleSections) {
    const isManualBreak = manualBreakSet.has(secKey);
    const secHeight =
      measuredHeights[secKey] ||
      estimateSectionHeight(secKey, data, fontSize, lineSpacing);

    if (isManualBreak && (currentSections.length > 0 || !isFirstPage)) {
      pages.push({ sections: currentSections, isFirstPage });
      currentSections = [secKey];
      isFirstPage = false;
      currentHeight = secHeight;
      continue;
    }

    if (currentSections.length > 0 && currentHeight + secHeight > usableHeight) {
      pages.push({ sections: currentSections, isFirstPage });
      currentSections = [secKey];
      isFirstPage = false;
      currentHeight = secHeight;
    } else {
      currentSections.push(secKey);
      currentHeight += secHeight;
    }
  }

  if (currentSections.length > 0 || pages.length === 0) {
    pages.push({ sections: currentSections, isFirstPage });
  }

  return pages;
}

export interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  isPrinting?: boolean;
  showPageGuide?: boolean;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, scale = 1, isPrinting = false, showPageGuide = true }, ref) => {
    const {
      personal,
      profile,
      skills,
      experiences,
      projects,
      educations,
      references,
      customSections,
      settings,
    } = data;

    const {
      fontSize = 'standard',
      lineSpacing = 'standard',
      pageMargin = 'standard',
      fontFamily = 'source-sans',
      bulletStyle = 'square',
      dividerThickness = 1.5,
      accentColor = '#000000',
      sectionOrder = ['profile', 'skills', 'experiences', 'projects', 'educations', 'references'],
      hiddenSections = [],
      pageBreakBefore = [],
    } = settings;

    const rawBreaks = Array.isArray(pageBreakBefore) ? pageBreakBefore : [];
    const effectivePageBreaks =
      rawBreaks.length === 1 && rawBreaks[0] === 'educations' ? [] : rawBreaks;

    const A4_HEIGHT_PX = 1122.52;
    const verticalPaddingPx =
      {
        compact: (32 + 32) * (96 / 72),
        standard: (41.5 + 42) * (96 / 72),
        relaxed: (48 + 48) * (96 / 72),
      }[pageMargin] || 111.33;
    const usablePageHeight = A4_HEIGHT_PX - verticalPaddingPx;

    const allCustomSections = customSections || [];
    const baseSectionOrder = settings.sectionOrder || [
      'profile',
      'skills',
      'experiences',
      'projects',
      'educations',
      'references',
    ];
    const missingCustomIds = allCustomSections
      .map((s) => s.id)
      .filter((id) => !baseSectionOrder.includes(id));
    const effectiveSectionOrder = [...baseSectionOrder, ...missingCustomIds];

    const visibleSections = effectiveSectionOrder.filter((key) => {
      if (hiddenSections.includes(key)) return false;
      switch (key) {
        case 'profile':
          return Boolean(profile && profile.trim());
        case 'skills':
          return Boolean(skills && skills.length > 0);
        case 'experiences':
          return Boolean(experiences && experiences.length > 0);
        case 'projects':
          return Boolean(projects && projects.length > 0);
        case 'educations':
          return Boolean(educations && educations.length > 0);
        case 'references':
          return Boolean(references && references.length > 0);
        default: {
          const custom = allCustomSections.find((c) => c.id === key);
          return Boolean(
            custom &&
              custom.items &&
              custom.items.length > 0 &&
              custom.items.some(
                (it) =>
                  Boolean(it.title && it.title.trim()) ||
                  Boolean(it.subtitle && it.subtitle.trim()) ||
                  Boolean(it.description && it.description.trim()) ||
                  Boolean(it.highlights && it.highlights.length > 0)
              )
          );
        }
      }
    });

    const [pages, setPages] = useState<{ sections: string[]; isFirstPage: boolean }[]>(() =>
      calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        {},
        estimateHeaderHeight(data, fontSize),
        data,
        fontSize,
        lineSpacing
      )
    );

    useIsomorphicLayoutEffect(() => {
      if (typeof window === 'undefined') return;

      const container = document.getElementById('resume-print-node');
      if (!container) return;

      const headerEl = container.querySelector('[data-resume-header]') as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.offsetHeight : estimateHeaderHeight(data, fontSize);

      const sectionEls = container.querySelectorAll<HTMLElement>('[data-resume-section]');
      const measured: Record<string, number> = {};
      sectionEls.forEach((el) => {
        const key = el.getAttribute('data-resume-section');
        if (key) {
          measured[key] = Math.max(el.offsetHeight, el.scrollHeight);
        }
      });

      const nextPages = calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        measured,
        headerHeight,
        data,
        fontSize,
        lineSpacing
      );

      setPages((prev) => {
        const isSame =
          prev.length === nextPages.length &&
          prev.every(
            (p, i) =>
              p.isFirstPage === nextPages[i].isFirstPage &&
              p.sections.length === nextPages[i].sections.length &&
              p.sections.every((s, si) => s === nextPages[i].sections[si])
          );
        return isSame ? prev : nextPages;
      });
    }, [
      data,
      visibleSections.join(','),
      effectivePageBreaks.join(','),
      usablePageHeight,
      fontSize,
      lineSpacing,
      pageMargin,
      fontFamily,
    ]);

    // Font size scaling (exact point sizes)
    const fontSizeClasses = {
      compact: {
        root: 'text-[9.5pt]',
        name: 'text-[17pt]',
        sectionTitle: 'text-[10.5pt]',
        itemTitle: 'text-[9.5pt]',
        body: 'text-[9.5pt]',
        subtext: 'text-[9.5pt]',
      },
      standard: {
        root: 'text-[10pt]',
        name: 'text-[18pt]',
        sectionTitle: 'text-[11pt]',
        itemTitle: 'text-[10pt]',
        body: 'text-[10pt]',
        subtext: 'text-[10pt]',
      },
      spacious: {
        root: 'text-[10.5pt]',
        name: 'text-[19pt]',
        sectionTitle: 'text-[11.5pt]',
        itemTitle: 'text-[10.5pt]',
        body: 'text-[10.5pt]',
        subtext: 'text-[10.5pt]',
      },
    }[fontSize];

    // Spacing configs (matching exact FlowCV 12pt line spacing on 10pt font)
    const lineSpacingClasses = {
      compact: 'leading-[1.15]',
      standard: 'leading-[1.2]',
      relaxed: 'leading-[1.32]',
    }[lineSpacing];

    const marginStyles = {
      compact: { paddingLeft: '36pt', paddingRight: '36pt', paddingTop: '32pt', paddingBottom: '32pt' },
      standard: { paddingLeft: '45.4pt', paddingRight: '45.4pt', paddingTop: '41.5pt', paddingBottom: '42pt' },
      relaxed: { paddingLeft: '52pt', paddingRight: '52pt', paddingTop: '48pt', paddingBottom: '48pt' },
    }[pageMargin];

    const fontFamilies = {
      'source-sans': 'var(--font-source-sans), "Source Sans 3", "Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
      inter: 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      roboto: 'var(--font-roboto), "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
      'open-sans': 'var(--font-open-sans), "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      lato: 'var(--font-lato), "Lato", -apple-system, BlinkMacSystemFont, sans-serif',
      'plus-jakarta-sans': 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      literata: 'var(--font-literata), "Literata", Georgia, serif',
      merriweather: 'var(--font-merriweather), "Merriweather", Georgia, serif',
      lora: 'var(--font-lora), "Lora", Georgia, serif',
      'eb-garamond': 'var(--font-eb-garamond), "EB Garamond", "Garamond", Georgia, serif',
    }[fontFamily as string] || 'var(--font-source-sans), "Source Sans 3", sans-serif';

    // Helper to render section title with solid, non-collapsible divider line
    const renderSectionTitle = (title: string, isFirstOnPage = false) => (
      <SectionHeader
        title={title}
        accentColor={accentColor}
        dividerThickness={dividerThickness}
        isFirstOnPage={isFirstOnPage}
        fontSizeClass={fontSizeClasses.sectionTitle}
      />
    );

    const getSectionTitle = (sectionKey: string, fallback: string) => {
      return settings.sectionTitles?.[sectionKey] || fallback;
    };

    // Render bullet marker
    const renderBullet = () => (
      <BulletMarker style={bulletStyle} accentColor={accentColor} />
    );

    // Render Section Content
    const renderSection = (sectionKey: string, isFirstOnPage = false) => {
      if (hiddenSections.includes(sectionKey)) return null;

      switch (sectionKey) {
        case 'profile':
          if (!profile) return null;
          return (
            <div key="profile" data-resume-section="profile" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('profile', 'Profile'), isFirstOnPage)}
              <p className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}>
                <FormattedText text={profile} />
              </p>
            </div>
          );

        case 'skills':
          if (!skills || skills.length === 0) return null;
          return (
            <div key="skills" data-resume-section="skills" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('skills', 'Skills'), isFirstOnPage)}
              <div className="flex flex-col gap-0">
                {skills.map((s) => (
                  <div key={s.id} className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black`}>
                    <span className="font-bold text-black">{s.category}</span>
                    <span className="mx-1 text-black font-normal">—</span>
                    <FormattedText text={s.items} />
                  </div>
                ))}
              </div>
            </div>
          );

        case 'experiences':
          if (!experiences || experiences.length === 0) return null;
          return (
            <div key="experiences" data-resume-section="experiences" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('experiences', 'Professional Experience'), isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {experiences.map((exp) => (
                  <div key={exp.id} className="experience-item w-full">
                    {/* Top right date & location floated so accomplishments text-wrap around it */}
                    {(exp.startDate || exp.endDate || exp.isCurrent || exp.location) && (
                      <div
                        className={`float-right text-right ml-4 mb-0.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black select-none`}
                      >
                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <div className="whitespace-nowrap">
                            {exp.startDate}
                            {exp.endDate ? ` – ${exp.endDate}` : exp.isCurrent ? ' – Present' : ''}
                          </div>
                        )}
                        {exp.location && (
                          <div className="whitespace-nowrap">{exp.location}</div>
                        )}
                      </div>
                    )}

                    {/* Role & Company on the left */}
                    <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}>
                      <span className="font-bold text-black">{exp.role}</span>
                      {exp.company && (
                        <>
                          <span className="text-black">, </span>
                          <span className="italic text-black font-normal">{exp.company}</span>
                        </>
                      )}
                    </div>

                    {/* Bullets (Accomplishments) */}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="mt-[1pt]">
                        {exp.highlights.map((h, i) => (
                          <div
                            key={i}
                            className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify pl-[10pt] -indent-[10pt]`}
                          >
                            <BulletMarker
                              style={bulletStyle}
                              accentColor={accentColor}
                              isInline={true}
                            />
                            <FormattedText text={h} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="clear-both" />
                  </div>
                ))}
              </div>
            </div>
          );

        case 'projects':
          if (!projects || projects.length === 0) return null;
          return (
            <div key="projects" data-resume-section="projects" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('projects', 'Projects'), isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {projects.map((proj) => (
                  <div key={proj.id} className="project-item w-full">
                    <div className="flex justify-between items-baseline">
                      <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses} flex-1 mr-4`}>
                        <span className="font-bold text-black">
                          {proj.title}
                          {proj.subtitle && ` — ${proj.subtitle}`}
                        </span>
                        {proj.technologies && (
                          <>
                            <span className="text-black font-normal">, </span>
                            <span className="italic font-normal text-black">
                              {proj.technologies}
                            </span>
                          </>
                        )}
                        {proj.link && (
                          <a
                            href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black inline-flex items-center ml-1"
                          >
                            <ExternalLinkIcon size={9} />
                          </a>
                        )}
                      </div>
                      {(proj.startDate || proj.endDate) && (
                        <div className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <span>
                            {proj.startDate}
                            {proj.endDate ? ` – ${proj.endDate}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {proj.highlights && proj.highlights.length > 0 && (
                      <div className="flex flex-col mt-[1pt]">
                        {proj.highlights.map((h, i) => (
                          <div
                            key={i}
                            className={`flex items-start ${fontSizeClasses.body} ${lineSpacingClasses} text-black`}
                          >
                            {renderBullet()}
                            <div className="flex-1 text-justify">
                              <FormattedText text={h} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'educations':
          if (!educations || educations.length === 0) return null;
          return (
            <div key="educations" data-resume-section="educations" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('educations', 'Education'), isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {educations.map((edu) => (
                  <div key={edu.id} className="education-item w-full">
                    <div className="flex justify-between items-baseline">
                      <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}>
                        <span className="font-bold text-black">{edu.degree}</span>
                        {edu.institution && (
                          <>
                            <span className="text-black">, </span>
                            <span className="italic text-black font-normal">{edu.institution}</span>
                          </>
                        )}
                      </div>
                      <div className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                        <span>
                          {edu.startDate}
                          {edu.endDate ? ` – ${edu.endDate}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <div className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black`}>
                        {edu.details && <span>{edu.details}</span>}
                      </div>
                      {edu.location && (
                        <div className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          {edu.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'references':
          if (!references || references.length === 0) return null;
          return (
            <div key="references" data-resume-section="references" className="resume-section w-full">
              {renderSectionTitle(getSectionTitle('references', 'References'), isFirstOnPage)}
              <div className="flex flex-col gap-[5.4pt]">
                {references.map((refItem) => (
                  <div key={refItem.id} className="reference-item w-full">
                    <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}>
                      <span className="font-bold text-black">{refItem.name}</span>
                      {refItem.role && (
                        <>
                          <span className="text-black">, </span>
                          <span className="italic text-black font-normal">{refItem.role}</span>
                        </>
                      )}
                      {refItem.organization && (
                        <>
                          <span className="text-black">, </span>
                          <span className="text-black font-normal">{refItem.organization}</span>
                        </>
                      )}
                    </div>
                    {refItem.contact && (
                      <div className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                        {refItem.contact.includes('@') ? (
                          <a
                            href={`mailto:${refItem.contact}`}
                            className="text-black hover:underline"
                          >
                            {refItem.contact}
                          </a>
                        ) : (
                          <span>{refItem.contact}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );

        default: {
          // Custom sections
          const customSec = (customSections || []).find((c) => c.id === sectionKey);
          if (!customSec || !customSec.items || customSec.items.length === 0) return null;

          return (
            <div key={customSec.id} data-resume-section={customSec.id} className="resume-section w-full">
              {renderSectionTitle(customSec.title || 'Custom Section', isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {customSec.items.map((item) => {
                  if (
                    !item.title &&
                    !item.subtitle &&
                    !item.description &&
                    (!item.highlights || item.highlights.length === 0)
                  ) {
                    return null;
                  }

                  return (
                    <div key={item.id} className="custom-item w-full">
                      {/* Top right date & location floated */}
                      {(item.date || item.location) && (
                        <div
                          className={`float-right text-right ml-4 mb-0.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black select-none`}
                        >
                          {item.date && <div className="whitespace-nowrap">{item.date}</div>}
                          {item.location && <div className="whitespace-nowrap">{item.location}</div>}
                        </div>
                      )}

                      {/* Title & Subtitle */}
                      <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}>
                        {item.title && <span className="font-bold text-black">{item.title}</span>}
                        {item.subtitle && (
                          <>
                            {item.title && <span className="text-black">, </span>}
                            <span className="italic text-black font-normal">{item.subtitle}</span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black mt-[1pt] text-justify`}>
                          <FormattedText text={item.description} />
                        </p>
                      )}

                      {/* Bullets (Highlights) */}
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="mt-[1pt]">
                          {item.highlights.map((h, i) => (
                            <div
                              key={i}
                              className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify pl-[10pt] -indent-[10pt]`}
                            >
                              <BulletMarker
                                style={bulletStyle}
                                accentColor={accentColor}
                                isInline={true}
                              />
                              <FormattedText text={h} />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="clear-both" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      }
    };

    return (
      <div
        className="preview-container flex flex-col items-center select-text"
        style={{
          transform: isPrinting ? 'none' : `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Container wrapping all resume pages */}
        <div
          ref={ref}
          id="resume-print-node"
          className="print-area flex flex-col items-center gap-8"
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              data-page-number={pageIndex + 1}
              className="resume-page bg-white text-black shadow-2xl relative"
              style={{
                width: '210mm',
                height: '297mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: fontFamilies,
                ...marginStyles,
              }}
            >
              {/* Header only on page 0 */}
              {page.isFirstPage && (
                <header data-resume-header="true" className="resume-header mb-[14.2pt]">
                  {/* Candidate Name */}
                  <h1
                    className={`${fontSizeClasses.name} font-bold text-black`}
                    style={{
                      color: accentColor,
                      lineHeight: 1.15,
                      margin: 0,
                      letterSpacing: 'normal',
                      fontFamily: fontFamilies,
                    }}
                  >
                    {personal.fullName || 'Your Full Name'}
                  </h1>

                  {/* Contact Info: Two Column Grid matching original FlowCV */}
                  {(() => {
                    const contactItems = getPersonalContactItems(personal);
                    if (contactItems.length === 0) return null;
                    const mid = Math.ceil(contactItems.length / 2);
                    const leftColumnItems = contactItems.slice(0, mid);
                    const rightColumnItems = contactItems.slice(mid);

                    return (
                      <div className="grid grid-cols-2 gap-x-8 mt-[8pt]">
                        {/* Left Column */}
                        <div className="flex flex-col justify-start">
                          {leftColumnItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                                <ProfileIcon icon={item.icon} size={12} />
                              </div>
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={
                                    item.type === 'email' || item.type === 'phone'
                                      ? undefined
                                      : '_blank'
                                  }
                                  rel={
                                    item.type === 'email' || item.type === 'phone'
                                      ? undefined
                                      : 'noopener noreferrer'
                                  }
                                  className="hover:underline text-black truncate"
                                >
                                  {item.text}
                                </a>
                              ) : (
                                <span className="truncate">{item.text}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col justify-start pl-[2pt]">
                          {rightColumnItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                                <ProfileIcon icon={item.icon} size={12} />
                              </div>
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={
                                    item.type === 'email' || item.type === 'phone'
                                      ? undefined
                                      : '_blank'
                                  }
                                  rel={
                                    item.type === 'email' || item.type === 'phone'
                                      ? undefined
                                      : 'noopener noreferrer'
                                  }
                                  className="hover:underline text-black truncate"
                                >
                                  {item.text}
                                </a>
                              ) : (
                                <span className="truncate">{item.text}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </header>
              )}

              {/* Sections for this Page */}
              <div className="resume-body">
                {page.sections.map((sectionKey, secIdx) =>
                  renderSection(sectionKey, page.isFirstPage ? false : secIdx === 0)
                )}
              </div>

              {/* Page Number Label (in preview only) */}
              {showPageGuide && (
                <div className="no-print absolute bottom-2 right-4 text-[9px] font-mono text-slate-400 select-none">
                  Page {pageIndex + 1} of {pages.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
