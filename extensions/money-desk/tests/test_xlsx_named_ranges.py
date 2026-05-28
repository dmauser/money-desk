"""Schema roundtrip + validation tests for the XLSX named_ranges feature."""
from __future__ import annotations

import pytest
from openpyxl import load_workbook


MINIMAL_SPEC = {
    "title": "schema-roundtrip",
    "named_ranges": [
        {"name": "loan_amount", "ref": "Inputs!$B$2"},
        {"name": "rate",        "ref": "Inputs!$B$3"},
    ],
    "sheets": [
        {"name": "Inputs", "cells": [
            {"ref": "A2", "value": "Loan"}, {"ref": "B2", "value": 560000},
            {"ref": "A3", "value": "Rate"}, {"ref": "B3", "value": 0.07},
        ]},
        {"name": "Summary", "cells": [
            {"ref": "A1", "value": "Interest yr1"},
            {"ref": "B1", "formula": "=loan_amount*rate", "number_format": "$#,##0"},
        ]},
    ],
}


def test_named_ranges_roundtrip(build_workbook, tmp_xlsx_path):
    build_workbook(MINIMAL_SPEC, tmp_xlsx_path)
    wb = load_workbook(tmp_xlsx_path)
    assert set(wb.defined_names) == {"loan_amount", "rate"}
    assert wb.defined_names["loan_amount"].value == "Inputs!$B$2"
    assert wb.defined_names["rate"].value == "Inputs!$B$3"
    # Formula text using the names is preserved (Excel resolves names at
    # calc time; we never want to bake coordinates back in).
    assert wb["Summary"]["B1"].value == "=loan_amount*rate"


def test_named_range_formula_evaluates_correctly(build_workbook, recalc, tmp_xlsx_path):
    build_workbook(MINIMAL_SPEC, tmp_xlsx_path)
    get = recalc(tmp_xlsx_path)
    assert get("Summary", "B1") == pytest.approx(39200.0, abs=1.0)


@pytest.mark.parametrize("bad_spec, expected_substr", [
    ({"named_ranges": [{"name": "x", "ref": "Imputs!$B$4"}],
      "sheets":      [{"name": "Inputs"}]},
     "references sheet"),
    ({"named_ranges": [{"name": "x", "ref": "$B$4"}],
      "sheets":      [{"name": "Inputs"}]},
     "malformed ref"),
    ({"named_ranges": [{"name": "x", "ref": "Inputs!B"}],
      "sheets":      [{"name": "Inputs"}]},
     "malformed ref"),
    ({"named_ranges": [{"name": "1bad", "ref": "Inputs!$B$4"}],
      "sheets":      [{"name": "Inputs"}]},
     "not a valid Excel name"),
    ({"named_ranges": [{"name": "x", "ref": "Inputs!$B$1"},
                       {"name": "x", "ref": "Inputs!$B$2"}],
      "sheets":      [{"name": "Inputs"}]},
     "duplicate name"),
    ({"named_ranges": [{"name": "x"}],
      "sheets":      [{"name": "Inputs"}]},
     "missing 'name' or 'ref'"),
])
def test_validator_rejects_bad_specs(make_xlsx_module, bad_spec, expected_substr):
    with pytest.raises(ValueError) as exc:
        make_xlsx_module.validate_named_ranges(bad_spec)
    assert expected_substr in str(exc.value)


def test_validator_accepts_quoted_sheet_names(make_xlsx_module):
    spec = {
        "named_ranges": [{"name": "x", "ref": "'My Inputs'!$B$4"}],
        "sheets": [{"name": "My Inputs"}],
    }
    make_xlsx_module.validate_named_ranges(spec)


def test_validator_accepts_range_refs(make_xlsx_module):
    spec = {
        "named_ranges": [{"name": "data", "ref": "Analysis!$A$2:$A$31"}],
        "sheets": [{"name": "Analysis"}],
    }
    make_xlsx_module.validate_named_ranges(spec)
