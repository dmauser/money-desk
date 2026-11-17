# Monthly Plan

description: Build a zero-based or envelope-style monthly spending plan from net pay. Allocates to fixed obligations, variable categories, savings goals, and a discretionary buffer. Outputs a one-page plan plus a tracker the user can compare actuals against next month.

## When to use

- The user has done Cashflow Review and Category Audit (or has clean numbers).
- The user wants a "starting plan" they can live with, not an aspirational one.
- After income or expense changes (new job, raise, new fixed cost).

## Inputs needed

- Monthly take-home (post-tax, post-payroll-deductions). For irregular income, ask for the lowest-of-last-12-months as the baseline.
- Fixed obligations: rent/mortgage, utilities, insurance, debt minimums, childcare, subscriptions kept.
- Savings goals: emergency fund target, retirement contribution (if not already payroll-deducted), short-term sinking funds (vacation, car repair).
- Approximate current variable spend (from Category Audit).
- Style preference: **zero-based** (every dollar assigned) vs **envelope** (cash-like buckets for variable categories) vs **anti-budget** (auto-save first, spend the rest).

## Workflow

1. **Lay out take-home.** Single income number per month. For dual-earner households, get both, and either combine or keep separate per the user's preference.
2. **Subtract fixed obligations.** What's left is "discretionary income" — the working budget.
3. **Pay savings before spending.** Apply the savings goals next. This is the single most important step; anything that hits a bucket after this is real discretionary.
4. **Allocate variable categories.** Use the Category Audit averages as the starting point, then negotiate adjustments with the user. Common nudges:
   - Round each category up to the nearest $10 from its average, not down to the past minimum.
   - Right-size transport for actual commute, not aspirational.
   - Discretionary buffer at 5% of net (10% for irregular income) for unplanned items.
5. **Reconcile to zero.** If the plan doesn't balance, apply the cut order in the Determinism rules decision table. Zero-based: every dollar is allocated. Envelope: per-category caps + a "general" envelope. Anti-budget: savings + fixed are auto-pulled; "the rest" is the spending budget.
6. **Build the tracker.** A simple table the user updates weekly to compare planned vs actual. Markdown checklist format works well.

## Required citations

- Fixed obligations cite the most recent statement / pay stub.
- Variable allocations cite the Category Audit averages used as the basis.
- Any aspirational target ("cut dining 20%") is flagged as a stretch, not a plan.

## Deliverable shape

- Markdown report `./money-desk/<ACCOUNT>/monthly-plan-<YYYYMMDD>.md`:
  - **Take-home and assumptions.**
  - **Plan table:** category, planned $, basis (last-90d avg / target / fixed).
  - **Savings allocation** broken out separately and prominently.
  - **Discretionary buffer** with a note on how to use it.
  - **Tracker template** — copy-paste table for weekly check-ins.
- Offer XLSX with the plan + tracker on a second sheet.

## Notes

- The plan that survives contact with month 1 wins. Build something achievable, then tighten.
- Pay yourself first: if savings is at the end of the priority list, it never happens.
- Annual / irregular expenses (insurance, taxes, gifts, car maintenance) should hit monthly sinking funds, not the month they're due.
- Re-run this skill quarterly or whenever a fixed obligation changes by >10%.

## Determinism rules

### Input keys

- `take_home_monthly_usd` — number; monthly take-home (post-tax, post-payroll-deductions)
- `income_irregular` — bool; true for variable / commission / self-employed income
- `take_home_last_12_months_usd` — list of 12 numbers (required when `income_irregular` = true)
- `fixed_obligations` — list of `{ name, monthly_usd, is_debt_minimum (bool) }` (rent/mortgage, utilities, insurance, debt minimums, childcare, kept subscriptions)
- `annual_irregular_expenses` — list of `{ name, annual_usd }` (insurance premiums, gifts, car maintenance, property tax not escrowed)
- `savings_goals` — list of `{ name, monthly_usd }` in the user's priority order (emergency fund, retirement if not payroll-deducted, sinking funds)
- `variable_baseline_usd` — map category → $/month from Category Audit monthly averages
- `discretionary_categories` — list of category names the user treats as discretionary (dining, entertainment, travel, hobbies, shopping sub-categories)
- `plan_style` — `zero_based` | `envelope` | `anti_budget`
- `household_mode` — `single` | `combined` | `separate`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Take-home income | **Ask — no default** | — |
| Fixed obligations | **Ask — no default** | — |
| Variable baseline | **Ask — no default** (run Category Audit first) | — |
| Savings goals | **Ask — no default** ($0 is a valid answer) | — |
| Plan style | `zero_based` | `[ASSUMPTION]` |
| Discretionary buffer | 5% of baseline income; 10% when `income_irregular` = true | `[ASSUMPTION]` |

### Calculation method

1. **Baseline income** = `take_home_monthly_usd`; if `income_irregular` = true, = `min(take_home_last_12_months_usd)`.
2. **Fixed total** = Σ `fixed_obligations.monthly_usd`.
3. **Sinking funds** = Σ `ceil(annual_usd ÷ 12)` per irregular expense (whole dollars, rounded up).
4. **Savings total** = Σ `savings_goals.monthly_usd`.
5. **Buffer** = `round(baseline × 0.05)` (0.10 if irregular), whole dollars.
6. **Variable allocations:** each `variable_baseline_usd` category rounded **up** to the nearest $10.
7. **Shortfall** = (fixed + sinking + savings + Σ variable + buffer) − baseline. Negative = surplus.
8. **Apply the decision rule** that fires (below). Cuts are pro-rata: each affected line × (1 − cut ÷ that group's total), rounded down to the nearest $1; any leftover cents go to the largest line in the group.
9. **Surplus assignment** (shortfall < 0): `zero_based` → first savings goal in priority order (or a new "General savings" line if none); `envelope` → a "General" envelope; `anti_budget` → the spending pool.
10. **Reconcile:** zero-based and envelope plans must total exactly baseline income; anti-budget shows savings + fixed + sinking auto-pulled and "the rest" as one spending number.
11. **Rounding:** whole dollars throughout; show the reconcile line `Σ plan − baseline = $0`.

### Decision rules

Evaluate top to bottom; the first match wins. `D` = Σ variable allocations in `discretionary_categories`; `S` = savings total.

| # | Condition | Plan action |
|---|---|---|
| 1 | fixed total ≥ baseline income | Not plannable — fixed costs consume all income; route to Debt Strategist if debt minimums ≥ 20% of baseline, else flag housing/income review |
| 2 | shortfall ≤ 0 | Balanced — assign surplus per step 9 |
| 3 | shortfall ≤ 0.5 × D | Cut discretionary categories pro-rata by the shortfall; mark each cut "stretch" |
| 4 | shortfall ≤ 0.5 × D + 0.5 × S | Cut discretionary by 0.5 × D, then savings goals pro-rata for the rest; flag "savings below goal" |
| 5 | Otherwise | Deficit plan — show the unbalanced plan and the gap; route to Category Audit for cuts and Debt Strategist if debt minimums are present |

Re-run triggers: any fixed obligation changes by > 10%, or quarterly.

### Output template

```markdown
# Monthly Plan — {YYYY-MM} ({plan_style})

## Take-home and assumptions
Baseline income: **${baseline}** ({"stated take-home" or "lowest of last 12 months"}). Buffer rate: {5 or 10}%. Decision rule fired: #{n}.

## Plan
| Category | Group | Planned $/mo | Basis |
|---|---|---|---|
{Group = Fixed / Sinking / Savings / Variable / Buffer; Basis = statement / Category Audit avg / goal / annual ÷ 12 / rule}

## Savings allocation
| Goal | Planned $/mo | Status |
|---|---|---|

## Discretionary buffer
${buffer}/mo for unplanned items; unused buffer rolls to {first savings goal}.

## Reconcile
Σ plan ${total} − baseline ${baseline} = **${difference}**

## Stretch items and gaps
{cuts marked stretch, savings below goal, deficit amount — or "None"}

## Tracker
| Category | Planned | Week 1 | Week 2 | Week 3 | Week 4 | Actual | Over / under |
|---|---|---|---|---|---|---|---|
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
