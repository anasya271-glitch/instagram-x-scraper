/**
 * Pure data transforms from the raw report into the shapes the dashboard renders.
 * Kept dependency-free and side-effect-free so they are trivially unit-testable.
 */
import type { Report, UnifiedRow } from "./types";

/** Flatten both platforms into one uniformly-typed row list for the table. */
export function toUnifiedRows(report: Report): UnifiedRow[] {
  const ig: UnifiedRow[] = report.instagram.map((r) => ({
    platform: "Instagram",
    user: r.anon_username,
    timestamp: r.comment_timestamp,
    type: r.is_reply ? "reply" : "comment",
    pattern: "",
    group: r.post_shortcode,
    text: r.comment_text_cleaned,
    quoted: "",
  }));
  const x: UnifiedRow[] = report.x_twitter.map((r) => ({
    platform: "X",
    user: r.anon_username,
    timestamp: r.tweet_timestamp,
    type: r.tweet_type,
    pattern: r.matched_pattern,
    group: r.thread_group ?? "",
    text: r.tweet_text_cleaned,
    quoted: r.quoted_text_cleaned,
  }));
  return [...x, ...ig].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/** The calendar day (YYYY-MM-DD) portion of an ISO timestamp. */
export function dayOf(iso: string): string {
  return (iso || "").slice(0, 10);
}

export interface DailySeries {
  days: string[];
  instagram: number[];
  x: number[];
}

/**
 * Per-day counts for both platforms over the inclusive report date window
 * (falls back to the min/max observed day if the window is missing).
 */
export function dailyCounts(report: Report): DailySeries {
  const igDays = report.instagram.map((r) => dayOf(r.comment_timestamp)).filter(Boolean);
  const xDays = report.x_twitter.map((r) => dayOf(r.tweet_timestamp)).filter(Boolean);
  const all = [...igDays, ...xDays].sort();

  let start = report.meta?.date_window?.start;
  let end = report.meta?.date_window?.end;
  if (!start) start = all[0];
  if (!end) end = all[all.length - 1];
  if (!start || !end) return { days: [], instagram: [], x: [] };

  const days = enumerateDays(start, end);
  const igMap = countBy(igDays);
  const xMap = countBy(xDays);
  return {
    days,
    instagram: days.map((d) => igMap.get(d) ?? 0),
    x: days.map((d) => xMap.get(d) ?? 0),
  };
}

function countBy(values: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

/** Inclusive list of YYYY-MM-DD strings from start to end (capped for safety). */
export function enumerateDays(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) {
    return start === end ? [start] : [];
  }
  const cur = new Date(s);
  let guard = 0;
  while (cur <= e && guard < 400) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
    guard += 1;
  }
  return out;
}
