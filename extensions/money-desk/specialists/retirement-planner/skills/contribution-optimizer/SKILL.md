# Contribution Optimizer

description: Determine optimal $ split across 401(k) (trad vs Roth), IRA (trad vs Roth), HSA, Mega Backdoor Roth, and taxable brokerage given the user's tax bracket, employer match, and limits. Outputs a contribution waterfall. Use at year start, after a raise, or whenever the user has new money to deploy.

## When to use

- Start of year — set 401(k) contribution % to hit the limit on schedule.
- After a raise or bonus — re-optimize where the next dollar goes.
- The user got a new job with different plan options.
- HSA eligibility just opened (HDHP enrollment).

## Inputs needed

- Tax-year contribution limits (confirm from IRS for the working year).
- Current bracket (federal + state).
- Employer 401(k) match formula and vesting.
- Plan features: traditional 401(k) Y/N, Roth 401(k) Y/N, after-tax contributions Y/N, in-plan Roth conversion or in-service withdrawal Y/N (the Mega Backdoor Roth path).
- HDHP enrollment status → HSA eligibility.
- AGI estimate (drives Roth IRA eligibility + Traditional IRA deductibility).
- Income sources (W-2 only? 1099? both?).

## Workflow

1. **Build the waterfall.** Recommended priority (typical, override as needed):
   1. **401(k) up to full employer match** — free money, period.
   2. **HSA (if HDHP)** — triple-tax-advantaged. Max it. Invest, don't spend, if cash flow allows.
   3. **High-interest debt payoff** (handled by Debt Strategist — flag interaction).
   4. **Roth IRA up to limit** (or Backdoor Roth if income is above the phase-out). For higher earners with future-higher-bracket expectation.
   5. **Remainder of 401(k) to the limit** — traditional vs Roth split per below.
   6. **Mega Backdoor Roth** if the plan allows (after-tax contributions + in-plan Roth conversion or in-service rollover).
   7. **Taxable brokerage** — broad index, tax-efficient.
   8. **529 / I-Bonds / other earmarked savings** as relevant.
2. **Traditional vs Roth 401(k) decision.**
   - High current bracket and expected lower retirement bracket → Traditional.
   - Lower current bracket (early career) or expected higher retirement bracket / large tax-deferred balance already → Roth.
   - When unsure, split (e.g. 50/50). Diversifies tax risk.
3. **Per-paycheck math.** Compute the % of pay to elect to hit the annual limit on the user's pay schedule, accounting for true-up (or its absence — some plans don't true-up, so front-loading risks missing match).
4. **Catch-up.** Age 50+ gets catch-up; age 60–63 (under SECURE 2.0) gets enhanced catch-up — confirm against working-year rules.
5. **Limit sanity check.** 415(c) combined limit (employee + employer + after-tax) — Mega Backdoor Roth contributors can hit this ceiling.
6. **Cash flow gut check.** Recommended contribution % cannot exceed take-home reality. Surface this and propose phased ramp.

## Required citations

- Each limit cites the tax year and IRS source.
- Match formula cited to plan summary doc.
- Bracket assumption cited.

## Deliverable shape

- Markdown report `./reports/retirement-planner/contribution-optimizer-<YEAR>.md`:
  - **Waterfall** — priority list with $ and % per bucket.
  - **401(k) split** — Trad/Roth with rationale.
  - **Per-paycheck %** — actionable election numbers.
  - **Cash-flow check** — net pay impact preview.
  - **Plan-feature actions** — e.g. "ask HR if after-tax contributions are allowed and in-plan Roth conversion is available."

## Notes

- True-up matters. If a plan doesn't true-up, front-loading risks leaving match on the table — pace contributions across the year instead.
- HSA is often underused. It's the single best tax-shelter for those who can afford to pay current medical expenses out of pocket and let HSA invest.
- Roth IRA via the backdoor: must be aware of the pro-rata rule across all traditional IRAs.
- "Not tax or investment advice — informational only."
