# Layoff Playbook

description: Day-0 through 90-day runbook for an involuntary job loss. Triages the immediate decisions (severance, COBRA vs marketplace, unemployment filing) before they expire, protects the emergency fund, and lays out the financial runway / re-entry plan.

## When to use

- User has been laid off, fired, or accepted severance.
- User has been told a layoff is coming.
- Furloughed or hours-cut to threshold below benefits eligibility.

## Inputs needed

- Separation date and last day of benefits.
- Severance offer (amount, structure — lump vs salary continuation, conditions, COBRA subsidy).
- Eligible state for unemployment (where you WORKED, not where you live, generally).
- Current monthly fixed expenses + emergency fund balance.
- Health insurance situation (single, family, ongoing claims).
- Retirement account balances at separating employer.
- Equity vesting calendar (anything that vests post-separation? — usually no, but check).
- Spouse income / employer-benefit access.

## Workflow (sub-skill orchestration)

### Day 0–7 — Triage

1. **READ THE SEVERANCE AGREEMENT CAREFULLY.** Common landmines:
   - **Non-compete** — what jobs can you NOT take?
   - **Release of claims** — what are you giving up (typically all employment claims)?
   - **Older Workers Benefit Protection Act (OWBPA)** — if 40+, you have 21 days to review (45 if group layoff) + 7 to revoke. Don't sign on the spot.
   - **Severance payment timing** — lump vs continuation matters for unemployment timing.
   - Negotiate: extra weeks, COBRA subsidy, outplacement, accelerated vesting, neutral reference, broader non-compete carve-outs. Lawyer review for senior roles or non-trivial severance.
2. **File for unemployment immediately** — even if severance continues. Waiting weeks + state-by-state rules; don't leave money on the table. State rules differ on severance treatment (some delay UI, some don't).
3. **Compute runway** — emergency fund + severance net + spouse income vs essential monthly expenses. How many months without further income? This is the most important number.

### Day 0–60 — Health insurance decision

4. **COBRA vs Marketplace (ACA) vs Spouse Plan** — `md_ih_skill_health_plan_selector`:
   - **COBRA** — same plan, full cost (employer + employee portion) + 2% admin — use the premium on the employer's COBRA notice. Election window: 60 days from separation, retroactive. Reasonable if mid-treatment, family deductible already met, or out-of-network care critical.
   - **Marketplace** — loss of employer coverage is a Special Enrollment Period (60 days). Premium tax credits (PTCs) make subsidized plans cheap to free if this year's income is low (compare MAGI to `md_facts` → `federal_poverty_level_2026_48_states`) — and your AGI is probably about to be LOW for a year. Run the numbers — most laid-off users save thousands here vs COBRA.
   - **Spouse's plan** — if married and spouse has employer coverage, your job loss is a qualifying event to join their plan (30 days typically). Often the cheapest option.
   - **Short-term plans** — bridge only; not ACA-compliant; pre-existing exclusions; avoid unless truly nothing else.
5. **HSA contributions** — must STOP the month any Part of Medicare begins, but laid-off users under 65 can keep contributing if still on an HDHP (e.g. via marketplace HDHP plan).

### Day 0–60 — Money mechanics

6. **Cashflow Review** — `md_bc_skill_cashflow_review` immediately reshape to "survival mode":
   - **Freeze**: discretionary, eating out, subscriptions, new buys.
   - **Pause**: 401k contributions (no income to contribute from), Roth IRA (if no earned income).
   - **Continue**: minimum debt payments, insurance premiums, essentials.
   - **Cut**: subscriptions audit — `md_bc_skill_subscription_audit`.
7. **Old-401(k) — DO NOT TOUCH** in panic. See `md_le_skill_job_change_playbook` for the 4-option framework. If desperate for cash, take loan from old 401(k) if plan allows BEFORE cashout (loan = no tax + no penalty if repaid; cashout = tax + 10% penalty if under 55, exception "rule of 55" if separation in year you turn 55+).
8. **Tax-year planning windfall** — you're probably going to have your LOWEST-INCOME YEAR. Two opportunities:
   - **Roth conversion** in the low-income year — pay lower rate to fill up the standard deduction + 10–12% brackets with conversions.
   - **0% LTCG harvest** — if taxable income ≤ the 0% bracket top (`md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj`), realize gains tax-free up to that line.
9. **Severance lump-sum withholding** — typically supplemental rate (22%) but if it pushes you into a higher bracket, withholding may be insufficient. Set aside severance × (your marginal rate − 22%) for April.

### Day 30–90 — Stabilization

10. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment` recalculated with reduced expenses. Stretch the runway. When recommending where to park the remaining EF, **DepositAccounts.com is the DEFAULT source** for HYSA / MMA / CD / reward-checking rates: query it first, cite the URL with as-of timestamp tagged `[UNSOURCED — verify on issuer page]` in the playbook output, and cross-check on the issuer page (MMFs → fund issuer's 7-day yield; T-bills → TreasuryDirect or brokerage auction page).
11. **Goal pause** — `md_nw_skill_goal_based_savings_plan`. Pause sinking-fund auto-transfers; redirect to emergency fund or essential bills.
12. **Insurance Coverage Gap Audit** — `md_lp_skill_life_insurance_needs` + `md_lp_skill_disability_insurance_review`. Group life and disability are GONE. If health changes are concerning, individual disability is now hard to underwrite; flag for action when re-employed.
13. **Withholding Check** — `md_tx_skill_withholding_check` for the year given reduced annual income. May be due a big refund — consider whether to adjust withholding on severance going forward.
14. **Networking time-block** — not a money task, but: 25–30 informational coffees > unlimited applications. Pull from prior managers, peers, former direct reports.

### Reaching back to work

15. **Job Change Playbook** — `md_le_skill_job_change_playbook` for the new role. Often a salary reset; rebuild contributions immediately.
16. **Annual Review trigger** — schedule for ~60 days after new role stabilizes.

## Hard-deadline checklist

- ⚠️ **21 days (45 if group layoff over 40 y.o.)**: severance review window per OWBPA.
- ⚠️ **30 days**: spouse's plan qualifying-event enrollment usually.
- ⚠️ **60 days**: COBRA election (retroactive if elected within window).
- ⚠️ **60 days**: ACA Marketplace Special Enrollment Period.
- ⚠️ **60 days**: 401(k) indirect-rollover redeposit (avoid indirect rollovers entirely).

## Required citations

- COBRA mechanics cite DOL.
- ACA SEP rules cite Healthcare.gov.
- OWBPA cite 29 USC §626(f).
- 0% LTCG bracket cites tax year.
- Rule of 55 cites IRC §72(t)(2)(A)(v).

## Deliverable shape

- Markdown playbook `./money-desk/life-events/layoff-<DATE>.md`:
  - **Runway calculation** (months of essentials covered).
  - **Health insurance decision** (COBRA vs ACA vs spouse, with cost math).
  - **Severance review red-flags.**
  - **Survival-mode cashflow plan.**
  - **Tax-year opportunities** (Roth conversion / 0% LTCG / withholding).
  - **Old-401(k) holding pattern.**
  - **30 / 60 / 90 day action lists.**

## Notes

- DO NOT cash out the 401(k) unless every other option is exhausted.
- The low-income year is a tax-planning OPPORTUNITY hidden inside a stressful event.
- Emotional decisions in week 1 cause damage — slow down the financial decisions, not the job search.
- "Analysis only. Recommend a CPA for the severance/conversion tax planning and an employment lawyer for severance > 6 months or any non-trivial release language."

## Determinism rules

### Input keys

- `separation_date`, `benefits_end_date`, `today` — `YYYY-MM-DD`
- `age` — integer
- `severance` — `{ gross_usd, form: lump | continuation, weeks, cobra_subsidy_monthly_usd, has_release (bool), has_noncompete (bool), group_layoff (bool) }`
- `ui_state` — two-letter code (state where you worked)
- `ui_weekly_benefit_usd` — number or null (from the state estimator)
- `liquid_cash_usd` — number (emergency fund + other cash)
- `essential_monthly_expenses_usd` — number
- `spouse_net_monthly_income_usd` — number (0 if none)
- `spouse_plan_available` — boolean
- `health_options` — list of `{ option: cobra | marketplace | spouse | short_term, premium_monthly_usd, expected_oop_annual_usd }`
- `mid_treatment` — boolean (ongoing treatment / deductible met / out-of-network care critical)
- `projected_magi_usd` — number, this calendar year
- `household_size` — integer; `filing_status` — `single` | `mfj` | `hoh`
- `marginal_rate_pct` — number
- `old_401k_balance_usd` — number; `plan_allows_loans` — boolean

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Severance terms, cash, expenses, health quotes | **Ask — no default** | — |
| UI weekly benefit | State UI estimator via `md_sources`; if unavailable use 0 in runway (conservative) | `[ASSUMPTION: $0 UI]` |
| Federal poverty level for PTC % of FPL | `md_facts` → `federal_poverty_level_2026_48_states.household_size_to_fpl`; ceiling → `aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended` | `[HHS FPL 2026]` |
| 0% LTCG bracket top | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` (first row `max`) | `[IRS 2026 limits]` |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` | `[IRS 2026 limits]` |
| Federal supplemental withholding rate (22%) | Not in md_facts — IRS Pub 15 via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| COBRA premium | Employer COBRA notice (full premium + 2% admin, 29 USC §1162); **Ask — no default** | — |

### Calculation method

1. **Deadlines** (from `separation_date` unless noted): OWBPA review = 21 days (45 if `group_layoff`) from receipt + 7-day revocation (only if `age` ≥ 40); spouse-plan enrollment = 30 days (verify SPD); COBRA election = 60 days from the later of loss of coverage or notice; Marketplace SEP = 60 days from loss of coverage; indirect-rollover redeposit = 60 days from distribution.
2. **Runway months** = `(liquid_cash_usd + severance_net_usd) / (essential_monthly_expenses_usd − spouse_net_monthly_income_usd − ui_weekly_benefit_usd × 52 / 12)`, where `severance_net_usd` = net amount on the severance statement if known; else `gross_usd × (1 − supplemental_rate − fica_employee_rate − medicare_employee_rate) − state withholding` (FICA rates from `md_facts` → `social_security_2026`; state withholding **Ask**). If the denominator ≤ 0 → runway = "indefinite (income covers essentials)". Round down to one decimal.
3. **Health cost per option** for the months until expected re-employment (use `runway months`, capped at 12): `premium_monthly_usd × months + expected_oop_annual_usd × months / 12`; COBRA premium net of `cobra_subsidy_monthly_usd`. Marketplace premium is the post-PTC quote from Healthcare.gov at `projected_magi_usd`.
4. **Income as % FPL** = `projected_magi_usd / household_size_to_fpl[household_size] × 100`.
5. **0% LTCG headroom** = `0%-bracket max + standard deduction − projected taxable ordinary income` (floor 0). Same headroom bounds any Roth conversion that stays in the 0%/10%/12% band; Roth conversion headroom to the top of the 12% bracket = `12% bracket max + standard deduction − projected_magi_usd` (brackets from `md_facts` → `income_tax_brackets_mfj_2026.brackets`).
6. **Severance withholding gap** = `gross_usd × max(0, marginal_rate_pct − supplemental_rate_pct) / 100` → set aside this exact amount for April.
7. **Sub-skill order** (fixed): Policy Comparison → Cashflow Review → Subscription Audit → Emergency Fund Assessment → Goal-Based Savings Plan → Coverage Gap Audit → Withholding Check → (re-employment) Job Change Playbook.
8. Rounding: cents internally; whole dollars reported; months to one decimal.

### Decision rules

Evaluate top to bottom; first match wins within each table.

| # | Health coverage | Recommendation |
|---|---|---|
| 1 | `mid_treatment = true` | COBRA (keeps deductible progress and network; elect within 60 days, retroactive) |
| 2 | `spouse_plan_available` and spouse option cost is lowest | Spouse plan (enroll within the spouse plan's window) |
| 3 | Marketplace (post-PTC) cost is lowest | Marketplace via SEP |
| 4 | Otherwise | Lowest-cost ACA-compliant option; short-term plans only if no other option exists |

| # | Severance | Recommendation |
|---|---|---|
| 1 | `age` ≥ 40 and `has_release` | Do not sign before day 21 (45 if group); 7-day revocation |
| 2 | `severance.weeks` > 26 or `has_noncompete` | Employment-lawyer review before signing |
| 3 | Otherwise | Review and negotiate (extra weeks, COBRA subsidy, outplacement, vesting) |

| # | Cash need from old 401(k) | Recommendation |
|---|---|---|
| 1 | Runway ≥ 6 months | Do not touch the 401(k) |
| 2 | `plan_allows_loans` (verify separated-participant loans are allowed) | 401(k) loan before any withdrawal |
| 3 | `age` ≥ 55 in separation year | Rule-of-55 withdrawal, smallest amount needed |
| 4 | Otherwise | Last resort withdrawal — show tax + 10% penalty $ before deciding |

| # | Tax-year opportunity | Recommendation |
|---|---|---|
| 1 | 0% LTCG headroom > 0 and taxable unrealized gains exist | Harvest gains up to the headroom |
| 2 | Roth-conversion headroom > 0 and runway ≥ 6 months and conversion would not cross the PTC ceiling | Roth conversion up to the headroom |
| 3 | Otherwise | No tax-year move |

### Output template

```markdown
# Layoff Playbook — separated {separation_date}, run {today}

## Hard deadlines
| Deadline | Date | Days left | Source |
|---|---|---|---|

## Runway calculation
| Item | $ |
|---|---|
| Liquid cash | |
| Severance (net) | |
| Monthly essentials − spouse income − UI | |
| **Runway (months)** | |

## Health insurance decision
| Option | Monthly premium | Months | Expected OOP | Total | |
|---|---|---|---|---|---|
{recommendation + rule #}

## Severance review red-flags
{rule # fired; release, non-compete, OWBPA}

## Survival-mode cashflow plan
| Category | Freeze / Pause / Continue / Cut | $ / mo |
|---|---|---|

## Tax-year opportunities
| Opportunity | Headroom $ | Recommendation |
|---|---|---|
{or "Not applicable — no headroom"}

## Old-401(k) holding pattern
{rule # fired}

## 30 / 60 / 90 day action lists
| Window | Action | Deadline | Specialist |
|---|---|---|---|
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).