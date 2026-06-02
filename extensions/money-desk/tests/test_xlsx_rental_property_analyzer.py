"""Synthetic-input recompute regression for the Rental Property Analyzer.

Pins the headline numbers from the Finding 7 prompt (2026-06-01 QA):

    purchase_price       $320,000
    down_payment_pct     25%
    mortgage_rate        7.00%
    mortgage_term_yrs    30
    monthly_rent         $2,600
    vacancy_pct          6%
    property_tax_ann     $4,200
    insurance_ann        $1,500
    hoa_monthly          $0
    mgmt_pct_of_rent     0%
    maintenance_pct_of_price  1% of price / yr
    capex_pct_of_price        1% of price / yr
    closing_costs        $8,000
    rehab_budget         $5,000

Expected:
    Monthly P&I     ≈ $1,596.73
    Cash invested   = $93,000   (NOT $88,000 — proves rehab_budget is wired)
    NOI             ≈ $17,228
    Annual debt svc ≈ -$19,160.84
    CF before tax   ≈ -$1,932.84
    Cap rate        ≈ 5.38%
    DSCR            ≈ 0.90
    Cash-on-cash    ≈ -2.08%

A failure here means either: (a) the schema-template unit mismatch
re-emerged (maintenance/capex applied to rent instead of price),
(b) cash_invested no longer adds rehab_budget, or (c) the PMT/NOI
formulas drifted. All three were live regressions on 2026-06-01.
"""
from __future__ import annotations

import json
import pathlib

import pytest

from conftest import load_template


def _apply_inputs(spec: dict, overrides: dict) -> None:
    """Mutate `spec` in place so the named B-column inputs use the
    given numeric values instead of the template defaults."""
    for sheet in spec["sheets"]:
        if sheet["name"] != "Inputs":
            continue
        for cell in sheet["cells"]:
            if cell["ref"] in overrides and "value" in cell:
                cell["value"] = overrides[cell["ref"]]


@pytest.fixture
def synthetic_workbook(build_workbook, tmp_xlsx_path):
    spec = load_template("real-estate-investor", "rental-property-analyzer")
    _apply_inputs(spec, {
        "B2": 320000,    # purchase_price
        "B3": 0.25,      # down_payment_pct
        "B4": 0.07,      # mortgage_rate
        "B5": 30,        # mortgage_term_yrs
        "B6": 2600,      # monthly_rent
        "B7": 0.06,      # vacancy_pct
        "B8": 4200,      # property_tax_ann
        "B9": 1500,      # insurance_ann
        "B10": 0,        # hoa_monthly
        "B11": 0,        # mgmt_pct_of_rent (self-managed)
        "B12": 0.01,     # maintenance_pct_of_price
        "B13": 0.01,     # capex_pct_of_price
        "B14": 8000,     # closing_costs
        "B15": 5000,     # rehab_budget
        "B16": 0.03,     # appreciation_pct (not exercised here)
    })
    return build_workbook(spec, tmp_xlsx_path)


def test_monthly_pi(synthetic_workbook, recalc):
    get = recalc(synthetic_workbook)
    assert get("Inputs", "B19") == pytest.approx(1596.73, rel=0.005), \
        "PMT formula drifted — check mortgage_rate / mortgage_term_yrs / loan_amount refs"


def test_cash_invested_includes_rehab(synthetic_workbook, recalc):
    """Without rehab_budget in the formula, this would be $88,000.
    The rehab_budget=5000 input must flow into cash_invested."""
    get = recalc(synthetic_workbook)
    assert get("Inputs", "B20") == pytest.approx(93000, abs=1.0), \
        "cash_invested should equal down + closing + rehab = $93,000; rehab_budget likely dropped"


def test_noi(synthetic_workbook, recalc):
    """NOI sensitive to maintenance/capex unit. If they were applied as
    % of rent instead of % of price, NOI would be ~$25,000 instead of
    ~$17,228 — this is the headline silent-bug guard."""
    get = recalc(synthetic_workbook)
    assert get("Summary", "B9") == pytest.approx(17228, rel=0.005), \
        "NOI off — likely maintenance/capex unit drift (% of rent vs % of price)"


def test_annual_debt_service(synthetic_workbook, recalc):
    get = recalc(synthetic_workbook)
    assert get("Summary", "B11") == pytest.approx(-19160.84, rel=0.005)


def test_cash_flow_before_tax(synthetic_workbook, recalc):
    get = recalc(synthetic_workbook)
    assert get("Summary", "B12") == pytest.approx(-1932.84, rel=0.01)


def test_cap_rate(synthetic_workbook, recalc):
    get = recalc(synthetic_workbook)
    assert get("Summary", "B13") == pytest.approx(0.0538, rel=0.005)


def test_dscr(synthetic_workbook, recalc):
    get = recalc(synthetic_workbook)
    assert get("Summary", "B15") == pytest.approx(0.90, rel=0.01)


def test_cash_on_cash(synthetic_workbook, recalc):
    """Belt-and-suspenders for both rehab_budget AND maintenance/capex
    unit — CoC depends on both via cash_invested and cash_flow."""
    get = recalc(synthetic_workbook)
    assert get("Summary", "B14") == pytest.approx(-0.0208, rel=0.02)


def test_appreciation_pct_surfaced_on_projection(synthetic_workbook, recalc):
    """appreciation_pct must round-trip from Inputs to the Projection
    sheet so it isn't silently dropped (Finding 7 secondary issue)."""
    get = recalc(synthetic_workbook)
    assert get("Projection", "B5") == pytest.approx(0.03, abs=1e-6)
