# Charitable Giving Strategy

description: Optimize the tax treatment of charitable gifts. Compares cash giving vs appreciated-securities vs Qualified Charitable Distributions (QCD) vs Donor-Advised Fund (DAF) "bunching" strategies given the user's income, AGI, itemize/standard posture, age, and giving target.

## When to use

- User regularly gives to charity and wants to maximize the tax benefit.
- User had a high-income year (RSU vesting, business sale, Roth conversion) and wants to offset.
- User is 70½+ (QCD eligible) and giving from an IRA.
- User has highly appreciated taxable holdings.

## Inputs needed

- Annual giving target ($) and recipient organizations (501(c)(3) status — public charity vs private foundation matters).
- Filing status, AGI estimate, current standard-vs-itemized posture.
- Taxable-account holdings with cost basis and holding period (>1 year matters).
- Age (for QCD eligibility — 70½+).
- Traditional IRA balance (for QCD).
- Whether the user already has or is open to a DAF (Fidelity / Schwab / Vanguard Charitable).

## Workflow

1. **Establish baseline.** Will the user itemize this year? If standard, cash gifts have no itemized-deduction benefit (check via `md_sources` whether a non-itemizer charitable deduction exists for the tax year) — the strategy needs to change.
2. **Appreciated-securities path.** For long-term-held positions with embedded gains, donating shares (not cash) avoids the cap-gains tax AND gives the FMV deduction (if itemizing). Deduction capped at 30% of AGI for public charities (vs 60% for cash). Cite tax year.
3. **Bunching via DAF.** If standard deduction usually wins, compute how many years of giving (2–5, per Determinism rules step 4) to "bunch" into one year via a DAF to clear the standard-deduction threshold once, then take standard in off-years. Models AGI cap and 5-year carryover.
4. **QCD path** (age 70½+). Direct IRA → charity transfer up to the annual QCD limit (indexed; `md_facts` → `rmd_and_qcd_2026.qcd_annual_limit_per_person`, cite the year) counts toward RMD and is excluded from AGI — better than itemizing for many retirees because it lowers AGI (helps with IRMAA, SS taxability, NIIT). Must be direct trustee-to-charity transfer.
5. **Stacking.** Often optimal: QCD for RMD-age users + appreciated securities for high-AGI years + DAF for bunching.
6. **Non-cash gotchas.** Anything > $500 needs Form 8283; > $5,000 may need a qualified appraisal; private foundations have lower AGI caps (20–30%).

## Required citations

- AGI caps cite tax year and IRS Pub 526.
- QCD age (70½) and annual limit cite year and SECURE 2.0.
- Standard deduction amount cites tax year.

## Deliverable shape

- Markdown report `./money-desk/tax-planner/charitable-giving-<YEAR>.md`:
  - **Strategy stack** — which giving vehicle for which dollars and why.
  - **Tax savings table** — federal + state savings under each path; cash-out-of-pocket equivalent.
  - **DAF bunching schedule** (if applicable) — years on vs years off.
  - **Action checklist** — open DAF / instruct trustee on QCD / select shares to gift.

## Notes

- QCDs must go DIRECTLY from IRA trustee to the charity — the user cannot take a distribution and then donate it.
- DAF contributions are irrevocable but grants are recommended by the donor over time.
- "Analysis only. Not professional tax/legal advice."

## Determinism rules

### Input keys

- `tax_year` — integer
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `agi_estimate_usd` — number
- `giving_target_usd` — number; dollars the user intends to give this year
- `recurring_annual_giving_usd` — number; typical yearly giving (for bunching); default = `giving_target_usd`
- `recipient_type` — `public_charity` | `private_foundation` | `mixed`
- `other_itemized_usd` — number; itemized deductions excluding charity (capped SALT + mortgage interest + medical over floor); default 0
- `age_years_decimal` — number (e.g. 71.2); QCD eligibility
- `traditional_ira_balance_usd` — number; default 0
- `rmd_remaining_usd` — number; RMD still to be taken this year; default 0
- `taxable_lots` — list of `{ ticker, fmv_usd, basis_usd, acquired_date (YYYY-MM-DD) }`
- `state_marginal_rate_pct` — number (e.g. 5.0); 0 for no-income-tax states
- `has_daf` — bool

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| AGI, giving target, filing status | **Ask — no default** | — |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` | `[IRS 2026 brackets]` |
| Ordinary and LTCG brackets — MFJ | `md_facts` → `income_tax_brackets_mfj_2026.brackets` / `ltcg_qualified_dividend_brackets_mfj` | `[IRS 2026 brackets]` |
| Ordinary and LTCG brackets — other statuses | Single: `.brackets_single`, `.ltcg_qualified_dividend_brackets_single`; HoH LTCG: `.ltcg_qualified_dividend_brackets_hoh` (all under `md_facts` → `income_tax_brackets_mfj_2026`); HoH / MFS ordinary: `.brackets_hoh` / `.brackets_mfs` | `[IRS 2026 brackets]` |
| NIIT threshold | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `niit_threshold_single`; rate 3.8% | `[IRS 2026 brackets]` |
| QCD annual limit | `md_facts` → `rmd_and_qcd_2026.qcd_annual_limit_per_person` | `[IRS 2026]` |
| Non-itemizer charitable deduction (if any exists for the tax year) | Not in md_facts — look up via `md_sources`; if not confirmed, treat as $0 | `[UNSOURCED]` |
| AGI caps | Cash 60%, appreciated LT property 30% (public charity); private foundation 30% cash / 20% property (IRS Pub 526) | — |
| State marginal rate | **Ask — no default** (0 for no-income-tax states) | `[USER-PROVIDED]` |
| Lot holding period | Long-term if `acquired_date` is more than 1 year before the gift date (Dec 31 of `tax_year` unless stated) | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Compute in cents; report whole dollars. `m_ord` = federal marginal ordinary rate at `agi_estimate_usd − deduction`; `m_ltcg` = LTCG rate at that taxable income; `niit = 3.8%` if AGI > NIIT threshold else 0; `s = state_marginal_rate_pct / 100`.

1. **QCD slice.** If `age_years_decimal ≥ 70.5` and `traditional_ira_balance_usd > 0` and the QCD limit is sourced: `qcd = min(giving_target_usd, qcd_limit, traditional_ira_balance_usd)`; else `qcd = 0`. QCD value = `qcd × (m_ord + s)` (excluded from AGI; no itemizing needed). `R = giving_target_usd − qcd`.
2. **Securities slice.** Eligible lots: long-term and `fmv_usd > basis_usd`. Sort by gain ratio `(fmv − basis) / fmv` descending → tie: larger `fmv_usd` → tie: ticker A–Z. Take whole lots in order while cumulative FMV ≤ `min(R, 30% × AGI)`; `stock = cumulative FMV`. Avoided gain tax = `Σ gain × (m_ltcg + niit + s)`. If `m_ltcg = 0` and `niit = 0` and `s = 0`, set `stock = 0`. `cash = R − stock`.
3. **This-year itemizing test.** `itemize_with_gift = other_itemized_usd + min(cash, 60% × AGI) + stock`. Deduction value = `(max(std, itemize_with_gift) − max(std, other_itemized_usd)) × (m_ord + s)`.
4. **Bunching test** (only if step 3 deduction value < `R × m_ord`, i.e. part of the gift is lost to the standard deduction). For `N` in 2, 3, 4, 5: `g = recurring_annual_giving_usd − qcd`; bunched year = `max(std, other_itemized_usd + min(N × g, 60% × AGI))`; each of `N − 1` off years = `max(std, other_itemized_usd)`; baseline = `N × max(std, other_itemized_usd + g)`. `benefit_N = (bunched + (N−1) × off − baseline) × m_ord`. `N* = argmax benefit_N` → tie: smaller N. Amounts over the AGI cap carry forward up to 5 years (list, do not value).
5. **Total savings per path** = QCD value + avoided gain tax + deduction value (step 3) or bunching benefit (step 4, per year = `benefit_N* / N*`).
6. **Paperwork flags:** non-cash gift > $500 → Form 8283; single item or similar items > $5,000 → qualified appraisal (Pub 526).

### Decision rules

Each slice of the target is assigned in order (rules 1–3 decide vehicles, rules 4–6 decide timing); evaluate rows top to bottom.

| # | Condition | Recommendation |
|---|---|---|
| 1 | AGI or giving target missing | No plan — ask |
| 2 | `qcd > 0` | QCD for `qcd` dollars via direct trustee-to-charity transfer (counts toward `rmd_remaining_usd`) |
| 3 | `stock > 0` | Give the selected long-term appreciated lots instead of cash for `stock` dollars |
| 4 | `itemize_with_gift > std` | Give directly this year (cash for the remainder); no bunching needed |
| 5 | `benefit_N* > 0` | Bunch `N*` years of giving into a DAF this year; standard deduction in the `N* − 1` off years |
| 6 | Otherwise | No federal deduction benefit beyond the QCD — give cash as planned; note any sourced non-itemizer deduction |

### Output template

```markdown
# Charitable Giving Strategy — {tax_year}

## Headline
Give **${giving_target_usd}** as: QCD ${qcd} · Shares ${stock} · Cash ${cash} via **{direct|DAF bunch N*}**. Estimated total tax saving **${total}** (decision rules #{list}).

## Strategy stack
| Slice | Vehicle | Amount | Why (rule #) |
|---|---|---|---|

## Tax savings table
| Path | Federal saving | State saving | Avoided gain tax | Net out-of-pocket per $ given |
|---|---|---|---|---|
| All cash, direct | | | | |
| Recommended stack | | | | |

## Shares to gift
{lot table: ticker, acquired, FMV, basis, gain, gain ratio — or "Not applicable — no eligible long-term appreciated lots"}

## DAF bunching schedule
{year-by-year on/off table for N* — or "Not applicable — rule #{n} fired"}

## Action checklist
- {open DAF / instruct IRA trustee on QCD / transfer lots / Form 8283 / appraisal}

## Assumptions & flags
- {QCD limit source, non-itemizer deduction status, [ASSUMPTION] items}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
