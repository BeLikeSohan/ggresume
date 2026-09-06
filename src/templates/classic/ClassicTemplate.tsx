'use client';

import React, { forwardRef } from 'react';
import { FormattedText } from '@/components/preview/FormattedText';
import { SectionHeader } from '@/components/preview/SectionHeader';
import { BulletMarker } from '@/components/preview/BulletMarker';
import { ExternalLinkIcon, ProfileIcon } from '@/components/preview/Icons';
import { resolveDividerThickness } from '@/lib/layoutMetrics';
import { TemplateProps, PageSectionSlot, ContactDisplayItem } from '../types';
import {
  getPersonalContactItems,
  resolveFontFamilyStyle,
} from '../utils/templateUtils';
import { useTemplatePagination } from '../utils/useTemplatePagination';

export const ClassicTemplate = forwardRef<HTMLDivElement, TemplateProps>(
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
      fontFamily = 'source-sans',
      bulletStyle = 'square',
      dividerThickness = 1.5,
      accentColor = '#000000',
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

    const numDividerThickness = resolveDividerThickness(dividerThickness);

    const fontSizeClasses = {
      root: 'text-[1em]',
      name: 'text-[1.8em]',
      sectionTitle: 'text-[1.1em]',
      itemTitle: 'text-[1em]',
      body: 'text-[1em]',
      subtext: 'text-[0.95em]',
    };

    const lineSpacingClasses = 'leading-[inherit]';
    const fontFamilies = resolveFontFamilyStyle(fontFamily);

    const renderSectionTitle = (title: string, isFirstOnPage = false) => (
      <SectionHeader
        title={title}
        accentColor={accentColor}
        dividerThickness={numDividerThickness}
        isFirstOnPage={isFirstOnPage}
        fontSizePt={numFontSize * 1.1}
        sectionSpacing={numSectionSpacing}
      />
    );

    const getSectionTitle = (sectionKey: string, fallback: string) => {
      return settings.sectionTitles?.[sectionKey] || fallback;
    };

    const renderBullet = () => (
      <BulletMarker style={bulletStyle} accentColor={accentColor} />
    );

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
                getSectionTitle('profile', 'Profile'),
                isFirstOnPage
              )}
              <p
                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}
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
            ? `${getSectionTitle('skills', 'Skills')} (Continued)`
            : getSectionTitle('skills', 'Skills');

          return (
            <div
              key={`skills-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="skills"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-0">
                {itemsToRender.map((s) => (
                  <div
                    key={s.id}
                    data-resume-item="true"
                    className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black`}
                  >
                    <span className="font-bold text-black">{s.category}</span>
                    <span className="mx-1 text-black font-normal">—</span>
                    <FormattedText text={s.items} />
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
            ? `${getSectionTitle('experiences', 'Professional Experience')} (Continued)`
            : getSectionTitle('experiences', 'Professional Experience');

          return (
            <div
              key={`experiences-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section="experiences"
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {itemsToRender.map((exp) => (
                  <div
                    key={exp.id}
                    data-resume-item="true"
                    className="experience-item w-full"
                  >
                    {(exp.startDate ||
                      exp.endDate ||
                      exp.isCurrent ||
                      exp.location) && (
                      <div
                        className={`float-right text-right ml-4 mb-0.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black select-none`}
                      >
                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <div className="whitespace-nowrap">
                            {exp.startDate}
                            {exp.endDate
                              ? ` – ${exp.endDate}`
                              : exp.isCurrent
                              ? ' – Present'
                              : ''}
                          </div>
                        )}
                        {exp.location && (
                          <div className="whitespace-nowrap">
                            {exp.location}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                    >
                      <span className="font-bold text-black">{exp.role}</span>
                      {exp.company && (
                        <>
                          <span className="text-black">, </span>
                          {exp.companyUrl ? (
                            <a
                              href={
                                exp.companyUrl.startsWith('http')
                                  ? exp.companyUrl
                                  : `https://${exp.companyUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="italic text-black font-normal hover:underline inline-flex items-center gap-1"
                            >
                              <span>{exp.company}</span>
                              <ExternalLinkIcon size={10} />
                            </a>
                          ) : (
                            <span className="italic text-black font-normal">
                              {exp.company}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="mt-[1pt] space-y-[1pt]">
                        {exp.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet
                              ? h.replace(/^[\s]*[•\-\*]\s+/, '')
                              : h;

                            if (isBullet) {
                              return (
                                <div
                                  key={i}
                                  className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify pl-[10pt] -indent-[10pt]`}
                                >
                                  <BulletMarker
                                    style={bulletStyle}
                                    accentColor={accentColor}
                                    isInline={true}
                                  />
                                  <FormattedText text={cleanText} />
                                </div>
                              );
                            }

                            return (
                              <div
                                key={i}
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}
                              >
                                <FormattedText text={cleanText} />
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="clear-both" />
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
              <div className="flex flex-col gap-[8.4pt]">
                {itemsToRender.map((proj) => (
                  <div
                    key={proj.id}
                    data-resume-item="true"
                    className="project-item w-full"
                  >
                    {(proj.startDate || proj.endDate) && (
                      <div
                        className={`float-right text-right ml-4 mb-0.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black select-none whitespace-nowrap`}
                      >
                        {proj.startDate}
                        {proj.endDate ? ` – ${proj.endDate}` : ''}
                      </div>
                    )}

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
                          className="font-bold text-black hover:underline inline-flex items-center gap-1"
                        >
                          <span>{proj.title}</span>
                          <ExternalLinkIcon size={10} />
                        </a>
                      ) : (
                        <span className="font-bold text-black">
                          {proj.title}
                        </span>
                      )}

                      {proj.subtitle && (
                        <>
                          <span className="text-black"> | </span>
                          <span className="italic text-black font-normal">
                            {proj.subtitle}
                          </span>
                        </>
                      )}
                    </div>

                    {proj.technologies && (
                      <div
                        className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                      >
                        <FormattedText text={proj.technologies} />
                      </div>
                    )}

                    {proj.highlights && proj.highlights.length > 0 && (
                      <div className="mt-[1pt] space-y-[1pt]">
                        {proj.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet
                              ? h.replace(/^[\s]*[•\-\*]\s+/, '')
                              : h;

                            if (isBullet) {
                              return (
                                <div
                                  key={i}
                                  className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify pl-[10pt] -indent-[10pt]`}
                                >
                                  <BulletMarker
                                    style={bulletStyle}
                                    accentColor={accentColor}
                                    isInline={true}
                                  />
                                  <FormattedText text={cleanText} />
                                </div>
                              );
                            }

                            return (
                              <div
                                key={i}
                                className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}
                              >
                                <FormattedText text={cleanText} />
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="clear-both" />
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
              <div className="flex flex-col gap-[8.4pt]">
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
                        <span className="font-bold text-black">
                          {edu.institution}
                        </span>
                        {edu.degree && (
                          <>
                            <span className="text-black">, </span>
                            <span className="italic text-black font-normal">
                              {edu.degree}
                            </span>
                          </>
                        )}
                      </div>
                      <div
                        className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black whitespace-nowrap select-none`}
                      >
                        <span>
                          {edu.startDate}
                          {edu.endDate ? ` – ${edu.endDate}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <div
                        className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black`}
                      >
                        {edu.details && <span>{edu.details}</span>}
                      </div>
                      {edu.location && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
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
                  className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black italic`}
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

              {refStyle === 'stacked' ? (
                <div className="flex flex-col gap-2">
                  {itemsToRender.map((refItem) => (
                    <div
                      key={refItem.id}
                      data-resume-item="true"
                      className="reference-item w-full flex justify-between items-baseline"
                    >
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                      >
                        <span className="font-bold text-black">
                          {refItem.name}
                        </span>
                        {refItem.role && (
                          <>
                            <span className="text-black">, </span>
                            <span className="italic text-black font-normal">
                              {refItem.role}
                            </span>
                          </>
                        )}
                        {refItem.organization && (
                          <>
                            <span className="text-black"> — </span>
                            <span className="text-black font-normal">
                              {refItem.organization}
                            </span>
                          </>
                        )}
                      </div>
                      {refItem.contact && (
                        <div
                          className={`text-right flex-shrink-0 ml-4 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                        >
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
              ) : refStyle === 'compact' ? (
                <div className="flex flex-col gap-0.5">
                  {itemsToRender.map((refItem) => (
                    <div
                      key={refItem.id}
                      data-resume-item="true"
                      className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black flex items-start`}
                    >
                      {renderBullet()}
                      <div className="flex-1">
                        <span className="font-bold text-black">
                          {refItem.name}
                        </span>
                        {refItem.role && (
                          <span className="italic font-normal">
                            , {refItem.role}
                          </span>
                        )}
                        {refItem.organization && (
                          <span className="font-normal">
                            {' '}
                            ({refItem.organization})
                          </span>
                        )}
                        {refItem.contact && (
                          <span className="text-black font-normal">
                            {' '}
                            ·{' '}
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
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {itemsToRender.map((refItem) => (
                    <div
                      key={refItem.id}
                      data-resume-item="true"
                      className="reference-item flex flex-col"
                    >
                      <div
                        className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                      >
                        <span className="font-bold text-black">
                          {refItem.name}
                        </span>
                        {refItem.role && (
                          <>
                            <span className="text-black">, </span>
                            <span className="italic text-black font-normal">
                              {refItem.role}
                            </span>
                          </>
                        )}
                      </div>
                      <div
                        className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                      >
                        {refItem.organization && (
                          <span>{refItem.organization}</span>
                        )}
                        {refItem.organization && refItem.contact && (
                          <span> · </span>
                        )}
                        {refItem.contact &&
                          (refItem.contact.includes('@') ? (
                            <a
                              href={`mailto:${refItem.contact}`}
                              className="text-black hover:underline"
                            >
                              {refItem.contact}
                            </a>
                          ) : (
                            <span>{refItem.contact}</span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          const sectionTitle = slot.isContinuation
            ? `${getSectionTitle(customSec.id, customSec.title)} (Continued)`
            : getSectionTitle(customSec.id, customSec.title);

          return (
            <div
              key={`custom-${customSec.id}-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section={customSec.id}
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {itemsToRender.map((item) => {
                  const hasHeaderRow =
                    Boolean(item.title && item.title.trim()) ||
                    Boolean(item.subtitle && item.subtitle.trim()) ||
                    Boolean(item.date && item.date.trim()) ||
                    Boolean(item.location && item.location.trim());

                  return (
                    <div
                      key={item.id}
                      data-resume-item="true"
                      className="custom-item w-full"
                    >
                      {hasHeaderRow && (
                        <>
                          {(item.date || item.location) && (
                            <div
                              className={`float-right text-right ml-4 mb-0.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black select-none`}
                            >
                              {item.date && (
                                <div className="whitespace-nowrap">
                                  {item.date}
                                </div>
                              )}
                              {item.location && (
                                <div className="whitespace-nowrap">
                                  {item.location}
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`${fontSizeClasses.itemTitle} ${lineSpacingClasses}`}
                          >
                            {item.title && (
                              <span className="font-bold text-black">
                                {item.title}
                              </span>
                            )}
                            {item.subtitle && (
                              <>
                                {item.title && (
                                  <span className="text-black">, </span>
                                )}
                                <span className="italic text-black font-normal">
                                  {item.subtitle}
                                </span>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {item.description && item.description.trim() && (
                        <div
                          className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify mt-[1pt]`}
                        >
                          <FormattedText text={item.description} />
                        </div>
                      )}

                      {item.highlights && item.highlights.length > 0 && (
                        <div className="mt-[1pt] space-y-[1pt]">
                          {item.highlights
                            .filter((h) => h.trim().length > 0)
                            .map((h, i) => {
                              const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                              const cleanText = isBullet
                                ? h.replace(/^[\s]*[•\-\*]\s+/, '')
                                : h;

                              if (isBullet) {
                                return (
                                  <div
                                    key={i}
                                    className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify pl-[10pt] -indent-[10pt]`}
                                  >
                                    <BulletMarker
                                      style={bulletStyle}
                                      accentColor={accentColor}
                                      isInline={true}
                                    />
                                    <FormattedText text={cleanText} />
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={i}
                                  className={`${fontSizeClasses.body} ${lineSpacingClasses} text-black text-justify`}
                                >
                                  <FormattedText text={cleanText} />
                                </div>
                              );
                            })}
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
                paddingLeft: `${marginH}pt`,
                paddingRight: `${marginH}pt`,
                paddingTop: `${marginV}pt`,
                paddingBottom: `${marginV}pt`,
                fontSize: `${numFontSize}pt`,
                lineHeight: numLineSpacing,
              }}
            >
              {/* Header only on page 0 */}
              {page.isFirstPage && (() => {
                const headerStyle = settings.headerStyle || 'grid';
                const contactItems = getPersonalContactItems(personal);
                const mid = Math.ceil(contactItems.length / 2);
                const leftColumnItems = contactItems.slice(0, mid);
                const rightColumnItems = contactItems.slice(mid);

                const renderItem = (item: ContactDisplayItem) => (
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
                );

                if (headerStyle === 'centered') {
                  return (
                    <header
                      data-resume-header="true"
                      className="resume-header mb-[7pt] text-center"
                    >
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
                      {contactItems.length > 0 && (
                        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-[5pt]">
                          {contactItems.map((item) => (
                            <div
                              key={item.id}
                              className={`inline-flex items-center gap-1.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              <ProfileIcon icon={item.icon} size={11} />
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={
                                    item.type === 'email' ||
                                    item.type === 'phone'
                                      ? undefined
                                      : '_blank'
                                  }
                                  rel={
                                    item.type === 'email' ||
                                    item.type === 'phone'
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
                      )}
                    </header>
                  );
                }

                if (headerStyle === 'left-inline') {
                  return (
                    <header
                      data-resume-header="true"
                      className="resume-header mb-[7pt] text-left"
                    >
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
                      {contactItems.length > 0 && (
                        <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1 mt-[5pt]">
                          {contactItems.map((item) => (
                            <div
                              key={item.id}
                              className={`inline-flex items-center gap-1.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              <ProfileIcon icon={item.icon} size={11} />
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={
                                    item.type === 'email' ||
                                    item.type === 'phone'
                                      ? undefined
                                      : '_blank'
                                  }
                                  rel={
                                    item.type === 'email' ||
                                    item.type === 'phone'
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
                      )}
                    </header>
                  );
                }

                if (headerStyle === 'split') {
                  return (
                    <header
                      data-resume-header="true"
                      className="resume-header mb-[7pt] flex justify-between items-start gap-6 pb-0.5"
                    >
                      <div className="flex-1 min-w-0">
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
                      </div>
                      {contactItems.length > 0 && (
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          {contactItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-end gap-1.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              {item.href ? (
                                <a
                                  href={item.href}
                                  target={
                                    item.type === 'email' ||
                                    item.type === 'phone'
                                      ? undefined
                                      : '_blank'
                                  }
                                  rel={
                                    item.type === 'email' ||
                                    item.type === 'phone'
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
                              <div className="w-[14pt] flex items-center justify-end flex-shrink-0">
                                <ProfileIcon icon={item.icon} size={11} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </header>
                  );
                }

                if (headerStyle === 'banner') {
                  return (
                    <header
                      data-resume-header="true"
                      className="resume-header mb-[7pt] pl-3.5 border-l-[3.5pt]"
                      style={{ borderColor: accentColor }}
                    >
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
                      {contactItems.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-8 mt-[5pt]">
                          <div className="flex flex-col justify-start">
                            {leftColumnItems.map(renderItem)}
                          </div>
                          <div className="flex flex-col justify-start pl-[2pt]">
                            {rightColumnItems.map(renderItem)}
                          </div>
                        </div>
                      )}
                    </header>
                  );
                }

                // Default 'grid' (Classic FlowCV 2-Column)
                return (
                  <header
                    data-resume-header="true"
                    className="resume-header mb-[7pt]"
                  >
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
                    {contactItems.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-8 mt-[5pt]">
                        <div className="flex flex-col justify-start">
                          {leftColumnItems.map(renderItem)}
                        </div>
                        <div className="flex flex-col justify-start pl-[2pt]">
                          {rightColumnItems.map(renderItem)}
                        </div>
                      </div>
                    )}
                  </header>
                );
              })()}

              {/* Sections for this Page */}
              <div className="resume-body">
                {page.slots.map((slot, slotIdx) =>
                  renderSection(slot, page.isFirstPage ? false : slotIdx === 0)
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

ClassicTemplate.displayName = 'ClassicTemplate';
