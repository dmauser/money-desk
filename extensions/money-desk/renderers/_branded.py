"""_branded.py — shared branded-block auto-styling for Money Desk renderers.

Used by make_html.py and make_pdf.py. Pure stdlib, zero deps.

After markdown2 produces HTML, run `apply_branded_blocks(html)` to wrap
common section patterns (Executive Summary, TL;DR, Headline Findings,
Verdict / Recommendation / Bottom-line callouts, Disclaimer notes) in
the brand CSS classes (`.executive-summary`, `.callout`, `.note`) so
every report — regardless of which specialist wrote it — gets the same
professional look without per-skill prompt changes.

Conservative + idempotent: only matches well-known leading patterns,
and detects already-wrapped blocks to skip them.
"""
from __future__ import annotations

__renderer_version__ = "0.21.1"
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

import re

# Headings that introduce an executive-summary block
_EXEC_HEADINGS = re.compile(
    r"<h2([^>]*)>\s*(Executive\s+Summary|TL;DR|Headline\s+Findings|"
    r"At\s+a\s+Glance|Summary\s+Dashboard|Snapshot|Bottom\s+Line\s+Up\s+Front|BLUF)"
    r"\s*</h2>",
    re.IGNORECASE,
)


def _classify_callout(p_html: str) -> str:
    """Return 'green' / 'amber' / '' based on emoji or keywords in the paragraph."""
    if "🟢" in p_html or "✅" in p_html:
        return "green"
    if "🟠" in p_html or "🟡" in p_html or "⚠️" in p_html or "⚠" in p_html:
        return "amber"
    if "🔴" in p_html or "❌" in p_html:
        return ""  # default red callout
    low = p_html.lower()
    if "favored" in low or "go ahead" in low or "approve" in low:
        return "green"
    if "caution" in low or "consider" in low or "borderline" in low or "watch" in low:
        return "amber"
    return ""


def _wrap_executive_summary(html_in: str) -> str:
    """Wrap each `<h2>Executive Summary|TL;DR|Headline Findings|...</h2>`
    plus the block immediately after it in `<div class="executive-summary">`."""
    out = []
    pos = 0
    for m in _EXEC_HEADINGS.finditer(html_in):
        # Skip if the heading already lives inside an executive-summary div
        prefix = html_in[:m.start()]
        last_open = prefix.rfind('<div class="executive-summary"')
        last_close = prefix.rfind("</div>")
        if last_open > last_close:
            continue
        out.append(html_in[pos:m.start()])
        # Find the end of the next sibling block (next h1/h2/h3 or end)
        rest = html_in[m.end():]
        next_h = re.search(r"<h[1-3][\s>]", rest)
        end_offset = m.end() + (next_h.start() if next_h else len(rest))
        block = html_in[m.start():end_offset]
        out.append(f'<div class="executive-summary">\n{block}\n</div>\n')
        pos = end_offset
    out.append(html_in[pos:])
    return "".join(out)


_CALLOUT_PARA_RE = re.compile(
    r"<p>\s*(?:<strong>)?\s*"
    r"(?:Verdict|Recommendation|Bottom\s+line|Decision|Headline|Key\s+takeaway)"
    r"\s*:\s*(?:</strong>)?\s*.*?</p>",
    re.IGNORECASE | re.DOTALL,
)


def _wrap_callouts(html_in: str) -> str:
    """Convert paragraphs that lead with Verdict: / Recommendation: /
    Bottom line: / Decision: / Headline: / Key takeaway: to a styled
    `<div class="callout [color]">...</div>` block."""
    def _convert(match):
        p_full = match.group(0)
        color = _classify_callout(p_full)
        cls = "callout" + (f" {color}" if color else "")
        if p_full.startswith("<p>") and p_full.endswith("</p>"):
            inner = p_full[3:-4]
        else:
            inner = p_full
        return f'<div class="{cls}">{inner}</div>'
    return _CALLOUT_PARA_RE.sub(_convert, html_in)


def _wrap_disclaimers(html_in: str) -> str:
    """Apply `.note` class to disclaimer paragraphs."""
    out = re.sub(
        r"<p>\s*(?:<strong>)?\s*(Disclaimer|Note)\s*:\s*(?:</strong>)?\s*",
        r'<p class="note"><strong>\1:</strong> ',
        html_in,
        flags=re.IGNORECASE,
    )
    out = re.sub(
        r"<p>\s*(<em>(?:Not\s+(?:legal|tax|financial|professional|investment)(?:\s+(?:legal|tax|financial|professional|investment))*\s+advice|"
        r"This\s+is\s+not\s+(?:legal|tax|financial|professional|investment)(?:\s+(?:legal|tax|financial|professional|investment))*\s+advice)[^<]*</em>)\s*</p>",
        r'<p class="note">\1</p>',
        out,
        flags=re.IGNORECASE,
    )
    return out


def apply_branded_blocks(html_in: str) -> str:
    """Run all three auto-styling passes. Order matters: executive-summary
    first (scopes the wrapping div), then callouts, then disclaimers."""
    out = _wrap_executive_summary(html_in)
    out = _wrap_callouts(out)
    out = _wrap_disclaimers(out)
    return out
