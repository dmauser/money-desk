# Portfolio Review

description: Full review of holdings across all investment accounts — performance, concentration, costs, tax efficiency, asset location. Outputs prioritized findings and a remediation plan. Use as the entry point for any "review my investments" request.

## When to use

- Annual / semi-annual portfolio checkup.
- The user inherited or consolidated accounts and wants a baseline.
- Before making significant changes (large deposit, retirement, FIRE pivot).

## Inputs needed

- Holdings per account (ticker, shares, current value, cost basis if available, account type).
- Account types and tax treatment (401k traditional / Roth / taxable / HSA / 529).
- Target allocation if user has one.
- Time horizon and risk tolerance description.
- Any constraints (RSU concentration policy, ESG preferences, no-bonds-yet, etc.).

## Workflow

1. **Aggregate** all holdings into a single inventory, normalize tickers, attach asset-class tags (US equity, intl developed, intl EM, US bonds, intl bonds, REIT, commodities, cash, crypto, single-stock).
2. **Allocation snapshot.** Current % by asset class, by region, by sector concentration in the equity sleeve. Flag any sleeve >5pp from target (if target given).
3. **Concentration risk.** Any single security >10% of portfolio? Employer stock + RSU vesting pipeline + ESPP all count. Quantify the share, the tax exit cost, and a de-risk path.
4. **Cost audit.** Weighted-average expense ratio. Flag funds with ER >0.20% when a cheaper share class or substitute exists. Note 12b-1 fees, wrap fees, advisor AUM fees.
5. **Tax efficiency by account.**
   - Bonds → tax-advantaged (esp. traditional 401k/IRA) ideally.
   - Tax-inefficient (REIT, high-turnover active, HY bond) → tax-advantaged.
   - Tax-efficient (broad index ETF, municipal bonds in taxable for high earners) → taxable.
   - International — slight nuance (foreign tax credit in taxable).
   - Flag mislocated assets and quantify the leak.
6. **Performance check.** Compared to a simple benchmark blend matching the target allocation. Not for showing off — for spotting hidden underperformers (esp. active funds with persistent lag).
7. **Cash drag.** Idle cash in brokerage above the user's emergency-fund target. Yield comparison vs MMF / Treasuries / HYSA.
8. **Prioritized findings.** Top 5 issues ranked by $ impact and friction.

## Required citations

- Every holding cites the account (truncated) and as-of date for the price.
- Every cost figure cites the fund's prospectus or fund-page expense ratio.
- Allocation deltas cite the target.

## Deliverable shape

- Markdown report `./reports/investing-advisor/portfolio-review-<YYYYMMDD>.md`:
  - **Headline** — total NW, current vs target allocation, weighted ER, concentration top-3.
  - **Holdings table** — per security with account, %, basis, gain/loss, ER.
  - **Findings** — top 5 prioritized.
  - **Recommended changes** — sequence + rationale + tax impact.
  - **Defer to:** `allocation_check` (deep allocation), `rebalance_plan` (specific trades), `fund_expense_audit` (cost deep-dive).

## Notes

- This is the orchestrator skill — it should produce findings that route to the more focused skills (allocation check, rebalance plan, expense audit).
- Single-stock concentration from employer comp is the #1 lurking risk in tech/finance industries.
- "Analysis only. Not investment advice."
