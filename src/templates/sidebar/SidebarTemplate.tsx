'use client';

import React, { forwardRef, useMemo } from 'react';
import { FormattedText } from '@/components/preview/FormattedText';
import { BulletMarker } from '@/components/preview/BulletMarker';
import { ExternalLinkIcon, ProfileIcon } from '@/components/preview/Icons';
import { TemplateProps, PageSectionSlot } from '../types';
import {
  getPersonalContactItems,
  resolveFontFamilyStyle,
} from '../utils/templateUtils';
import { useTemplatePagination } from '../utils/useTemplatePagination';

export const SidebarTemplate = forwardRef<HTMLDivElement, TemplateProps>(
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
      settings = {} as any,
    } = data;

    const {
      fontFamily = 'inter',
      bulletStyle = 'disc',
      accentColor = '#0369a1', // Sky / Oceanic Blue
      hiddenSections = [],
    } = settings;

    // Right column sections: profile, experiences, projects, custom
    const rightSections = useMemo(() => {
      const basic = ['profile', 'experiences', 'projects'].filter(
        (key) => {
          if (hiddenSections.includes(key)) return false;
          if (key === 'profile') return Boolean(profile && profile.trim());
          if (key === 'experiences')
            return Boolean(experiences && experiences.some((e) => !e.hidden));
          if (key === 'projects')
            return Boolean(projects && projects.some((p) => !p.hidden));
          return false;
        }
      );

      const customIds = (customSections || []).map((c) => c.id);
      return [
        ...basic,
        ...customIds.filter((id) => !hiddenSections.includes(id)),
      ];
    }, [
      hiddenSections.join(','),
      profile,
      experiences?.length,
      projects?.length,
      (customSections || []).map((c) => c.id).join(','),
    ]);

    const {
      pages,
      numFontSize,
      numLineSpacing,
      numSectionSpacing,
      marginH,
      marginV,
    } = useTemplatePagination(data, {
      customVisibleSections: rightSections,
    });

    const fontSizeClasses = {
      name: 'text-[1.85em]',
      sectionTitle: 'text-[1.05em]',
      itemTitle: 'text-[0.98em]',
      body: 'text-[0.95em]',
      subtext: 'text-[0.88em]',
    };

    const lineSpacingClasses = 'leading-[inherit]';
    const fontFamilies = resolveFontFamilyStyle(fontFamily || 'inter');

    const getSectionTitle = (sectionKey: string, fallback: string) => {
      return settings.sectionTitles?.[sectionKey] || fallback;
    };

    const renderRightSectionTitle = (
      title: string,
      isFirstOnPage = false
    ) => {
      const paddingTop = isFirstOnPage ? '0pt' : `${numSectionSpacing}pt`;
      return (
        <div
          data-resume-section-header="true"
          className="section-header w-full pb-1 mb-2 border-b"
          style={{ paddingTop, borderColor: `${accentColor}30` }}
        >
          <h2
            className={`${fontSizeClasses.sectionTitle} font-bold tracking-wider uppercase`}
            style={{
              color: accentColor,
              margin: 0,
              padding: 0,
              letterSpacing: '0.06em',
            }}
          >
            {title}
          </h2>
        </div>
      );
    };

    const renderSidebarSectionTitle = (title: string) => (
      <div className="w-full pb-1 mb-2 border-b border-slate-200">
        <h3
          className="text-[0.92em] font-bold tracking-wider uppercase"
          style={{ color: accentColor, letterSpacing: '0.06em' }}
        >
          {title}
        </h3>
      </div>
    );

    const renderRightSection = (
      slot: PageSectionSlot,
      isFirstOnPage = false
    ) => {
      const sectionKey = slot.sectionKey;
      if (hiddenSections.includes(sectionKey)) return null;

      switch (sectionKey) {
        case 'profile':
          if (!profile) return null;
          return (
            <div
              key="profile"
              data-resume-section="profile"
              className="resume-section w-full"
            >
              {renderRightSectionTitle(
                getSectionTitle('profile', 'Summary'),
                isFirstOnPage
              )}
              <p
                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-800 text-justify`}
              >
                <FormattedText text={profile} />
              </p>
            </div>
          );

        case 'experiences': {
          const visibleExperiences = (experiences || []).filter(
            (e) => !e.hidden
          );
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices
                .map((i) => visibleExperiences[i])
                .filter(Boolean)
            : visibleExperiences;
          if (itemsToRender.length === 0) return null;
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle('experiences', 'Experience')} (Cont.)`
            : getSectionTitle('experiences', 'Experience');

          return (
            <div
              key={`experiences-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="experiences"
              className="resume-section w-full"
            >
              {renderRightSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8pt]">
                {itemsToRender.map((exp) => (
                  <div
                    key={exp.id}
                    data-resume-item="true"
                    className="experience-item w-full"
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses} font-semibold`}
                      >
                        <span className="font-bold text-slate-900">
                          {exp.role}
                        </span>
                        {exp.company && (
                          <span
                            className="font-semibold ml-1"
                            style={{ color: accentColor }}
                          >
                            · {exp.company}
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 whitespace-nowrap`}
                      >
                        {exp.startDate}
                        {exp.endDate
                          ? ` – ${exp.endDate}`
                          : exp.isCurrent
                          ? ' – Present'
                          : ''}
                      </div>
                    </div>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {exp.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet
                              ? h.replace(/^[\s]*[•\-\*]\s+/, '')
                              : h;

                            return (
                              <div
                                key={i}
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-700 text-justify pl-[10pt] -indent-[10pt]`}
                              >
                                <BulletMarker
                                  style={bulletStyle}
                                  accentColor={accentColor}
                                  isInline={true}
                                />
                                <FormattedText text={cleanText} />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        case 'projects': {
          const visibleProjects = (projects || []).filter((p) => !p.hidden);
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => visibleProjects[i]).filter(Boolean)
            : visibleProjects;
          if (itemsToRender.length === 0) return null;
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle('projects', 'Projects')} (Cont.)`
            : getSectionTitle('projects', 'Projects');

          return (
            <div
              key={`projects-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="projects"
              className="resume-section w-full"
            >
              {renderRightSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8pt]">
                {itemsToRender.map((proj) => (
                  <div
                    key={proj.id}
                    data-resume-item="true"
                    className="project-item w-full"
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                      >
                        {proj.link ? (
                          <a
                            href={
                              proj.link.startsWith('http')
                                ? proj.link
                                : `https://${proj.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{proj.title}</span>
                            <ExternalLinkIcon size={9} />
                          </a>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {proj.title}
                          </span>
                        )}

                        {proj.subtitle && (
                          <span className="text-slate-500 ml-1">
                            — {proj.subtitle}
                          </span>
                        )}
                      </div>

                      {(proj.startDate || proj.endDate) && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 whitespace-nowrap`}
                        >
                          {proj.startDate}
                          {proj.endDate ? ` – ${proj.endDate}` : ''}
                        </div>
                      )}
                    </div>

                    {proj.technologies && (
                      <div
                        className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-slate-500 mb-0.5`}
                      >
                        <FormattedText text={proj.technologies} />
                      </div>
                    )}

                    {proj.highlights && proj.highlights.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {proj.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet
                              ? h.replace(/^[\s]*[•\-\*]\s+/, '')
                              : h;

                            return (
                              <div
                                key={i}
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-700 text-justify pl-[10pt] -indent-[10pt]`}
                              >
                                <BulletMarker
                                  style={bulletStyle}
                                  accentColor={accentColor}
                                  isInline={true}
                                />
                                <FormattedText text={cleanText} />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        default: {
          const customSec = (customSections || []).find(
            (c) => c.id === sectionKey
          );
          if (!customSec || !customSec.items) return null;

          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => customSec.items[i]).filter(Boolean)
            : customSec.items;
          if (itemsToRender.length === 0) return null;

          return (
            <div
              key={`custom-${customSec.id}-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section={customSec.id}
              className="resume-section w-full"
            >
              {renderRightSectionTitle(
                getSectionTitle(customSec.id, customSec.title),
                isFirstOnPage
              )}
              <div className="flex flex-col gap-[7pt]">
                {itemsToRender.map((item) => (
                  <div
                    key={item.id}
                    data-resume-item="true"
                    className="custom-item w-full"
                  >
                    <div className="flex justify-between items-baseline">
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses} font-semibold`}
                      >
                        <span className="font-bold text-slate-900">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-slate-600 ml-1">
                            — {item.subtitle}
                          </span>
                        )}
                      </div>
                      {(item.date || item.location) && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 whitespace-nowrap`}
                        >
                          {item.date} {item.location ? `(${item.location})` : ''}
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <div
                        className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-700 mt-0.5`}
                      >
                        <FormattedText text={item.description} />
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

    const contactItems = getPersonalContactItems(personal);
    const visibleSkills = (skills || []).filter((s) => !s.hidden);
    const visibleEdu = educations || [];
    const visibleRefs = (references || []).filter((r) => !r.hidden);

    return (
      <div
        className="preview-container flex flex-col items-center select-text"
        style={{
          transform: isPrinting ? 'none' : `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          ref={ref}
          id="resume-print-node"
          className="print-area flex flex-col items-center gap-8"
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              data-page-number={pageIndex + 1}
              className="resume-page bg-white text-slate-900 shadow-2xl relative"
              style={{
                width: '210mm',
                height: '297mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: fontFamilies,
                paddingLeft: `${marginH}pt`,
                paddingRight: `${marginH}pt`,
                paddingTop: `${marginV}pt`,
                paddingBottom: `${marginV}pt`,
                fontSize: `${numFontSize}pt`,
                lineHeight: numLineSpacing,
              }}
            >
              {/* Header on Page 0 */}
              {page.isFirstPage && (
                <header
                  data-resume-header="true"
                  className="resume-header mb-[10pt] pb-2 border-b-2"
                  style={{ borderColor: accentColor }}
                >
                  <h1
                    className={`${fontSizeClasses.name} font-extrabold tracking-tight`}
                    style={{
                      color: accentColor,
                      lineHeight: 1.1,
                      margin: 0,
                      fontFamily: fontFamilies,
                    }}
                  >
                    {personal.fullName || 'Your Full Name'}
                  </h1>
                </header>
              )}

              {/* 2-Column Body */}
              <div className="grid grid-cols-12 gap-6 w-full">
                {/* Left Sidebar (Col 1-4: 33%) */}
                <aside className="col-span-4 flex flex-col gap-4 border-r border-slate-200 pr-4">
                  {/* Contact Info */}
                  {contactItems.length > 0 && (
                    <div>
                      {renderSidebarSectionTitle('Contact')}
                      <div className="flex flex-col gap-1.5">
                        {contactItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-1.5 ${fontSizeClasses.subtext} text-slate-700`}
                          >
                            <span
                              className="mt-0.5 flex-shrink-0"
                              style={{ color: accentColor }}
                            >
                              <ProfileIcon icon={item.icon} size={11} />
                            </span>
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
                                className="hover:underline hover:text-slate-900 break-all leading-tight"
                              >
                                {item.text}
                              </a>
                            ) : (
                              <span className="break-all leading-tight">
                                {item.text}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills in Sidebar */}
                  {!hiddenSections.includes('skills') &&
                    visibleSkills.length > 0 && (
                      <div>
                        {renderSidebarSectionTitle(
                          getSectionTitle('skills', 'Skills')
                        )}
                        <div className="flex flex-col gap-2">
                          {visibleSkills.map((s) => (
                            <div key={s.id}>
                              <div
                                className="text-[0.85em] font-bold text-slate-900 mb-0.5"
                                style={{ color: accentColor }}
                              >
                                {s.category}
                              </div>
                              <div className={`${fontSizeClasses.subtext} text-slate-700 leading-snug`}>
                                <FormattedText text={s.items} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Education in Sidebar */}
                  {!hiddenSections.includes('educations') &&
                    visibleEdu.length > 0 && (
                      <div>
                        {renderSidebarSectionTitle(
                          getSectionTitle('educations', 'Education')
                        )}
                        <div className="flex flex-col gap-2">
                          {visibleEdu.map((edu) => (
                            <div key={edu.id}>
                              <div className="font-bold text-[0.88em] text-slate-900">
                                {edu.institution}
                              </div>
                              {edu.degree && (
                                <div className={`${fontSizeClasses.subtext} text-slate-700 font-medium`}>
                                  {edu.degree}
                                </div>
                              )}
                              <div className="text-[0.80em] text-slate-400">
                                {edu.startDate}
                                {edu.endDate ? ` – ${edu.endDate}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* References in Sidebar */}
                  {!hiddenSections.includes('references') &&
                    visibleRefs.length > 0 && (
                      <div>
                        {renderSidebarSectionTitle(
                          getSectionTitle('references', 'References')
                        )}
                        <div className="flex flex-col gap-2">
                          {visibleRefs.map((r) => (
                            <div key={r.id}>
                              <div className="font-bold text-[0.85em] text-slate-900">
                                {r.name}
                              </div>
                              <div className="text-[0.80em] text-slate-500">
                                {r.role} {r.organization ? `· ${r.organization}` : ''}
                              </div>
                              {r.contact && (
                                <div className="text-[0.80em] text-slate-600 font-mono">
                                  {r.contact}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </aside>

                {/* Right Column (Col 5-12: 67%) */}
                <main className="col-span-8 flex flex-col">
                  {page.slots.map((slot, slotIdx) =>
                    renderRightSection(
                      slot,
                      page.isFirstPage ? false : slotIdx === 0
                    )
                  )}
                </main>
              </div>

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

SidebarTemplate.displayName = 'SidebarTemplate';
