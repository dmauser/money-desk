"""XLSX smoke suite: one test per shipped template + linter regression.

Every test here is a black-box integration test of the render pipeline:
spec -> lint_formulas -> build_sheet -> apply_named_ranges -> save ->
validate_workbook (recalc + error-cell scan). Failures here mean a real
user would open the file to a broken cell.
"""
from __future__ import annotations

import json
import pathlib

import pytest
from openpyxl import Workbook

from conftest import FIXTURES, SHIPPING_TEMPLATES, template_path


def _render(make_xlsx, spec, out_path):
    """Mirror what make_xlsx.main() does, exposing each step for tests."""
    make_xlsx.validate_named_ranges(spec)
    make_xlsx.lint_formulas(spec)
    wb = Workbook()
    wb.remove(wb.active)
    for sheet_spec in spec.get("sheets", []):
        make_xlsx.build_sheet(wb, sheet_spec)
    make_xlsx.apply_named_ranges(wb, spec)
    wb.save(out_path)
    return out_path


# ─── Linter regression: known-bad fixture ──────────────────────────────

def test_linter_blocks_notes_column_bug(make_xlsx_module):
    """Reproduces the May-2026 production bug. lint_formulas MUST raise
    on a spec where a numeric formula points at a Notes-header column."""
    spec_path = FIXTURES / "notes_column_bug_spec.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))

    with pytest.raises(ValueError) as exc:
        make_xlsx_module.lint_formulas(spec)

    msg = str(exc.value)
    assert "Notes" in msg or "notes" in msg.lower()
    assert "Summary!B6" in msg
    assert "Inputs!D" in msg


def test_linter_passes_clean_template(make_xlsx_module):
    """Sanity: the canonical mortgage_strategy_review template lints clean."""
    spec_path = template_path("real-estate-investor", "mortgage-strategy-review")
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    make_xlsx_module.lint_formulas(spec)  # must not raise


# ─── One smoke test per shipping template ──────────────────────────────

@pytest.mark.parametrize(
    "specialist_slug,skill_slug",
    SHIPPING_TEMPLATES,
    ids=[f"{a}/{b}" for a, b in SHIPPING_TEMPLATES],
)
def test_template_renders_and_validates(
    specialist_slug, skill_slug, make_xlsx_module, tmp_path
):
    """End-to-end: lint -> render -> recalc -> assert no error cells.

    Catches the bug class where openpyxl's silent storage of formulas
    masks downstream #VALUE!/#REF!/#DIV/0! errors that only surface when
    the user opens the file in Excel/LibreOffice.
    """
    spec_path = template_path(specialist_slug, skill_slug)
    assert spec_path.exists(), f"Missing template: {spec_path}"

    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    out = tmp_path / f"{specialist_slug}__{skill_slug}.xlsx"

    _render(make_xlsx_module, spec, out)

    # validate_workbook raises WorkbookValidationError on any
    # #VALUE!/#REF!/#DIV/0!/#NAME?/#NUM!/#N/A cell.
    make_xlsx_module.validate_workbook(out)

    assert out.exists() and out.stat().st_size > 0


def test_known_bad_fixture_workbook_would_have_shipped_broken(
    make_xlsx_module, tmp_path
):
    """If we BYPASS the linter (--no-validate path), the known-bad
    fixture's workbook materializes a #VALUE! cell at Summary!B6,
    proving (a) the bug was real and (b) validate_workbook would have
    caught it post-save even without the lint gate.
    """
    spec_path = FIXTURES / "notes_column_bug_spec.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))

    # Skip lint_formulas; render directly. This is what shipping looked
    # like before this PR.
    wb = Workbook()
    wb.remove(wb.active)
    for sheet_spec in spec.get("sheets", []):
        make_xlsx_module.build_sheet(wb, sheet_spec)
    make_xlsx_module.apply_named_ranges(wb, spec)
    out = tmp_path / "broken.xlsx"
    wb.save(out)

    with pytest.raises(make_xlsx_module.WorkbookValidationError) as exc:
        make_xlsx_module.validate_workbook(out)

    msg = str(exc.value)
    assert "#VALUE!" in msg
    assert "Summary" in msg and "B6" in msg
