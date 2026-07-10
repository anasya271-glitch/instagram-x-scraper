#!/usr/bin/env node
/**
 * CLI entry point.
 *
 *   npx tsx src/main.ts --input <report.json> --output <dashboard.html>
 *
 * Reads the pipeline's JSON report, validates its shape, renders a single
 * self-contained HTML dashboard, and writes it to disk.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateReport, ReportValidationError } from "./validate";
import { renderHtml } from "./html";

interface Args {
  input: string;
  output: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    input: "../PCMB_Jabar_2026_Social_Intelligence_Report.json",
    output: "dashboard.html",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === "--input" || a === "-i") && argv[i + 1]) args.input = argv[++i]!;
    else if ((a === "--output" || a === "-o") && argv[i + 1]) args.output = argv[++i]!;
    else if (a === "--help" || a === "-h") {
      console.log("Usage: tsx src/main.ts --input <report.json> --output <dashboard.html>");
      process.exit(0);
    }
  }
  return args;
}

function main(): void {
  const { input, output } = parseArgs(process.argv.slice(2));
  const inPath = resolve(process.cwd(), input);
  const outPath = resolve(process.cwd(), output);

  let raw: string;
  try {
    raw = readFileSync(inPath, "utf-8");
  } catch {
    console.error(`✖ Could not read report JSON at: ${inPath}`);
    console.error("  Run the notebook first (it writes OUTPUT_JSON_PATH), or pass --input.");
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error(`✖ ${inPath} is not valid JSON: ${(e as Error).message}`);
    process.exit(1);
  }

  try {
    const report = validateReport(parsed);
    const html = renderHtml(report);
    writeFileSync(outPath, html, "utf-8");
    const n = report.instagram.length + report.x_twitter.length;
    console.log(`✔ Dashboard written to ${outPath}`);
    console.log(`  ${report.x_twitter.length} X + ${report.instagram.length} Instagram = ${n} records.`);
  } catch (e) {
    if (e instanceof ReportValidationError) {
      console.error(`✖ ${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}

main();
