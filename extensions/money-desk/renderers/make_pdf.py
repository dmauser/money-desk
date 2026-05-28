#!/usr/bin/env python3
"""make_pdf.py - Money Desk PDF renderer (Playwright + Chromium + markdown2).

Install: pip install playwright markdown2 && python -m playwright install chromium
Usage:   python make_pdf.py --input report.md --output report.pdf --specialist "Investing Advisor"

Brand defaults follow extensions/money-desk/data/preferences.yaml (report_quality.brand).
Do NOT switch to xhtml2pdf / reportlab / pdfkit / weasyprint - the policy
mandates Chromium for faithful CSS, tables, and emoji rendering.
"""
from __future__ import annotations
import argparse, asyncio, datetime, pathlib, sys

BRAND_CSS = """
:root {
  --primary:   #1a4d8f;
  --accent:    #2e7d32;
  --warn:      #d4a017;
  --risk:      #c0392b;
  --stripe:    #f5f7fb;
}
@page {
  size: Letter;
  margin: 0.55in;
  @bottom-center { content: "Money Desk - __SPECIALIST__ - Page " counter(page) " of " counter(pages) " - __DATE__"; font: 9pt 'Segoe UI', Helvetica, sans-serif; color: #555; }
}
body { font: 10.5pt 'Segoe UI', Helvetica, Arial, sans-serif; color: #1d1d1f; line-height: 1.45; }
h1 { color: var(--primary); font-size: 22pt; margin: 0 0 6pt; border-bottom: 2pt solid var(--primary); padding-bottom: 4pt; }
h2 { color: var(--primary); font-size: 14pt; margin: 18pt 0 6pt; }
h3 { color: #2c3e50; font-size: 11.5pt; margin: 12pt 0 4pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.5pt; }
thead th { background: var(--primary); color: white; text-align: left; padding: 5pt 7pt; }
tbody td { padding: 4pt 7pt; border-bottom: 0.5pt solid #ddd; vertical-align: top; }
tbody tr:nth-child(even) { background: var(--stripe); }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
blockquote { border-left: 3pt solid var(--warn); background: #fff8e1; padding: 6pt 10pt; margin: 8pt 0; }
blockquote.green { border-left-color: var(--accent); background: #e8f5e9; }
blockquote.red { border-left-color: var(--risk); background: #fdecea; }
code, pre { font-family: 'Consolas', 'Menlo', monospace; font-size: 9.5pt; background: #f5f5f7; padding: 1pt 3pt; border-radius: 2pt; }
pre { padding: 6pt 8pt; overflow-x: auto; }
ul, ol { margin: 4pt 0 4pt 18pt; }
.disclaimer { color: #555; font-size: 9pt; border-top: 0.5pt solid #ccc; margin-top: 24pt; padding-top: 6pt; }
"""

HTML_SHELL = """<!doctype html>
<html><head><meta charset="utf-8"><title>__TITLE__</title><style>__CSS__</style></head>
<body>__BODY__</body></html>"""


def render_html(md_text: str, specialist: str, today: str) -> str:
    import markdown2
    body = markdown2.markdown(md_text, extras=[
        "fenced-code-blocks", "tables", "strike", "task_list", "cuddled-lists",
        "header-ids", "footnotes", "code-friendly",
    ])
    css = BRAND_CSS.replace("__SPECIALIST__", specialist).replace("__DATE__", today)
    return HTML_SHELL.replace("__TITLE__", specialist).replace("__CSS__", css).replace("__BODY__", body)


async def html_to_pdf(html: str, out_path: pathlib.Path) -> None:
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html, wait_until="networkidle")
        await page.pdf(
            path=str(out_path),
            format="Letter",
            print_background=True,
            margin={"top": "0.55in", "right": "0.55in", "bottom": "0.55in", "left": "0.55in"},
        )
        await browser.close()


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a Money Desk markdown report to PDF.")
    ap.add_argument("--input", required=True, type=pathlib.Path)
    ap.add_argument("--output", required=True, type=pathlib.Path)
    ap.add_argument("--specialist", default="Money Desk")
    args = ap.parse_args()

    md_text = args.input.read_text(encoding="utf-8")
    today = datetime.date.today().isoformat()
    html = render_html(md_text, args.specialist, today)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    asyncio.run(html_to_pdf(html, args.output))

    size = args.output.stat().st_size
    print(f"OK  {args.output}  ({size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
