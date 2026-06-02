# Category Audit

description: Re-categorize transactions, surface miscategorized merchants, and roll up spend by category. Highlights drift vs prior periods. Use when bank-default categorization is noisy or when comparing current spend against a budget plan.

## When to use

- Bank/aggregator categories look wrong (Amazon as "shopping" when half of it is groceries, Costco as everything).
- The user wants to compare actuals against a prior plan.
- The user is preparing data for a Monthly Plan and needs clean buckets.

## Inputs needed

- Transaction table (from Cashflow Review or fresh CSV).
- Optional: the user's category list (if they already use Mint/Monarch/YNAB-style buckets) — match to it.
- Optional: known merchant-to-category overrides (e.g. "Amazon → groceries when sub-merchant is Whole Foods").

## Workflow

1. **Build a clean category taxonomy** if not provided. A typical household chart of accounts:
   - **Fixed:** housing, utilities, insurance, debt service, childcare, tuition.
   - **Variable:** groceries, dining, transport (fuel/transit/rideshare), shopping, personal care, healthcare, pets.
   - **Discretionary:** entertainment, travel, hobbies, gifts, charity.
   - **Subscriptions:** software, streaming, memberships.
   - **Savings/Investing:** transfers to brokerage / 529 / HSA / I-bonds.
   - **One-off / income:** income, refunds, transfers, taxes.
2. **Re-categorize.** For each transaction, infer the cleaner category from merchant + amount + frequency. Carry forward learned overrides.
3. **Surface the long-tail of "Other / Uncategorized."** Anything > 5% of total or > $200/mo uncategorized should be resolved with the user.
4. **Roll up.** Per month and 12-month total, per category. Show absolute and % of total spend.
5. **Compute drift.** Current period vs prior period (or vs plan if provided). Flag categories with >25% drift.
6. **Highlight notable patterns.** Lifestyle creep (variable categories growing faster than income), discretionary spikes around stressful months, etc.

## Required citations

- Every re-categorization that disagrees with the source's category is logged with the original.
- Drift flags cite both periods' totals.

## Deliverable shape

- Markdown report `./money-desk/<ACCOUNT>/category-audit-<YYYYMMDD>.md`:
  - **Category table** — current period $ and %, prior period $ and %, drift %.
  - **Re-categorizations** — list of changes from source categorization, with merchant + amount + new category.
  - **Open questions** — transactions the audit can't confidently classify; ask the user.
  - **Patterns** — narrative on creep, anomalies, structural shifts.
- Optional XLSX with full transaction-level re-categorization and a pivot.

## Notes

- "Shopping" is almost never a useful category on its own. Force a sub-category (clothing, household, gifts, electronics).
- Discretionary creep is usually small recurring increases, not big one-offs.
- Be careful with rideshare/transit: commute is fixed, leisure rideshare is discretionary — same merchant, different categories.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).