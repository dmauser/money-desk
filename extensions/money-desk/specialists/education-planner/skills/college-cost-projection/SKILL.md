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

Markdown report `./reports/<CHILD>/college-cost-projection-<YYYYMMDD>.md`:
- **Headline** — e.g., "$X today × 5%/yr × N years = $Y at college start. You're on track to have $Z. Gap: $G."
- **Goal table** — by school type (in-state / out-of-state / private), total inflated cost.
- **Trajectory table** — year, balance, contribution, growth, end balance.
- **Sensitivity 3×3 grid** — % of goal funded across inflation × return assumptions.
- **Recommendations** — increase contribution to $X/mo; or right-size school target; or extend payback assumption (parent loans, kid contribution).

## Notes

- The "save 1/3, current-pay 1/3, borrow 1/3" rule of thumb is one starting point but doesn't fit everyone.
- Merit aid varies wildly by school; sticker is the conservative planning number. Use Net Price Calculator on each target school's website for a tighter estimate (and cite output).
- This skill projects the cost; **Financial Aid Positioning** (`md_ed_skill_aid_positioning`) separately analyzes how much aid might offset it.
