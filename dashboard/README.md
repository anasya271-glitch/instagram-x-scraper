# PCMB / SPMB Jabar 2026 — Dashboard (TypeScript)

A small, dependency‑free **TypeScript** tool that turns the Python scraper's JSON
report into a single **self‑contained, interactive HTML dashboard** — charts plus
a searchable/filterable record table. No runtime dependencies, no CDN, no network
calls: the output `.html` works offline and can be emailed or committed as an
artifact.

It is intentionally decoupled from the Python pipeline: the notebook scrapes and
writes `PCMB_Jabar_2026_Social_Intelligence_Report.json`; this tool only *reads*
that file. So it never touches Instagram/X, never uses credentials, and can't
affect rate limits.

## Quick start

```bash
cd dashboard
npm install

# Try it on the bundled sample data:
npm run demo          # writes dashboard.html from sample/sample-report.json

# Or point it at a real report exported by the notebook:
npx tsx src/main.ts --input ../PCMB_Jabar_2026_Social_Intelligence_Report.json --output dashboard.html
```

Open the generated `dashboard.html` in any browser.

## Scripts

| Script | What it does |
|---|---|
| `npm run typecheck` | `tsc --noEmit` — strict type check, no output |
| `npm run build` | `tsc` — compile to `dist/` |
| `npm start` | `node dist/main.js` (after `build`) |
| `npm run dev` | run `src/main.ts` directly via `tsx` |
| `npm run demo` | render the bundled sample to `dashboard.html` |

CLI flags: `--input/-i <report.json>` (default `../PCMB_Jabar_2026_Social_Intelligence_Report.json`),
`--output/-o <dashboard.html>` (default `dashboard.html`).

## What it shows

- **Stat cards** — total records, X items, Instagram comments vs replies, days covered.
- **Charts** (hand‑rolled inline SVG): X by type, X by matched pattern, Instagram
  comments vs replies, and a daily‑volume timeline (X vs Instagram).
- **Records table** — unified across both platforms, filterable by platform and
  type, with free‑text search across tweet/comment text (and quoted text).

## Layout

```
dashboard/
├─ src/
│  ├─ types.ts       # typed models mirroring the report JSON
│  ├─ validate.ts    # zero-dependency runtime validation
│  ├─ transform.ts   # pure data transforms (unified rows, daily counts)
│  ├─ charts.ts      # pure SVG chart builders
│  ├─ html.ts        # assembles the self-contained HTML document
│  └─ main.ts        # CLI entry point
├─ report.schema.json  # JSON Schema (draft-07) for the report contract
├─ sample/sample-report.json
└─ package.json / tsconfig.json
```

The report contract is defined twice on purpose: once as TypeScript interfaces
(`src/types.ts`, compile‑time) and once as JSON Schema (`report.schema.json`,
tool‑agnostic). `src/validate.ts` enforces it at runtime with no dependencies.
