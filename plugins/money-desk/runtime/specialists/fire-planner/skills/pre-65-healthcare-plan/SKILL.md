## Pre-65 Healthcare Plan

description: The pre-Medicare gap is the #1 FIRE blocker. Map the user's options — employer-sponsored COBRA bridge, ACA Marketplace with premium subsidies (managed via MAGI), HSA stacking, MediShare and direct-primary-care alternatives, spouse-coverage piggyback. Output: which option(s) fit, the MAGI ceiling that maximizes subsidies, the annual cost estimate, and the explicit handoff to Health & Medicare for plan-by-plan comparison. STRATEGY only — actual enrollment is Health & Medicare's job.

## When to use

- "What about healthcare before Medicare?"
- "Can I afford to retire at 50 without employer health insurance?"
- "How do ACA subsidies actually work for FIRE'd households?"
- Always invoke alongside **Pre-59½ Bridge Strategy** — the MAGI ceiling these two share is usually the binding constraint.

## Inputs needed

- **FIRE age** and **spouse FIRE age** (if applicable).
- **Years pre-65 to cover** for each household member.
- **Household size and ages** (kids on plan? aging out at 26?).
- **Health condition flags** — chronic conditions, expensive medications, planned procedures.
- **State** (ACA Marketplace differs; some states expanded Medicaid, some didn't; the subsidy math differs).
- **Target annual taxable income post-FIRE** — the user's MAGI lever.
- **Current HSA balance**.
- **Geographic flexibility** — open to moving to lower-cost-of-care state? (Some FIRE'd households domicile for healthcare.)

## The five bridge mechanisms

### 1. ACA Marketplace + premium subsidies (most common)

- **Mechanism:** Buy Marketplace plan on healthcare.gov (or state exchange). Subsidies are based on **MAGI** as % of Federal Poverty Level (FPL). Under the IRA 2022 / 2025 enhanced subsidies (cite current law year), the 400% FPL "cliff" was replaced with a phase-out capping the expected contribution at a fixed share of MAGI (applicable-percentage table — not in `md_facts`; cite via `md_sources`) — verify whether this regime is still in force for the user's plan year (`md_facts` → `federal_poverty_level_2026_48_states.aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended`).
- **Critical lever:** MAGI is the input. Roth conversions, realized cap gains, dividends, interest — all push MAGI up and can reduce or eliminate subsidies.
- **Sweet spots (verify for current year):** ~150% FPL (silver-plan CSR enhanced cost-sharing kicks in), staying under the legacy 400% FPL cliff if enhanced subsidies sunset.
- **Cost in FIRE-optimal MAGI band:** can be very low for a family of 4 in the right MAGI band; for high-MAGI households, full premium.
- **Owner of plan-by-plan comparison:** **Health & Medicare**.

### 2. COBRA bridge (short-term)

- **Mechanism:** Continue employer plan post-separation for 18 months (29 months in some disability cases, 36 months for some dependents). Full premium + 2% admin fee — price it from the user's COBRA election notice.
- **Fits:** Recently FIRE'd household with health condition mid-treatment, planned procedure pre-FIRE, or buying time to set up ACA.
- **Cost:** high; usually a stopgap, not a multi-year solution.

### 3. Spouse coverage piggyback

- **Mechanism:** One spouse keeps working (potentially part-time / barista-FIRE) to maintain employer coverage for the household.
- **Fits:** Couples where one spouse genuinely enjoys their work and family-coverage cost is reasonable.
- **Cost:** "free" if the spouse was working anyway; high opportunity cost otherwise.

### 4. Direct Primary Care (DPC) + catastrophic coverage

- **Mechanism:** Pay a monthly DPC membership (user's quote) for unlimited primary care, plus a high-deductible catastrophic plan for hospital / specialist. Total often less than ACA Bronze.
- **Fits:** Generally healthy households comfortable with paying cash for routine care, wanting predictable primary-care relationship.
- **Watch:** Catastrophic plans have very limited availability under ACA — must qualify (under 30, OR have a hardship exemption). Otherwise the cheaper plan is Bronze.

### 5. Health-sharing ministries (MediShare, CHM, Samaritan)

- **Mechanism:** Member-funded sharing pool. Lower monthly cost than ACA. NOT insurance — no legal guarantee of payment. Pre-existing conditions often excluded.
- **Fits:** Households comfortable with the religious-affiliation requirement, willing to accept the no-guarantee risk, generally healthy.
- **Watch:** Major pre-existing conditions or expected expensive procedure → catastrophic risk. Not appropriate for high-medical-need household.

## Workflow

1. **Compute the gap.** Years × $/year per household member, priced from the user's quotes (Determinism rules step 4) — never a generic range.
2. **Set the MAGI ceiling.** The ACA-subsidy max-benefit MAGI band is the binding constraint on the user's Roth conversion ladder and realized cap gains. Make this number explicit.
3. **Compare options at the user's actual situation.**
   - Healthy + flexible income → ACA + MAGI management is usually winner.
   - Mid-treatment / procedure scheduled → COBRA through treatment (≤ 18 months), then ACA.
   - One spouse loves working → spouse plan if its annual cost ≤ the lowest ACA option (Decision rule 3).
   - Generally healthy + risk-tolerant → DPC + catastrophic or HSA + bronze ACA.
4. **Layer HSA.** If HDHP-eligible (ACA Bronze HDHP qualifies), max HSA. Triple tax advantage in working years, stealth IRA in retirement.
5. **Geographic factor.** Some states (NY, CA, MN) have richer state-level subsidies; some (Florida, Texas) didn't expand Medicaid and have coverage cliffs. Surface if relevant.
6. **Cost projection through 65.** Show the multi-year cost at current MAGI plan AND at the MAGI ceiling the user is targeting.
7. **Hand off enrollment to Health & Medicare.** That specialist owns the plan-by-plan selector.

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Ignoring MAGI as the lever.** Many FIRE'd households leave $10–20k/yr of subsidy on the table by over-converting.
- **Counting subsidies that may sunset.** The IRA-2022 enhanced subsidies were extended through 2025; verify current law for the plan year you're projecting.
- **Treating health-sharing as insurance.** It is not. Lawsuits exist for unpaid claims.
- **DPC + catastrophic without checking eligibility.** Catastrophic plans require age <30 or hardship.
- **COBRA for the entire bridge.** Almost always cheaper to switch to ACA after 1–6 months.

## Citations / sources

- **IRC §36B** — ACA premium tax credits.
- **IRA 2022 (Inflation Reduction Act)** — enhanced subsidies through 2025 (verify current law year before quoting).
- **HHS / CMS FPL multiples** — annual; cite `md_facts` [HHS FPL 2026].
- **COBRA** — Consolidated Omnibus Budget Reconciliation Act 1985; 18-month continuation.
- **HSA** — IRC §223; current-year limits from `md_facts`.

## Disclaimer

Healthcare policy changes. The IRA enhanced-subsidy regime is one example — political risk is real. Always verify current-plan-year rules before treating any subsidy projection as locked in. Plan-by-plan enrollment requires a state-of-residence Marketplace navigator or licensed broker; do NOT enroll from a chat.

## Next step

**Next step → Health & Medicare:** "Compare ACA plans for household of {N} in {state}, MAGI target ${X}, expected annual medical spend ${Y}, HDHP eligibility {required for HSA stack}."

## Determinism rules

### Input keys

- `fire_age` — integer; `spouse_fire_age` — integer or null
- `household_members` — list of `{ role (self|spouse|child), age_at_fire }`
- `health_flags` — list of `chronic` | `expensive_rx` | `mid_treatment` | `planned_procedure_within_18mo` (empty = none)
- `state` — two-letter code
- `medicaid_expansion_state` — boolean (look up if unknown)
- `target_magi_usd` — number, planned annual MAGI after FIRE
- `hsa_balance_usd` — number
- `expected_medical_spend_annual_usd` — number, household out-of-pocket care expected per year
- `benchmark_silver_monthly_usd` — number, second-lowest-cost silver premium for the household (healthcare.gov / state exchange)
- `aca_quotes` — list of `{ tier (bronze|silver|gold), monthly_premium_usd, oop_max_usd, hsa_eligible }`
- `cobra_total_monthly_premium_usd` — number, full plan cost before the 2% admin fee (0 = no COBRA)
- `spouse_plan_monthly_usd` — number, employee share for family coverage (0 = none)
- `dpc_monthly_usd`, `catastrophic_monthly_usd` — numbers (0 = not quoted)
- `sharing_ministry_monthly_usd` — number (0 = not considered)
- `geographic_flexibility` — boolean

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ages, household, state, target MAGI | **Ask — no default** | — |
| Premium quotes (ACA, COBRA, spouse plan, DPC, sharing) | **Ask — no default**; an option without a quote is shown as "Not quoted" and cannot be recommended | — |
| Expected medical spend | **Ask — no default** | — |
| FPL for household size | `md_facts` → `federal_poverty_level_2026_48_states.household_size_to_fpl` (48 states; AK / HI not in md_facts — `md_sources`, else `[UNSOURCED]`) | `[HHS FPL 2026]` |
| PTC eligibility ceiling | `md_facts` → `federal_poverty_level_2026_48_states.aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended` (400% FPL cliff unless extended — verify current law via `md_sources`) | `[HHS FPL 2026]` |
| Applicable-percentage table (expected contribution % of MAGI by FPL band) | Not in md_facts — IRS Rev. Proc. for the plan year via `md_sources`; else `[UNSOURCED]` and no subsidy $ is computed | `[UNSOURCED]` |
| HSA contribution limits | `md_facts` → `irs_contribution_limits.hsa_self_only` / `.hsa_family`, `.hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| COBRA admin fee and duration | Statutory: premium × 1.02; 18 months (29 / 36 in qualifying cases) | — |
| Medicaid / CSR thresholds | Statutory: Medicaid expansion ≤ 138% FPL; CSR on silver plans ≤ 250% FPL | — |

### Calculation method

1. **Gap:** for each adult, `years_pre65 = max(0, 65 − age_at_fire)`; household gap years = the maximum.
2. **FPL position:** `fpl = household_size_to_fpl[n]` (n > 8 → `[8] + (n − 8) × each_additional_person`); `fpl_pct = target_magi_usd / fpl × 100`.
3. **Premium tax credit:** if `100 ≤ fpl_pct ≤ ceiling × 100` (and above 138 in expansion states), `PTC = max(0, benchmark_silver_monthly × 12 − applicable_pct(fpl_pct) × target_magi_usd)`; else 0. Below the floor → Medicaid flag.
4. **Annual cost per option** = `premium × 12 − PTC (ACA only, capped at the premium) + min(expected_medical_spend, oop_max)`:
   - COBRA: `cobra_total_monthly × 1.02 × 12` + `min(spend, plan oop_max)`; only for the first 18 months.
   - DPC + catastrophic: `(dpc + catastrophic) × 12` + spend above DPC scope (Ask; else the full `expected_medical_spend`); eligible only if every covered adult is under 30 or has a hardship exemption.
   - Sharing ministry: `monthly × 12` + spend (no OOP cap — show worst case as "uncapped").
5. **MAGI band:** floor = 138% FPL (expansion state) or 100% FPL; ceiling = PTC ceiling × FPL − $1 when the cliff applies (none if enhanced subsidies are verified in force). Convert to $ for the household.
6. **Projection to 65:** `annual_cost × gap_years` (real dollars) at `target_magi_usd` and at the band ceiling.
7. **HSA stack:** if the chosen plan is HSA-eligible, annual contribution = md_facts limit for coverage type (+ catch-up 55+).
8. Rounding: cents internally; whole dollars; FPL % to whole numbers.

### Decision rules

Primary option — evaluate top to bottom; the first match wins (options with no quote are skipped).

| # | Condition | Recommendation |
|---|---|---|
| 1 | `fpl_pct` below the Medicaid / PTC floor | Medicaid (expansion state) or raise MAGI to the floor — flag the coverage gap |
| 2 | `mid_treatment` or `planned_procedure_within_18mo` in `health_flags` and COBRA quoted | COBRA through treatment (≤ 18 months), then the lowest-cost ACA tier |
| 3 | Spouse plan quoted and its annual cost ≤ the lowest ACA annual cost | Spouse employer plan |
| 4 | DPC + catastrophic eligible, no `health_flags`, and its annual cost < the lowest ACA annual cost | DPC + catastrophic |
| 5 | Otherwise | ACA tier with the lowest annual cost at `target_magi_usd`; tie → silver if `fpl_pct ≤ 250` (CSR), else the lower premium |

A health-sharing ministry is never the primary recommendation (not insurance); it is shown for comparison only.

### Output template

```markdown
# Pre-65 healthcare plan — household of {n}, FIRE at {fire_age}, {gap_years} years to 65

## Headline
Primary: **{option}** (rule #{k}) — **${annual_cost}/yr** at MAGI ${target_magi} ({fpl_pct}% FPL).

## Gap
| Member | Age at FIRE | Years to 65 |
|---|---|---|

## MAGI band
| Item | % FPL | $ for household | Source |
|---|---|---|---|
| Floor | | | |
| Target | | | |
| Ceiling | | | |

## Option comparison (annual, today's $)
| Option | Premium | PTC | Expected OOP | Annual cost | Eligible? | Notes |
|---|---|---|---|---|---|---|
| ACA bronze | | | | | | |
| ACA silver | | | | | | |
| ACA gold | | | | | | |
| COBRA (≤ 18 mo) | | — | | | | |
| Spouse plan | | — | | | | |
| DPC + catastrophic | | — | | | | |
| Health-sharing ministry | | — | uncapped | | | not insurance |

## Cost to 65
| Scenario | Annual | Total to 65 |
|---|---|---|

## HSA stacking
{contribution $ and source — or "Not applicable — plan not HSA-eligible"}

## Coordination
- Roth conversion cap → Pre-59½ Bridge Strategy: ${…}
- Realized-gain budget → Withdrawal Order Optimizer: ${…}
- Plan selection → **Health & Medicare**

## Recommended next step
{hand-off sentence}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).