import React, { useRef, useImperativeHandle } from 'react';
import { Bold } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  allowBoldHelper?: boolean;
  onTextChange?: (value: string) => void;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      allowBoldHelper = true,
      className,
      id,
      value,
      onChange,
      onTextChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleApplyBold = (e: React.MouseEvent) => {
      e.preventDefault();
      const textarea = internalRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = String(value || '');

      if (start === end) {
        // Nothing selected, insert **bold text**
        const updated =
          currentVal.substring(0, start) + '**bold text**' + currentVal.substring(end);
        if (onTextChange) onTextChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, start + 11);
        }, 0);
      } else {
        // Wrap selection
        const selected = currentVal.substring(start, end);
        const updated =
          currentVal.substring(0, start) + `**${selected}**` + currentVal.substring(end);
        if (onTextChange) onTextChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }
    };

    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              {label}
            </label>
          )}
          {allowBoldHelper && (
            <button
              type="button"
              onClick={handleApplyBold}
              title="Make selected text bold (**text**)"
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
            >
              <Bold size={12} className="stroke-[2.5]" />
              <span>Bold</span>
            </button>
          )}
        </div>

        <textarea
          ref={internalRef}
          id={inputId}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            onTextChange?.(e.target.value);
          }}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all leading-relaxed',
            className
          )}
          {...props}
        />

        {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
