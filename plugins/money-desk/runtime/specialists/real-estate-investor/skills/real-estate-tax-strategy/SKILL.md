## Real Estate Tax Strategy

description: Walk through the tax mechanics specific to residential real-estate investors — straight-line depreciation, cost segregation + bonus depreciation, §469 passive activity loss rules, real-estate professional status (REPS), §1031 like-kind exchange timing, and §121 primary-residence exclusion. Educational; actual filings go to a real-estate-experienced CPA.

## When to use

- New rental property — set up the depreciation schedule and basis allocation correctly from day 1.
- Considering cost segregation to accelerate first-year deductions.
- High W-2 income generating "suspended passive losses" — explain why and what to do.
- Planning to sell a rental — show after-tax proceeds with all four layers of tax (LTCG, depreciation recapture, NIIT, state).
- Considering a §1031 like-kind exchange to defer the sale tax.
- Spouse considering qualifying as Real Estate Professional (REPS) to convert passive losses to active.

## Inputs needed

- Purchase price + improvements + closing costs (basis).
- Land value vs building value at acquisition (county-assessor ratio is most-commonly used; can be improved with appraisal).
- Date placed in service.
- Annual rents + expenses (from Schedule E or projected).
- AGI / MAGI (drives §469 special $25k allowance phase-out at $100k–$150k MAGI).
- Hours per year owner spends on real-estate activities (drives REPS eligibility).
- Hold period and target sale date if planning §1031 or §121.

## Workflow

### Depreciation basics
- Residential rental: **27.5-year straight-line** on the building portion only (land doesn't depreciate). Form 4562 first year, Schedule E thereafter.
- Allocate purchase price between land and building using county assessor ratio (e.g., 20/80) OR an appraisal. **Higher building allocation = more depreciation = more deduction.** Don't be aggressive without support.

### Cost segregation
- An engineering study reclassifies portions of the building (carpet, fixtures, landscaping, certain systems) into 5/7/15-year property.
- Combined with bonus depreciation (rate for the acquisition date: `md_facts` → `mortgage_and_real_estate_2026.bonus_depreciation_rate_2026`, verified via `md_sources` — 2025 legislation changed the §168(k) phase-down), can shift huge first-year deductions.
- **Tradeoff**: bigger depreciation recapture (§1245 ordinary income up to 37%) at sale on the accelerated portion. Worth it if user can use the deductions now AND plans to hold long or §1031 out.
- Typically only economic above ~$500k cost basis; cost-seg study runs $5-15k. The go/no-go uses the provider's actual estimate and fee (Determinism rules step 3).

### §469 passive activity loss rules
- Rental losses are PASSIVE by default — can only offset passive income.
- Excess losses are SUSPENDED (carried forward) until the property generates passive income, the user has passive income elsewhere, or the property is sold.
- **Special $25k allowance**: if MAGI < $100k, up to $25k of rental losses offsets ordinary income (phases out fully by MAGI $150k).
- **REPS (Real Estate Professional)** under §469(c)(7): if > 50% of personal services AND > 750 hours in real-estate trades/businesses → rentals become NON-passive — losses fully offset W-2 / business income. Spouse can qualify the household. Hours must be documented contemporaneously.

### §1031 like-kind exchange
- Defers (does not eliminate) the gain on sale by rolling into another real-property held for investment.
- **45 days** to identify replacement property; **180 days** total to close.
- **Qualified Intermediary** required — proceeds never touch taxpayer's hands.
- Since TCJA: real property only (no equipment, art, crypto, etc.).
- Boot (cash or debt-relief) is taxable.
- **At the next sale**, the deferred gain comes due unless the user dies and heirs get step-up.

### §121 primary-residence exclusion
- Exclusion of capital gain on primary residence: `md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `.section_121_exclusion_mfj`.
- 2 of the last 5 years use + ownership.
- Can be used every 2 years.
- **Combined with house-hacking**: if owner-occupied 2-4 unit, exclusion applies only to owner's unit allocation; rented units treated as rental property at sale.

## Output

- Depreciation schedule (every tax year until fully depreciated — 29 tax years under the mid-month convention unless placed in service in January).
- Cost-seg break-even analysis if relevant.
- §469 status: active / passive / REPS-eligible.
- Sale-tax projection: LTCG + recapture (ordinary rate capped at 25%) + NIIT (3.8% above `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_single` / `.niit_threshold_mfj`) + state.
- §1031 or §121 strategy if applicable.

## Citations / sources

- IRS Pub 527 (residential rental property).
- IRC §168 (depreciation), §469 (passive activity), §1031 (like-kind exchange), §121 (primary residence).
- Bonus depreciation schedule: IRC §168(k) — cite tax year.

## Disclaimer

Educational. Cost-seg, §1031, and REPS all create audit risk if mis-claimed. Strongly recommend a CPA experienced with real estate (NOT a generalist) for any filing. Bonus depreciation percentages change annually — confirm current year before relying on this.

## Determinism rules

### Input keys

- `purchase_price_usd`, `closing_costs_capitalized_usd`, `improvements_usd` — numbers
- `land_pct` — number, % of total basis allocated to land (county assessor ratio or appraisal)
- `placed_in_service_yyyy_mm` — string
- `annual_rent_usd`, `annual_expenses_usd` — numbers, before depreciation (Schedule E or projected)
- `filing_status` — `mfj` | `single` | `mfs` | `hoh`
- `magi_usd` — number (for the §469 allowance; excludes passive losses)
- `active_participation` — bool
- `re_hours_per_year`, `total_work_hours_per_year` — numbers, for the qualifying spouse (REPS)
- `other_passive_income_usd`, `suspended_losses_usd` — numbers (default 0)
- `ordinary_marginal_rate_pct`, `state_tax_rate_pct` — numbers, %
- `cost_seg` — `{ reclass_pct, study_fee_usd, acquisition_yyyy_mm }` (optional; reclass_pct from the provider's estimate)
- `sale` — `{ price_usd, selling_costs_usd, year, other_taxable_income_usd }` (optional)
- `exchange_1031` — `{ planned (bool), relinquished_close_date }` (optional)
- `primary_residence_years_owned_and_used_last_5` — number (optional, §121)
- `owner_unit_share_pct` — number, % of a 2–4 unit used as residence (default 100 for single-family)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Basis components, land % | **Ask — no default** | — |
| Residential recovery period | `md_facts` → `mortgage_and_real_estate_2026.residential_rental_depreciation_life_years_27_5`; mid-month convention (IRS Pub 527 / 946) | `[FHFA / IRS RE 2026]` |
| Bonus depreciation % | `md_facts` → `mortgage_and_real_estate_2026.bonus_depreciation_rate_2026` — verify for the acquisition date via `md_sources` (2025 legislation changed §168(k)); else `[UNSOURCED]` | `[FHFA / IRS RE 2026]` |
| §469 special allowance | $25,000, phased out 50¢ per $1 of MAGI over $100,000 (zero at $150,000) — statutory, not indexed | IRC §469(i) |
| REPS test | > 750 hours and > 50% of personal-service hours in real-property trades | IRC §469(c)(7) |
| Unrecaptured §1250 rate | Ordinary rate capped at 25% | IRC §1(h)(1)(E) |
| LTCG brackets | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` (MFJ); `.ltcg_qualified_dividend_brackets_single` / `.ltcg_qualified_dividend_brackets_hoh` for other statuses | `[IRS 2026 limits]` |
| NIIT | 3.8% over `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `.niit_threshold_single` | `[IRS 2026 limits]` |
| §121 exclusion | `md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `.section_121_exclusion_mfj` | `[FHFA / IRS RE 2026]` |
| §1031 deadlines | 45 days to identify, 180 days to close; real property only (`md_facts` → `mortgage_and_real_estate_2026.1031_like_kind_real_property_only`) | IRC §1031 |
| Cost-seg reclass % and fee | **Ask — no default** (provider estimate) | — |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. `total_basis = purchase_price_usd + closing_costs_capitalized_usd + improvements_usd`; `building_basis = total_basis × (1 − land_pct/100)`.
2. **Straight-line schedule:** annual = `building_basis / 27.5`; year 1 = annual × (12 − placed-in-service month + 0.5) / 12 (mid-month); middle years = annual; final year = remaining basis. List every tax year until fully depreciated.
3. **Cost segregation** (if supplied): `reclass = building_basis × reclass_pct/100`; `bonus_y1 = reclass × bonus_pct`; `extra_y1_deduction = bonus_y1 − (reclass / 27.5 × year-1 fraction)` (remaining reclass basis follows its 5/7/15-year class — list as "per study"); `y1_tax_value = extra_y1_deduction × ordinary_marginal_rate_pct/100` only if losses are usable (step 5 result ≠ "suspended"); `net_y1_benefit = y1_tax_value − study_fee_usd`.
4. **Net rental income** = `annual_rent_usd − annual_expenses_usd − year depreciation`.
5. **§469 status:** REPS if `re_hours_per_year > 750` and `re_hours_per_year > 0.5 × total_work_hours_per_year` → loss non-passive. Else, if `active_participation`: `allowance = max(0, 25,000 − 0.5 × max(0, magi_usd − 100,000))`; usable loss = `min(loss, allowance + other_passive_income_usd)`; remainder suspended. Else usable = `min(loss, other_passive_income_usd)`.
6. **Sale tax** (if `sale`): `adjusted_basis = total_basis − accumulated depreciation`; `gain = price − selling costs − adjusted_basis`; release `suspended_losses_usd` against ordinary income; `recapture = min(accumulated depreciation, gain)` taxed at `min(25, ordinary_marginal_rate_pct)%`; remaining gain at the LTCG bracket(s) stacked on `other_taxable_income_usd`; NIIT = 3.8% × `min(gain, max(0, MAGI incl. gain − threshold))`; state = `state_tax_rate_pct` × gain. With `owner_unit_share_pct < 100`, §121 applies only to the owner-unit share of gain excluding depreciation-attributable gain.
7. **§1031 dates:** identify-by = close date + 45 days; close-by = close date + 180 days (or the return due date, if earlier).
8. Report whole dollars. Missing basis or land % → stop at step 1.

### Decision rules

Evaluate top to bottom; the first match is the headline strategy; all other applicable findings still appear.

| # | Condition | Strategy |
|---|---|---|
| 1 | Basis or land % missing | No analysis — collect inputs |
| 2 | `exchange_1031.planned` and a sale is modelled | **§1031** — show deferred tax and the 45/180-day calendar; QI before closing |
| 3 | §121 test met (owned and used ≥ 2 of last 5 years) and a sale is modelled | **§121 exclusion** on the eligible share; recapture still taxed |
| 4 | Cost seg supplied, losses usable (step 5), and `net_y1_benefit > 0` | **Get a cost-segregation study**; flag higher §1245 recapture at sale |
| 5 | Step 5 result leaves losses suspended and REPS hours are within 100 hours of the 750 test | **Document REPS hours** — near the threshold; contemporaneous log required |
| 6 | Step 5 result leaves losses suspended | **Carry forward** suspended losses; they release on full taxable disposition |
| 7 | Otherwise | **Straight-line depreciation only** — no special strategy |

### Output template

```markdown
# Real Estate Tax Strategy — {property}, tax year {YYYY}

## Headline
**{strategy}** (Decision rule #{n}).

## Basis allocation
| Component | Amount |
|---|---|
| Total basis | |
| Land ({land_pct}%) | |
| Building | |

## Depreciation schedule
| Tax year | Depreciation | Accumulated | Remaining basis |
|---|---|---|---|

## Cost segregation
{reclass, bonus %, year-1 extra deduction, net benefit — or "Not applicable — no study estimate supplied"}

## §469 status
{REPS / active participation allowance / passive; usable vs suspended loss}

## Sale-tax projection
| Layer | Amount | Rate | Tax |
|---|---|---|---|
| Depreciation recapture | | | |
| LTCG | | | |
| NIIT | | | |
| State | | | |
| **Total** | | | |
{or "Not applicable — no sale modelled"}

## §1031 / §121
{calendar or exclusion math — or "Not applicable"}

## Hand-off
- CPA experienced in real estate before filing.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
