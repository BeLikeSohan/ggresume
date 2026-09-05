'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface NumericSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  description?: string;
  onChange: (val: number) => void;
}

export const NumericSliderControl: React.FC<NumericSliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = 'pt',
  decimals = 1,
  description,
  onChange,
}) => {
  const displayValue = Number(value).toFixed(decimals);

  const handleDecrement = () => {
    const next = Math.max(min, Number((value - step).toFixed(decimals)));
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Number((value + step).toFixed(decimals)));
    onChange(next);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Number(val.toFixed(decimals)));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.max(min, Math.min(max, val));
      onChange(Number(clamped.toFixed(decimals)));
    }
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-800 tracking-tight">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs flex-shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onChange={handleInputChange}
            className="w-11 text-xs font-bold text-slate-900 text-right bg-transparent outline-none focus:text-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[11px] font-medium text-slate-500 select-none">
            {unit}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-0.5">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex-shrink-0 shadow-2xs"
        >
          <Minus size={13} />
        </button>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex-shrink-0 shadow-2xs"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
