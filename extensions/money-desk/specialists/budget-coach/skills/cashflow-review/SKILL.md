# Cashflow Review

description: Month-over-month review of inflows vs outflows from bank/credit-card statements. Surfaces net cash position, savings rate, irregular income patterns, and over-spend months. Use when the user says "where is my money going", asks for a cash-flow analysis, or needs a baseline before building a budget.

## When to use

- The user is about to build a budget (run this first to establish reality).
- The user feels like they're "spending too much" but doesn't know where.
- After a life change (new job, move, marriage) — to re-baseline.
- Quarterly or annual check-in.

## Inputs needed

- Bank statements (checking + savings), 3–12 months. CSV preferred; PDF works.
- Credit-card statements, same window.
- Take-home (after-tax) income for the period (pay stubs ideal).
- Any cash-only / Venmo / Zelle activity the user is aware of.

If the user only has 1–2 months, run it but flag that small-N conclusions are noisy.

## Workflow

1. **Load and normalize.** Parse CSV/PDF into a single transaction table with: date, account, merchant, amount (signed), original category, cleaned category.
2. **Identify inflows.** Pay deposits, transfers in from external accounts, refunds, interest/dividends. Tag pay deposits separately.
3. **Identify outflows.** All debits. Separate transfers-between-own-accounts from real spending — these are not outflows.
4. **Compute monthly totals.** Per month: total in, total out, net, savings rate (net ÷ inflows), top-5 categories.
5. **Flag anomalies.** Months with outflows > 110% of inflows, single transactions > 25% of monthly net, recurring charges that started or stopped during the window.
6. **Compute the headline.** 3-month and 12-month rolling savings rate.

## Required citations

- Each monthly aggregate cites the source statements that fed it.
- Anomaly flags cite the specific transaction line (date + merchant + amount).
- Income vs spending mismatch cites both sides explicitly.

## Deliverable shape

- A Markdown report at `./reports/<ACCOUNT>/cashflow-review-<YYYYMMDD>.md`:
  - **Headline:** "You earned $X, spent $Y, saved $Z (W%) over N months."
  - **Monthly summary table** — month, in, out, net, savings rate.
  - **Top categories** — both ranked and as % of outflows.
  - **Anomalies** — bulleted list with citations.
  - **Recommendations** — 3–5 concrete next steps (often: run Category Audit and Subscription Audit next).
- Offer XLSX export with full transaction detail and pivots.

## Notes

- "Net savings" includes transfers to dedicated savings/brokerage accounts. Be careful not to double-count: transfers between checking and savings are NOT savings unless the savings account doesn't get swept back.
- Annualize subscription/recurring charges in the summary — it's eye-opening.
- If the user has joint accounts, ask whose income/spending it represents before reporting savings rate.
