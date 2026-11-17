# Rent vs Buy

description: Compare renting vs buying a home on total cost over a holding horizon, including opportunity cost of the down payment. Uses the "price-to-rent ratio" sanity check and a year-by-year NPV. Outputs a verdict with the break-even hold period. Use for any housing decision.

## When to use

- The user is debating buy vs rent in their current market.
- Move to a new city — buy or rent for the first year?
- Trying to decide if it's "throwing money away" to rent.

## Inputs needed

- Target home: price, expected property tax, HOA, expected maintenance (% of value per year — user-supplied; 1% is a common rule of thumb), insurance.
- Mortgage terms available: rate, term, down payment %.
- Comparable rent for an equivalent property in the same area.
- Expected holding horizon (years).
- Expected home-price appreciation (real). Default: `md_facts` real-estate appreciation assumption (see Determinism rules).
- Expected rent inflation. Default: `md_facts` long-term inflation.
- Down payment alternative — what return would the down-payment money earn if invested instead. Default: `md_facts` long-term equity real return.
- Tax rate and itemizing status (mortgage interest deduction — usually moot under standard deduction).
- Selling costs (% of sale price — agent commissions, transfer tax, closing; user-supplied).

## Workflow

1. **Price-to-rent ratio sanity check.** P2R = home price / (annual market rent). <15 → buying usually favored; 15–20 → toss-up; >20 → renting usually cheaper. This is a coarse filter only.
2. **Year-by-year buy scenario:**
   - Mortgage P&I.
   - Property tax, HOA, insurance, maintenance (user-supplied %/yr of value), PMI if <20% down.
   - Tax benefit (only the excess of itemized deductions over the `md_facts` standard deduction — often zero).
   - Equity built (principal portion of payment).
   - Appreciation on home value.
   - At end of horizon: sale proceeds = current value − mortgage balance − selling costs.
3. **Year-by-year rent scenario:**
   - Monthly rent × 12, inflated by rent CAGR.
   - Renters insurance.
   - Down payment kept invested — compounded at expected investment return.
4. **Net worth comparison at horizon end.**
   - Buy: equity (sale − mortgage − selling cost) + post-tax investment of any monthly cash-flow surplus over rent (often negative in early years).
   - Rent: invested down payment + invested monthly-cost differential (often positive in early years).
5. **Break-even.** At what horizon does the buy scenario overtake the rent scenario? Often 5–7 years in stable markets; longer in high-cost / high-fee markets.
6. **Sensitivity sweep.** ±1% appreciation, ±1% investment return, ±1% rent inflation. Show range, not point estimate.
7. **Non-financial factors.** Flexibility (rent), stability (buy), DIY tolerance, school district stability, expected job mobility. List explicitly but don't try to monetize.

## Required citations

- Comparable rent cites the listing source.
- Maintenance and selling-cost assumptions cite typical ranges.
- Appreciation and investment returns are assumptions — labeled as such.

## Deliverable shape

- Markdown report `./money-desk/purchase-advisor/rent-vs-buy-<YYYYMMDD>.md`:
  - **Headline verdict** — buy / rent / break-even at year N.
  - **Price-to-rent ratio** + interpretation.
  - **Year-by-year comparison table** for at least 10 years.
  - **Net-worth-at-horizon** for buy vs rent.
  - **Sensitivity range** — range of break-even years under stress.
  - **Non-financial considerations.**

## Notes

- "Building equity" is real but expensive — closing costs alone can offset the first 2–3 years of equity build.
- Most cost calculators ignore maintenance and selling costs and overstate buy. Show both honestly.
- Negative carry (mortgage cost > rent) is fine if appreciation + equity build outweighs it over horizon.
- "Analysis only. Not professional real-estate or financial advice."

## Determinism rules

### Input keys

- `home_price_usd` — number
- `down_payment_pct` — number (20 = 20%)
- `mortgage_rate_pct` — number; `mortgage_term_years` — integer
- `purchase_closing_costs_usd` — number
- `property_tax_annual_usd`, `hoa_monthly_usd`, `homeowners_insurance_annual_usd` — numbers
- `maintenance_pct` — number; % of home value per year
- `pmi_annual_pct` — number; % of the loan per year (required if `down_payment_pct` < 20)
- `selling_cost_pct` — number; % of sale price
- `monthly_rent_usd` — number; comparable rent
- `renters_insurance_annual_usd` — number
- `horizon_years` — integer
- `filing_status` — `mfj` | `single` | `hoh`; `marginal_federal_rate_pct`, `marginal_state_rate_pct` — numbers
- `other_itemized_deductions_usd` — number (charity, etc.; optional)
- `state_income_tax_paid_usd` — number (for the SALT line; optional)
- Optional overrides: `appreciation_real_pct`, `investment_real_return_pct`, `rent_inflation_pct`, `inflation_pct`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Price, rate, term, down payment, rent, horizon, property tax, insurance, HOA | **Ask — no default** (check the rate against `md_facts` → `behavioral_assumptions_safe_defaults.mortgage_rate_assumption_check_freddie_pmms`) | — |
| Maintenance % | **Ask — no default**; the user may adopt the 1%-of-price rule of thumb, recorded as `[USER-PROVIDED]` | — |
| Selling costs % and purchase closing costs | **Ask — no default** | — |
| PMI rate | **Ask — no default** (from the Loan Estimate) | — |
| Home appreciation (real) | `md_facts` → `behavioral_assumptions_safe_defaults.real_estate_appreciation_long_term_real_percent` | `[ASSUMPTION]` |
| Investment return on the renter's capital (real) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` | `[ASSUMPTION]` |
| Inflation | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |
| Rent inflation | Equal to inflation above | `[ASSUMPTION]` |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` | `[IRS 2026 limits]` |
| Mortgage-interest debt cap | `md_facts` → `mortgage_and_real_estate_2026.mortgage_interest_deduction_cap_post_tcja` | `[IRS 2026 limits]` |
| SALT cap | `md_facts` → `mortgage_and_real_estate_2026.salt_cap` with its phase-down (`.salt_cap_phase_down_magi_start`, `.salt_cap_phase_down_rate`, `.salt_cap_floor`); use the full cap unless the user reports MAGI above the phase-down start | `[IRS 2026 limits]` |
| Home-sale gain exclusion | `md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `section_121_exclusion_mfj` | `[IRS 2026 limits]` |

### Calculation method

> **Calculators:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time; `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Model in **nominal** dollars, monthly steps, `m = 1 … 12 × max(horizon_years, 30)`. md_facts values are decimals (0.01 = 1%).

1. **Nominal rates:** appreciation `g = (1 + appr_real)(1 + infl) − 1`; investment `i = (1 + inv_real)(1 + infl) − 1`; rent inflation `ri = infl`. Monthly equivalents `x_m = (1 + x)^(1/12) − 1`.
2. **Price-to-rent** `P2R = home_price_usd ÷ (12 × monthly_rent_usd)`, 1 decimal: < 15 "buy-leaning", 15–20 "toss-up", > 20 "rent-leaning" (coarse filter only; never the verdict).
3. **Buy, each month:** P&I by standard amortization (`r = mortgage_rate_pct/100/12`); property tax, insurance, maintenance (`maintenance_pct` × current value ÷ 12), and HOA, each grown by `infl` annually (maintenance grows with the home value); PMI `= pmi_annual_pct/100 × original loan ÷ 12` until the balance ≤ 80% of the original price.
4. **Tax benefit (annual, year-end):** `itemized = interest × min(1, cap ÷ average loan balance) + min(property_tax + state_income_tax_paid_usd, salt_cap) + other_itemized_deductions_usd`; `benefit = max(0, itemized − standard_deduction) × marginal_federal_rate_pct/100`. Credited to the buyer's investment account at year-end.
5. **Rent, each month:** rent (grown by `ri` each 12 months) + renters insurance ÷ 12.
6. **Investing the difference:** at month 0 the renter invests down payment + `purchase_closing_costs_usd`. Each month, whoever has the lower outflow invests the difference. Both accounts compound at `i_m`.
7. **Net worth at end of year y:** Buy = `value × (1 − selling_cost_pct/100) − loan balance + buyer investments`; Rent = renter investments. Gain above the § 121 exclusion is flagged, not taxed in the model.
8. **Break-even year** = first year `y` where Buy NW ≥ Rent NW and stays ≥ for every later year through 30; none → "No break-even within 30 years".
9. **Sensitivity:** six one-at-a-time reruns — appreciation ±1 pp, investment return ±1 pp, rent inflation ±1 pp; report each break-even year and the min–max range.
10. **Rounding:** compute in cents; report whole dollars; years as integers.

### Decision rules

Evaluate top to bottom; the first match is the verdict. `diff = Buy NW − Rent NW` at `horizon_years`.

| # | Condition | Verdict |
|---|---|---|
| 1 | `|diff|` < 2% of `home_price_usd` | Toss-up — decide on the non-financial factors |
| 2 | `diff` > 0 and every sensitivity break-even ≤ `horizon_years` | Buy |
| 3 | `diff` > 0 | Lean buy — result flips under at least one sensitivity case |
| 4 | Otherwise (`diff` < 0) | Rent |

### Output template

```markdown
# Rent vs Buy — {location / property} — {YYYY-MM-DD}

## Headline verdict
**{Buy / Lean buy / Rent / Toss-up}** — break-even at **year {N}**; at your {horizon_years}-year horizon, {buying/renting} leaves you **${|diff|}** ahead (rule #{n}).

## Price-to-rent ratio
P2R = {value} → {buy-leaning / toss-up / rent-leaning} (coarse filter only).

## Assumptions used
| Input | Value | Source / tag |
|---|---|---|

## Year-by-year comparison
| Year | Buy outflow | Rent outflow | Home value | Loan balance | Buy NW | Rent NW | Buy − Rent |
|---|---|---|---|---|---|---|---|
{years 1 through max(10, horizon_years)}

## Net worth at horizon
| Scenario | Net worth | Composition |
|---|---|---|
| Buy | | equity after selling costs + investments |
| Rent | | invested down payment + monthly differences |

## Sensitivity
| Case | Break-even year |
|---|---|
| Base | |
| Appreciation +1 pp / −1 pp | |
| Investment return +1 pp / −1 pp | |
| Rent inflation +1 pp / −1 pp | |
Range: {min}–{max}

## Tax notes
{itemizing benefit by year, SALT/§121 flags — or "No itemizing benefit — standard deduction is higher"}

## Non-financial considerations
- {flexibility, stability, DIY tolerance, schools, job mobility}
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
