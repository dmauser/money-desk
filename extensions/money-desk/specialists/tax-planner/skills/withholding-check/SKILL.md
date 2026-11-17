# Withholding Check

description: Project full-year federal tax liability vs YTD withholding from pay stubs. Recommends W-4 adjustments or quarterly estimated payments to stay inside safe-harbor. Use mid-year and Q4 to avoid surprise bills or large refunds.

## When to use

- Mid-year (June/July) tune-up.
- Q4 (Oct/Nov) — last chance to fix via W-4 before year-end.
- After a comp change (raise, RSU vest, bonus), a job change, or marriage/divorce.
- Self-employed users sanity-checking estimated payments.

## Inputs needed

- Most recent pay stub(s) with YTD figures — gross, federal withholding, SS/Medicare, state, retirement contributions, HSA.
- Expected remaining-year income (especially bonuses, RSU vests, year-end stock).
- Filing status, number of dependents claimed on W-4.
- Other income: spouse W-2, 1099 income, brokerage interest/dividends estimate, expected capital gains.
- Tax year and state.
- Prior year tax liability (for safe-harbor calculation).

## Workflow

1. **Annualize YTD income.** Scale YTD gross by `pay_periods_per_year / completed periods` (see Determinism rules), then add expected discrete events (bonus, RSU vest, year-end commission).
2. **Compute projected taxable income.** Subtract pre-tax 401(k), HSA, traditional IRA contributions (above-the-line), and standard deduction (or itemized if applicable).
3. **Compute projected federal tax liability.** Apply current-year brackets. Add Additional Medicare (rate and thresholds per Determinism rules → Assumptions), NIIT (3.8% on investment income above the md_facts MAGI threshold). Subtract non-refundable credits (child tax credit, etc.).
4. **Compute YTD federal withholding annualized.** Sum YTD withholding × (`pay_periods_per_year` / completed periods).
5. **Compare and gap.**
   - If projected refund ≥ $1,000 (Decision rule 5): refund coming. Reduce withholding (more allowances or lower extra-withholding on W-4) to put cash flow back in the user's pocket monthly.
   - If projected payments fall short of the liability: underpayment. Check safe-harbor (paid ≥100% of last year's liability, or 110% if AGI > $150k, OR ≥90% of current year). If safe-harbor is met, fine. If not, increase W-4 extra-withholding for remaining year OR make a Q4 estimated payment.
6. **For self-employed users:** verify SE tax (2 × `social_security_2026.fica_employee_rate` up to `wage_base`, plus 2 × `medicare_employee_rate`, on 92.35% of net SE earnings) is being covered via estimates, and that quarterly estimates are on track.
7. **Output recommendations.** Specific W-4 line changes or a $X quarterly estimated payment with the EFTPS / IRS Direct Pay path.

## Required citations

- Pay-stub fields cited by line/box on the stub.
- Bracket and limit assumptions cited to the tax year explicitly ("2026 brackets, MFJ").
- Safe-harbor calculation shown with the prior-year liability and 100%/110% threshold.

## Deliverable shape

- Markdown report `./money-desk/tax-planner/withholding-check-<YYYYMMDD>.md`:
  - **Headline gap** — "Projected $X liability vs $Y withholding = $Z under/over."
  - **Annualization details** — YTD math.
  - **Liability buildup** — bracket-by-bracket.
  - **Safe-harbor analysis** — required minimum and current run-rate.
  - **Recommended action** — specific W-4 changes or estimated-payment amount with deadline.

## Notes

- Bonus / RSU withholding is often at the flat 22% supplemental rate, which under-withholds high earners. Surface this — a "fully withheld" RSU is almost never actually fully withheld.
- State withholding works similarly but with state-specific rules; flag state assumptions.
- Pre-tax 401(k) contributions reduce federal taxable income but not SS/Medicare wages — don't double-count.
- The safe-harbor test uses **withholding + estimates**, not just withholding.

## Determinism rules

### Input keys

Names match the `md_tx_skill_withholding_check` intake schema; extra optional keys follow.

- `filing_status` — `Single` | `Married Filing Jointly` | `Married Filing Separately` | `Head of Household`
- `ytd_gross_wages` — number, USD; pay-stub YTD gross (user)
- `ytd_federal_withheld` — number, USD; YTD federal income tax withheld (user)
- `ytd_state_withheld` — number, USD; default 0 (reported only; not used in the federal math)
- `pay_periods_remaining` — integer, 0–53; pay periods left in the calendar year
- `spouse_ytd_wages` — number, USD; default 0
- `spouse_ytd_withheld` — number, USD; default 0
- `other_income` — number, USD; full-year expected 1099 / interest / dividends / rental / gains; default 0
- `expected_deduction` — `Standard` | `Itemized (will exceed standard)`
- `dependents_under_17` — integer; default 0
- `pay_periods_per_year` — integer (52 / 26 / 24 / 12); optional, read from the pay-stub frequency
- `ytd_pretax_deductions_usd` — number; YTD pre-tax 401(k)/403(b) + HSA + Section 125 amounts NOT already excluded from `ytd_gross_wages`; optional, default 0
- `itemized_deductions_usd` — number; required only when `expected_deduction` is Itemized
- `expected_discrete_income_usd` — number; bonuses / RSU vests / commissions still to be paid this year; default 0
- `expected_discrete_withholding_usd` — number; withholding expected on those discrete events; default 0
- `estimated_payments_ytd_usd` — number; 1040-ES payments already made; default 0
- `prior_year_total_tax_usd` — number; prior-year Form 1040 "total tax"; optional
- `prior_year_agi_usd` — number; prior-year AGI; optional

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| YTD wages, YTD withholding, pay periods remaining, filing status | **Ask — no default** | — |
| Pay periods per year | Read from pay-stub frequency; if unknown, **Ask — no default** | `[USER-PROVIDED]` |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` (MFS = `standard_deduction_single`) | `[IRS 2026 brackets]` |
| Ordinary brackets — MFJ | `md_facts` → `income_tax_brackets_mfj_2026.brackets` | `[IRS 2026 brackets]` |
| Ordinary brackets — Single / MFS / HoH | Single: `md_facts` → `income_tax_brackets_mfj_2026.brackets_single`; HoH / MFS: not in md_facts — look up via `md_sources`, else tag `[UNSOURCED]`; stop at step 5 if unsourced | `[UNSOURCED]` |
| Additional Medicare Tax rate | `md_facts` → `social_security_2026.additional_medicare_rate_above_threshold_mfj_250k`; thresholds $250,000 MFJ / $125,000 MFS / $200,000 other (statutory, not indexed) | `[SSA 2026]` |
| NIIT threshold | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `niit_threshold_single`; rate 3.8% (statutory) | `[IRS 2026 brackets]` |
| Child Tax Credit per child | Not in md_facts — look up via `md_sources`, else tag `[UNSOURCED]` and use $0 (overstates tax; conservative) | `[UNSOURCED]` |
| Spouse's remaining-year wages and withholding | Annualized with the user's elapsed-period ratio (step 2) | `[ASSUMPTION]` |
| Character of `other_income` | Taxed as ordinary income (no preferential LTCG / qualified-dividend rate) — conservative | `[ASSUMPTION]` |
| Prior-year total tax | If absent, the prior-year safe harbor is skipped and only the 90%-of-current-year test is used | `[ASSUMPTION]` |

### Calculation method

Compute in cents; report whole dollars. md_facts rates are decimals (0.009 = 0.9%).

1. **Elapsed periods.** `completed = pay_periods_per_year − pay_periods_remaining`. If `completed ≤ 0`, stop: ask for a pay stub with at least one completed period.
2. **Annualize.** `ratio = pay_periods_per_year / completed`.
   - `proj_wages = (ytd_gross_wages − ytd_pretax_deductions_usd) × ratio + spouse_ytd_wages × ratio + expected_discrete_income_usd`
   - `proj_withholding = ytd_federal_withheld × ratio + spouse_ytd_withheld × ratio + expected_discrete_withholding_usd`
   - `proj_payments = proj_withholding + estimated_payments_ytd_usd`
3. **AGI.** `agi = proj_wages + other_income`.
4. **Taxable income.** `deduction = itemized_deductions_usd` if `expected_deduction` is Itemized **and** it exceeds the standard deduction, else the md_facts standard deduction for the filing status. `taxable = max(0, agi − deduction)`.
5. **Regular tax.** Apply the bracket table for the filing status: for each bracket, `tax += rate × max(0, min(taxable, max) − min)` (a `null` max = no cap). If no bracket table is available for the filing status, stop here and report "liability not computable — bracket table unavailable".
6. **Add-on taxes.** Additional Medicare = `rate × max(0, combined Medicare wages − threshold)` where combined Medicare wages = `ytd_gross_wages × ratio + spouse_ytd_wages × ratio + expected_discrete_income_usd` (pre-tax 401(k) does NOT reduce Medicare wages). NIIT = `0.038 × min(other_income, max(0, agi − niit_threshold))` (treats all `other_income` as net investment income — conservative).
7. **Credits.** `ctc = dependents_under_17 × ctc_per_child`; `liability = max(0, regular_tax − ctc) + additional_medicare + niit`.
8. **Gap.** `gap = liability − proj_payments` (positive = balance due, negative = refund).
9. **Safe harbor.** `prior_pct = 110%` if `prior_year_agi_usd > $150,000` ($75,000 if MFS), else `100%` (IRC §6654(d)(1)(C) — verify via IRS Pub 505). `required = min(0.90 × liability, prior_pct × prior_year_total_tax_usd)`; if prior-year tax is absent, `required = 0.90 × liability`. `shortfall = max(0, required − proj_payments)`.
10. **W-4 adjustment.** If `pay_periods_remaining > 0`: `per_period = ceil(amount / pay_periods_remaining)` to the next whole dollar, where `amount` is `shortfall` (rule 3), `gap` (rule 4), or `min(−gap, proj_payments − required)` (rule 5, so the reduction never drops payments below the safe harbor). If `pay_periods_remaining = 0`, the action is a single 1040-ES payment of `amount` due by the next estimated-tax deadline.
11. **Verification line.** Show the step-2 annualization and the step-8 subtraction with the actual numbers.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Step 1 or step 5 stopped | No recommendation — list the missing input |
| 2 | Self-employment income is part of `other_income` | Run steps 1–11, then route SE tax to **Quarterly Estimated Taxes** (Self-Employed Planner) before acting |
| 3 | `shortfall > 0` | Underpaid vs safe harbor — add `per_period` to W-4 Step 4(c) extra withholding (or one 1040-ES payment if no periods remain) |
| 4 | `gap ≥ $1,000` (safe harbor met) | Safe harbor met — expect a balance due of $gap; optionally add `per_period` to W-4 Step 4(c) to avoid a lump sum |
| 5 | `gap ≤ −$1,000` | Over-withheld — reduce W-4 Step 4(c) extra withholding (or raise Step 4(b) deductions) by `per_period` |
| 6 | Otherwise (`−$1,000 < gap < $1,000`) | On track — no W-4 change |

### Output template

```markdown
# Withholding Check — {tax_year}, {filing_status}

## Headline
Projected liability **${liability}** vs projected payments **${proj_payments}** = **${abs_gap} {under|over}**. Recommendation: **{decision rule # and action}**.

## Annualization
| Item | YTD | Ratio | Projected full year | Source |
|---|---|---|---|---|

## Liability buildup
| Line | Amount | Source / rate |
|---|---|---|
| AGI | | |
| Deduction ({standard|itemized}) | | |
| Taxable income | | |
| Regular tax (bracket by bracket) | | |
| Additional Medicare | | |
| NIIT | | |
| Child Tax Credit | | |
| **Total liability** | | |

## Safe-harbor analysis
| Test | Amount |
|---|---|
| 90% of current-year liability | |
| {100|110}% of prior-year tax | {amount or "Not applicable — prior-year tax not supplied"} |
| Required | |
| Projected payments | |
| Shortfall | |

## Recommended action
{W-4 Step 4(c) change per period, or 1040-ES amount and due date, or "No change"}

## Verification
{step-2 annualization and step-8 gap arithmetic}

## Assumptions & flags
- {each [ASSUMPTION] / [UNSOURCED] item, supplemental-wage under-withholding flag, state assumptions}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).