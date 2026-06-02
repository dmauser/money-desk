#!/usr/bin/env python3
"""make_html.py - Money Desk standalone HTML renderer.

Install: pip install markdown2
Usage:   python make_html.py --input report.md --specialist "Investing Advisor"
         # --output is optional; defaults to reports/<specialist-slug>/<input-stem>.html
         # override with: --output path/to/report.html  (or --outdir to change the base folder)

Produces a single self-contained .html file (inline CSS, no external links) that
is BOTH viewable in a browser and printable with the same brand styling as the
PDF renderer.
"""
from __future__ import annotations

__renderer_version__ = "0.19.7"
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

import argparse, datetime, html, pathlib, re, sys

# Auto-styling helper (shared with make_pdf.py). Loaded relative to this script
# so the standalone CLI works whether run from the repo or copied to
# ./reports/_renderers/.
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _branded import apply_branded_blocks  # noqa: E402

_ENTITY_RE = re.compile(r"\\?&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});")


def decode_entities(text: str) -> str:
    """Normalize HTML entity references in markdown source to their Unicode chars.

    See make_pdf.py for full rationale. Keeps PDF/HTML/DOCX renderers in parity:
    `&mdash;` / `\\&mdash;` / `&amp;mdash;` all become a real em-dash before
    markdown2 sees them, so they never surface literally in the output.
    """
    cur = text
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
@media print {
  @page { size: Letter; margin: 0.55in; }
}
body { font: 10.5pt 'Segoe UI', Helvetica, Arial, sans-serif; color: #1d1d1f; line-height: 1.5; max-width: 8.5in; margin: 0 auto; padding: 0.55in; }
h1 { color: var(--primary); font-size: 22pt; margin: 0 0 6pt; border-bottom: 2pt solid var(--primary); padding-bottom: 4pt; }
h2 { color: var(--primary); font-size: 14pt; margin: 18pt 0 6pt; }
h3 { color: #2c3e50; font-size: 11.5pt; margin: 12pt 0 4pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.5pt; }
thead th { background: var(--primary); color: white; text-align: left; padding: 6pt 8pt; overflow-wrap: anywhere; word-break: break-word; }
tbody td { padding: 5pt 8pt; border-bottom: 0.5pt solid #ddd; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
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
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin: 8pt 0 12pt; }
.kpi { background: #f3f7fb; border: 1px solid #d6deec; border-radius: 4px; padding: 10px 12px; }
.kpi .label { color: #555; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.4pt; margin-bottom: 2pt; }
.kpi .value { color: var(--primary); font-size: 16pt; font-weight: 700; line-height: 1.1; }
.kpi .note { color: #555; font-size: 9pt; margin-top: 2pt; }
.note { color: #555; font-size: 9pt; font-style: italic; }
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
    try:
        import markdown2
    except ImportError:
        sys.exit("ERROR: markdown2 not installed. Run: pip install markdown2")
    body = markdown2.markdown(decode_entities(md_text), extras=[
        "fenced-code-blocks", "tables", "strike", "task_list", "cuddled-lists",
        "header-ids", "footnotes", "code-friendly",
    ])
    body = apply_branded_blocks(body)
    return (
        HTML_SHELL.replace("__TITLE__", specialist)
        .replace("__CSS__", BRAND_CSS)
        .replace("__BODY__", body)
        .replace("__SPECIALIST__", specialist)
        .replace("__DATE__", today)
    )


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
    ap = argparse.ArgumentParser(description="Render a Money Desk markdown report to standalone HTML.")
    ap.add_argument("--input", required=True, type=pathlib.Path)
    ap.add_argument("--output", type=pathlib.Path, default=None,
                    help="Output path. If omitted: reports/<specialist-slug>/<input-stem>.html")
    ap.add_argument("--outdir", default="money-desk",
                    help="Base dir used when --output is omitted (default: reports)")
    ap.add_argument("--specialist", default="Money Desk")
    args = ap.parse_args()

    md_text = args.input.read_text(encoding="utf-8")
    today = datetime.date.today().isoformat()
    page_html = render(md_text, args.specialist, today)

    out = resolve_output(args.output, args.specialist, args.input.stem, "html", args.outdir)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page_html, encoding="utf-8")

    size = out.stat().st_size
    print(f"OK  {out}  ({size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
