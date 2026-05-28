"""Canonical regression test for the Rent vs Buy XLSX template.

This test would have caught the May 2026 production bug where
Summary!B12 (Monthly P&I) referenced Inputs!B6 (holding horizon)
instead of Inputs!B4 (mortgage term) - displaying $6,502 instead of
$3,726, off by ~75% - and where Summary BUY / RENT net-worth cells
both resolved to the same Analysis cell, making the headline verdict
identical for both options.

Dallas canonical scenario (defaults baked into the template):
    home_price             $700,000
    down_payment_pct       20%        ($140,000)
    mortgage_rate          7.00%
    mortgage_term_years    30
    holding_horizon_yrs    10
    home_appreciation      3% / year
    investment_return      6% / year   (post-tax alternative)
    rent_inflation         4% / year
    starting_rent_monthly  $2,875      (calibrated to user's target NW)
    property_tax_annual    $8,750
    hoa_monthly            $0
    maintenance_pct        1% of home_price
    insurance_annual       $2,000
    selling_costs_pct      7%
"""
from __future__ import annotations

import json
import pathlib
import re

import pytest

from conftest import load_template


@pytest.fixture
def dallas_workbook(build_workbook, tmp_xlsx_path):
    spec = load_template("purchase-advisor", "rent-vs-buy")
    return build_workbook(spec, tmp_xlsx_path)


def test_dallas_monthly_pi(dallas_workbook, recalc):
    """The bug that started it all. If a future refactor swaps
    mortgage_term_years for holding_horizon_yrs in the PMT formula
    (or any other named-ref typo), this catches it immediately
    ($3,726 vs $6,502 is way outside the $5 tolerance)."""
    get = recalc(dallas_workbook)
    pi = get("Summary", "B3")
    assert pi == pytest.approx(3726.0, abs=5.0), \
        f"Monthly P&I {pi:.2f} drifted outside $5 of $3,726 - check PMT named refs"


def test_dallas_buy_net_worth(dallas_workbook, recalc):
    get = recalc(dallas_workbook)
    buy = get("Summary", "B7")
    assert buy == pytest.approx(394340.0, abs=1000.0), \
        f"BUY net worth {buy:,.0f} drifted outside $1,000 of $394,340"


def test_dallas_rent_net_worth(dallas_workbook, recalc):
    get = recalc(dallas_workbook)
    rent = get("Summary", "B8")
    assert rent == pytest.approx(565700.0, abs=5000.0), \
        f"RENT net worth {rent:,.0f} drifted outside $5,000 of $565,700"


def test_dallas_difference_meaningful(dallas_workbook, recalc):
    """The original bug made this DIFFERENCE = $0."""
    get = recalc(dallas_workbook)
    diff = get("Summary", "B9")
    assert diff > 150_000, \
        f"RENT - BUY difference {diff:,.0f} should exceed $150,000"


def test_summary_buy_and_rent_are_distinct(dallas_workbook, recalc):
    """Belt-and-suspenders: directly assert BUY != RENT. The exact bug
    we saw in production was identical values in those two cells."""
    get = recalc(dallas_workbook)
    buy = get("Summary", "B7")
    rent = get("Summary", "B8")
    assert abs(rent - buy) > 100_000, \
        f"BUY ({buy:,.0f}) and RENT ({rent:,.0f}) too close - probable wrong-cell-ref bug"


def test_template_uses_named_references_only():
    """Defense in depth: no formula in the shipped template should
    reference raw Inputs-cell coordinates (Inputs!B4 etc.). Inputs must
    be reached via their named range. Prevents the coordinate-authoring
    antipattern from leaking back in via a future edit."""
    spec_path = pathlib.Path(__file__).resolve().parents[1] / \
        "specialists" / "purchase-advisor" / "skills" / "rent-vs-buy" / "template.xlsx.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    bad_pattern = re.compile(r"Inputs!\$?[A-Z]+\$?\d+", re.IGNORECASE)
    offenders = []
    for sheet in spec["sheets"]:
        if sheet["name"] == "Inputs":
            continue  # cells live here, references back to it are by name
        for cell in sheet.get("cells", []):
            if "formula" in cell and bad_pattern.search(cell["formula"]):
                offenders.append(f"{sheet['name']}!{cell['ref']}: {cell['formula']}")
    assert not offenders, (
        "rent-vs-buy template has formulas that reference Inputs cells by "
        "coordinate instead of by named range:\n  " + "\n  ".join(offenders)
    )
