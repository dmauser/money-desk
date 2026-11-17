## Quarterly Estimated Taxes

description: Compute Form 1040-ES quarterly estimated tax payments for self-employed / 1099 income (federal + state where applicable). Uses safe-harbor (100% / 110% of prior-year tax) by default; offers annualized-income method for users with uneven income. Includes self-employment tax. Does NOT make the payment.

## When to use

- First quarter of self-employment.
- Tax situation changed (major income spike, new dependents, S-corp election).
- After Q1/Q2 actuals differ materially from projection — re-baseline Q3/Q4.
- W-2 + side-1099 user whose withholding no longer covers total liability.

## Inputs needed

- Prior-year federal tax liability (Form 1040 line "Total tax" — line 24 for 2024 form).
- Prior-year AGI (drives safe-harbor 100% vs 110% threshold: 110% if prior-year AGI > $150k MFJ/$150k single).
- Current-year projection: gross SE revenue, deductible business expenses → projected net SE profit.
- Other current-year income: W-2 wages, interest, dividends, capital gains (incl. crypto), K-1 pass-through.
- Filing status, dependents, expected deductions (standard vs itemized).
- State of residence (for state estimated tax) and whether any current-year withholding from W-2 / pension exists.
- Date today (drives which quarters are remaining).

## Workflow

1. **Compute safe-harbor floor.**
   - If prior-year AGI ≤ $150k: pay 100% of prior-year total tax (or 90% of current-year liability, whichever is lower).
   - If prior-year AGI > $150k: pay 110% of prior-year total tax.
   - Safe-harbor avoids underpayment penalty regardless of how much current-year tax actually is.
2. **Compute current-year projection** (tighter than safe-harbor when income drops):
   - Federal income tax: project AGI → taxable income → tax owed (use current-year brackets, cite).
   - SE tax: net SE × 92.35% × (2 × `social_security_2026.fica_employee_rate`) up to `social_security_2026.wage_base`, plus 2 × `medicare_employee_rate` on all of it, + Additional Medicare above $200k/$250k (md_facts rate).
   - Subtract: half SE tax (deduction), QBI 20% deduction (where eligible), other adjustments.
   - Subtract: withholding from W-2 / pensions / 1099-R already in flight.
   - Net = total annual estimated tax due.
3. **Allocate across quarters.**
   - Simple method: equal quartiles (¼ of annual at each Q deadline: Apr 15, Jun 15, Sep 15, Jan 15 of following year).
   - Annualized-income installment method (Form 2210 Sch AI): for users with very lumpy income (e.g., consultant with big Q4 invoice), allocate by income-earned-by-quarter. More work; flag option but default to equal.
   - If today is past Q1/Q2: catch-up payment + remaining quartile split.
4. **State estimated tax.** Apply user's state rules (most parallel federal; some require equal quartiles, some support annualized; rates and brackets cite state DoR).
5. **Payment mechanics.** Recommend EFTPS (free, federal) or IRS Direct Pay for federal; state DOR portal for state. Note: paying via credit card incurs a 1.8–2.0% fee (usually not worth it unless chasing signup bonuses).

## Required citations

- Safe-harbor percentage cites IRC §6654 / IRS Pub 505.
- Current-year brackets, SS wage base, additional-Medicare thresholds cite IRS current-year tables.
- State estimated tax rules cite the state department-of-revenue.

## Deliverable shape

Markdown report `./money-desk/self-employed-planner/quarterly-tax-<YYYYMMDD>.md`:
- **Headline** — e.g., "Q3 estimated payment: $4,820 federal + $1,210 state, due Sep 15."
- **Annual projection table** — projected gross, deductions, net SE, income tax, SE tax, QBI, half-SE adjustment, total tax due.
- **Safe-harbor vs current-year comparison** — pick the smaller (still safe) for cash-flow.
- **Quarterly schedule** — Q1/Q2/Q3/Q4 with due dates and amounts (federal + state).
- **Payment instructions** — EFTPS / IRS Direct Pay / state portal URLs; warning to keep confirmation #.
- **What to revisit** — recompute mid-year if income deviates >20% from projection.

## Notes

- Q4 deadline (Jan 15) can be skipped if filing the return AND paying balance due by Jan 31 — niche tactic.
- W-2 withholding is treated as paid evenly across the year for underpayment-penalty purposes, even if all in Q4. This is why high-W-2-income spouses sometimes increase their W-4 withholding to cover the 1099 spouse's shortfall — clean and avoids estimated-tax mechanics.
- The penalty for underpayment is computed per quarter (it's an interest-rate-driven penalty, not a flat fee). The rate is set quarterly by the IRS (look up via `md_sources`; quote only if sourced); meaningful for large under-payments.
- For S-corp owners: W-2 payroll handles the income-tax + FICA withholding; estimated taxes typically only needed if K-1 distributions or other income create a balance-due situation.

## Determinism rules

### Input keys

- `tax_year` — integer
- `today` — YYYY-MM-DD
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `prior_year_total_tax_usd` — number; prior-year Form 1040 "total tax"
- `prior_year_agi_usd` — number
- `projected_gross_se_revenue_usd`, `projected_business_expenses_usd` — numbers; or `projected_net_se_profit_usd` directly
- `w2_wages_usd` — number; full-year projected (user and spouse combined), default 0
- `w2_ss_wages_usd` — number; full-year Social Security wages (box 3), default = `w2_wages_usd`
- `interest_dividends_usd`, `capital_gains_usd`, `k1_income_usd` — numbers; default 0
- `expected_withholding_usd` — number; full-year federal withholding from W-2 / pensions / 1099-R, default 0
- `estimated_payments_made` — list of `{ date, amount_usd }`; default empty
- `se_health_premiums_usd`, `se_retirement_contrib_usd` — numbers; default 0
- `deduction_type` — `standard` | `itemized`; `itemized_deductions_usd` — number if itemized
- `dependents_under_17` — integer; default 0
- `qbi_sstb` — bool; default false
- `state` — two-letter code
- `w2_pay_periods_remaining` — integer; default 0

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Prior-year total tax and AGI | **Ask — no default**; if truly unavailable, only the 90%-of-current-year test is used | `[ASSUMPTION]` |
| Projected net SE profit | **Ask — no default** | — |
| SS wage base | `md_facts` → `social_security_2026.wage_base` | `[SSA 2026]` |
| SS and Medicare rates (SE tax = 2 × employee rate) | `md_facts` → `social_security_2026.fica_employee_rate`, `medicare_employee_rate` | `[SSA 2026]` |
| Additional Medicare | `md_facts` → `social_security_2026.additional_medicare_rate_above_threshold_mfj_250k`; thresholds $250,000 MFJ / $125,000 MFS / $200,000 other (statutory) | `[SSA 2026]` |
| SE earnings factor | 92.35% (statutory, Schedule SE) | — |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` | `[IRS 2026 brackets]` |
| Brackets — MFJ | `md_facts` → `income_tax_brackets_mfj_2026.brackets` | `[IRS 2026 brackets]` |
| Brackets — other statuses, Child Tax Credit amount | Brackets: Single / HoH / MFS: `md_facts` → `income_tax_brackets_mfj_2026.brackets_single` / `.brackets_hoh` / `.brackets_mfs`. CTC: `md_facts` → `credits_and_ira_phaseouts_2026.child_tax_credit_max_per_child`, `.child_tax_credit_refundable_max_per_child`, `.child_tax_credit_phaseout_start_mfj` / `_other` (credit falls `.child_tax_credit_phaseout_per_1000_over` dollars per $1,000 of MAGI above the start) | `[IRS 2026 brackets]` / `[IRS credits & IRA phase-outs 2026]` |
| QBI rate and threshold | `md_facts` → `qbi_section_199a_2026.deduction_rate`, `phase_in_start_mfj` / `phase_in_start_single` | `[IRS QBI 2026]` |
| State estimated-tax rules and rates | Not in md_facts — look up via `md_sources` (state DoR), else state section reads "Not computed — [UNSOURCED]" | `[UNSOURCED]` |
| Capital gains taxed as | Ordinary income (conservative — overstates tax) | `[ASSUMPTION]` |
| IRS underpayment interest rate | Not in md_facts — look up via `md_sources`; quote only if sourced | `[UNSOURCED]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Compute in cents; report whole dollars. md_facts rates are decimals.

1. **Net SE profit** `p = projected_net_se_profit_usd` or `gross − expenses`. `se_base = p × 0.9235` (0 if `se_base < $400`, statutory).
2. **SE tax.** `ss = 2 × fica_employee_rate × min(se_base, max(0, wage_base − w2_ss_wages_usd))`; `med = 2 × medicare_employee_rate × se_base`; `se_tax = ss + med`. `half_se = se_tax / 2`.
3. **Additional Medicare** `= rate × max(0, w2_wages_usd + se_base − threshold)`, minus any amount already withheld by the employer (if known; else none).
4. **AGI** `= w2_wages_usd + p + interest_dividends_usd + capital_gains_usd + k1_income_usd − half_se − se_health_premiums_usd − se_retirement_contrib_usd`.
5. **QBI deduction.** `qbi = p − half_se − se_health_premiums_usd − se_retirement_contrib_usd`. `ti_pre = max(0, AGI − deduction)`. If `ti_pre ≤ phase_in_start`: `qbi_ded = deduction_rate × min(qbi, ti_pre − capital_gains_usd)` (floor 0). If above: `qbi_ded = 0` here (conservative) and flag for **Business Deductions & QBI Review**.
6. **Income tax** on `taxable = max(0, ti_pre − qbi_ded)` via brackets; subtract CTC (non-refundable floor 0).
7. **Current-year liability** `L = income_tax + se_tax + additional_medicare`.
8. **Required annual payment.** `prior_pct = 110%` if `prior_year_agi_usd > $150,000` ($75,000 MFS), else 100%. `req = min(0.90 × L, prior_pct × prior_year_total_tax_usd)` (or `0.90 × L` if prior-year tax absent).
9. **Net to cover by estimates** `E = max(0, req − expected_withholding_usd)`.
10. **Installments.** Due dates Apr 15, Jun 15, Sep 15 of `tax_year`, Jan 15 of the next year (roll to the next business day on weekends/holidays). Cumulative required by installment k = `E × k / 4`. Paid-to-date = sum of `estimated_payments_made`. For the next unpassed installment k: `due_now = max(0, E × k/4 − paid_to_date)`; each later installment = `E / 4`. Round each payment **up** to the next whole dollar.
11. **W-4 alternative** (only if `w2_pay_periods_remaining > 0`): `extra_per_period = ceil((E − paid_to_date) / w2_pay_periods_remaining)`.
12. **Revisit trigger:** recompute when actual year-to-date net SE profit deviates from `p × months_elapsed / 12` by more than 20%.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Net SE profit or filing status missing | No schedule — ask |
| 2 | `L − expected_withholding_usd < $1,000` (IRC §6654(e)(1) de minimis — verify via IRS Pub 505) | No federal estimates required; show the projected balance due |
| 3 | `w2_pay_periods_remaining > 0` | Primary: add `extra_per_period` to W-4 Step 4(c) (withholding counts as paid evenly); alternative: the step-10 schedule |
| 4 | Otherwise | Pay the step-10 schedule (`due_now` at the next deadline, then `E/4`); basis = whichever of 90% current / {100|110}% prior set `req` |

Annualized-income method (Form 2210 Schedule AI) is mentioned as an option whenever the user reports uneven income, but the default schedule is always step 10.

### Output template

```markdown
# Quarterly Estimated Taxes — {tax_year}

## Headline
Next payment: **${due_now} federal** + **${state_due} state** due **{date}**. Basis: {90% current-year | 100% / 110% prior-year} safe harbor (rule #{n}).

## Annual projection
| Line | Amount | Source |
|---|---|---|
| Gross SE revenue | | |
| Business expenses | | |
| Net SE profit | | |
| SE tax (SS + Medicare) | | |
| Half-SE adjustment | | |
| QBI deduction | | |
| Income tax | | |
| Additional Medicare | | |
| **Total liability (L)** | | |

## Safe-harbor vs current-year
| Test | Amount |
|---|---|
| 90% of current-year | |
| {100|110}% of prior-year | {amount or "Not applicable — prior-year tax not supplied"} |
| Required (lower) | |
| Less withholding | |
| Net by estimates (E) | |

## Quarterly schedule
| Installment | Due date | Federal | State | Status (paid / due / future) |
|---|---|---|---|---|

## Payment instructions
- Federal: EFTPS or IRS Direct Pay — keep the confirmation number.
- State: {state DoR portal — or "Not computed — [UNSOURCED]"}

## What to revisit
- Recompute if YTD net SE profit deviates > 20% from projection.

## Assumptions & flags
- {each [ASSUMPTION] / [UNSOURCED] item}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
