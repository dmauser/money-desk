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
2. **Allocation snapshot.** Current % by asset class, by region, by sector concentration in the equity sleeve. Flag any sleeve outside its band — 5 pp or 20% relative, whichever is tighter (if target given).
3. **Concentration risk.** Any single security ≥ 10% of portfolio? Employer stock + RSU vesting pipeline + ESPP all count. Quantify the share, the tax exit cost, and a de-risk path.
4. **Cost audit.** Weighted-average expense ratio. Flag funds with ER >0.20% when a cheaper share class or substitute exists. Note 12b-1 fees, wrap fees, advisor AUM fees.
5. **Tax efficiency by account.**
   - Bonds → tax-advantaged (esp. traditional 401k/IRA) ideally.
   - Tax-inefficient (REIT, high-turnover active, HY bond) → tax-advantaged.
   - Tax-efficient (broad index ETF, municipal bonds in taxable for high earners) → taxable.
   - International — slight nuance (foreign tax credit in taxable).
   - Flag mislocated assets and quantify the leak.
6. **Performance check.** Compared to a simple benchmark blend matching the target allocation. Not for showing off — for spotting hidden underperformers (active funds that trail their benchmark on both 3-year and 5-year returns).
7. **Cash drag.** Idle cash in brokerage above the user's emergency-fund target. Yield comparison vs MMF / Treasuries / HYSA.
8. **Prioritized findings.** Top 5 issues ranked by the Decision-rules tier, then $ impact.

## Required citations

- Every holding cites the account (truncated) and as-of date for the price.
- Every cost figure cites the fund's prospectus or fund-page expense ratio.
- Allocation deltas cite the target.

## Deliverable shape

- Markdown report `./money-desk/investing-advisor/portfolio-review-<YYYYMMDD>.md`:
  - **Headline** — total NW, current vs target allocation, weighted ER, concentration top-3.
  - **Holdings table** — per security with account, %, basis, gain/loss, ER.
  - **Findings** — top 5 prioritized.
  - **Recommended changes** — sequence + rationale + tax impact.
  - **Defer to:** `allocation_check` (deep allocation), `rebalance_plan` (specific trades), `fund_expense_audit` (cost deep-dive).

## Notes

- This is the orchestrator skill — it should produce findings that route to the more focused skills (allocation check, rebalance plan, expense audit).
- Single-stock concentration from employer comp is the #1 lurking risk in tech/finance industries.
- "Analysis only. Not investment advice."

## Determinism rules

### Input keys

Names match the `md_iv_skill_portfolio_review` intake schema.

- `holdings` — list of `{ ticker, shares?, current_value, cost_basis?, account_type }`; `account_type` ∈ `taxable`, `traditional_401k`, `roth_401k`, `traditional_ira`, `roth_ira`, `hsa`, `529`, `other`
- `account_types_summary` — free text
- `target_allocation` — string `"stocks/bonds/cash/alts"` in percents, e.g. `"60/30/10/0"`
- `time_horizon_years` — integer
- `risk_tolerance` — `conservative` | `moderate` | `aggressive`
- `constraints` — free text (RSU concentration, ESG, sector exclusions, tax-lot restrictions)
- `employer_ticker` — optional string; employer stock incl. unvested RSUs / ESPP
- `cash_reserve_target_usd` — optional number; cash the user wants kept in the brokerage

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Holdings and values | **Ask — no default** | — |
| Asset class per ticker | Fund / issuer page via `md_sources`; unknown → `unclassified` (reported, excluded from drift) | `[UNSOURCED]` |
| Target allocation | None — drift check is "Not applicable", route to Allocation Check | — |
| Expense ratios | Fund prospectus / fund page via `md_sources`; if not retrieved, `[UNSOURCED]` and excluded from the weighted ER | `[UNSOURCED]` |
| Benchmark returns (3 y / 5 y) | Fund page / index provider via `md_sources`; else performance check "Not evaluated" | `[UNSOURCED]` |
| Cash reserve target | 0 (all brokerage cash counts as idle) | `[ASSUMPTION]` |
| Cash-alternative yield | Live via Cash Yield Check source policy; else idle cash is reported without a $ figure | `[UNSOURCED — verify on issuer page]` |

### Calculation method

1. **Inventory.** One row per holding; `pct = current_value / total × 100`; `unrealized = current_value − cost_basis` (taxable only; blank if basis missing).
2. **Allocation.** Sum by asset class into stocks / bonds / cash / alts; `delta_pp = current − target`; out of band if `|delta_pp| > min(5, 0.20 × target)` (same band as Allocation Check).
3. **Concentration.** For each individual security (not a diversified fund), `position_pct`; add employer stock across all accounts plus unvested RSUs / ESPP into one line. Flag ≥ 10.0%. Tax exit cost (taxable lots) = `unrealized × ltcg rate` from `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` (MFJ; otherwise **Ask**).
4. **Cost.** `weighted_er = Σ(value × ER) / Σ value`; flag every fund with ER > 0.20; `$ drag = value × ER / 100`.
5. **Location.** Flag each holding of REITs, taxable bonds, high-yield bonds or active funds with turnover > 50% that sits in `taxable` while any tax-advantaged account holds broad equity index funds. $ leak is computed only by Asset Location Review (cite "see Asset Location Review").
6. **Performance.** For each active fund: trailing 3-year and 5-year annualized return vs its category index fund. Flag only if it trails on **both** periods.
7. **Idle cash.** `idle = brokerage cash − cash_reserve_target_usd` (floor 0). `$ opportunity = idle × (best eligible yield − current yield) / 100` if yields were retrieved.
8. **Findings.** Build one finding per flag, then order by the Decision rules priority; within a priority tier, by annual $ impact descending, tie → ticker A–Z. Report the top 5.
9. Rounding: cents internally; whole dollars; percents one decimal; ERs two decimals.

### Decision rules

Priority of findings — evaluate each finding against the table; the first matching row sets its tier (lower tier number = higher on the list).

| Tier | Condition | Finding / routing |
|---|---|---|
| 1 | Any single security or the combined employer-stock line ≥ 10.0% | Concentration — de-risk path (sell schedule or hedge discussion) |
| 2 | Any major sleeve out of band | Allocation drift → **Allocation Check** / **Rebalance Plan** |
| 3 | Any fund ER > 0.20 with a cheaper same-exposure option | Cost → **Fund Expense Audit** |
| 4 | Any mislocated holding (step 5) | Location → **Asset Location Review** |
| 5 | Idle cash > 0 with a sourced yield gap ≥ 1.00 pp | Cash drag → **Cash Yield Check** |
| 6 | Active fund trails benchmark on 3 y and 5 y | Underperformer — review / replace |
| 7 | Otherwise | No finding — state "No issues found in this area" |

### Output template

```markdown
# Portfolio Review — {as_of_date}

## Headline
Total **${total}** · Allocation **{s}/{b}/{c}/{a}** vs target **{target or "none"}** · Weighted ER **{er}%** · Top-3 concentration: {ticker %, ticker %, ticker %}

## Holdings
| Ticker | Account | Asset class | Value | % of total | Cost basis | Unrealized | ER |
|---|---|---|---|---|---|---|---|

## Allocation vs target
| Sleeve | Current % | Target % | Delta pp | Band ± | Out of band? |
|---|---|---|---|---|---|

## Findings (top 5)
| # | Tier | Finding | $ impact/yr | Friction | Route to |
|---|---|---|---|---|---|

## Recommended changes
1. {sequence + rationale + tax impact}

## Not evaluated
{items missing data — or "None"}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).