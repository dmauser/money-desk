# Refinance Analysis

description: Evaluate refinancing a mortgage, auto loan, or personal loan: break-even months, lifetime savings, NPV at the user's discount rate. Decision: refi / don't / wait. Use when rates have moved or when the user's profile has improved (credit score, equity, income).

## When to use

- Rate environment moved (>~50–75 bps lower than current loan).
- Credit score has improved materially.
- User's mortgage PMI removal is in sight (refi can drop it).
- ARM is approaching reset.

## Inputs needed

- Current loan: balance, original term, months remaining, current rate, monthly P&I, escrowed amount (mortgage), PMI status, prepayment penalty (rare).
- Proposed loan: rate, term, total closing costs (origination + appraisal + title + recording + lender fees), lender credits if any.
- Time the user expects to stay in the home / keep the car.
- Tax-deduction status (mortgage interest deductibility if itemizing — usually moot under TCJA standard deduction).

## Workflow

1. **Build the new payment.** P&I given new rate and term.
2. **Compute monthly savings** = old P&I − new P&I (note: extending term lowers monthly but extends payoff and increases lifetime interest).
3. **Break-even months** = total closing costs / monthly savings. If the user plans to keep the loan past breakeven, refi is favorable.
4. **Lifetime interest comparison.** Old loan: remaining interest if continued to maturity. New loan: total interest over new term. Net delta.
5. **NPV check (optional, more rigorous).** Discount the savings stream at the user's opportunity-cost rate (often equal to the loan rate). Compare to upfront cost.
6. **Cash-in / cash-out variants** (mortgage):
   - Cash-out raises balance and may push back into PMI or jumbo territory.
   - Cash-in (paying down at refi) can drop into a better LTV bucket.
7. **Same-term vs reset-term decision.** Refi-ing a 30y mortgage with 22 years left into a fresh 30y resets — lower payment but more total interest. A 22y or 25y custom term often preserves payoff timeline.
8. **Edge cases:**
   - ARM with low initial period — model the reset path before committing.
   - Auto refi: short remaining term often means closing costs swamp savings.
   - HELOC / personal loan: variable rate risk in the proposal.

## Required citations

- Quoted new loan terms cite the Loan Estimate doc/page.
- Current loan terms cite the most recent statement.
- Closing-cost line items broken out (recording fees etc. roll into states/counties — note assumptions).

## Deliverable shape

- Markdown report `./reports/debt-strategist/refinance-analysis-<YYYYMMDD>.md`:
  - **Headline verdict** — Refi now / wait / don't, with the strongest reason.
  - **Side-by-side payment table** — current vs proposed.
  - **Break-even months.**
  - **Lifetime interest** — current vs proposed.
  - **Sensitivity** — what if rates drop 25 bps more / closing costs are 20% higher?
  - **Action list** — get N quotes, lock rate timing, document checklist.

## Optional CLI

```
python build_refi_analysis.py [--loan-estimate PATH] [--current-statement PATH]
```

## Notes

- Always shop ≥3 lenders. Loan estimates are standardized — apples-to-apples.
- Don't compare "monthly savings" without break-even months — refinancing from 30y/22-remaining to a new 30y often shows "savings" that aren't real.
- Watch for "no closing cost" loans — the cost is usually baked into a higher rate. Model both options.
- "Not professional financial advice."
