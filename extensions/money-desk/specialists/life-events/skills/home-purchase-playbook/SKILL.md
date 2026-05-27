# Home Purchase Playbook

description: Pre-approval through 90-days-post-close runbook for buying a home. Sizes affordability honestly (PITI + maintenance + opportunity cost vs the equity-building myth), audits the loan offer, plans the down-payment + closing-cost + reserve stack, and queues post-close insurance + estate updates.

## When to use

- User is house-hunting or about to be.
- Under contract — inspection / appraisal / financing window.
- Within 90 days post-close (insurance + estate + tax updates still timely).
- "Should I buy or keep renting?" question.

## Inputs needed

- Household income (gross), all sources.
- Existing debts (student loans, car, credit cards) for DTI.
- Credit score (or run `md_ci_skill_credit_report_review` first).
- Cash available for down payment + closing + reserves.
- Target home price range, state + county (property tax & insurance vary wildly).
- Current rent (the comparison baseline).
- Time horizon — how long do you plan to stay?

## Workflow (sub-skill orchestration)

### Pre-approval phase

1. **Credit posture** — `md_ci_skill_score_improvement_plan` if score < 760. Every 20-point band can move the mortgage rate.
2. **Affordability math** — honest version:
   - **PITI** (Principal + Interest + Taxes + Insurance) — start here, not just P+I.
   - **HOA/condo fee** if applicable.
   - **PMI** if down payment < 20%.
   - **Maintenance reserve**: 1–2% of home value/yr (older + bigger = more).
   - **Cap PITI+HOA at ~28% of gross income** (front-end DTI); total debt at ≤36%. Lender will go higher; don't.
3. **Buy-vs-rent** — run `md_pa_skill_total_cost_of_ownership` for a buy scenario and compare to current rent × expected hold period. Surface opportunity cost of down payment.
4. **Down-payment stack:**
   - Target 20% down to avoid PMI **OR** intentionally put less and invest the difference (legitimate strategy with low rates; less compelling at high rates).
   - Closing costs: 2–5% of price (estimate 3%).
   - Reserves: 3–6 months of PITI in cash after close.
   - Total cash need = DP + CC + reserves. If the user has just enough for DP, they're under-cashed.
5. **Goal-Based Savings Plan** — `md_nw_skill_goal_based_savings_plan` if down payment isn't there yet.

### Under contract phase

6. **Loan-offer audit** — compare 2–3 lender quotes on:
   - APR (not just rate — APR bakes in points and origination fees).
   - Points: only buy points if you'll stay past breakeven (cost / monthly savings = breakeven months).
   - Type: 30y fixed default; 15y if you can afford it; ARM only if known short hold.
   - Lender credits vs cash to close tradeoff.
7. **Inspection-finding budget impact** — re-cost any seller credits or post-close repairs into the cashflow.
8. **Insurance Reviewer** — `md_ir_skill_policy_comparison` for homeowners. Replacement cost (not market value) coverage, dwelling/contents/liability/loss-of-use, deductible, hurricane/earthquake/flood riders (flood = separate NFIP policy if in zone).

### At close / post-close (first 90 days)

9. **Beneficiary Audit** — `md_el_skill_beneficiary_audit`. Mortgage is non-probate but title matters: joint tenancy w/ ROS, tenancy by entirety (married — strongest), TOD deed (where state allows).
10. **Life Insurance Needs** — `md_ir_skill_life_insurance_needs` — re-DIME with new mortgage balance.
11. **Withholding Check** — `md_tx_skill_withholding_check` with mortgage interest + property tax now potentially pushing into itemizing.
12. **Update will & POA** with new asset and address (or note for next estate-attorney visit).
13. **Cashflow Review** — `md_bc_skill_cashflow_review`. Real PITI vs estimate. New line items: utilities (likely higher), HOA, lawn, maintenance sinking fund (set up via `md_nw_skill_sinking_funds_setup`).
14. **Maintenance sinking fund** — auto-transfer 1% of home value / 12 months into a HYSA bucket.

## Hard rules (high-cost mistakes)

- ⚠️ **Don't open new credit during underwriting** — even a furniture store card can re-trigger underwriting and kill the loan.
- ⚠️ **Don't change jobs during underwriting** unless absolutely required.
- ⚠️ **Source large deposits** — lenders require seasoning. Gift letters for family help.
- ⚠️ **Earnest money** — wire fraud is rampant; call escrow at a known number to verify wiring instructions, never trust emailed wire instructions.

## Required citations

- DTI thresholds cite the loan type (conventional / FHA / VA / USDA).
- Property tax cite county assessor.
- Insurance quote cite carrier declaration.

## Deliverable shape

- Markdown playbook `./reports/life-events/home-purchase-<DATE>.md`:
  - **Affordability ceiling** (honest PITI-based price).
  - **Total cash needed** (DP + CC + reserves).
  - **Buy-vs-rent crossover** (months / years).
  - **Loan-offer comparison table** (APR, points, breakeven).
  - **Post-close 90-day checklist** (insurance, beneficiaries, will, withholding, sinking funds).

## Notes

- The myth: "buying builds equity." Reality: first 5–7 years, amortization is mostly interest. Transaction costs (6% to sell) often exceed equity built unless you stay 5+ years.
- Sub-3% rates locked in 2020–21 distort the lifetime math — don't blindly extrapolate.
- "Analysis only. Recommend a fee-only mortgage broker (not lender-employed) for shopping quotes."
