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

4. **COBRA vs Marketplace (ACA) vs Spouse Plan** — `md_ir_skill_policy_comparison`:
   - **COBRA** — same plan, full cost (employer + employee portion) + 2% admin. Often $1,500–$2,500/mo family. Election window: 60 days from separation, retroactive. Reasonable if mid-treatment, family deductible already met, or out-of-network care critical.
   - **Marketplace** — loss of employer coverage is a Special Enrollment Period (60 days). Premium tax credits (PTCs) make subsidized plans cheap to free if 2026 income is low — and your AGI is probably about to be LOW for a year. Run the numbers — most laid-off users save thousands here vs COBRA.
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
   - **0% LTCG harvest** — if MFJ taxable income ≤ ~$96k (cite year), realize gains tax-free.
9. **Severance lump-sum withholding** — typically supplemental rate (22%) but if it pushes you into a higher bracket, withholding may be insufficient. Set aside ~10% extra for April.

### Day 30–90 — Stabilization

10. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment` recalculated with reduced expenses. Stretch the runway.
11. **Goal pause** — `md_nw_skill_goal_based_savings_plan`. Pause sinking-fund auto-transfers; redirect to emergency fund or essential bills.
12. **Insurance Coverage Gap Audit** — `md_ir_skill_coverage_gap_audit`. Group life and disability are GONE. If health changes are concerning, individual disability is now hard to underwrite; flag for action when re-employed.
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

- Markdown playbook `./reports/life-events/layoff-<DATE>.md`:
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
