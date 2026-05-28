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
- Recommended floor: 250k/500k/100k for any household with net worth > $100k; 500k/500k/250k or "CSL $500k+" for higher net worth — required to meet most umbrella carriers' underlying-liability minimum.
- **Uninsured / Underinsured Motorist (UM/UIM)**: critical, often under-purchased. Recommend matching liability limits (your own coverage if hit by an under-insured driver). One serious injury exceeds many drivers' liability cap quickly.

#### Home liability
- Standard HO-3 typically includes $100k-300k personal liability. Recommend raising to $300k-500k as the umbrella attach-point.
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
- **Ordinance and law**: covers extra rebuild cost to bring home up to current code after a loss. Often 10% sub-limit standard; increase to 25-50% for older homes.
- **Mold sub-limit**: often $5k-10k cap; review and increase if in high-humidity region.
- **Flood**: ALWAYS excluded from HO-3. NFIP or private. Required if in FEMA SFHA; recommended even if not (25% of NFIP claims come from outside SFHA).
- **Earthquake**: excluded from HO-3; separate policy in seismic zones.
- **Wind / hurricane named-storm deductible**: separate percentage-deductible in coastal states (2-5% of dwelling A). User often unaware until the claim — flag explicitly.
- **Short-term rental (Airbnb/VRBO)**: excluded from standard HO-3; needs STR endorsement or commercial policy.
- **Home-based business**: business inventory / equipment / liability often excluded; needs endorsement or separate BOP.

### 4. Deductible review

- Hand-off to `deductible_optimizer` for the math; default recommendation is to raise auto and home deductibles to the level the user can comfortably self-insure (typically $1,000-2,500), redirect savings to premium offset or umbrella purchase.

### 5. Vehicle-by-vehicle right-sizing

- For each vehicle: check actual cash value vs annual collision+comprehensive premium. Rule of thumb: drop collision + comprehensive when vehicle ACV × 10-12% < annual premium for those coverages.
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).