## 529 Plan Review

description: Audit an existing 529 college-savings plan: state plan choice, fund lineup and expense ratios, age-based glidepath, beneficiary correctness, state tax deduction or recapture exposure, and whether to roll to a better plan. Use when the user wants a tune-up of an existing 529 (not selecting a first one).

## When to use

- The user has a 529 they "set up years ago" and never reviewed.
- After a state move (state tax deduction may shift; some states have recapture).
- When considering changing beneficiaries (kid 2 → kid 1, parent → kid).
- Before approaching college (glidepath should be majority bonds/cash within 3–5y of college).

## Inputs needed

- 529 plan statement (most recent): plan name (e.g., "Utah my529", "NY 529 Direct Plan"), balance, monthly contribution, beneficiary, fund holdings.
- User's state of residence (for tax-deduction analysis).
- Beneficiary's expected college start year.
- Whether the user is currently taking the state-tax deduction.

## Workflow

1. **State plan vs out-of-state plan.** Identify whether the current plan is the user's own state's plan. If not, quantify the state-tax-deduction lost ($x/yr at user's marginal state rate) and weigh against expense-ratio savings of the chosen plan. Note: some states (e.g., NY, VA, IN, MD) require *in-state* plan to claim deduction; others (AZ, KS, MN, MO, MT, PA) allow deduction for any state's plan.
2. **Fund lineup audit.** List holdings, expense ratio of each, age-based / target-date glidepath if applicable. Flag funds with expense ratio > 0.20% as expensive for a 529.
3. **Glidepath check.** Plot current stock/bond allocation against years-to-college. Heuristic: 80% stocks when 15+ years out, sliding linearly to 20% stocks at college start (similar to a target-date retirement fund but compressed; Determinism rules step 3).
4. **Beneficiary check.** Confirm beneficiary is correct and SSN is right. Confirm successor owner is set (matters if the parent dies before the child uses the funds).
5. **Recapture risk.** If the user moved states or is contemplating rolling to a different state's plan, flag recapture rules (e.g., NY recaptures the state deduction on rollover out).
6. **2024+ rules.** Note new 529-to-Roth IRA rollover (lifetime cap `md_facts` → `fafsa_and_education_2026_27.529_to_roth_rollover_secure_2_0_lifetime_cap`; account age ≥ `.529_to_roth_rollover_account_minimum_age_years`; annual IRA contribution limits apply); flag if relevant.

## Required citations

- Plan name cites the statement.
- Expense ratios cite the plan's official disclosure (state .gov or plan website).
- State-tax-deduction $ amount cites the user's marginal state rate and current contribution.

## Deliverable shape

Markdown report `./money-desk/<CHILD>/529-review-<YYYYMMDD>.md`:
- **Headline** — e.g., "Plan is fine but glidepath is 5 years behind; rolling to in-state would gain $440/yr in state tax savings."
- **Plan summary table** — plan, state, balance, monthly contribution, beneficiary, successor.
- **Fund audit table** — fund, % of portfolio, expense ratio, asset class, flag.
- **Glidepath chart** (text-based OK) — current vs recommended stock/bond mix by years-to-college.
- **Action list** — ranked by $ impact, with the actual steps (which form, which website).

## Notes

- 529-to-Roth rollover (SECURE 2.0): lifetime cap and minimum account age per `md_facts` (`fafsa_and_education_2026_27`), last 5 years of contributions can't be rolled, subject to annual Roth IRA contribution limits and earned-income requirement. Useful for "what if Kid doesn't go to college" — but not a primary planning tool.
- Apprenticeships and student-loan payments (up to $10k lifetime) are now qualified 529 expenses.
- For high earners, the state-tax deduction is often a smaller win than the lower expense ratios at the cheapest plans (UT, NY, IL Bright Start). Show the user the math.

## Determinism rules

### Input keys

- `plan_name`, `plan_state` — strings
- `residence_state` — two-letter code
- `balance_usd` — number
- `monthly_contribution_usd` — number
- `holdings` — list of `{ fund, pct_of_account, expense_ratio_pct, equity_pct }` (expense ratio `0.15` = 0.15%)
- `college_start_year` — integer
- `review_year` — integer
- `beneficiary_correct` — bool; `successor_owner_named` — bool
- `taking_state_deduction` — bool
- `state_marginal_rate_pct` — number, %
- `state_deduction_cap_usd` — number, annual deductible contribution cap of the residence state (0 if none)
- `state_deduction_requires_in_state_plan` — bool
- `alternative_plan` — `{ name, state, weighted_expense_ratio_pct }` (optional)
- `recapture_on_rollout_usd` — number, state deduction recapture if rolled out (default 0)
- `account_opened_year` — integer (for the 529-to-Roth check)
- `beneficiary_has_earned_income` — bool

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Holdings and expense ratios | **Ask — no default**; plan disclosure document | — |
| State deduction cap, in-state requirement, recapture | Not in md_facts (`fafsa_and_education_2026_27.529_state_deduction_varies` is true) — look up the state plan / revenue department via `md_sources`, else `[UNSOURCED]` and set the deduction value to "Unknown" | `[UNSOURCED]` until sourced |
| State marginal rate | **Ask — no default** | — |
| Target equity glidepath | Linear from 80% equity at ≥ 15 years to college down to 20% at college start (the Workflow heuristic) | `[ASSUMPTION]` |
| 529-to-Roth lifetime cap and account age | `md_facts` → `fafsa_and_education_2026_27.529_to_roth_rollover_secure_2_0_lifetime_cap`, `.529_to_roth_rollover_account_minimum_age_years` | `[FSA / Ed Dept 2026-27]` |
| Annual Roth limit for rollovers | `md_facts` → `irs_contribution_limits.ira_traditional_or_roth` | `[IRS 2026 limits]` |
| Alternative plan | **Ask**; if none supplied, the switch test is skipped | — |

### Calculation method

1. `years_to_college = max(0, college_start_year − review_year)`.
2. **Weighted expense ratio** = Σ(`pct_of_account` × `expense_ratio_pct`) / 100, 2 decimals of a percent. Flag every fund with `expense_ratio_pct > 0.20`.
3. **Actual equity %** = Σ(`pct_of_account` × `equity_pct`) / 100. **Target equity %** = `20 + 60 × min(years_to_college, 15) / 15`. `glidepath_drift = actual − target` (percentage points).
4. **State deduction value (current plan)** = `min(monthly_contribution_usd × 12, state_deduction_cap_usd) × state_marginal_rate_pct / 100` if the current plan qualifies (in-state, or the state allows any plan); else 0.
5. **Switch test** (if `alternative_plan`): `fee_saving = (current weighted ER − alternative ER)/100 × balance_usd`; `deduction_change` = alternative plan's deduction value (step 4 rules) − current plan's; `annual_benefit = fee_saving + deduction_change`; `one_time_cost = recapture_on_rollout_usd`; `net_benefit_to_college = annual_benefit × max(1, years_to_college) − one_time_cost`.
6. **529-to-Roth eligibility:** `review_year − account_opened_year ≥ minimum age` and `beneficiary_has_earned_income`; remaining capacity = lifetime cap − prior rollovers; annual amount ≤ the IRA limit.
7. Compute in cents; report whole dollars; percentages to 2 decimals for expense ratios, 0 decimals for allocation.

### Decision rules

Evaluate top to bottom; the first match is the headline recommendation. All other flags still go in the action list, ranked by annual $ impact.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Holdings or expense ratios missing | No recommendation — collect the statement / disclosure |
| 2 | `beneficiary_correct = false` or `successor_owner_named = false` | Fix beneficiary / name a successor owner first (form with the plan) |
| 3 | Switch test run and `net_benefit_to_college > 0` and `annual_benefit ≥ $100` | Roll to `alternative_plan` (one rollover per 12 months per beneficiary) |
| 4 | `abs(glidepath_drift) > 10` points | Rebalance to the target equity % (or move to the plan's age-based portfolio) |
| 5 | Any fund with expense ratio > 0.20% | Swap flagged funds for the plan's lowest-cost index option in the same asset class |
| 6 | Qualifying plan and `taking_state_deduction = false` and step-4 value > 0 | Start claiming the state deduction |
| 7 | Otherwise | Keep the plan as is |

### Output template

```markdown
# 529 Plan Review — {beneficiary}, {YYYY-MM-DD}

## Headline
{recommendation} (Decision rule #{n}).

## Plan summary
| Plan | State | Balance | Monthly contribution | Beneficiary OK | Successor owner |
|---|---|---|---|---|---|

## Fund audit
| Fund | % of account | Expense ratio | Equity % | Flag |
|---|---|---|---|---|
Weighted expense ratio: {x}%

## Glidepath
| Years to college | Actual equity % | Target equity % | Drift |
|---|---|---|---|

## State tax
{deduction value, in-state requirement, recapture — or "Not applicable — state has no 529 deduction"}

## Plan switch
{fee saving, deduction change, recapture, net benefit — or "Not applicable — no alternative plan supplied"}

## 529-to-Roth
{eligibility and remaining capacity — or "Not applicable — account under the minimum age / not relevant"}

## Action list (ranked by $ impact)
| # | Action | Annual $ impact | How |
|---|---|---|---|
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).