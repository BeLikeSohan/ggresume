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
} from './Icons';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function estimateHeaderHeight(data: ResumeData): number {
  const nameHeight = 28;
  const mt = 11;
  const { personal } = data;
  const leftCount = [personal.email, personal.location, personal.github].filter(Boolean).length;
  const rightCount = [personal.phone, personal.website, personal.linkedin].filter(Boolean).length;
  const rows = Math.max(leftCount, rightCount, 1);
  const contactHeight = rows * 26;
  return nameHeight + mt + contactHeight;
}

function estimateSectionHeight(key: string, data: ResumeData): number {
  const TITLE_HEIGHT = 34;
  switch (key) {
    case 'profile':
      if (!data.profile) return 0;
      const lines = Math.max(1, Math.ceil(data.profile.length / 85));
      return TITLE_HEIGHT + lines * 18 + 12;
    case 'skills':
      if (!data.skills || data.skills.length === 0) return 0;
      return TITLE_HEIGHT + data.skills.length * 20 + 12;
    case 'experiences':
      if (!data.experiences || data.experiences.length === 0) return 0;
      return (
        TITLE_HEIGHT +
        data.experiences.reduce((acc, exp) => {
          const roleLine = 22;
          const highlightLines = (exp.highlights || []).reduce((hAcc, h) => {
            return hAcc + Math.max(1, Math.ceil(h.length / 80)) * 18;
          }, 0);
          return acc + roleLine + highlightLines + 12;
        }, 0)
      );
    case 'projects':
      if (!data.projects || data.projects.length === 0) return 0;
      return (
        TITLE_HEIGHT +
        data.projects.reduce((acc, proj) => {
          const titleLine = 22;
          const highlightLines = (proj.highlights || []).reduce((hAcc, h) => {
            return hAcc + Math.max(1, Math.ceil(h.length / 80)) * 18;
          }, 0);
          return acc + titleLine + highlightLines + 12;
        }, 0)
      );
    case 'educations':
      if (!data.educations || data.educations.length === 0) return 0;
      return TITLE_HEIGHT + data.educations.length * 44 + 12;
    case 'references':
      if (!data.references || data.references.length === 0) return 0;
      return TITLE_HEIGHT + data.references.length * 36 + 12;
    default:
      return 60;
  }
}

function calculatePages(
  visibleSections: string[],
  manualBreaks: string[],
  usableHeight: number,
  measuredHeights: Record<string, number>,
  headerHeight: number,
  data: ResumeData
): { sections: string[]; isFirstPage: boolean }[] {
  if (visibleSections.length === 0) {
    return [{ sections: [], isFirstPage: true }];
  }

  const manualBreakSet = new Set(manualBreaks);
  const pages: { sections: string[]; isFirstPage: boolean }[] = [];
  let currentSections: string[] = [];
  let isFirstPage = true;
  let currentHeight = headerHeight + 18.93;

  for (const secKey of visibleSections) {
    const isManualBreak = manualBreakSet.has(secKey);
    const secHeight = measuredHeights[secKey] || estimateSectionHeight(secKey, data);

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

    const visibleSections = sectionOrder.filter((key) => {
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
        default:
          const custom = customSections?.find((c) => c.id === key);
          return Boolean(custom && custom.items && custom.items.length > 0);
      }
    });

    const [pages, setPages] = useState<{ sections: string[]; isFirstPage: boolean }[]>(() =>
      calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        {},
        estimateHeaderHeight(data),
        data
      )
    );

    useIsomorphicLayoutEffect(() => {
      if (typeof window === 'undefined') return;

      const container = document.getElementById('resume-print-node');
      if (!container) return;

      const headerEl = container.querySelector('[data-resume-header]') as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.offsetHeight : estimateHeaderHeight(data);

      const sectionEls = container.querySelectorAll<HTMLElement>('[data-resume-section]');
      const measured: Record<string, number> = {};
      sectionEls.forEach((el) => {
        const key = el.getAttribute('data-resume-section');
        if (key) {
          measured[key] = el.offsetHeight;
        }
      });

      const nextPages = calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        measured,
        headerHeight,
        data
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
      'source-sans': '"Source Sans 3", "Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
      inter: '"Inter", -apple-system, sans-serif',
      roboto: '"Roboto", sans-serif',
      merriweather: '"Merriweather", serif',
    }[fontFamily];

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
              {renderSectionTitle('Profile', isFirstOnPage)}
              <p className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}>
                <FormattedText text={profile} />
              </p>
            </div>
          );

        case 'skills':
          if (!skills || skills.length === 0) return null;
          return (
            <div key="skills" data-resume-section="skills" className="resume-section w-full">
              {renderSectionTitle('Skills', isFirstOnPage)}
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
              {renderSectionTitle('Professional Experience', isFirstOnPage)}
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
              {renderSectionTitle('Projects', isFirstOnPage)}
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
              {renderSectionTitle('Education', isFirstOnPage)}
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
              {renderSectionTitle('References', isFirstOnPage)}
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
          const customSec = customSections.find((c) => c.id === sectionKey);
          if (!customSec || !customSec.items || customSec.items.length === 0) return null;

          return (
            <div key={customSec.id} data-resume-section={customSec.id} className="resume-section w-full">
              {renderSectionTitle(customSec.title, isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {customSec.items.map((item) => (
                  <div key={item.id} className="custom-item w-full">
                    <div className="flex justify-between items-baseline">
                      <div className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}>
                        <span className="font-bold text-black">{item.title}</span>
                        {item.subtitle && (
                          <>
                            <span className="text-black">, </span>
                            <span className="italic text-black font-normal">{item.subtitle}</span>
                          </>
                        )}
                      </div>
                      {(item.date || item.location) && (
                        <div className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          {item.date && <span className="block">{item.date}</span>}
                          {item.location && <span className="block">{item.location}</span>}
                        </div>
                      )}
                    </div>

                    {item.description && (
                      <p className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black`}>
                        <FormattedText text={item.description} />
                      </p>
                    )}

                    {item.highlights && item.highlights.length > 0 && (
                      <div className="flex flex-col mt-[1pt]">
                        {item.highlights.map((h, i) => (
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
                minHeight: '297mm',
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
                  <div className="grid grid-cols-2 gap-x-8 mt-[8pt]">
                    {/* Left Column */}
                    <div className="flex flex-col justify-start">
                      {personal.email && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <EmailIcon size={12} />
                          </div>
                          <a
                            href={`mailto:${personal.email}`}
                            className="hover:underline text-black truncate"
                          >
                            {personal.email}
                          </a>
                        </div>
                      )}
                      {personal.location && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <LocationIcon size={12} />
                          </div>
                          <span className="truncate">{personal.location}</span>
                        </div>
                      )}
                      {personal.github && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <GithubIcon size={12} />
                          </div>
                          <a
                            href={
                              personal.github.startsWith('http')
                                ? personal.github
                                : `https://${personal.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-black truncate"
                          >
                            {personal.github.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col justify-start pl-[2pt]">
                      {personal.phone && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <PhoneIcon size={12} />
                          </div>
                          <a href={`tel:${personal.phone}`} className="hover:underline text-black truncate">
                            {personal.phone}
                          </a>
                        </div>
                      )}
                      {personal.website && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <GlobeIcon size={12} />
                          </div>
                          <a
                            href={
                              personal.website.startsWith('http')
                                ? personal.website
                                : `https://${personal.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-black truncate"
                          >
                            {personal.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {personal.linkedin && (
                        <div className={`flex items-center h-[19.5pt] ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}>
                          <div className="w-[17pt] flex items-center justify-start flex-shrink-0">
                            <LinkedinIcon size={12} />
                          </div>
                          <a
                            href={
                              personal.linkedin.startsWith('http')
                                ? personal.linkedin
                                : `https://${personal.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-black truncate"
                          >
                            {personal.linkedin.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
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
