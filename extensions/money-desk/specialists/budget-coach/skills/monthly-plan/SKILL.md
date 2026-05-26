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
   - Round dining/groceries up to a comfortable ceiling, not the past minimum.
   - Right-size transport for actual commute, not aspirational.
   - Discretionary buffer at 5–10% of net for unplanned items.
5. **Reconcile to zero.** Zero-based: every dollar is allocated. Envelope: per-category caps + a "general" envelope. Anti-budget: savings + fixed are auto-pulled; "the rest" is the spending budget.
6. **Build the tracker.** A simple table the user updates weekly to compare planned vs actual. Markdown checklist format works well.

## Required citations

- Fixed obligations cite the most recent statement / pay stub.
- Variable allocations cite the Category Audit averages used as the basis.
- Any aspirational target ("cut dining 20%") is flagged as a stretch, not a plan.

## Deliverable shape

- Markdown report `./reports/<ACCOUNT>/monthly-plan-<YYYYMMDD>.md`:
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
