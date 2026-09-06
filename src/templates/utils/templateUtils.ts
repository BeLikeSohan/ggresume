import { ResumeData } from '@/types/resume';
import {
  resolveFontSize,
  resolveLineSpacing,
  resolveSectionSpacing,
} from '@/lib/layoutMetrics';
import {
  ContactDisplayItem,
  PageSectionSlot,
  ResumePage,
  MeasuredSection,
} from '../types';

export function getPersonalContactItems(
  personal: ResumeData['personal']
): ContactDisplayItem[] {
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

export function resolveFontFamilyStyle(fontFamily?: string): string {
  const fontFamilies: Record<string, string> = {
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
  };

  return fontFamilies[fontFamily || ''] || fontFamilies['source-sans'];
}

export function estimateHeaderHeight(
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

export function getItemEstimates(
  key: string,
  data: ResumeData,
  fontSize: number | string = 10,
  lineSpacing: number | string = 1.35,
  _sectionSpacing: number | string = 13.5
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
            return (
              hAcc +
              Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT +
              1.5
            );
          }, 0);
        return {
          index: i,
          height:
            headerLines * BASE_LINE_HEIGHT +
            highlightLines +
            2 +
            (i < visibleExp.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
    case 'projects': {
      const visibleProj = (data.projects || []).filter((p) => !p.hidden);
      return visibleProj.map((proj, i) => {
        const headerLines = 1;
        const techLines = proj.technologies
          ? Math.max(1, Math.ceil(proj.technologies.length / 90)) *
            BASE_LINE_HEIGHT
          : 0;
        const highlightLines = (proj.highlights || [])
          .filter((h) => h.trim().length > 0)
          .reduce((hAcc, h) => {
            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
            const clean = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;
            return (
              hAcc +
              Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT +
              1.5
            );
          }, 0);
        return {
          index: i,
          height:
            headerLines * BASE_LINE_HEIGHT +
            techLines +
            highlightLines +
            2 +
            (i < visibleProj.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
    case 'educations': {
      return (data.educations || []).map((edu, i, arr) => ({
        index: i,
        height:
          BASE_LINE_HEIGHT * 2 +
          (edu.details ? BASE_LINE_HEIGHT : 0) +
          (i < arr.length - 1 ? ITEM_GAP : 0),
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
          ? Math.max(1, Math.ceil(item.description.length / 92)) *
            BASE_LINE_HEIGHT
          : 0;
        const highlightLines = (item.highlights || [])
          .filter((h) => h.trim().length > 0)
          .reduce((hAcc, h) => {
            const isBullet = /^[\s]*[•\-\*]\s+/.test(h);
            const clean = isBullet ? h.replace(/^[\s]*[•\-\*]\s+/, '') : h;
            return (
              hAcc +
              Math.max(1, Math.ceil(clean.length / 92)) * BASE_LINE_HEIGHT +
              1.5
            );
          }, 0);
        return {
          index: i,
          height:
            BASE_LINE_HEIGHT +
            2 +
            descLines +
            highlightLines +
            (i < arr.length - 1 ? ITEM_GAP : 0),
        };
      });
    }
  }
}

export function calculateStandardPages(
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
  const TITLE_HEADER_HEIGHT = Math.round(
    sectionSpacingPx + numFontSize * 1.1 * PT_TO_PX * 1.25 + 11.33
  );
  const FIRST_TITLE_HEADER_HEIGHT = Math.round(
    numFontSize * 1.1 * PT_TO_PX * 1.25 + 11.33
  );
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
    const defaultTitleHeight = isFirstSecOnPage
      ? FIRST_TITLE_HEADER_HEIGHT
      : TITLE_HEADER_HEIGHT;

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

      if (
        currentSlots.length > 0 &&
        currentHeight + profileHeight > usableHeight
      ) {
        pages.push({ slots: currentSlots, isFirstPage });
        currentSlots = [{ sectionKey: secKey }];
        isFirstPage = false;
        currentHeight =
          FIRST_TITLE_HEADER_HEIGHT + (profileHeight - defaultTitleHeight);
      } else {
        currentSlots.push({ sectionKey: secKey });
        currentHeight += profileHeight;
      }
      continue;
    }

    // Itemized sections
    const measured = measuredData?.[secKey];
    let titleHeight = defaultTitleHeight;
    let itemEstimates: { index: number; height: number }[] = [];

    if (measured && measured.items.length > 0) {
      titleHeight = isFirstSecOnPage
        ? measured.headerHeight
        : measured.headerHeight + sectionSpacingPx;
      itemEstimates = measured.items.map((it) => ({
        index: it.index,
        height: it.height,
      }));
    } else {
      itemEstimates = getItemEstimates(
        secKey,
        data,
        fontSize,
        lineSpacing,
        sectionSpacing
      );
    }

    if (itemEstimates.length === 0) continue;

    const totalSectionHeight =
      titleHeight + itemEstimates.reduce((acc, it) => acc + it.height, 0);

    // If whole section fits on current page
    if (currentHeight + totalSectionHeight <= usableHeight) {
      currentSlots.push({
        sectionKey: secKey,
        itemIndices: itemEstimates.map((it) => it.index),
      });
      currentHeight += totalSectionHeight;
      continue;
    }

    // Section doesn't fit entirely on current page
    let remainingItems = [...itemEstimates];
    let isContinuation = false;

    while (remainingItems.length > 0) {
      const currentTitleHeight =
        currentSlots.length === 0
          ? FIRST_TITLE_HEADER_HEIGHT
          : TITLE_HEADER_HEIGHT;
      const availableSpace = usableHeight - currentHeight;

      if (availableSpace < currentTitleHeight + remainingItems[0].height) {
        if (currentSlots.length > 0) {
          pages.push({ slots: currentSlots, isFirstPage });
          currentSlots = [];
          isFirstPage = false;
          currentHeight = 0;
          continue;
        }
      }

      const effectiveTitleH =
        currentSlots.length === 0
          ? FIRST_TITLE_HEADER_HEIGHT
          : TITLE_HEADER_HEIGHT;
      let spaceForItems = usableHeight - currentHeight - effectiveTitleH;
      const itemsForThisPage: number[] = [];
      let usedItemSpace = 0;

      for (let i = 0; i < remainingItems.length; i++) {
        const it = remainingItems[i];
        if (usedItemSpace + it.height <= spaceForItems) {
          itemsForThisPage.push(it.index);
          usedItemSpace += it.height;
        } else {
          break;
        }
      }

      if (itemsForThisPage.length === 0) {
        if (currentSlots.length > 0) {
          pages.push({ slots: currentSlots, isFirstPage });
          currentSlots = [];
          isFirstPage = false;
          currentHeight = 0;
          continue;
        } else {
          // If a single item is taller than the entire page, force it onto the page
          itemsForThisPage.push(remainingItems[0].index);
          usedItemSpace = remainingItems[0].height;
        }
      }

      currentSlots.push({
        sectionKey: secKey,
        itemIndices: itemsForThisPage,
        isContinuation,
      });
      currentHeight += effectiveTitleH + usedItemSpace;

      remainingItems = remainingItems.slice(itemsForThisPage.length);
      isContinuation = true;

      if (remainingItems.length > 0) {
        pages.push({ slots: currentSlots, isFirstPage });
        currentSlots = [];
        isFirstPage = false;
        currentHeight = 0;
      }
    }
  }

  if (currentSlots.length > 0) {
    pages.push({ slots: currentSlots, isFirstPage });
  }

  return pages.length > 0 ? pages : [{ slots: [], isFirstPage: true }];
}

export function getVisibleSections(data: ResumeData): string[] {
  const settings = data.settings || {};
  const hiddenSections = settings.hiddenSections || [];
  const customSections = data.customSections || [];

  const baseSectionOrder = settings.sectionOrder || [
    'profile',
    'skills',
    'experiences',
    'projects',
    'educations',
    'references',
  ];
  const missingCustomIds = customSections
    .map((s) => s.id)
    .filter((id) => !baseSectionOrder.includes(id));
  const effectiveSectionOrder = [...baseSectionOrder, ...missingCustomIds];

  return effectiveSectionOrder.filter((key) => {
    if (hiddenSections.includes(key)) return false;
    switch (key) {
      case 'profile':
        return Boolean(data.profile && data.profile.trim());
      case 'skills':
        return Boolean(data.skills && data.skills.some((s) => !s.hidden));
      case 'experiences':
        return Boolean(
          data.experiences && data.experiences.some((e) => !e.hidden)
        );
      case 'projects':
        return Boolean(data.projects && data.projects.some((p) => !p.hidden));
      case 'educations':
        return Boolean(data.educations && data.educations.length > 0);
      case 'references': {
        const refStyle = settings.referenceStyle || 'grid';
        if (refStyle === 'upon-request') return true;
        return Boolean(
          data.references && data.references.some((r) => !r.hidden)
        );
      }
      default: {
        const custom = customSections.find((c) => c.id === key);
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
}
