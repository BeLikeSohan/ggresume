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
import {
  resolveFontSize,
  resolveLineSpacing,
  resolveSectionSpacing,
  resolvePageMargin,
  resolveDividerThickness,
} from '@/lib/layoutMetrics';

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
  fontSize: number | string = 10
): number {
  const numFontSize = resolveFontSize(fontSize);
  const PT_TO_PX = 96 / 72;
  const nameHeight = Math.round(17.5 * PT_TO_PX * 1.25); // ~29px
  const mt = 6;
  const items = getPersonalContactItems(data.personal);
  if (items.length === 0) return nameHeight + mt;

  const headerStyle = data.settings?.headerStyle || 'grid';
  const contactLineHeight = Math.round(numFontSize * 0.95 * PT_TO_PX * 1.35); // ~17px

  if (headerStyle === 'centered' || headerStyle === 'left-inline') {
    const lines = Math.max(Math.ceil(items.length / 3), 1);
    return nameHeight + mt + lines * contactLineHeight;
  }

  if (headerStyle === 'split') {
    const rows = items.length;
    return Math.max(nameHeight + 8, rows * contactLineHeight) + mt;
  }

  if (headerStyle === 'banner') {
    const rows = Math.max(Math.ceil(items.length / 2), 1);
    return nameHeight + mt + rows * contactLineHeight + 4;
  }

  // default 'grid'
  const rows = Math.max(Math.ceil(items.length / 2), 1);
  return nameHeight + mt + rows * contactLineHeight;
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

function getItemEstimates(
  key: string,
  data: ResumeData,
  fontSize: number | string = 10,
  lineSpacing: number | string = 1.35,
  sectionSpacing: number | string = 13.5
): { index: number; height: number }[] {
  const PT_TO_PX = 96 / 72;
  const numFontSize = resolveFontSize(fontSize);
  const numLineSpacing = resolveLineSpacing(lineSpacing);
  const fontMultiplier = numFontSize / 10.0;
  const lineMultiplier = numLineSpacing / 1.35;
  const scale = fontMultiplier * lineMultiplier;

  const BASE_LINE_HEIGHT = Math.round(numFontSize * PT_TO_PX * numLineSpacing);
  const ITEM_GAP = Math.round(8.4 * PT_TO_PX); // ~11px

  switch (key) {
    case 'skills': {
      const visibleSkills = (data.skills || []).filter((s) => !s.hidden);
      return visibleSkills.map((s, i) => {
        const textLen = s.category.length + s.items.length + 4;
        const itemLines = Math.max(1, Math.ceil(textLen / 95));
        return {
          index: i,
          height: itemLines * BASE_LINE_HEIGHT,
        };
      });
    }
    case 'experiences': {
      const visibleExp = (data.experiences || []).filter((e) => !e.hidden);
      return visibleExp.map((exp, i) => {
        const headerLines = 1;
        const highlightLines = (exp.highlights || [])
          .filter((h) => h.trim().length > 0)
          .reduce((hAcc, h) => {
            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
            const clean = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;
            return hAcc + Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT + 1.5;
          }, 0);
        return {
          index: i,
          height: headerLines * BASE_LINE_HEIGHT + 2 + highlightLines + (i < visibleExp.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
    case 'projects': {
      const visibleProj = (data.projects || []).filter((p) => !p.hidden);
      return visibleProj.map((proj, i) => {
        const headerLines = 1;
        const highlightLines = (proj.highlights || [])
          .filter((h) => h.trim().length > 0)
          .reduce((hAcc, h) => {
            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
            const clean = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;
            return hAcc + Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT + 1.5;
          }, 0);
        return {
          index: i,
          height: headerLines * BASE_LINE_HEIGHT + 2 + highlightLines + (i < visibleProj.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
    case 'educations': {
      return (data.educations || []).map((_, i, arr) => ({
        index: i,
        height: BASE_LINE_HEIGHT * 2 + 2 + (i < arr.length - 1 ? ITEM_GAP : 0),
      }));
    }
    case 'references': {
      const refStyle = data.settings?.referenceStyle || 'grid';
      if (refStyle === 'upon-request') {
        return [{ index: 0, height: BASE_LINE_HEIGHT + 2 }];
      }
      const visibleRefs = (data.references || []).filter((r) => !r.hidden);
      if (refStyle === 'compact') {
        return visibleRefs.map((_, i) => ({
          index: i,
          height: BASE_LINE_HEIGHT,
        }));
      }
      if (refStyle === 'stacked') {
        return visibleRefs.map((_, i) => ({
          index: i,
          height: BASE_LINE_HEIGHT * 2 + 4,
        }));
      }
      return visibleRefs.map((_, i) => ({
        index: i,
        height: BASE_LINE_HEIGHT * 2 + 2,
      }));
    }
    default: {
      const customSec = (data.customSections || []).find((c) => c.id === key);
      if (!customSec || !customSec.items) return [];
      return customSec.items.map((item, i, arr) => {
        const descLines = item.description
          ? Math.max(1, Math.ceil(item.description.length / 92)) * BASE_LINE_HEIGHT
          : 0;
        const highlightLines = (item.highlights || [])
          .filter((h) => h.trim().length > 0)
          .reduce((hAcc, h) => {
            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
            const clean = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;
            return hAcc + Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT + 1.5;
          }, 0);
        return {
          index: i,
          height: BASE_LINE_HEIGHT + 2 + descLines + highlightLines + (i < arr.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
  }
}

function calculatePages(
  visibleSections: string[],
  manualBreaks: string[],
  usableHeight: number,
  headerHeight: number,
  data: ResumeData,
  fontSize: number | string = 10,
  lineSpacing: number | string = 1.35,
  sectionSpacing: number | string = 13.5,
  measuredData?: Record<string, MeasuredSection>
): ResumePage[] {
  if (visibleSections.length === 0) {
    return [{ slots: [], isFirstPage: true }];
  }

  const PT_TO_PX = 96 / 72;
  const numSectionSpacing = resolveSectionSpacing(sectionSpacing);
  const numFontSize = resolveFontSize(fontSize);
  const numLineSpacing = resolveLineSpacing(lineSpacing);
  const fontMultiplier = numFontSize / 10.0;
  const lineMultiplier = numLineSpacing / 1.35;
  const scale = fontMultiplier * lineMultiplier;
  const BASE_LINE_HEIGHT = Math.round(13.33 * scale * numLineSpacing);

  const sectionSpacingPx = numSectionSpacing * PT_TO_PX;
  const TITLE_HEADER_HEIGHT = Math.round(sectionSpacingPx + numFontSize * 1.1 * PT_TO_PX * 1.25 + 11.33);
  const FIRST_TITLE_HEADER_HEIGHT = Math.round(numFontSize * 1.1 * PT_TO_PX * 1.25 + 11.33);
  const HEADER_MB_PX = 7 * PT_TO_PX; // 9.33px

  const manualBreakSet = new Set(manualBreaks);
  const pages: ResumePage[] = [];
  let currentSlots: PageSectionSlot[] = [];
  let isFirstPage = true;
  let currentHeight = headerHeight + HEADER_MB_PX;

  for (const secKey of visibleSections) {
    const isManualBreak = manualBreakSet.has(secKey);

    if (isManualBreak && (currentSlots.length > 0 || !isFirstPage)) {
      pages.push({ slots: currentSlots, isFirstPage });
      currentSlots = [];
      isFirstPage = false;
      currentHeight = 0;
    }

    const isFirstSecOnPage = currentSlots.length === 0;
    const defaultTitleHeight = isFirstSecOnPage ? FIRST_TITLE_HEADER_HEIGHT : TITLE_HEADER_HEIGHT;

    if (secKey === 'profile') {
      const measured = measuredData?.['profile'];
      let profileHeight: number;
      if (measured) {
        profileHeight = isFirstSecOnPage
          ? measured.totalHeight - sectionSpacingPx
          : measured.totalHeight;
      } else {
        const textLen = (data.profile || '').length;
        const lines = Math.max(1, Math.ceil(textLen / 95));
        profileHeight = defaultTitleHeight + lines * BASE_LINE_HEIGHT + 4;
      }

      if (currentSlots.length > 0 && currentHeight + profileHeight > usableHeight) {
        pages.push({ slots: currentSlots, isFirstPage });
        currentSlots = [{ sectionKey: secKey }];
        isFirstPage = false;
        currentHeight = FIRST_TITLE_HEADER_HEIGHT + (profileHeight - defaultTitleHeight);
      } else {
        currentSlots.push({ sectionKey: secKey });
        currentHeight += profileHeight;
      }
      continue;
    }

    // Multi-item sections: experiences, projects, skills, educations, references, custom
    const measured = measuredData?.[secKey];
    let items: { index: number; height: number }[];
    let measuredTotalHeight: number | null = null;
    let secHeaderHeight = defaultTitleHeight;

    if (measured && measured.items && measured.items.length > 0) {
      items = measured.items;
      measuredTotalHeight = isFirstSecOnPage
        ? measured.totalHeight - sectionSpacingPx
        : measured.totalHeight;
      secHeaderHeight = isFirstSecOnPage
        ? Math.max(16, measured.headerHeight - sectionSpacingPx)
        : measured.headerHeight;
    } else {
      items = getItemEstimates(secKey, data, fontSize, lineSpacing, sectionSpacing);
    }

    if (items.length === 0) continue;

    // Calculate total section height
    const totalSectionHeight =
      measuredTotalHeight ??
      (secHeaderHeight + items.reduce((acc, it) => acc + it.height, 0));

    // Case 1: The entire section fits on the current page
    if (currentHeight + totalSectionHeight <= usableHeight) {
      currentSlots.push({ sectionKey: secKey });
      currentHeight += totalSectionHeight;
      continue;
    }

    // Case 2: Entire section does not fit. Try item-level distribution
    let itemIdx = 0;
    let isContinuation = false;

    while (itemIdx < items.length) {
      const currentFirstOnPage = currentSlots.length === 0;
      const titleHeightForSlot = isContinuation
        ? (currentFirstOnPage ? FIRST_TITLE_HEADER_HEIGHT : TITLE_HEADER_HEIGHT)
        : (currentFirstOnPage ? FIRST_TITLE_HEADER_HEIGHT : TITLE_HEADER_HEIGHT);

      // If current page cannot even fit the section title + 1st remaining item, push to new page
      if (
        currentSlots.length > 0 &&
        currentHeight + titleHeightForSlot + items[itemIdx].height > usableHeight
      ) {
        pages.push({ slots: currentSlots, isFirstPage });
        currentSlots = [];
        isFirstPage = false;
        currentHeight = 0;
        continue;
      }

      const activeTitleHeight = currentSlots.length === 0 ? FIRST_TITLE_HEADER_HEIGHT : TITLE_HEADER_HEIGHT;
      const fittingIndices: number[] = [];
      let accumulatedHeight = activeTitleHeight;

      while (itemIdx < items.length) {
        const nextItemHeight = items[itemIdx].height;
        if (
          fittingIndices.length > 0 &&
          currentHeight + accumulatedHeight + nextItemHeight > usableHeight
        ) {
          break;
        }
        fittingIndices.push(itemIdx);
        accumulatedHeight += nextItemHeight;
        itemIdx++;
      }

      currentSlots.push({
        sectionKey: secKey,
        itemIndices: fittingIndices.length === items.length && !isContinuation ? undefined : fittingIndices,
        isContinuation,
      });
      currentHeight += accumulatedHeight;
      isContinuation = true;

      // If more items remain, start next page
      if (itemIdx < items.length) {
        pages.push({ slots: currentSlots, isFirstPage });
        currentSlots = [];
        isFirstPage = false;
        currentHeight = 0;
      }
    }
  }

  if (currentSlots.length > 0 || pages.length === 0) {
    pages.push({ slots: currentSlots, isFirstPage });
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
      sectionSpacing = 'standard',
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

    const numFontSize = resolveFontSize(fontSize);
    const numLineSpacing = resolveLineSpacing(lineSpacing);
    const numSectionSpacing = resolveSectionSpacing(sectionSpacing);
    const { horizontal: marginH, vertical: marginV } = resolvePageMargin(pageMargin);
    const numDividerThickness = resolveDividerThickness(dividerThickness);

    const A4_HEIGHT_PX = 1122.52;
    const verticalPaddingPx = (marginV * 2) * (96 / 72);
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
          return Boolean(skills && skills.some((s) => !s.hidden));
        case 'experiences':
          return Boolean(experiences && experiences.some((e) => !e.hidden));
        case 'projects':
          return Boolean(projects && projects.some((p) => !p.hidden));
        case 'educations':
          return Boolean(educations && educations.length > 0);
        case 'references': {
          const refStyle = settings.referenceStyle || 'grid';
          if (refStyle === 'upon-request') return true;
          return Boolean(references && references.some((r) => !r.hidden));
        }
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

    const [pages, setPages] = useState<ResumePage[]>(() =>
      calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        estimateHeaderHeight(data, numFontSize),
        data,
        numFontSize,
        numLineSpacing,
        numSectionSpacing
      )
    );

    useIsomorphicLayoutEffect(() => {
      if (typeof window === 'undefined') return;

      const container = document.getElementById('resume-print-node');
      if (!container) return;

      const headerEl = container.querySelector('[data-resume-header]') as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.offsetHeight : estimateHeaderHeight(data, numFontSize);

      const measuredData: Record<string, MeasuredSection> = {};
      const sectionEls = container.querySelectorAll<HTMLElement>('[data-resume-section]');

      sectionEls.forEach((secEl) => {
        const key = secEl.getAttribute('data-resume-section');
        if (!key) return;

        const totalHeight = Math.max(secEl.offsetHeight, secEl.scrollHeight);
        const headerEl = secEl.querySelector<HTMLElement>('[data-resume-section-header]');
        const headerHeight = headerEl ? Math.max(headerEl.offsetHeight, headerEl.scrollHeight) : 28;

        const itemEls = secEl.querySelectorAll<HTMLElement>('[data-resume-item]');
        const items: MeasuredItem[] = [];
        itemEls.forEach((itEl, idx) => {
          items.push({
            index: idx,
            height: Math.max(itEl.offsetHeight, itEl.scrollHeight),
          });
        });

        if (!measuredData[key]) {
          measuredData[key] = {
            totalHeight,
            headerHeight,
            items,
          };
        } else {
          measuredData[key].items.push(...items);
          measuredData[key].totalHeight += totalHeight;
        }
      });

      const nextPages = calculatePages(
        visibleSections,
        effectivePageBreaks,
        usablePageHeight,
        headerHeight,
        data,
        numFontSize,
        numLineSpacing,
        numSectionSpacing,
        measuredData
      );

      setPages((prev) => {
        const isSame =
          prev.length === nextPages.length &&
          prev.every(
            (p, i) =>
              p.isFirstPage === nextPages[i].isFirstPage &&
              p.slots.length === nextPages[i].slots.length &&
              p.slots.every(
                (s, si) =>
                  s.sectionKey === nextPages[i].slots[si].sectionKey &&
                  s.isContinuation === nextPages[i].slots[si].isContinuation &&
                  JSON.stringify(s.itemIndices) ===
                    JSON.stringify(nextPages[i].slots[si].itemIndices)
              )
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
      sectionSpacing,
      fontFamily,
    ]);

    // Font size scaling (relative em sizes based on page root font-size)
    const fontSizeClasses = {
      root: 'text-[1em]',
      name: 'text-[1.8em]',
      sectionTitle: 'text-[1.1em]',
      itemTitle: 'text-[1em]',
      body: 'text-[1em]',
      subtext: 'text-[0.95em]',
    };

    // Spacing configs (inherits dynamic line-height from page container)
    const lineSpacingClasses = 'leading-[inherit]';

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
        dividerThickness={numDividerThickness}
        isFirstOnPage={isFirstOnPage}
        fontSizePt={numFontSize * 1.1}
        sectionSpacing={numSectionSpacing}
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
    const renderSection = (slot: PageSectionSlot, isFirstOnPage = false) => {
      const sectionKey = slot.sectionKey;
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
          const visibleExperiences = (experiences || []).filter((e) => !e.hidden);
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => visibleExperiences[i]).filter(Boolean)
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
                  <div key={exp.id} data-resume-item="true" className="experience-item w-full">
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
                              <ExternalLinkIcon size={9} />
                            </a>
                          ) : (
                            <span className="italic text-black font-normal">{exp.company}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bullets (Accomplishments) */}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="mt-[1pt] space-y-[1pt]">
                        {exp.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;

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
                  <div key={proj.id} data-resume-item="true" className="project-item w-full">
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
                      <div className="flex flex-col mt-[1pt] space-y-[1pt]">
                        {proj.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((h, i) => {
                            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                            const cleanText = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;

                            if (isBullet) {
                              return (
                                <div
                                  key={i}
                                  className={`flex items-start ${fontSizeClasses.body} ${lineSpacingClasses} text-black`}
                                >
                                  {renderBullet()}
                                  <div className="flex-1 text-justify">
                                    <FormattedText text={cleanText} />
                                  </div>
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
                  </div>
                ))}
              </div>
            </div>
          );
        }

        case 'educations': {
          if (!educations || educations.length === 0) return null;
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => educations[i]).filter(Boolean)
            : educations;
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
                  <div key={edu.id} data-resume-item="true" className="education-item w-full">
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
                            <span className="text-black"> — </span>
                            <span className="text-black font-normal">{refItem.organization}</span>
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
                        <span className="font-bold text-black">{refItem.name}</span>
                        {refItem.role && (
                          <span className="italic font-normal">, {refItem.role}</span>
                        )}
                        {refItem.organization && (
                          <span className="font-normal"> ({refItem.organization})</span>
                        )}
                        {refItem.contact && (
                          <span className="text-black">
                            {' '}—{' '}
                            {refItem.contact.includes('@') ? (
                              <a
                                href={`mailto:${refItem.contact}`}
                                className="hover:underline"
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
                /* Default: 2-Column Grid */
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {itemsToRender.map((refItem) => (
                    <div
                      key={refItem.id}
                      data-resume-item="true"
                      className="reference-item w-full"
                    >
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
                        <div
                          className={`${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
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
              )}
            </div>
          );
        }

        default: {
          // Custom sections
          const customSec = (allCustomSections || []).find((c) => c.id === sectionKey);
          if (!customSec || !customSec.items || customSec.items.length === 0) return null;
          const itemsToRender = slot.itemIndices
            ? slot.itemIndices.map((i) => customSec.items[i]).filter(Boolean)
            : customSec.items;
          if (itemsToRender.length === 0) return null;
          const sectionTitle = slot.isContinuation
            ? `${customSec.title || 'Custom Section'} (Continued)`
            : customSec.title || 'Custom Section';

          return (
            <div
              key={`${customSec.id}-${slot.isContinuation ? 'cont' : 'main'}`}
              data-resume-section={customSec.id}
              className="resume-section w-full"
            >
              {renderSectionTitle(sectionTitle, isFirstOnPage)}
              <div className="flex flex-col gap-[8.4pt]">
                {itemsToRender.map((item) => {
                  if (
                    !item.title &&
                    !item.subtitle &&
                    !item.description &&
                    (!item.highlights || item.highlights.length === 0)
                  ) {
                    return null;
                  }

                  return (
                    <div key={item.id} data-resume-item="true" className="custom-item w-full">
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
                        <div className="mt-[1pt] space-y-[1pt]">
                          {item.highlights
                            .filter((h) => h.trim().length > 0)
                            .map((h, i) => {
                              const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
                              const cleanText = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;

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
                        className={`${fontSizeClasses.name} font-bold text-black text-center`}
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
                        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-[4.5pt]">
                          {contactItems.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`inline-flex items-center gap-1.5 ${fontSizeClasses.subtext} ${lineSpacingClasses} text-black`}
                            >
                              <ProfileIcon icon={item.icon} size={11} />
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
                              {idx < contactItems.length - 1 && (
                                <span className="text-slate-400 font-bold ml-1.5 select-none">•</span>
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
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 mt-[4.5pt]">
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

ResumePreview.displayName = 'ResumePreview';
