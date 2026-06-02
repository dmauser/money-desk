# Rebalance Plan

description: Convert an allocation delta into a concrete, tax-aware list of trades. Prioritizes contributions and tax-advantaged shuffles before any taxable selling. Outputs broker-ready order tickets. Analysis-only — does NOT place trades.

## When to use

- After `allocation_check` identifies meaningful drift.
- The user just deposited a large lump (bonus, RSU vest, inheritance) and needs an investment plan.
- Annual rebalance is due (calendar) or threshold-based rebalance is triggered (e.g., ±5pp).

## Inputs needed

- Current and target allocation by asset class (from `allocation_check`).
- Per-account holdings with lot-level cost basis if available.
- Available cash to deploy (and where it sits).
- Tax bracket and YTD realized gains/losses (for taxable-sell decisions).
- Account-by-account contribution headroom (401k/IRA limits left).

## Workflow

1. **Step 1 — Cash deployment.** Direct any uninvested cash into underweight sleeves first, in the account type best for the sleeve (e.g., bonds into traditional 401k if cash is in 401k; equities into Roth if cash is in Roth; etc.).
2. **Step 2 — In-kind shuffle inside tax-advantaged accounts.** Sell overweight, buy underweight inside the same account — no tax. Use this for the bulk of the alignment when possible.
3. **Step 3 — Redirect new contributions.** Adjust the user's 401k / auto-invest splits so future contributions tilt toward underweight sleeves. This is free rebalancing.
4. **Step 4 — Taxable sells (only if needed).** Pick lots intentionally:
   - Use specific-lot identification (not FIFO).
   - Prefer losses (harvest — see TLH skill).
   - If gains, prefer LT > 1 year held; prefer low-gain lots.
   - Quantify the tax cost per lot and the net allocation improvement.
5. **Step 5 — Tax-efficient placement.** While rebalancing, also reduce future drag by moving bonds toward tax-advantaged and tax-efficient equity toward taxable (Asset Location). Don't sell ETFs in taxable to do this if the gain is large — do it gradually via new flows.
6. **Order ticket output.** For each trade: account, action (buy/sell), ticker, shares (or $), order type recommendation (limit at midpoint for less-liquid ETFs), and the sequence.
7. **Sequence.** Sells first (free up cash), buys second (settle date), and any 401(k) contribution-rate changes flagged separately for the user's HR portal.

## Required citations

- Each sell cites lot date and basis.
- Each tax cost cites the rate applied.
- Each allocation delta cites the target.

## Deliverable shape

- Markdown trade plan `./money-desk/investing-advisor/rebalance-plan-<YYYYMMDD>.md`:
  - **Summary** — drift before/after, est. tax cost, est. annual cost saving from asset location.
  - **Order tickets** — sequenced list per account.
  - **Contribution-routing changes** — 401k splits, auto-invest splits.
  - **Settle-date awareness** — note T+1 / T+2 if any sell needs to fund a buy.
  - **Disclaimer** — analysis-only, no orders placed.

## Notes

- Rebalancing inside a Roth or 401(k) is preferable to taxable sells; it can take longer because contributions are limited, but it's tax-free.
- Avoid wash-sale conflicts when this plan overlaps with a TLH plan — see Tax Planner.
- "Not investment advice. User executes all orders themselves."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).