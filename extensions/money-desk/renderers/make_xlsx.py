#!/usr/bin/env python3
"""make_xlsx.py - Money Desk Excel workbook renderer (with REAL formulas).

Install: pip install openpyxl
Usage:   python make_xlsx.py --spec spec.json --specialist "Investing Advisor"
         # --output is optional; defaults to reports/<specialist-slug>/<spec-stem>.xlsx
         # override with: --output path/to/report.xlsx  (or --outdir to change the base folder)

Spec format (JSON) - multi-sheet workbook with real formulas:
{
  "title": "Portfolio Review - 2026-05-27",
  "specialist": "Investing Advisor",
  "named_ranges": [
    {"name": "mortgage_term_years", "ref": "Inputs!$B$4"},
    {"name": "mortgage_rate",       "ref": "Inputs!$B$5"},
    {"name": "loan_amount",         "ref": "Inputs!$B$11"}
  ],
  "sheets": [
    {
      "name": "Summary",
      "cells": [
        {"ref": "A1", "value": "Headline", "style": "h1"},
        {"ref": "A3", "value": "Monthly P&I"},
        {"ref": "B3", "formula": "=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)", "number_format": "$#,##0"}
      ]
    },
    {
      "name": "Inputs",
      "headers": ["Holding", "Value", "Account", "ER"],
      "rows": [["VTI", 100000, "Taxable", 0.0003], ["BND", 50000, "401k", 0.0003]]
    }
  ]
}

The policy mandates REAL formulas (=SUM, =IF, =NPV, =FV, =PMT) - never
hard-coded computed values - so the user can edit one Inputs cell and see
the Summary / Scenarios sheets update automatically.

NAMED RANGES (required for any spec with computed Summary cells): declare
inputs at the top of the spec and reference them by name in formulas.
This eliminates the off-by-one A1-coordinate class of bug (e.g., a Rent
vs Buy report where Summary!B12 pointed at Inputs!B6 holding_horizon
instead of Inputs!B4 mortgage_term, off by 75%). Skill templates under
extensions/money-desk/specialists/*/skills/*/template.xlsx.json codify
this for the highest-frequency quantitative deliverables.
"""
from __future__ import annotations
import argparse, json, pathlib, re, sys

PRIMARY = "1A4D8F"
STRIPE = "F5F7FB"
VALUE_GREEN = "E2EFDA"
CALLOUT_PEACH = "FCE4D6"
RISK_RED = "C0392B"
SUBTITLE_GRAY = "595959"
BORDER_GRAY = "BFBFBF"


def _thin_border():
    from openpyxl.styles import Border, Side
    side = Side(style="thin", color=BORDER_GRAY)
    return Border(left=side, right=side, top=side, bottom=side)


def style_header(cell):
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, color="FFFFFF", size=11)
    cell.fill = PatternFill("solid", fgColor=PRIMARY)
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = _thin_border()


def style_h1(cell):
    from openpyxl.styles import Font
    cell.font = Font(name="Segoe UI", bold=True, color=PRIMARY, size=14)


def style_body(cell):
    from openpyxl.styles import Font
    cell.font = Font(name="Segoe UI", size=10)


def style_banner(cell):
    """Full-width section title: solid primary fill, white bold 14pt, padded."""
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, color="FFFFFF", size=14)
    cell.fill = PatternFill("solid", fgColor=PRIMARY)
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)


def style_section_banner(cell):
    """Sub-section title within a sheet: same brand fill, 12pt."""
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, color="FFFFFF", size=12)
    cell.fill = PatternFill("solid", fgColor=PRIMARY)
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)


def style_subtitle(cell):
    """Italic gray caption beneath a banner."""
    from openpyxl.styles import Font, Alignment
    cell.font = Font(name="Segoe UI", italic=True, color=SUBTITLE_GRAY, size=10)
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)


def style_metric(cell):
    """Bold left-aligned metric label cell with thin border."""
    from openpyxl.styles import Font, Alignment
    cell.font = Font(name="Segoe UI", bold=True, size=10)
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    cell.border = _thin_border()


def style_value_highlight(cell):
    """Light-green-filled, bold, right-aligned value cell with thin border."""
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, size=10)
    cell.fill = PatternFill("solid", fgColor=VALUE_GREEN)
    cell.alignment = Alignment(horizontal="right", vertical="center", indent=1)
    cell.border = _thin_border()


def style_threshold(cell):
    """Centered threshold cell with thin border, regular weight."""
    from openpyxl.styles import Font, Alignment
    cell.font = Font(name="Segoe UI", size=10, color="333333")
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = _thin_border()


def style_status(cell):
    """Bold right-aligned status cell with thin border."""
    from openpyxl.styles import Font, Alignment
    cell.font = Font(name="Segoe UI", bold=True, size=10)
    cell.alignment = Alignment(horizontal="right", vertical="center", indent=1)
    cell.border = _thin_border()


def style_callout(cell):
    """Peach-filled bold red callout box for headline verdicts."""
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, size=11, color=RISK_RED)
    cell.fill = PatternFill("solid", fgColor=CALLOUT_PEACH)
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1, wrap_text=True)


_STYLE_DISPATCH = {
    "h1": style_h1,
    "header": style_header,
    "body": style_body,
    "banner": style_banner,
    "section_banner": style_section_banner,
    "subtitle": style_subtitle,
    "metric": style_metric,
    "value_highlight": style_value_highlight,
    "threshold": style_threshold,
    "status": style_status,
    "callout": style_callout,
}


def _apply_style(cell, style_name: str) -> None:
    fn = _STYLE_DISPATCH.get(style_name, style_body)
    fn(cell)


def build_sheet(wb, spec: dict) -> None:
    ws = wb.create_sheet(title=spec["name"][:31])

    if "headers" in spec and "rows" in spec:
        for col_idx, h in enumerate(spec["headers"], start=1):
            c = ws.cell(row=1, column=col_idx, value=h)
            style_header(c)
        for row_idx, row in enumerate(spec["rows"], start=2):
            for col_idx, val in enumerate(row, start=1):
                c = ws.cell(row=row_idx, column=col_idx, value=val)
                style_body(c)
                if isinstance(val, (int, float)) and col_idx > 1:
                    if abs(val) < 1 and val != 0:
                        c.number_format = "0.00%"
                    else:
                        c.number_format = "$#,##0"
        ws.freeze_panes = "A2"
        for col_idx in range(1, len(spec["headers"]) + 1):
            ws.column_dimensions[ws.cell(row=1, column=col_idx).column_letter].width = 18

    # Per-cell merges to apply *after* values are written, so we never write into
    # a non-top-left cell of a merged range (openpyxl forbids it).
    deferred_merges: list[str] = []

    for cell_spec in spec.get("cells", []):
        ref = cell_spec["ref"]
        c = ws[ref]
        if "formula" in cell_spec:
            c.value = cell_spec["formula"]
        elif "value" in cell_spec:
            c.value = cell_spec["value"]
        nf = cell_spec.get("number_format")
        if nf:
            c.number_format = nf
        style_name = cell_spec.get("style", "body")
        _apply_style(c, style_name)
        if cell_spec.get("border") is True:
            c.border = _thin_border()
        if "merge" in cell_spec:
            deferred_merges.append(cell_spec["merge"])

    for col_letter, width in spec.get("column_widths", {}).items():
        ws.column_dimensions[col_letter].width = width
    for row_num, height in spec.get("row_heights", {}).items():
        ws.row_dimensions[int(row_num)].height = height
    for rng in spec.get("merges", []):
        ws.merge_cells(rng)
    for rng in deferred_merges:
        ws.merge_cells(rng)


# Matches "SheetName!$B$4" or "Sheet Name!B4:C10" with optional $ anchors.
# Quoted sheet names ("'My Sheet'!$B$4") are tolerated by stripping quotes.
_NAMED_RANGE_REF_RE = re.compile(
    r"""^
        '?(?P<sheet>[^'!]+?)'?      # sheet name, optionally single-quoted
        !
        \$?[A-Z]+\$?\d+             # start cell, optional anchors
        (?::\$?[A-Z]+\$?\d+)?       # optional range end
        $""",
    re.VERBOSE,
)


def validate_named_ranges(spec: dict) -> None:
    """Validate that every named_range targets a sheet declared in the spec.

    Catches the off-by-sheet class of bug (e.g., a name pointing at
    'Imputs!$B$4' or at a sheet name dropped between drafts). Raised
    errors are loud so the agent fixes the JSON before shipping a
    silently-broken workbook.
    """
    names = spec.get("named_ranges", [])
    if not names:
        return
    sheet_titles = {s["name"] for s in spec.get("sheets", [])}
    seen: set[str] = set()
    for entry in names:
        if "name" not in entry or "ref" not in entry:
            raise ValueError(
                f"named_ranges entry missing 'name' or 'ref': {entry!r}"
            )
        nm = entry["name"]
        ref = entry["ref"]
        if nm in seen:
            raise ValueError(f"named_ranges contains duplicate name {nm!r}")
        seen.add(nm)
        if not re.match(r"^[A-Za-z_][A-Za-z0-9_.]*$", nm):
            raise ValueError(
                f"named_range {nm!r} is not a valid Excel name "
                f"(must start with a letter or underscore; letters / digits / _ / . only)"
            )
        m = _NAMED_RANGE_REF_RE.match(ref)
        if not m:
            raise ValueError(
                f"named_range {nm!r} has malformed ref {ref!r}; "
                f"expected e.g. 'Inputs!$B$4' or 'Analysis!B2:B40'"
            )
        sheet = m.group("sheet")
        if sheet not in sheet_titles:
            raise ValueError(
                f"named_range {nm!r} references sheet {sheet!r} "
                f"which is not declared in spec.sheets "
                f"(known: {sorted(sheet_titles)})"
            )


def apply_named_ranges(wb, spec: dict) -> None:
    """Emit each spec named_range as an openpyxl DefinedName at workbook scope."""
    from openpyxl.workbook.defined_name import DefinedName

    for entry in spec.get("named_ranges", []):
        dn = DefinedName(name=entry["name"], attr_text=entry["ref"])
        wb.defined_names[entry["name"]] = dn


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
    ap = argparse.ArgumentParser(description="Render a Money Desk multi-sheet XLSX workbook with real formulas.")
    ap.add_argument("--spec", required=True, type=pathlib.Path, help="JSON spec describing sheets / cells / formulas")
    ap.add_argument("--output", type=pathlib.Path, default=None,
                    help="Output path. If omitted: reports/<specialist-slug>/<spec-stem>.xlsx")
    ap.add_argument("--outdir", default="reports",
                    help="Base dir used when --output is omitted (default: reports)")
    ap.add_argument("--specialist", default="Money Desk",
                    help="Specialist name used to build the default output path")
    args = ap.parse_args()

    try:
        from openpyxl import Workbook
    except ImportError:
        sys.exit("ERROR: openpyxl not installed. Run: pip install openpyxl")

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    validate_named_ranges(spec)
    wb = Workbook()
    wb.remove(wb.active)

    for sheet_spec in spec.get("sheets", []):
        build_sheet(wb, sheet_spec)

    apply_named_ranges(wb, spec)

    if not wb.sheetnames:
        ws = wb.create_sheet(title="Summary")
        ws["A1"] = spec.get("title", "Money Desk Report")
        style_h1(ws["A1"])

    # Prefer specialist from the spec when present (templates set it); fall back to --specialist.
    specialist = spec.get("specialist") or args.specialist
    # Spec files use the convention `template.xlsx.json`; strip both extensions
    # so the default output is `<specialist>/template.xlsx`, not `template.xlsx.xlsx`.
    stem = args.spec.stem
    if stem.lower().endswith(".xlsx"):
        stem = stem[:-5]
    out = resolve_output(args.output, specialist, stem, "xlsx", args.outdir)
    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)

    size = out.stat().st_size
    sheet_count = len(wb.sheetnames)
    print(f"OK  {out}  ({size:,} bytes, {sheet_count} sheet(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
