## House Hacking Analysis

description: Underwrite an owner-occupied 2-4 unit (or single-family with ADU / rented rooms) purchase as both a home and a rental. Uses owner-occupied financing (3.5% FHA, 5% conventional, 0% VA) on multi-family — the highest-leverage entry into real-estate investing. Computes the effective rent / mortgage the owner pays after rental offsets.

## When to use

- First-time buyer considering a duplex / triplex / fourplex instead of a single-family.
- Single-family owner considering adding an ADU, basement apartment, or roommates.
- Recent grad / young professional in HCOL market looking to break into ownership.
- Wants to combine first-home purchase with the start of a rental portfolio.

## Inputs needed

- Property: number of units, current rents on non-owner units (from current leases — get actuals, not estimates).
- Purchase price, expected down payment %, loan program (FHA 3.5%, conventional 5%, VA 0%, USDA).
- Owner's planned occupancy duration (most owner-occupied loans require 12-month minimum occupancy; FHA strictly enforced).
- Operating expenses (taxes, insurance, utilities, maintenance reserves).
- Owner's current rent comp (what they'd otherwise pay).
- Plan after owner-occupancy ends: keep all units rented (becomes pure rental) or sell (§121 exclusion qualification).

## Workflow

1. **Compute total PITI** for the building (Principal + Interest + Taxes + Insurance + PMI/MIP + HOA if any).
2. **Compute rent income** from the non-owner units only (owner's unit = $0 — they live there).
3. **Compute effective owner housing cost** = PITI + maintenance + vacancy reserve − rent income.
4. **Compare to** what the owner would pay renting comparable space elsewhere. The delta is the house-hack value vs renting.
5. **Stress test**: what if the rented units are vacant for 3 months? What if a unit takes a $5k turnover cost? Pass if liquid reserves ≥ 3 months of rent from the other units + $5,000; also show full PITI vs the rent-elsewhere baseline.
6. **FHA-specific**: 3.5% down on a 2-4 unit, owner must occupy one unit for ≥ 12 months, MIP is **for the life of the loan** since 2013 — refinance to conventional after 20% equity to drop MIP. FHA self-sufficiency test on 3-4 unit (75% of rents must cover PITI).
7. **Conventional 5% down** on 2-unit owner-occupied: PMI drops at 78% LTV, more flexible occupancy enforcement.
8. **VA loan**: 0% down on up to 4-unit if eligible veteran, no PMI, funding fee 2.15-3.3%.
9. **Long-game**: after owner moves out, building converts to pure rental. Re-run `rental_property_analyzer` for that scenario. §121 capital-gains exclusion (`md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `.section_121_exclusion_mfj`) requires 2 of 5 years owner-occupied; clock starts at first occupancy.

## Output

- Effective monthly housing cost (vs rent-elsewhere baseline).
- Vacancy stress-test result.
- Loan-program comparison (FHA vs conventional vs VA) with all-in monthly cost and total 5-year cost of ownership.
- Year-12 transition plan (refinance / keep / sell with §121).

## Citations / sources

- Rents: copies of current leases or comp-cited estimates.
- Loan terms: Loan Estimate document.
- FHA self-sufficiency: HUD Handbook 4000.1.
- §121 exclusion: IRC §121, IRS Pub 523.

## Disclaimer

Analysis only. Landlord-tenant law is state-specific; recommend local real-estate attorney for owner-occupied landlord rights. Some HOAs / condo associations and some city zoning codes restrict renting rooms — check before assuming.

## Determinism rules

### Input keys

- `units` — integer, 1–4 (1 = single-family with ADU / rooms)
- `purchase_price` — number, USD; `closing_costs_usd` — number
- `rented_units` — list of `{ name, monthly_rent_usd, source (lease | comp) }` (non-owner units)
- `owner_unit_market_rent_usd` — number, market rent of the owner's unit (FHA self-sufficiency)
- `loan_options` — list of `{ program (fha | conventional | va | usda), down_payment_pct, interest_rate_pct, term_years, monthly_mortgage_insurance_usd, upfront_fee_financed_usd }` from Loan Estimates
- `property_tax_annual_usd`, `insurance_annual_usd`, `hoa_monthly_usd` — numbers
- `owner_paid_utilities_monthly_usd` — number (default 0)
- `maintenance_reserve_monthly_usd`, `capex_reserve_monthly_usd` — numbers (optional)
- `vacancy_pct` — number, % of rented-unit rent
- `rent_elsewhere_monthly_usd` — number, what the owner would otherwise pay
- `owner_liquid_reserves_usd` — number
- `va_eligible` — bool
- `county_loan_limit_usd` — number, FHA / conforming limit for the unit count and county (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Rents on non-owner units | **Ask — no default**; current leases, else ≥ 2 comps | — |
| Loan rate, mortgage insurance, upfront fees | **Ask — no default** (Loan Estimate); FHA MIP, VA funding fee and PMI rates are not in md_facts | — |
| Vacancy | **Ask**; else `md_facts` → `behavioral_assumptions_safe_defaults.rental_vacancy_default_percent` | `[ASSUMPTION]` |
| Maintenance reserve | **Ask**; else `md_facts` → `rental_maintenance_default_percent_of_rent` × rented-unit rent | `[ASSUMPTION]` |
| Capex reserve | **Ask**; else `md_facts` → `rental_capex_reserve_default_percent_of_rent` × rented-unit rent | `[ASSUMPTION]` |
| Loan limits | `county_loan_limit_usd` if given; for 1 unit, `md_facts` → `mortgage_and_real_estate_2026.conforming_loan_limit_one_unit_baseline` / `.fha_loan_limit_one_unit_low_cost_floor` as floors; 2–4-unit limits not in md_facts — look up via `md_sources` (FHFA / HUD), else `[UNSOURCED]` | `[FHFA / IRS RE 2026]` |
| §121 exclusion | `md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `.section_121_exclusion_mfj` | `[FHFA / IRS RE 2026]` |
| Vacancy stress | All rented units empty 3 months + one $5,000 turnover (Workflow step 5) | `[ASSUMPTION]` |
| FHA self-sufficiency (3–4 units) | 75% of total market rent (all units incl. owner's) ≥ PITI | HUD Handbook 4000.1 |

### Calculation method

Run steps 1–5 for each loan option; work in cents, report whole dollars.

1. `loan = purchase_price × (1 − down_payment_pct/100) + upfront_fee_financed_usd`; `pi = PMT(rate/12, term × 12, −loan)`.
2. `PITI = pi + property_tax_annual_usd/12 + insurance_annual_usd/12 + monthly_mortgage_insurance_usd + hoa_monthly_usd`.
3. `rent_income = Σ rented_units.monthly_rent_usd`; `vacancy_reserve = rent_income × vacancy_pct/100`.
4. `effective_owner_cost = PITI + owner_paid_utilities_monthly_usd + maintenance_reserve + capex_reserve + vacancy_reserve − rent_income`.
5. `house_hack_value = rent_elsewhere_monthly_usd − effective_owner_cost` (positive = cheaper than renting).
6. **5-year cost of ownership** = down payment + `closing_costs_usd` + Σ over months 1–60 of (interest + taxes + insurance + mortgage insurance + HOA) − 60 × `rent_income` × (1 − vacancy_pct/100). Principal is excluded (it is equity).
7. **Eligibility per option:** VA requires `va_eligible`; FHA on 3–4 units requires `0.75 × (rent_income + owner_unit_market_rent_usd) ≥ PITI`; loan ≤ `county_loan_limit_usd` when supplied. Ineligible options are listed with the reason and excluded.
8. **Stress test:** `stress_cost = 3 × rent_income + 5,000`; pass if `owner_liquid_reserves_usd ≥ stress_cost`. Also report full PITI vs `rent_elsewhere_monthly_usd`.
9. **Program pick:** lowest 5-year cost among eligible options; tie → lower PITI; tie → input order.
10. Missing required input → stop and list it.

### Decision rules

Evaluate top to bottom on the picked program; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Required input missing, or no eligible loan option | No verdict — collect inputs / options |
| 2 | Stress test fails | **Not yet** — build reserves to `stress_cost` first |
| 3 | `effective_owner_cost ≤ rent_elsewhere_monthly_usd` | **Pursue** with the picked program |
| 4 | `effective_owner_cost ≤ 1.10 × rent_elsewhere_monthly_usd` | **Marginal** — pursue only if the ownership/rental goal is worth up to a 10% premium over renting |
| 5 | Otherwise | **Pass** — renting is cheaper |

### Output template

```markdown
# House Hacking Analysis — {masked address}, {YYYY-MM-DD}

## Headline
**{verdict}** (Decision rule #{n}). Effective owner cost **${effective_owner_cost}/mo** vs renting **${rent_elsewhere}/mo** → house-hack value **${house_hack_value}/mo**.

## Monthly build ({program})
| Line | Monthly |
|---|---|
| P&I | |
| Taxes + insurance | |
| Mortgage insurance | |
| HOA + owner utilities | |
| Maintenance + capex + vacancy reserves | |
| Less rent from other units | |
| **Effective owner cost** | |

## Loan program comparison
| Program | Down payment | Loan | PITI | Effective owner cost | 5-yr cost of ownership | Eligible |
|---|---|---|---|---|---|---|

## Stress test
{3-month vacancy + $5,000 turnover vs reserves; full PITI vs rent elsewhere}

## FHA self-sufficiency
{75% test result, or "Not applicable — 1–2 units or no FHA option"}

## Transition plan
{post-occupancy: keep as rental (re-run Rental Property Analyzer), refinance to drop MI, or sell with §121 (2-of-5-year test; owner-unit share only)}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).