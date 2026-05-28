#!/usr/bin/env python3
"""make_html.py - Money Desk standalone HTML renderer.

Install: pip install markdown2
Usage:   python make_html.py --input report.md --output report.html --specialist "Investing Advisor"

Produces a single .html file that is BOTH viewable in a browser and printable
with the same brand styling as the PDF renderer.
"""
from __future__ import annotations
import argparse, datetime, pathlib, sys

BRAND_CSS = """
:root {
  --primary:   #1a4d8f;
  --accent:    #2e7d32;
  --warn:      #d4a017;
  --risk:      #c0392b;
  --stripe:    #f5f7fb;
}
@media print {
  @page { size: Letter; margin: 0.55in; }
}
body { font: 10.5pt 'Segoe UI', Helvetica, Arial, sans-serif; color: #1d1d1f; line-height: 1.5; max-width: 8.5in; margin: 0 auto; padding: 0.55in; }
h1 { color: var(--primary); font-size: 22pt; margin: 0 0 6pt; border-bottom: 2pt solid var(--primary); padding-bottom: 4pt; }
h2 { color: var(--primary); font-size: 14pt; margin: 18pt 0 6pt; }
h3 { color: #2c3e50; font-size: 11.5pt; margin: 12pt 0 4pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.5pt; }
thead th { background: var(--primary); color: white; text-align: left; padding: 6pt 8pt; }
tbody td { padding: 5pt 8pt; border-bottom: 0.5pt solid #ddd; vertical-align: top; }
tbody tr:nth-child(even) { background: var(--stripe); }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
blockquote { border-left: 3pt solid var(--warn); background: #fff8e1; padding: 6pt 10pt; margin: 8pt 0; }
blockquote.green { border-left-color: var(--accent); background: #e8f5e9; }
blockquote.red { border-left-color: var(--risk); background: #fdecea; }
code, pre { font-family: 'Consolas', 'Menlo', monospace; font-size: 9.5pt; background: #f5f5f7; padding: 1pt 3pt; border-radius: 2pt; }
pre { padding: 6pt 8pt; overflow-x: auto; }
.footer { color: #555; font-size: 9pt; border-top: 0.5pt solid #ccc; margin-top: 24pt; padding-top: 6pt; text-align: center; }
"""

HTML_SHELL = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>__TITLE__</title>
  <style>__CSS__</style>
</head>
<body>
__BODY__
<p class="footer">Money Desk - __SPECIALIST__ - __DATE__</p>
</body>
</html>"""


def render(md_text: str, specialist: str, today: str) -> str:
    import markdown2
    body = markdown2.markdown(md_text, extras=[
        "fenced-code-blocks", "tables", "strike", "task_list", "cuddled-lists",
        "header-ids", "footnotes", "code-friendly",
    ])
    return (
        HTML_SHELL.replace("__TITLE__", specialist)
        .replace("__CSS__", BRAND_CSS)
        .replace("__BODY__", body)
        .replace("__SPECIALIST__", specialist)
        .replace("__DATE__", today)
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a Money Desk markdown report to standalone HTML.")
    ap.add_argument("--input", required=True, type=pathlib.Path)
    ap.add_argument("--output", required=True, type=pathlib.Path)
    ap.add_argument("--specialist", default="Money Desk")
    args = ap.parse_args()

    md_text = args.input.read_text(encoding="utf-8")
    today = datetime.date.today().isoformat()
    html = render(md_text, args.specialist, today)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html, encoding="utf-8")

    size = args.output.stat().st_size
    print(f"OK  {args.output}  ({size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
