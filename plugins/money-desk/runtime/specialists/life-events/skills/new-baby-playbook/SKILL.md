# New Baby Playbook

description: 30/60/90-day runbook for a new baby (biological or adopted). Sequences insurance enrollment (30-day qualifying event window), beneficiary updates, will/guardian designation, 529 setup, term-life sizing, and budget reshape. Misses on the 30-day window often mean waiting until next open enrollment — high-stakes timing.

## When to use

- Pregnancy in second/third trimester (start now — most paperwork is doable pre-arrival).
- Adoption matched or finalized.
- Within 60 days of birth/adoption (some windows are still open).

## Inputs needed

- Parents' ages, marital status, state.
- Employer benefits (health plan tiers, life insurance multiples, FSA/DCFSA, parental leave).
- Current life insurance (existing term policies).
- Existing will / POA / advance directive.
- Other children + existing 529s.
- Income, spending, savings rate.

## Workflow (sub-skill orchestration)

### Pre-arrival (do now)

1. **Coverage Gap Audit** — `md_lp_skill_life_insurance_needs` + `md_lp_skill_disability_insurance_review` with "expecting child" context. Surface: term-life gap, disability gap, OB/maternity in-network providers.
2. **Life Insurance Needs** — `md_lp_skill_life_insurance_needs` using DIME with the new child. Quote 20–25 year term NOW while still healthy. Both parents (including stay-at-home parent — daycare-replacement value).
3. **Basics Checklist** — `md_el_skill_basics_checklist` with focus on **guardian designation** in the will. This is the #1 estate task for new parents.

### Day 0–30 (qualifying event window — DO NOT MISS)

4. **Add baby to health insurance** — within 30 days of birth/adoption (cite plan SPD; usually 30 but some are 60). Compare both parents' plans if dual-income — single plan family vs employee-only-on-each is often cheaper.
5. **Re-run Cashflow Review** — `md_bc_skill_cashflow_review` with new line items: daycare (user's local quote — usually the biggest), diapers, formula, healthcare premium delta, reduced/eliminated DCFSA.
6. **FSA / DCFSA election change** — qualifying event allows mid-year change. Dependent Care FSA cap (`md_facts` → `irs_contribution_limits.fsa_dependent_care_married_or_single`; MFS = half); enroll if both parents work.
7. **Beneficiary Audit** — `md_el_skill_beneficiary_audit` to add baby as contingent (after spouse) on 401(k), IRA, life insurance. NEVER as primary on a retirement account for a minor without a trust.

### Day 30–60

8. **Apply for SSN** (usually auto via birth certificate paperwork). Required for 529 / dependent tax credit.
9. **529 Plan Review** — `md_ed_skill_529_plan_review` or `md_ed_skill_savings_account_selector` to pick the right state plan. Open with $1 placeholder; fund what cashflow allows.
10. **Withholding Check** — `md_tx_skill_withholding_check`. New dependent = Child Tax Credit + dependent exemption (state). Update W-4.

### Day 60–90+

11. **Update or draft will** — recommend estate attorney (NOT this agent). Guardian named, testamentary trust (or UTMA custodian) for any assets — including life-insurance proceeds — that could pass to a minor.
12. **Annual Financial Review trigger** — schedule full annual review in 6 months once routine stabilizes.

## Hard-deadline checklist (in order)

- ⚠️ **30 days from DOB**: add to health insurance, FSA/DCFSA election change. Missing = wait until open enrollment.
- ⚠️ **60 days**: most other qualifying-event windows close.
- 📅 **Tax year of birth**: claim CTC + dependent on filing.

## Required citations

- Qualifying-event windows cite the SPD or carrier policy.
- DCFSA & CTC limits cite the tax year.
- State 529 deduction cites state department of revenue.

## Deliverable shape

- Markdown playbook `./money-desk/life-events/new-baby-<DATE>.md`:
  - **Pre-arrival checklist** (insurance quotes, will outline).
  - **30-day must-do list** with deadlines.
  - **60-day list.**
  - **90-day list.**
  - **Cost-of-baby cashflow delta** (monthly).
  - **Coverage upgrade summary** (term life $, disability boost).
  - **Specialist hand-offs** with links to sub-reports.

## Notes

- Stay-at-home parents need life insurance too — daycare + housekeeping + childcare replacement cost is six figures.
- 529 for a newborn = 18-year horizon = aggressive equity glidepath.
- "Analysis only. Recommend an estate attorney for the will and an independent broker for term-life quotes."

## Determinism rules

### Input keys

- `event_type` — `birth` | `adoption`
- `event_date` — `YYYY-MM-DD` (due date pre-arrival; actual DOB / placement date after)
- `today` — `YYYY-MM-DD`
- `parent_ages` — list of integers; `marital_status` — `married` | `unmarried`; `state` — two-letter code
- `both_parents_work` — boolean
- `health_plans` — list of `{ parent, tier: employee_only | employee_spouse | employee_child | family, premium_annual_usd, deductible_usd, oop_max_usd, qualifying_event_window_days }`
- `dcfsa_offered` — boolean; `childcare_annual_usd` — number
- `existing_term_life` — list of `{ insured, face_usd, years_remaining }`
- `has_will`, `has_guardian_named`, `has_poa`, `has_advance_directive` — booleans
- `other_children` — integer; `existing_529s` — integer
- `gross_income_annual_usd`, `monthly_spending_usd` — numbers

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Event date, plans, current coverage, estate-doc status | **Ask — no default** | — |
| Qualifying-event window | Plan SPD (`qualifying_event_window_days`); if unknown, plan to the **30-day** HIPAA special-enrollment minimum | `[UNSOURCED — verify SPD]` |
| Dependent-care FSA limit | `md_facts` → `irs_contribution_limits.fsa_dependent_care_married_or_single` (MFS = half) | `[IRS 2026 limits]` |
| Health FSA limit | `md_facts` → `irs_contribution_limits.fsa_healthcare` | `[IRS 2026 limits]` |
| Child Tax Credit amount / phase-out | Not in md_facts — IRS (Form 8812 instructions) via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| Annual gift exclusion (529 funding by relatives) | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` | `[IRS Estate 2026]` |
| Childcare cost | **Ask — no default** (local quotes) | — |

### Calculation method

1. **Phase** from `today` vs `event_date`: before → Pre-arrival; 0–30 days after → Day 0–30; 31–60 → Day 30–60; 61+ → Day 60–90+.
2. **Deadlines**: health-insurance add = `event_date + qualifying_event_window_days` (30 if unknown); FSA/DCFSA change = same window; 60-day window for any plan whose SPD says 60. Show days remaining.
3. **Plan comparison** (dual-income only): for each feasible configuration (family on parent A; family on parent B; each parent employee-only + child on the cheaper parent) compute `premiums + deductible` (expected-use case) and `premiums + oop_max` (worst case). Rank by worst case; tie → expected-use case.
4. **DCFSA election** = `min(childcare_annual_usd remaining in plan year, DCFSA limit)`, pro-rated only if the plan says so.
5. **Cashflow delta / month** = `(childcare_annual_usd + Δpremium_annual) / 12 + user-supplied diapers/formula estimate − DCFSA tax savings / 12`. Diapers/formula: **Ask**; if not given, show the line as "[ask]" rather than a number.
6. **Sub-skill order** (fixed): Coverage Gap Audit → Life Insurance Needs → Basics Checklist → [add baby to plan] → Cashflow Review → [FSA/DCFSA change] → Beneficiary Audit → [SSN] → 529 Plan Review / Savings Account Selector → Withholding Check → [will with attorney] → schedule Annual Financial Review at `event_date + 6 months`.
7. Rounding: cents internally; whole dollars reported.

### Decision rules

Evaluate top to bottom; first match wins within each table.

| # | Condition | Priority action |
|---|---|---|
| 1 | Days since event > window and baby not yet on a plan | Window missed — call HR/carrier today; next path is open enrollment |
| 2 | Phase = Day 0–30 | Add baby to health plan + FSA/DCFSA change first |
| 3 | Phase = Pre-arrival and (`has_will = false` or `has_guardian_named = false`) | Guardian designation first (Basics Checklist) |
| 4 | Phase = Pre-arrival | Term-life quotes for both parents (incl. stay-at-home parent) |
| 5 | Otherwise | Next unfinished step in the fixed sub-skill order |

| # | Beneficiary designation | |
|---|---|---|
| 1 | Married | Spouse primary; children (via trust or UTMA custodian) contingent |
| 2 | Otherwise | Trust for the children primary — never a minor outright |

| # | DCFSA | |
|---|---|---|
| 1 | `dcfsa_offered` and `both_parents_work` and `childcare_annual_usd` > 0 | Enroll at the step-4 amount |
| 2 | Otherwise | Do not enroll; note Child & Dependent Care Credit instead |

### Output template

```markdown
# New Baby Playbook — {event_type} {event_date}, run {today}

## Hard deadlines
| Deadline | Date | Days left | Source |
|---|---|---|---|

## Pre-arrival checklist
- [ ] Coverage Gap Audit
- [ ] Term-life quotes (both parents)
- [ ] Guardian named in will
{or "Not applicable — baby has arrived"}

## 30-day must-do list
| Action | Deadline | Specialist |
|---|---|---|

## 60-day list
| Action | Deadline | Specialist |
|---|---|---|

## 90-day list
| Action | Deadline | Specialist |
|---|---|---|

## Health plan comparison
| Configuration | Premiums | Expected-use cost | Worst-case cost | Rank |
|---|---|---|---|---|
{or "Not applicable — single plan available"}

## Cost-of-baby cashflow delta (monthly)
| Line | $ / mo |
|---|---|

## Coverage upgrade summary
| Insured | Current term life | Recommended (from Life Insurance Needs) | Disability gap |
|---|---|---|---|

## Specialist hand-offs
| Order | Skill (Specialist) | Status |
|---|---|---|
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).