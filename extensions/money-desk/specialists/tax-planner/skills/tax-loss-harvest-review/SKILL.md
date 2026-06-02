# Tax-Loss Harvest Review

description: Scan taxable brokerage lots for unrealized losses suitable for tax-loss harvesting. Pairs losses with replacement securities (not "substantially identical" — to avoid wash-sale rule). Use in Q4 or after market drawdowns. Concept-level only — does NOT place trades.

## When to use

- Q4 tax planning after a year with realized gains or expected gains.
- After a meaningful market drawdown (broad-index ETFs are down ≥5–10%).
- The user has carried-forward losses they want to use or has had a high-income year.

## Inputs needed

- Taxable account holdings with lots: ticker, shares, cost basis per lot, acquisition date, current price.
- YTD realized capital gains (ST and LT) across the user's taxable accounts.
- Tax bracket and state.
- Any related-party / IRA holdings of the same security (wash-sale crosses accounts).

## Workflow

1. **Identify candidate lots.** Loss per lot = (current price − cost basis) × shares. Filter to lots with loss ≥ user-defined floor (e.g. $200 minimum to make it worth the friction).
2. **Classify each loss** as short-term (held ≤1 year) or long-term. ST losses first offset ST gains, then LT, then $3k/yr against ordinary income, then carry forward indefinitely.
3. **Wash-sale check.** A wash sale occurs if the user buys the same or "substantially identical" security within 30 days before or after the loss sale (in any account, including IRAs). Flag:
   - Recent purchases (incl. dividend reinvestment — DRIP).
   - Upcoming scheduled buys (automated contributions, 401(k) cycle is separate but IRA same-fund triggers wash).
   - Same security in spouse's accounts (also wash).
4. **Suggest replacement securities** to maintain market exposure during the 31-day wait — must NOT be substantially identical:
   - VTI → ITOT or SCHB (different issuers, similar but not identical index/methodology).
   - VOO → SPLG / IVV (S&P 500 same index — *most* practitioners treat these as substantially identical; safer to use a different index like SCHX).
   - Document the substitution rationale.
5. **Quantify benefit.** Tax saved = realized loss × marginal rate (LT at LT-cap-gains rate, ST at ordinary). Net of any state benefit. Net of trading frictions (spreads, especially for less-liquid ETFs).
6. **Output trade list** — sells, with the replacement buy and the 31-day calendar window to revert (or hold).

## Required citations

- Each lot cites its acquisition date and broker-reported basis (or note unreliable basis).
- Wash-sale flags cite the conflicting purchase date and account.
- Tax savings cite the applicable rate (LT/ST + state).

## Deliverable shape

- Markdown report `./money-desk/investing-advisor/tlh-review-<YYYYMMDD>.md`:
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).