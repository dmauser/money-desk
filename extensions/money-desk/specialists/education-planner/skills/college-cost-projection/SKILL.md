## College Cost Projection

description: Project total cost of a child's college education inflated to their college years (in-state public / out-of-state public / private), compare against current savings + monthly contribution, and quantify the funding gap and required monthly savings to close it.

## When to use

- "Are we on track for college?"
- Setting initial 529 contribution amount.
- Before locking into a savings rate, to gut-check the math.
- When a new child is born ("how much do we need to save?").

## Inputs needed

- Child's age and expected college start year.
- Target school type(s):
  - In-state public 4-year — current sticker ~$28k/yr (tuition+R&B+fees) [cite source: College Board *Trends in College Pricing* latest year].
  - Out-of-state public — ~$46k/yr.
  - Private non-profit — ~$60k/yr.
  - Elite private — ~$85k+/yr.
- Current 529 (or other earmarked) balance.
- Monthly contribution.
- Years willing to fund (4 / 5 / 6 — engineering and pre-med often 5–6).
- Expected % of cost the family will fund (some families fund 50% and expect kid loans / work-study / scholarships to cover the rest).

## Workflow

1. **Inflate the sticker.** Default 5% education inflation (cite College Board historical); show sensitivity at 3% and 7%. Apply to (college_start_year − today) compounding.
2. **Compute total goal.** Years_funded × annual_inflated_cost × pct_funded.
3. **Project current path.** FV of (current balance + monthly contribution) at assumed return (default 6% real, 8% nominal) over years-to-college, then drawn down over years-funded.
4. **Compute gap.** Goal − projected balance at start of college. If gap > 0, compute the additional monthly contribution needed to close it (PMT formula).
5. **Sensitivity table.** Vary education inflation (3/5/7%), investment return (4/6/8%), and pct_funded (50/75/100%) — show the user the range, not a single number.
6. **Reality check.** If the gap requires more than ~15% of household gross income to close, flag and recommend right-sizing the school target rather than the savings rate.

## Required citations

- Sticker prices cite the most recent College Board *Trends in College Pricing* report (year + URL).
- Education-inflation assumption cites historical CPI-college or College Board (typically 5% nominal long-run, but volatile).
- Investment-return assumption is stated as a planning assumption (not a guarantee) and shown with downside sensitivity.

## Deliverable shape

Markdown report `./money-desk/<CHILD>/college-cost-projection-<YYYYMMDD>.md`:
- **Headline** — e.g., "$X today × 5%/yr × N years = $Y at college start. You're on track to have $Z. Gap: $G."
- **Goal table** — by school type (in-state / out-of-state / private), total inflated cost.
- **Trajectory table** — year, balance, contribution, growth, end balance.
- **Sensitivity 3×3 grid** — % of goal funded across inflation × return assumptions.
- **Recommendations** — increase contribution to $X/mo; or right-size school target; or extend payback assumption (parent loans, kid contribution).

## Notes

- The "save 1/3, current-pay 1/3, borrow 1/3" rule of thumb is one starting point but doesn't fit everyone.
- Merit aid varies wildly by school; sticker is the conservative planning number. Use Net Price Calculator on each target school's website for a tighter estimate (and cite output).
- This skill projects the cost; **Financial Aid Positioning** (`md_ed_skill_aid_positioning`) separately analyzes how much aid might offset it.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).


### XLSX deliverables — template + named-ranges contract

When this skill produces an XLSX, it **MUST**:

1. **Start from the shipped template** at `template.xlsx.json` in this skill's
   folder. The template pre-declares the Inputs schema, named ranges, and
   Summary/Analysis formulas. Fill only **values** (and narrative cells) —
   never hand-author raw `A1` coordinates in formulas.
2. **Reference cells by name**, never coordinate. Use
   `=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)` rather
   than `=PMT(Inputs!B5/12, Inputs!B4*12, -B11)`. This is the bug class the
   template system exists to prevent: a Rent vs Buy report once shipped with
   Monthly P&I pointing at Inputs!B6 (holding horizon) instead of Inputs!B4
   (mortgage term) — off by 75% — and the BUY/RENT cells pointing at the
   same source.
3. **Recompute every headline figure** independently in Python and assert
   agreement within 1% before declaring done (see
   `report_quality.self_verification` in `data/preferences.yaml`).
4. **Recalculate the workbook** after rendering (LibreOffice headless on
   Linux/Mac, Excel COM on Windows, or the `formulas` package) and reload
   with `data_only=True`; openpyxl alone does not evaluate formulas.
5. **Cross-format diff**: if markdown + XLSX (or DOCX) are both produced,
   diff every headline figure across formats; abort and re-render if any
   pair differs by more than 1%.
6. **Flag duplicate-value-with-different-label** in the same table — that
   pattern is almost always a reference-pointing bug, not a coincidence.
