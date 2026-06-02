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
   - Decision frame: do you value predictability + access (Medigap) or low cost + bundled extras (Advantage)?
4. **IRMAA modeling.**
   - Cite year's brackets explicitly (they shift annually).
   - 2-year MAGI lookback: 2026 IRMAA = 2024 MAGI.
   - Married filing separately has much harsher brackets — flag for divorced/separated users.
   - Surcharges apply to BOTH Part B and Part D.
5. **IRMAA appeal (SSA-44).** Life-changing events allowing appeal: marriage, divorce/annulment, death of spouse, work stoppage, work reduction, loss of income-producing property, loss/reduction of pension, employer settlement. Filed with proof of event.
6. **Pre-Medicare income management.** In the 2 years BEFORE Medicare (and ongoing), tactical levers to stay below IRMAA cliffs:
   - Time Roth conversions BELOW the cliff (a $1 conversion above a bracket may cost $1,000+ in Part B+D surcharges).
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).