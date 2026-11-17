# Inheritance Playbook

description: 0-to-9-month runbook for receiving an inheritance. The first rule is "do nothing fast" — the worst money decisions in personal finance are made in the first 30 days after sudden wealth. Sequences the estate-elections (9-month window for disclaimers), tax-aware liquidation, beneficiary type (inherited IRA 10-year rule), debt paydown, and integration into long-term plan.

## When to use

- User just received an inheritance (any size, any asset type).
- Inheritance is imminent (parent or relative in late-stage illness, prudent pre-planning).
- Lump-sum life insurance benefit received as beneficiary.

## Inputs needed

- Decedent date of death (drives basis step-up + 9-month disclaimer window).
- Relationship (spouse vs non-spouse changes EVERYTHING for inherited IRAs).
- Inheritance composition: cash, taxable brokerage, retirement (Traditional vs Roth), real estate, business interest, life insurance, collectibles.
- Approximate $ amount per category.
- User's existing financial position (income, NW, debt, retirement readiness).
- Whether estate has been probated / executor named.
- State of decedent + state of beneficiary (state inheritance/estate tax — only a handful of states levy an inheritance tax; verify the current list with the state DOR).

## Workflow (sub-skill orchestration)

### Days 0–30 — DO NOTHING FAST

The single most important rule. Park cash in a HYSA / money market / treasury MMF. Resist the urge to spend, gift, invest, or quit your job. Most blowups happen here.

1. **Establish the "do nothing" parking spot** — recommend a HYSA at a separate institution from existing accounts (psychological separation). High-yield + FDIC.
2. **Assemble the team:**
   - Estate attorney (decedent's, if usable; else hire one).
   - CPA familiar with estate / fiduciary tax (1041 vs 1040).
   - Fee-only fiduciary CFP if NW now > $1M.
3. **Inventory what was actually received** vs what's promised vs what's still in probate. Don't count chickens.

### Days 30–90 — Tax & estate elections

4. **Cost-basis step-up.** Most inherited assets get a step-up to date-of-death FMV. For taxable brokerage, REQUEST the basis adjustment from the broker in writing. For real estate, get a date-of-death appraisal (preferably formal — supports basis if ever audited).
5. **Inherited IRA rules** (the big one — non-spouses):
   - SECURE Act 10-year rule: account must be FULLY distributed by Dec 31 of the 10th year after death. RMDs required in years 1–9 if decedent was past RBD.
   - Spouse can roll into own IRA (treat as own) — best option for spouses.
   - Eligible designated beneficiary (EDB) — spouse, minor child, disabled, chronically ill, sibling within 10 years — gets lifetime stretch.
   - Plan the 10-year distribution schedule to LEVEL taxable income (don't bunch in year 10).
6. **Inherited Roth IRA** — also 10-year rule but distributions are tax-free; usually best to let it grow 9 years then take all in year 10.
7. **Disclaimer election** — within **9 months of death**, beneficiary can disclaim ALL or part. Inheritance passes per the will/beneficiary form. Useful when: beneficiary doesn't need money, wants it to skip a generation, or has estate-tax-exposure issues. Once 9 months passes, gone forever.
8. **State estate / inheritance tax** — check both decedent and beneficiary states. PA, NJ, KY, MD, NE have inheritance tax (paid by beneficiary; rates vary by relationship class). Iowa's was fully repealed for deaths on or after Jan 1, 2025 — confirm any state's status with its department of revenue.

### Days 90–180 — Integration

9. **Re-run Net Worth Snapshot** — `md_nw_skill_net_worth_snapshot` with the new assets.
10. **Re-run Retirement Projection** — `md_rp_skill_retirement_projection`. Did you just fast-forward retirement by N years?
11. **Investment Policy Statement update** — `md_iv_skill_investment_policy_statement`. New money requires new IPS, not seat-of-pants investing.
12. **Asset Location Review** — `md_iv_skill_asset_location_review` if the share of taxable / tax-deferred / Roth shifted by ≥ 10 percentage points.
13. **Tax-loss harvest opportunities in inherited brokerage** — `md_tx_skill_tax_loss_harvest_review`. Stepped-up basis means low-gain positions; consider rebalancing immediately while drift is low.
14. **Debt paydown decision** — high-rate debt (CC, personal loan) almost always wins. Mortgage < 5% — keep it and invest; 5–7% — either, user preference; > 7% — paydown wins.
15. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment`. May now be able to fund 9–12 months effortlessly.

### Days 180–270 — Wealth-management upgrades

16. **Estate Basics Checklist** — `md_el_skill_basics_checklist`. NW jumped → revisit your own estate plan (your kids, charity, etc.).
17. **Gifting Strategy** — `md_el_skill_gifting_strategy` if NW is now ≥ 50% of the federal estate exemption (`md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual`).
18. **Charitable Giving Strategy** — `md_tx_skill_charitable_giving_strategy` (DAF, QCD if 70½+) to absorb taxable distributions efficiently.
19. **Insurance Coverage Gap Audit** — `md_pc_skill_umbrella_sizing`. Bigger NW → umbrella policy now matters (≥ NW).

## Hard-deadline checklist

- ⚠️ **9 months from death**: disclaimer election window closes — irrevocable.
- ⚠️ **9 months from death**: Form 706 (estate tax return) filing if estate > exemption.
- ⚠️ **Dec 31 of the year after death**: first inherited-IRA RMD if decedent was past RBD.
- ⚠️ **Dec 31 of the 10th year after death**: inherited IRA must be fully distributed.

## Required citations

- 10-year rule cites SECURE Act / SECURE 2.0.
- Basis step-up cites IRC §1014.
- Disclaimer rules cite IRC §2518.
- State inheritance tax cites state department of revenue.

## Deliverable shape

- Markdown playbook `./money-desk/life-events/inheritance-<DATE>.md`:
  - **Inventory** (asset type / value / cost basis / account type / tax treatment).
  - **30-day rules** (what NOT to do, where money sits).
  - **9-month decisions** (disclaimers, basis docs, IRA elections).
  - **10-year IRA distribution schedule** (year-by-year $).
  - **Integration plan** (debt, retirement re-projection, IPS update).
  - **Specialist hand-offs.**

## Notes

- The 10-year rule is a MAJOR tax-planning lever — don't default to "wait until year 10."
- Co-mingle nothing in 0–30: keep inherited money in a separate account until you know what you want to do.
- Beware of unsolicited "advisors" who appear after inheritances — fee-only fiduciary only.
- "Analysis only. Inheritance is one of the most legal- and tax-complex events in personal finance. CPA + estate attorney + fee-only CFP, in that order."

## Determinism rules

### Input keys

- `date_of_death` — `YYYY-MM-DD`
- `today` — `YYYY-MM-DD` (date of this run)
- `relationship` — `spouse` | `minor_child` | `disabled` | `chronically_ill` | `not_more_than_10_years_younger` | `other_individual` | `estate_or_trust`
- `decedent_past_rbd` — boolean (decedent had reached their required beginning date)
- `assets` — list of `{ category: cash | taxable_brokerage | traditional_ira_or_401k | roth_ira_or_401k | real_estate | business | life_insurance | collectibles, value_usd, cost_basis_usd?, received (bool) }`
- `beneficiary_age` — integer
- `beneficiary_marginal_rate_pct` — number (e.g. 24)
- `beneficiary_net_worth_usd` — number, BEFORE the inheritance
- `debts` — list of `{ name, balance_usd, apr_pct }`
- `probate_status` — `not_started` | `in_progress` | `closed`
- `decedent_state`, `beneficiary_state` — two-letter codes
- `needs_the_money` — boolean (beneficiary has an expense the inheritance must cover within 12 months)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Date of death, relationship, asset list | **Ask — no default** | — |
| Date-of-death value / stepped-up basis | Custodian date-of-death valuation or formal appraisal; **Ask — no default** | — |
| Federal estate exemption | `md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual` (read its `_notes` re: sunset/legislation) | `[IRS Estate 2026]` |
| Annual gift exclusion | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` | `[IRS Estate 2026]` |
| Inherited-IRA growth for the 10-year schedule | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_rate` (fraction; 0.06 = 6%) | `[ASSUMPTION]` |
| RMD life-expectancy divisor (decedent past RBD) | Not in md_facts — IRS Pub 590-B Single Life Table via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| State inheritance / estate tax rates | Not in md_facts — state department of revenue via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |

### Calculation method

1. **Deadlines** from `date_of_death`: disclaimer + Form 706 due = date_of_death + 9 months; first inherited-IRA RMD = Dec 31 of the year after death (if `decedent_past_rbd`); 10-year deadline = Dec 31 of (death year + 10). Show days remaining from `today` for each.
2. **Phase** = by days since death: 0–30 → Phase 1; 31–90 → Phase 2; 91–180 → Phase 3; 181–270 → Phase 4; > 270 → Phase 4 plus "disclaimer window closed" note. Present all phases; mark the current one.
3. **Inventory** — one row per asset; `received = false` rows are excluded from every total and marked "promised / in probate".
4. **10-year schedule** (traditional inherited IRA under the 10-year rule): for year k = 1…10, `withdrawal_k = max(RMD_k, balance_start_k / (11 − k))`, where `RMD_k` applies only if `decedent_past_rbd` (else 0); grow the remainder at the md_facts real return; year 10 empties the account. This equal-fraction method is the fixed default.
5. **Inherited Roth** under the 10-year rule: $0 in years 1–9 and full balance in year 10, unless the Decision rules say otherwise.
6. **Sub-skills in this fixed order** (by phase): Phase 3 → Net Worth Snapshot → Retirement Projection → Investment Policy Statement → Asset Location Review (only if rule fires) → Tax-Loss Harvest Review → Emergency Fund Assessment. Phase 4 → Basics Checklist → Gifting Strategy (only if rule fires) → Charitable Giving Strategy → Coverage Gap Audit.
7. **Debt order**: sort `debts` by `apr_pct` descending; apply the debt rules below to each.
8. Rounding: compute in cents; report whole dollars; dates as `YYYY-MM-DD`.

### Decision rules

Evaluate top to bottom; first match wins within each table.

| # | Inherited traditional IRA / 401(k) | Recommendation |
|---|---|---|
| 1 | `relationship = spouse` and `beneficiary_age` < 59½ and `needs_the_money` | Keep as inherited IRA (penalty-free access); revisit at 59½ |
| 2 | `relationship = spouse` | Treat as own / roll to own IRA |
| 3 | `relationship` ∈ {minor_child, disabled, chronically_ill, not_more_than_10_years_younger} | Eligible designated beneficiary — life-expectancy stretch (minor child: until majority, then 10-year rule) |
| 4 | `relationship = estate_or_trust` | Route to estate attorney — payout depends on trust terms |
| 5 | Otherwise | 10-year rule, equal-fraction schedule (step 4) |

| # | Immediate posture | Recommendation |
|---|---|---|
| 1 | Days since death ≤ 30 | Park all cash in an FDIC-insured HYSA / Treasury MMF; no other moves |
| 2 | `today` < disclaimer deadline and (`needs_the_money = false` or estate value ≥ `lifetime_exemption_per_individual`) | Evaluate a qualified disclaimer with the estate attorney before accepting any asset |
| 3 | Otherwise | Proceed with the current phase's sub-skills |

| # | Each debt (evaluate per debt) | Recommendation |
|---|---|---|
| 1 | `apr_pct` > 7 | Pay off from inheritance |
| 2 | `apr_pct` ≥ 5 and ≤ 7 | Either — user preference; show both |
| 3 | Otherwise (`apr_pct` < 5) | Keep the debt; invest |

| # | Extra hand-offs (evaluate each row independently; "Otherwise" if none fire) | Recommendation |
|---|---|---|
| 1 | `beneficiary_net_worth_usd` + inheritance ≥ 50% of `lifetime_exemption_per_individual` | Gifting Strategy (Estate & Legacy) |
| 2 | Share of taxable / tax-deferred / Roth shifted by ≥ 10 percentage points | Asset Location Review (Investing Advisor) |
| 3 | `beneficiary_net_worth_usd` + inheritance > $1,000,000 | Fee-only fiduciary CFP; umbrella liability ≥ net worth |
| 4 | Otherwise | No extra hand-offs |

### Output template

```markdown
# Inheritance Playbook — death {date_of_death}, run {today}

## Hard deadlines
| Deadline | Date | Days remaining | Status |
|---|---|---|---|
| Disclaimer (IRC §2518) | | | |
| Form 706 (if estate > exemption) | | | |
| First inherited-IRA RMD | | | {or "Not applicable — decedent not past RBD"} |
| 10-year full distribution | | | |

## Inventory
| Asset | Category | Value | Cost basis (stepped-up) | Received? | Tax treatment |
|---|---|---|---|---|---|

## Current phase: {1–4}
{what NOT to do, where money sits}

## 9-month decisions
{disclaimer, basis documentation, IRA election — rule # fired}

## 10-year IRA distribution schedule
| Year | Start balance | Withdrawal | Est. tax at {marginal}% |
|---|---|---|---|
{or "Not applicable — no inherited retirement accounts"}

## Integration plan
| Debt | APR | Decision (rule #) |
|---|---|---|

## State inheritance / estate tax
{decedent and beneficiary states, source — or "Not applicable — neither state levies one"}

## Specialist hand-offs
| Order | Skill (Specialist) | Why |
|---|---|---|
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
