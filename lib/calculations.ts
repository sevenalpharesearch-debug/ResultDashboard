export function calculateGrowth(currentValue: number, previousValue: number): number {
  if (previousValue === undefined || previousValue === null || previousValue === 0) return 0;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

export function parseQuarter(quarter: string): { q: number; year: number } | null {
  const match = quarter.trim().match(/Q([1-4])\s*(?:FY)?(\d{2,4})/i);
  if (!match) return null;
  const q = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);
  if (year < 100) year += 2000;
  return { q, year };
}

export function getPreviousQuarter(quarter: string): string {
  const parsed = parseQuarter(quarter);
  if (!parsed) return '';
  const { q, year } = parsed;

  if (q === 1) {
    return `Q4 FY${(year - 1) % 100}`;
  }
  return `Q${q - 1} FY${year % 100}`;
}

export function getYoYQuarter(quarter: string): string {
  const parsed = parseQuarter(quarter);
  if (!parsed) return '';
  const { q, year } = parsed;

  return `Q${q} FY${(year - 1) % 100}`;
}

export function formatQuarter(quarter: string): string {
  const parsed = parseQuarter(quarter);
  if (!parsed) return quarter;
  return `Q${parsed.q} FY${parsed.year % 100}`;
}
