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
6. **Coverage Gap Audit** — `md_lp_skill_life_insurance_needs` + `md_lp_skill_disability_insurance_review` + `md_pc_skill_umbrella_sizing`. Did income / dependents / home value change?
7. **Beneficiary Audit** — `md_el_skill_beneficiary_audit`. Quickest, highest-impact estate task.
8. **Basics Checklist** — `md_el_skill_basics_checklist`. Will / POA / advance directive still current?
9. **Score Improvement Plan** — `md_ci_skill_score_improvement_plan` (only if user pulled fresh report).
10. **Age-triggered specials** (run if applicable):
    - Age 50+: catch-up contribution opportunities (calls Contribution Optimizer with age context).
    - Age 60–63: SECURE 2.0 super catch-up (`md_facts` → `irs_contribution_limits.401k_employee_deferral_catchup_age_60_to_63_secure_2_0`).
    - Age 55+: HSA catch-up.
    - Age 63–64: pre-Medicare planning — call `md_ih_skill_medicare_irmaa_review`.
    - Age 70½+: QCD opportunity — call `md_tx_skill_charitable_giving_strategy`.
    - Age ≥ RMD start age − 1 (start age 73 if born 1951–1959; 75 if born 1960+): RMD — call `md_rp_skill_rmd_planner`.

## Required citations

- Each sub-skill cites its own sources; the consolidated report links to each sub-report.
- Year-specific limits (401k, HSA, IRA, annual exclusion) come from `md_facts` and cite the tax year.

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

## Determinism rules

### Input keys

- `review_year` — integer, the calendar year being planned (e.g. 2026)
- `age` — integer, user's age on Dec 31 of `review_year`; `spouse_age` — integer or null
- `birth_year` — integer (drives RMD start age)
- `marital_status` — `single` | `married` | `divorced` | `widowed`
- `dependents_count` — integer
- `state` — two-letter state code
- `income_last_year_usd` / `income_projected_usd` — numbers, gross household income
- `net_worth_usd` — number or null (null → run Net Worth Snapshot first)
- `contrib_401k_pct`, `contrib_hsa_usd`, `contrib_ira_usd` — current elections
- `estate_docs_last_updated_yyyy_mm` — string or null
- `fresh_credit_report` — boolean (pulled within the last 90 days)
- `prior_review_available` — boolean (last year's annual review exists)
- `open_questions` — list of strings

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Age, income, state, dependents | **Ask — no default** | — |
| Net worth | Run **Net Worth Snapshot** (Net Worth & Goals) first — no estimate | — |
| Contribution limits / catch-ups for `review_year` | `md_facts` → `irs_contribution_limits` (`401k_employee_deferral`, `401k_employee_deferral_catchup_age_50_plus`, `401k_employee_deferral_catchup_age_60_to_63_secure_2_0`, `ira_traditional_or_roth`, `ira_catchup_age_50_plus`, `hsa_self_only`, `hsa_family`, `hsa_catchup_age_55_plus`) | `[IRS 2026 limits]` |
| Annual gift exclusion | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` | `[IRS Estate 2026]` |
| IRMAA look-back | `md_facts` → `medicare_2026.irmaa_lookback_years` | `[CMS Medicare 2026]` |
| RMD start age (73 if born 1951–1959; 75 if born 1960+) | Statutory — cite SECURE 2.0 §107 / IRS Pub 590-B; `birth_year` is **Ask — no default** | `[USER-PROVIDED]` |
| Sub-skill results | Produced by each sub-skill; never estimated here | — |

### Calculation method

1. **Baseline.** If `net_worth_usd` is null, run Net Worth Snapshot first. If `prior_review_available`, compute every delta as `this_year − last_year` and show both.
2. **Run the core sub-skills in this fixed order** (never reorder, never skip except per the Decision rules): 1 Net Worth Snapshot → 2 Cashflow Review → 3 Withholding Check → 4 Contribution Optimizer → 5 Allocation Check → 6 Rebalance Plan → 7 Coverage Gap Audit → 8 Beneficiary Audit → 9 Basics Checklist → 10 Score Improvement Plan (only if `fresh_credit_report = true`).
3. **Age-triggered specials** — evaluate every row (not first-match) using `age` and `spouse_age`, in this order: age ≥ 50 → catch-up; 60 ≤ age ≤ 63 → SECURE 2.0 super catch-up; age ≥ 55 and HSA-eligible → HSA catch-up; age 63 or 64 → Medicare/IRMAA review (MAGI this year drives IRMAA `irmaa_lookback_years` later); age ≥ 70½ → QCD via Charitable Giving Strategy; age ≥ RMD start age − 1 → RMD Planner.
4. **Score card.** For each of the 8 domains (Cashflow, Tax, Retirement, Investing, Insurance, Estate, Credit, Net worth) assign status by the Decision rules table "Status" rows.
5. **Action list.** Collect every action the sub-skills produced. Sort by: (a) hard deadline date ascending (undated last); (b) irreversible-risk flag first (beneficiary gaps, lapsed coverage, missed election); (c) estimated annual $ impact descending; (d) domain name A–Z. Top 3 = 30-day list; next 3 = 60-day; next 3 = 90-day; the rest go to "Backlog".
6. **Next review date** = same month next year, or the user's birthday month if they chose birthday cadence.
7. If a sub-skill cannot run (missing data), mark its domain `Not run — <missing input>` and status Yellow; do not estimate its findings.

### Decision rules

Evaluate top to bottom; first match wins (one table for skipping sub-skills, then status).

| # | Condition | Result |
|---|---|---|
| 1 | A major life event (birth/adoption, job change, layoff, home purchase, inheritance) occurred in the last 12 months | Run that life-event playbook first, then this review |
| 2 | `fresh_credit_report = false` | Skip sub-skill 10; Credit status = `Not run` |
| 3 | Status: domain has a missed or ≤ 30-day hard deadline, a beneficiary/coverage gap, or negative net-worth change > 10% YoY not explained by a one-off | **Red** |
| 4 | Status: sub-skill recommends any change with no deadline in the next 30 days | **Yellow** |
| 5 | Otherwise | **Green** |

### Output template

```markdown
# Annual Financial Review — {review_year}

## Executive summary
- What changed YoY: {net worth Δ, savings-rate Δ}
- Priority 1: {action}
- Priority 2: {action}
- Priority 3: {action}
- Next review: {date}

## Score card
| Domain | Status | One-line takeaway | Sub-report |
|---|---|---|---|
| Cashflow | | | |
| Tax | | | |
| Retirement | | | |
| Investing | | | |
| Insurance | | | |
| Estate | | | |
| Credit | | | |
| Net worth | | | |

## Age-triggered specials
{rows that fired with md_facts citation — or "Not applicable — no age triggers at {age}"}

## 30 / 60 / 90 day action list
| Window | # | Action | Deadline | Specialist | Why (rule) |
|---|---|---|---|---|---|

## Backlog
{remaining actions — or "None"}

## Next review date
{date}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
