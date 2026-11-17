# Contribution Optimizer

description: Determine optimal $ split across 401(k) (trad vs Roth), IRA (trad vs Roth), HSA, Mega Backdoor Roth, and taxable brokerage given the user's tax bracket, employer match, and limits. Outputs a contribution waterfall. Use at year start, after a raise, or whenever the user has new money to deploy.

## When to use

- Start of year — set 401(k) contribution % to hit the limit on schedule.
- After a raise or bonus — re-optimize where the next dollar goes.
- The user got a new job with different plan options.
- HSA eligibility just opened (HDHP enrollment).

## Inputs needed

- Tax-year contribution limits (from `md_facts` → `irs_contribution_limits`; confirm against the IRS notice for the working year).
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
   3. **High-interest debt payoff** (APR ≥ 8%) (handled by Debt Strategist — flag interaction).
   4. **Roth IRA up to limit** (or Backdoor Roth if income is above the phase-out). For higher earners with future-higher-bracket expectation.
   5. **Remainder of 401(k) to the limit** — traditional vs Roth split per below.
   6. **Mega Backdoor Roth** if the plan allows (after-tax contributions + in-plan Roth conversion or in-service rollover).
   7. **Taxable brokerage** — broad index, tax-efficient.
   8. **529 / I-Bonds / other earmarked savings** as relevant.
2. **Traditional vs Roth 401(k) decision.**
   - High current bracket and expected lower retirement bracket → Traditional.
   - Lower current bracket (early career) or expected higher retirement bracket / large tax-deferred balance already → Roth.
   - When unsure, split 50/50 (Decision rules B). Diversifies tax risk.
3. **Per-paycheck math.** Compute the % of pay to elect to hit the annual limit on the user's pay schedule, accounting for true-up (or its absence — some plans don't true-up, so front-loading risks missing match).
4. **Catch-up.** Age 50+ gets catch-up; age 60–63 (under SECURE 2.0) gets enhanced catch-up — amounts from `md_facts` → `irs_contribution_limits`.
5. **Limit sanity check.** 415(c) combined limit (employee + employer + after-tax) — Mega Backdoor Roth contributors can hit this ceiling.
6. **Cash flow gut check.** Recommended contribution % cannot exceed take-home reality. Surface this and propose phased ramp.

## Required citations

- Each limit cites the tax year and IRS source.
- Match formula cited to plan summary doc.
- Bracket assumption cited.

## Deliverable shape

- Markdown report `./money-desk/retirement-planner/contribution-optimizer-<YEAR>.md`:
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

## Determinism rules

### Input keys

Names match the `md_rp_skill_contribution_optimizer` intake schema; extra keys follow.

- `age` — integer, age on Dec 31 of the plan year
- `annual_salary` — number, $ gross (W-2 box 1 plus 401(k) deferrals)
- `current_401k_balance` — number, $
- `current_contribution_pct` — number, % of salary deferred today
- `employer_match` — string, e.g. `"100% up to 4%"`, `"50% up to 6%"`, or `"none"`
- `account_types` — list from `Traditional 401(k)`, `Roth 401(k)`, `After-tax contributions`, `In-plan Roth conversion`, `Mega Backdoor Roth path`
- `filing_status` — `Single` | `Married Filing Jointly` | `Married Filing Separately` | `Head of Household`
- `hdhp_enrolled` — boolean
- `spouse_working` — boolean
- `hsa_coverage` — `self_only` | `family`
- `magi_estimate_usd` — number
- `pay_periods_per_year` — integer (52, 26, 24, 12)
- `pay_periods_remaining` — integer, including the next paycheck
- `ytd_401k_deferral_usd` — number
- `plan_true_up` — boolean
- `high_interest_debt` — boolean (any debt with APR ≥ 8%)
- `federal_marginal_rate_pct` — number, current year
- `expected_retirement_marginal_rate_pct` — number or `unknown`
- `traditional_ira_pretax_balance_usd` — number (pro-rata rule for backdoor Roth)
- `monthly_cash_available_usd` — number, take-home $ the user can redirect to savings
- `employer_contribution_usd` — number, expected employer match + profit-sharing for the year

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Salary, age, match formula, filing status | **Ask — no default** | — |
| 401(k) deferral limit and catch-ups | `md_facts` → `irs_contribution_limits.401k_employee_deferral`, `.401k_employee_deferral_catchup_age_50_plus`, `.401k_employee_deferral_catchup_age_60_to_63_secure_2_0` | `[IRS 2026 limits]` |
| 415(c) total limit | `md_facts` → `irs_contribution_limits.401k_total_415c_limit_employee_plus_employer` | `[IRS 2026 limits]` |
| IRA limit and catch-up | `md_facts` → `irs_contribution_limits.ira_traditional_or_roth`, `.ira_catchup_age_50_plus` | `[IRS 2026 limits]` |
| HSA limit and catch-up | `md_facts` → `irs_contribution_limits.hsa_self_only` / `.hsa_family`, `.hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| Roth IRA income phase-out range; traditional-IRA deductibility phase-out | Roth: `md_facts` → `credits_and_ira_phaseouts_2026.roth_ira_contribution_phaseout_single_hoh` / `.roth_ira_contribution_phaseout_mfj` (MAGI `start`–`end`). Traditional: `md_facts` → `credits_and_ira_phaseouts_2026.traditional_ira_deduction_phaseout_covered_single_hoh` / `_covered_mfj` / `_spouse_of_covered_mfj`. MFS ranges ($0–$10,000) are statutory | `[IRS credits & IRA phase-outs 2026]` |
| Federal marginal rate | Derive from taxable income with `md_facts` → `income_tax_brackets_mfj_2026.brackets` (MFJ), `.brackets_single`, `.brackets_hoh` or `.brackets_mfs` | `[IRS 2026 brackets]` |
| Expected retirement marginal rate | `unknown` | `[ASSUMPTION]` |
| Pay periods | **Ask — no default** | — |
| True-up | `false` (conservative: pace contributions) | `[ASSUMPTION]` |
| Election increment | Whole percent of pay | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. **Limits for this age.** `deferral_limit = base` + catch-up: age 60–63 → the 60–63 catch-up key; age ≥ 50 otherwise → the 50+ catch-up key; else 0. IRA limit + IRA catch-up if age ≥ 50. HSA limit by `hsa_coverage` + HSA catch-up if age ≥ 55; HSA = 0 if not `hdhp_enrolled`.
2. **Match.** Parse `"M% up to C%"`: `match_cap_pct = C`; `match_usd = annual_salary × C/100 × M/100`. Tiered formulas: apply each tier in order. `"none"` → 0.
3. **Waterfall** — allocate `annual_budget = monthly_cash_available_usd × 12 + current deferral $` top-down; each bucket takes `min(remaining budget, bucket room)`:
   1. 401(k) to `match_cap_pct` of salary.
   2. HSA to its limit.
   3. If `high_interest_debt` → stop the waterfall here and route the remainder to Debt Strategist (flag).
   4. Roth IRA to the IRA limit — direct if MAGI is below the phase-out `start` (`md_facts` → `credits_and_ira_phaseouts_2026`; a reduced direct amount inside the range), backdoor if above and `traditional_ira_pretax_balance_usd = 0`; if above and pre-tax IRA balance > 0, skip and flag the pro-rata rule.
   5. 401(k) from the match cap up to `deferral_limit`.
   6. Mega Backdoor Roth (only if `After-tax contributions` and an in-plan conversion or in-service rollover are offered): room = `415c_limit − deferral_limit_used − employer_contribution_usd` (catch-up excluded from 415(c)).
   7. Taxable brokerage: the remainder.
4. **Traditional vs Roth split** of the 401(k) dollars — per Decision rules table B.
5. **Per-paycheck election.** `remaining_usd = 401k_total_target − ytd_401k_deferral_usd`; `per_check_salary = annual_salary / pay_periods_per_year`; `election_pct = remaining_usd / (pay_periods_remaining × per_check_salary) × 100`, rounded **up** to the next whole percent unless that would exceed `deferral_limit`, in which case round down and state the $ shortfall. If `plan_true_up = false`, `election_pct` may not drop below `match_cap_pct` in any period — if front-loading would hit the limit before the last paycheck, cap the election so the limit is reached on the last paycheck.
6. **Cash-flow check.** If the waterfall total / 12 > `monthly_cash_available_usd` + current deferral / 12, remove dollars from the bottom of the waterfall up (taxable → mega → 401(k) above match → Roth IRA → HSA); never below the match. Show a ramp: +1 pp of salary per quarter until the target.
7. Rounding: cents internally; whole dollars; election % as a whole number.

### Decision rules

**A. Waterfall gate** — evaluate top to bottom; first match wins.

| # | Condition | Action |
|---|---|---|
| 1 | Current contribution < `match_cap_pct` | First action: raise the election to at least `match_cap_pct` |
| 2 | `high_interest_debt = true` | Match + HSA only; extra cash to Debt Strategist |
| 3 | Waterfall total exceeds cash available | Ramp plan (step 6) |
| 4 | Otherwise | Full waterfall |

**B. Traditional vs Roth (401(k) dollars)** — first match wins.

| # | Condition | Split |
|---|---|---|
| 1 | Plan offers only one type | That type |
| 2 | `federal_marginal_rate_pct ≤ 12` | 100% Roth |
| 3 | `expected_retirement_marginal_rate_pct` known and < current rate | 100% Traditional |
| 4 | `expected_retirement_marginal_rate_pct` known and > current rate | 100% Roth |
| 5 | Otherwise (equal or `unknown`) | 50% Traditional / 50% Roth |

### Output template

```markdown
# Contribution Optimizer — {plan_year}

## Headline
Elect **{election_pct}%** per paycheck ({trad}% Traditional / {roth}% Roth); total tax-advantaged savings **${total}/yr**.

## Limits used
| Limit | Amount | Source |
|---|---|---|

## Waterfall
| Order | Bucket | $ / year | $ / month | Limit | Status |
|---|---|---|---|---|---|

## 401(k) split
{Traditional / Roth % — rule B# and the rates behind it}

## Per-paycheck election
| Item | Value |
|---|---|
| Remaining to contribute | |
| Pay periods remaining | |
| Election % | |
| True-up | |

## Cash-flow check
{ramp schedule — or "Fits current cash flow"}

## Plan-feature actions
- {HR questions, backdoor/pro-rata flags — or "None"}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
