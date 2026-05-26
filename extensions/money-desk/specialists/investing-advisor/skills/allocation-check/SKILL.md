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
   Document which the user picked and why.
2. **Sub-allocate equities** to US / international developed / EM. Default: US 60–70%, intl dev 20–30%, EM 5–10% of equity sleeve. Adjust per user preference and home-bias rationale.
3. **Sub-allocate fixed income** to nominal Treasury / TIPS / aggregate / international / cash. For most retail users, a single "total bond" + cash is fine.
4. **Compute deltas.** For each asset class: current %, target %, $ delta required.
5. **Identify drift drivers.** Was the drift caused by an unrebalanced rally (equities up), new contributions all into one fund, or RSU vests piling up?
6. **Rebalance approach.**
   - Prefer: redirect new contributions into underweight sleeves (no tax cost).
   - Second: rebalance inside tax-advantaged accounts (no tax cost).
   - Last: sell in taxable (triggers gains/losses — see TLH skill).
7. **Risk reality check.** Show projected drawdown of the target allocation in a 2008/2020 scenario. If user previously panic-sold, dial down equity. Behavior matters more than theory.

## Required citations

- Current allocation cites the holdings inventory used and as-of date.
- Drawdown projections cite the historical period and assumed factor.

## Deliverable shape

- Markdown report `./reports/investing-advisor/allocation-check-<YYYYMMDD>.md`:
  - **Headline target** chosen and reasoning.
  - **Current vs target table** — asset class, current %, target %, delta %, delta $.
  - **Drift narrative** — what caused the drift.
  - **Rebalance approach** — contribute / shuffle tax-advantaged / sell taxable, in that order.
  - **Drawdown scenario** — gut-check before committing.
  - **Hand-off to** `rebalance_plan` for specific trades.

## Notes

- Don't anchor target precision to the percentage point. A 70/30 vs 72/28 is noise.
- "Bond tent" or "glide into retirement" — for users within 5–10 years of withdrawal, getting more conservative is reasonable; getting MUCH more conservative (50/50 or 40/60) trades short-term comfort for long-term shortfall risk. Show the trade-off.
- "Analysis only. Not investment advice."
