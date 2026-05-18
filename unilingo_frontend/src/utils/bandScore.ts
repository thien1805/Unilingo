export function normalizeBand(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(9, Math.round(value * 2) / 2));
}

export function formatBand(value: number | null | undefined): string {
  return normalizeBand(value).toFixed(1);
}
