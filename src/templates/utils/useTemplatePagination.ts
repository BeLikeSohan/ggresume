import { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { ResumeData } from '@/types/resume';
import {
  resolveFontSize,
  resolveLineSpacing,
  resolveSectionSpacing,
  resolvePageMargin,
} from '@/lib/layoutMetrics';
import { ResumePage, MeasuredSection, MeasuredItem } from '../types';
import {
  estimateHeaderHeight,
  calculateStandardPages,
  getVisibleSections,
} from './templateUtils';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface UseTemplatePaginationOptions {
  customVisibleSections?: string[];
}

export function useTemplatePagination(
  data: ResumeData,
  options?: UseTemplatePaginationOptions
) {
  const settings = data.settings || ({} as any);
  const {
    fontSize = 10,
    lineSpacing = 1.35,
    pageMargin = 45,
    sectionSpacing = 13.5,
    pageBreakBefore = [],
  } = settings;

  const rawBreaks = Array.isArray(pageBreakBefore) ? pageBreakBefore : [];
  const effectivePageBreaks = useMemo(() => {
    return rawBreaks.length === 1 && rawBreaks[0] === 'educations'
      ? []
      : rawBreaks;
  }, [rawBreaks.join(',')]);

  const numFontSize = resolveFontSize(fontSize);
  const numLineSpacing = resolveLineSpacing(lineSpacing);
  const numSectionSpacing = resolveSectionSpacing(sectionSpacing);
  const { horizontal: marginH, vertical: marginV } =
    resolvePageMargin(pageMargin);

  const A4_HEIGHT_PX = 1122.52;
  const verticalPaddingPx = marginV * 2 * (96 / 72);
  const usablePageHeight = A4_HEIGHT_PX - verticalPaddingPx;

  const customSectionsKey = options?.customVisibleSections?.join(',');

  const visibleSections = useMemo(() => {
    if (options?.customVisibleSections) {
      return options.customVisibleSections;
    }
    return getVisibleSections(data);
  }, [
    data,
    customSectionsKey,
    settings.hiddenSections?.join(','),
    settings.sectionOrder?.join(','),
    (data.customSections || []).map((c) => c.id).join(','),
    data.profile,
    data.skills?.length,
    data.experiences?.length,
    data.projects?.length,
    data.educations?.length,
    data.references?.length,
  ]);

  const [pages, setPages] = useState<ResumePage[]>(() =>
    calculateStandardPages(
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

    const headerEl = container.querySelector(
      '[data-resume-header]'
    ) as HTMLElement | null;
    const headerHeight = headerEl
      ? headerEl.offsetHeight
      : estimateHeaderHeight(data, numFontSize);

    const measuredData: Record<string, MeasuredSection> = {};
    const sectionEls =
      container.querySelectorAll<HTMLElement>('[data-resume-section]');

    sectionEls.forEach((secEl) => {
      const key = secEl.getAttribute('data-resume-section');
      if (!key) return;

      const totalHeight = Math.max(secEl.offsetHeight, secEl.scrollHeight);
      const sHeaderEl = secEl.querySelector<HTMLElement>(
        '[data-resume-section-header]'
      );
      const sHeaderHeight = sHeaderEl
        ? Math.max(sHeaderEl.offsetHeight, sHeaderEl.scrollHeight)
        : 28;

      const itemEls = secEl.querySelectorAll<HTMLElement>(
        '[data-resume-item]'
      );
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
          headerHeight: sHeaderHeight,
          items,
        };
      } else {
        measuredData[key].items.push(...items);
        measuredData[key].totalHeight += totalHeight;
      }
    });

    const newPages = calculateStandardPages(
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

    setPages((prevPages) => {
      const isDiff =
        newPages.length !== prevPages.length ||
        newPages.some(
          (p, i) =>
            p.slots.length !== prevPages[i]?.slots.length ||
            p.slots.some(
              (s, si) =>
                s.sectionKey !== prevPages[i]?.slots[si]?.sectionKey ||
                s.itemIndices?.join(',') !==
                  prevPages[i]?.slots[si]?.itemIndices?.join(',')
            )
        );

      return isDiff ? newPages : prevPages;
    });
  }, [
    data,
    numFontSize,
    numLineSpacing,
    numSectionSpacing,
    marginV,
    usablePageHeight,
    effectivePageBreaks,
    visibleSections,
  ]);

  return {
    pages,
    numFontSize,
    numLineSpacing,
    numSectionSpacing,
    marginH,
    marginV,
    usablePageHeight,
    visibleSections,
  };
}
