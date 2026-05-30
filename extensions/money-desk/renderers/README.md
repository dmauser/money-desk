# Money Desk — Report Renderers

These four Python scripts implement the **Report Quality Rules** rendering
pipeline served by the `md_report_quality` tool. They are shipped with the
extension so every install gets the same, deterministic toolchain.

## How the agent uses them

1. The deliverable is **always** rendered as Markdown inline in the chat by
   default — these scripts are NOT invoked.
2. At the end of the deliverable, the agent **offers** PDF / DOCX / XLSX / HTML.
3. If the user accepts (or asked for a format up front), the agent:
   - Creates `./reports/_renderers/` in the current working directory the
     first time it's needed.
   - Copies the relevant script from `extensions/money-desk/renderers/` into
     `./reports/_renderers/`.
   - Installs the missing Python deps (see per-script header).
   - Runs the script to produce the file under `./reports/<specialist-slug>/`.

## Why local copies under `./reports/_renderers/`

So each project gets its own pinned copy and the agent doesn't rewrite the
renderers per task. Edit the local copy to tweak brand colors for one
project without touching the source-of-truth scripts in the extension.

## Scripts

| Script | Output | Stack | Install |
|--------|--------|-------|---------|
| `make_pdf.py`  | PDF  | Playwright + Chromium       | `pip install playwright markdown2 && python -m playwright install chromium` |
| `make_html.py` | HTML | markdown2 + inline CSS      | `pip install markdown2` |
| `make_xlsx.py` | XLSX | openpyxl, real formulas     | `pip install openpyxl` |
| `make_docx.py` | DOCX | python-docx, real styles    | `pip install python-docx markdown-it-py` |

## XLSX dashboard layout (Summary sheet convention)

Every shipped Summary sheet follows the **dashboard pattern** demonstrated by
`fire-planner/swr-stress-test/template.xlsx.json` and matches the look
required by the Money Desk brand:

```
Row 1 :  banner            → "<Skill Title>  -  Summary Dashboard"   (merged across all dashboard columns)
Row 2 :  subtitle          → "All figures driven by the Inputs sheet."
Row 4 :  header (×4)       → Metric | Value | Threshold | Status / Note
Row 5..N : metric / value_highlight / threshold / status   ← one per metric
Row N+2 : section_banner   → "Headline verdict"
Row N+3 : callout          → text formula composing the headline numbers
```

The required cell styles:

| `style`           | Use                                                            |
|-------------------|----------------------------------------------------------------|
| `banner`          | Full-width title row (primary blue fill, white bold 14pt)      |
| `section_banner`  | Sub-section header (primary blue fill, white bold 12pt)        |
| `subtitle`        | Italic gray caption beneath a banner                            |
| `header`          | Column header (primary blue, white bold, centered, thin border) |
| `metric`          | Left-aligned bold metric label, thin border                     |
| `value_highlight` | Light-green fill, bold right-aligned value, thin border         |
| `threshold`       | Centered benchmark text, thin border                            |
| `status`          | Bold right-aligned status text, thin border                     |
| `callout`         | Peach fill, bold red 11pt — used for the headline verdict       |

Sheet-level fields supported by `make_xlsx.py`:

```jsonc
{
  "name": "Summary",
  "column_widths": { "A": 38, "B": 16, "C": 14, "D": 28 },
  "row_heights":   { "1": 26, "2": 18, "16": 22, "17": 38 },
  "merges":        [ "A1:D1", "A2:D2", "A16:D16", "A17:D17" ],
  "cells": [ /* ... */ ]
}
```

Per-cell extras: `merge: "A1:D1"` and `border: true`. Apply merges *after*
writing values — never write to a non-top-left cell of a merged range.

## PDF / HTML branded blocks

`make_pdf.py` and `make_html.py` ship CSS classes the agent can wrap markdown
content in for brand-consistent emphasis:

| Class                 | Use                                                              |
|-----------------------|------------------------------------------------------------------|
| `executive-summary`   | Light-blue panel around the TL;DR / headline section             |
| `kpi-grid` + `kpi`    | Row of KPI cards (`.label` / `.value` / `.note` inner spans)     |
| `callout`             | Peach + bold red emphasis box (variants: `.green`, `.amber`)     |
| `verdict`             | Prominent peach verdict box at the end of a report               |
| `note`                | Inline italic gray sidenote                                      |

### Auto-styling (no markup required)

`_branded.py` — shared by `make_pdf.py` and `make_html.py` — runs an
**auto-styling pass** after markdown2 produces HTML so the agent doesn't
have to emit raw `<div class="...">` markup to get a professional look.
Every report from every specialist benefits automatically:

| Markdown pattern                                                   | Auto-applied class                                       |
|--------------------------------------------------------------------|----------------------------------------------------------|
| `## Executive Summary` / `## TL;DR` / `## Headline Findings` / `## At a Glance` / `## Snapshot` / `## BLUF` | wraps that heading + the next block in `<div class="executive-summary">` |
| Paragraph leading with `Verdict:` / `Recommendation:` / `Bottom line:` / `Decision:` / `Key takeaway:` | converts to `<div class="callout [color]">`              |
| Same paragraph contains `🟢` / `✅` / "favored"                    | adds `.green` modifier                                   |
| Same paragraph contains `🟠` / `🟡` / `⚠️` / "caution" / "borderline" | adds `.amber` modifier                                   |
| Paragraph leading with `Disclaimer:` / `Note:`                     | wraps in `<p class="note">`                              |
| `*Not professional/legal/tax/financial advice*` italic footer      | wraps in `<p class="note">`                              |

The agent can still emit explicit `<div class="kpi-grid">`, `<div class="verdict">`,
or other CSS-class wrappers when it needs more control — markdown2 passes
inline HTML through unchanged. Auto-styling is **idempotent**: already-wrapped
content is detected and left alone.

Example:

```html
<div class="executive-summary">
  <h2>TL;DR</h2>
  <p>Headline WR is 3.93%; SS-adjusted lifetime avg is 2.83%.</p>
</div>

<div class="kpi-grid">
  <div class="kpi"><div class="label">Headline WR</div><div class="value">3.93%</div></div>
  <div class="kpi"><div class="label">Coverage</div><div class="value">42y</div></div>
</div>

<div class="verdict">
  Bridge years (12 yrs) at 3.9% WR on 85% equity = primary sequence-risk exposure.
</div>
```

## Brand defaults (do not improvise)

Mirror the YAML `report_quality.brand`:

- Primary: `#1a4d8f`
- Accent green: `#2e7d32`
- Warning amber: `#d4a017`
- Risk red: `#c0392b`
- Row stripe: `#f5f7fb`
- Body font: Segoe UI / Helvetica, 10.5pt (PDF/HTML), 11pt (DOCX)
- Table font: 9.5pt
- Letter paper, 0.55in margins
- Footer: `Money Desk — <Specialist> · Page X of Y · <YYYY-MM-DD>`

## Usage examples

```bash
# Markdown -> PDF  (output path auto-derived: ./reports/investing-advisor/portfolio_review_20260527.pdf)
python ./reports/_renderers/make_pdf.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --specialist "Investing Advisor"

# Markdown -> HTML
python ./reports/_renderers/make_html.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --specialist "Investing Advisor"

# Markdown -> DOCX
python ./reports/_renderers/make_docx.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --specialist "Investing Advisor"

# JSON spec -> XLSX (multi-sheet, with real formulas)
python ./reports/_renderers/make_xlsx.py \
  --spec ./reports/investing-advisor/portfolio_review_20260527.xlsx.json \
  --specialist "Investing Advisor"
```

`--output` is optional — when omitted, each renderer writes to
`<outdir>/<specialist-slug>/<input-stem>.<ext>` with `--outdir` defaulting
to `reports`. Pass `--output path/to/file.<ext>` to override, or
`--outdir some/other/dir` to change the base folder.

The XLSX renderer takes a small JSON spec (Inputs sheet values + cell
formulas) rather than markdown, so the user can edit one input cell and see
all scenarios update — that's the whole point of producing a real model
rather than a static snapshot.

## XLSX templates (named ranges over coordinates)

`make_xlsx.py` accepts JSON specs with a top-level `named_ranges` array:

```jsonc
{
  "title": "Rent vs Buy — Dallas",
  "specialist": "Purchase Advisor",
  "named_ranges": [
    { "name": "mortgage_term_years", "ref": "Inputs!$B$4" },
    { "name": "mortgage_rate",       "ref": "Inputs!$B$5" },
    { "name": "loan_amount",         "ref": "Inputs!$B$11" }
  ],
  "sheets": [ /* ... */ ]
}
```

Formulas across all sheets address inputs by **name**, never by `A1`:

```jsonc
{ "ref": "B12", "formula": "=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)" }
```

This prevents the silent reference-pointing bug class (a Rent vs Buy
report once shipped with `=PMT(...holding_horizon...)` instead of
`...mortgage_term...`, off by 75%). The validator (`validate_named_ranges`)
rejects malformed refs, missing sheets, duplicate names, and reserved
Excel names.

### Canonical templates

Six high-frequency quantitative skills ship a `template.xlsx.json` next
to their `SKILL.md`:

| Specialist | Skill | Template |
|---|---|---|
| purchase-advisor | rent-vs-buy | `specialists/purchase-advisor/skills/rent-vs-buy/template.xlsx.json` |
| real-estate-investor | rental-property-analyzer | `.../rental-property-analyzer/template.xlsx.json` |
| real-estate-investor | mortgage-strategy-review | `.../mortgage-strategy-review/template.xlsx.json` |
| retirement-planner | withdrawal-strategy | `.../withdrawal-strategy/template.xlsx.json` |
| education-planner | college-cost-projection | `.../college-cost-projection/template.xlsx.json` |
| fire-planner | swr-stress-test | `.../swr-stress-test/template.xlsx.json` |

Each template pre-defines the Inputs schema, named ranges, and Summary
formulas. **Agents fill values only — never `A1` coordinates.** Adding a
new template requires only writing the JSON spec; the structural test
(`tests/test_all_templates.py`) auto-discovers it and asserts:

1. Schema validates.
2. At least one named range is declared.
3. No `Summary` formula references a raw cross-sheet coordinate.
4. Every named range roundtrips through `openpyxl.load_workbook`.

### Self-verification policy

`report_quality.self_verification` in `data/preferences.yaml` requires:

- Independently recomputing every headline figure in Python and asserting
  agreement within 1%.
- Recalculating the workbook (LibreOffice headless / Excel COM /
  `formulas`) before reading values — openpyxl alone does **not**
  evaluate formulas.
- Diffing every headline figure across markdown vs XLSX/DOCX.
- Flagging two differently-labeled cells with identical evaluated values
  as a likely reference-pointing bug.

The Python test suite under `extensions/money-desk/tests/` exercises the
schema, the validator, and the canonical Dallas Rent vs Buy regression
to lock in the fix.
