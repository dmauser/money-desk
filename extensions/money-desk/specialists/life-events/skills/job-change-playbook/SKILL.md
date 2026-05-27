# Job Change Playbook

description: Runbook for a job change — old-401(k) decision, new-employer benefits election, comp-package valuation (base/bonus/RSU/options/ESPP), insurance transition, withholding reset, and emergency-fund adequacy check. Time-sensitive: 60-day rollover rule and short benefits-election windows.

## When to use

- Offer accepted, separation date set.
- Onboarding at new employer (first 30 days of new role).
- Voluntary or involuntary separation (use the **Layoff Playbook** instead if involuntary without a new role).

## Inputs needed

- Old employer comp + benefits + 401(k) balance.
- New employer comp + benefits package (full SPD if possible).
- Equity grants (vesting schedules, strike prices, current FMV).
- Current health plan & whether family coverage continues.
- State change (new state = state tax + insurance + license implications).
- Emergency fund balance.

## Workflow (sub-skill orchestration)

### Before signing the offer

1. **Comp-package valuation** — separate base, bonus target, sign-on, RSU grant value (4-year vest typical), options (Black-Scholes-ish if granted), ESPP discount and lookback, 401(k) match formula and vesting cliff, equity-rollback-on-departure clauses. Compare to current TOTAL comp (not just base).
2. **Health plan compare** — model 3 plan options (HDHP+HSA, PPO, etc.) using `md_ir_skill_policy_comparison`. Family vs employee-only math.
3. **State-change implications** — moving from no-tax to high-tax state (or vice versa) can shift net comp by 5–10%.

### Day 0–7 (during onboarding)

4. **Enroll in new benefits.**
   - Health, dental, vision, life, disability — election windows usually 30 days but verify.
   - **HSA**: if HDHP, max it (cite year limit + employer contribution).
   - **FSA / DCFSA**: pro-rate to remaining months.
   - **Disability Insurance Review** — `md_ir_skill_disability_insurance_review`. Group LTD will change; gap may have grown.
   - **Beneficiary Audit** — `md_el_skill_beneficiary_audit` for new 401(k) and group life immediately.
5. **401(k) election** — at least up to match. Roth vs Traditional split based on `md_rp_skill_contribution_optimizer`.

### Day 0–60 (old-401(k) decision — 60-day rollover rule)

6. **Old-401(k) decision.** Four options:
   - **Leave with old employer** — simplest if balance > $7k. No new contributions. Plan rules may restrict access.
   - **Roll to new 401(k)** — if new plan is good (low fees, broad fund menu, allows backdoor/in-plan-Roth-conversion). Preserves backdoor Roth IRA strategy.
   - **Roll to Rollover IRA** — usually best for fund choice. ⚠️ Breaks pro-rata-clean backdoor Roth IRA (creates a "side balance"). Cite IRS pro-rata rule.
   - **Cash out** — almost always wrong. Taxes + 10% penalty + lost compounding. Last resort.
   - Use **DIRECT trustee-to-trustee** transfer, not indirect (60-day rule, 20% mandatory withholding gotcha).
7. **Roth 401(k) handling** — roll Roth 401(k) to Roth IRA (no 5-year clock reset if Roth IRA already 5+ years old) or to new Roth 401(k).

### Equity housekeeping

8. **Old equity** — confirm what vests through separation date, what's forfeited, post-termination exercise window for options (often 90 days — short!).
9. **New equity** — set up brokerage account, model expected vesting cashflow, identify concentration risk if equity > 10% of NW.

### Tax & cashflow

10. **Withholding Check** — `md_tx_skill_withholding_check`. Mid-year job change with different salary = high risk of under-withholding. Update W-4 immediately at new role.
11. **Bonus tax timing** — sign-on bonus often withheld at supplemental rate (22% fed); true-up at tax time.
12. **Cashflow Review** — `md_bc_skill_cashflow_review` to absorb commute / wardrobe / relocation / new healthcare premium deltas.
13. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment`. New job = no vesting safety. May want 6+ months for first year.

## Hard-deadline checklist

- ⚠️ **Last day at old job**: confirm vested equity, FSA spend-down, COBRA notice receipt.
- ⚠️ **30 days at new job**: benefits election window closes.
- ⚠️ **60 days from old 401(k) distribution** (if indirect rollover): redeposit or it's a taxable distribution.
- ⚠️ **90 days post-separation** (typical): old-employer stock-option exercise window closes.

## Required citations

- Vesting schedules cite the equity plan / grant agreement.
- 401(k) limits + match formulas cite the SPD.
- HSA/FSA/DCFSA limits cite the tax year.

## Deliverable shape

- Markdown playbook `./reports/life-events/job-change-<DATE>.md`:
  - **Total-comp comparison** (old vs new, table).
  - **Day-7 / Day-30 / Day-60 action list with deadlines.**
  - **Old-401(k) recommendation** with reasoning.
  - **Benefits-election decisions** (plan choice, contribution rates, beneficiaries).
  - **Equity calendar** for next 12 months.
  - **Withholding adjustment.**

## Notes

- Direct rollovers only. Never touch the money.
- ISOs have ESPECIALLY tight post-termination windows and AMT implications — flag for CPA.
- "Analysis only. Recommend a CPA for equity-comp tax planning."
