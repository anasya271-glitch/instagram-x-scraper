/**
 * Pure chart builders: each returns a self-contained SVG string (no external
 * chart library, no CDN). Colours come from CSS custom properties so the charts
 * follow the page's light/dark theme.
 */

export interface Datum {
  label: string;
  value: number;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Tally a list of string keys into sorted {label, value} data (desc by value). */
export function tally(values: string[]): Datum[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Horizontal bar chart. Good for categorical breakdowns (tweet type, matched
 * pattern) where labels are text and there may be many categories.
 */
export function hBarChart(data: Datum[], opts: { barColorVar?: string } = {}): string {
  if (data.length === 0) return `<p class="empty">No data.</p>`;
  const color = opts.barColorVar ?? "--accent";
  const max = Math.max(...data.map((d) => d.value), 1);
  const rowH = 30;
  const gap = 10;
  const labelW = 150;
  const chartW = 520;
  const barMaxW = chartW - labelW - 60;
  const height = data.length * (rowH + gap) + gap;

  const rows = data
    .map((d, i) => {
      const y = gap + i * (rowH + gap);
      const w = Math.max(2, (d.value / max) * barMaxW);
      return `
    <g>
      <text x="${labelW - 8}" y="${y + rowH / 2}" class="bar-label" text-anchor="end" dominant-baseline="central">${escapeHtml(d.label)}</text>
      <rect x="${labelW}" y="${y}" width="${w}" height="${rowH}" rx="5" fill="var(${color})"></rect>
      <text x="${labelW + w + 8}" y="${y + rowH / 2}" class="bar-value" dominant-baseline="central">${d.value}</text>
    </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${chartW} ${height}" width="100%" role="img" class="chart">${rows}</svg>`;
}

/**
 * Grouped vertical bars over a set of day labels, with two series (e.g. IG vs X).
 */
export function dailyGroupedBars(
  days: string[],
  seriesA: { name: string; values: number[]; colorVar: string },
  seriesB: { name: string; values: number[]; colorVar: string },
): string {
  if (days.length === 0) return `<p class="empty">No dated records.</p>`;
  const width = 640;
  const height = 240;
  const padL = 32;
  const padB = 46;
  const padT = 12;
  const plotW = width - padL - 12;
  const plotH = height - padB - padT;
  const max = Math.max(1, ...seriesA.values, ...seriesB.values);
  const groupW = plotW / days.length;
  const barW = Math.max(3, Math.min(18, groupW / 3));

  const yFor = (v: number): number => padT + plotH - (v / max) * plotH;

  const bars = days
    .map((_, i) => {
      const gx = padL + i * groupW + groupW / 2;
      const a = seriesA.values[i] ?? 0;
      const b = seriesB.values[i] ?? 0;
      const aY = yFor(a);
      const bY = yFor(b);
      return `
      <rect x="${gx - barW - 1}" y="${aY}" width="${barW}" height="${padT + plotH - aY}" fill="var(${seriesA.colorVar})"><title>${escapeHtml(days[i]!)}: ${seriesA.name} ${a}</title></rect>
      <rect x="${gx + 1}" y="${bY}" width="${barW}" height="${padT + plotH - bY}" fill="var(${seriesB.colorVar})"><title>${escapeHtml(days[i]!)}: ${seriesB.name} ${b}</title></rect>`;
    })
    .join("");

  // Show at most ~12 x-axis labels to avoid crowding.
  const step = Math.ceil(days.length / 12);
  const xLabels = days
    .map((d, i) => {
      if (i % step !== 0) return "";
      const gx = padL + i * groupW + groupW / 2;
      const short = d.slice(5); // MM-DD
      return `<text x="${gx}" y="${height - padB + 16}" class="axis" text-anchor="middle">${escapeHtml(short)}</text>`;
    })
    .join("");

  const axisY = padT + plotH;
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" class="chart">
    <line x1="${padL}" y1="${axisY}" x2="${width - 8}" y2="${axisY}" class="axis-line"></line>
    <text x="${padL}" y="${padT + 4}" class="axis">${max}</text>
    ${bars}
    ${xLabels}
  </svg>`;
}
