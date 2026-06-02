"""make_xlsx.py recalc gate behavior — Finding 6 (2026-06-01 QA).

Before this change, validate_workbook would silently print empty tqdm
bars and `OK <path>` if the `formulas` package's calculate() returned
without finding any formulas — making it look like the gate ran when
in fact no recalculation actually happened on a box without LibreOffice
or Excel COM.

After this change:
  * validate_workbook returns False (instead of raising or returning
    None) when none of the three backends ran.
  * It writes a single-line stderr WARN that names every backend it
    tried plus actionable remediation.
  * `main()` exits 2 (instead of 0) when --require-recalc is passed
    but no backend is available.

These tests pin that contract.
"""
from __future__ import annotations

import json
import sys
import builtins
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[3]
SPECIALISTS = REPO / "extensions" / "money-desk" / "specialists"
SAMPLE_TEMPLATE = SPECIALISTS / "real-estate-investor" / "skills" / "rental-property-analyzer" / "template.xlsx.json"


@pytest.fixture
def saved_workbook(make_xlsx_module, tmp_path):
    """Build a real workbook from the rental-property-analyzer template
    so validate_workbook has a valid file to load."""
    spec = json.loads(SAMPLE_TEMPLATE.read_text(encoding="utf-8"))
    from openpyxl import Workbook
    make_xlsx_module.validate_named_ranges(spec)
    wb = Workbook()
    wb.remove(wb.active)
    for sheet_spec in spec.get("sheets", []):
        make_xlsx_module.build_sheet(wb, sheet_spec)
    make_xlsx_module.apply_named_ranges(wb, spec)
    out = tmp_path / "wb.xlsx"
    wb.save(out)
    return out


def _force_no_backends(monkeypatch, make_xlsx_module):
    """Make all three backends report unavailable."""
    monkeypatch.setattr(make_xlsx_module, "_try_libreoffice", lambda p: None)
    monkeypatch.setattr(make_xlsx_module, "_try_excel_com", lambda p: None)

    def _fake_scan(_p):
        raise ImportError("formulas package not available (test forced)")

    monkeypatch.setattr(make_xlsx_module, "_scan_with_formulas_package", _fake_scan)


def test_validate_workbook_returns_false_with_warn_when_no_backend(
    make_xlsx_module, saved_workbook, monkeypatch, capsys
):
    _force_no_backends(monkeypatch, make_xlsx_module)
    rv = make_xlsx_module.validate_workbook(saved_workbook)
    captured = capsys.readouterr()
    assert rv is False, "validate_workbook must return False when every backend is unavailable"
    assert "WARN" in captured.err and "recalc gate SKIPPED" in captured.err
    assert "libreoffice" in captured.err
    assert "excel_com" in captured.err
    assert "formulas" in captured.err
    # The WARN must hit stderr, not stdout (stdout stays machine-parseable).
    assert "WARN" not in captured.out


def test_validate_workbook_no_warn_when_libreoffice_succeeds(
    make_xlsx_module, saved_workbook, monkeypatch, capsys
):
    """Happy path: when a backend runs successfully, no WARN, no skip."""
    monkeypatch.setattr(make_xlsx_module, "_try_libreoffice", lambda p: p)
    # Excel COM and formulas should not even be tried.
    monkeypatch.setattr(make_xlsx_module, "_scan_data_only", lambda p: [])
    monkeypatch.setattr(make_xlsx_module, "_try_excel_com", lambda p: pytest.fail("should not be tried"))

    rv = make_xlsx_module.validate_workbook(saved_workbook)
    captured = capsys.readouterr()
    assert rv is True
    assert "WARN" not in captured.err
    assert "SKIPPED" not in captured.err


def test_main_exits_2_when_require_recalc_and_no_backend(
    make_xlsx_module, monkeypatch, capsys, tmp_path
):
    _force_no_backends(monkeypatch, make_xlsx_module)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "make_xlsx.py",
            "--spec", str(SAMPLE_TEMPLATE),
            "--outdir", str(tmp_path),
            "--require-recalc",
        ],
    )
    with pytest.raises(SystemExit) as exc:
        make_xlsx_module.main()
    assert exc.value.code == 2
    captured = capsys.readouterr()
    assert "WARN" in captured.err  # the skip warning fires first
    assert "ERROR  --require-recalc" in captured.err


def test_main_exits_0_when_no_backend_and_no_require_flag(
    make_xlsx_module, monkeypatch, capsys, tmp_path
):
    """Default behavior: missing backends warn but don't fail the build."""
    _force_no_backends(monkeypatch, make_xlsx_module)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "make_xlsx.py",
            "--spec", str(SAMPLE_TEMPLATE),
            "--outdir", str(tmp_path),
        ],
    )
    rv = make_xlsx_module.main()
    captured = capsys.readouterr()
    assert rv == 0
    assert "WARN" in captured.err
    assert captured.out.startswith("OK")
