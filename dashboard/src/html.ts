/**
 * Assembles the final self-contained HTML dashboard: inline CSS, inline SVG
 * charts, and an embedded (dependency-free) client script for the filterable
 * table. Nothing is fetched at runtime, so the output file works offline and
 * can be emailed or committed as an artifact.
 */
import type { Report } from "./types";
import { hBarChart, dailyGroupedBars, tally, escapeHtml } from "./charts";
import { toUnifiedRows, dailyCounts } from "./transform";

/** JSON that is safe to inline inside a <script> tag. */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function statCard(label: string, value: string | number, hint = ""): string {
  return `<div class="stat">
    <div class="stat-value">${escapeHtml(String(value))}</div>
    <div class="stat-label">${escapeHtml(label)}</div>
    ${hint ? `<div class="stat-hint">${escapeHtml(hint)}</div>` : ""}
  </div>`;
}

export function renderHtml(report: Report): string {
  const rows = toUnifiedRows(report);
  const daily = dailyCounts(report);

  const igTotal = report.instagram.length;
  const xTotal = report.x_twitter.length;
  const igReplies = report.instagram.filter((r) => r.is_reply).length;
  const igComments = igTotal - igReplies;
  const xByType = tally(report.x_twitter.map((r) => r.tweet_type));
  const xByPattern = tally(report.x_twitter.map((r) => r.matched_pattern));

  const typeChart = hBarChart(xByType, { barColorVar: "--x" });
  const patternChart = hBarChart(xByPattern, { barColorVar: "--accent" });
  const igChart = hBarChart(
    [
      { label: "comments", value: igComments },
      { label: "replies", value: igReplies },
    ],
    { barColorVar: "--ig" },
  );
  const timeline = dailyGroupedBars(
    daily.days,
    { name: "X", values: daily.x, colorVar: "--x" },
    { name: "Instagram", values: daily.instagram, colorVar: "--ig" },
  );

  const meta = report.meta;
  const generated = meta?.generated_at ? new Date(meta.generated_at).toUTCString() : "unknown";
  const windowStr = meta?.date_window ? `${meta.date_window.start} → ${meta.date_window.end}` : "—";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PCMB / SPMB Jabar 2026 — Social Intelligence Dashboard</title>
<style>
  :root {
    --bg: #f6f7f9; --panel: #ffffff; --text: #1c2430; --muted: #64748b;
    --border: #e2e8f0; --accent: #1f4e78; --ig: #c13584; --x: #1d9bf0;
    --shadow: 0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0e131a; --panel: #161d27; --text: #e6edf3; --muted: #93a1b0;
      --border: #26303c; --accent: #4c8fce; --ig: #e0559e; --x: #4bb4f5;
      --shadow: none;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 28px 20px 64px; }
  header h1 { font-size: 22px; margin: 0 0 4px; }
  header .sub { color: var(--muted); font-size: 14px; }
  .meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 12px 0 4px;
    color: var(--muted); font-size: 13px; }
  .meta b { color: var(--text); font-weight: 600; }
  .grid { display: grid; gap: 16px; }
  .stats { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin: 20px 0; }
  .stat { background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px; box-shadow: var(--shadow); }
  .stat-value { font-size: 28px; font-weight: 700; letter-spacing: -.5px; }
  .stat-label { color: var(--muted); font-size: 13px; margin-top: 2px; }
  .stat-hint { color: var(--muted); font-size: 11px; margin-top: 6px; }
  .panels { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
    padding: 18px; box-shadow: var(--shadow); }
  .card h2 { font-size: 14px; margin: 0 0 14px; text-transform: uppercase;
    letter-spacing: .06em; color: var(--muted); }
  .full { grid-column: 1 / -1; }
  .chart { display: block; }
  .bar-label { fill: var(--text); font-size: 12px; }
  .bar-value { fill: var(--muted); font-size: 12px; }
  .axis { fill: var(--muted); font-size: 11px; }
  .axis-line { stroke: var(--border); stroke-width: 1; }
  .empty { color: var(--muted); font-style: italic; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; align-items: center; }
  .controls input, .controls select { background: var(--bg); color: var(--text);
    border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; font-size: 14px; }
  .controls input[type=search] { flex: 1; min-width: 180px; }
  .count { color: var(--muted); font-size: 13px; margin-left: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead th { text-align: left; color: var(--muted); font-weight: 600; border-bottom: 1px solid var(--border);
    padding: 8px 10px; position: sticky; top: 0; background: var(--panel); }
  tbody td { border-bottom: 1px solid var(--border); padding: 8px 10px; vertical-align: top; }
  tbody tr:hover { background: color-mix(in srgb, var(--accent) 6%, transparent); }
  .pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px;
    font-weight: 600; white-space: nowrap; }
  .pill.Instagram { background: color-mix(in srgb, var(--ig) 20%, transparent); color: var(--ig); }
  .pill.X { background: color-mix(in srgb, var(--x) 22%, transparent); color: var(--x); }
  .ttype { color: var(--muted); font-size: 11px; }
  .quoted { color: var(--muted); border-left: 2px solid var(--border); padding-left: 8px; margin-top: 4px;
    font-size: 12.5px; }
  .tablewrap { overflow-x: auto; }
  footer { margin-top: 28px; color: var(--muted); font-size: 12px; text-align: center; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>PCMB / SPMB Jabar 2026 — Social Intelligence Dashboard</h1>
    <div class="sub">Public sentiment on the West Java student-admission period, redacted &amp; anonymized.</div>
    <div class="meta">
      <span>Target: <b>${escapeHtml(meta?.ig_target_profile ?? "—")}</b></span>
      <span>Window: <b>${escapeHtml(windowStr)}</b></span>
      <span>Generated: <b>${escapeHtml(generated)}</b></span>
    </div>
  </header>

  <section class="grid stats">
    ${statCard("Total records", igTotal + xTotal)}
    ${statCard("X items", xTotal, "tweets · replies · quotes · threads")}
    ${statCard("Instagram", igTotal, `${igComments} comments · ${igReplies} replies`)}
    ${statCard("Days covered", daily.days.length)}
  </section>

  <section class="grid panels">
    <div class="card"><h2>X — by type</h2>${typeChart}</div>
    <div class="card"><h2>X — by matched pattern</h2>${patternChart}</div>
    <div class="card"><h2>Instagram — comments vs replies</h2>${igChart}</div>
    <div class="card full"><h2>Daily volume (X vs Instagram)</h2>${timeline}</div>
  </section>

  <section class="card full">
    <h2>Records</h2>
    <div class="controls">
      <select id="fPlatform">
        <option value="">All platforms</option>
        <option value="X">X only</option>
        <option value="Instagram">Instagram only</option>
      </select>
      <select id="fType"><option value="">All types</option></select>
      <input id="fSearch" type="search" placeholder="Search text…" />
      <span class="count" id="count"></span>
    </div>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Platform</th><th>User</th><th>When</th><th>Type</th><th>Group</th><th>Text</th></tr></thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </section>

  <footer>
    Generated by the PCMB/SPMB Jabar dashboard (TypeScript). Self-contained &amp; offline —
    no external requests. Usernames are anonymized; PII is redacted upstream.
  </footer>
</div>

<script>
  var ROWS = ${safeJson(rows)};
  var elBody = document.getElementById("tbody");
  var elPlatform = document.getElementById("fPlatform");
  var elType = document.getElementById("fType");
  var elSearch = document.getElementById("fSearch");
  var elCount = document.getElementById("count");

  // Populate the type filter from the data.
  var types = {};
  ROWS.forEach(function (r) { types[r.type] = true; });
  Object.keys(types).sort().forEach(function (t) {
    var o = document.createElement("option"); o.value = t; o.textContent = t; elType.appendChild(o);
  });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmtWhen(iso) { return String(iso || "").replace("T", " ").slice(0, 16); }

  function render() {
    var plat = elPlatform.value;
    var typ = elType.value;
    var q = elSearch.value.trim().toLowerCase();
    var html = "";
    var shown = 0;
    for (var i = 0; i < ROWS.length; i++) {
      var r = ROWS[i];
      if (plat && r.platform !== plat) continue;
      if (typ && r.type !== typ) continue;
      if (q && (r.text.toLowerCase().indexOf(q) === -1) && (r.quoted.toLowerCase().indexOf(q) === -1)) continue;
      shown++;
      var quoted = r.quoted ? '<div class="quoted">❝ ' + esc(r.quoted) + '</div>' : "";
      html +=
        "<tr><td><span class='pill " + esc(r.platform) + "'>" + esc(r.platform) + "</span></td>" +
        "<td>" + esc(r.user) + "</td>" +
        "<td>" + esc(fmtWhen(r.timestamp)) + "</td>" +
        "<td><span class='ttype'>" + esc(r.type) + "</span></td>" +
        "<td>" + esc(r.group) + "</td>" +
        "<td>" + esc(r.text) + quoted + "</td></tr>";
    }
    elBody.innerHTML = html || "<tr><td colspan='6' class='empty'>No records match the current filters.</td></tr>";
    elCount.textContent = shown + " / " + ROWS.length + " shown";
  }

  elPlatform.addEventListener("change", render);
  elType.addEventListener("change", render);
  elSearch.addEventListener("input", render);
  render();
</script>
</body>
</html>`;
}
