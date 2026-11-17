# Rebalance Plan

description: Convert an allocation delta into a concrete, tax-aware list of trades. Prioritizes contributions and tax-advantaged shuffles before any taxable selling. Outputs broker-ready order tickets. Analysis-only — does NOT place trades.

## When to use

- After `allocation_check` identifies meaningful drift.
- The user just deposited a large lump (bonus, RSU vest, inheritance) and needs an investment plan.
- Annual rebalance is due (calendar) or threshold-based rebalance is triggered (band: 5 pp or 20% relative, whichever is tighter).

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
5. **Step 5 — Tax-efficient placement.** While rebalancing, also reduce future drag by moving bonds toward tax-advantaged and tax-efficient equity toward taxable (Asset Location). Don't sell in taxable to do this unless the sale passes Decision rules 3–4 — otherwise do it gradually via new flows.
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

## Determinism rules

### Input keys

- `sleeves` — list of `{ sleeve, current_pct, target_pct }` (from Allocation Check)
- `positions` — list of `{ account_type, ticker, sleeve, price_usd, lots: [{ acquired_yyyy_mm_dd, shares, cost_basis_usd }] }`; `account_type` as in Portfolio Review
- `cash_to_deploy` — list of `{ account_type, amount_usd }`
- `monthly_contributions` — list of `{ account_type, amount_usd }` for the next 12 months
- `federal_marginal_rate_pct`, `ltcg_rate_pct`, `state_marginal_rate_pct` — numbers
- `ytd_realized_gain_usd` — number (negative = net loss)
- `recent_buys_30d` — list of `{ ticker, account_type, date }` (wash-sale check)
- `trade_date` — `YYYY-MM-DD`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Positions, lots, targets | **Ask — no default** | — |
| Prices | User export as-of date; else live quote via `md_sources` | `[UNSOURCED]` |
| Federal ordinary brackets / LTCG rate | `md_facts` → `income_tax_brackets_mfj_2026.brackets` and `.ltcg_qualified_dividend_brackets_mfj` (MFJ only; else **Ask**) | `[IRS 2026 brackets]` |
| NIIT | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `niit_threshold_single` | `[IRS 2026 brackets]` |
| State rate | **Ask — no default** | — |
| Lot detail missing | Treat the position's whole basis as one lot with unknown holding period = short-term (conservative) | `[ASSUMPTION]` |
| Contributions | 0 | `[ASSUMPTION]` |

### Calculation method

1. **Targets in $:** `total = Σ position value + Σ cash_to_deploy`; `target_usd = target_pct × total / 100`; `need_usd = target_usd − current_usd` (+ buy, − sell). Band = `min(5, 0.20 × target_pct)` pp.
2. **Step 1 — cash.** For each account's cash, buy the most-underweight sleeve (largest `need_usd`) available in that account; repeat until the cash or the need is exhausted. Tie → the sleeve whose Asset Location preference matches the account, then sleeve name A–Z.
3. **Step 2 — in-account shuffles** (tax-advantaged accounts only): sell the most-overweight sleeve and buy the most-underweight, inside the same account, until all sleeves are within band or no account holds both an overweight and an underweight sleeve.
4. **Step 3 — contributions.** If remaining `|need_usd|` for every sleeve ≤ 12 months of `monthly_contributions`, redirect contributions to the underweight sleeves (pro-rata to need) and stop.
5. **Step 4 — taxable sells**, only to bring each sleeve back to its band edge (not to exact target). Lot order: (a) lots at a loss, largest loss first; (b) long-term lots (> 1 year held at `trade_date`), lowest `gain / value` first; (c) short-term lots, lowest `gain / value` first. Skip any loss lot whose ticker appears in `recent_buys_30d` (wash sale) and flag it.
6. **Tax per lot:** long-term gain × (ltcg + state)/100; short-term gain × (federal + state)/100; losses shown as negative. Add NIIT 3.8% only if the user's MAGI is stated and exceeds the `md_facts` threshold.
7. **Share rounding:** sells — round shares up to the next whole share (ETFs/stocks) or to the cent (mutual funds); buys — round down to whole shares; leftover cash stays in the account's settlement fund.
8. **Sequence:** all sells, then buys in the same account after settlement (T+1 for ETFs/stocks; mutual funds per fund rules); contribution-rate changes listed separately. Order type: limit at the bid-ask midpoint for ETFs and stocks; mutual funds trade at end-of-day NAV.
9. Rounding: cents internally; whole dollars in the report.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Plan |
|---|---|---|
| 1 | No sleeve out of band and no `cash_to_deploy` | No trades — state next scheduled check |
| 2 | Steps 1–3 bring every sleeve within band | Execute steps 1–3 only; no taxable sells |
| 3 | Taxable sells needed and every selected lot is a loss or falls in the 0% LTCG bracket (`md_facts`) | Execute steps 1–4 |
| 4 | Taxable sells needed and estimated tax ≤ 1% of the taxable sale proceeds | Execute steps 1–4; show tax per lot |
| 5 | Otherwise | Execute steps 1–3; present step-4 sells as optional with the full tax cost — the user decides |

### Output template

```markdown
# Rebalance Plan — {trade_date}

## Summary
| Sleeve | Before % | Target % | After % | Band ± |
|---|---|---|---|---|
Estimated tax cost: **${tax}** · Plan type: **{decision rule #}**

## Order tickets (in sequence)
| # | Account | Action | Ticker | Shares / $ | Est. price | Order type | Lot (date, basis) | Tax $ |
|---|---|---|---|---|---|---|---|---|

## Contribution-routing changes
{account, old split → new split — or "None"}

## Settlement notes
{T+1 / mutual-fund timing — or "Not applicable — no sells fund buys"}

## Wash-sale flags
{list — or "None"}

## Disclaimer
Analysis only — no orders placed. The user executes every order.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
