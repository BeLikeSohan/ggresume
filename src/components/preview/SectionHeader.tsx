import React from 'react';

interface SectionHeaderProps {
  title: string;
  accentColor?: string;
  dividerThickness?: number;
  isFirstOnPage?: boolean;
  fontSizeClass?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  accentColor = '#000000',
  dividerThickness = 1.5,
  isFirstOnPage = false,
  fontSizeClass = 'text-[11pt]',
  className = '',
}) => {
  return (
    <div
      className={`section-header w-full ${className}`}
      style={{
        paddingTop: isFirstOnPage ? '0pt' : '13.5pt',
        marginBottom: '5.5pt',
      }}
    >
      <h2
        className={`${fontSizeClass} font-bold text-black`}
        style={{
          color: accentColor,
          lineHeight: 1.25,
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
