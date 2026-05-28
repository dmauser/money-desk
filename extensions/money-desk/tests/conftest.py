"""Shared pytest fixtures for the money-desk XLSX regression suite.

These tests guard the silent-cell-reference bug class fixed in May 2026
(see CHANGELOG): a shipped Rent vs Buy workbook had Monthly P&I pointing
at the holding-horizon cell instead of mortgage-term, off by ~75%, and
BUY/RENT net-worth cells pointing at the same source so the headline
verdict was wrong by design. The defense is named ranges + canonical
templates + Python recompute of every headline figure.
"""
from __future__ import annotations

import json
import pathlib
import sys

import pytest

REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]
RENDERERS = REPO_ROOT / "extensions" / "money-desk" / "renderers"
SPECIALISTS = REPO_ROOT / "extensions" / "money-desk" / "specialists"

# Make make_xlsx importable without packaging it.
sys.path.insert(0, str(RENDERERS))


@pytest.fixture(scope="session")
def make_xlsx_module():
    import make_xlsx  # noqa: E402
    return make_xlsx


@pytest.fixture
def tmp_xlsx_path(tmp_path):
    return tmp_path / "out.xlsx"


def _build_workbook(spec: dict, out: pathlib.Path, make_xlsx) -> pathlib.Path:
    from openpyxl import Workbook
    make_xlsx.validate_named_ranges(spec)
    wb = Workbook()
    wb.remove(wb.active)
    for sheet_spec in spec.get("sheets", []):
        make_xlsx.build_sheet(wb, sheet_spec)
    make_xlsx.apply_named_ranges(wb, spec)
    wb.save(out)
    return out


@pytest.fixture
def build_workbook(make_xlsx_module):
    """Build a .xlsx from a spec dict and return the saved path."""
    def _builder(spec: dict, out: pathlib.Path) -> pathlib.Path:
        return _build_workbook(spec, out, make_xlsx_module)
    return _builder


@pytest.fixture
def recalc():
    """Recalculate a workbook with the `formulas` package and return a
    case-insensitive accessor `get(sheet, ref)` for evaluated values.

    openpyxl alone does NOT evaluate formulas - it just stores them as
    strings. The agent's self-verification policy (preferences.yaml,
    report_quality.self_verification) explicitly requires the workbook
    to be recalculated via LibreOffice headless / Excel COM / formulas
    before any cell's evaluated value is asserted.
    """
    import formulas

    def _recalc(path: pathlib.Path):
        xl = formulas.ExcelModel().loads(str(path)).finish().calculate()
        # Keys look like: "'[file.xlsx]SHEETNAME'!CELLREF"
        index = {}
        for k, v in xl.items():
            if not isinstance(k, str) or "]" not in k or "!" not in k:
                continue
            sheet = k.split("]", 1)[1].split("'!", 1)[0]
            cell = k.rsplit("!", 1)[1]
            index[(sheet.upper(), cell.upper())] = v

        def get(sheet: str, ref: str) -> float:
            v = index[(sheet.upper(), ref.upper())]
            arr = v.value if hasattr(v, "value") else v
            try:
                return float(arr[0][0])
            except Exception:
                return float(arr)

        return get

    return _recalc


def load_template(specialist_slug: str, skill_slug: str) -> dict:
    path = SPECIALISTS / specialist_slug / "skills" / skill_slug / "template.xlsx.json"
    return json.loads(path.read_text(encoding="utf-8"))
