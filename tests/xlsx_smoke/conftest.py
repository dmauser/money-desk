"""Shared fixtures for the XLSX smoke suite.

These tests guard the May-2026 #VALUE! bug class: a shipped workbook had
a Summary cell pointing at the Notes free-text column, openpyxl never
evaluated it, our self-checks passed, the user opened it to a #VALUE!.

Each shipped XLSX template gets a smoke test that:
  1. lints the spec (catches the Notes-column-ref bug class),
  2. renders the workbook,
  3. recalculates it via the renderer's chained engine
     (LibreOffice -> Excel COM -> formulas), and
  4. fails on any error cell (#VALUE!/#REF!/#DIV/0!/#NAME?/#NUM!/#N/A).

The known-bad fixture in fixtures/notes_column_bug_spec.json is the
canonical regression: it embeds the EXACT shape of the original bug
(numeric formula referencing a Notes column) so the linter is proven
to block it.
"""
from __future__ import annotations

import pathlib
import sys

import pytest

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
RENDERERS = REPO_ROOT / "extensions" / "money-desk" / "renderers"
SPECIALISTS = REPO_ROOT / "extensions" / "money-desk" / "specialists"
FIXTURES = pathlib.Path(__file__).resolve().parent / "fixtures"

sys.path.insert(0, str(RENDERERS))


@pytest.fixture(scope="session")
def make_xlsx_module():
    import make_xlsx  # noqa: E402

    return make_xlsx


# (specialist_slug, skill_slug) — every shipped XLSX template.
SHIPPING_TEMPLATES = [
    ("education-planner", "college-cost-projection"),
    ("fire-planner", "swr-stress-test"),
    ("purchase-advisor", "rent-vs-buy"),
    ("real-estate-investor", "mortgage-strategy-review"),
    ("real-estate-investor", "rental-property-analyzer"),
    ("retirement-planner", "withdrawal-strategy"),
]


def template_path(specialist_slug: str, skill_slug: str) -> pathlib.Path:
    return (
        SPECIALISTS
        / specialist_slug
        / "skills"
        / skill_slug
        / "template.xlsx.json"
    )
