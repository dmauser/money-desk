#!/usr/bin/env python3
"""make_xlsx.py - Money Desk Excel workbook renderer (with REAL formulas).

Install: pip install -r requirements.txt   (openpyxl + formulas)
         # `formulas` is the DEFAULT recalc backend — a pure-Python Excel
         # formula evaluator with zero external system deps. LibreOffice
         # headless and Excel COM (Windows + pywin32) are optional
         # ACCELERATORS that the post-save validate_workbook gate prefers
         # when present, but neither is required for the gate to run.
Usage:   python make_xlsx.py --spec spec.json --specialist "Investing Advisor"
         # --output is optional; defaults to reports/<specialist-slug>/<spec-stem>.xlsx
         # override with: --output path/to/report.xlsx  (or --outdir to change the base folder)
         # --no-validate   skip the post-save lint + recalc pass (default: validate)

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

VALIDATION (default-on, opt-out via --no-validate / validate=False):
  1. lint_formulas(spec): pre-save linter. Rejects any numeric formula
     whose operands reference a column whose `style: "header"` cell
     value is Notes / Source / Citation / Comment / empty. Catches the
     class of bug where an agent points a numeric formula at a free-text
     annotation column (the openpyxl pipeline does NOT evaluate
     formulas, so #VALUE! errors slip through silent self-checks).
  2. validate_workbook(path): post-save recalculation pass. Tries
     LibreOffice headless, then Excel COM (Windows), then the
     `formulas` Python package (the DEFAULT — pinned in
     requirements.txt so every install has a working backend out of
     the box; LibreOffice/Excel COM are optional accelerators).
     Reads the materialized values and fails the build on any
     #VALUE! / #REF! / #DIV/0! / #NAME? / #NUM! / #N/A cell.
"""
from __future__ import annotations

__renderer_version__ = "0.19.8"
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

import argparse, json, os, pathlib, re, shutil, subprocess, sys, tempfile

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


# ─────────────────────────────────────────────────────────────────────
# Pre-save formula linter
# ─────────────────────────────────────────────────────────────────────
#
# The Notes-column bug class: an agent edits a Summary dashboard, drops
# a formula pointing at the cell that USED to hold a numeric input but
# now holds free-text annotation, and ships it. openpyxl never
# evaluates the formula, so the file passes self-checks. The user opens
# the workbook and sees #VALUE!.
#
# Defense: at lint time, identify every column whose `style: "header"`
# cell value is in BAD_HEADERS. Reject any numeric-looking formula that
# references a cell in such a column.

BAD_HEADERS = {"notes", "source", "citation", "comment", ""}

NUMERIC_FUNCS = {
    "PMT", "FV", "PV", "NPV", "IRR", "RATE", "NPER", "CUMIPMT", "CUMPRINC",
    "SUM", "SUMIF", "SUMIFS", "SUMPRODUCT",
    "AVERAGE", "AVERAGEIF", "AVERAGEIFS",
    "COUNT", "COUNTIF", "COUNTIFS",
    "MIN", "MAX", "PRODUCT",
    "ROUND", "ROUNDUP", "ROUNDDOWN", "ABS", "MOD",
    "POWER", "SQRT", "LOG", "LN", "EXP", "XIRR", "XNPV",
}


def _is_numeric_formula(formula: str) -> bool:
    upper = formula.upper()
    if any((fn + "(") in upper for fn in NUMERIC_FUNCS):
        return True
    # strip quoted string literals so concat (&"text") isn't misread as math
    stripped = re.sub(r'"[^"]*"', "", formula)
    return bool(re.search(r"[+\-*/^%]", stripped[1:]))  # skip leading '='


_HEADER_ROW_REF = re.compile(r"^([A-Z]+)\d+$")


def _build_bad_columns(spec: dict) -> dict[str, set[str]]:
    """Return {sheet_name: {col_letter, ...}} of columns whose `style: "header"`
    cell value is in BAD_HEADERS (i.e. Notes / Source / Citation / Comment /
    empty). Tabular sheets (`headers` field) are also scanned: each header
    string maps to a column letter.
    """
    from openpyxl.utils import get_column_letter

    out: dict[str, set[str]] = {}
    for sheet in spec.get("sheets", []):
        bad: set[str] = set()
        if "headers" in sheet:
            for i, h in enumerate(sheet["headers"], start=1):
                if (str(h or "").strip().lower()) in BAD_HEADERS:
                    bad.add(get_column_letter(i))
        for cell in sheet.get("cells", []):
            if cell.get("style") != "header":
                continue
            ref = cell.get("ref", "")
            m = _HEADER_ROW_REF.match(ref)
            if not m:
                continue
            value = cell.get("value", "")
            normalized = str(value or "").strip().lower()
            if normalized in BAD_HEADERS:
                bad.add(m.group(1))
        if bad:
            out[sheet["name"]] = bad
    return out


_REF_RE = re.compile(
    r"""^
        (?:'(?P<sheet_q>[^']+)'|(?P<sheet>[A-Za-z_][A-Za-z0-9_ ]*))?  # optional sheet
        !?
        \$?(?P<col>[A-Z]+)\$?(?P<row>\d+)
        (?::\$?(?P<col2>[A-Z]+)\$?(?P<row2>\d+))?
        $""",
    re.VERBOSE,
)


def _resolve_named_range(name: str, spec: dict):
    for entry in spec.get("named_ranges", []):
        if entry["name"].lower() == name.lower():
            return entry["ref"]
    return None


def _expand_columns(col_a: str, col_b: str | None) -> list[str]:
    from openpyxl.utils import column_index_from_string, get_column_letter
    a = column_index_from_string(col_a)
    if not col_b:
        return [col_a]
    b = column_index_from_string(col_b)
    return [get_column_letter(i) for i in range(min(a, b), max(a, b) + 1)]


def _parse_ref(ref_str: str, default_sheet: str) -> tuple[str | None, list[str]]:
    """Parse 'Sheet!A1' / 'A1:B5' / 'A1' into (sheet, [col_letters])."""
    m = _REF_RE.match(ref_str.strip())
    if not m:
        return (None, [])
    sheet = m.group("sheet_q") or m.group("sheet") or default_sheet
    return (sheet, _expand_columns(m.group("col"), m.group("col2")))


def lint_formulas(spec: dict) -> None:
    """Reject any numeric-looking formula whose operands target a column
    whose header is Notes / Source / Citation / Comment / empty.

    Catches the class of bug where a SUM/PMT/etc. formula points at a
    free-text annotation column and silently produces #VALUE! at open
    time (since openpyxl never evaluates formulas, the bad file
    otherwise passes our self-checks).
    """
    from openpyxl.formula.tokenizer import Tokenizer

    bad_cols = _build_bad_columns(spec)
    if not bad_cols:
        return

    offenders: list[str] = []
    for sheet in spec.get("sheets", []):
        sheet_name = sheet["name"]
        for cell in sheet.get("cells", []):
            f = cell.get("formula")
            if not f or not _is_numeric_formula(f):
                continue
            try:
                tokens = list(Tokenizer(f).items)
            except Exception:
                continue
            for tok in tokens:
                if getattr(tok, "type", "") != "OPERAND":
                    continue
                value = tok.value
                ref_str: str | None = None
                if getattr(tok, "subtype", "") == "RANGE":
                    ref_str = value
                else:
                    # treat plain identifier operands as candidate named ranges
                    if re.match(r"^[A-Za-z_][A-Za-z0-9_.]*$", value or ""):
                        resolved = _resolve_named_range(value, spec)
                        if resolved:
                            ref_str = resolved
                if not ref_str:
                    continue
                target_sheet, cols = _parse_ref(ref_str, default_sheet=sheet_name)
                if not target_sheet:
                    continue
                bad_for_sheet = bad_cols.get(target_sheet, set())
                hit = [c for c in cols if c in bad_for_sheet]
                if hit:
                    offenders.append(
                        f"{sheet_name}!{cell.get('ref')} = {f}  ->  "
                        f"{target_sheet}!{','.join(hit)} "
                        f"(column header is Notes/Source/Citation/Comment/empty)"
                    )
                    break  # one finding per cell is enough

    if offenders:
        raise ValueError(
            "lint_formulas: numeric formulas reference non-numeric columns:\n  "
            + "\n  ".join(offenders)
        )


# ─────────────────────────────────────────────────────────────────────
# Post-save recalculation + error-cell scan
# ─────────────────────────────────────────────────────────────────────

ERROR_CELL_VALUES = {"#VALUE!", "#REF!", "#DIV/0!", "#NAME?", "#NUM!", "#N/A"}


class WorkbookValidationError(RuntimeError):
    """Raised when validate_workbook detects #VALUE!/#REF!/etc. cells."""


def _try_libreoffice(src: pathlib.Path) -> pathlib.Path | None:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        return None
    with tempfile.TemporaryDirectory() as td:
        try:
            subprocess.run(
                [soffice, "--headless", "--calc",
                 "--convert-to", "xlsx", "--outdir", td, str(src)],
                check=True, capture_output=True, timeout=120,
            )
        except Exception:
            return None
        produced = list(pathlib.Path(td).glob("*.xlsx"))
        if not produced:
            return None
        # overwrite src in place with the recalculated workbook
        shutil.copyfile(produced[0], src)
        return src


def _try_excel_com(src: pathlib.Path) -> pathlib.Path | None:
    if sys.platform != "win32":
        return None
    try:
        import win32com.client  # type: ignore
    except Exception:
        return None
    excel = None
    try:
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False
        wb = excel.Workbooks.Open(str(src.resolve()))
        wb.RefreshAll()
        excel.CalculateFullRebuild()
        wb.Save()
        wb.Close(SaveChanges=False)
        return src
    except Exception:
        return None
    finally:
        if excel is not None:
            try:
                excel.Quit()
            except Exception:
                pass


def _scan_with_formulas_package(src: pathlib.Path) -> list[str]:
    """Use the `formulas` package as last-resort recalc engine and return
    the list of cells whose evaluated value is an Excel error.

    Raises ImportError if the package is not installed; the caller
    decides whether that should warn-and-skip or fail hard.
    """
    import formulas  # type: ignore  (intentionally raises ImportError to caller)

    # `formulas` emits its own tqdm bars during model load + calculate.
    # When the workbook contains few or zero formulas the bars render
    # as empty `0it` which looks like the gate did nothing — suppress
    # them so the only stderr noise is from us.
    os.environ.setdefault("TQDM_DISABLE", "1")

    try:
        xl = formulas.ExcelModel().loads(str(src)).finish().calculate()
    except Exception as e:
        raise WorkbookValidationError(
            f"validate_workbook: formulas package failed to evaluate {src}: {e}"
        )

    bad: list[str] = []
    for k, v in xl.items():
        if not isinstance(k, str) or "]" not in k or "!" not in k:
            continue
        sheet_cell = k.split("]", 1)[1]
        try:
            arr = v.value if hasattr(v, "value") else v
            cell_val = arr[0][0] if hasattr(arr, "__getitem__") else arr
        except Exception:
            continue
        text = str(cell_val).strip()
        if text in ERROR_CELL_VALUES or any(text.startswith(e) for e in ERROR_CELL_VALUES):
            bad.append(f"{sheet_cell} -> {text}")
    return bad


def _scan_data_only(src: pathlib.Path) -> list[str]:
    """Open with data_only=True (post-recalc cache) and report error cells."""
    from openpyxl import load_workbook

    wb = load_workbook(src, data_only=True)
    bad: list[str] = []
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                v = cell.value
                if isinstance(v, str) and v.strip() in ERROR_CELL_VALUES:
                    bad.append(f"{ws.title}!{cell.coordinate} -> {v}")
    return bad


RECALC_SKIP_WARN = (
    "WARN  recalc gate SKIPPED — no recalculation backend available "
    "(tried: {tried}). Fix with `pip install formulas` (the default "
    "pure-Python recalc backend, pinned in renderers/requirements.txt). "
    "LibreOffice headless and Microsoft Excel + pywin32 are optional "
    "accelerators if you prefer one of them. The workbook was saved but "
    "#VALUE! / #REF! / #DIV/0! / #NAME? / #NUM! / #N/A errors were NOT "
    "checked."
)


def validate_workbook(path: pathlib.Path) -> bool:
    """Recalculate `path` and raise WorkbookValidationError on any error
    cells (#VALUE!, #REF!, #DIV/0!, #NAME?, #NUM!, #N/A).

    Tries LibreOffice → Excel COM → `formulas` (in that order). The
    file is overwritten in place with the recalculated copy when
    LibreOffice / Excel COM succeed, so downstream consumers see
    materialized cached values.

    Returns True when a backend ran successfully (even if it found no
    bad cells), False when every backend was unavailable. The caller
    decides what to do with a False return — `main()` emits a stderr
    WARN by default, or exits 2 if `--require-recalc` was passed.
    """
    path = pathlib.Path(path)
    if not path.exists():
        raise WorkbookValidationError(f"validate_workbook: file not found: {path}")

    attempted: list[str] = []
    succeeded: str | None = None
    bad: list[str] = []

    attempted.append("libreoffice")
    if _try_libreoffice(path) is not None:
        succeeded = "libreoffice"
        bad = _scan_data_only(path)
    else:
        attempted.append("excel_com")
        if _try_excel_com(path) is not None:
            succeeded = "excel_com"
            bad = _scan_data_only(path)
        else:
            attempted.append("formulas")
            try:
                bad = _scan_with_formulas_package(path)
                succeeded = "formulas"
            except ImportError:
                # `formulas` not installed — record and let caller WARN.
                succeeded = None

    if succeeded is None:
        # Caller (main, or anyone else calling us programmatically) is
        # responsible for emitting a user-visible WARN and deciding
        # whether to exit non-zero. Returning False keeps this function
        # composable.
        print(RECALC_SKIP_WARN.format(tried=", ".join(attempted)), file=sys.stderr)
        return False

    if bad:
        raise WorkbookValidationError(
            f"validate_workbook: workbook {path} contains error cells:\n  "
            + "\n  ".join(bad)
        )
    return True


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
    ap.add_argument("--outdir", default="money-desk",
                    help="Base dir used when --output is omitted (default: reports)")
    ap.add_argument("--specialist", default="Money Desk",
                    help="Specialist name used to build the default output path")
    ap.add_argument("--no-validate", dest="validate", action="store_false",
                    help="Skip the post-save lint + recalc validation pass.")
    ap.add_argument("--require-recalc", dest="require_recalc", action="store_true",
                    help="Fail with exit 2 if no recalc backend (formulas / "
                         "LibreOffice / Excel COM) is available. Default: warn "
                         "on stderr but exit 0 so that environments without a "
                         "backend can still produce the workbook. The bundled "
                         "requirements.txt pins `formulas` so a fresh install "
                         "always has a working default backend.")
    ap.set_defaults(validate=True, require_recalc=False)
    args = ap.parse_args()

    try:
        from openpyxl import Workbook
    except ImportError:
        sys.exit("ERROR: openpyxl not installed. Run: pip install openpyxl")

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    validate_named_ranges(spec)
    if args.validate:
        lint_formulas(spec)
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

    if args.validate:
        try:
            recalc_ran = validate_workbook(out)
        except WorkbookValidationError as e:
            try:
                out.unlink()
            except Exception:
                pass
            sys.exit(f"ERROR: {e}")
        if not recalc_ran and args.require_recalc:
            try:
                out.unlink()
            except Exception:
                pass
            print(
                "ERROR  --require-recalc was set but no recalculation backend "
                "is available. Run `pip install formulas` (the default "
                "pure-Python backend, pinned in renderers/requirements.txt), "
                "or install LibreOffice / Microsoft Excel + pywin32 as an "
                "accelerator.",
                file=sys.stderr,
            )
            sys.exit(2)

    size = out.stat().st_size
    sheet_count = len(wb.sheetnames)
    print(f"OK  {out}  ({size:,} bytes, {sheet_count} sheet(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
