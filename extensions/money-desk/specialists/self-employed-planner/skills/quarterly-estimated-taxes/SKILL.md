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
   - SE tax: net SE × 92.35% × 15.3% (up to SS wage base $176,100 for 2025), then 2.9% Medicare on remainder, +0.9% Additional Medicare above $200k/$250k.
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

Markdown report `./reports/self-employed-planner/quarterly-tax-<YYYYMMDD>.md`:
- **Headline** — e.g., "Q3 estimated payment: $4,820 federal + $1,210 state, due Sep 15."
- **Annual projection table** — projected gross, deductions, net SE, income tax, SE tax, QBI, half-SE adjustment, total tax due.
- **Safe-harbor vs current-year comparison** — pick the smaller (still safe) for cash-flow.
- **Quarterly schedule** — Q1/Q2/Q3/Q4 with due dates and amounts (federal + state).
- **Payment instructions** — EFTPS / IRS Direct Pay / state portal URLs; warning to keep confirmation #.
- **What to revisit** — recompute mid-year if income deviates >20% from projection.

## Notes

- Q4 deadline (Jan 15) can be skipped if filing the return AND paying balance due by Jan 31 — niche tactic.
- W-2 withholding is treated as paid evenly across the year for underpayment-penalty purposes, even if all in Q4. This is why high-W-2-income spouses sometimes increase their W-4 withholding to cover the 1099 spouse's shortfall — clean and avoids estimated-tax mechanics.
- The penalty for underpayment is computed per quarter (it's an interest-rate-driven penalty, not a flat fee). Currently ~8% APR; meaningful for large under-payments.
- For S-corp owners: W-2 payroll handles the income-tax + FICA withholding; estimated taxes typically only needed if K-1 distributions or other income create a balance-due situation.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).