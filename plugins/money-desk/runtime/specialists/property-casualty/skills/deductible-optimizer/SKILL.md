# Deductible Optimizer

description: Find the optimal deductible across auto, home, and health policies given the user's emergency fund, premium sensitivity, and claim history. Outputs deductible recommendations with the premium delta. Use when premiums feel too high or after building an emergency fund.

## When to use

- Premium-renewal sticker shock.
- Emergency fund just grew large enough to support a higher deductible.
- Low claim history makes higher deductibles attractive.

## Inputs needed

- Current deductibles and premiums per policy.
- Available deductible tiers from carrier (quote-driven).
- Liquid emergency fund balance.
- Claim history (last 3–5 years).
- Risk tolerance — "I never want to think about it" vs "I'll absorb $5k once a decade."

## Workflow

1. **Per policy, list deductible tiers and their premiums** (e.g., auto comp/coll at $500, $1000, $2500; home at $1k, $2.5k, $5k; HDHP vs PPO).
2. **Compute premium savings per step-up** — $/yr saved by raising deductible.
3. **Compute payback period.** Premium savings × N years > deductible increase = breakeven. If breakeven ≤ 3 years, the claim-frequency-adjusted saving is positive, and the emergency fund covers the higher deductible, take it (Determinism rules steps 2–5).
4. **Risk-adjust for claim frequency.** Multiply by historical claim probability. If user files a claim every 4 years on average, deductible cost amortizes faster than premium savings.
5. **Emergency-fund constraint.** Each deductible must be ≤ 25% of the user's liquid emergency fund (≤ 10% for low risk tolerance), and auto + home deductibles together ≤ 50%. Don't recommend $5k deductible to someone with $3k in savings.
6. **Health-specific:** HDHP + HSA combo can be a big win for users who don't expect heavy medical use and want the HSA tax shelter. Run the worst-case OOP-max scenario, not just the deductible.
7. **Output recommendation per policy.**

## Required citations

- Premium tier quotes cite the carrier / declarations.
- Claim history cites user-provided log.
- HSA mechanics cite IRS for the working year.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/deductible-optimizer-<YYYYMMDD>.md`:
  - **Per-policy table** — current deductible, current premium, recommended deductible, new premium, $ saved/yr, breakeven years.
  - **Emergency-fund check** — green/yellow/red per recommendation.
  - **Health-policy section** — HDHP+HSA case if applicable.
  - **Net annual premium savings.**
  - **Action list** — request the deductible change at renewal; if mid-cycle, ask for a re-rate.

## Notes

- Don't optimize deductible without optimizing coverage limits first (**Auto / Home Policy Review** in the Property & Casualty specialist).
- A higher deductible only helps if the user actually has the cash to absorb it without going into debt.
- Some carriers offer "vanishing deductible" features — model those separately.
- "Not professional insurance advice."

## Determinism rules

### Input keys

- `policies` — list of `{ name, line (auto | home | other), current_deductible_usd, current_annual_premium_usd, tiers: [{ deductible_usd, annual_premium_usd }], claims_last_5_years (integer), financed_or_mortgaged (bool), lender_max_deductible_usd? }`
- `percentage_deductibles` — for any `%` deductible (named-storm, hurricane, earthquake), give `{ pct, coverage_a_usd }`; dollar deductible = `pct/100 × coverage_a_usd`
- `emergency_fund_usd` — number, liquid cash available today
- `risk_tolerance` — `low` | `medium` | `high`
- `health_plan_options` — optional; if present, routed to Health Plan Selector

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Deductible tiers and premiums | **Ask — no default**; must be carrier quotes | — |
| Emergency fund | **Ask — no default** | — |
| Annual claim frequency | `claims_last_5_years / 5` per policy; 0 claims → 0.0 (the payback test still applies) | `[USER-PROVIDED]` |
| Risk tolerance | `medium` | `[ASSUMPTION]` |
| Lender maximum deductible | **Ask** when `financed_or_mortgaged`; if unknown, flag "confirm with lender" | — |

### Calculation method

1. Convert every percentage deductible to dollars. Work in cents; report whole dollars and breakeven years to 1 decimal.
2. **Per policy, per tier T above the current deductible** (compare cumulatively to the current tier):
   - `delta_deductible = T.deductible_usd − current_deductible_usd`
   - `annual_saving = current_annual_premium_usd − T.annual_premium_usd` (if ≤ 0, the tier fails)
   - `breakeven_years = delta_deductible / annual_saving`
   - `claim_freq = claims_last_5_years / 5`
   - `expected_net_saving = annual_saving − claim_freq × delta_deductible`
3. **Emergency-fund cap per deductible** by `risk_tolerance`: low = 10%, medium = 25%, high = 25% of `emergency_fund_usd`. Rating: Green ≤ 10%, Yellow > 10% and ≤ 25%, Red > 25%.
4. **Eligible tier** = passes all of: `annual_saving > 0`; `breakeven_years ≤ 3.0`; `expected_net_saving > 0`; deductible ≤ the cap in step 3; deductible ≤ `lender_max_deductible_usd` if given.
5. **Pick** per policy the highest eligible tier; tie → lower deductible. If none is eligible, keep the current deductible.
6. **Household check:** sum of the picked auto + home deductibles ≤ 50% of `emergency_fund_usd` (both can hit in one event). If exceeded, step the policy with the smallest `annual_saving` per $1,000 of `delta_deductible` down one tier; repeat until it fits or every policy is back to current.
7. **Totals:** net annual premium savings = Σ `annual_saving` of picks.
8. Health deductibles are not optimised here — pass them to **Health Plan Selector** (health-medicare), which runs the OOP-max worst case.

### Decision rules

Per policy, evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Tiers or emergency fund missing | No recommendation — collect quotes / balance |
| 2 | Current deductible > 25% of `emergency_fund_usd` | **Lower** to the highest tier ≤ 25% of the fund (Red rating today) |
| 3 | Step 5–6 pick is above the current deductible | **Raise** to the picked tier |
| 4 | Otherwise | **Keep** the current deductible |

### Output template

```markdown
# Deductible Optimizer — {YYYY-MM-DD}

## Headline
Net annual premium savings: **${total_saving}** across {n} policies.

## Per-policy recommendation
| Policy | Current deductible | Current premium | Recommended deductible | New premium | $ saved / yr | Breakeven (yrs) | Expected net saving | Rule # |
|---|---|---|---|---|---|---|---|---|

## Emergency-fund check
| Policy | Recommended deductible | % of emergency fund | Rating |
|---|---|---|---|
Household total: {sum} = {pct}% of emergency fund (cap 50%).

## Health plan
{hand-off to Health Plan Selector, or "Not applicable — no health options supplied"}

## Actions
- {request deductible change at renewal / ask for re-rate mid-term; confirm lender maximum}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).