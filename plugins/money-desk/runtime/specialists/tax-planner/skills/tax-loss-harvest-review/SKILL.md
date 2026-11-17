# Tax-Loss Harvest Review

description: Scan taxable brokerage lots for unrealized losses suitable for tax-loss harvesting. Pairs losses with replacement securities (not "substantially identical" — to avoid wash-sale rule). Use in Q4 or after market drawdowns. Concept-level only — does NOT place trades.

## When to use

- Q4 tax planning after a year with realized gains or expected gains.
- After a market drawdown that leaves taxable lots with losses at or above the harvest floor (Determinism rules).
- The user has carried-forward losses they want to use or has had a high-income year.

## Inputs needed

- Taxable account holdings with lots: ticker, shares, cost basis per lot, acquisition date, current price.
- YTD realized capital gains (ST and LT) across the user's taxable accounts.
- Tax bracket and state.
- Any related-party / IRA holdings of the same security (wash-sale crosses accounts).

## Workflow

1. **Identify candidate lots.** Loss per lot = (current price − cost basis) × shares. Filter to lots with loss ≥ `min_loss_usd` (default $200 — see Determinism rules).
2. **Classify each loss** as short-term (held ≤1 year) or long-term. ST losses first offset ST gains, then LT, then $3,000/yr ($1,500 MFS) against ordinary income, then carry forward indefinitely.
3. **Wash-sale check.** A wash sale occurs if the user buys the same or "substantially identical" security within 30 days before or after the loss sale (in any account, including IRAs). Flag:
   - Recent purchases (incl. dividend reinvestment — DRIP).
   - Upcoming scheduled buys (automated contributions, 401(k) cycle is separate but IRA same-fund triggers wash).
   - Same security in spouse's accounts (also wash).
4. **Suggest replacement securities** to maintain market exposure during the 31-day wait — must NOT be substantially identical:
   - VTI → ITOT or SCHB (different issuers, similar but not identical index/methodology).
   - VOO → SPLG / IVV track the same S&P 500 index — treat as substantially identical (Determinism rules); use a different index like SCHX.
   - Document the substitution rationale.
5. **Quantify benefit.** Tax saved = realized loss × marginal rate (LT at LT-cap-gains rate, ST at ordinary). Net of any state benefit. Net of trading frictions (spreads, especially for less-liquid ETFs).
6. **Output trade list** — sells, with the replacement buy and the 31-day calendar window to revert (or hold).

## Required citations

- Each lot cites its acquisition date and broker-reported basis (or note unreliable basis).
- Wash-sale flags cite the conflicting purchase date and account.
- Tax savings cite the applicable rate (LT/ST + state).

## Deliverable shape

- Markdown report `./money-desk/tax-planner/tlh-review-<YYYYMMDD>.md`:
  - **Summary** — N candidate lots; $X total loss; estimated $Y tax saving.
  - **Per-lot table** — ticker, lot date, shares, basis, loss, ST/LT, wash-sale status, suggested replacement.
  - **Wash-sale calendar** — sells and the 31-day window's earliest re-buy date.
  - **Trade list** — concrete action list the user can hand-execute or paste into a broker's order ticket.
  - **Disclaimer** — "Analysis-only, executes nothing. Not investment or tax advice."

## Notes

- Tax-loss harvesting is value-additive primarily for users with current-year gains or high-bracket ordinary income (using the $3k/yr offset).
- Avoid frequent harvesting that creates a low cost basis you'll later realize as a big LT gain at a high bracket. Run a multi-year view if possible.
- Crypto wash-sale rules differ from securities — current law (2026) does NOT apply §1091 wash-sale to crypto in the same way, but proposals exist. Flag conservatism for the user.
- Mutual funds inside 401(k)s/IRAs don't generate harvestable losses (tax-deferred). Only taxable accounts.

## Determinism rules

### Input keys

- `lots` — list of `{ account, account_type (taxable | ira | roth | 401k | hsa), owner (self | spouse), ticker, asset_class (security | crypto), shares, basis_per_share_usd, acquired_date (YYYY-MM-DD), current_price_usd, index_tracked? }`
- `recent_and_scheduled_buys` — list of `{ account, owner, ticker, date (YYYY-MM-DD), type (buy | drip | auto_invest) }` for the 30 days before today and 30 days after the planned sale date
- `planned_sale_date` — YYYY-MM-DD; default today
- `ytd_realized_st_gain_usd`, `ytd_realized_lt_gain_usd` — numbers (losses negative); default 0
- `capital_loss_carryforward_usd` — number (positive); default 0
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `taxable_income_usd` — number; projected, before harvesting
- `federal_marginal_rate_pct`, `ltcg_rate_pct` — numbers; optional overrides
- `state_marginal_rate_pct` — number; 0 for no-income-tax states
- `min_loss_usd` — number; harvest floor per lot

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Lots, prices, basis, acquisition dates | **Ask — no default** | — |
| Federal ordinary and LTCG rate — MFJ | Bracket containing `taxable_income_usd` in `md_facts` → `income_tax_brackets_mfj_2026.brackets` / `ltcg_qualified_dividend_brackets_mfj` | `[IRS 2026 brackets]` |
| Federal rates — other statuses | Not in md_facts — look up via `md_sources`, else tag `[UNSOURCED]` | `[UNSOURCED]` |
| NIIT | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `niit_threshold_single`; 3.8% | `[IRS 2026 brackets]` |
| State marginal rate | **Ask — no default** | `[USER-PROVIDED]` |
| Harvest floor per lot | $200 (this skill's convention) | `[ASSUMPTION]` |
| Ordinary-income offset cap | $3,000 ($1,500 MFS), statutory | — |
| Crypto wash-sale treatment | Apply the 30-day test anyway (conservative) and label it | `[ASSUMPTION]` |
| Substantially identical | Same ticker, or a fund tracking the **same index** from a different issuer = substantially identical (conservative) | `[ASSUMPTION]` |

### Calculation method

Compute in cents; report whole dollars.

1. **Filter** to `account_type = taxable`. Others are listed as "not harvestable (tax-advantaged)".
2. **Per-lot loss** `loss = (current_price_usd − basis_per_share_usd) × shares`; keep lots with `loss < 0`.
3. **Character**: long-term if `planned_sale_date` is more than 1 year after `acquired_date`, else short-term.
4. **Wash-sale window** for each candidate: any entry in `recent_and_scheduled_buys` with the same ticker or substantially identical fund, in any account or the spouse's accounts, dated within 30 days before or after `planned_sale_date` → conflict. Earliest safe re-buy = `planned_sale_date + 31 days`.
5. **Netting** (IRS Schedule D order), using harvested amounts `H_st`, `H_lt` (negative):
   - `st = ytd_realized_st_gain_usd + H_st`; `lt = ytd_realized_lt_gain_usd + H_lt − capital_loss_carryforward_usd` (carryforward applied to LT first — show it).
   - If one is negative and the other positive, net them.
   - Net loss remaining → ordinary offset `min(|net|, cap)`; excess = new carryforward.
6. **Tax saved** = tax before − tax after, valuing ST gain at `m_ord + s`, LT gain at `m_ltcg + niit + s`, ordinary offset at `m_ord + s`. New carryforward is listed, valued at $0 this year.
7. **Replacement** for each harvested ticker: a fund tracking a **different index** in the same asset class. If none is known, recommend holding cash / a broad different-index fund for 31 days and say so.
8. **Order of output lots**: largest absolute loss first → tie: short-term before long-term → tie: ticker A–Z.

### Decision rules

Per lot; evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Not in a taxable account | Not harvestable |
| 2 | Wash-sale conflict from a past purchase (within 30 days before the sale) | Blocked — wait until 31 days after that purchase |
| 3 | Wash-sale conflict from a scheduled buy / DRIP after the sale | Harvest only after cancelling the scheduled buy / turning off DRIP; otherwise blocked |
| 4 | `|loss| < min_loss_usd` (default $200) | Skip — below floor |
| 5 | Long-term lot and the user's LTCG rate + NIIT + state rate = 0 and no ordinary offset capacity remains | Skip — no current-year tax value |
| 6 | Otherwise | Harvest; buy the step-7 replacement; earliest re-buy date = sale + 31 days |

### Output template

```markdown
# Tax-Loss Harvest Review — {planned_sale_date}

## Summary
{N} candidate lots; total harvestable loss **${total_loss}**; estimated current-year tax saving **${tax_saved}**; new carryforward ${carryforward}.

## Per-lot table
| Ticker | Account | Lot date | Shares | Basis | Loss | ST/LT | Wash-sale status | Decision (rule #) | Replacement |
|---|---|---|---|---|---|---|---|---|---|

## Netting
| Bucket | Before harvest | After harvest |
|---|---|---|
| Net short-term | | |
| Net long-term | | |
| Ordinary offset | | |
| Carryforward | | |

## Wash-sale calendar
| Sell date | Ticker | Conflicting buys (if any) | Earliest re-buy |
|---|---|---|---|

## Trade list
- {sell / buy pairs to hand-execute — or "None — no lot passed the decision rules"}

## Assumptions & flags
- {rates and sources, crypto conservatism, basis-reliability notes}

Analysis-only, executes nothing. Not investment or tax advice.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).