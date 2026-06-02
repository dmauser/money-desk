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

1. **Annualize YTD income.** Take YTD gross at pay-period N of 26, scale to full year, then add expected discrete events (bonus, RSU vest, year-end commission).
2. **Compute projected taxable income.** Subtract pre-tax 401(k), HSA, traditional IRA contributions (above-the-line), and standard deduction (or itemized if applicable).
3. **Compute projected federal tax liability.** Apply current-year brackets. Add Additional Medicare (0.9% above threshold), NIIT (3.8% on investment income above MAGI threshold). Subtract non-refundable credits (child tax credit, etc.).
4. **Compute YTD federal withholding annualized.** Sum YTD withholding × (26 / N pay periods completed).
5. **Compare and gap.**
   - If withholding >> liability: refund coming. Reduce withholding (more allowances or lower extra-withholding on W-4) to put cash flow back in the user's pocket monthly.
   - If withholding << liability: underpayment. Check safe-harbor (paid ≥100% of last year's liability, or 110% if AGI > $150k, OR ≥90% of current year). If safe-harbor is met, fine. If not, increase W-4 extra-withholding for remaining year OR make a Q4 estimated payment.
6. **For self-employed users:** verify SE tax (15.3% on net SE earnings up to SS base) is being covered via estimates, and that quarterly estimates are on track.
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).