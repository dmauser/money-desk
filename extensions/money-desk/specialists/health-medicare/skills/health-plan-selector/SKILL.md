## Health Plan Selector

description: Pick the best health plan for the household this year — from an employer's open-enrollment menu, an ACA Marketplace shop, or a Cobra-vs-Marketplace decision after a job change. Computes expected total cost = premium + expected out-of-pocket utilization + HSA tax benefit (when applicable) and compares HDHP+HSA vs PPO vs HMO with the household's actual utilization pattern.

## When to use

- Annual open enrollment (typically Oct-Dec).
- Job change with new employer's benefits menu.
- Coming off Cobra and shopping the ACA Marketplace.
- ACA Marketplace eligible (self-employed, retiree-before-Medicare, between-jobs).
- Medicare-eligible spouse but pre-65 spouse needs separate coverage.

## Inputs needed

- All available plan options: monthly premium (employee-only and family tier), deductible, out-of-pocket max (OOPM), copay / coinsurance structure, in-network vs out-of-network, prescription tier costs.
- Whether plan is HDHP-qualified (deductible meets the IRS HSA-eligible HDHP minimum for the plan year — not in `md_facts`; look it up via `md_sources` or tag `[UNSOURCED]`).
- Household composition: ages, any chronic conditions, planned procedures, expected scripts.
- Last 12 months actual medical utilization (visits, ER, scripts, procedures) — proxy for next 12 months unless known reason to differ (planned pregnancy, planned surgery, new chronic dx).
- Marginal tax rate (federal + FICA + state) — drives HSA tax-benefit math.
- For ACA Marketplace: household MAGI estimate (eligibility for Premium Tax Credit + cost-sharing reduction tier 100-250% FPL).

## Workflow

### 1. Set the utilization assumption
- Pull last 12 months: count of routine visits, specialist visits, ER visits, lab work, imaging, scripts, any procedures.
- Convert to estimated allowed-amount dollars. (Allowed amount = what the network has agreed; the user pays a share of that, not the chargemaster price.)
- Apply known upcoming events (planned surgery, expected pregnancy, new chronic condition treatment).
- Output: low / base / high utilization scenarios, defined exactly in Determinism rules step 8.

### 2. Compute expected total cost per plan
- **Total cost** = annual premium + expected OOP at base utilization − employer HSA contribution − HSA tax benefit (if HSA-eligible plan).
- **Stress test** at high-utilization scenario to find the OOPM — that's the worst case per plan.
- **HSA tax benefit** = HSA contribution × marginal tax rate (federal + state, plus FICA only when contributed through payroll). Example: 24% federal + 7.65% FICA + 5% state = 36.65% benefit on every dollar contributed.

### 3. HDHP + HSA vs PPO trade-off
The pick itself follows the Decision rules below; these points explain why a plan tends to win.
- HDHP wins for: healthy households who can fund the HSA at the tier limit (`md_facts` → `irs_contribution_limits.hsa_self_only` / `.hsa_family`, plus `.hsa_catchup_age_55_plus` if 55+), and who don't expect to hit the OOPM.
- PPO wins for: predictable-high-utilization households, families with young children needing many sick visits, anyone needing many specialists, anyone with expensive non-generic scripts.
- HMO wins for: tight-budget households comfortable with single-PCP gatekeeping and a limited regional network.
- The HSA tax benefit can flip the analysis: even with similar gross premium + OOP, the HDHP can be the lowest after-tax option for a high-income household.

### 4. ACA Marketplace specifics (if applicable)
- Premium Tax Credit (PTC) makes Marketplace premiums income-based; the enhanced no-cliff subsidy (8.5%-of-income cap) ran through 2025; for later years use `md_facts` → `federal_poverty_level_2026_48_states.aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended` and verify current law via `md_sources`.
- **MAGI levers**: increasing 401(k), HSA, traditional IRA contributions; deductible self-employed health insurance; FSA contributions — all reduce MAGI and increase PTC.
- **Cost-Sharing Reduction (CSR)**: extra subsidy at 100-250% FPL — silver-plan only. At or below 250% FPL, choose Silver (Decision rule #4; CSR makes silver effectively a platinum-equivalent OOP structure).
- **Reconcile at tax time**: Form 8962. If actual income > estimate, PTC clawback up to repayment cap (or full repayment above 400% FPL).

### 5. Cobra vs ACA Marketplace decision
- After job loss / job change: Cobra is the employer plan continued, full premium + 2% admin fee = 102% × group-rate cost (often $700-1,500/month single, $2,000-2,500/month family).
- ACA Marketplace at full price often comparable; with PTC at low post-job-loss income, almost always cheaper than Cobra.
- **Special enrollment period**: 60 days from job loss to enroll in Marketplace. Cobra election doesn't extend the SEP — you can switch to Marketplace within the 60-day SEP, but missing it locks you in until next open enrollment.
- Cobra wins when: mid-year deductible already met, planned upcoming high-cost care, or specific provider only in employer network.

## Output

- Plan-by-plan expected total cost table (base case + worst case).
- HSA tax-benefit calculation if HDHP option.
- ACA PTC eligibility and projected monthly cost.
- Recommendation with reasoning and the conditions that would flip it.
- HSA contribution recommendation if HDHP selected.

## Citations / sources

- Plan documents: Summary of Benefits and Coverage (SBC) — every plan must provide.
- IRS Pub 969 (HSA rules), IRS Pub 502 (medical and dental expenses).
- HDHP / HSA-eligibility thresholds: IRS Revenue Procedure (annual).
- ACA Premium Tax Credit: IRC §36B; healthcare.gov for current FPL / subsidy structure.

## Disclaimer

Analysis only. Network-coverage and formulary details change; verify your specific providers and prescriptions are covered on the chosen plan BEFORE election. For Medicare-eligible household members, route to Medicare & IRMAA Review (`md_ih_skill_medicare_irmaa_review`).

## Determinism rules

### Input keys

Names match the intake schema `md_ih_skill_health_plan_selector`; extra plans and optional fields extend the same pattern.

- `plan_a_name`, `plan_b_name` — string; further options use `plan_c_*`, `plan_d_*` with the same suffixes
- `plan_a_monthly_premium`, `plan_b_monthly_premium` — number, USD/month, employee share at the chosen tier (Cobra = 102% of the group rate; Marketplace = net-of-PTC premium from the healthcare.gov / state-exchange quote)
- `plan_a_deductible`, `plan_b_deductible` — number, USD/year, in-network, at the chosen tier
- `plan_a_oop_max`, `plan_b_oop_max` — number, USD/year, in-network out-of-pocket maximum at the chosen tier
- `plan_a_hsa_match`, `plan_b_hsa_match` — number, USD/year employer HSA contribution (default 0)
- `plan_a_coinsurance_pct`, `plan_b_coinsurance_pct` — number, % the member pays after the deductible (optional)
- `plan_a_hsa_eligible`, `plan_b_hsa_eligible` — bool, plan is an IRS-qualified HDHP (optional; see step 2)
- `plan_a_deductible_already_met`, `plan_b_deductible_already_met` — number, USD credited toward this plan-year's deductible/OOP (Cobra only; default 0)
- `plan_a_excluded`, `plan_b_excluded` — bool, a must-have provider or drug is out of network / off formulary (default false)
- `expected_annual_medical` — number, USD/year of expected in-network **allowed amounts** (not chargemaster prices) for the whole covered household
- `marginal_tax_rate` — number, %, federal + state marginal rate
- `hsa_via_payroll` — bool, HSA contributions run through a §125 cafeteria plan (adds FICA savings)
- `hsa_employee_contribution_usd` — number, USD/year the employee will contribute, or the string `max`
- `age_55_plus_hsa_holder` — bool
- `family_size` — `Self only` | `Self + spouse` | `Self + child(ren)` | `Family`
- `liquid_savings_usd` — number, cash available to pay a worst-case year (optional)
- `household_magi_usd`, `household_size` — numbers (Marketplace shoppers only)
- `plan_year` — integer

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Premium, deductible, OOP max per plan | **Ask — no default** (read from the SBC) | — |
| Expected annual allowed medical spend | **Ask — no default**; prior 12 months' allowed amounts from EOBs is the accepted proxy | — |
| Coinsurance after deductible | **Ask**; if the user cannot find it, 100% (upper bound — OOP then equals spend up to the OOP max) | `[ASSUMPTION: 100% coinsurance upper bound]` |
| Marginal tax rate | **Ask — no default** | — |
| Employee HSA contribution | **Ask — no default**; `max` = HSA limit − employer contribution | — |
| HSA limit (self-only / family / 55+ catch-up) | `md_facts` → `irs_contribution_limits.hsa_self_only`, `.hsa_family`, `.hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| FICA saved on payroll HSA contributions | `md_facts` → `social_security_2026.fica_employee_rate` + `.medicare_employee_rate` (zero if `hsa_via_payroll` is false) | `[SSA 2026]` |
| HDHP minimum deductible / maximum OOP for HSA eligibility | not in md_facts — look up the IRS Revenue Procedure for the plan year via `md_sources`, else tag `[UNSOURCED]`; if `plan_x_hsa_eligible` is supplied, use it | `[UNSOURCED]` until sourced |
| Federal poverty level by household size | `md_facts` → `federal_poverty_level_2026_48_states.household_size_to_fpl` | `[HHS FPL 2026]` |
| PTC income ceiling | `md_facts` → `federal_poverty_level_2026_48_states.aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended` — verify current law via `md_sources` | `[HHS FPL 2026]` |
| Marketplace net premium after PTC | **Ask — no default** (healthcare.gov / state exchange quote); the skill does not compute PTC itself | — |
| Copays | Treated as part of `expected_annual_medical` and run through the deductible/coinsurance formula (conservative for copay-heavy PPOs) | `[ASSUMPTION]` |

### Calculation method

Compute every plan identically; work in cents, report whole dollars.

1. **Exclusions.** Drop any plan with `plan_x_excluded = true`; list it under "Excluded plans" with the reason.
2. **HSA eligibility.** `hsa_eligible` = the user-supplied flag if given; otherwise true only if deductible ≥ the sourced HDHP minimum **and** OOP max ≤ the sourced HDHP maximum for the tier. If the thresholds cannot be sourced and the flag is not supplied, treat as false and say so.
3. **HSA limit** (eligible plans only) = `hsa_self_only` if `family_size = Self only`, else `hsa_family`; + `hsa_catchup_age_55_plus` if `age_55_plus_hsa_holder`.
4. **Employee contribution** = `hsa_employee_contribution_usd`, or if `max`, `max(0, HSA limit − plan_x_hsa_match)`; cap so that employee + employer ≤ HSA limit. Ineligible plans: 0.
5. **HSA tax benefit** = employee contribution × (`marginal_tax_rate`/100 + (FICA + Medicare rates if `hsa_via_payroll`)). Employer match is a direct credit, not taxed.
6. **Annual premium** = `plan_x_monthly_premium` × 12.
7. **OOP at spend S** (Cobra: reduce deductible and OOP max by `deductible_already_met`, floor 0):
   `OOP(S) = min(oop_max, min(S, deductible) + coinsurance_pct/100 × max(0, S − deductible))`.
8. **Three fixed utilisation scenarios** (no other multipliers):
   - Low: S = 0 → OOP = 0.
   - Base: S = `expected_annual_medical`.
   - High (worst case): OOP = `oop_max`.
9. **Net cost per scenario** = annual premium + OOP − employer HSA match − HSA tax benefit.
10. **Rank** plans by Base net cost ascending; tie → lower High net cost; tie → lower annual premium; tie → input order (A before B).
11. **Breakeven spend** between the two lowest-Base plans: solve for S where their net costs are equal by stepping S from 0 to the larger OOP-max-reaching spend in $100 increments; report the first S where the ranking flips, or "No flip" if none.
12. **Marketplace (if `household_magi_usd` given):** `fpl_pct = household_magi_usd / FPL(household_size) × 100`, rounded to 1 decimal. Flag CSR eligibility if `fpl_pct ≤ 250`; flag PTC ineligibility if above the sourced ceiling.
13. If a required plan field is missing, stop and list the missing fields; never fill them from memory.

### Decision rules

Evaluate top to bottom; the first match is the recommendation. `base_gap` = Base net cost of the 2nd-ranked plan − Base net cost of the 1st-ranked plan.

| # | Condition | Recommendation |
|---|---|---|
| 1 | A required input is missing (step 13) | No recommendation — list the missing inputs |
| 2 | No plan remains after exclusions | No recommendation — every option fails a must-have provider/drug |
| 3 | Only 1 plan remains | That plan |
| 4 | Marketplace shopper with `fpl_pct ≤ 250` and a Silver option is quoted | The lowest-Base Silver plan (CSR applies only to Silver) |
| 5 | `base_gap ≤ max($250, 2% of the 1st-ranked plan's Base net cost)` | The plan with the lower High (worst-case) net cost; tie → 1st-ranked |
| 6 | Otherwise | The 1st-ranked (lowest Base net cost) plan |

Flag (does not change the pick): if `liquid_savings_usd` is supplied and the recommended plan's `oop_max` > `liquid_savings_usd`, add "worst-case OOP exceeds available cash" to Actions.

### Output template

```markdown
# Health Plan Selection — {plan_year}

## Headline
Recommended: **{plan_name}** — expected net cost **${base_net}** (worst case **${high_net}**). Decision rule #{n}.

## Plans compared
| Plan | HSA-eligible | Annual premium | Deductible | OOP max | Coinsurance | Employer HSA |
|---|---|---|---|---|---|---|

## Expected net cost by scenario
| Plan | Low (no care) | Base (${expected_annual_medical}) | High (OOP max) | HSA tax benefit |
|---|---|---|---|---|

## Breakeven
{spend at which the top two plans flip, or "No flip within the OOP range"}

## HSA contribution
{limit, employer match, recommended employee contribution, tax saving — or "Not applicable — recommended plan is not HSA-eligible"}

## Marketplace / Cobra
{FPL %, CSR / PTC flags, Cobra deductible credit — or "Not applicable — employer menu only"}

## Excluded plans
{plan — reason, or "None"}

## What would flip the recommendation
{breakeven spend; base_gap vs threshold}

## Actions
- {verify providers / formulary on the chosen plan before electing; HSA payroll election; cash-buffer flag}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
