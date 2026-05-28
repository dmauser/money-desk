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
# Markdown -> PDF
python ./reports/_renderers/make_pdf.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --output ./reports/investing-advisor/portfolio_review_20260527.pdf \
  --specialist "Investing Advisor"

# Markdown -> HTML
python ./reports/_renderers/make_html.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --output ./reports/investing-advisor/portfolio_review_20260527.html \
  --specialist "Investing Advisor"

# Markdown -> DOCX
python ./reports/_renderers/make_docx.py \
  --input ./reports/investing-advisor/portfolio_review_20260527.md \
  --output ./reports/investing-advisor/portfolio_review_20260527.docx \
  --specialist "Investing Advisor"

# JSON spec -> XLSX (multi-sheet, with real formulas)
python ./reports/_renderers/make_xlsx.py \
  --spec ./reports/investing-advisor/portfolio_review_20260527.xlsx.json \
  --output ./reports/investing-advisor/portfolio_review_20260527.xlsx
```

The XLSX renderer takes a small JSON spec (Inputs sheet values + cell
formulas) rather than markdown, so the user can edit one input cell and see
all scenarios update — that's the whole point of producing a real model
rather than a static snapshot.
