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
5. **Compute drift.** Current period vs prior period (or vs plan if provided). Flag categories with >25% drift and a change of at least $50/month (see Determinism rules).
6. **Highlight notable patterns.** Lifestyle creep (variable + discretionary spending growing more than 5 percentage points faster than income), discretionary spikes around stressful months, etc.

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

## Determinism rules

### Input keys

- `transactions` — list of `{ date (YYYY-MM-DD), account (last-4), merchant, amount_usd (signed), source_category }` (Cashflow Review output or fresh CSV)
- `current_period` — `{ start_yyyy_mm, end_yyyy_mm }`
- `prior_period` — `{ start_yyyy_mm, end_yyyy_mm }` (optional; omit if no prior data)
- `plan_usd_by_category` — map category → planned $/month (optional; from Monthly Plan)
- `category_list` — list of the user's own category names (optional)
- `merchant_overrides` — list of `{ merchant_pattern, category }` the user has confirmed (optional)
- `income_usd_by_period` — `{ current_monthly_avg_usd, prior_monthly_avg_usd }` take-home (optional; for creep check)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Transactions | **Ask — no default** | — |
| Category taxonomy | The fixed taxonomy in Workflow step 1 (sub-categories as listed) | `[ASSUMPTION]` |
| Prior period / plan | Drift section marked "Not applicable — no comparison period" | — |
| Income for creep check | Creep check marked "Not applicable — income not supplied" | — |

### Calculation method

1. **Taxonomy.** Use `category_list` if supplied (map each fixed-taxonomy group to the closest user category and show the mapping); otherwise the fixed taxonomy in Workflow step 1. "Shopping" is never a final category — assign clothing, household, gifts, or electronics.
2. **Assign each transaction a category** using the first rule that matches: (1) `merchant_overrides`; (2) overrides learned earlier in this same audit; (3) merchant-name rule (e.g., grocery chain → groceries; same merchant at a different amount band or cadence may split, such as commute vs leisure rideshare); (4) `source_category` mapped to the taxonomy; (5) "Uncategorized". Exclude internal transfers (Cashflow Review step 2.1).
3. **Log** every transaction whose final category differs from `source_category`: date, merchant, amount, original, new.
4. **Open questions:** for each month, if Uncategorized > 5% of that month's spending or > $200, list its transactions (largest first) for the user to classify. Re-run steps 2–5 after answers.
5. **Roll up** per category: total for each period, monthly average (`total ÷ months in period`, so periods of different lengths compare fairly), and % of total spending.
6. **Drift** (only if `prior_period` or `plan_usd_by_category` exists): `drift_pct = (current_monthly_avg − comparison_monthly_avg) ÷ comparison_monthly_avg × 100`. Flag when `|drift_pct| > 25` **and** `|current − comparison| ≥ $50/month`. Comparison = 0 and current > 0 → "New category", flagged if ≥ $50/month.
7. **Creep check** (only if income supplied): `variable_growth_pct` = drift of Variable + Discretionary combined; `income_growth_pct` from `income_usd_by_period`. Creep = `variable_growth_pct − income_growth_pct > 5` percentage points.
8. **Rounding:** compute in cents; report whole dollars and percentages to 1 decimal. Sort category tables by current monthly average, descending (tie: name A–Z).

### Decision rules

Evaluate top to bottom; the first match is the audit status and next step.

| # | Condition | Status / next step |
|---|---|---|
| 1 | Any month still has Uncategorized > 5% of spending or > $200 after one round of questions | Incomplete — resolve open questions before Monthly Plan |
| 2 | Creep check fired | Lifestyle creep — Monthly Plan with caps on the flagged variable/discretionary categories |
| 3 | ≥ 1 category drift-flagged upward | Drift — review flagged categories with the user, then Monthly Plan |
| 4 | Otherwise | Clean — proceed to Monthly Plan using these monthly averages |

### Output template

```markdown
# Category Audit — {current_period}

## Headline
{N} transactions, {R} re-categorized, {Q} open questions. Status: **{status}** (rule #{n}).

## Category table
| Category | Group | Current $/mo | Current % | Comparison $/mo | Comparison % | Drift % | Flag |
|---|---|---|---|---|---|---|---|
{comparison columns "Not applicable — no comparison period" if none}

## Re-categorizations
| Date | Merchant | Amount | Original category | New category | Rule |
|---|---|---|---|---|---|

## Open questions
| Date | Merchant | Amount | Candidate categories |
|---|---|---|---|
{or "None"}

## Patterns
- Creep check: {variable_growth_pct vs income_growth_pct — or "Not applicable — income not supplied"}
- {other drift-flag narratives, one per flagged category}

## Next step
{decision rule # and action}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
