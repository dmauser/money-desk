## Rental Property Analyzer

description: Underwrite a residential 1–4 unit rental property (existing or prospective purchase) with cap rate, cash-on-cash, IRR, DSCR, and the 1% / 50% sanity checks. Bake in honest vacancy, capex reserve, and management even if self-managed. Produces a go/no-go recommendation with the assumption sensitivities the deal lives or dies on.

## When to use

- Considering a rental property purchase (have a listing or pro-forma in hand).
- Reviewing an existing rental's actual performance vs underwriting.
- Comparing two candidate properties.
- Sanity-checking a syndicator / wholesaler / agent pro-forma.

## Inputs needed

- **Purchase price** (or current value if existing) and **down payment**.
- **Loan terms**: rate, amortization (15/20/30), fixed/ARM (and ARM reset details).
- **Gross rent** — current AND market. Get the market number from at least 2 comps (Rentometer, Zillow Rent Estimate, recent same-bedroom comps in the same building / block).
- **Operating expenses**: property tax, insurance, HOA, utilities owner pays, lawn / snow / pest.
- **Vacancy assumption** (if user has no local data: `md_facts` → `behavioral_assumptions_safe_defaults.rental_vacancy_default_percent`).
- **Capex reserve** (entered as % of **property value per year**; fallback in Determinism rules — roof, HVAC, water heater, flooring all have predictable useful lives; the older "8% of rent" rule of thumb under-reserves on appreciated properties).
- **Maintenance reserve** (entered as % of **property value per year** — routine repairs; fallback in Determinism rules).
- **Management** (% **of rent**, included even if self-managed — fallback `md_facts` → `rental_property_management_default_percent_of_rent` — so the deal stays honest when the owner later hires out or considers their time; use 0% only if the user is explicit about self-managing forever).
- Holding period assumed for IRR (default 10 years).
- Tax assumptions: marginal federal + state rate, depreciation schedule (residential 27.5y SL per `md_facts` → `mortgage_and_real_estate_2026.residential_rental_depreciation_life_years_27_5`; land % from the county assessor ratio).

## Workflow

1. **Validate the rent number.** If user gave one comp, push back; require 2-3 comps to anchor.
2. **Compute** Year-1 NOI: Gross Scheduled Rent − Vacancy − Operating Expenses (excluding debt service and depreciation; capex and maintenance reserves are included as operating lines, matching the workbook).
3. **Compute cap rate** = NOI ÷ Purchase Price. (No financing assumption.)
4. **Compute cash-on-cash** = (NOI − Annual Debt Service) ÷ Cash Invested (capex reserve is already inside NOI) (down + closing + immediate-repair reserve).
5. **Compute DSCR** = NOI ÷ Annual Debt Service. Most lenders require ≥ 1.20–1.25 for investment SFR / 2-4 unit; the model's OK band is ≥ 1.25.
6. **Run sanity checks**:
   - **1% rule**: monthly gross rent ÷ purchase price ≥ 1%? (rare in HCOL markets; missing it isn't a deal-killer, but it's a yellow flag).
   - **50% rule**: operating expenses (ex debt service) ~50% of gross rent. If pro-forma shows < 35%, something is missing.
7. **Project 10-year IRR** with the user's rent growth, expense growth, and appreciation (md_facts fallbacks in Determinism rules), and exit at year 10 with the user's selling cost. Include depreciation recapture (≤ 25%) + LTCG (0/15/20% + 3.8% NIIT if applicable) + state tax on the sale.
8. **Sensitivity table**: re-run with rent down 5%, vacancy up to 12%, rate +1 pt, appreciation −1 pt — show the cash-on-cash and IRR delta. A deal that only works at the base case is a fragile deal.

## Output

- One-page deal summary: address (masked), price, rent assumption, financing, key metrics (cap, CoC, DSCR, 10-yr IRR), and the recommendation (Pass / Marginal / Pursue).
- Sensitivity table.
- The two or three assumption levers the deal lives or dies on, explicitly named.

## Citations / sources

- Rent: cite comps (Rentometer, Zillow Rent Estimate, recent leased units).
- Expenses: cite the actual current numbers from MLS / current owner / listing agent, NOT defaults. Mark defaults as `[UNSOURCED]`.
- Tax assumptions: cite IRS Pub 527 for depreciation, current LTCG / NIIT brackets with tax year.

## Disclaimer

Analysis only. Not a recommendation to purchase. Recommend a local CPA + real-estate attorney for any actual purchase. State / county / city rules (rent control, transfer tax, registration requirements) vary widely — verify locally.

## Determinism rules

### Input keys

Names match the intake schema `md_re_skill_rental_property_analyzer` (workbook named range in brackets where it differs). Percentages: `6` = 6%.

- `purchase_price` — number, USD [`purchase_price`]
- `rehab_budget` — number, USD (default 0) [`rehab_budget`]
- `closing_costs_usd` — number, USD [`closing_costs`]
- `down_payment_pct` — number, % [`down_payment_pct`]
- `interest_rate` — number, % annual [`mortgage_rate`]
- `loan_term_years` — integer (default 30) [`mortgage_term_yrs`]
- `gross_monthly_rent` — number, USD/month, market rent supported by ≥ 2 comps [`monthly_rent`]
- `rent_comps` — list of `{ source, address_masked, monthly_rent_usd }`
- `property_tax_annual`, `insurance_annual` — numbers, USD/year [`property_tax_ann`, `insurance_ann`]
- `hoa_monthly` — number, USD/month (default 0)
- `other_opex_annual_usd` — number, owner-paid utilities, lawn/snow, pest (default 0; not in the workbook — add to its Operating expenses line when non-zero)
- `vacancy_pct` — number, % of gross rent
- `capex_pct_of_price`, `maintenance_pct_of_price` — numbers, % of property value per year
- `mgmt_pct_of_rent` — number, % of gross scheduled rent (0 only if the user commits to self-managing permanently)
- `appreciation_pct` — number, % per year nominal
- `holding_years` — integer (default 10)
- `rent_growth_pct`, `expense_growth_pct` — numbers, % per year
- `selling_cost_pct` — number, % of sale price
- `land_pct` — number, % of price allocated to land (county assessor ratio)
- `ltcg_rate_pct`, `state_tax_rate_pct`, `ordinary_marginal_rate_pct` — numbers, %; `niit_applies` — bool

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Price, financing, rent, taxes, insurance | **Ask — no default** | — |
| Vacancy | **Ask**; if the user has no local data, `md_facts` → `behavioral_assumptions_safe_defaults.rental_vacancy_default_percent` | `[ASSUMPTION]` |
| Capex reserve | **Ask** (% of value); if no view, convert `md_facts` → `rental_capex_reserve_default_percent_of_rent` × annual gross rent into % of price | `[ASSUMPTION]` |
| Maintenance | **Ask** (% of value); if no view, convert `md_facts` → `rental_maintenance_default_percent_of_rent` × annual gross rent into % of price | `[ASSUMPTION]` |
| Management | **Ask**; if no view, `md_facts` → `rental_property_management_default_percent_of_rent` | `[ASSUMPTION]` |
| Appreciation (nominal) | **Ask**; if no view, `(1 + md_facts real_estate_appreciation_long_term_real_percent) × (1 + long_term_inflation_percent) − 1` | `[ASSUMPTION]` |
| Rent and expense growth | **Ask**; if no view, `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |
| Holding period | 10 years | `[ASSUMPTION]` |
| Selling cost | **Ask — no default** (IRR is reported "Not computed" without it) | — |
| Land allocation | **Ask — no default** (county assessor ratio) | — |
| Depreciation life | `md_facts` → `mortgage_and_real_estate_2026.residential_rental_depreciation_life_years_27_5` | `[FHFA / IRS RE 2026]` |
| Recapture rate cap | 25% on unrecaptured §1250 gain (statute) | IRC §1(h)(1)(E) |
| NIIT threshold | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `.niit_threshold_single` | `[IRS 2026 limits]` |

md_facts stores percentages as fractions (`0.05` = 5%); convert before use.

### Calculation method

Year-1 metrics mirror the workbook (`template.xlsx.json`) exactly:

1. `loan = purchase_price × (1 − down_payment_pct/100)`; `monthly_pi = PMT(interest_rate/100/12, loan_term_years × 12, −loan)`; `debt_service = 12 × monthly_pi`.
2. `cash_invested = purchase_price × down_payment_pct/100 + closing_costs_usd + rehab_budget`.
3. `GSR = 12 × gross_monthly_rent`; `vacancy_loss = GSR × vacancy_pct/100`; `EGI = GSR − vacancy_loss`.
4. `opex = property_tax_annual + insurance_annual + 12 × hoa_monthly + other_opex_annual_usd + GSR × mgmt_pct_of_rent/100 + purchase_price × (maintenance_pct_of_price + capex_pct_of_price)/100` — capex reserve is inside opex (workbook convention).
5. `NOI = EGI − opex`; `cash_flow = NOI − debt_service`.
6. `cap_rate = NOI / purchase_price`; `cash_on_cash = cash_flow / cash_invested`; `DSCR = NOI / debt_service`; `one_pct = gross_monthly_rent / purchase_price`; `expense_ratio = opex / GSR` (flag "something is missing" if < 35%).
7. **Projection** (only if `selling_cost_pct`, `land_pct`, and tax rates are supplied), years t = 1…`holding_years`: rent and the non-percentage expense lines grow at their growth rates from year 2; percentage-of-rent lines follow rent; percentage-of-price lines follow value `V_t = purchase_price × (1 + appreciation_pct/100)^t`. Debt service fixed.
8. **Exit (year N):** `sale_net = V_N × (1 − selling_cost_pct/100)`; `loan_balance_N` from the amortization schedule; `depreciation_total = (purchase_price × (1 − land_pct/100) + rehab_budget) / 27.5 × N` (full-year straight-line convention for this projection); `adjusted_basis = purchase_price + closing_costs_usd + rehab_budget − depreciation_total`; `gain = max(0, sale_net − adjusted_basis)`; `recapture = min(depreciation_total, gain)`; `tax = recapture × min(25, ordinary_marginal_rate_pct)/100 + (gain − recapture) × ltcg_rate_pct/100 + gain × (3.8 if niit_applies else 0)/100 + gain × state_tax_rate_pct/100`; `exit_cash = sale_net − loan_balance_N − tax`.
9. **IRR** of `[−cash_invested, CF_1, …, CF_N + exit_cash]`, solved to 0.01%; if no sign change, report "IRR undefined".
10. **Sensitivities** (one at a time, everything else base): rent −5%; vacancy = 12%; rate +1.00 pt; appreciation −1.00 pt (IRR only). Report CoC, DSCR, cash flow, IRR for each.
11. Compute in cents; report dollars whole, ratios to 2 decimals (DSCR) or 0.01% (rates).

### Decision rules

Evaluate top to bottom; the first match wins. Status bands match the workbook Summary sheet (cap ≥ 6% OK / ≥ 4% Tight; CoC ≥ 8% OK / ≥ 5% Tight; DSCR ≥ 1.25 OK / ≥ 1.0 Tight).

| # | Condition | Recommendation |
|---|---|---|
| 1 | A required input is missing, or fewer than 2 rent comps | No verdict — collect inputs / comps |
| 2 | `DSCR < 1.00` or Year-1 `cash_flow < 0` | **Pass** |
| 3 | `cap_rate ≥ 6%` and `cash_on_cash ≥ 8%` and `DSCR ≥ 1.25` and cash flow ≥ 0 in every sensitivity | **Pursue** |
| 4 | `cash_on_cash ≥ 5%` and `cap_rate ≥ 4%` and `DSCR ≥ 1.00` | **Marginal** — name the sensitivity that breaks it |
| 5 | Otherwise | **Pass** |

The 1% and 50% rules are flags only; they never change the verdict.

### Output template

```markdown
# Rental Property Analysis — {masked address}, {YYYY-MM-DD}

## Headline
**{Pursue | Marginal | Pass}** (Decision rule #{n}). Cap {cap}% · CoC {coc}% · DSCR {dscr} · {N}-yr IRR {irr}%.

## Deal inputs
| Item | Value | Source tag |
|---|---|---|

## Year-1 income & expense
| Line | Annual |
|---|---|
| Gross scheduled rent | |
| Vacancy | |
| Effective gross income | |
| Operating expenses (incl. capex & maintenance reserves) | |
| NOI | |
| Debt service | |
| Cash flow | |

## Ratios
| Metric | Value | Band |
|---|---|---|
| Cap rate | | |
| Cash-on-cash | | |
| DSCR | | |
| 1% rule | | |
| Expense ratio (50% rule) | | |

## {N}-year projection & IRR
{exit math and IRR, or "Not computed — {missing input}"}

## Sensitivity
| Case | Cash flow | CoC | DSCR | IRR |
|---|---|---|---|---|
| Base | | | | |
| Rent −5% | | | | |
| Vacancy 12% | | | | |
| Rate +1 pt | | | | |
| Appreciation −1 pt | | | | |

## Levers the deal lives or dies on
1. {lever}
2. {lever}
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
