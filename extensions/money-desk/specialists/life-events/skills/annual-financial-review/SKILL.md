# Annual Financial Review

description: Run a once-a-year audit across every money-desk domain. Orchestrates 8–10 sub-skills into one deliverable so the user gets a single, prioritized list of changes for the year. Best done at year-end, birthday, or tax-filing season.

## When to use

- Calendar trigger: year-end (Dec) or birthday.
- Tax-filing season — you have a complete picture of last year.
- After a relatively quiet year with no major life events (use the life-event playbooks if there were).

## Inputs needed

- Current age, marital status, dependents, state.
- Income (last full year + projected current year).
- High-level net worth (or run `md_nw_skill_net_worth_snapshot` first if missing).
- Current contribution rates to 401(k) / HSA / IRA.
- Date of last estate-document update.
- Any open questions or specific worries.

## Workflow (sub-skill orchestration)

Run these IN ORDER. After each, summarize one line and continue.

1. **Net Worth Snapshot** — `md_nw_skill_net_worth_snapshot`. Establishes baseline. Compare to last year's snapshot if available.
2. **Cashflow Review** — `md_bc_skill_cashflow_review`. Did spending match the plan?
3. **Withholding Check** — `md_tx_skill_withholding_check`. Adjust W-4 for the new year.
4. **Contribution Optimizer** — `md_rp_skill_contribution_optimizer`. New year = new contribution limits — re-set elections.
5. **Allocation Check + Rebalance Plan** — `md_iv_skill_allocation_check` then `md_iv_skill_rebalance_plan`. Annual rebalance.
6. **Coverage Gap Audit** — `md_ir_skill_coverage_gap_audit`. Did income / dependents / home value change?
7. **Beneficiary Audit** — `md_el_skill_beneficiary_audit`. Quickest, highest-impact estate task.
8. **Basics Checklist** — `md_el_skill_basics_checklist`. Will / POA / advance directive still current?
9. **Score Improvement Plan** — `md_ci_skill_score_improvement_plan` (only if user pulled fresh report).
10. **Age-triggered specials** (run if applicable):
    - Age 50+: catch-up contribution opportunities (calls Contribution Optimizer with age context).
    - Age 55+: HSA catch-up.
    - Age 63–64: pre-Medicare planning — call `md_ir_skill_medicare_irmaa_review`.
    - Age 70½+: QCD opportunity — call `md_tx_skill_charitable_giving_strategy`.
    - Age 73/75: RMD — call `md_rp_skill_rmd_planner`.

## Required citations

- Each sub-skill cites its own sources; the consolidated report links to each sub-report.
- Year-specific limits (401k, HSA, IRA, annual exclusion) cite the tax year.

## Deliverable shape

- Single consolidated markdown `./money-desk/life-events/annual-review-<YEAR>.md`:
  - **Executive summary** — 5 bullets: what changed YoY, top 3 priorities for the year.
  - **Score card** — table per domain: Status (Green / Yellow / Red), one-line takeaway, link to sub-report.
  - **30 / 60 / 90 day action list** — prioritized, not exhaustive.
  - **Next review date.**

## Notes

- Don't try to fix everything. Pick the top 3 actions and ship them.
- Re-use last year's report as the baseline; show deltas, not absolutes.
- "Analysis only. Not professional financial advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).