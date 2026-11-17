## Business Deductions & QBI Review

description: Audit Schedule C (or S-corp) business deductions for completeness and defensibility — home office, mileage vs actual auto, self-employed health insurance, retirement, Section 179 / bonus depreciation, meals, supplies, professional services, software — and check QBI (Section 199A) 20% pass-through deduction with income-threshold phase-outs and SSTB rules.

## When to use

- First Schedule C — surface deductions the user is missing.
- Year-end planning — flag eligible expenses to time before Dec 31.
- After a CPA review — sanity-check completeness.
- Annual: re-audit because rules and limits change.

## Inputs needed

- Type of business / SSTB status (consulting, law, health, accounting, financial services, performing arts, athletics, investment management = SSTB; engineering, architecture, manufacturing, retail = non-SSTB).
- Gross revenue.
- Itemized expenses to date (or chart of accounts).
- Home-office details: dedicated room? Square footage? Total home square footage? Home mortgage interest / rent / utilities / depreciation basis?
- Vehicle: business miles, personal miles, vehicle cost basis, year placed in service.
- Health insurance premiums (self-employed): paid personally? On a marketplace plan?
- Filing status, taxable income (drives QBI phase-out).
- Whether the user uses an accountable plan (S-corp) for reimbursements.

## Workflow

1. **Walk the standard deduction checklist** (cite Schedule C line):
   - **Line 8 Advertising** — website, ads, business cards.
   - **Line 9 Car & truck expenses** — standard mileage (current-year IRS rate — not in md_facts; look up via `md_sources`) OR actual + depreciation. Standard easier; actual better for expensive vehicle / heavy use. Once actual chosen for a vehicle, can't switch back to standard.
   - **Line 10 Commissions and fees** — referral fees, platform fees (Stripe, Upwork, etc.).
   - **Line 11 Contract labor** — issue 1099-NEC at or above the current-year filing threshold (not in md_facts — verify via `md_sources`) to non-employee contractors.
   - **Line 13 Depreciation / Section 179** — equipment >$2,500 typically depreciated; Sec 179 expensing up to `mortgage_and_real_estate_2026.section_179_expensing_limit` (phase-out from `section_179_phaseout_start`); bonus depreciation per `bonus_depreciation_percent_2026` — verify via `md_sources`, legislation may have changed it.
   - **Line 14 Employee benefits** — only if employees; not the owner's solo health.
   - **Line 15 Insurance (non-health)** — liability, E&O, malpractice, business property. Health insurance is separate (line 29 Sch 1).
   - **Line 16 Interest** — business loan, business credit card interest. Personal-card interest only deductible if business-only card.
   - **Line 17 Legal & professional** — CPA fees, attorney for business matters, registered agent.
   - **Line 18 Office expense** — supplies, postage.
   - **Line 19 Pension & profit-sharing** — handled separately on Sch 1 for owner; Sch C only for employees.
   - **Line 20 Rent or lease** — office, equipment, vehicle (lease only).
   - **Line 21 Repairs & maintenance** — for business assets.
   - **Line 22 Supplies** — consumables.
   - **Line 23 Taxes & licenses** — business licenses, state franchise tax, employer payroll tax. NOT income tax.
   - **Line 24 Travel & meals** — travel 100%; meals 50% (was 100% pandemic-era, now 50% standard, cite year).
   - **Line 25 Utilities** — business phone, business internet (or home-office allocation).
   - **Line 27 Other expenses** — itemize anything not above.
   - **Line 30 Home office** — simplified method ($5/sqft up to 300 sqft = $1,500 max) OR regular method (% of home costs × business-use fraction). Regular usually larger but adds depreciation recapture on home sale.
2. **Above-the-line adjustments** (Schedule 1, not Sch C, but SE-specific):
   - **Half SE tax deduction** (Sch 1 line 15).
   - **Self-employed health insurance** (Sch 1 line 17) — premiums for self + family, capped at net SE income, not eligible if user/spouse eligible for any subsidized employer plan.
   - **SE retirement contribution** (Sch 1 line 16) — Solo 401(k) / SEP / SIMPLE employer portion.
   - **HSA** (Sch 1 line 13) — if HDHP-covered.
3. **QBI deduction (Section 199A)** — `qbi_section_199a_2026.deduction_percent` of qualified business income (formula in Determinism rules step 6).
   - **Below threshold** (`phase_in_start_single` / `phase_in_start_mfj`): full deduction with simple formula.
   - **In phase-in band** (`phase_in_start_*` – `phase_in_end_*`): partial; SSTB-status starts mattering.
   - **Above threshold**: SSTBs lose QBI entirely; non-SSTBs subject to the wage / UBIA limitation (greater of 50% of W-2 wages, or 25% of W-2 wages + 2.5% of unadjusted basis).
   - For S-corp owner: QBI computed on K-1 distribution piece (not W-2 wage piece) — interacts with reasonable-comp choice.
4. **Surface missed deductions.** Common omissions: home internet allocation, business portion of cell phone, software subscriptions, continuing education / certifications, books and journals (subscription audit pairs well here), bank fees on business account, business gifts ($25/recipient/yr cap), startup costs ($5k expensing in year one).
5. **Flag risk areas.** Aggressive deductions that draw IRS attention: 100% business use of vehicle when user only owns one car, home office in a non-dedicated space, excessive meals deduction, family members on payroll without real work, "consulting" classification when actually employment.

## Required citations

- Mileage rate, Sec 179 cap, bonus-depreciation percentage cite current-year IRS notice.
- QBI thresholds cite current-year inflation adjustment.
- Schedule C line numbers cite the current form.

## Deliverable shape

Markdown report `./money-desk/self-employed-planner/deductions-<YYYYMMDD>.md`:
- **Headline** — e.g., "Identified ${sum_delta} in additional deductions vs current filing; estimated tax saving ${tax_value} (Determinism rules step 7)."
- **Sch C deduction table** — line, amount currently claimed, amount recommended, $delta, notes.
- **Above-the-line adjustments** — half-SE, SEHI, retirement, HSA.
- **QBI calculation** — QBI, threshold band, applicable limitation, deduction amount.
- **Missed deduction recommendations** — ranked by $ impact.
- **Year-end timing list** — purchases / contributions to make before Dec 31.
- **Risk callouts** — aggressive items to substantiate or back off.

## Notes

- The IRS rule of thumb: a deduction needs to be "ordinary AND necessary" for your business. "Ordinary" = common in your industry; "Necessary" = helpful and appropriate. Most legitimate business expenses pass.
- Receipts: under $75 not required for non-lodging; lodging always. Keep regardless for digital audit trail.
- Home office and vehicle are the highest-leverage deductions but also the most-audited. Do them right (contemporaneous mileage log, dedicated home-office space) and they're bulletproof.
- This skill audits and recommends; it does NOT prepare the return. For complex situations (multi-state, asset disposition, depreciation recapture), hand off to a CPA.

## Determinism rules

### Input keys

- `tax_year` — integer
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `entity` — `sole_prop` | `smllc` | `s_corp`
- `business_type` — string; `sstb` — bool (per the Inputs-needed SSTB list)
- `gross_revenue_usd` — number
- `sch_c_lines` — list of `{ line (8–27, 30), description, claimed_usd, available_usd? }` (`available_usd` = documented amount the user could claim; default = `claimed_usd`)
- `home_office` — `{ exclusive_use (bool), office_sqft, home_sqft, home_costs_annual_usd (mortgage interest or rent + utilities + insurance + repairs), depreciation_annual_usd? }`; optional
- `vehicle` — `{ business_miles, total_miles, actual_costs_annual_usd, depreciation_annual_usd?, actual_method_used_before (bool), household_vehicle_count }`; optional
- `se_health_premiums_usd` — number; `subsidized_employer_plan_eligible` — bool
- `se_retirement_contrib_usd`, `hsa_contrib_usd` — numbers; default 0
- `taxable_income_before_qbi_usd` — number; `net_capital_gain_usd` — number, default 0
- `w2_wages_paid_usd`, `ubia_usd` — numbers; default 0 (QBI limitation inputs)
- `federal_marginal_rate_pct`, `state_marginal_rate_pct` — numbers; optional overrides
- `family_on_payroll_without_timesheets` — bool; default false

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Gross revenue and Schedule C expenses | **Ask — no default** | — |
| Standard mileage rate | Not in md_facts — look up via `md_sources` (IRS notice for the tax year), else tag `[UNSOURCED]` and do not compute the mileage method | `[UNSOURCED]` |
| Section 179 limit and phase-out | `md_facts` → `mortgage_and_real_estate_2026.section_179_expensing_limit`, `section_179_phaseout_start` | `[FHFA / IRS RE 2026]` |
| Bonus depreciation % | `md_facts` → `mortgage_and_real_estate_2026.bonus_depreciation_percent_2026` — verify via `md_sources` before use (legislation may have changed it) | `[FHFA / IRS RE 2026]` |
| QBI rate and thresholds | `md_facts` → `qbi_section_199a_2026.deduction_percent`, `phase_in_start_mfj` / `phase_in_end_mfj` / `phase_in_start_single` / `phase_in_end_single` (single values for single/HoH/MFS) | `[IRS QBI 2026]` |
| 1099-NEC filing threshold | Not in md_facts — look up via `md_sources`, else tag `[UNSOURCED]` | `[UNSOURCED]` |
| SS wage base and rates | `md_facts` → `social_security_2026.wage_base`, `fica_employee_rate`, `medicare_employee_rate` | `[SSA 2026]` |
| Federal marginal rate | MFJ: bracket containing `taxable_income_before_qbi_usd` from `md_facts` → `income_tax_brackets_mfj_2026.brackets`; other statuses: `md_sources`, else `[UNSOURCED]` | `[IRS 2026 brackets]` |
| State marginal rate | **Ask — no default** | `[USER-PROVIDED]` |
| Simplified home-office rate | $5/sq ft, max 300 sq ft (IRS, this skill) | — |
| Meals | 50% deductible (this skill) | — |

### Calculation method

Compute in cents; report whole dollars. md_facts rates are decimals.

1. **Line walk** in Schedule C line order (8 → 30). Per line `delta = available_usd − claimed_usd`. Meals on line 24b are entered at 100% of cost and allowed at 50%.
2. **Home office** (only if `exclusive_use`): `simplified = 5 × min(office_sqft, 300)`; `regular = (office_sqft / home_sqft) × home_costs_annual_usd + depreciation_annual_usd`. Method = regular if `regular > simplified`, else simplified (tie → simplified). If regular, note depreciation recapture on sale.
3. **Vehicle:** `bu = business_miles / total_miles`. `actual = bu × actual_costs_annual_usd + depreciation_annual_usd × bu`. `standard = business_miles × mileage_rate` (if sourced). If `actual_method_used_before`, method = actual (no switch back). Else method = the larger (tie → standard).
4. **Net profit** `p = gross_revenue_usd − Σ allowed lines − home office`.
5. **Above-the-line:** half SE tax (`se_tax` per the Quarterly Estimated Taxes formula: `b = p × 0.9235`, SS on `min(b, wage_base)`, Medicare on `b`); SEHI = `min(se_health_premiums_usd, p − half_se − se_retirement_contrib_usd)` and 0 if `subsidized_employer_plan_eligible`; SE retirement and HSA as supplied.
6. **QBI** `q = p − half_se − sehi − se_retirement_contrib_usd`; `ti = taxable_income_before_qbi_usd`; `start`, `end` = thresholds for the filing status; `pct = deduction_percent`; `wage_limit = max(0.50 × W, 0.25 × W + 0.025 × U)` with `W = w2_wages_paid_usd`, `U = ubia_usd`.
   - `ti ≤ start`: `ded = pct × q`.
   - `start < ti < end`: `f = (ti − start) / (end − start)`. If SSTB, scale `q`, `W`, `U` by `(1 − f)` first. `tent = pct × q`; `excess = max(0, tent − wage_limit)`; `ded = tent − excess × f`.
   - `ti ≥ end`: SSTB → `ded = 0`; non-SSTB → `ded = min(pct × q, wage_limit)`.
   - Final cap: `ded = min(ded, pct × max(0, ti − net_capital_gain_usd))`; floor 0.
7. **Tax value** of each positive delta = `delta × (m_ord + s) + delta × se_rate`, where `se_rate = 0.9235 × 2 × (fica_employee_rate + medicare_employee_rate)` if `b < wage_base`, else `0.9235 × 2 × medicare_employee_rate`. Rank missed deductions by tax value descending → tie: lower Schedule C line number.
8. **Risk flags** (fixed list, fixed severity): (H1) vehicle `bu = 1.0` and `household_vehicle_count = 1` — High; (H2) home office claimed and `exclusive_use = false` — High; (M1) meals allowed above 50% — Medium; (M2) `family_on_payroll_without_timesheets` — Medium.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Gross revenue or Schedule C expenses missing | No review — ask |
| 2 | Any High risk flag | Substantiate or remove the High-risk items first; list missed deductions as "after cleanup" |
| 3 | `ti ≥ start` and `entity = s_corp` | Report the QBI estimate and hand the reasonable-comp / QBI interaction to a CPA |
| 4 | Σ positive deltas > $0 | Claim the ranked missed deductions (with documentation listed per item) |
| 5 | Otherwise | Current filing is complete — no additions identified |

### Output template

```markdown
# Business Deductions & QBI Review — {tax_year}

## Headline
Identified **${sum_delta}** in additional deductions; estimated tax saving **${tax_value}**; QBI deduction **${ded}**. Recommendation: **{rule # action}**.

## Schedule C deduction table
| Line | Description | Currently claimed | Recommended | Delta | Notes / source |
|---|---|---|---|---|---|

## Home office
{simplified vs regular comparison and method chosen — or "Not applicable — no exclusive-use space"}

## Vehicle
{standard vs actual comparison and method chosen — or "Not applicable — no business vehicle"}

## Above-the-line adjustments
| Item | Amount | Basis |
|---|---|---|
| Half SE tax | | |
| SE health insurance | | |
| SE retirement | | |
| HSA | | |

## QBI calculation
| QBI | Taxable income | Band (below / phase-in / above) | SSTB | Wage/UBIA limit | Deduction |
|---|---|---|---|---|---|

## Missed deductions (ranked)
| Rank | Item | Amount | Tax value |
|---|---|---|---|

## Year-end timing list
- {purchases / contributions before Dec 31}

## Risk callouts
| Flag | Severity | Fix |
|---|---|---|
{or "None"}

## Assumptions & flags
- {mileage rate source, bonus-depreciation verification, [ASSUMPTION] items}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).