'use client';

import React, { forwardRef } from 'react';
import { FormattedText } from '@/components/preview/FormattedText';
import { BulletMarker } from '@/components/preview/BulletMarker';
import { ExternalLinkIcon, ProfileIcon } from '@/components/preview/Icons';
import { TemplateProps, PageSectionSlot } from '../types';
import {
  getPersonalContactItems,
  resolveFontFamilyStyle,
} from '../utils/templateUtils';
import { useTemplatePagination } from '../utils/useTemplatePagination';

export const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(
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
      fontFamily = 'plus-jakarta-sans',
      bulletStyle = 'disc',
      accentColor = '#0f766e', // Teal accent default
      hiddenSections = [],
    } = settings;

    const {
      pages,
      numFontSize,
      numLineSpacing,
      numSectionSpacing,
      marginH,
      marginV,
    } = useTemplatePagination(data);

    const fontSizeClasses = {
      name: 'text-[1.85em]',
      sectionTitle: 'text-[1.05em]',
      itemTitle: 'text-[1em]',
      body: 'text-[1em]',
      subtext: 'text-[0.92em]',
    };

    const lineSpacingClasses = 'leading-[inherit]';
    const fontFamilies = resolveFontFamilyStyle(fontFamily || 'plus-jakarta-sans');

    const getSectionTitle = (sectionKey: string, fallback: string) => {
      return settings.sectionTitles?.[sectionKey] || fallback;
    };

    // Modern Left-Bar Section Header with Accent Capsule
    const renderSectionTitle = (title: string, isFirstOnPage = false) => {
      const paddingTop = isFirstOnPage ? '0pt' : `${numSectionSpacing}pt`;
      return (
        <div
          data-resume-section-header="true"
          className="section-header w-full flex items-center gap-2.5 pb-1 mb-2"
          style={{ paddingTop }}
        >
          <div
            className="w-1.5 h-4.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <h2
            className={`${fontSizeClasses.sectionTitle} font-bold tracking-wide uppercase`}
            style={{
              color: accentColor,
              margin: 0,
              padding: 0,
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </h2>
          <div
            className="flex-1 h-[1px] opacity-25"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      );
    };

    const renderSection = (slot: PageSectionSlot, isFirstOnPage = false) => {
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
              {renderSectionTitle(
                getSectionTitle('profile', 'Professional Summary'),
                isFirstOnPage
              )}
              <p
                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-800 text-justify`}
              >
                <FormattedText text={profile} />
              </p>
            </div>
          );

        case 'skills': {
          const visibleSkills = (skills || []).filter((s) => !s.hidden);
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => visibleSkills[i]).filter(Boolean)
            : visibleSkills;
          if (itemsToRender.length === 0) return null;
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle('skills', 'Technical Skills')} (Continued)`
            : getSectionTitle('skills', 'Technical Skills');

          return (
            <div
              key={`skills-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="skills"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-1.5">
                {itemsToRender.map((s) => (
                  <div
                    key={s.id}
                    data-resume-item="true"
                    className={`${fontSizeClasses.body} ${lineSpacingClasses} flex items-baseline gap-2 text-slate-800`}
                  >
                    <span
                      className="font-semibold px-2 py-0.5 rounded text-[0.88em] flex-shrink-0"
                      style={{
                        backgroundColor: `${accentColor}14`,
                        color: accentColor,
                      }}
                    >
                      {s.category}
                    </span>
                    <div className="flex-1">
                      <FormattedText text={s.items} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

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
            ? `${getSectionTitle('experiences', 'Experience')} (Continued)`
            : getSectionTitle('experiences', 'Experience');

          return (
            <div
              key={`experiences-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="experiences"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[9pt]">
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
                        <span className="text-slate-900 font-bold">
                          {exp.role}
                        </span>
                        {exp.company && (
                          <>
                            <span className="text-slate-400 mx-1.5 font-normal">
                              ·
                            </span>
                            {exp.companyUrl ? (
                              <a
                                href={
                                  exp.companyUrl.startsWith('http')
                                    ? exp.companyUrl
                                    : `https://${exp.companyUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold hover:underline inline-flex items-center gap-1"
                                style={{ color: accentColor }}
                              >
                                <span>{exp.company}</span>
                                <ExternalLinkIcon size={10} />
                              </a>
                            ) : (
                              <span
                                className="font-semibold"
                                style={{ color: accentColor }}
                              >
                                {exp.company}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div
                        className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 font-medium whitespace-nowrap`}
                      >
                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <span>
                            {exp.startDate}
                            {exp.endDate
                              ? ` – ${exp.endDate}`
                              : exp.isCurrent
                              ? ' – Present'
                              : ''}
                          </span>
                        )}
                        {exp.location && (
                          <span className="text-slate-400 ml-1.5 font-normal">
                            ({exp.location})
                          </span>
                        )}
                      </div>
                    </div>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="mt-1 space-y-1">
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
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-800 text-justify pl-[11pt] -indent-[11pt]`}
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
            ? `${getSectionTitle('projects', 'Projects')} (Continued)`
            : getSectionTitle('projects', 'Projects');

          return (
            <div
              key={`projects-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="projects"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[9pt]">
                {itemsToRender.map((proj) => (
                  <div
                    key={proj.id}
                    data-resume-item="true"
                    className="project-item w-full"
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses} font-semibold`}
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
                            <ExternalLinkIcon size={10} />
                          </a>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {proj.title}
                          </span>
                        )}

                        {proj.subtitle && (
                          <span className="text-slate-500 font-normal ml-1.5 text-[0.95em]">
                            — {proj.subtitle}
                          </span>
                        )}
                      </div>

                      {(proj.startDate || proj.endDate) && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 font-medium whitespace-nowrap`}
                        >
                          {proj.startDate}
                          {proj.endDate ? ` – ${proj.endDate}` : ''}
                        </div>
                      )}
                    </div>

                    {proj.technologies && (
                      <div
                        className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-slate-600 mb-1 flex items-center gap-1.5`}
                      >
                        <span className="font-medium text-slate-400">Tech:</span>
                        <FormattedText text={proj.technologies} />
                      </div>
                    )}

                    {proj.highlights && proj.highlights.length > 0 && (
                      <div className="mt-1 space-y-1">
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
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-800 text-justify pl-[11pt] -indent-[11pt]`}
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

        case 'educations': {
          const visibleEdu = educations || [];
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => visibleEdu[i]).filter(Boolean)
            : visibleEdu;
          if (itemsToRender.length === 0) return null;
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle('educations', 'Education')} (Continued)`
            : getSectionTitle('educations', 'Education');

          return (
            <div
              key={`educations-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="educations"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8pt]">
                {itemsToRender.map((edu) => (
                  <div
                    key={edu.id}
                    data-resume-item="true"
                    className="education-item w-full"
                  >
                    <div className="flex justify-between items-baseline">
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                      >
                        <span className="font-bold text-slate-900">
                          {edu.institution}
                        </span>
                        {edu.degree && (
                          <span className="text-slate-600 ml-1.5">
                            — {edu.degree}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 font-medium whitespace-nowrap`}
                      >
                        {edu.startDate}
                        {edu.endDate ? ` – ${edu.endDate}` : ''}
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      {edu.details && (
                        <div
                          className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-600`}
                        >
                          {edu.details}
                        </div>
                      )}
                      {edu.location && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-400`}
                        >
                          {edu.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        case 'references': {
          const refStyle = settings.referenceStyle || 'grid';
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle('references', 'References')} (Continued)`
            : getSectionTitle('references', 'References');

          if (refStyle === 'upon-request') {
            return (
              <div
                key="references"
                data-resume-section="references"
                className="resume-section w-full"
              >
                {renderSectionTitle(sectionTitle, isFirstOnPage)}
                <p
                  data-resume-item="true"
                  className={`${fontSizeClasses.body} ${lineSpacingClasses} text-slate-600 italic`}
                >
                  {settings.referenceCustomText || 'Available upon request.'}
                </p>
              </div>
            );
          }

          const visibleRefs = (references || []).filter((r) => !r.hidden);
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => visibleRefs[i]).filter(Boolean)
            : visibleRefs;
          if (itemsToRender.length === 0) return null;

          return (
            <div
              key={`references-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="references"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="grid grid-cols-2 gap-4">
                {itemsToRender.map((refItem) => (
                  <div
                    key={refItem.id}
                    data-resume-item="true"
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
                  >
                    <div
                      className={`${fontSizeClasses.itemTitle} font-bold text-slate-900`}
                    >
                      {refItem.name}
                    </div>
                    <div
                      className={`${fontSizeClasses.subtext} text-slate-600`}
                    >
                      {refItem.role} {refItem.organization ? `· ${refItem.organization}` : ''}
                    </div>
                    {refItem.contact && (
                      <div
                        className={`${fontSizeClasses.subtext} font-medium mt-1`}
                        style={{ color: accentColor }}
                      >
                        {refItem.contact}
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
              {renderSectionTitle(
                getSectionTitle(customSec.id, customSec.title),
                isFirstOnPage
              )}
              <div className="flex flex-col gap-[8pt]">
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
                          <span className="text-slate-600 ml-1.5">
                            — {item.subtitle}
                          </span>
                        )}
                      </div>
                      {(item.date || item.location) && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} text-slate-500 font-medium whitespace-nowrap`}
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
              {/* Modern Header */}
              {page.isFirstPage && (() => {
                const contactItems = getPersonalContactItems(personal);
                return (
                  <header
                    data-resume-header="true"
                    className="resume-header mb-[10pt] pb-3 border-b-2 border-slate-100"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
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
                      </div>
                    </div>

                    {contactItems.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        {contactItems.map((item) => (
                          <div
                            key={item.id}
                            className={`inline-flex items-center gap-1.5 ${fontSizeClasses.subtext} text-slate-600 font-medium`}
                          >
                            <span style={{ color: accentColor }}>
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
                                className="hover:underline hover:text-slate-900 truncate"
                              >
                                {item.text}
                              </a>
                            ) : (
                              <span className="truncate">{item.text}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </header>
                );
              })()}

              <div className="resume-body">
                {page.slots.map((slot, slotIdx) =>
                  renderSection(slot, page.isFirstPage ? false : slotIdx === 0)
                )}
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

ModernTemplate.displayName = 'ModernTemplate';
