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

1. **Inflate the sticker.** Ask the user for the education-inflation rate (not in `md_facts`; cite College Board historical via `md_sources`); always show sensitivity at 3%, 5% and 7%. Apply to (college_start_year − today) compounding.
2. **Compute total goal.** Sum of each college year's inflated cost (first-year cost grown at the inflation rate for each later year, as in the workbook) × pct_funded.
3. **Project current path.** FV of (current balance + monthly contribution) at the expected nominal return (default derived from `md_facts` → `behavioral_assumptions_safe_defaults` equity real return + inflation) over years-to-college; the balance at college start is compared to the goal (no drawdown modelled during college, matching the workbook).
4. **Compute gap.** Goal − projected balance at start of college. If gap > 0, compute the additional monthly contribution needed to close it (PMT formula).
5. **Sensitivity table.** Vary education inflation (3/5/7%), investment return (4/6/8%), and pct_funded (50/75/100%) — show the user the range, not a single number.
6. **Reality check.** If the gap requires more than 15% of household gross income to close, flag and recommend right-sizing the school target rather than the savings rate.

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

## Determinism rules

### Input keys

Names follow the named ranges in this skill's `template.xlsx.json` (the workbook stores percentages as fractions; here `5` = 5%).

- `current_age` — integer, child's age today
- `college_start_age` — integer (default 18)
- `years_in_college` — integer, 4 / 5 / 6
- `current_annual_cost` — number, USD/year today's all-in cost (tuition + fees + room & board) for the target school type
- `school_type` — `in_state_public` | `out_of_state_public` | `private_nonprofit` | `elite_private` (one run per type when several are requested)
- `cost_inflation` — number, % per year education-cost inflation
- `current_529_balance` — number, USD (all earmarked education savings)
- `monthly_contribution` — number, USD/month
- `expected_return` — number, % per year nominal
- `pct_funded` — number, % of cost the family intends to fund (default 100)
- `household_gross_income_usd` — number (for the affordability check)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Today's annual cost | **Ask**; the target school's published cost of attendance, or College Board *Trends in College Pricing* via `md_sources` (cite year); the "~" figures in Inputs needed are orientation only | `[USER-PROVIDED]` / `[College Board {year}]` |
| Education cost inflation | **Ask — no default**; not in md_facts. If the user has no view, cite College Board historical tuition inflation via `md_sources`, else `[UNSOURCED]`. The sensitivity grid always shows 3 / 5 / 7% | — |
| Expected nominal return | `(1 + md_facts behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent) × (1 + .long_term_inflation_percent) − 1` (stored as fractions), rounded to 2 decimals of a percent | `[ASSUMPTION]` |
| Share of cost the family funds | 100% | `[ASSUMPTION]` |
| College start age | 18 | `[ASSUMPTION]` |

### Calculation method

Mirror the workbook formulas exactly (rates as fractions `i = cost_inflation/100`, `r = expected_return/100`):

1. `years_to_start = college_start_age − current_age`. If ≤ 0, the child is in college: set projection steps 3–4 to the current balance and report "In college — no accumulation period".
2. `cost_at_start = current_annual_cost × (1 + i)^years_to_start`.
3. `total_future_cost = cost_at_start × ((1 + i)^years_in_college − 1) / i` (if `i = 0`: `cost_at_start × years_in_college`). This sums each college year's inflated cost; no discounting during college.
4. `goal = total_future_cost × pct_funded / 100` (equals the workbook's total when `pct_funded = 100`).
5. `projected_balance = current_529_balance × (1 + r)^years_to_start + FV(r/12, years_to_start × 12, −monthly_contribution, 0, 0)` — annual compounding on the existing balance, monthly on contributions, exactly as the workbook.
6. `gap = goal − projected_balance`; `funded_pct = projected_balance / goal × 100`, 1 decimal.
7. `required_monthly = −PMT(r/12, years_to_start × 12, current_529_balance, −goal)` (0 if `years_to_start ≤ 0`); `additional_monthly = required_monthly − monthly_contribution`.
8. `affordability_pct = additional_monthly × 12 / household_gross_income_usd × 100`, 1 decimal (skip if income not given).
9. **Sensitivity grid:** `funded_pct` for inflation ∈ {3, 5, 7}% × return ∈ {4, 6, 8}%, all other inputs unchanged.
10. **Trajectory table:** one row per year to start: start balance, contributions (12 × monthly), growth, end balance — using step-5 conventions.
11. Compute in cents; report whole dollars and percentages to 1 decimal.

### Decision rules

Evaluate top to bottom; the first match wins. Status labels match the workbook's Summary sheet.

| # | Condition | Status / recommendation |
|---|---|---|
| 1 | `current_annual_cost` or `cost_inflation` missing | No projection — collect inputs |
| 2 | `funded_pct ≥ 100` | **OK — fully funded**; keep the current contribution (consider reducing only after age-based glidepath review) |
| 3 | `affordability_pct > 15` | **Underfunded — right-size**: closing the gap needs > 15% of gross income; recommend a lower-cost school type or lower `pct_funded`, and show the contribution that fits within 15% |
| 4 | `funded_pct ≥ 70` | **On track** — raise the monthly contribution by `additional_monthly` |
| 5 | Otherwise | **Underfunded** — raise the monthly contribution by `additional_monthly`; show the 50% / 75% `pct_funded` alternatives |

### Output template

```markdown
# College Cost Projection — {child}, {YYYY-MM-DD}

## Headline
${current_annual_cost} today × {cost_inflation}%/yr × {years_to_start} yrs → **${goal}** for {years_in_college} years. Projected savings **${projected_balance}** ({funded_pct}%). Gap **${gap}**. Status: **{status}** (Decision rule #{n}).

## Goal by school type
| School type | Today's annual cost | First-year cost | Total goal |
|---|---|---|---|

## Funding path
| Metric | Value |
|---|---|
| Projected balance at start | |
| Funding gap | |
| Required monthly contribution | |
| Additional monthly needed | |
| Additional as % of gross income | |

## Trajectory
| Year | Start balance | Contributions | Growth | End balance |
|---|---|---|---|---|

## Sensitivity — % of goal funded
| Inflation \ Return | 4% | 6% | 8% |
|---|---|---|---|
| 3% | | | |
| 5% | | | |
| 7% | | | |

## Recommendations
- {contribution change / right-size / pct_funded alternatives}

## Assumptions used
{inflation, return, pct_funded with tags}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
