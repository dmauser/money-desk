# Withdrawal Strategy

description: Sequence retirement-account withdrawals (taxable, traditional, Roth) to minimize lifetime tax. Models Roth conversions in low-income years, RMDs, IRMAA cliffs, and ACA subsidies if applicable. Use as the user nears or enters retirement.

## When to use

- Within 5 years of retirement.
- Already retired and managing draws.
- Considering Roth conversions in a low-income window (early retirement, gap year, sabbatical).

## Inputs needed

- Account balances by type: taxable, traditional 401k/IRA, Roth, HSA, others.
- Cost basis in taxable (for capital-gains planning).
- Current age and ages 73 / 75 RMD start (per SECURE 2.0 — confirm working year rules).
- Expected annual spend in retirement and Social Security start age.
- Tax filing status and state.
- Healthcare plan (pre-65 ACA, 65+ Medicare; IRMAA brackets matter).

## Workflow

1. **Map the buckets.** Each account's tax treatment on withdrawal:
   - Taxable — capital gains on appreciation; basis returned tax-free.
   - Traditional — ordinary income on full withdrawal.
   - Roth — tax-free (if seasoning met).
   - HSA — tax-free for qualified medical, otherwise ordinary income (+ penalty before 65).
2. **Standard sequencing default (oversimplified):**
   1. Taxable first (lets tax-advantaged keep compounding tax-free).
   2. Traditional next.
   3. Roth last (lets it grow tax-free; passes to heirs efficiently).
   But this is rarely optimal — see step 3.
3. **Optimize by filling brackets, not draining one bucket at a time.**
   - Each year, fill the standard deduction + brackets up to the Decision-rules target bracket with traditional withdrawals (or Roth conversions) — these are essentially "free" or low-cost income.
   - Top up to spend target from taxable (LT gains taxed at 0% / 15% / 20%).
   - Roth as overflow / for big lumpy spends that would push into a higher bracket.
4. **Roth conversion windows.** Pre-Social-Security and pre-RMD years are often the lowest-income years of retirement. Converting traditional → Roth at low brackets reduces future RMDs and locks in low rates.
5. **RMD pressure.** Project traditional balance at RMD start. If RMDs will push the user into IRMAA / higher brackets, that's a strong case to convert now.
6. **Cliffs to avoid:**
   - IRMAA Medicare surcharge brackets (65+) — staying $1 below a bracket saves real money.
   - ACA subsidy cliff (pre-65) — converting too much can spike the user's marketplace premium.
   - NIIT 3.8% threshold (`md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_single` / `niit_threshold_mfj`).
   - SS taxability thresholds (up to 85% taxable above $34k single / $44k MFJ provisional income — IRC §86, statutory, not indexed).
7. **Year-by-year plan.** Recommend specific draws + conversions for the next 3–5 years; longer horizon as a directional plan.

## Required citations

- Every bracket / cliff cites the tax year explicitly.
- RMD age cites the applicable SECURE Act provision.
- IRMAA brackets cite Medicare.gov.

## Deliverable shape

- Markdown plan `./money-desk/retirement-planner/withdrawal-strategy-<YEAR>.md`:
  - **Year-by-year table** — gross income target, source breakdown (taxable cap-gains / traditional / Roth / SS), Roth conversion amount, projected MAGI, IRMAA risk flag, marginal bracket touched.
  - **Conversion plan** — total to convert and by when (before RMD start + before SS).
  - **Cliff calendar** — which years are most/least flexible.

## Notes

- Sequence is highly user-specific. Don't sell the simple "taxable → traditional → Roth" rule as gospel.
- Cost-basis tracking matters in taxable — specific-lot ID.
- "Analysis only. Not professional retirement or tax advice."

## Determinism rules

### Input keys

Keys map 1:1 to the `template.xlsx.json` named ranges where one exists (shown in brackets).

- `annual_spending_usd` — number, after-tax spend need, today's dollars [`annual_spending`]
- `withdrawal_years` — integer [`withdrawal_yrs`]
- `real_return_pct` — number [`real_return_rate`, as a fraction]
- `inflation_pct` — number [`inflation_rate`, as a fraction]
- `taxable_balance_usd` [`taxable_balance_start`], `taxable_cost_basis_usd` (→ `cost_basis_pct = basis / balance` [`cost_basis_pct`])
- `traditional_balance_usd` [`traditional_balance_start`], `roth_balance_usd` [`roth_balance_start`], `hsa_balance_usd`
- `effective_tax_rate_pct` — number, average federal + state rate on traditional withdrawals [`effective_tax_rate`]
- `ltcg_rate_pct` — number [`ltcg_rate`]
- `birth_year` — integer; `current_age` — integer; `retirement_age` — integer
- `ss_annual_usd` — number, today's dollars; `ss_claim_age` — integer
- `pension_annual_usd` — number
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`; `state` — two-letter code
- `aca_household_size` — integer (0 = not using ACA before 65)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Balances, spend, ages, filing status, state | **Ask — no default** | — |
| Real return | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_rate` × stock share + `.long_term_bond_real_return_rate` × bond share (fractions — × 100); if allocation unknown → **Ask** | `[ASSUMPTION]` |
| Inflation | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_rate` (× 100) | `[ASSUMPTION]` |
| Effective tax rate on traditional withdrawals | **Ask — no default** (or compute from `md_facts` brackets for the planned income) | — |
| Ordinary brackets, standard deduction, LTCG brackets, NIIT | `md_facts` → `income_tax_brackets_mfj_2026.brackets`, `.standard_deduction_*`, `.ltcg_qualified_dividend_brackets_mfj`, `.niit_threshold_mfj` / `.niit_threshold_single` (bracket tables are MFJ only; other statuses: `.brackets_single` / `.brackets_hoh` / `.brackets_mfs` and `.ltcg_qualified_dividend_brackets_single` / `_hoh` / `_mfs`) | `[IRS 2026 brackets]` |
| IRMAA tiers, lookback | `md_facts` → `medicare_2026.irmaa_brackets_mfj_part_b_total_monthly` / `_single_`, `.irmaa_lookback_years` | `[CMS Medicare 2026]` |
| ACA income ceiling (pre-65) | `md_facts` → `federal_poverty_level_2026_48_states.household_size_to_fpl` × the PTC eligibility ceiling (`aca_premium_tax_credit_eligibility_ceiling_post_2025_unless_extended` — verify current law via `md_sources`) | `[HHS FPL 2026]` |
| RMD age | Statutory by birth year (SECURE 2.0): 1951–1959 → 73; 1960+ → 75 | — |
| RMD divisors | `md_facts` → `rmd_and_qcd_2026.uniform_lifetime_table_distribution_period` (IRS Pub 590-B Table III; Joint Life table via `md_sources` when a spouse > 10 years younger is sole beneficiary) | `[IRS Pub 590-B]` |
| SS taxability | IRC §86 / IRS Pub 915 worksheet (statutory thresholds, not indexed) | — |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Real dollars, annual compounding, end-of-year growth; bracket and IRMAA thresholds held at today's values (assumed to index with inflation).

1. **Template headline metrics** (same formulas as `template.xlsx.json`): `starting_total = taxable + traditional + roth`; `initial_wr_pct = annual_spending / starting_total × 100`; gross-ups: traditional `= spend / (1 − effective_tax_rate)`, taxable `= spend / (1 − ltcg_rate × (1 − cost_basis_pct))`, Roth `= spend`.
2. **Funding check (real):** `PV_real = spend × (1 − (1 + r)^−n) / r` (`r` = real return, `n = withdrawal_years`; if `r = 0`, `spend × n`); surplus = `starting_total − PV_real`. The template's Summary!B6 computes the same real present value.
3. **Yearly loop** for each of the next 5 years (then every 5th year to `withdrawal_years` as directional):
   1. Fixed income: SS (if age ≥ `ss_claim_age`; taxable portion per Pub 915), pension, RMD (if age ≥ RMD age).
   2. **Ordinary room** = (top of the Decision-rules target bracket + standard deduction) − fixed ordinary income; then reduce so that MAGI ≤ every binding ceiling: ACA ceiling (age < 65 and `aca_household_size > 0`), the current IRMAA tier ceiling (age ≥ 63), NIIT threshold.
   3. Traditional withdrawal for spending = `min(room, traditional balance, spend gap after fixed income ÷ (1 − effective_tax_rate))`.
   4. Roth conversion = remaining room (≥ 0), capped at the traditional balance.
   5. Remaining after-tax spend gap → taxable (gain realized = sale × (1 − cost_basis_pct); LTCG at the md_facts rate for that taxable income), then Roth, then HSA for qualified medical only.
   6. Grow each bucket: `bal × (1 + r)`.
4. **RMD pressure:** project the traditional balance to RMD age with no conversions; first RMD = balance ÷ divisor (sourced). Report the marginal rate that first RMD would land in.
5. Rounding: cents internally; whole dollars; rates to two decimals.

### Decision rules

**A. Withdrawal-rate status** (template Summary!D5) — first match wins.

| # | Condition | Status |
|---|---|---|
| 1 | `initial_wr_pct ≤ 3.5` | OK |
| 2 | `initial_wr_pct ≤ 4.0` | At 4% rule — monitor |
| 3 | Otherwise | Above 4% — higher risk; route to Safe-Withdrawal Stress Test |

**B. Conversion target bracket** — first match wins.

| # | Condition | Fill ordinary income to the top of… |
|---|---|---|
| 1 | Age ≥ RMD age | No voluntary conversion beyond the RMD |
| 2 | Projected first-RMD marginal rate (step 4) ≤ current-year marginal rate before conversions | No conversion |
| 3 | Otherwise | The highest bracket whose rate is strictly below the projected first-RMD marginal rate (lowest bracket → standard deduction only) |

Sequencing is always: fixed income → bracket-filling traditional (+ conversion) → taxable → Roth → HSA (medical). The template's "Draw first after bracket-filling" cell (Summary!B12) follows the same order: Taxable, then Traditional, with Roth last.

### Output template

```markdown
# Withdrawal Strategy — {plan_year}

## Headline
Initial withdrawal rate **{initial_wr}%** ({rule A status}). Funding check: **${surplus}** {surplus/shortfall} vs PV of real spending. Convert **${conv_yr1}** this year (fill to top of the {rate}% bracket).

## Inputs and sources
| Input | Value | Tag |
|---|---|---|

## Tax-aware gross-up
| Source | Gross withdrawal for ${spend} after tax |
|---|---|
| Traditional | |
| Taxable (LTCG) | |
| Roth | |

## Year-by-year plan (today's $)
| Year | Age | SS / pension | RMD | Trad withdrawal | Roth conversion | Taxable sale (gain) | Roth withdrawal | MAGI | Marginal bracket | IRMAA tier / ACA flag |
|---|---|---|---|---|---|---|---|---|---|---|

## Conversion plan
{total to convert and by when — or "Not applicable — rule B2"}

## Cliff calendar
| Cliff | Threshold (source) | Years at risk |
|---|---|---|

## RMD pressure
{projected traditional balance at RMD age, first RMD, bracket}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
