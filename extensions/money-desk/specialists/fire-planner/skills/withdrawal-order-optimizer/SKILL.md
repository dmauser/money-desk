## Withdrawal Order Optimizer

description: Sequence the drawdown of taxable / Traditional / Roth / HSA buckets to maximize after-tax sustainable spend across the FIRE horizon. NOT the traditional "brokerage → Trad → Roth" default — early FIRE'd households can fill low brackets with Roth conversions, capture 0% LTCG, and stretch the portfolio meaningfully (often +0.5%/yr sustainable WR). Binding constraints: ACA-MAGI pre-65, IRMAA post-65, Bengen failure horizons, RMD pressure starting at 73. Output: sequenced plan, the lever (MAGI / bracket-filling / RMD smoothing), the explicit handoff to Tax Planner for execution.

## When to use

- "What order should I withdraw from my accounts?"
- "Should I convert Traditional → Roth in early retirement?"
- "I want to fill the 12% bracket every year — what does that look like?"
- After **FIRE Number Calculator** and **Safe-Withdrawal Stress Test**
- Anyone post-FIRE with multiple tax buckets — the optimization is meaningful

## Inputs needed

- **Current age, FIRE age, planning-to age**.
- **Portfolio by bucket:** taxable (with cost basis), Trad 401(k)+IRA, Roth 401(k)+IRA (separate contributions vs earnings), HSA, cash.
- **Target annual spend (post-tax, today's $)**.
- **Spouse income post-FIRE** (any) — affects bracket-filling room.
- **Other income** (pension / real estate / SS at claim age).
- **ACA-MAGI ceiling** from **Pre-65 Healthcare Plan**.
- **Filing status** post-FIRE (single / MFJ / etc.).
- **State** — determines additional state-tax interaction with conversions / realizations.
- **Roth contributions accessible** (always penalty-free) vs Roth earnings (5y + 59.5).

## The mental model

There are FOUR independent levers:

1. **Bucket order** — which account funds the year's spend.
2. **Roth conversions** — voluntarily moving Trad → Roth at the year's marginal rate.
3. **Realized gains in taxable** — sell appreciated lots (0% LTCG bracket is a real opportunity).
4. **ACA-MAGI / IRMAA ceiling** — limits #2 and #3.

The "right" answer integrates all four. The naive "brokerage → Trad → Roth" default is usually wrong for early FIRE — it leaves the early low-income years' bracket-filling opportunity un-captured AND faces a giant Trad balance + RMD pressure at 73.

## Workflow

1. **Compute the early-FIRE bracket room.** With no W-2, the standard deduction + 10% + 12% brackets are large — for MFJ, income up to `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` plus the top of the 12% bracket in `.brackets` is taxed at ≤ 12% federal, and qualified gains are taxed at 0% up to `.ltcg_qualified_dividend_brackets_mfj[0].max` of taxable income. This is the gift.
2. **Constrain by ACA-MAGI ceiling.** Conversions and realized gains both push MAGI up. The user's pre-65 healthcare plan sets the MAGI ceiling. Conversion + realization total must fit under it (or accept higher healthcare cost as the trade-off — explicitly).
3. **Sequence the years:**
   - **Years 1 to (59.5−FIRE age):** the bridge period. Spend from taxable + Roth contributions; do Roth conversions up to the MAGI ceiling AND the target-bracket ceiling (Decision rules B).
   - **Years (59.5) to RMD age (73, or 75 if born 1960+):** full account access. Continue conversion strategy if RMDs ahead loom large; otherwise default to lowest-tax bucket.
   - **RMD age+:** RMDs force Trad withdrawals. Less optimization room. Pre-emptive conversions between 59.5 and RMD age are the lever to reduce RMD-driven over-withdrawal.
4. **Surface the RMD pressure point.** Project Trad balance at RMD age. If RMDs will exceed actual spend need, the user is being forced to take ordinary income they don't want — convert more, earlier.
5. **Layer HSA.** Reimburse against accumulated qualified medical receipts tax-free at any age. Roth-equivalent in retirement.
6. **Surface state-tax interaction.** Some states tax retirement income, some don't. Some tax Roth conversions at ordinary rates. State move pre-FIRE has multi-year tax implications.
7. **Output: year-by-year sequenced plan** with annual conversion target, annual realized-gain budget, and bucket pulls.
8. **Hand off execution to Tax Planner.** Year-by-year tax filing, conversion timing within the year, and CPA referral.

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Naive brokerage → Trad → Roth default** — leaves the early-retirement low-bracket opportunity un-captured.
- **All-Roth-first** — wastes the low-bracket conversion years; user ends up over-paying tax in late life on RMDs.
- **Ignoring ACA-MAGI when planning conversions** — converting $50k can cost $10–15k in lost subsidies. The conversion ISN'T free.
- **Over-converting** — if marginal conversion rate ≥ projected withdrawal rate, conversion adds zero or negative value.
- **Ignoring state-tax move opportunity** — moving from CA (13.3% top) to TX (0%) pre-conversion saves real money.
- **Counting Social Security at 100%** when modeling — show both 100% and 75% scenarios.

## Citations / sources

- **IRC §401(a)(9)** — RMD rules.
- **IRC §1(h)** — LTCG / qualified dividends bracket structure.
- **IRC §36B** — ACA premium tax credit (MAGI definition).
- 2026 brackets, LTCG thresholds, IRMAA brackets → `md_facts` (cite [IRS 2026 brackets], [CMS Medicare 2026]). RMD divisors → `md_facts` → `rmd_and_qcd_2026.uniform_lifetime_table_distribution_period` (cite [IRS Pub 590-B]).
- Kitces / White Coat Investor / Bogleheads literature on withdrawal sequencing.

## Disclaimer

Withdrawal-order optimization is a year-by-year tax problem, not a one-time plan. Tax law changes (cf. Secure Act, Secure 2.0); ACA / IRMAA brackets change annually. Re-run this skill annually and any year MAGI / income / state changes materially. Execute with a CPA who has explicit FIRE / early-retirement experience.

## Next step

**Next step → Tax Planner:** "Build year-by-year tax model: {N}-year horizon, ${C}/yr Trad→Roth conversion, ${D}/yr realized LTCG, MAGI ceiling ${M}, filing {status}, state {ST}, target spend ${X}/yr."

## Determinism rules

### Input keys

Names match the `md_fi_skill_withdrawal_order_optimizer` intake schema; extra keys follow.

- `current_age`, `fire_age`, `planning_to_age` — integers
- `target_spend_post_tax` — number, $ per year, today's dollars
- `taxable_balance`, `taxable_cost_basis`, `trad_balance`, `roth_contributions`, `roth_earnings`, `hsa_balance`, `cash_balance` — numbers, $
- `aca_magi_ceiling` — number, $ per year (0 = not using ACA)
- `irmaa_ceiling` — number, $ per year (0 = use the md_facts tier-1 ceiling)
- `spouse_income_post_fire`, `other_income_post_fire` — numbers, $ per year
- `ss_pia_monthly` — number, $ per month at FRA; `ss_claim_age` — integer
- `filing_status` — `Single` | `Married Filing Jointly` | `Married Filing Separately` | `Head of Household`
- `state` — two-letter code
- `expected_real_return_pct` — number
- `hsa_unreimbursed_receipts_usd` — number
- `birth_year` — integer (RMD age)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ages, spend, filing status, state | **Ask — no default** (intake requires them) | — |
| Balances, incomes, SS | 0 | `[USER-PROVIDED]` / `[ASSUMPTION: 0]` |
| Real return | **Ask — no default** | — |
| SS benefit at claim age | `ss_pia_monthly` × the statutory claim-age factor (see Social Security Review) × 12 | — |
| Standard deduction, ordinary brackets, 0% LTCG ceiling | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_*`, `.brackets`, `.ltcg_qualified_dividend_brackets_mfj` (MFJ; other statuses: `.brackets_single` / `.brackets_hoh` / `.brackets_mfs` and `.ltcg_qualified_dividend_brackets_single` / `_hoh` / `_mfs`) | `[IRS 2026 brackets]` |
| IRMAA ceiling | `irmaa_ceiling`; if 0 → `md_facts` → `medicare_2026.irmaa_brackets_*_part_b_total_monthly[0].magi_max` | `[CMS Medicare 2026]` |
| RMD age | Statutory: born 1951–1959 → 73; 1960+ → 75 | — |
| RMD divisors | `md_facts` → `rmd_and_qcd_2026.uniform_lifetime_table_distribution_period` (IRS Pub 590-B Table III; Joint Life table via `md_sources` when a spouse > 10 years younger is sole beneficiary) | `[IRS Pub 590-B]` |
| State tax | Not modelled numerically — state DOR via `md_sources` for notes | `[UNSOURCED]` |
| Thresholds over time | Held at today's values in real dollars (assumed indexed) | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Real dollars, annual compounding, end-of-year growth, federal tax only. Run the loop twice: **Optimized** (rules below) and **Naive** (cash → taxable → traditional → Roth, no conversions).

1. **Each year, age `a` from `fire_age` to `planning_to_age`:**
   1. Fixed ordinary income `F` = spouse + other income + taxable SS (Pub 915) + RMD (if `a ≥` RMD age; balance ÷ sourced divisor).
   2. Ordinary ceiling `C` = standard deduction + top of the target bracket (Decision rules B), then `C = min(C, aca_magi_ceiling)` if `a < 65` and ACA is used, and `C = min(C, irmaa ceiling)` if `a ≥ 63`.
   3. `room = max(0, C − F − realized gains planned)`.
   4. Spending sources, in order, until `target_spend_post_tax` is met: cash → if `a ≥ 59.5`: traditional up to `room` → taxable (gain = sale × (1 − basis/value)) → Roth contributions → HSA receipts → Roth earnings (only if `a ≥ 59.5`) → traditional above `room` (last resort; if `a < 59.5`, note 10% penalty / route to Pre-59½ Bridge).
   5. **Roth conversion** = `room` left after step 4 (Optimized only), capped at the traditional balance.
   6. **Realized-gain budget:** harvest additional long-term gains only while taxable income + gains ≤ the 0% LTCG ceiling and MAGI ≤ `C`.
   7. Federal tax = ordinary tax on (ordinary income − standard deduction) + LTCG tax on gains (md_facts tables). Taxes paid from taxable, then cash.
   8. Grow every bucket × `(1 + r)`; converted dollars move to Roth contributions basis (5-year clock noted).
2. **Comparison metric:** `score = Σ federal tax over the horizon + traditional balance at planning_to_age × marginal rate of the final year`. Lower is better. Also report the trad balance and first RMD at RMD age for both runs.
3. **Sustainable-WR uplift:** not estimated as a percentage unless computed — report the $ difference in `score` and in ending after-tax wealth.
4. Rounding: cents internally; whole dollars.

### Decision rules

**A. Plan headline** — first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `trad_balance = 0` | No conversions — spend taxable → Roth contributions → HSA; no bracket lever |
| 2 | Optimized `score` < Naive `score` | Adopt the Optimized sequence; lever = the largest contributor (conversions, 0% LTCG, or RMD reduction) |
| 3 | Otherwise | Naive order is as good — keep it simple |

**B. Target bracket for conversions** — first match wins.

| # | Condition | Fill ordinary income to the top of… |
|---|---|---|
| 1 | Age ≥ RMD age | Nothing beyond the RMD |
| 2 | Naive-run marginal rate in the first RMD year ≤ this year's marginal rate before conversions | No conversion (converting adds no value) |
| 3 | Otherwise | The highest bracket whose rate is strictly below the Naive-run first-RMD-year marginal rate (lowest bracket → standard deduction only) |

### Output template

```markdown
# Withdrawal order plan — FIRE {fire_age} → {planning_to_age}

## Headline
**{rule A recommendation}** — lifetime federal tax ${opt} vs ${naive} naive (difference ${diff}).

## Constraints
| Constraint | Value | Source |
|---|---|---|
| Spend (post-tax, today's $) | | [USER-PROVIDED] |
| Target bracket (rule B) | | [IRS 2026 brackets] |
| ACA-MAGI ceiling | | [from Pre-65 Healthcare Plan] |
| IRMAA ceiling | | [CMS Medicare 2026] |
| Filing status / state | | |

## Bucket inventory
| Bucket | Balance | Access rule |
|---|---|---|

## Year-by-year sequence (first 10 years; then every 5th year)
| Year | Age | Spend sources | Trad withdrawal | Roth conversion | Realized LTCG | MAGI | Fed tax | Binding ceiling |
|---|---|---|---|---|---|---|---|---|

## Lever you're pulling
{conversions / 0% LTCG / RMD relief — quantified in $}

## RMD pressure check
| Run | Trad balance at RMD age | First RMD | Marginal bracket |
|---|---|---|---|
| Naive | | | |
| Optimized | | | |

## Coordination
- ACA: {…or "Not applicable — not using ACA"}
- Pre-59½ bridge: {…}
- IRMAA: {…}

## Recommended next step
**Tax Planner** owns the year-by-year execution: "{hand-off sentence}"
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).