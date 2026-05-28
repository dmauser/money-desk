#!/usr/bin/env python3
"""make_xlsx.py - Money Desk Excel workbook renderer (with REAL formulas).

Install: pip install openpyxl
Usage:   python make_xlsx.py --spec spec.json --output report.xlsx

Spec format (JSON) - multi-sheet workbook with real formulas:
{
  "title": "Portfolio Review - 2026-05-27",
  "specialist": "Investing Advisor",
  "sheets": [
    {
      "name": "Summary",
      "cells": [
        {"ref": "A1", "value": "Headline", "style": "h1"},
        {"ref": "A3", "value": "Total NW"},
        {"ref": "B3", "formula": "=SUM(Inputs!B2:B20)", "number_format": "$#,##0"}
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
"""
from __future__ import annotations
import argparse, json, pathlib, sys

PRIMARY = "1A4D8F"
STRIPE = "F5F7FB"


def style_header(cell):
    from openpyxl.styles import Font, PatternFill, Alignment
    cell.font = Font(name="Segoe UI", bold=True, color="FFFFFF", size=10)
    cell.fill = PatternFill("solid", fgColor=PRIMARY)
    cell.alignment = Alignment(horizontal="left", vertical="center")


def style_h1(cell):
    from openpyxl.styles import Font
    cell.font = Font(name="Segoe UI", bold=True, color=PRIMARY, size=14)


def style_body(cell):
    from openpyxl.styles import Font
    cell.font = Font(name="Segoe UI", size=10)


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
        if style_name == "h1":
            style_h1(c)
        elif style_name == "header":
            style_header(c)
        else:
            style_body(c)


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a Money Desk multi-sheet XLSX workbook with real formulas.")
    ap.add_argument("--spec", required=True, type=pathlib.Path, help="JSON spec describing sheets / cells / formulas")
    ap.add_argument("--output", required=True, type=pathlib.Path)
    args = ap.parse_args()

    from openpyxl import Workbook

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    wb = Workbook()
    wb.remove(wb.active)

    for sheet_spec in spec.get("sheets", []):
        build_sheet(wb, sheet_spec)

    if not wb.sheetnames:
        ws = wb.create_sheet(title="Summary")
        ws["A1"] = spec.get("title", "Money Desk Report")
        style_h1(ws["A1"])

    args.output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(args.output)

    size = args.output.stat().st_size
    sheet_count = len(wb.sheetnames)
    print(f"OK  {args.output}  ({size:,} bytes, {sheet_count} sheet(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
