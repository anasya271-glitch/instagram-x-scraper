<div align="center">

# 🎓 PCMB & SPMB Jabar (West Java) 2026 Social Intelligence Pipeline

### Public sentiment & anomaly monitoring for the West Java 2026 student-admission period

*Mine public conversations from **Instagram** & **X (Twitter)**, filter them down to genuine SPMB/PCMB Jabar signal, and deliver a clean, **PII-redacted & anonymized** report; plus an interactive dashboard.*

<br/>

<!-- ─────────────  BADGES (rendered "buttons")  ───────────── -->
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Dashboard-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Instaloader](https://img.shields.io/badge/Instagram-Instaloader-E4405F?style=for-the-badge&logo=instagram&logoColor=white)
![twikit](https://img.shields.io/badge/X%20(Twitter)-twikit-000000?style=for-the-badge&logo=x&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Shielded%20scrape-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![Platforms](https://img.shields.io/badge/platforms-Instagram%20%7C%20X-blueviolet?style=flat-square)
![Privacy](https://img.shields.io/badge/privacy-PII%20redacted%20%2B%20anonymized-informational?style=flat-square)
![Cost](https://img.shields.io/badge/tooling-100%25%20free-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

<br/>

<!-- ─────────────  "OPEN IN COLAB" BUTTON  ─────────────
     Replace USER/REPO below with your GitHub path once pushed. -->
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/USER/REPO/blob/main/PCMB_Jabar_2026_Social_Intelligence_Pipeline.ipynb)

</div>

---

<!-- ─────────────  DEMO / SCREENSHOT  ─────────────
     Drop a screen-recording or dashboard screenshot into docs/ and uncomment:
     <div align="center"><img src="docs/demo.gif" alt="Pipeline demo" width="80%"/></div>
-->

> 🇬🇧 English · 🇮🇩 Bahasa Indonesia | the notebook ships **bilingual** in-app guidance for every step.

## 📑 Table of Contents

- [Features](#features) 
- [Architecture](#architecture)
- [Pipeline flow](#pipeline-flow)
- [Quick Start](#quick-start)
- [Output](#output)
- [Dashboard](#dashboard)
- [Privacy & Compliance](#privacy--compliance)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [Disclaimer](#disclaimer)

---

## Features

| | Feature | Details |
|:-:|---|---|
| 1. | **Instagram (Instaloader)** | Public comments **+ up to 5 replies each** on `@disdikjabar` posts. Two-phase: fast caption scan → deep comment mining. |
| 2. | **X / Twitter (twikit)** | **Tweets, replies & quote tweets** about SPMB/PCMB Jabar. Retweets excluded. Optional thread expansion groups replies under a shared `thread_group`. |
| 3. | **Precision filtering** | DNF keyword matrix **+ mandatory West-Java geo-fence** kills national-program false positives. |
| 4. | **Content-safe** | No raw external text ever written to logs; spam / adult / off-topic noise filtered out. |
| 5. | **Privacy by design** | Regex PII redaction **+** per-platform username anonymization **before** anything hits disk. |
| 6. | **Platform switch** | `RUN_PLATFORMS = "both" \| "instagram" \| "x"` or `run_pipeline("x")`. |
| 7. | **Rich output** | Multi-sheet **Excel** + structured **JSON** + full **audit log** with per-decision telemetry. |
| 8. | **Dashboard** | Zero-dependency **TypeScript** tool renders a self-contained interactive HTML report. |
| 9. | **Colab-ready** | Runs end-to-end in Google Colab; resilient hot-fixes for upstream library drift. |
| 10. | **100% free tooling** | No paid APIs or proxies. |

---

## Architecture

```mermaid
flowchart TD
    A["⚙️ Global Configuration<br/>target · date window · RUN_PLATFORMS · keywords"] --> R{{"run_pipeline()"}}

    R -->|instagram / both| IG["Instagram Module"]
    R -->|x / both| X["X / Twitter Module"]

    subgraph IGP ["Instagram · Instaloader + Playwright"]
        IG --> IG1["Phase 1: caption scan<br/>find relevant posts"]
        IG1 --> IG2["Phase 2: comment mining<br/>comments + ≤5 replies"]
    end

    subgraph XP ["X · twikit (hot-fixed)"]
        X --> X1["Search: tweets / replies / quotes<br/>retweets excluded"]
        X1 --> X2["Thread expansion<br/>replies grouped by thread_group"]
    end

    IG2 --> F["Filter Engine<br/>keyword matrix + geo-fence + date window"]
    X2 --> F
    F --> P["Privacy Layer<br/>PII redaction + anonymization"]
    P --> O["Exporters"]
    O --> XLSX["Excel report"]
    O --> JSON["JSON report"]
    O --> LOG["Audit log + telemetry"]
    JSON --> DASH["TypeScript dashboard<br/>self-contained HTML"]
```

---

## Pipeline flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Analyst
    participant N as Notebook
    participant IG as Instagram
    participant X as X/Twitter
    participant R as Report

    U->>N: Upload session + cookies, set config
    N->>IG: Scan captions → mine comments (+replies)
    IG-->>N: Redacted, anonymized comments
    N->>X: Search + expand threads (tweets/replies/quotes)
    X-->>N: Redacted, anonymized tweets
    N->>R: Excel + JSON + audit log
    U->>R: Download & open dashboard
```

---

## Quick Start

### Option A — Google Colab (recommended)

1. **Prepare auth once, on your home connection** (never from Colab's data-center IP):
   ```bash
   # Instagram session
   pip install instaloader
   instaloader --login=YOUR_BOT_ACCOUNT
   ```
   For X, run the *“Recommended: pre-authenticate X”* cell to create `x_cookies.json`.
   > Use a **secondary / bot account** for both — never a primary account.
2. Open the notebook in Colab (badge above) and **Run all**.
3. Upload `session-YOUR_BOT_ACCOUNT` and `x_cookies.json` into `/content/`.
4. Fill in the **Global Configuration** cell, then run **Main Orchestration**.
5. Download the `.xlsx`, `.json`, and `pipeline_audit_log.txt` from `/content/`.

### Option B — Local

```bash
pip install -q --upgrade instaloader openpyxl emoji twikit selenium webdriver-manager nest_asyncio lxml playwright pandas
python -m playwright install chromium
# then run the notebook in Jupyter / VS Code
```

### Scrape one platform only

```python
RUN_PLATFORMS = "x"        # in the config cell  →  or "instagram" / "both"
# ...or per-call:
summary = run_pipeline("instagram")
```

---

## Output

A single Excel workbook + a matching JSON twin:

| Sheet | Contents |
|---|---|
| **`Summary_Statistics`** | Run metadata + every telemetry counter (kept vs. each drop reason) — a fully auditable record. |
| **`X_Twitter`** | `anon_username`, `tweet_timestamp`, `tweet_type` (tweet/reply/quote), `matched_pattern`, `thread_group`, `tweet_text_cleaned`, `quoted_text_cleaned`. |
| **`Instagram`** | `anon_username`, `post_shortcode`, `comment_timestamp`, `is_reply`, `comment_text_cleaned`. |

Plus `pipeline_audit_log.txt` — a timestamped, per-decision trail (counts only, never raw external text).

---

## Dashboard

A **standalone, dependency-free TypeScript** tool turns the JSON report into a single self-contained, interactive HTML page (charts + filterable/searchable table) — it only *reads* already-scraped data, so it never touches the platforms or uses credentials.

```bash
cd dashboard
npm install
npm run demo        # renders sample data → dashboard.html
# real data:
npx tsx src/main.ts --input ../PCMB_Jabar_2026_Social_Intelligence_Report.json --output dashboard.html
```

<details>
<summary>What's inside the dashboard</summary>

- Stat cards (totals, comments vs. replies, days covered)
- Charts (X by type, X by matched pattern, daily volume timeline)
- Unified, filterable record table across both platforms
- Light/dark theme, works offline, no CDN

</details>

---

## Privacy & Compliance

- **Two layers before persistence** — regex PII redaction (phone, email, NIK, address, mentions, honorific+name) **+** sequential username anonymization (`User_001`, …). The real→token map lives in memory only.
- **Content-safe logging** — the audit log stores counts and decisions, **never** raw tweet/comment text.
- **Public data only**, collection volume kept modest.

---

## Project Structure

```
instagram_x_scraper/
├── PCMB_Jabar_2026_..._Pipeline.ipynb   #  main notebook (bilingual EN/ID guidance)
├── dashboard/                           #  standalone TypeScript dashboard
│   ├── src/                             #  types · validate · transform · charts · html · main
│   ├── sample/sample-report.json        #  demo data
│   └── report.schema.json               #  JSON-Schema contract
├── core_pipeline/                       #  maintenance helpers
├── architecture/                        #  reference HTML captures
├── session-…                            #  Instaloader session (you provide)
├── x_cookies.json                       #  X cookies (you provide)
└── README.md
```

---

## Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?logo=jupyter&logoColor=white)
![Instaloader](https://img.shields.io/badge/Instaloader-E4405F?logo=instagram&logoColor=white)
![twikit](https://img.shields.io/badge/twikit-000000?logo=x&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-150458?logo=pandas&logoColor=white)
![openpyxl](https://img.shields.io/badge/openpyxl-1D6F42?logo=microsoftexcel&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Google Colab](https://img.shields.io/badge/Colab-F9AB00?logo=googlecolab&logoColor=white)

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Instagram `Checkpoint required` | Login challenged from Colab IP | Regenerate the session on your home connection, re-upload |
| **X returns 0**, high `x_dropped_out_of_window` | Date window ≠ where data exists | Widen `DATE_START` / `DATE_END` |
| **X returns 0**, high `x_dropped_no_keyword_match` | Filters too strict for results | Review keyword matrix / queries |
| X `KEY_BYTE` / `404` / login errors | `twikit` drifted behind X | Hot-fix cell handles known cases; regenerate `x_cookies.json` if it persists |

> 💡 Always open `pipeline_audit_log.txt` first — the telemetry counters pinpoint which filter or date window is responsible.

---

## Disclaimer

This project collects **public** data for research / public-interest monitoring. Automated collection sits in a legal gray area under each platform's Terms of Service even when the data is public. Redaction and anonymization are mitigations, not a compliance guarantee. Use responsibly, keep volume modest, and prefer official APIs where a contract requires strict compliance.

<div align="center">

**MIT License** · Built for the PCMB/SPMB Jabar 2026 monitoring brief

<sub>Made with Python 🐍 + TypeScript 🔷 · runs free on Google Colab ☁️</sub>

</div>
