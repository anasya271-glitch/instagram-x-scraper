/**
 * Lightweight runtime validation of the report JSON.
 *
 * We deliberately hand-roll this instead of pulling in a JSON-Schema library so
 * the tool has ZERO runtime dependencies (it must run anywhere, offline). The
 * companion `report.schema.json` documents the same contract formally for any
 * consumer that does want to validate with a standard tool.
 */
import type { Report } from "./types";

export class ReportValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid report JSON:\n  - ${issues.join("\n  - ")}`);
    this.name = "ReportValidationError";
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validates the parsed JSON and returns it typed as `Report`, or throws a
 * ReportValidationError listing every problem found.
 */
export function validateReport(data: unknown): Report {
  const issues: string[] = [];

  if (!isObject(data)) {
    throw new ReportValidationError(["top-level value is not an object"]);
  }

  for (const key of ["meta", "summary", "instagram", "x_twitter"]) {
    if (!(key in data)) issues.push(`missing top-level key "${key}"`);
  }

  if (isObject(data.meta)) {
    const meta = data.meta;
    if (!isObject(meta.date_window)) issues.push('meta.date_window must be an object');
    if (!isObject(meta.counts)) issues.push("meta.counts must be an object");
  } else if ("meta" in data) {
    issues.push("meta must be an object");
  }

  for (const arrKey of ["summary", "instagram", "x_twitter"] as const) {
    if (arrKey in data && !Array.isArray(data[arrKey])) {
      issues.push(`${arrKey} must be an array`);
    }
  }

  // Spot-check the first record of each collection for its required fields.
  const igReq = ["anon_username", "comment_timestamp", "is_reply", "comment_text_cleaned"];
  const xReq = ["anon_username", "tweet_timestamp", "tweet_type", "tweet_text_cleaned"];
  checkFirst(data.instagram, igReq, "instagram", issues);
  checkFirst(data.x_twitter, xReq, "x_twitter", issues);

  if (issues.length > 0) throw new ReportValidationError(issues);
  return data as unknown as Report;
}

function checkFirst(arr: unknown, required: string[], label: string, issues: string[]): void {
  if (!Array.isArray(arr) || arr.length === 0) return;
  const first = arr[0];
  if (!isObject(first)) {
    issues.push(`${label}[0] is not an object`);
    return;
  }
  for (const field of required) {
    if (!(field in first)) issues.push(`${label}[0] is missing required field "${field}"`);
  }
}
