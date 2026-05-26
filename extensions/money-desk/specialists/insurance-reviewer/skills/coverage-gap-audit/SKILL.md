# Coverage Gap Audit

description: Audit all personal insurance policies (health, auto, home/renters, life, umbrella, disability) for gaps and overlaps. Outputs a prioritized gap list with $ exposure estimates. Use as the master entry for any "review my insurance" request.

## When to use

- Annual insurance checkpoint.
- After a life event (marriage, kid, home purchase, new job, new car, retirement).
- Net worth has grown to where umbrella coverage matters.

## Inputs needed

- Declarations pages for every policy (or at least the key limits + deductible).
- Asset inventory (net worth, home value, auto values, retirement balances).
- Household composition (spouse, dependents, dependents with special needs).
- Income (drives life and disability needs).
- Risk profile — high-risk activities, business ownership, rental property.

## Workflow

1. **Inventory** all current policies: carrier, type, premium, deductible, key limits, expiry. Note any auto-renew traps.
2. **Per-policy gap check:**
   - **Health.** OOP max, network adequacy, prescription tier issues, HSA-compatibility for HDHPs.
   - **Auto.** Liability limits (state minimums are usually inadequate — 100/300/100 is a common floor for working families; higher with assets). UM/UIM. PIP/MedPay. Comp/Collision deductible. Rental reimbursement.
   - **Home/Renters.** Dwelling at replacement cost (not market value). Personal property limit. Liability. Special schedules for jewelry/firearms/art. Flood (separate policy in flood zones — not included in standard home).
   - **Life.** Term coverage usually = 10–15× income for the primary earner; cover the surviving family's needs through dependents' adulthood. Spouse coverage even if non-earner (replacement-of-services cost).
   - **Umbrella.** Should cover liability gap above auto/home limits up to net worth (or higher). Cheap insurance — usually <$300/yr for $1M.
   - **Disability.** Often the most overlooked. Long-term disability through employer covers ~60% of base income, taxable if employer-paid, may not cover bonuses/commissions. Supplemental private LTD for high-earners.
3. **Overlap check.** Don't double-pay for the same risk (e.g., dental rider on health + standalone dental).
4. **Underinsured-by-asset check.** Auto liability limit < home equity = exposed. Recommend umbrella.
5. **Beneficiary check.** Life policies, retirement accounts — beneficiary designations override wills. Route to Estate & Legacy for full beneficiary audit.
6. **Premium efficiency.** High deductible + high savings = lower premium and works financially. Low deductible + low savings = premium burn. Match to user's emergency fund.
7. **Prioritized recommendations.** Top 3 gaps by $ exposure, with concrete next step (increase limit, add umbrella, get quotes, file change with HR).

## Required citations

- Each policy's limits cite the declarations page + date.
- Recommended limits cite the asset they protect.

## Deliverable shape

- Markdown report `./reports/insurance-reviewer/coverage-gap-audit-<YYYYMMDD>.md`:
  - **Headline** — N gaps, total premium $/yr, recommended additions/changes.
  - **Per-policy table** — type, carrier, current limits, recommended, gap $.
  - **Top 3 gaps prioritized.**
  - **Action list** — get quotes / increase limits / change beneficiaries / cancel duplicates.
  - **Hand-offs** — `policy_comparison` for quotes; `life_insurance_needs` for needs calc; `deductible_optimizer` for premium tune-up.

## Notes

- State minimum auto liability protects nobody. Recommend appropriate limits regardless.
- Whole-life and IUL policies are usually over-sold to people who need term + invest-the-difference. Flag any of these for separate scrutiny.
- "Not professional insurance advice."
