# Fund Expense Audit

description: Audit every mutual fund / ETF in the portfolio for expense ratio, 12b-1 fees, wrap fees, and identify cheaper substitutes that maintain exposure. Quantifies annual fee drag in dollars. Use when expense ratios feel "too high" or before consolidating accounts.

## When to use

- After a Portfolio Review flags weighted ER above ~0.20%.
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
4. **Find substitutes.** For each high-ER fund, identify a similar-exposure low-ER substitute:
   - Active large-cap → broad index (VOO, VTI, SCHB, ITOT).
   - High-ER bond fund → BND / AGG / SCHZ / VBTLX.
   - High-ER international → VXUS / IXUS.
   - 401k menu: identify the cheapest broad index in the menu even if not a perfect match.
5. **Flag share-class arbitrage.** Same fund, multiple share classes (Investor / Admiral / Institutional / R6) — moving from Investor to Admiral can drop ER 0.10% for free.
6. **Quantify net savings.** $ savings/year from each substitution. Note any tax cost in taxable (long-term gains realized) vs. tax-free in retirement accounts.
7. **Action list.** Prioritized — biggest $ saving with lowest friction first.

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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).