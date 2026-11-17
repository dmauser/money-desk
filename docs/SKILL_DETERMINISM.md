# Skill determinism standard

Every `SKILL.md` must produce the **same numbers, the same recommendation, and the same report shape** when it gets the same inputs, whichever model or host (Copilot CLI or Claude) runs it. Prose like "consider", "roughly", "assume X% growth", or "flag it if the savings are small" leaves the model to improvise, so two runs disagree.

Each skill therefore carries a `## Determinism rules` section, placed immediately before `## Report Quality`, with these five subsections in this order. `tests/skill-determinism.test.mjs` enforces the structure.

## 1. `### Input keys`

The canonical snake_case keys for the skill's `inputs` object, with type and unit. Example:

```
- `debts` — list of `{ name, balance_usd, apr_pct, min_payment_usd }`
- `monthly_budget_usd` — number, total $/month available for all debts
```

Percentages are written as percents (`6.5` = 6.5%) and money as USD numbers. Names here must match `extensions/money-desk/intake-schemas.mjs` when the skill has a structured schema.

## 2. `### Assumptions`

A table of every value the analysis needs that the user may not supply, and exactly where the fallback comes from:

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Long-run equity real return | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` | `[ASSUMPTION]` |
| Mortgage rate | **Ask — no default** | — |

Rules:
- Never invent a number. A fallback is either an `md_facts` key or "Ask — no default".
- Year-specific limits and thresholds (contribution limits, brackets, IRMAA, gift exclusion…) come from `md_facts`, named by topic and key, never hard-coded in the skill. If the figure isn't in `md_facts`, say so and require `md_sources` lookup or an `[UNSOURCED]` tag.
- "None — all values are user-provided" is a valid answer.

## 3. `### Calculation method`

Numbered, executable steps: formulas written out, order of operations, compounding convention, rounding (compute in cents, report whole dollars unless stated), tie-breakers, iteration caps, and what to do when a step can't be completed. Anything that could be done two ways must name the one way.

## 4. `### Decision rules`

The recommendation logic as a table of explicit, mutually exclusive conditions evaluated top to bottom; the first match wins. Thresholds are numbers, not adjectives. Include a final "otherwise" row.

## 5. `### Output template`

The exact markdown skeleton of the deliverable: headings in order, table columns in order, and the placeholders to fill. Sections that don't apply are kept with "Not applicable — <reason>" rather than dropped, so every report has the same shape.
