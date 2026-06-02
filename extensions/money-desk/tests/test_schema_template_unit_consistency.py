"""Schema vs XLSX template unit-clause consistency.

Guards the bug class behind Finding 7 (2026-06-01 QA): a schema field
labeled "% of rent" was wired into a named range whose Inputs-sheet
label said "% of price/yr" — formulas evaluated cleanly so neither
the lint nor the recalc gate caught it, but every shipped report
overstated operating expenses by ~10×.

For every shipped XLSX template, this test:
  1. Parses the matching ask_user schema out of intake-schemas.mjs.
  2. For every named range whose name is also a schema property key,
     extracts the *unit clause* from both the Inputs-sheet label and
     the schema title/description, and asserts they reference the same
     unit (one of: % of rent, % of price, % per year, $ / annual,
     years, count).

Only exact name-on-name matches are checked — the test does not try
to infer when a schema field maps to a differently-named named range
(those are normalization steps the agent owns). The test catches the
specific class of bug where the SAME identifier is used for both
sides but the units silently disagree.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[3]
SPECIALISTS = REPO / "extensions" / "money-desk" / "specialists"
INTAKE_SCHEMAS_FILE = REPO / "extensions" / "money-desk" / "intake-schemas.mjs"

TEMPLATES = sorted(SPECIALISTS.glob("*/skills/*/template.xlsx.json"))

# Map skill folder slug → ask_user schema key in intake-schemas.mjs.
# Templates whose skill has no structured schema (yet) are not checked
# against schema labels — only against the structural test in
# test_all_templates.py. These map only the templates whose skill DOES
# have an intake schema.
SKILL_TO_SCHEMA_KEY: dict[str, str] = {
    "rental-property-analyzer": "md_re_skill_rental_property_analyzer",
    "swr-stress-test": "md_fi_skill_swr_stress_test",
    # rent-vs-buy, mortgage-strategy-review, withdrawal-strategy, and
    # college-cost-projection do not currently expose a structured
    # ask_user schema; their gates use prose. When a schema is added,
    # add the mapping here and the test will start guarding it.
}

# Unit-clause taxonomy. A label is classified by the first matching
# pattern; if two labels for the same identifier classify to different
# units, the test fails.
UNIT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("pct_of_rent",   re.compile(r"%\s*of\s*rent", re.I)),
    ("pct_of_price",  re.compile(r"%\s*of\s*(?:price|property\s*value|home\s*price)", re.I)),
    ("pct_per_year",  re.compile(r"%\s*(?:/|per)\s*(?:yr|year|annual)|annual.*?%|%.*?annual", re.I)),
    ("pct",           re.compile(r"%|percent", re.I)),
    ("dollars_annual", re.compile(r"\$.*?(?:/|per)\s*(?:yr|year|annual)|annual.*?\(\$\)|\(annual.*?\)|annual\s*\$", re.I)),
    ("dollars",       re.compile(r"\$|dollar", re.I)),
    ("years",         re.compile(r"\b(?:years|yrs)\b", re.I)),
    ("months",        re.compile(r"\bmonths?\b", re.I)),
    ("count",         re.compile(r"\b(?:age|count|number\s*of)\b", re.I)),
]


def classify(text: str) -> str | None:
    """Return the unit-class of the most specific pattern matched, or None."""
    for label, rx in UNIT_PATTERNS:
        if rx.search(text):
            return label
    return None


def _slice_schema_block(source: str, key: str) -> str | None:
    """Return the JS source of a single intake-schemas entry, or None.

    intake-schemas.mjs is a hand-written ESM file; rather than executing
    it we extract one entry by brace-matching from `<key>: {` onward.
    """
    anchor = re.search(rf"\b{re.escape(key)}\s*:\s*\{{", source)
    if not anchor:
        return None
    start = anchor.end() - 1  # position of opening {
    depth = 0
    for i, ch in enumerate(source[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return source[start:i + 1]
    return None


_FIELD_RE = re.compile(
    r"""
    (?P<name>[A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{   # field_name: {
    (?P<body>[^{}]*)                            # contents (no nested braces in our schemas)
    \}
    """,
    re.VERBOSE,
)
_TITLE_RE = re.compile(r"""title\s*:\s*"((?:[^"\\]|\\.)*)\"""")
_DESC_RE = re.compile(r"""description\s*:\s*"((?:[^"\\]|\\.)*)\"""")


def parse_schema_fields(source: str, key: str) -> dict[str, str]:
    """Return a mapping of property-name → label-text for one schema.

    label-text is title + description joined with " / ", which is what
    we classify against. Returns {} if the schema isn't found.
    """
    block = _slice_schema_block(source, key)
    if block is None:
        return {}
    # Find the `properties: { ... }` sub-block.
    pmatch = re.search(r"properties\s*:\s*\{", block)
    if not pmatch:
        return {}
    pstart = pmatch.end() - 1
    depth = 0
    pend = None
    for i, ch in enumerate(block[pstart:], pstart):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                pend = i
                break
    if pend is None:
        return {}
    props = block[pstart + 1:pend]
    out: dict[str, str] = {}
    for m in _FIELD_RE.finditer(props):
        title_match = _TITLE_RE.search(m.group("body"))
        desc_match = _DESC_RE.search(m.group("body"))
        parts = []
        if title_match:
            parts.append(title_match.group(1))
        if desc_match:
            parts.append(desc_match.group(1))
        out[m.group("name")] = " / ".join(parts)
    return out


def template_inputs_labels(spec: dict) -> dict[str, tuple[str, str]]:
    """Return a mapping of named-range-name → (Inputs label text, number_format).

    Both the label and the cell's number_format inform the unit
    classification: e.g. a "Purchase price" label with "$#,##0" format
    is unambiguously dollars even though the label omits the $ sign.
    """
    inputs_labels: dict[str, str] = {}
    inputs_formats: dict[str, str] = {}
    for sheet in spec.get("sheets", []):
        if sheet.get("name") != "Inputs":
            continue
        for cell in sheet.get("cells", []):
            ref = cell.get("ref", "")
            if ref.startswith("A") and isinstance(cell.get("value"), str):
                inputs_labels[ref[1:]] = cell["value"]
            elif ref.startswith("B"):
                fmt = cell.get("number_format", "")
                if fmt:
                    inputs_formats[ref[1:]] = fmt
    out: dict[str, tuple[str, str]] = {}
    for nr in spec.get("named_ranges", []):
        m = re.search(r"\$(\d+)", nr.get("ref", ""))
        if not m:
            continue
        if "Inputs" not in nr["ref"]:
            continue
        row = m.group(1)
        if row in inputs_labels:
            out[nr["name"]] = (inputs_labels[row], inputs_formats.get(row, ""))
    return out


@pytest.fixture(scope="module")
def schemas_source() -> str:
    return INTAKE_SCHEMAS_FILE.read_text(encoding="utf-8")


@pytest.mark.parametrize(
    "tpl_path",
    TEMPLATES,
    ids=lambda p: f"{p.parent.parent.name}/{p.parent.name}",
)
def test_named_range_unit_matches_schema_unit(tpl_path: Path, schemas_source: str) -> None:
    skill_slug = tpl_path.parent.name
    schema_key = SKILL_TO_SCHEMA_KEY.get(skill_slug)
    if schema_key is None:
        pytest.skip(f"{skill_slug} has no structured schema in intake-schemas.mjs")

    schema_fields = parse_schema_fields(schemas_source, schema_key)
    assert schema_fields, f"schema {schema_key} parsed empty — regex broken?"

    spec = json.loads(tpl_path.read_text(encoding="utf-8"))
    nr_labels = template_inputs_labels(spec)

    # For every named range whose name is also a schema field, assert
    # both labels classify to the same unit. The template-side label is
    # augmented with its cell number_format so e.g. a "Purchase price"
    # label with "$#,##0" format classifies as dollars even though the
    # label string itself omits the $ sign.
    mismatches: list[str] = []
    for name, schema_label in schema_fields.items():
        if name not in nr_labels:
            continue
        tpl_label, tpl_fmt = nr_labels[name]
        s_class = classify(schema_label)
        t_class = classify(f"{tpl_label} {tpl_fmt}")
        if s_class != t_class:
            mismatches.append(
                f"  {name}: schema {s_class!r} ({schema_label!r}) vs "
                f"template {t_class!r} ({tpl_label!r} fmt {tpl_fmt!r})"
            )

    assert not mismatches, (
        f"{tpl_path.relative_to(REPO)}: schema/template unit mismatch:\n"
        + "\n".join(mismatches)
    )
