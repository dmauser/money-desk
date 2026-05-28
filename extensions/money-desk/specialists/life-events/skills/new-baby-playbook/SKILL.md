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

1. **Coverage Gap Audit** — `md_ir_skill_coverage_gap_audit` with "expecting child" context. Surface: term-life gap, disability gap, OB/maternity in-network providers.
2. **Life Insurance Needs** — `md_ir_skill_life_insurance_needs` using DIME with the new child. Quote 20–25 year term NOW while still healthy. Both parents (including stay-at-home parent — daycare-replacement value).
3. **Basics Checklist** — `md_el_skill_basics_checklist` with focus on **guardian designation** in the will. This is the #1 estate task for new parents.

### Day 0–30 (qualifying event window — DO NOT MISS)

4. **Add baby to health insurance** — within 30 days of birth/adoption (cite plan SPD; usually 30 but some are 60). Compare both parents' plans if dual-income — single plan family vs employee-only-on-each is often cheaper.
5. **Re-run Cashflow Review** — `md_bc_skill_cashflow_review` with new line items: daycare ($X/mo — biggest), diapers, formula, healthcare premium delta, reduced/eliminated DCFSA.
6. **FSA / DCFSA election change** — qualifying event allows mid-year change. Dependent Care FSA cap (cite year, $5k/$2.5k MFS); enroll if both parents work.
7. **Beneficiary Audit** — `md_el_skill_beneficiary_audit` to add baby as contingent (after spouse) on 401(k), IRA, life insurance. NEVER as primary on a retirement account for a minor without a trust.

### Day 30–60

8. **Apply for SSN** (usually auto via birth certificate paperwork). Required for 529 / dependent tax credit.
9. **529 Plan Review** — `md_ed_skill_529_plan_review` or `md_ed_skill_savings_account_selector` to pick the right state plan. Open with $1 placeholder; fund what cashflow allows.
10. **Withholding Check** — `md_tx_skill_withholding_check`. New dependent = Child Tax Credit + dependent exemption (state). Update W-4.

### Day 60–90+

11. **Update or draft will** — recommend estate attorney (NOT this agent). Guardian named, testamentary trust if leaving > $X to minor.
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

- Markdown playbook `./reports/life-events/new-baby-<DATE>.md`:
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).