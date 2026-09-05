/**
 * Layout and typography metric resolvers supporting numeric and legacy preset values.
 */

export function resolveFontSize(val: number | string | undefined): number {
  if (typeof val === 'number' && !isNaN(val)) {
    return Math.max(7.5, Math.min(14, Number(val.toFixed(1))));
  }
  if (val === 'compact') return 9.5;
  if (val === 'spacious') return 10.5;
  return 10.0;
}

export function resolveLineSpacing(val: number | string | undefined): number {
  if (typeof val === 'number' && !isNaN(val)) {
    return Math.max(1.0, Math.min(2.0, Number(val.toFixed(2))));
  }
  if (val === 'compact') return 1.25;
  if (val === 'relaxed') return 1.55;
  return 1.35;
}

export function resolveSectionSpacing(val: number | string | undefined): number {
  if (typeof val === 'number' && !isNaN(val)) {
    return Math.max(4, Math.min(32, Number(val.toFixed(1))));
  }
  if (val === 'compact') return 8;
  if (val === 'spacious') return 20;
  return 13.5;
}

export function resolvePageMargin(val: number | string | undefined): {
  horizontal: number;
  vertical: number;
} {
  if (typeof val === 'number' && !isNaN(val)) {
    const clamped = Math.max(18, Math.min(70, Number(val.toFixed(1))));
    return {
      horizontal: clamped,
      vertical: Number((clamped * 0.92).toFixed(1)),
    };
  }
  if (val === 'compact') return { horizontal: 34, vertical: 32 };
  if (val === 'relaxed') return { horizontal: 52, vertical: 48 };
  return { horizontal: 45.4, vertical: 42 };
}

export function resolveDividerThickness(val: number | undefined): number {
  if (typeof val === 'number' && !isNaN(val)) {
    return Math.max(0.5, Math.min(4.0, Number(val.toFixed(2))));
  }
  return 1.5;
}
