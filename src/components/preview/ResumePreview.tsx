'use client';

import React, { forwardRef } from 'react';
import { ResumeData } from '@/types/resume';
import { getTemplate } from '@/templates/registry';
import {
  getPersonalContactItems,
  resolveFontFamilyStyle,
} from '@/templates/utils/templateUtils';
import {
  TemplateProps,
  ContactDisplayItem,
  PageSectionSlot,
  ResumePage,
  MeasuredItem,
  MeasuredSection,
} from '@/templates/types';

export type {
  ContactDisplayItem,
  PageSectionSlot,
  ResumePage,
  MeasuredItem,
  MeasuredSection,
};
export { getPersonalContactItems, resolveFontFamilyStyle };

export interface ResumePreviewProps extends TemplateProps {
  className?: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  (
    {
      data,
      scale = 1,
      isPrinting = false,
      showPageGuide = true,
    },
    ref
  ) => {
    const templateId = data.settings?.templateId || 'classic';
    const templateDef = getTemplate(templateId);
    const TemplateComponent = templateDef.component;

    return (
      <TemplateComponent
        ref={ref}
        data={data}
        scale={scale}
        isPrinting={isPrinting}
        showPageGuide={showPageGuide}
      />
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
