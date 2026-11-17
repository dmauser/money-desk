## Auto / Home / Renters Policy Review

description: Line-by-line declarations-page audit of personal auto, homeowners, condo, or renters insurance. Flags coverage gaps (umbrella attach-points, water-backup, ordinance-and-law, UM/UIM, mold), under-insurance (replacement cost vs market value), unneeded add-ons (rental-car coverage on the second-driver-rare-use car), and the easy structural fixes (raising deductibles, bundling, removing collision on old cars).

## When to use

- Annual policy renewal — never let auto-renew without one annual eyes-on.
- Recent home purchase or major renovation.
- Recent vehicle purchase or vehicle aging past collision-coverage value.
- New driver added to household (teen, elderly relative).
- Recent claim history — pricing changed, may need shop.
- Bundling decision (one carrier auto+home vs split).
- Suspected gap after a near-miss claim.

## Inputs needed

- Declarations page for each policy (auto, home/condo/renters, umbrella if any).
- Replacement cost estimate for the home (NOT market value — see below).
- Net worth approximate.
- Household composition: drivers, ages, household members.
- Property features: pool, trampoline, dog (breed), home business, frequent guests, distance to fire hydrant + station.
- Use of vehicles: pleasure / commuting / business; annual mileage; garaging location.
- Claims in last 5 years.
- Any rental / Airbnb activity from the property.

## Workflow

### 1. Liability — the most important line

#### Auto liability
- Default state minimums are dangerously low (e.g., 25/50/25 — meaning $25k per person, $50k per accident bodily injury, $25k property damage).
- Recommended floor: 250k/500k/100k for net worth $100k–$999,999; 500k/500k/250k or "CSL $500k+" for net worth ≥ $1M (Determinism rules step 1). With an umbrella, also meet the umbrella carrier's stated underlying-liability minimum.
- **Uninsured / Underinsured Motorist (UM/UIM)**: critical, often under-purchased. Recommend matching liability limits (your own coverage if hit by an under-insured driver). One serious injury exceeds many drivers' liability cap quickly.

#### Home liability
- Standard HO-3 typically includes $100k-300k personal liability. Recommend at least $300k, or the umbrella carrier's required underlying limit if higher.
- Medical-payments-to-others: $5k typical; $10k recommended.

### 2. Property — replacement cost not market value

#### Dwelling Coverage A
- This must equal the **REBUILD COST** of the structure — not the market value (which includes land).
- Underinsurance is rampant when buyers insure to mortgage / purchase price instead of replacement.
- Check: replacement cost is typically $150-300/sqft depending on region and finish level; ISO 360-Value or similar replacement-cost estimator.
- Extended replacement cost endorsement (125-150%) for hard-to-rebuild homes (custom, historic, post-disaster spike pricing).

#### Other Structures (Coverage B)
- Typically 10% of A — adequate for detached garage / shed but not detached ADU. If detached ADU rented, separate landlord policy required.

#### Personal Property (Coverage C)
- Typically 50-70% of A. Replacement Cost endorsement (RC) vs Actual Cash Value (ACV) — RC always preferable; small premium difference, huge claim difference.
- **Scheduled items**: jewelry, art, wine, firearms, cameras above unscheduled sub-limits (often $1,500-2,500 per category). Schedule as inland marine / personal articles floater.

#### Loss of Use (Coverage D)
- Typically 20-30% of A. Reasonable for most.

### 3. Common gaps to specifically check

- **Water backup / sump pump failure**: standard HO-3 excludes; cheap endorsement ($30-80/year), high frequency.
- **Service line coverage** (water main, sewer, electrical service from street to house): cheap endorsement ($30-60/year).
- **Ordinance and law**: covers extra rebuild cost to bring home up to current code after a loss. Often 10% sub-limit standard; increase to 25-50% for homes 30+ years old (Determinism rules step 8).
- **Mold sub-limit**: often $5k-10k cap; review and increase if in high-humidity region.
- **Flood**: ALWAYS excluded from HO-3. NFIP or private. Required if in FEMA SFHA; recommended even if not (25% of NFIP claims come from outside SFHA).
- **Earthquake**: excluded from HO-3; separate policy in seismic zones.
- **Wind / hurricane named-storm deductible**: separate percentage-deductible in coastal states (2-5% of dwelling A). User often unaware until the claim — flag explicitly.
- **Short-term rental (Airbnb/VRBO)**: excluded from standard HO-3; needs STR endorsement or commercial policy.
- **Home-based business**: business inventory / equipment / liability often excluded; needs endorsement or separate BOP.

### 4. Deductible review

- Hand-off to `deductible_optimizer` for the math; default recommendation is to raise auto and home deductibles to the tier selected by the Deductible Optimizer's decision rules (emergency-fund cap and payback test), redirect savings to premium offset or umbrella purchase.

### 5. Vehicle-by-vehicle right-sizing

- For each vehicle: check actual cash value vs annual collision+comprehensive premium. Rule: drop collision + comprehensive when the annual premium for those coverages > 10% of vehicle ACV and the vehicle is not financed or leased.
- Drop rental-car-reimbursement on the second-driver-rare-use car if household has a backup vehicle.
- Towing / roadside often duplicates AAA or factory roadside.

### 6. Bundling check

- Bundling discount (auto + home) typically 5-15%; varies by carrier. But the BEST auto carrier and BEST home carrier are often different. Quote separately AND bundled to compare.
- Independent agent / online quote shopping; rotation every 3-5 years even with no problems — pricing migrates carrier-by-carrier.

## Output

- Coverage A / B / C / D / Liability summary with recommended changes.
- Gap checklist (water-backup / service-line / ordinance / mold / flood / earthquake / STR / business / scheduled items) with $ cost of fix.
- Vehicle-by-vehicle right-size recommendation.
- Bundling recommendation.
- Deductible recommendation (hand-off to `deductible_optimizer` for math).
- Specific umbrella recommendation if liability + net worth gap exists (hand-off to `umbrella_sizing`).

## Citations / sources

- Declarations page line items (always cite the specific line).
- ISO HO-3 form for standard exclusions.
- NFIP / private flood / state earthquake program pricing data.
- State DOI rate-filing public records for benchmark.

## Disclaimer

Analysis only. Doesn't bind, cancel, or modify policies. Coverage terminology and form numbers vary by carrier; always read the actual policy form before relying on a coverage. For complex situations (high net worth, multiple properties, public-facing professional), engage an independent broker with high-net-worth-carrier appointments (Chubb, PURE, AIG Private Client).

## Determinism rules

### Input keys

- `net_worth_usd` — number
- `auto_policies` — list of `{ carrier, bi_per_person_usd, bi_per_accident_usd, pd_usd, csl_usd?, um_uim_per_person_usd, um_uim_per_accident_usd, annual_premium_usd }`
- `vehicles` — list of `{ name, acv_usd, collision_comp_annual_premium_usd, financed_or_leased (bool), rental_reimbursement (bool), backup_vehicle_available (bool) }`
- `home_policy` — `{ form (HO-3 | HO-5 | HO-6 | HO-4 | DP-3), coverage_a_usd, coverage_b_usd, coverage_c_usd, coverage_c_basis (RC | ACV), coverage_d_usd, liability_usd, med_pay_usd, extended_replacement_pct, ordinance_law_pct, water_backup (bool), service_line (bool), mold_sublimit_usd, named_storm_deductible_pct?, annual_premium_usd }`
- `replacement_cost_estimate_usd` — number, rebuild cost from a replacement-cost estimator (not market value)
- `home_year_built` — integer; `custom_or_historic` — bool
- `in_fema_sfha` — bool; `flood_policy` — bool; `seismic_zone` — bool; `earthquake_policy` — bool; `coastal_wind_state` — bool
- `str_activity` — bool; `str_endorsement` — bool; `home_business` — bool; `business_endorsement` — bool
- `valuables` — list of `{ category, value_usd, unscheduled_sublimit_usd, scheduled (bool) }`
- `umbrella` — `{ held (bool), required_auto_csl_usd?, required_auto_split?, required_home_liability_usd? }`
- `bundled_quote_usd`, `separate_quotes_usd` — numbers, total annual premium for equal coverage (optional)
- `review_year` — integer

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Declarations-page limits, deductibles, premiums | **Ask — no default** (cite the dec-page line) | — |
| Replacement (rebuild) cost | **Ask — no default**; insurer's or an ISO 360Value-style estimate | — |
| Umbrella underlying requirements | The umbrella carrier's stated requirement; if none supplied, Umbrella Sizing's default (auto 250/500/100 or $300k CSL; home $300k) | `[ASSUMPTION]` |
| Vehicle ACV | **Ask**; Kelley Blue Book / Edmunds private-party value cited by the user | — |
| Endorsement prices | Carrier quote; if not quoted, report "price to be quoted" — never estimate | — |
| State minimum auto limits | Not in md_facts — look up via `md_sources` (state DOI), else `[UNSOURCED]` | `[UNSOURCED]` until sourced |

### Calculation method

Run the checks below in this exact order; each produces Pass or a finding with a fixed severity. Severity levels: **Critical** (claim likely denied, or an uninsured loss could exceed 20% of `net_worth_usd`), **High**, **Medium**, **Low**.

1. **Auto liability target** by `net_worth_usd`: < $100k → state minimum acceptable but flag Low; $100k – $999,999 → 250/500/100; ≥ $1M → 500/500/250 or $500k CSL. If `umbrella.held`, target = the higher of this and the umbrella requirement. Below target → High; below umbrella requirement while an umbrella is held → Critical (umbrella gap).
2. **UM/UIM** < BI liability limits → Medium.
3. **Home liability** < $300k, or < `umbrella.required_home_liability_usd` when an umbrella is held → High (Critical if an umbrella is held and the requirement is not met).
4. **Medical payments to others** < $10,000 → Low.
5. **Coverage A ratio** = `coverage_a_usd / replacement_cost_estimate_usd`, 2 decimals: < 0.80 → Critical (below the typical 80% replacement-cost condition); 0.80–0.99 → High; ≥ 1.00 → Pass.
6. **Extended replacement** = 0 and `custom_or_historic` → Medium.
7. **Coverage C basis** = ACV → High.
8. **Ordinance & law** < 25% and (`review_year − home_year_built`) ≥ 30 → Medium.
9. **Water backup** absent → Medium. **Service line** absent → Low. **Mold sub-limit** < $10,000 → Low.
10. **Flood:** `in_fema_sfha` and no `flood_policy` → Critical; not in SFHA and no flood policy → Low (state that a meaningful share of NFIP claims come from outside SFHAs).
11. **Earthquake:** `seismic_zone` and no `earthquake_policy` → Medium.
12. **Named-storm deductible** (if `coastal_wind_state` or pct supplied): dollar exposure = `named_storm_deductible_pct/100 × coverage_a_usd`; always report; > 20% of `net_worth_usd` → High, else Low.
13. **Short-term rental:** `str_activity` without `str_endorsement` → Critical. **Home business** without `business_endorsement` → High.
14. **Valuables:** any category with `value_usd > unscheduled_sublimit_usd` and not scheduled → High.
15. **Vehicles:** for each, if not `financed_or_leased` and `collision_comp_annual_premium_usd > 10% × acv_usd` → Low ("drop collision/comprehensive"); if `rental_reimbursement` and `backup_vehicle_available` → Low ("drop rental reimbursement").
16. **Bundling** (if both quotes supplied): savings = `separate_quotes_usd − bundled_quote_usd`; pick the cheaper; tie → bundled.
17. Order findings by severity (Critical → Low), then by check number. A check whose input is missing is reported as "Not checked — {missing input}", never guessed.

### Decision rules

Evaluate top to bottom; the first match is the overall verdict.

| # | Condition | Verdict |
|---|---|---|
| 1 | Any Critical finding | **Fix now** — contact the agent/broker before renewal; list Critical items first |
| 2 | Any High finding | **Fix at renewal** |
| 3 | Any Medium finding | **Improve at renewal** (optional endorsements) |
| 4 | Only Low findings | **Optional tune-ups** |
| 5 | Otherwise | **No changes** — coverage meets every check |

### Output template

```markdown
# Auto / Home Policy Review — {review_year}

## Headline
Verdict: **{verdict}** (Decision rule #{n}). {count} Critical · {count} High · {count} Medium · {count} Low.

## Coverage summary
| Line | Current | Target | Status | Dec-page cite |
|---|---|---|---|---|
| Auto BI / PD | | | | |
| UM / UIM | | | | |
| Home liability | | | | |
| Coverage A (ratio to rebuild) | | | | |
| Coverage B / C / D | | | | |

## Findings (severity order)
| # | Check | Severity | Finding | Fix | Cost of fix |
|---|---|---|---|---|---|

## Gap checklist
| Gap | Present? | Severity |
|---|---|---|
| Water backup | | |
| Service line | | |
| Ordinance & law | | |
| Mold | | |
| Flood | | |
| Earthquake | | |
| Named-storm deductible ($) | | |
| Short-term rental | | |
| Home business | | |
| Scheduled items | | |

## Vehicles
| Vehicle | ACV | Coll+comp premium | % of ACV | Action |
|---|---|---|---|---|

## Bundling
{cheaper option and savings, or "Not applicable — quotes not supplied"}

## Hand-offs
{Deductible Optimizer; Umbrella Sizing — or "None"}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).