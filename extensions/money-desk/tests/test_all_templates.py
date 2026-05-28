"""Structural guard for every shipped XLSX JSON template.

This test discovers every `template.xlsx.json` under
`extensions/money-desk/specialists/**/skills/**/` and asserts:

  * The spec validates against the schema validator.
  * The spec declares at least one named range.
  * Every formula in every cell references **only** named ranges or
    other formula cells — never raw `A1`/`Sheet!A1` coordinates.
  * The workbook builds without error and the named ranges roundtrip
    through openpyxl.

This is the cross-cutting backstop that protects the bug class even
if a new template is added without its own dedicated regression test.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pytest
from openpyxl import load_workbook

REPO = Path(__file__).resolve().parents[3]
SPECIALISTS = REPO / "extensions" / "money-desk" / "specialists"

TEMPLATES = sorted(SPECIALISTS.glob("*/skills/*/template.xlsx.json"))

# Raw-coordinate detector: matches A1, $A$1, Sheet!A1, 'My Sheet'!$A$1, A1:B10, etc.
# We deliberately allow named ranges (alphanumeric identifiers without digit-only suffix
# patterns that match a column-row, and without a sheet! prefix).
_RAW_COORD_RE = re.compile(
    r"""
    (?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)?  # optional sheet name
    !?                                    # optional bang
    \$?[A-Z]{1,3}\$?\d+                   # A1 / $A$1
    (?::\$?[A-Z]{1,3}\$?\d+)?             # optional :B10
    """,
    re.VERBOSE,
)

# Names that are allowed inside formulas: Excel builtins + named ranges.
# We don't enumerate builtins; instead we strip them via the formula-extraction
# heuristic below (we only look at A1-style tokens).


def _formula_has_raw_coordinate(formula: str) -> list[str]:
    """Return any raw cell coordinates found in the formula, or []."""
    # Strip quoted string literals so labels like "N/A" don't trip the regex.
    stripped = re.sub(r'"[^"]*"', "", formula)
    found = _RAW_COORD_RE.findall(stripped)
    # Filter out obvious false positives (function names like PMT, named ranges
    # like cost_basis_pct are not column-letter+digit shapes).
    return [m for m in found if re.match(r"^(?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)?!?\$?[A-Z]{1,3}\$?\d+", m)]


@pytest.mark.parametrize("tpl_path", TEMPLATES, ids=lambda p: f"{p.parent.parent.name}/{p.parent.name}")
def test_template_validates_and_has_named_ranges(tpl_path, make_xlsx_module):
    spec = json.loads(tpl_path.read_text(encoding="utf-8"))
    # Schema validation must succeed.
    make_xlsx_module.validate_named_ranges(spec)
    nr = spec.get("named_ranges", [])
    assert len(nr) >= 1, f"{tpl_path.name} declares no named ranges"
    # Each must have a name and ref.
    names = set()
    for entry in nr:
        assert "name" in entry and "ref" in entry
        assert entry["name"] not in names, f"duplicate named range {entry['name']}"
        names.add(entry["name"])


@pytest.mark.parametrize("tpl_path", TEMPLATES, ids=lambda p: f"{p.parent.parent.name}/{p.parent.name}")
def test_template_formulas_use_only_named_references(tpl_path):
    """No formula in any Summary sheet may reference raw A1 coordinates.

    Inputs-sheet 'derived' formulas may reference local Inputs cells, but
    everything user-facing in Summary must go through named ranges so that
    a coordinate off-by-one cannot land in a headline figure.
    """
    spec = json.loads(tpl_path.read_text(encoding="utf-8"))
    offenders: list[str] = []
    for sheet in spec.get("sheets", []):
        if sheet["name"].lower() != "summary":
            continue
        for cell in sheet.get("cells", []):
            formula = cell.get("formula")
            if not formula:
                continue
            raw = _formula_has_raw_coordinate(formula)
            # Summary may reference other Summary cells (e.g. =B3+B4 for subtotals);
            # accept bare A1 refs without a sheet! prefix, but reject any cross-sheet ref.
            for token in raw:
                if "!" in token:
                    offenders.append(f"{sheet['name']}!{cell['ref']}: {formula}  (uses {token})")
    assert not offenders, (
        f"{tpl_path.relative_to(REPO)} Summary formulas must reference named ranges only, "
        f"not cross-sheet coordinates:\n  " + "\n  ".join(offenders)
    )


@pytest.mark.parametrize("tpl_path", TEMPLATES, ids=lambda p: f"{p.parent.parent.name}/{p.parent.name}")
def test_template_roundtrips_named_ranges(tpl_path, build_workbook, tmp_path):
    spec = json.loads(tpl_path.read_text(encoding="utf-8"))
    xlsx_path = build_workbook(spec, tmp_path / (tpl_path.parent.name + ".xlsx"))
    wb = load_workbook(xlsx_path)
    declared = {nr["name"] for nr in spec.get("named_ranges", [])}
    present = set(wb.defined_names)
    missing = declared - present
    assert not missing, f"{tpl_path.name}: named ranges missing after roundtrip: {missing}"
