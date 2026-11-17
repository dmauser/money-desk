# Fund Expense Audit

description: Audit every mutual fund / ETF in the portfolio for expense ratio, 12b-1 fees, wrap fees, and identify cheaper substitutes that maintain exposure. Quantifies annual fee drag in dollars. Use when expense ratios feel "too high" or before consolidating accounts.

## When to use

- After a Portfolio Review flags weighted ER above 0.20%.
- The user has legacy 401(k) holdings or an old advisor relationship.
- The user is considering switching from active to index.

## Inputs needed

- Per-holding ticker and current $ value.
- Account type (some funds are only available in certain accounts; 401k menus constrain choices).
- 401k fund menu(s) — important for proposing in-plan substitutes.
- Any advisor / wrap-account fees layered on top.

## Workflow

1. **Fetch ER per holding.** Get gross expense ratio from the fund prospectus / fund page. Note net ER if there's a fee waiver (and the waiver's expiration).
2. **Identify hidden costs:**
   - 12b-1 fees (often 0.25% on retail share classes).
   - Sales loads (A-share front load, B-share back-end, C-share level load) — rare on new buys but legacy holdings may still have them.
   - Wrap account / advisor AUM fee (often 0.50–1.50% on top of fund ER).
   - Bid-ask spread cost for less-liquid ETFs (annualized for high-turnover holders).
3. **Compute dollar drag.** $ value × ER = annual fee in dollars per fund. Sum.
4. **Find substitutes.** For each fund with ER > 0.20%, a 12b-1 fee, or a load, identify a similar-exposure low-ER substitute:
   - Active large-cap → broad index (VOO, VTI, SCHB, ITOT).
   - High-ER bond fund → BND / AGG / SCHZ / VBTLX.
   - High-ER international → VXUS / IXUS.
   - 401k menu: identify the cheapest broad index in the menu even if not a perfect match.
5. **Flag share-class arbitrage.** Same fund, multiple share classes (Investor / Admiral / Institutional / R6) — moving from Investor to Admiral can drop ER 0.10% for free.
6. **Quantify net savings.** $ savings/year from each substitution. Note any tax cost in taxable (long-term gains realized) vs. tax-free in retirement accounts.
7. **Action list.** Prioritized — biggest $ saving first, tax-advantaged before taxable on ties (Determinism rules step 7).

## Required citations

- Each ER cites the fund page / prospectus and the as-of date.
- Substitute proposals cite both funds' ER and the difference in $ terms.

## Deliverable shape

- Markdown report `./money-desk/investing-advisor/fund-expense-audit-<YYYYMMDD>.md`:
  - **Headline** — current weighted ER, current $/yr fee drag, achievable post-audit ER & $/yr.
  - **Per-fund table** — ticker, ER, $ value, $ drag/yr, suggested substitute, substitute ER, $ saving/yr.
  - **Share-class upgrades** — same-fund cheaper share class.
  - **Advisor / wrap fee** — if applicable, separate line.
  - **Action list** — prioritized, with friction notes (taxable vs tax-advantaged).

## Notes

- An ER difference of 0.50% on $100k is $500/yr that compounds for decades.
- Be careful with "similar exposure" — VOO and VOOG are NOT equivalent (S&P 500 vs S&P 500 Growth).
- 401k menus are often expensive; if the user has access to a brokerage window or self-directed option inside the plan, flag it as an unlock.
- "Not investment advice. Verify all ERs against current fund prospectuses before acting."

## Determinism rules

### Input keys

- `holdings` — list of `{ ticker, current_value, account_type, cost_basis?, expense_ratio_pct?, twelve_b1_pct?, load_pct? }`; `account_type` as in Portfolio Review
- `plan_menus` — list of `{ account_type, funds: [{ ticker, expense_ratio_pct, category }] }` for each employer plan (401k/403b/457)
- `advisor_fee_pct` — number, annual AUM / wrap fee on top of fund costs (0 if none)
- `advisor_fee_base_usd` — number, assets the advisor fee applies to
- `ltcg_rate_pct` — number, federal long-term gains rate
- `state_marginal_rate_pct` — number

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ticker, value, account type | **Ask — no default** | — |
| Expense ratio, 12b-1, load, waiver expiry | Fund prospectus / fund page via `md_sources` (net ER if a waiver exists, with the waiver end date); if not retrieved, `[UNSOURCED]` and exclude from totals | `[UNSOURCED]` |
| 401(k) menu | **Ask — no default**; without it, no in-plan substitutes are proposed | — |
| Advisor / wrap fee | 0 | `[ASSUMPTION]` |
| LTCG rate | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` (MFJ only; else **Ask**) | `[IRS 2026 brackets]` |
| State rate | **Ask — no default** | — |
| Substitute candidates outside plans | Same-category broad index funds named in Workflow step 4; their ERs fetched live | `[UNSOURCED]` until fetched |

### Calculation method

1. **Total cost per holding:** `cost_pct = expense_ratio_pct` (12b-1 is already inside the ER — do not add it twice; report it separately). `drag_usd = current_value × cost_pct / 100`.
2. **Portfolio totals:** `weighted_er_pct = Σ(value × ER) / Σ value`; `fund_drag_usd = Σ drag_usd`; `advisor_drag_usd = advisor_fee_base_usd × advisor_fee_pct / 100`; `total_drag_usd = fund_drag_usd + advisor_drag_usd`.
3. **Substitute selection** per holding with ER > 0.20 or 12b-1 > 0 or a load:
   1. Same fund, cheaper share class available in that account → that share class.
   2. Employer plan account → the lowest-ER fund in that plan's menu with the same `category`; if none, the lowest-ER broad index fund in the menu (flag "imperfect match").
   3. IRA / taxable → the lowest-ER same-category fund from the step-4 candidate list.
   Tie on ER → the fund with the larger AUM, then ticker A–Z.
4. **Saving:** `saving_usd = current_value × (ER_old − ER_new) / 100`.
5. **Tax cost (taxable only):** `tax_cost_usd = max(0, current_value − cost_basis) × (ltcg + state) / 100`; `payback_years = tax_cost_usd / saving_usd`. Tax-advantaged accounts: 0. Missing basis → payback "unknown" (treated as > 3).
6. **Post-audit totals:** recompute steps 1–2 with every switch that Decision rules approve.
7. **Action order:** by `saving_usd` descending → tie: tax-advantaged before taxable → tie: ticker A–Z.
8. Rounding: cents internally; whole dollars; ERs to two decimals (three if < 0.10).

### Decision rules

Per holding, top to bottom; first match wins.

| # | Condition | Action |
|---|---|---|
| 1 | ER not retrieved | Flag "verify ER" — no recommendation |
| 2 | ER ≤ 0.20, no 12b-1, no load | Keep |
| 3 | Cheaper share class of the same fund available in the same account | Switch share class (no exposure change) |
| 4 | Tax-advantaged account and `ER_old − ER_new ≥ 0.10` | Switch to substitute |
| 5 | Taxable account and `payback_years ≤ 3` | Switch to substitute (specific-lot; losses first) |
| 6 | Otherwise | Keep; direct new money to the substitute |

Advisor / wrap fee ≥ 0.50% of assets: list as a separate line "fee review — ask what services the fee buys" (no switch recommendation).

### Output template

```markdown
# Fund Expense Audit — {as_of_date}

## Headline
Weighted ER **{weighted_er}%** → **{post_er}%**; fee drag **${total_drag}/yr** → **${post_drag}/yr** (saving **${saving}/yr**).

## Per-fund table
| Ticker | Account | Value | ER (as-of, source) | 12b-1 / load | $ drag/yr | Substitute | Substitute ER | $ saving/yr | Tax cost | Payback (yrs) | Action (rule #) |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Share-class upgrades
{rows from rule 3 — or "None found"}

## Advisor / wrap fee
{line — or "Not applicable — no advisor fee"}

## Action list (priority order)
1. {action, $ saving, friction}

## Unverified ERs
{list — or "None"}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).