/**
 * TypeScript models for the PCMB/SPMB Jabar 2026 social-intelligence report.
 *
 * These mirror the JSON emitted by the Python pipeline's `export_to_json()`
 * (see scraper_1_test.ipynb). Keeping the shapes in one typed place means the
 * dashboard breaks at compile time if the export schema ever drifts, instead of
 * silently rendering wrong numbers.
 */

export interface DateWindow {
  start: string; // ISO date, e.g. "2026-06-01"
  end: string;   // ISO date, e.g. "2026-06-30"
}

export interface ReportMeta {
  generated_at: string; // ISO datetime (UTC)
  ig_target_profile: string; // "@disdikjabar"
  date_window: DateWindow;
  counts: {
    instagram: number;
    x_twitter: number;
  };
}

/** One row of the Summary_Statistics sheet (metric name -> value). */
export interface SummaryRow {
  Metric: string;
  Value: string | number;
}

/** A cleaned, redacted, anonymized Instagram comment or reply. */
export interface IgRecord {
  anon_username: string;
  post_shortcode: string;
  comment_timestamp: string; // ISO datetime
  is_reply: boolean;
  comment_text_cleaned: string;
}

/** The kind of X item, as classified by the scraper. */
export type XTweetType = "tweet" | "reply" | "quote" | "thread";

/** A cleaned, redacted, anonymized X (Twitter) item. */
export interface XRecord {
  anon_username: string;
  tweet_timestamp: string; // ISO datetime
  tweet_type: XTweetType | string;
  matched_pattern: string;
  thread_group: string | null;
  tweet_text_cleaned: string;
  quoted_text_cleaned: string;
}

export interface Report {
  meta: ReportMeta;
  summary: SummaryRow[];
  instagram: IgRecord[];
  x_twitter: XRecord[];
}

/** Normalized row used by the dashboard's unified table/search. */
export interface UnifiedRow {
  platform: "Instagram" | "X";
  user: string;
  timestamp: string;
  type: string; // IG: "comment"/"reply"; X: tweet_type
  pattern: string; // IG: "" ; X: matched_pattern
  group: string; // IG: post_shortcode ; X: thread_group
  text: string;
  quoted: string;
}
