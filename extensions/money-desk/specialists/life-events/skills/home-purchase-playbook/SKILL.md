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
   - **Maintenance reserve**: 1% of price/yr base case, 2% stress case (older + bigger = use the stress case).
   - **Cap PITI+HOA+PMI at 28% of gross income** (front-end DTI); total debt at ≤ 36%. Lender will go higher; don't.
3. **Buy-vs-rent** — run `md_pa_skill_total_cost_of_ownership` for a buy scenario and compare to current rent × expected hold period. Surface opportunity cost of down payment.
4. **Down-payment stack:**
   - Target 20% down to avoid PMI **OR** intentionally put less and invest the difference (legitimate strategy with low rates; less compelling at high rates).
   - Closing costs: the Loan Estimate figure; until you have one, show both 2% and 5% of price.
   - Reserves: 3 months of PITI (dual income) or 6 months (single or variable income) in cash after close.
   - Total cash need = DP + CC + reserves. If the user has just enough for DP, they're under-cashed.
5. **Goal-Based Savings Plan** — `md_nw_skill_goal_based_savings_plan` if down payment isn't there yet.

### Under contract phase

6. **Loan-offer audit** — compare 2–3 lender quotes on:
   - APR (not just rate — APR bakes in points and origination fees).
   - Points: only buy points if you'll stay past breakeven (cost / monthly savings = breakeven months).
   - Type: 30y fixed default; 15y if its PITI fits under the 28% cap; ARM only if the expected hold is ≤ the ARM's initial fixed period.
   - Lender credits vs cash to close tradeoff.
7. **Inspection-finding budget impact** — re-cost any seller credits or post-close repairs into the cashflow.
8. **Property & Casualty** — `md_pc_skill_auto_home_policy_review` for homeowners. Replacement cost (not market value) coverage, dwelling/contents/liability/loss-of-use, deductible, hurricane/earthquake/flood riders (flood = separate NFIP policy if in zone).

### At close / post-close (first 90 days)

9. **Beneficiary Audit** — `md_el_skill_beneficiary_audit`. Mortgage is non-probate but title matters: joint tenancy w/ ROS, tenancy by entirety (married — strongest), TOD deed (where state allows).
10. **Life Insurance Needs** — `md_lp_skill_life_insurance_needs` — re-DIME with new mortgage balance.
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

- Markdown playbook `./money-desk/life-events/home-purchase-<DATE>.md`:
  - **Affordability ceiling** (honest PITI-based price).
  - **Total cash needed** (DP + CC + reserves).
  - **Buy-vs-rent crossover** (months / years).
  - **Loan-offer comparison table** (APR, points, breakeven).
  - **Post-close 90-day checklist** (insurance, beneficiaries, will, withholding, sinking funds).

## Notes

- The myth: "buying builds equity." Reality: first 5–7 years, amortization is mostly interest. Transaction costs (6% to sell) often exceed equity built unless you stay 5+ years.
- Sub-3% rates locked in 2020–21 distort the lifetime math — don't blindly extrapolate.
- "Analysis only. Recommend a fee-only mortgage broker (not lender-employed) for shopping quotes."

## Determinism rules

### Input keys

- `phase` — `pre_approval` | `under_contract` | `post_close`
- `gross_income_annual_usd` — number, household gross income, all sources
- `monthly_debt_payments_usd` — number, sum of minimum payments on all non-housing debt
- `credit_score` — integer or null
- `cash_available_usd` — number, liquid cash available for down payment + closing + reserves
- `target_price_usd` — number or null
- `down_payment_pct` — number (20 = 20%)
- `mortgage_rate_pct` — number (6.5 = 6.5%); `loan_term_years` — 15 | 30
- `property_tax_rate_pct` — number, county effective rate on price
- `insurance_annual_usd` — number, homeowners premium quote
- `hoa_monthly_usd` — number (0 if none)
- `pmi_rate_pct` — number, annual PMI as % of loan (required when `down_payment_pct` < 20)
- `closing_costs_usd` — number or null (from the Loan Estimate)
- `current_rent_monthly_usd` — number
- `expected_hold_years` — number
- `income_type` — `single_stable` | `dual` | `variable` (variable = 1099/commission/bonus > 25% of pay)
- `loan_offers` — list of `{ lender, rate_pct, apr_pct, points_usd, lender_credits_usd, monthly_pi_usd }` (under contract)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, debts, cash, rent, hold period | **Ask — no default** | — |
| Mortgage rate | **Ask — no default**; sanity-check against `md_facts` → `behavioral_assumptions_safe_defaults.mortgage_rate_assumption_check_freddie_pmms` (Freddie Mac PMMS via `md_sources`) | `[USER-PROVIDED]` |
| Property-tax rate, insurance premium, HOA, PMI rate | **Ask — no default** (county assessor / carrier quote / lender) | — |
| Closing costs | Loan Estimate if available; else show range at 2% and 5% of price (skill convention from this playbook) | `[ASSUMPTION: 2–5% of price]` |
| Maintenance reserve | Skill convention: 1% of price/yr base case, 2% stress case | `[ASSUMPTION: 1–2% of price]` |
| Conforming loan limit (jumbo flag) | `md_facts` → `mortgage_and_real_estate_2026.conforming_loan_limit_one_unit_baseline` / `conforming_loan_limit_one_unit_high_cost_ceiling` | `[FHFA / IRS RE 2026]` |
| Mortgage-interest deduction cap, SALT cap (itemizing test) | `md_facts` → `mortgage_and_real_estate_2026.mortgage_interest_deduction_cap_post_tcja`, `salt_cap`; standard deduction from `income_tax_brackets_mfj_2026` | `[IRS 2026 limits]` |

### Calculation method

1. `gross_monthly = gross_income_annual_usd / 12`.
2. **Housing cap** = `min(0.28 × gross_monthly, 0.36 × gross_monthly − monthly_debt_payments_usd)` (PITI + HOA + PMI).
3. **Payment factor** `M = r / (1 − (1 + r)^(−n))`, `r = mortgage_rate_pct / 100 / 12`, `n = loan_term_years × 12`. `d = down_payment_pct / 100`. `pmi = pmi_rate_pct / 100` if `d < 0.20`, else 0.
4. **Affordability ceiling price** = `(housing_cap − insurance_annual_usd / 12 − hoa_monthly_usd) / ((1 − d) × (M + pmi / 12) + property_tax_rate_pct / 100 / 12)`. Round down to the nearest $1,000. If the numerator ≤ 0, ceiling = $0 (cannot afford at these inputs).
5. **PITI at the evaluated price** (`target_price_usd` if given, else the ceiling): `loan = price × (1 − d)`; `P&I = loan × M`; taxes `= price × property_tax_rate_pct/100/12`; insurance `/12`; PMI `= loan × pmi/12`; plus HOA. Front-end ratio = total / gross_monthly; back-end = (total + debts) / gross_monthly.
6. **Total cash needed** = down payment (`price × d`) + closing costs + reserves, where reserves = `reserve_months × PITI` (reserve_months from the Decision rules). Gap = `cash_available_usd − total cash needed`.
7. **Buy-vs-rent** — run Total Cost of Ownership (Purchase Advisor) for `expected_hold_years`; report its crossover year verbatim. Do not compute a separate crossover here.
8. **Loan offers** — for each offer: `breakeven_months = ceil((points_usd − lender_credits_usd) / (baseline_monthly_pi − monthly_pi_usd))` vs the zero-point offer; if the denominator ≤ 0, breakeven = "never". Rank offers by APR ascending; tie → lower cash to close.
9. **Post-close** — maintenance sinking-fund transfer = `price × 1% / 12` (base case), run sub-skills in this fixed order: Beneficiary Audit → Life Insurance Needs → Withholding Check → will/POA note → Cashflow Review → Sinking Funds Setup.
10. Rounding: compute in cents; report whole dollars; ratios to one decimal place.

### Decision rules

Evaluate top to bottom; first match wins within each table.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `phase = pre_approval` and `credit_score` < 760 (or null) | Run Score Improvement Plan (Credit) before rate shopping |
| 2 | Evaluated price > affordability ceiling | Do not proceed at this price; show the ceiling and the payment gap |
| 3 | Cash gap < 0 | Under-cashed — run Goal-Based Savings Plan; state the $ shortfall |
| 4 | `down_payment_pct` < 20 | Proceed with PMI; show PMI $/mo and the 80% / 78% LTV removal dates |
| 5 | Otherwise | Proceed at or below the ceiling |

| # | Reserve months | |
|---|---|---|
| 1 | `income_type` is `single_stable` or `variable` | 6 months of PITI |
| 2 | Otherwise (`dual`) | 3 months of PITI |

| # | Loan type / points | |
|---|---|---|
| 1 | `expected_hold_years` ≤ ARM initial fixed period and user accepts rate-reset risk | ARM eligible; otherwise not offered |
| 2 | 15-year PITI ≤ housing cap | 15-year fixed is affordable — show both; user chooses |
| 3 | Otherwise | 30-year fixed |
| — | Points: buy only if `breakeven_months < expected_hold_years × 12` | |

### Output template

```markdown
# Home Purchase Playbook — {phase}, {date}

## Affordability ceiling
| Item | Value |
|---|---|
| Gross monthly income | |
| Housing cap (28% / 36% binding) | |
| Ceiling price | |
| PITI + HOA + PMI at evaluated price | |
| Front-end / back-end ratio | |

## Total cash needed
| Down payment | Closing costs | Reserves ({n} mo) | Total | Cash available | Gap |
|---|---|---|---|---|---|

## Buy-vs-rent crossover
{year from Total Cost of Ownership — or "Not applicable — already under contract"}

## Loan-offer comparison
| Lender | Rate | APR | Points | Lender credits | Breakeven (months) | Rank |
|---|---|---|---|---|---|---|
{or "Not applicable — no offers yet"}

## Recommendation
{decision rule # that fired and the numbers behind it}

## Post-close 90-day checklist
- [ ] Beneficiary Audit / title review
- [ ] Life Insurance Needs (new mortgage balance)
- [ ] Withholding Check (itemizing test)
- [ ] Will / POA update note
- [ ] Cashflow Review (actual vs estimated PITI)
- [ ] Maintenance sinking fund: ${amount}/mo
{or "Not applicable — not yet closed"}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).