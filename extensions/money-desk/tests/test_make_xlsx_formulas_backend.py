"""Smoke test for the formulas-only recalc backend (Finding 1, 2026-06-02 QA).

The validate_workbook() gate chains LibreOffice headless → Excel COM →
the pure-Python `formulas` package. On a clean Windows/macOS dev box
without LibreOffice and without Excel COM the FIRST two probes return
None and the third (formulas) is the only line of defense between an
agent and a workbook full of #VALUE! / #DIV/0! cells.

The existing tests in test_make_xlsx_recalc_gate.py monkeypatch ALL
THREE backends to unavailable to pin the WARN/exit-2 contract. That
covers the no-backend path but never actually exercises the formulas
evaluator end-to-end.

This file fills that gap. Each test below forces LibreOffice and
Excel COM to be unavailable and lets the real `formulas` package
recalculate a tiny purpose-built workbook:

  * test_formulas_backend_passes_clean_workbook — clean spec with one
    valid =PMT(...) cell. validate_workbook must return True without
    a WARN.
  * test_formulas_backend_catches_div_by_zero — same shape but with
    one =A1/0 cell that materializes to #DIV/0!. validate_workbook
    must raise WorkbookValidationError naming the bad cell.
  * test_warn_message_names_pip_install_formulas — when formulas
    itself is not importable, the WARN must lead with `pip install
    formulas` so the user has a one-line remediation.

These tests REQUIRE the `formulas` package to be installed (it is
pinned in extensions/money-desk/tests/requirements.txt and now also in
extensions/money-desk/renderers/requirements.txt). On Ubuntu CI without
LibreOffice present, the formulas-only path is the path actually
executed.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest


def _spec_with_formula(formula: str) -> dict:
    """Build a minimal 2-sheet spec with one named range and one formula
    on the Summary sheet that uses it. Mirrors the canonical brand
    layout (banner A1, header row, metric row).
    """
    return {
        "title": "Formulas backend smoke test",
        "specialist": "Money Desk",
        "named_ranges": [
            {"name": "rate", "ref": "Inputs!$B$2"},
            {"name": "term_months", "ref": "Inputs!$B$3"},
            {"name": "principal", "ref": "Inputs!$B$4"},
        ],
        "sheets": [
            {
                "name": "Summary",
                "cells": [
                    {"ref": "A1", "value": "Smoke", "style": "banner"},
                    {"ref": "A3", "value": "Metric", "style": "header"},
                    {"ref": "B3", "value": "Value", "style": "header"},
                    {"ref": "A4", "value": "Result", "style": "metric"},
                    {
                        "ref": "B4",
                        "formula": formula,
                        "number_format": "$#,##0.00",
                        "style": "value_highlight",
                    },
                ],
            },
            {
                "name": "Inputs",
                "cells": [
                    {"ref": "A1", "value": "Field", "style": "header"},
                    {"ref": "B1", "value": "Value", "style": "header"},
                    {"ref": "A2", "value": "Rate"},
                    {"ref": "B2", "value": 0.05},
                    {"ref": "A3", "value": "Term (months)"},
                    {"ref": "B3", "value": 360},
                    {"ref": "A4", "value": "Principal"},
                    {"ref": "B4", "value": 300000},
                ],
            },
        ],
    }


def _force_only_formulas_backend(monkeypatch, make_xlsx_module):
    """Make LibreOffice and Excel COM probes return unavailable so the
    only backend that can run is the real `formulas` package."""
    monkeypatch.setattr(make_xlsx_module, "_try_libreoffice", lambda p: None)
    monkeypatch.setattr(make_xlsx_module, "_try_excel_com", lambda p: None)


def test_formulas_backend_passes_clean_workbook(
    make_xlsx_module, build_workbook, tmp_xlsx_path, monkeypatch, capsys
):
    """A workbook whose only Summary formula is a valid =PMT(...) must
    pass the recalc gate cleanly via the formulas-only path."""
    _force_only_formulas_backend(monkeypatch, make_xlsx_module)

    spec = _spec_with_formula("=PMT(rate/12, term_months, -principal)")
    out = build_workbook(spec, tmp_xlsx_path)

    rv = make_xlsx_module.validate_workbook(out)
    captured = capsys.readouterr()

    assert rv is True, "formulas-only path must return True on a clean workbook"
    assert "WARN" not in captured.err, (
        "no WARN expected when the formulas backend evaluates the workbook successfully:\n"
        + captured.err
    )


def test_formulas_backend_catches_div_by_zero(
    make_xlsx_module, build_workbook, tmp_xlsx_path, monkeypatch
):
    """An intentionally broken =rate/0 formula must materialize as #DIV/0!
    under the formulas evaluator and be caught by validate_workbook."""
    _force_only_formulas_backend(monkeypatch, make_xlsx_module)

    spec = _spec_with_formula("=rate/0")
    out = build_workbook(spec, tmp_xlsx_path)

    with pytest.raises(make_xlsx_module.WorkbookValidationError) as exc:
        make_xlsx_module.validate_workbook(out)

    msg = str(exc.value)
    assert "#DIV/0!" in msg, f"error message must name #DIV/0! (got: {msg})"
    # `formulas` package emits sheet names uppercased (e.g. "SUMMARY'!B4").
    assert "summary" in msg.lower() and "B4" in msg, (
        f"error message must locate the bad cell at Summary!B4 (got: {msg})"
    )


def test_warn_message_names_pip_install_formulas(
    make_xlsx_module, build_workbook, tmp_xlsx_path, monkeypatch, capsys
):
    """When every backend is unavailable (including formulas), the
    skip WARN must lead with the actionable `pip install formulas`
    remediation so users have a one-line fix."""
    monkeypatch.setattr(make_xlsx_module, "_try_libreoffice", lambda p: None)
    monkeypatch.setattr(make_xlsx_module, "_try_excel_com", lambda p: None)

    def _fake_scan(_p):
        raise ImportError("formulas package not available (test forced)")

    monkeypatch.setattr(make_xlsx_module, "_scan_with_formulas_package", _fake_scan)

    spec = _spec_with_formula("=PMT(rate/12, term_months, -principal)")
    out = build_workbook(spec, tmp_xlsx_path)

    rv = make_xlsx_module.validate_workbook(out)
    captured = capsys.readouterr()

    assert rv is False
    assert "pip install formulas" in captured.err, (
        "WARN must include the actionable `pip install formulas` line so the "
        f"user has a one-step remediation (got: {captured.err!r})"
    )
    # The WARN names the backends in the order they were attempted
    # (libreoffice, excel_com, formulas) — that's expected. The
    # remediation that ships in the *prose* of the WARN must call out
    # `pip install formulas` as the canonical fix.
    assert "default" in captured.err.lower() or "pinned" in captured.err.lower(), (
        "WARN prose must frame `formulas` as the default backend (look for "
        "the words 'default' or 'pinned'): "
        f"{captured.err!r}"
    )
