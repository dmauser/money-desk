# Allocation Check

description: Compare current asset allocation to a target appropriate for the user's age, horizon, and risk tolerance. Outputs the delta per asset class and the dollar amount required to re-align. Use after a portfolio review or when the user asks "am I too aggressive / conservative?"

## When to use

- After major market move that has drifted the allocation.
- The user's life stage changed (approaching retirement, just had a baby, FIRE pivot).
- Onboarding — establishing a target allocation that didn't exist.

## Inputs needed

- Aggregated holdings classified by asset class (output of Portfolio Review works).
- Age, expected retirement age (or "withdrawal start" age for FIRE).
- Risk tolerance — both stated (questionnaire-style) and revealed (how did they react to 2020 / 2022 drawdowns?).
- Constraints (no individual bonds, ESG screen, employer-stock floor or ceiling, etc.).

## Workflow

1. **Choose a target framework.** Common heuristics:
   - Age-based: `(110 − age)%` in equities (more aggressive) or `(100 − age)%` (more traditional).
   - Bucket / horizon: short-term cash, mid-term bonds, long-term equities by need-by date.
   - Glide path (target-date fund equivalent).
   Document which the user picked and why. With no user target, apply the age rule in **Determinism rules** step 3.
2. **Sub-allocate equities** to US / international developed / EM. Default: US 65% / intl dev 25% / EM 10% of the equity sleeve (inside the 60–70 / 20–30 / 5–10 convention ranges). Change it only on the user's stated preference.
3. **Sub-allocate fixed income** to nominal Treasury / TIPS / aggregate / international / cash. For most retail users, a single "total bond" + cash is fine.
4. **Compute deltas.** For each asset class: current %, target %, $ delta required.
5. **Identify drift drivers.** Was the drift caused by an unrebalanced rally (equities up), new contributions all into one fund, or RSU vests piling up?
6. **Rebalance approach.**
   - Prefer: redirect new contributions into underweight sleeves (no tax cost).
   - Second: rebalance inside tax-advantaged accounts (no tax cost).
   - Last: sell in taxable (triggers gains/losses — see TLH skill).
7. **Risk reality check.** Show the loss of the current and target allocations under the fixed hypothetical shock in **Determinism rules** step 8. If the user previously panic-sold, the target equity % is cut by 10 pp (step 3). Behavior matters more than theory.

## Required citations

- Current allocation cites the holdings inventory used and as-of date.
- Drawdown projections state the hypothetical shock used (Determinism rules).

## Deliverable shape

- Markdown report `./money-desk/investing-advisor/allocation-check-<YYYYMMDD>.md`:
  - **Headline target** chosen and reasoning.
  - **Current vs target table** — asset class, current %, target %, delta %, delta $.
  - **Drift narrative** — what caused the drift.
  - **Rebalance approach** — contribute / shuffle tax-advantaged / sell taxable, in that order.
  - **Drawdown scenario** — gut-check before committing.
  - **Hand-off to** `rebalance_plan` for specific trades.

## Notes

- Don't anchor target precision to the percentage point. A 70/30 vs 72/28 is noise.
- "Bond tent" or "glide into retirement" — for users within 10 years of withdrawal, getting more conservative is reasonable; getting MUCH more conservative (50/50 or 40/60) trades short-term comfort for long-term shortfall risk. Show the trade-off.
- "Analysis only. Not investment advice."

## Determinism rules

### Input keys

- `holdings` — list of `{ ticker, current_value, account_type, asset_class }`; `account_type` ∈ `taxable`, `traditional_401k`, `roth_401k`, `traditional_ira`, `roth_ira`, `hsa`, `529`, `other` (same enum as Portfolio Review); `asset_class` ∈ `us_equity`, `intl_dev_equity`, `em_equity`, `reit`, `single_stock`, `us_bond`, `intl_bond`, `tips`, `cash`, `other`
- `current_age` — integer, years
- `withdrawal_start_age` — integer, years (retirement or FIRE withdrawal start)
- `risk_tolerance` — `conservative` | `moderate` | `aggressive`
- `drawdown_behavior` — `held` | `bought_more` | `sold` | `no_experience` (what the user did in the 2020 / 2022 drawdowns)
- `target_allocation` — optional `{ equity_pct, bond_pct, cash_pct, other_pct }` (sums to 100); when present it overrides the framework
- `equity_split` — optional `{ us_pct, intl_dev_pct, em_pct }` of the equity sleeve (sums to 100)
- `new_contributions_annual_usd` — number, expected new money over the next 12 months
- `constraints` — free text (ESG screen, employer-stock floor/ceiling, no individual bonds, …)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Holdings, values, account types | **Ask — no default** (or take the Portfolio Review inventory) | — |
| Age, withdrawal start age, risk tolerance | **Ask — no default** | — |
| Target allocation | Framework in Calculation step 3 (age-based convention) | `[ASSUMPTION: age-based rule]` |
| Equity sub-split | US 65 / intl developed 25 / EM 10 (inside the 60–70 / 20–30 / 5–10 convention ranges) | `[ASSUMPTION]` |
| Fixed-income sub-split | Single total-bond sleeve; TIPS/international bonds only if the user already holds or asks for them | `[ASSUMPTION]` |
| Cash target | 0% of the investment portfolio (emergency fund is tracked separately) | `[ASSUMPTION]` |
| Stress-scenario shock | Hypothetical: equity and REIT −50%, bonds 0%, cash 0% (round-number shock in the range of the 2007–09 US equity peak-to-trough; not a historical return series) | `[ASSUMPTION]` |
| New contributions | 0 | `[ASSUMPTION]` |

### Calculation method

1. **Aggregate.** `total_usd = Σ current_value`. Map `single_stock` and `reit` into the equity sleeve (sub-class `us_equity` unless the issuer is non-US); `us_bond`, `intl_bond`, `tips` into the bond sleeve; `cash` into cash; anything else into `other`. If `total_usd = 0`, stop (Decision rule 1).
2. **Current weights.** `current_pct = sleeve_usd / total_usd × 100`, for the three major sleeves (equity, bond, cash, plus other) and the three equity sub-sleeves (as % of the total portfolio).
3. **Target equity %** (skip if `target_allocation` given):
   - `conservative` → `100 − current_age`; `moderate` → `110 − current_age`; `aggressive` → `120 − current_age`.
   - If `drawdown_behavior = sold`, subtract 10.
   - Clamp to [0, 100], then round to the nearest 5 (halves round up). Bond target = `100 − equity target`; cash target = 0.
4. **Target sub-sleeves.** `sub_target_pct = equity_target_pct × split_pct / 100` using `equity_split` or the default 65/25/10.
5. **Deltas.** For each sleeve: `delta_pct = current_pct − target_pct`; `delta_usd = target_pct / 100 × total_usd − sleeve_usd` (positive = buy). Compute in cents; report whole dollars and percents to one decimal.
6. **Drift bands.** `band_pct = min(5, 0.20 × target_pct)` (5 pp absolute or 20% relative, whichever is tighter). A sleeve is *out of band* if `|delta_pct| > band_pct`. A sleeve with target 0 and current > 0 is out of band if current > 5.
7. **Rebalance route.** `gross_move_usd = Σ max(delta_usd, 0)`. Route = `contributions` if `gross_move_usd ≤ new_contributions_annual_usd`; else `tax_advantaged` if the overweight sleeves' value held in non-taxable accounts ≥ `gross_move_usd`; else `taxable_sells`.
8. **Stress check.** `stress_loss_pct = equity_target_pct × 50 / 100`; `stress_loss_usd = total_usd × stress_loss_pct / 100`. Repeat for the current allocation.
9. **Drift driver.** Label exactly one: `market_move` (no contribution data or contributions were pro-rata), `contribution_skew` (≥ 80% of the last 12 months' contributions went to one sleeve, if the user supplied it), `rsu_or_espp` (employer stock is the largest overweight), else `unknown`.

### Decision rules

Evaluate top to bottom; the first match is the recommendation.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `total_usd = 0` or holdings missing | No analysis — collect holdings (Portfolio Review) |
| 2 | Any major or sub-sleeve out of band (step 6) and route = `contributions` | Redirect the next 12 months of contributions to underweight sleeves; no selling |
| 3 | Any sleeve out of band and route = `tax_advantaged` | Rebalance inside tax-advantaged accounts → hand off to **Rebalance Plan** |
| 4 | Any sleeve out of band and route = `taxable_sells` | Contributions + tax-advantaged first, then taxable sells to the band edge → **Rebalance Plan** |
| 5 | `withdrawal_start_age − current_age ≤ 10` and current equity % > target equity % | Within-band but glide-path review: shift new contributions to bonds |
| 6 | Otherwise | On target — no action; re-check in 12 months or at a ≥ 10% market move |

### Output template

```markdown
# Allocation Check — {as_of_date}

## Headline
Target **{equity}/{bond}/{cash}** ({framework or "user target"}). Status: **{decision rule # → recommendation}**.

## Current vs target
| Sleeve | Current $ | Current % | Target % | Delta % | Band ± | Delta $ (buy + / sell −) | Out of band? |
|---|---|---|---|---|---|---|---|

## Equity sub-allocation
| Sub-sleeve | Current % of portfolio | Target % of portfolio | Delta % | Delta $ |
|---|---|---|---|---|

## Drift driver
{market_move / contribution_skew / rsu_or_espp / unknown — one sentence}

## Rebalance approach
{route from step 7 — or "Not applicable — all sleeves within band"}

## Stress check (hypothetical −50% equity shock)
| Allocation | Loss % | Loss $ |
|---|---|---|
| Current | | |
| Target | | |

## Next step
{Rebalance Plan hand-off, or re-check date}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
