#!/usr/bin/env python3
"""make_pdf.py - Money Desk PDF renderer (Playwright + Chromium + markdown2).

Install: pip install playwright markdown2 && python -m playwright install chromium
Usage:   python make_pdf.py --input report.md --specialist "Investing Advisor"
         # --output is optional; defaults to reports/<specialist-slug>/<input-stem>.pdf
         # override with: --output path/to/report.pdf  (or --outdir to change the base folder)

Brand defaults follow extensions/money-desk/data/preferences.yaml (report_quality.brand).
Do NOT switch to xhtml2pdf / reportlab / pdfkit / weasyprint - the policy
mandates Chromium for faithful CSS, tables, and emoji rendering.
"""
from __future__ import annotations

__renderer_version__ = "0.25.0"
def _warn_on_drift() -> None:
    """Soft-warn if our sibling RENDERERS_MANIFEST.json declares a different version.

    Never raises — legacy users without a manifest still work. The agent is
    expected to call ``md_renderers_sync`` to heal drift.
    """
    import json as _json, os as _os, sys as _sys
    p = _os.path.join(_os.path.dirname(__file__), "RENDERERS_MANIFEST.json")
    try:
        with open(p, "r", encoding="utf-8") as _fh:
            m = _json.load(_fh)
        ev = m.get("extension_version")
        if ev and ev != __renderer_version__:
            print(
                f"WARN  renderer drift: {_os.path.basename(__file__)} is "
                f"__renderer_version__ {__renderer_version__} but sibling "
                f"RENDERERS_MANIFEST.json declares {ev}. "
                f"Re-run md_renderers_sync.",
                file=_sys.stderr,
            )
    except Exception:
        pass


_warn_on_drift()
del _warn_on_drift

import argparse, asyncio, datetime, html, pathlib, re, sys

# Auto-styling helper (shared with make_html.py). Loaded relative to this script
# so the standalone CLI works whether run from the repo or copied to
# ./reports/_renderers/.
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _branded import apply_branded_blocks  # noqa: E402

# Matches optionally backslash-escaped HTML entity references:
#   &mdash;        -> em-dash
#   \&mdash;       -> em-dash (LLM-escaped form)
#   &amp;mdash;    -> em-dash (double-encoded; handled by stable-loop below)
_ENTITY_RE = re.compile(r"\\?&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});")


def decode_entities(text: str) -> str:
    """Normalize HTML entity references in markdown source to their Unicode chars.

    Why: markdown2 / markdown-it-py treat table-cell content as plain text and do
    not decode named entity references. If the LLM emits `&mdash;`, `\\&mdash;`,
    or `&amp;mdash;`, the entity name surfaces literally in the rendered PDF.
    Normalizing at the source produces real `-` / `x` / etc. in every output
    format (PDF, HTML, DOCX) without changing the renderer policy.
    """
    cur = text
    # Loop because `&amp;mdash;` -> `&mdash;` -> `-` needs two passes.
    for _ in range(3):
        new = _ENTITY_RE.sub(lambda m: html.unescape("&" + m.group(1) + ";"), cur)
        if new == cur:
            break
        cur = new
    return cur

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
tbody td { padding: 4pt 7pt; border-bottom: 0.5pt solid #ddd; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
thead th { background: var(--primary); color: white; text-align: left; padding: 5pt 7pt; overflow-wrap: anywhere; word-break: break-word; }
tbody tr:nth-child(even) { background: var(--stripe); }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
blockquote { border-left: 3pt solid var(--warn); background: #fff8e1; padding: 6pt 10pt; margin: 8pt 0; }
blockquote.green { border-left-color: var(--accent); background: #e8f5e9; }
blockquote.red { border-left-color: var(--risk); background: #fdecea; }
.executive-summary { background: #f3f7fb; border-left: 3pt solid var(--primary); padding: 10pt 14pt; margin: 8pt 0 14pt; border-radius: 2pt; }
.executive-summary h2, .executive-summary h3 { margin-top: 0; }
.callout { background: #fcefe1; border-left: 3pt solid var(--risk); color: #7a2118; padding: 8pt 12pt; margin: 8pt 0; font-weight: 600; border-radius: 2pt; }
.callout.green { background: #e8f5e9; border-left-color: var(--accent); color: #1b5e20; }
.callout.amber { background: #fff8e1; border-left-color: var(--warn); color: #6b4f00; }
.verdict { background: #fcefe1; border: 0.5pt solid #f1c2a3; padding: 10pt 14pt; margin: 12pt 0; border-radius: 3pt; font-size: 11pt; font-weight: 600; color: #7a2118; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140pt, 1fr)); gap: 8pt; margin: 8pt 0 12pt; }
.kpi { background: #f3f7fb; border: 0.5pt solid #d6deec; border-radius: 3pt; padding: 8pt 10pt; }
.kpi .label { color: #555; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.4pt; margin-bottom: 2pt; }
.kpi .value { color: var(--primary); font-size: 14pt; font-weight: 700; line-height: 1.1; }
.kpi .note { color: #555; font-size: 8.5pt; margin-top: 2pt; }
.note { color: #555; font-size: 9pt; font-style: italic; }
code, pre { font-family: 'Consolas', 'Menlo', monospace; font-size: 9.5pt; background: #f5f5f7; padding: 1pt 3pt; border-radius: 2pt; }
pre { padding: 6pt 8pt; overflow-x: auto; }
ul, ol { margin: 4pt 0 4pt 18pt; }
.disclaimer { color: #555; font-size: 9pt; border-top: 0.5pt solid #ccc; margin-top: 24pt; padding-top: 6pt; }
"""

HTML_SHELL = """<!doctype html>
<html><head><meta charset="utf-8"><title>__TITLE__</title><style>__CSS__</style></head>
<body>__BODY__</body></html>"""


def render_html(md_text: str, specialist: str, today: str) -> str:
    try:
        import markdown2
    except ImportError:
        sys.exit("ERROR: markdown2 not installed. Run: pip install markdown2")
    body = markdown2.markdown(decode_entities(md_text), extras=[
        "fenced-code-blocks", "tables", "strike", "task_list", "cuddled-lists",
        "header-ids", "footnotes", "code-friendly",
    ])
    body = apply_branded_blocks(body)
    css = BRAND_CSS.replace("__SPECIALIST__", specialist).replace("__DATE__", today)
    return HTML_SHELL.replace("__TITLE__", specialist).replace("__CSS__", css).replace("__BODY__", body)


async def html_to_pdf(html_str: str, out_path: pathlib.Path) -> None:
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        sys.exit("ERROR: playwright not installed. Run: pip install playwright && python -m playwright install chromium")
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch()
        except Exception as e:
            sys.exit(f"ERROR: could not launch Chromium ({e}). Run: python -m playwright install chromium")
        page = await browser.new_page()
        await page.set_content(html_str, wait_until="networkidle")
        await page.pdf(
            path=str(out_path),
            format="Letter",
            print_background=True,
            margin={"top": "0.55in", "right": "0.55in", "bottom": "0.55in", "left": "0.55in"},
        )
        await browser.close()


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")
    return s or "money-desk"


def resolve_output(output, specialist, stem, ext, outdir):
    """Return the explicit --output, or a structured default:
    <outdir>/<specialist-slug>/<stem>.<ext>."""
    if output is not None:
        return output
    return pathlib.Path(outdir) / _slugify(specialist) / f"{stem}.{ext}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a Money Desk markdown report to PDF.")
    ap.add_argument("--input", required=True, type=pathlib.Path)
    ap.add_argument("--output", type=pathlib.Path, default=None,
                    help="Output path. If omitted: reports/<specialist-slug>/<input-stem>.pdf")
    ap.add_argument("--outdir", default="money-desk",
                    help="Base dir used when --output is omitted (default: reports)")
    ap.add_argument("--specialist", default="Money Desk")
    args = ap.parse_args()

    md_text = args.input.read_text(encoding="utf-8")
    today = datetime.date.today().isoformat()
    page_html = render_html(md_text, args.specialist, today)

    out = resolve_output(args.output, args.specialist, args.input.stem, "pdf", args.outdir)
    out.parent.mkdir(parents=True, exist_ok=True)
    asyncio.run(html_to_pdf(page_html, out))

    size = out.stat().st_size
    print(f"OK  {out}  ({size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
