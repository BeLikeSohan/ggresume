import React from 'react';

interface BulletMarkerProps {
  style?: 'square' | 'disc' | 'dash';
  accentColor?: string;
  className?: string;
  isInline?: boolean;
}

export const BulletMarker: React.FC<BulletMarkerProps> = ({
  style = 'square',
  accentColor = '#000000',
  className = '',
  isInline = false,
}) => {
  if (style === 'square') {
    return (
      <span
        className={`inline-block flex-shrink-0 ${className}`}
        style={{
          width: '3pt',
          height: '3pt',
          backgroundColor: accentColor,
          marginTop: isInline ? '0' : '4.5pt',
          verticalAlign: isInline ? '0.16em' : undefined,
          marginRight: '6pt',
          marginLeft: '1pt',
        }}
      />
    );
  }

  if (style === 'disc') {
    return (
      <span
        className={`inline-block rounded-full flex-shrink-0 ${className}`}
        style={{
          width: '3pt',
          height: '3pt',
          backgroundColor: accentColor,
          marginTop: isInline ? '0' : '4.5pt',
          verticalAlign: isInline ? '0.16em' : undefined,
          marginRight: '6pt',
          marginLeft: '1pt',
        }}
      />
    );
  }

  return (
    <span
      className={`font-bold ${className}`}
      style={{
        marginRight: '5pt',
        marginLeft: '1pt',
      }}
    >
      —
    </span>
  );
};
