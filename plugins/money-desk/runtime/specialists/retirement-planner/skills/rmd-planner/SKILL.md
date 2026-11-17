# RMD Planner

description: Plan Required Minimum Distributions from tax-deferred accounts at and after the RMD age (currently 73 per SECURE 2.0; 75 for those born 1960+). Projects RMDs forward, surfaces tax-bracket and IRMAA impact, models pre-RMD Roth conversions, and evaluates QCDs as an RMD-satisfying strategy.

## When to use

- User is within ~10 years of RMD age (planning window for Roth conversions).
- User is at RMD age and needs to calculate this year's RMD.
- User is approaching RMDs with large traditional balances (RMD pressure on tax bracket).
- User wants to evaluate QCD to satisfy part/all of RMD.

## Inputs needed

- Date of birth (determines RMD age: 73 for born 1951–1959, 75 for born 1960+).
- Account balances as of Dec 31 prior year for each tax-deferred account (Traditional IRA, Rollover IRA, SEP, SIMPLE, 401(k) if separated).
- Marital status and spouse's age (>10y younger spouse uses different table).
- Other income sources, filing status.
- Roth IRA balance and Roth conversion history.
- Charitable giving target (for QCD).

## Workflow

1. **Compute current-year RMD.**
   - Per-account (prior-year 12/31 balance) ÷ (IRS Uniform Lifetime Table divisor at age).
   - Traditional IRAs can be aggregated and taken from any one IRA; 401(k)s cannot be aggregated and must be taken from each plan separately.
   - Roth IRAs have NO RMD for the original owner.
   - Cite the table used.
2. **Project 10-year RMD path.** Grow the remaining balance at the projection real return from **Determinism rules** (user-provided, else the md_facts allocation blend); compute RMD each year. Add to other income; show projected marginal bracket and IRMAA tier each year.
3. **Identify the squeeze.** Are projected RMDs going to push the user into a higher bracket or IRMAA tier than today? That's the case for action.
4. **Roth conversion sizing.** Recommend annual conversion amount in pre-RMD years to "level" the tax-bracket trajectory: e.g. fill the 22% or 24% bracket today rather than 32%+ later — target bracket per Decision rules B.
5. **QCD overlay** (age 70½+). QCDs up to the annual cap (cite year) count toward RMD AND reduce AGI — uniquely valuable for IRMAA-sensitive retirees. The cap is indexed annually: `md_facts` → `rmd_and_qcd_2026.qcd_annual_limit_per_person` (cite the year).
6. **First-year timing rule.** First RMD can be deferred to April 1 of the following year — but doing so creates TWO RMDs in that year. Almost always better to take in the first year.
7. **Penalty awareness.** Missed RMD = 25% excise tax (10% if corrected within 2 years per SECURE 2.0). Process: take the missed amount NOW, file Form 5329 with waiver request explaining reasonable cause.

## Required citations

- RMD age cites SECURE 2.0 by birth-year.
- Divisor cites the Uniform Lifetime Table (or Joint Life if spouse >10y younger).
- QCD limit cites the tax year.
- IRMAA brackets cite the Medicare year (2-year lookback applies).

## Deliverable shape

- Markdown plan `./money-desk/retirement-planner/rmd-planner-<YEAR>.md`:
  - This year's RMD per account + aggregation rules.
  - 10-year projection table: RMD $, total income, marginal bracket, IRMAA tier.
  - Conversion recommendation table (year-by-year $).
  - QCD recommendation (if 70½+).
  - First-year deferral analysis (if applicable).

## Notes

- 401(k) "still-working" exception: if user is still working at the sponsoring employer and is NOT a >5% owner, they can defer RMDs on that 401(k) only.
- Inherited IRA rules differ (10-year rule, EDBs) — outside this skill; flag for separate review.
- "Analysis only. Not professional retirement or tax advice."

## Determinism rules

### Input keys

- `birth_date` — `YYYY-MM-DD`
- `accounts` — list of `{ name, type, prior_year_end_balance_usd, still_working_exception? }`; `type` ∈ `traditional_ira` | `rollover_ira` | `sep_ira` | `simple_ira` | `401k` | `403b` | `457b` | `roth_ira` | `roth_401k`
- `spouse_birth_date` — `YYYY-MM-DD` or null
- `spouse_sole_beneficiary` — boolean
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `other_taxable_income_usd` — number, annual ordinary income excluding RMDs and SS (pension, wages, interest, non-qualified dividends), today's dollars
- `ss_annual_usd` — number, annual Social Security benefit, today's dollars
- `stock_pct` — number, equity share of the tax-deferred accounts
- `projection_real_return_pct` — number, optional
- `charitable_giving_annual_usd` — number
- `first_rmd_taken` — boolean
- `plan_year` — integer (defaults to the current calendar year)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Birth date, balances | **Ask — no default** | — |
| RMD age | Statutory by birth year (SECURE 2.0 §107): born 1951–1959 → 73; born 1960+ → 75; born before 1951 → already in RMD status | — |
| Uniform Lifetime Table divisors (and Joint Life Table if spouse is sole beneficiary and > 10 years younger) | `md_facts` → `rmd_and_qcd_2026.uniform_lifetime_table_distribution_period` (IRS Pub 590-B Table III; Joint Life table via `md_sources` when a spouse > 10 years younger is sole beneficiary) | `[IRS Pub 590-B]` |
| QCD annual limit (indexed) | `md_facts` → `rmd_and_qcd_2026.qcd_annual_limit_per_person` | `[IRS 2026]` |
| Ordinary brackets, standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.brackets`, `.standard_deduction_mfj` / `.standard_deduction_single` / `.standard_deduction_hoh`, `.additional_standard_deduction_age_65_or_blind_*` (Single: `.brackets_single`; HoH / MFS ordinary brackets not in md_facts — `md_sources`, else `[UNSOURCED]`) | `[IRS 2026 brackets]` |
| IRMAA tiers | `md_facts` → `medicare_2026.irmaa_brackets_mfj_part_b_total_monthly` / `irmaa_brackets_single_part_b_total_monthly`, `medicare_2026.irmaa_lookback_years` | `[CMS Medicare 2026]` |
| Projection real return | `projection_real_return_pct`; else `stock_pct × equity + (100 − stock_pct) × bond` using `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` / `long_term_bond_real_return_percent` (fractions — × 100); if `stock_pct` missing → **Ask** | `[ASSUMPTION]` |
| Bracket / IRMAA indexing | Thresholds held at today's values in a real-dollar projection (i.e. they rise with inflation) | `[ASSUMPTION]` |
| Taxable portion of SS | IRS Pub 915 worksheet (IRC §86 thresholds are statutory, not indexed) | — |

### Calculation method

1. **RMD start.** `rmd_age` from birth year; first RMD year = year the user reaches `rmd_age`. Roth IRAs and Roth 401(k)s: no lifetime RMD. A 401(k)/403(b) with `still_working_exception = true` is excluded until separation.
2. **This year's RMD** per account: `RMD = prior_year_end_balance ÷ divisor(age attained this year)`. IRAs (traditional/rollover/SEP/SIMPLE) are summed and may be taken from any IRA; each 401(k)/403(b) is computed and taken separately; 403(b)s may be aggregated with each other.
3. **10-year projection** (`plan_year` … `plan_year + 9`), real dollars, annual compounding, end-of-year withdrawals: `bal_y = bal_{y−1} × (1 + r) − RMD_y − conversion_y` (QCDs are part of `RMD_y`, not extra). RMD_y = 0 before the first RMD year.
4. **Annual tax picture:** `AGI = other_taxable_income + taxable SS + (RMD_y − QCD_y) + conversion_y`; `taxable income = AGI − standard deduction (incl. age-65 add-on)`; marginal bracket from md_facts; MAGI for IRMAA = AGI + tax-exempt interest; IRMAA tier for premiums in year `y + irmaa_lookback_years`.
5. **Conversion sizing** (pre-RMD years only): `target_rate` per Decision rules B; `conversion_y = max(0, top of target bracket − taxable income before conversion)`, then reduced so MAGI stays ≤ the current IRMAA tier ceiling for any year in which the user is ≥ 63 (2-year lookback), and capped at the remaining traditional balance. Single pass — do not iterate after re-projecting.
6. **QCD** (age ≥ 70½ in the year): `QCD_y = min(charitable_giving_annual_usd, QCD limit)`; QCD counts toward that year's RMD and is excluded from AGI. Only from IRAs (not 401(k)s).
7. **First-year deferral:** compute total federal tax for (first RMD year + next year) under (a) take first RMD in year 1 and (b) defer to April 1 of year 2 (two RMDs in year 2). Choose the lower; tie → (a).
8. Rounding: cents internally; whole dollars; divisors to one decimal as published.

### Decision rules

**A. Plan headline** — first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Divisor table not retrieved | RMD shown as `[UNSOURCED]` estimate; verify before withdrawing |
| 2 | User is past first RMD year and an RMD was missed | Take the missed amount now; file Form 5329 with waiver request |
| 3 | Pre-RMD and projected first-RMD-year marginal rate > current marginal rate | Convert per rule B each pre-RMD year |
| 4 | Projected RMDs push MAGI into a higher IRMAA tier than today | Flag IRMAA; QCDs (if 70½+ and giving > 0) before conversions |
| 5 | Otherwise | Take RMDs as scheduled; no conversions |

**B. Conversion target bracket** — fill to the top of the highest ordinary bracket whose rate is strictly below the projected marginal rate in the first RMD year with no conversions (if that projected rate is the lowest bracket, fill only the standard deduction). If the target rate ≤ the current year's marginal rate, convert $0 that year.

### Output template

```markdown
# RMD Plan — {plan_year}

## Headline
RMD age **{rmd_age}** (first RMD year {year}). This year's RMD: **${total_rmd}**. Recommendation: **{rule A#}**.

## This year's RMD
| Account | Type | 12/31 balance | Divisor (table, source) | RMD | Aggregation rule |
|---|---|---|---|---|---|

## 10-year projection (today's $)
| Year | Age | Trad balance (start) | RMD | QCD | Conversion | AGI | Taxable income | Marginal bracket | IRMAA tier (premium year) |
|---|---|---|---|---|---|---|---|---|---|

## Conversion plan
{year-by-year $ — or "Not applicable — rule B gives $0"}

## QCD recommendation
{amount, limit source — or "Not applicable — under 70½ or no charitable giving"}

## First-year deferral analysis
{(a) vs (b) tax — or "Not applicable — first RMD year already passed"}

## Sources
{Uniform Lifetime Table, QCD limit, brackets, IRMAA}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).