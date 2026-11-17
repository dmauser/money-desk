# Medicare & IRMAA Review

description: Plan Medicare enrollment (Parts A/B/D, Medigap vs Medicare Advantage) and model Income-Related Monthly Adjustment Amount (IRMAA) surcharges. Surfaces the 2-year MAGI lookback and quantifies the tax-planning consequences of Roth conversions, large cap gains, or annuity income in pre-Medicare and Medicare years.

## When to use

- User is 63–64 (decisions made now affect Medicare-year IRMAA via 2-year lookback).
- User is approaching the 65 birthday and Initial Enrollment Period (IEP — 3 months before, month of, 3 months after).
- User is considering a large Roth conversion, business sale, or RMD that may trigger IRMAA.
- User had a life-changing event (retirement, divorce, work stoppage) and may file SSA-44 to appeal.

## Inputs needed

- Date of birth.
- Current health insurance source (employer / spouse's employer / ACA / COBRA / retiree).
- Whether currently working and plan size (20+ employees changes Part B timing).
- HSA contributions (must stop the month Medicare begins).
- Recent MAGI (prior 2 years) — IRMAA uses 2-year lookback (2026 IRMAA = 2024 MAGI).
- Drug list (for Part D plan selection).
- State of residence (Medigap pricing varies hugely by state).

## Workflow

1. **Enrollment timing.**
   - Part A: automatic if drawing SS; otherwise enroll. Free if 40+ quarters of work.
   - Part B: 7-month IEP around the 65 birthday. Late penalty = 10% per 12 months for life. Exception: actively employed at firm with 20+ employees → can delay without penalty (Special Enrollment Period when leaving).
   - Part D: 7-month IEP. Late penalty = 1% per month for life.
2. **HSA shutdown.** Medicare enrollment (any Part) disqualifies HSA contributions starting that month. If filing for SS, Part A is RETROACTIVE up to 6 months — stop HSA 6 months before SS start.
3. **Medigap vs Medicare Advantage.**
   - Medigap (G or N most common) + Part D: predictable costs, see any provider accepting Medicare, no networks. Higher monthly premium.
   - Medicare Advantage (Part C): lower premium, network-restricted, often includes drug + dental, but worst-case OOP can be high; switching back to Medigap later is hard (medical underwriting outside the 6-month Medigap open enrollment).
   - Decision frame: predictability + access (Medigap) vs low cost + bundled extras (Advantage); the pick follows Decision rules table A below.
4. **IRMAA modeling.**
   - Cite year's brackets explicitly (they shift annually): `md_facts` → `medicare_2026.irmaa_brackets_mfj_part_b_total_monthly` / `.irmaa_brackets_single_part_b_total_monthly`. Part D surcharges and MFS tiers are not in `md_facts` — source via `md_sources` or tag `[UNSOURCED]`.
   - 2-year MAGI lookback: 2026 IRMAA = 2024 MAGI.
   - Married filing separately has much harsher brackets — flag for divorced/separated users.
   - Surcharges apply to BOTH Part B and Part D.
5. **IRMAA appeal (SSA-44).** Life-changing events allowing appeal: marriage, divorce/annulment, death of spouse, work stoppage, work reduction, loss of income-producing property, loss/reduction of pension, employer settlement. Filed with proof of event.
6. **Pre-Medicare income management.** In the 2 years BEFORE Medicare (and ongoing), tactical levers to stay below IRMAA cliffs:
   - Time Roth conversions BELOW the cliff (a $1 conversion above a bracket may cost $1,000+ in Part B+D surcharges); trigger points are in Decision rules table B.
   - QCDs to satisfy RMDs (lower AGI).
   - Tax-loss harvesting to offset cap gains.

## Required citations

- IRMAA brackets cite the Medicare year + Medicare.gov.
- Part B / D penalty rules cite Medicare.gov.
- HSA + Medicare interaction cites IRS Pub 969.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/medicare-irmaa-<YEAR>.md`:
  - Enrollment timeline & deadlines.
  - HSA shutdown date (if applicable).
  - Medigap vs Advantage decision matrix (state-specific premium ranges if known).
  - IRMAA bracket table for the year.
  - 2-year MAGI projection vs brackets, with cliff alerts.
  - SSA-44 appeal candidate flag.

## Notes

- IRMAA is a per-spouse cliff — couples near a threshold should plan as a unit.
- Medicare doesn't cover long-term custodial care — see Long-Term Care Planning skill.
- "Analysis only. Not professional insurance or tax advice. SHIIP/SHIP counselors offer free state-specific Medicare help."

## Determinism rules

### Input keys

- `date_of_birth` — `YYYY-MM-DD`
- `spouse_date_of_birth` — `YYYY-MM-DD` (optional)
- `filing_status` — `mfj` | `single` | `mfs` | `hoh` (IRMAA treats `hoh` as `single`)
- `magi_by_year_usd` — map `{ "YYYY": number }`, IRMAA MAGI (AGI + tax-exempt interest) for each tax year available
- `projected_magi_usd` — map `{ "YYYY": number }` for the current and next tax years
- `planned_discretionary_income_usd` — map `{ "YYYY": number }`, Roth conversions / elective gains included in the projection
- `current_coverage_source` — `employer` | `spouse_employer` | `aca` | `cobra` | `retiree` | `none`
- `employer_20_plus_employees` — bool; `actively_working` — bool; `group_coverage_end_yyyy_mm` — string (optional)
- `ss_claim_yyyy_mm` — string, month Social Security benefits start (optional)
- `hsa_contributing` — bool
- `life_changing_event` — `none` | `marriage` | `divorce` | `death_of_spouse` | `work_stoppage` | `work_reduction` | `loss_of_income_property` | `loss_of_pension` | `employer_settlement`; `life_changing_event_yyyy` — integer
- `uncovered_months_part_b`, `uncovered_months_part_d` — integers, months without creditable coverage after the IEP (default 0)
- `state` — two-letter code
- `medigap_monthly_premium_usd`, `part_d_monthly_premium_usd`, `ma_monthly_premium_usd`, `ma_moop_usd` — numbers from the user's quotes (optional)
- `must_keep_provider_out_of_ma_network` — bool; `months_out_of_state_per_year` — integer
- `premium_year` — integer, the Medicare year being analysed

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| MAGI for the lookback year | **Ask — no default** (Form 1040 line 11 + line 2a) | — |
| IRMAA lookback | `md_facts` → `medicare_2026.irmaa_lookback_years` | `[CMS Medicare 2026]` |
| Part B standard premium | `md_facts` → `medicare_2026.part_b_base_premium_monthly` | `[CMS Medicare 2026]` |
| Part B total premium by MAGI tier | `md_facts` → `medicare_2026.irmaa_brackets_mfj_part_b_total_monthly` / `.irmaa_brackets_single_part_b_total_monthly` | `[CMS Medicare 2026]` |
| Part B IRMAA tiers for `mfs` filers | not in md_facts — look up via `md_sources` (SSA POMS / Medicare.gov), else tag `[UNSOURCED]` | `[UNSOURCED]` until sourced |
| Part D IRMAA surcharge by tier | `md_facts` → `medicare_2026.irmaa_part_d_monthly_adjustment_by_tier` (same MAGI tiers as Part B) | `[CMS Medicare 2026]` |
| Part B deductible; Part A deductible | `md_facts` → `medicare_2026.part_b_deductible_annual`, `.part_a_deductible_per_benefit_period` | `[CMS Medicare 2026]` |
| Part D base beneficiary premium (late-penalty base) | `md_facts` → `medicare_2026.part_d_base_beneficiary_premium_monthly` | `[CMS Medicare 2026]` |
| HSA limit for proration | `md_facts` → `irs_contribution_limits.hsa_self_only` / `.hsa_family` / `.hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| Medigap / Part D / Advantage premiums | **Ask — no default** (state quotes from Medicare.gov Plan Finder) | — |
| Brackets for a year not in md_facts | Use the latest md_facts tiers, label them "`premium_year` tiers not yet published — modelled on {md_facts year}" | `[ASSUMPTION]` |

### Calculation method

1. **Medicare start month (M65)** = the first of the birth month; if born on the 1st, the prior month.
2. **IEP** = 3 months before M65 through 3 months after (7 months). **Medigap open enrollment** = 6 months starting the month Part B begins.
3. **Part B timing.** If `actively_working` and `employer_20_plus_employees` and coverage is through that employment (own or spouse's), Part B may be delayed; SEP = 8 months from `group_coverage_end_yyyy_mm` or employment end, whichever is first. Otherwise enroll in the IEP. COBRA and retiree coverage do not count for delaying Part B.
4. **Late penalties.** Part B: `10% × floor(uncovered_months_part_b / 12)` of the standard premium, for life. Part D: `1% × uncovered_months_part_d × part_d_base_beneficiary_premium_monthly`, rounded to the nearest $0.10, for life.
5. **HSA stop month.** If `ss_claim_yyyy_mm` is after M65, Part A is retroactive the earlier of 6 months or M65: `hsa_stop = max(M65, ss_claim_yyyy_mm − 6 months)`; else `hsa_stop = M65`. Allowed HSA contribution for that year = annual limit × (months of eligibility before `hsa_stop`) / 12, rounded down to the dollar.
6. **IRMAA lookup** for each premium year Y in [`premium_year`, `premium_year`+1, `premium_year`+2]: MAGI year = Y − `irmaa_lookback_years`; use actual MAGI if known, else projected. Tier = first row whose `magi_max` is null or `MAGI ≤ magi_max`. Annual Part B surcharge per person = 12 × (tier `part_b_total` − `part_b_base_premium_monthly`). For `mfj`, multiply by the number of spouses on Medicare in Y.
7. **Cliff distance.** `headroom` = tier `magi_max` − MAGI (null for the top tier). `overshoot` = MAGI − the previous tier's `magi_max` (0 in the base tier). `cliff_cost` = 12 × (tier total − previous tier total) × persons.
8. **SSA-44 test.** Eligible when `life_changing_event` ≠ `none` and the event year's projected MAGI falls in a lower tier than the lookback-year MAGI.
9. **Medigap vs Advantage expected-cost comparison** (only if quotes supplied), annual: Medigap worst case = 12 × (`medigap_monthly_premium_usd` + `part_d_monthly_premium_usd`) + `part_b_deductible_annual` (Plan G convention); Advantage worst case = 12 × `ma_monthly_premium_usd` + `ma_moop_usd`. Base case for both = premiums only. Part B premium and IRMAA are identical in both and excluded.
10. Compute in cents; report monthly premiums to the cent and annual totals to whole dollars. If a lookback MAGI is missing, report the tier as "Unknown — MAGI needed" and skip steps 7–8 for that year.

### Decision rules

Two independent tables, each evaluated top to bottom; the first match wins.

**A. Medigap vs Medicare Advantage**

| # | Condition | Recommendation |
|---|---|---|
| 1 | No premium quotes supplied | No coverage pick — list the quotes needed |
| 2 | `must_keep_provider_out_of_ma_network` is true | Medigap (Plan G or N) + Part D |
| 3 | `months_out_of_state_per_year ≥ 3` | Medigap + Part D (Advantage networks are regional) |
| 4 | Outside the Medigap open-enrollment window and the state does not offer guaranteed issue | Keep current coverage type; flag that a switch to Medigap requires underwriting |
| 5 | Medigap worst case ≤ Advantage worst case | Medigap + Part D |
| 6 | Otherwise | Medicare Advantage; state the worst-case gap and that a later switch to Medigap may require underwriting |

**B. IRMAA action** (per premium year)

| # | Condition | Action |
|---|---|---|
| 1 | MAGI unknown | Collect MAGI; no action |
| 2 | SSA-44 test (step 8) passes | File SSA-44 for that premium year |
| 3 | `overshoot > 0` and `planned_discretionary_income_usd[MAGI year] ≥ overshoot` | Cut discretionary income by `overshoot + $1,000` to drop a tier; saving = `cliff_cost` |
| 4 | `headroom ≤ $5,000` and `planned_discretionary_income_usd[MAGI year] > 0` | Cliff alert — cap added income at `headroom − $1,000` |
| 5 | Otherwise | No IRMAA action |

### Output template

```markdown
# Medicare & IRMAA Review — {premium_year}

## Headline
{coverage pick (Table A rule #) · IRMAA tier and action (Table B rule #)}

## Enrollment timeline
| Item | Date / window | Source |
|---|---|---|
| Medicare start month | | |
| Initial Enrollment Period | | |
| Part B SEP (if delaying) | | |
| Medigap open enrollment | | |
| HSA contributions stop | | |

## Late-enrollment penalties
{Part B % and Part D $/month, or "None — no uncovered months"}

## HSA shutdown
{stop month, prorated limit — or "Not applicable — not contributing to an HSA"}

## Medigap vs Medicare Advantage
| Option | Annual premiums | Worst-case annual cost | Network |
|---|---|---|---|

## IRMAA tiers ({tier year} tiers, {filing_status})
| MAGI up to | Part B total / month | Part D surcharge / month |
|---|---|---|

## MAGI vs tiers
| Premium year | MAGI year | MAGI | Tier | Annual surcharge | Headroom | Overshoot | Action (rule #) |
|---|---|---|---|---|---|---|---|

## SSA-44 appeal
{eligible / not eligible with reason}

## Actions
- {dates to calendar, quotes to collect, SHIP referral}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).