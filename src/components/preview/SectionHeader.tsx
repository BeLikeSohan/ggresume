import React from 'react';
import { resolveSectionSpacing } from '@/lib/layoutMetrics';

interface SectionHeaderProps {
  title: string;
  accentColor?: string;
  dividerThickness?: number;
  isFirstOnPage?: boolean;
  fontSizePt?: number;
  fontSizeClass?: string;
  sectionSpacing?: number | 'compact' | 'standard' | 'spacious';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  accentColor = '#000000',
  dividerThickness = 1.5,
  isFirstOnPage = false,
  fontSizePt,
  fontSizeClass = 'text-[11pt]',
  sectionSpacing = 13.5,
  className = '',
}) => {
  const spacingNum = resolveSectionSpacing(sectionSpacing);
  const paddingTop = isFirstOnPage ? '0pt' : `${spacingNum}pt`;
  const marginBottom = `${Math.max(2, spacingNum * 0.38).toFixed(1)}pt`;

  return (
    <div
      data-resume-section-header="true"
      className={`section-header w-full ${className}`}
      style={{
        paddingTop,
        marginBottom,
      }}
    >
      <h2
        className={`${fontSizeClass} font-bold text-black`}
        style={{
          color: accentColor,
          lineHeight: 1.25,
          fontSize: fontSizePt ? `${fontSizePt}pt` : undefined,
          margin: 0,
          padding: 0,
          letterSpacing: 'normal',
        }}
      >
        {title}
      </h2>
      <div
        className="section-divider w-full"
        style={{
          height: 0,
          minHeight: 0,
          borderTop: `${dividerThickness}pt solid ${accentColor}`,
          marginTop: '2.5pt',
          marginBottom: 0,
          boxSizing: 'content-box',
        }}
      />
    </div>
  );
};
