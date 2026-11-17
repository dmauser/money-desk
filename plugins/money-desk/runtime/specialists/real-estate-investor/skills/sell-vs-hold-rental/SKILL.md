## Sell vs Hold Rental

description: For an existing rental property the owner is considering selling, compute after-tax sale proceeds and compare to the NPV of continuing to hold. Factors in depreciation recapture, LTCG, NIIT, state tax, selling costs, owner's time burden, and portfolio concentration risk.

## When to use

- Owner is tired of being a landlord ("the toilet calls" fatigue).
- Property has appreciated significantly — temptation to lock gains.
- Cash flow has deteriorated (vacancy, rent control, expense creep).
- Property is becoming a concentration risk in the user's net worth.
- Considering §1031 into a different property type (e.g., out of a high-management SFR into a passive DST or NNN).
- Approaching retirement and re-evaluating income vs simplicity.

## Inputs needed

- Property: current estimated value (with broker price opinion or recent appraisal), original cost basis, accumulated depreciation, current outstanding loan balance.
- Selling cost assumption (typically 7-8%: 5-6% commission + 1-2% closing costs — ask; the model has no default).
- Owner: filing status, marginal federal + state rate, MAGI (for NIIT 3.8% threshold), tax year.
- Current annual cash flow (NOI − debt service − capex reserve).
- Owner's required return (discount rate) for the NPV comparison.
- Time spent annually managing this property (be honest; convert to $ at owner's earning rate).
- Alternative deployment of sale proceeds: paying down own mortgage, equity index funds, another rental, dividend stocks, etc.

## Workflow

### Net sale proceeds
1. **Sale price** − **selling costs** = **net sale price**.
2. **Net sale price** − **outstanding loan balance** = **gross cash to seller**.
3. **Total gain on sale** = Net sale price − Adjusted cost basis (original basis + capital improvements − accumulated depreciation).
4. **Depreciation recapture** = min(accumulated depreciation, total gain), taxed at the ordinary rate capped at **25%** (unrecaptured §1250 gain rate).
5. **LTCG portion** = (Total gain − recapture portion) × **0% / 15% / 20%** per the LTCG brackets (`md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` for MFJ).
6. **NIIT** = 3.8% on the lesser of the gain or MAGI above the threshold (`md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_single` / `.niit_threshold_mfj`).
7. **State tax** = state rate on full gain (most states don't have preferential LTCG).
8. **After-tax cash** = Gross cash to seller − (recapture tax + LTCG + NIIT + state tax).

### Hold scenario NPV
- Project 10-year cash flow with rent growth, expense growth, capex events.
- Project year-10 sale with the same after-tax computation (price grown at assumption, depreciation accumulated to date).
- Discount at owner's required rate.
- Subtract owner's annual time cost in dollars.

### Decision framework
- If Sell PV (after-tax cash today) > Hold PV (both at the owner's discount rate; Determinism rules) → sell (do the §1031 evaluation first if the gain is large).
- If concentration risk is severe (this property > 30% of net worth) → bias toward partial-sell (impossible) or §1031 into multiple smaller assets / DST.
- If user explicitly wants to stop being a landlord, that's a valid preference; don't argue them out of it for marginal NPV.

### §1031 consideration
- Always compute "what if we §1031 into X instead of selling?" as a third scenario.
- The deferred tax compounding at the user's after-tax return is meaningful; the §1031 option is rarely a bad ANALYTICAL outcome but is often the wrong fit for someone who wants to be done with being a landlord.
- DST (Delaware Statutory Trust) is the passive option: 1031 into fractional commercial ownership; no management; illiquid 5-10 years; sponsor fees.

## Output

- Three scenarios side-by-side: **Sell + invest proceeds**, **Hold**, **§1031 into [alternative]**.
- For each: after-tax cash today, projected 10-year wealth, projected 10-year time burden.
- Sensitivity on the two assumptions most likely to flip the decision.
- Clear recommendation with the user-preference factor (time / simplicity) named explicitly.

## Citations / sources

- Cost basis: cite settlement statement, capital-improvement receipts, depreciation schedule from prior returns.
- Tax rates: cite current-year IRS LTCG brackets, state DOR for state.
- NIIT: IRC §1411.
- Recapture: IRC §1250.

## Disclaimer

Analysis only. Strongly recommend a CPA familiar with real-estate dispositions before any sale or §1031 contract. State / local transfer taxes vary widely and can change the answer materially. Mortgage-payoff and prepayment-penalty terms vary — confirm with servicer.

## Determinism rules

### Input keys

- `current_value_usd` — number (BPO or appraisal)
- `original_basis_usd`, `capital_improvements_usd`, `accumulated_depreciation_usd` — numbers
- `loan_balance_usd` — number; `loan_rate_pct`, `loan_remaining_months` — for the hold projection
- `selling_cost_pct` — number, % of sale price (commission + closing)
- `filing_status` — `mfj` | `single` | `hoh` | `mfs`
- `ordinary_marginal_rate_pct`, `state_tax_rate_pct` — numbers, %
- `magi_excluding_sale_usd`, `taxable_income_excluding_sale_usd` — numbers
- `annual_cash_flow_usd` — number, NOI − debt service − capex reserve (year 1)
- `rent_growth_pct`, `expense_growth_pct`, `appreciation_pct` — numbers, % per year
- `discount_rate_pct` — number, owner's required return
- `alt_return_pct` — number, return on the redeployed proceeds
- `annual_hours_managing`, `hourly_value_usd` — numbers
- `net_worth_usd` — number
- `wants_out_of_landlording` — bool
- `exchange_option` — `{ cash_yield_pct, appreciation_pct, label }` (optional; e.g., DST or NNN)
- `holding_years` — integer (default 10)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Value, basis, depreciation, loan balance | **Ask — no default** (BPO/appraisal, settlement statement, prior returns) | — |
| Selling cost % | **Ask — no default** | — |
| Discount rate | **Ask**; if the user has none, use `alt_return_pct` | `[ASSUMPTION]` |
| Alternative return | **Ask**; else `(1 + md_facts behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent) × (1 + .long_term_inflation_percent) − 1` | `[ASSUMPTION]` |
| Rent / expense growth | **Ask**; else `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |
| Appreciation | **Ask**; else `(1 + md_facts real_estate_appreciation_long_term_real_percent) × (1 + long_term_inflation_percent) − 1` | `[ASSUMPTION]` |
| Holding period | 10 years | `[ASSUMPTION]` |
| Recapture rate | Ordinary rate capped at 25% (unrecaptured §1250) | IRC §1(h)(1)(E) |
| LTCG brackets | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj`; `.ltcg_qualified_dividend_brackets_single` / `.ltcg_qualified_dividend_brackets_hoh` for other statuses | `[IRS 2026 limits]` |
| NIIT threshold | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `.niit_threshold_single` | `[IRS 2026 limits]` |
| Concentration threshold | Property equity > 30% of net worth (Workflow decision framework) | `[ASSUMPTION]` |
| Exchange-option yield and appreciation | **Ask — no default**; without them the §1031 scenario is "Not computed" | — |

### Calculation method

> **Calculators:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time; `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. **Sell now:** `net_sale = current_value_usd × (1 − selling_cost_pct/100)`; `gross_cash = net_sale − loan_balance_usd`; `adjusted_basis = original_basis_usd + capital_improvements_usd − accumulated_depreciation_usd`; `gain = max(0, net_sale − adjusted_basis)`; `recapture = min(accumulated_depreciation_usd, gain)`; `recapture_tax = recapture × min(25, ordinary_marginal_rate_pct)/100`; `ltcg_tax` = (gain − recapture) taxed through the LTCG brackets stacked on `taxable_income_excluding_sale_usd + recapture`; `niit = 3.8% × min(gain, max(0, magi_excluding_sale_usd + gain − threshold))`; `state_tax = gain × state_tax_rate_pct/100`; `after_tax_cash = gross_cash − all four taxes`. **Sell PV = `after_tax_cash`.**
2. **Hold:** for t = 1…N: `CF_t = annual_cash_flow_usd` grown by the rent/expense split (if only the net figure is given, grow it at `rent_growth_pct`); `time_cost_t = annual_hours_managing × hourly_value_usd`; year-N sale repeats step 1 with `value_N = current_value_usd × (1 + appreciation_pct/100)^N`, `loan_balance_N` from amortization, accumulated depreciation + N years of the current annual depreciation. **Hold PV = Σ (CF_t − time_cost_t)/(1 + d)^t + after_tax_cash_N/(1 + d)^N**, d = `discount_rate_pct/100`.
3. **§1031 (if `exchange_option`):** `E = gross_cash` (tax deferred); `CF_t = E × cash_yield_pct/100`; `E_N = E × (1 + exchange_option.appreciation_pct/100)^N`; tax at N = step-1 taxes today + (E_N − E) × (LTCG rate from step 1 + NIIT if applicable + state)/100; **1031 PV = Σ CF_t/(1 + d)^t + (E_N − tax_N)/(1 + d)^N** (no time cost for passive options).
4. **10-year wealth** for display = PV × (1 + d)^N for each scenario.
5. **Concentration** = (`current_value_usd − loan_balance_usd`) / `net_worth_usd` × 100, 1 decimal.
6. **Sensitivity:** recompute Hold PV with appreciation −1 pt and with discount rate +1 pt.
7. Compute in cents; report whole dollars.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Required input missing | No recommendation — list inputs |
| 2 | `wants_out_of_landlording` | **Sell** (preference honoured); if 1031 PV > Sell PV for a passive option, show it as the alternative |
| 3 | Concentration > 30% and 1031 PV computed and 1031 PV ≥ Sell PV | **§1031 into diversified / passive property** |
| 4 | Concentration > 30% | **Sell** and diversify |
| 5 | Sell PV > Hold PV and (1031 not computed or Sell PV ≥ 1031 PV) | **Sell** |
| 6 | 1031 computed and 1031 PV > max(Sell PV, Hold PV) | **§1031 exchange** |
| 7 | Otherwise | **Hold** |

### Output template

```markdown
# Sell vs Hold — {masked address}, {YYYY-MM-DD}

## Headline
**{recommendation}** (Decision rule #{n}). Sell PV ${sell_pv} · Hold PV ${hold_pv} · §1031 PV {pv or "not computed"}.

## Sell now — after-tax cash
| Line | Amount |
|---|---|
| Net sale price | |
| Less loan payoff | |
| Gross cash to seller | |
| Recapture tax | |
| LTCG tax | |
| NIIT | |
| State tax | |
| **After-tax cash** | |

## Scenarios
| Scenario | PV today | {N}-year wealth | Annual time burden (hrs) |
|---|---|---|---|
| Sell + invest | | | 0 |
| Hold | | | |
| §1031 into {label} | | | |

## Concentration
{equity % of net worth vs 30%}

## Sensitivity
| Case | Hold PV | Decision changes? |
|---|---|---|
| Appreciation −1 pt | | |
| Discount rate +1 pt | | |

## Preference factor
{time / simplicity named explicitly}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
