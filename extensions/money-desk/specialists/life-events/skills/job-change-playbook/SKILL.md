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

1. **Comp-package valuation** — separate base, bonus target, sign-on, RSU grant value (4-year vest typical), options (intrinsic value: FMV − strike × shares; no option-pricing model), ESPP discount and lookback, 401(k) match formula and vesting cliff, equity-rollback-on-departure clauses. Compare to current TOTAL comp (not just base).
2. **Health plan compare** — model 3 plan options (HDHP+HSA, PPO, etc.) using `md_ih_skill_health_plan_selector`. Family vs employee-only math.
3. **State-change implications** — moving from no-tax to high-tax state (or vice versa) can materially shift net comp — quantify it with Withholding Check rather than estimating.

### Day 0–7 (during onboarding)

4. **Enroll in new benefits.**
   - Health, dental, vision, life, disability — election windows usually 30 days but verify.
   - **HSA**: if HDHP, max it (`md_facts` → `irs_contribution_limits.hsa_self_only` / `hsa_family`, minus employer contribution).
   - **FSA / DCFSA**: pro-rate to remaining months.
   - **Disability Insurance Review** — `md_lp_skill_disability_insurance_review`. Group LTD will change; gap may have grown.
   - **Beneficiary Audit** — `md_el_skill_beneficiary_audit` for new 401(k) and group life immediately.
5. **401(k) election** — at least up to match. Roth vs Traditional split based on `md_rp_skill_contribution_optimizer`.

### Day 0–60 (old-401(k) decision — 60-day rollover rule)

6. **Old-401(k) decision.** Four options:
   - **Leave with old employer** — simplest if balance is at or above the plan's small-balance force-out threshold ($7,000 under SECURE 2.0 — verify in the SPD, not in `md_facts`). No new contributions. Plan rules may restrict access.
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
11. **Bonus tax timing** — sign-on bonus often withheld at the federal supplemental rate (22% — IRS Pub 15; not in `md_facts`); true-up at tax time.
12. **Cashflow Review** — `md_bc_skill_cashflow_review` to absorb commute / wardrobe / relocation / new healthcare premium deltas.
13. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment`. New job = no vesting safety. Use the target month count that Emergency Fund Assessment returns.

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

- Markdown playbook `./money-desk/life-events/job-change-<DATE>.md`:
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

## Determinism rules

### Input keys

- `separation_date`, `start_date` — `YYYY-MM-DD`
- `age_at_separation` — integer
- `old_comp`, `new_comp` — each `{ base_usd, bonus_target_usd, sign_on_usd, rsu_grant_usd, rsu_vest_years, options_count, option_strike_usd, share_fmv_usd, espp_contrib_usd, espp_discount_pct, match_pct_of_pay, match_cap_pct, hsa_employer_usd, health_premium_annual_usd }`
- `old_401k_balance_usd` — number; `old_401k_has_roth` — boolean
- `old_plan_fee_pct`, `new_plan_fee_pct` — numbers (all-in plan + fund expense)
- `new_plan_accepts_rollins` — boolean
- `uses_backdoor_roth` — boolean (does or plans to do a backdoor Roth IRA)
- `needs_access_before_59_5` — boolean
- `old_state`, `new_state` — two-letter codes
- `emergency_fund_usd`, `essential_monthly_expenses_usd` — numbers
- `net_worth_usd` — number; `employer_stock_value_usd` — number (new + old employer equity held)
- `marginal_rate_pct` — number, federal marginal rate at the new salary
- `benefits_election_window_days` — integer (from the new SPD)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Comp package figures, plan fees, election window | **Ask — no default** (offer letter, grant agreement, SPD) | — |
| 401(k) / HSA / FSA limits | `md_facts` → `irs_contribution_limits.401k_employee_deferral`, `401k_employee_deferral_catchup_age_50_plus`, `hsa_self_only`, `hsa_family`, `fsa_healthcare`, `fsa_dependent_care_married_or_single` | `[IRS 2026 limits]` |
| Election window if SPD unavailable | **Ask — no default**; treat as 30 days for the warning only, tagged | `[UNSOURCED]` |
| Federal supplemental withholding rate (22%) | Not in md_facts — IRS Pub 15 via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| Small-balance force-out threshold ($7,000, SECURE 2.0 §304) | Not in md_facts — IRS / plan SPD via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| State income-tax effect of a move | Computed by Withholding Check (Tax Planner) — no estimate here | — |

### Calculation method

1. **Annual total comp** (old and new, same formula): `base + bonus_target + rsu_grant_usd / rsu_vest_years + options_count / rsu_vest_years × max(0, share_fmv − option_strike) + espp_contrib_usd × espp_discount_pct / (100 − espp_discount_pct) + min(match_pct_of_pay, match_cap_pct)/100 × base + hsa_employer_usd − health_premium_annual_usd`. Options are valued at **intrinsic value** only (no Black-Scholes). Sign-on is shown on a separate "Year-1 only" line, never in the annual total.
2. `delta_usd = new_total − old_total`; `delta_pct = delta_usd / old_total × 100`.
3. **Deadlines** from dates: benefits election close = `start_date + benefits_election_window_days`; indirect-rollover redeposit = distribution date + 60 days; option exercise window = `separation_date` + plan post-termination period (**Ask**; grant agreement).
4. **Concentration** = `employer_stock_value_usd / net_worth_usd × 100`.
5. **Emergency fund months** = `emergency_fund_usd / essential_monthly_expenses_usd`; target set by Emergency Fund Assessment (Net Worth & Goals) — run it, don't override it.
6. **Sub-skill order** (fixed): Policy Comparison (health plans) → Disability Insurance Review → Beneficiary Audit → Contribution Optimizer → [old-401(k) decision] → Withholding Check → Cashflow Review → Emergency Fund Assessment.
7. **Bonus withholding gap** = `sign_on_usd × (marginal_rate_pct − supplemental_rate_pct) / 100` when marginal > supplemental; else 0.
8. Rounding: compute in cents; report whole dollars; percentages to one decimal.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Old 401(k) condition | Recommendation |
|---|---|---|
| 1 | `age_at_separation` ≥ 55 and `needs_access_before_59_5` | Leave in old plan (rule of 55 access) |
| 2 | `old_401k_balance_usd` < force-out threshold | Direct rollover now (plan may cash you out) — to new 401(k) if it accepts roll-ins, else Rollover IRA |
| 3 | `uses_backdoor_roth` and `new_plan_accepts_rollins` | Direct roll to new 401(k) (keeps pro-rata clean) |
| 4 | `uses_backdoor_roth` and not `new_plan_accepts_rollins` | Leave with old employer (a Rollover IRA would break the backdoor) |
| 5 | `new_plan_accepts_rollins` and `new_plan_fee_pct` < `old_plan_fee_pct` | Direct roll to new 401(k) |
| 6 | Otherwise | Direct rollover to a Rollover IRA |

Cash-out is never a recommendation from this table. Roth 401(k) dollars follow the same row into the Roth side (Roth IRA or new Roth 401(k)).

| # | Other flags | Action |
|---|---|---|
| 1 | Concentration > 10% | Flag concentration risk; route to Investing Advisor |
| 2 | `old_state` ≠ `new_state` | Withholding Check with both states before day 7 |
| 3 | Otherwise | No extra flag |

### Output template

```markdown
# Job Change Playbook — {separation_date} → {start_date}

## Total-comp comparison
| Component | Old | New | Δ |
|---|---|---|---|
| Base | | | |
| Bonus target | | | |
| RSU (annualized) | | | |
| Options (intrinsic, annualized) | | | |
| ESPP value | | | |
| 401(k) match | | | |
| HSA employer | | | |
| Health premium (−) | | | |
| **Annual total** | | | |
| Sign-on (year 1 only) | | | |

## Hard deadlines
| Deadline | Date | Source |
|---|---|---|

## Day-7 / Day-30 / Day-60 action list
| Window | Action | Deadline | Specialist |
|---|---|---|---|

## Old-401(k) recommendation
{rule # fired, reasoning; direct trustee-to-trustee only}

## Benefits-election decisions
{plan choice, contribution rates, beneficiaries}

## Equity calendar (next 12 months)
| Date | Grant | Event (vest / exercise deadline) | Shares | Est. value |
|---|---|---|---|---|
{or "Not applicable — no equity"}

## Withholding adjustment
{bonus withholding gap, W-4 action}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).