## Mortgage Strategy Review

description: For an existing mortgage holder, evaluate refinance, recast, ARM-vs-fixed, and HELOC-vs-cash-out-refi decisions with explicit break-even math and total-interest-paid comparisons. Applies to primary residence and investment property.

## When to use

- Mortgage rate has dropped meaningfully (or user thinks it has).
- Considering refi from ARM to fixed, fixed to ARM, or 30y → 15y.
- Have a windfall and considering recast vs prepay vs invest.
- Need to access home equity (HELOC vs cash-out refi vs reverse mortgage).
- ARM about to reset.

## Inputs needed

- Current mortgage: balance, rate, remaining term, type (fixed / ARM with reset details), monthly P&I.
- Property: current estimated value, original purchase price, owner-occupied vs investment.
- Quote(s) for new loan: rate, term, points, closing costs (all-in, not just origination).
- Planned holding period for the property.
- Marginal tax rate (interest deductibility depends on standard vs itemized).
- For HELOC / cash-out: intended use of cash and amount.

## Workflow

1. **Compute new payment** at the quoted terms.
2. **Compute monthly savings** = old P&I − new P&I.
3. **Compute true closing cost** (lender + third-party + escrow funding − escrow refund − rate-buydown credits).
4. **Break-even** = closing cost ÷ monthly savings (months).
5. **Decision**: refi only if planned holding period ≥ 1.5× break-even and the holding-period net benefit is positive (Determinism rules).
6. **Total-interest comparison** over remaining holding period: old vs new — refi can have shorter break-even but worse total interest if user is restarting a 30-year amortization.
7. **ARM-vs-fixed**: compare initial-rate savings against worst-case post-reset rate (current rate + max periodic cap, current rate + lifetime cap). Default rule: prefer fixed unless ARM initial-period exceeds planned holding period by ≥ 2 years.
8. **Recast (if windfall)**: paying down principal and re-amortizing at same rate / term lowers monthly payment without restarting amortization or closing costs. Usually requires a minimum principal curtailment and a recast fee — use the servicer's actual figures. Compare to investing the same lump sum at after-tax expected return.
9. **HELOC vs cash-out refi**: HELOC = variable rate, only-pay-on-balance-used, doesn't touch the first lien (preserves a low fixed first-mortgage rate). Cash-out refi = locks in today's rate on the entire new principal, prepayment-friendly but resets amortization. Rule: if the blended rate (first mortgage + HELOC) is below the cash-out rate, or HELOC total cost over the holding period is lower, keep the first and use a HELOC.

## Output

- Side-by-side: current loan vs proposed loan(s).
- Break-even months + total-interest-over-holding-period.
- Recommendation with the conditions (holding period, rate environment) that would flip it.

## Citations / sources

- Loan terms: cite the Loan Estimate (LE) document — every cost line itemized there. Mark verbal quotes `[UNSOURCED]`.
- Rate-environment context: cite Freddie Mac PMMS or current rate-tracker for benchmark.
- Tax treatment: cite IRC §163(h) and current standard-deduction amount; interest deductibility only matters if itemizing.

## Disclaimer

Analysis only. Doesn't apply, doesn't lock, doesn't sign anything. Recommend an independent mortgage broker (paid by lender or flat-fee) for shopping; flag captive-lender commission incentives.

## Determinism rules

### Input keys

Core names follow the named ranges in this skill's `template.xlsx.json` (workbook stores rates as fractions; here `6.75` = 6.75%).

- `question` — `refi` | `arm_vs_fixed` | `recast_or_invest` | `equity_access`
- `current_balance` — number, USD
- `current_rate` — number, % annual
- `current_remaining_yrs` — number, years
- `refi_rate` — number, %; `refi_term_yrs` — integer; `refi_costs` — number, USD all-in true closing cost (lender + third-party − credits; escrow funding excluded)
- `holding_months` — integer, planned months the user keeps this loan/property
- `extra_monthly_principal` — number, USD/month (or `lump_sum_usd` — number, for recast/prepay)
- `recast_fee_usd` — number
- `alt_invest_return` — number, % annual expected return on the alternative investment
- `marginal_tax_rate` — number, %
- `itemizes` — bool
- `arm` — `{ initial_rate_pct, initial_period_years, periodic_cap_pct, lifetime_cap_pct }` (arm_vs_fixed)
- `fixed_quote_rate_pct` — number (arm_vs_fixed)
- `cash_needed_usd`, `heloc_rate_pct`, `heloc_costs_usd`, `cash_out_rate_pct`, `cash_out_costs_usd` — numbers (equity_access)
- `property_value_usd` — number; `occupancy` — `primary` | `investment`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Loan balances, rates, quotes, costs | **Ask — no default** (statement + Loan Estimate; verbal quotes `[UNSOURCED]`) | — |
| Holding period | **Ask — no default** | — |
| Alternative investment return | **Ask**; else `(1 + md_facts behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent) × (1 + .long_term_inflation_percent) − 1` | `[ASSUMPTION]` |
| Market-rate benchmark | `md_facts` → `behavioral_assumptions_safe_defaults.mortgage_rate_assumption_check_freddie_pmms` → fetch Freddie Mac PMMS via `md_sources`, else `[UNSOURCED]` | — |
| Mortgage-interest deduction cap | `md_facts` → `mortgage_and_real_estate_2026.mortgage_interest_deduction_cap_post_tcja` | `[FHFA / IRS RE 2026]` |
| Standard deduction (itemizing test) | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `_single` / `_hoh` | `[IRS 2026 limits]` |
| Conforming loan limit (cash-out size) | `md_facts` → `mortgage_and_real_estate_2026.conforming_loan_limit_one_unit_baseline` / `.conforming_loan_limit_one_unit_high_cost_ceiling` | `[FHFA / IRS RE 2026]` |
| Refi rule of thumb | Holding period ≥ 1.5 × break-even (Workflow step 5) | `[ASSUMPTION]` |

### Calculation method

> **Calculators:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time; `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Monthly rate `j = rate/100/12`. Work in cents; report whole dollars, months as integers (break-even rounded up).

1. **Workbook metrics** (exactly as `template.xlsx.json`): `current_monthly_pi = PMT(current_rate/12, current_remaining_yrs × 12, −current_balance)`; `refi_monthly_pi = PMT(refi_rate/12, refi_term_yrs × 12, −current_balance)`; `current_total_interest = current_monthly_pi × current_remaining_yrs × 12 − current_balance`; `refi_total_interest = refi_monthly_pi × refi_term_yrs × 12 − current_balance`; `monthly_savings = current − refi P&I`; `breakeven_months = ceil(refi_costs / monthly_savings)` (N/A if savings ≤ 0); `net_benefit_full_term = current_total_interest − refi_total_interest − refi_costs`.
2. **Holding-period comparison** (H = `holding_months`, capped at each loan's remaining months): `old_cost = current_monthly_pi × H + balance_old(H)`; `new_cost = refi_costs + refi_monthly_pi × H + balance_new(H)`; `net_benefit_hold = old_cost − new_cost`. `balance(H)` from the standard amortization formula.
3. **Extra principal / recast vs invest** (workbook rule): math winner = "Invest" if `alt_invest_return > current_rate`, else "Pay down" (both legs taxed at `marginal_tax_rate` in the workbook, so the tax term cancels). Recast: new payment = `PMT(j, remaining months, −(current_balance − lump_sum_usd))`; payment drop = old − new; cost = `recast_fee_usd`.
4. **ARM vs fixed:** worst-case ARM rate = `initial_rate_pct + lifetime_cap_pct`; worst-case path: initial rate for `initial_period_years`, then +`periodic_cap_pct` at each annual reset until the worst-case rate, re-amortizing the remaining balance at each reset. `initial_savings = (fixed P&I − ARM P&I) × min(H, initial period months)`.
5. **Equity access:** HELOC cost over H = `heloc_costs_usd` + interest-only on `cash_needed_usd` at `heloc_rate_pct` for H months (first mortgage unchanged); cash-out cost over H = `cash_out_costs_usd` + (new loan interest on `current_balance + cash_needed_usd` at `cash_out_rate_pct` − old-loan interest at `current_rate`) over H. `blended_rate = (current_balance × current_rate + cash_needed_usd × heloc_rate_pct) / (current_balance + cash_needed_usd)`.
6. Any missing required input → stop and list it.

### Decision rules

Evaluate top to bottom; the first row whose `question` matches and whose condition holds wins.

| # | Question | Condition | Recommendation |
|---|---|---|---|
| 1 | any | Required input missing | No recommendation — list inputs |
| 2 | refi | `net_benefit_hold ≤ 0` | **Stay** in the current loan |
| 3 | refi | `monthly_savings > 0` and `holding_months < 1.5 × breakeven_months` | **Stay** — payback too long for the holding period |
| 4 | refi | `net_benefit_hold > 0` | **Refinance** |
| 5 | arm_vs_fixed | `arm.initial_period_years × 12 ≥ holding_months + 24` | **ARM** (initial period outlasts the hold by ≥ 2 years) |
| 6 | arm_vs_fixed | any | **Fixed** |
| 7 | recast_or_invest | workbook math winner = "Pay down" | **Prepay / recast** (recast if the user wants a lower payment and `recast_fee_usd` ≤ 12 × payment drop) |
| 8 | recast_or_invest | any | **Invest** the lump sum / extra cash |
| 9 | equity_access | `blended_rate < cash_out_rate_pct` or HELOC cost over H ≤ cash-out cost over H | **HELOC** — keep the first lien |
| 10 | — | Otherwise | **Cash-out refinance** |

### Output template

```markdown
# Mortgage Strategy Review — {YYYY-MM-DD}

## Headline
**{recommendation}** (Decision rule #{n}). {one-line reason with the deciding number}

## Current vs proposed
| Item | Current loan | Proposed |
|---|---|---|
| Balance | | |
| Rate | | |
| Term remaining | | |
| Monthly P&I | | |
| Closing costs | — | |

## Break-even and interest
| Metric | Value |
|---|---|
| Monthly savings | |
| Break-even (months) | |
| Holding period (months) | |
| Net benefit over holding period | |
| Lifetime interest delta (workbook) | |
| Net benefit over full term (workbook) | |

## ARM vs fixed
{payment path and worst case, or "Not applicable — question is {question}"}

## Recast / prepay vs invest
{rates compared, recast payment drop, or "Not applicable — no lump sum or extra principal"}

## Equity access
{HELOC vs cash-out costs and blended rate, or "Not applicable — no cash need"}

## What would flip it
{holding period or rate at which the answer changes}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).


### XLSX deliverables — template + named-ranges contract

When this skill produces an XLSX, it **MUST**:

1. **Start from the shipped template** at `template.xlsx.json` in this skill's
   folder. The template pre-declares the Inputs schema, named ranges, and
   Summary/Analysis formulas. Fill only **values** (and narrative cells) —
   never hand-author raw `A1` coordinates in formulas.
2. **Reference cells by name**, never coordinate. Use
   `=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)` rather
   than `=PMT(Inputs!B5/12, Inputs!B4*12, -B11)`. This is the bug class the
   template system exists to prevent: a Rent vs Buy report once shipped with
   Monthly P&I pointing at Inputs!B6 (holding horizon) instead of Inputs!B4
   (mortgage term) — off by 75% — and the BUY/RENT cells pointing at the
   same source.
3. **Recompute every headline figure** independently in Python and assert
   agreement within 1% before declaring done (see
   `report_quality.self_verification` in `data/preferences.yaml`).
4. **Recalculate the workbook** after rendering (LibreOffice headless on
   Linux/Mac, Excel COM on Windows, or the `formulas` package) and reload
   with `data_only=True`; openpyxl alone does not evaluate formulas.
5. **Cross-format diff**: if markdown + XLSX (or DOCX) are both produced,
   diff every headline figure across formats; abort and re-render if any
   pair differs by more than 1%.
6. **Flag duplicate-value-with-different-label** in the same table — that
   pattern is almost always a reference-pointing bug, not a coincidence.
