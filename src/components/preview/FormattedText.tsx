import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Render text with markdown bold (**text**), italic (*text* or _text_), underline (__text__), inline code (`code`)
  const renderFormatted = (input: string): React.ReactNode[] => {
    // Regex matching:
    // 1. Code: `...`
    // 2. Bold: **...**
    // 3. Underline: __...__
    // 4. Italic: *...* or _..._
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    const parts = input.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={index}
            className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[0.9em] text-slate-800"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-bold text-black">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
        return (
          <u key={index} className="underline underline-offset-2">
            {part.slice(2, -2)}
          </u>
        );
      }

      if (
        (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length > 2)
      ) {
        return (
          <em key={index} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return <span className={className}>{renderFormatted(text)}</span>;
};

