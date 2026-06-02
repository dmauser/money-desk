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
5. **Stress test**: what if the rented units are vacant for 3 months? What if a unit takes a $5k turnover cost? Can the owner cover full PITI alone without strain?
6. **FHA-specific**: 3.5% down on a 2-4 unit, owner must occupy one unit for ≥ 12 months, MIP is **for the life of the loan** since 2013 — refinance to conventional after 20% equity to drop MIP. FHA self-sufficiency test on 3-4 unit (75% of rents must cover PITI).
7. **Conventional 5% down** on 2-unit owner-occupied: PMI drops at 78% LTV, more flexible occupancy enforcement.
8. **VA loan**: 0% down on up to 4-unit if eligible veteran, no PMI, funding fee 2.15-3.3%.
9. **Long-game**: after owner moves out, building converts to pure rental. Re-run `rental_property_analyzer` for that scenario. §121 capital-gains exclusion ($250k single / $500k MFJ) requires 2 of 5 years owner-occupied; clock starts at first occupancy.

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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).