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

If the user only has 1–2 months (`statement_window_months` < 3), run it but flag that small-N conclusions are noisy.

## Workflow

1. **Load and normalize.** Parse CSV/PDF into a single transaction table with: date, account, merchant, amount (signed), original category, cleaned category.
2. **Identify inflows.** Pay deposits, transfers in from external accounts, interest/dividends. Tag pay deposits separately. Refunds are netted against outflows, not counted as income (see Determinism rules).
3. **Identify outflows.** All debits. Separate transfers-between-own-accounts from real spending — these are not outflows.
4. **Compute monthly totals.** Per month: total in, total out, net, savings rate (net ÷ inflows), top-5 categories.
5. **Flag anomalies.** Months with outflows > 110% of inflows, single transactions > 25% of monthly net, recurring charges that started or stopped during the window.
6. **Compute the headline.** 3-month and 12-month rolling savings rate.

## Required citations

- Each monthly aggregate cites the source statements that fed it.
- Anomaly flags cite the specific transaction line (date + merchant + amount).
- Income vs spending mismatch cites both sides explicitly.

## Deliverable shape

- A Markdown report at `./money-desk/<ACCOUNT>/cashflow-review-<YYYYMMDD>.md`:
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

## Determinism rules

### Input keys

- `statement_window_months` — integer 1–12; months of statements covered
- `take_home_income_for_window` — number, USD; net pay that hit the bank over the whole window
- `has_bank_csv` — bool; bank statement CSV/PDF available
- `has_credit_card_csv` — bool; credit-card statement CSV/PDF available
- `cash_only_activity_known` — string (optional); material cash / P2P activity not on statements
- `notes` — string (optional); irregular months, one-off events
- `transactions` — list of `{ date (YYYY-MM-DD), account (last-4), merchant, amount_usd (signed: + inflow, − outflow), source_category }` parsed from the statements
- `own_account_last4` — list of the user's own account last-4s (to detect internal transfers)
- `household_scope` — `individual` | `joint` (whose income/spending the joint accounts represent)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Statements / transactions | **Ask — no default** (rough monthly averages only if the user has no statements; label the whole report `[UNSOURCED]`) | — |
| Take-home income for the window | **Ask — no default** | — |
| Which accounts are the user's own | **Ask — no default** | — |
| Joint-account scope | **Ask — no default** (required before reporting a savings rate on joint accounts) | — |
| Cash-only activity not on statements | Treated as $0 and stated in the report | `[ASSUMPTION]` |

### Calculation method

1. **Normalize.** One row per transaction: `date, account, merchant, amount_usd, source_category, category`. Compute in cents. Mask accounts to last-4.
2. **Classify each row** in this order (first match wins):
   1. **Internal transfer** — a debit and a credit of equal absolute amount between two `own_account_last4` accounts within 3 calendar days, or a credit-card payment from checking. Excluded from inflows and outflows (card purchases are counted on the card itself).
   2. **Savings transfer** — a debit to a savings / brokerage / retirement / HSA / 529 account that is not transferred back within the window. Not an outflow; it stays inside net.
   3. **Refund** — a credit from a merchant that also has debits in the window. Netted against outflows in the month received (not counted as income).
   4. **Pay deposit** — payroll credit. Inflow, tagged `pay`.
   5. **Other inflow** — interest, dividends, transfers in from external parties. Inflow.
   6. **Spending outflow** — every remaining debit.
3. **Monthly totals** per calendar month: `inflows`, `outflows` (spending − refunds), `net = inflows − outflows`, `savings_rate_pct = net ÷ inflows × 100` (1 decimal; "n/a" if inflows = 0), top-5 categories by outflow (tie: category name A–Z).
4. **Window totals:** sum of monthly figures; `window_savings_rate_pct = Σ net ÷ Σ inflows × 100`.
5. **Rolling rates:** 3-month = last 3 months' Σ net ÷ Σ inflows; 12-month only if `statement_window_months` ≥ 12, else "Not applicable — window is N months".
6. **Income check:** `income_gap_pct = |Σ pay deposits − take_home_income_for_window| ÷ take_home_income_for_window × 100`. Flag if > 5.
7. **Anomaly flags** (list all that fire, in this order):
   - Overspend month: `outflows > 1.10 × inflows`.
   - Large transaction: a single outflow > 25% of that month's net when net > 0, or > 25% of that month's inflows when net ≤ 0.
   - Recurring change: a merchant charged ≥ 3 times at a regular cadence whose first charge is after the first month, or whose last charge is before the final month.
8. **Recurring small charges:** sum the monthly-equivalent cost of recurring merchants (≥ 3 charges, each ≤ $100) → `recurring_small_usd_per_month`.
9. **Noise flag:** if `statement_window_months` < 3, label every conclusion "small sample — noisy".
10. **Rounding:** compute in cents; report whole dollars and percentages to 1 decimal.

### Decision rules

Evaluate top to bottom; the first match is the **primary next step**. Secondary steps: add "Subscription Audit" whenever `recurring_small_usd_per_month` ≥ $50, and "Category Audit" whenever any month has an Overspend flag (if not already primary).

| # | Condition | Primary next step |
|---|---|---|
| 1 | Joint accounts and `household_scope` not given | Stop before savings rate — ask whose income/spending it is |
| 2 | `window_savings_rate_pct` < 0 | Deficit — run Category Audit, then Monthly Plan; if debt minimums are part of the gap, route to Debt Strategist |
| 3 | 0 ≤ `window_savings_rate_pct` < 10 | Thin margin — Category Audit, then Monthly Plan targeting ≥ 10% |
| 4 | 10 ≤ `window_savings_rate_pct` < 20 | Moderate — Monthly Plan to lock in the rate; Category Audit to find room toward 20% |
| 5 | Otherwise (≥ 20%) | On track — Monthly Plan to formalize; route surplus to Net Worth & Goals |

### Output template

```markdown
# Cashflow Review — {first_month} to {last_month}

## Headline
You earned **${inflows}**, spent **${outflows}**, saved **${net} ({window_savings_rate_pct}%)** over **{N} months**.

## Monthly summary
| Month | Inflows | Outflows | Net | Savings rate |
|---|---|---|---|---|

## Rolling savings rate
| Window | Savings rate |
|---|---|
| 3-month | |
| 12-month | {value or "Not applicable — window is N months"} |

## Top categories
| Rank | Category | Outflow | % of outflows | Annualized |
|---|---|---|---|---|

## Income check
{pay deposits vs take_home_income_for_window, income_gap_pct, flag or "Within 5%"}

## Anomalies
| Type | Month | Date | Merchant | Amount | Rule fired |
|---|---|---|---|---|---|
{or "None"}

## Data caveats
{small-sample flag, cash-only activity treated as $0, joint-account scope — or "None"}

## Recommendations
1. {primary next step — decision rule # fired}
2. {secondary steps}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
