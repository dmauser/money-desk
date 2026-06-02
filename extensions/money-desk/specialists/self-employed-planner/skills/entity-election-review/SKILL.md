## Entity & S-Corp Election Review

description: For a sole prop / single-member LLC owner, analyze whether electing S-corp tax treatment (Form 2553) would save more in payroll taxes than it adds in administrative cost. Includes reasonable-compensation analysis, payroll-service costs, separate return / state franchise costs, and break-even net-income threshold. Does NOT file the election.

## When to use

- Net SE income consistently above ~$60k–$80k (the typical break-even band).
- Asked directly: "Should I S-corp?" / "LLC vs S-corp" / "Should I make the S-election?"
- Already elected but income has dropped — re-evaluate whether to keep it or revoke.
- New consultant who got the "everyone should S-corp" pitch — sanity-check the math.

## Inputs needed

- Current entity (sole prop / single-member LLC / partnership).
- Net SE income — prior year actual + current year projection + 3-yr expected average.
- State of residence (some states tax S-corps separately; e.g., CA has $800 minimum franchise tax + 1.5% net income; NYC has GCT/UBT).
- User's location of services / market for reasonable-compensation benchmarking.
- Bookkeeping situation (do they have a CPA? bookkeeper? clean books?).
- Time-availability and process tolerance (S-corp adds real ops burden).

## Workflow

1. **Compute payroll-tax savings ceiling.**
   - As sole prop: full net SE × 15.3% SE tax (up to SS wage base $176,100 for 2025; then 2.9% Medicare on remainder; +0.9% above $200k/$250k).
   - As S-corp: pay yourself reasonable W-2 wages → FICA (employee 7.65% + employer 7.65% = 15.3% on wage). Remaining net (distributions) NOT subject to FICA.
   - **Savings = 15.3% × (net SE − reasonable W-2 wage)**, capped at SS wage base for the SS portion.
2. **Estimate reasonable compensation.**
   - IRS scrutiny: low-balling W-2 wage is the #1 audit trigger for S-corps.
   - Methods: market-rate-for-the-role survey (BLS, RC Reports, salary.com); profit-split methods; or rule-of-thumb "60/40 wage/distribution" — flag that rule-of-thumb is risky if audited; defensible benchmark is better.
   - For a consultant grossing $200k, reasonable comp is typically $80k–$130k depending on the specialty.
3. **Compute admin cost.**
   - **Payroll service**: Gusto/Square/QuickBooks Payroll ~$40–$80/mo + ~$6 per employee → ~$500–$1,000/yr.
   - **Separate tax return**: Form 1120-S preparation by CPA → typically $800–$2,500/yr.
   - **State franchise / minimum tax**: e.g., CA $800/yr minimum + 1.5% of net income; NY ~$25; varies wildly.
   - **Bookkeeping cleanup**: S-corp requires real bookkeeping; if user is currently winging it, add bookkeeper cost.
   - **Total annual admin** typically $2,000–$5,000.
4. **Break-even calculation.**
   - Savings − admin = net benefit.
   - **Break-even is typically $60k–$80k net SE** if admin cost is ~$2,000. Below that, S-corp loses money or barely breaks even *AND* adds operational burden — usually not worth it.
   - Above $176,100 wage cap, the FICA savings per extra dollar drops from 15.3% to 2.9% (Medicare only), so the marginal benefit of distributions vs higher wage diminishes above that band.
5. **Surface trade-offs S-corp creates.**
   - **Retirement-plan math shifts.** Solo 401(k) employer contribution is based on W-2 wage (lower base) vs sole prop net SE — can REDUCE total retirement contribution capacity.
   - **Health insurance deduction** must flow through W-2 wages for >2% S-corp shareholders — extra payroll step.
   - **Auto deductions** are different (need accountable plan or W-2 reimbursement).
   - **Disability insurance** based on W-2 wage, not total income.
   - **Mortgage qualification** often easier with W-2 income show vs Sch C profit.
   - **Audit risk** is meaningfully higher.

## Required citations

- Reasonable-comp methodology cites IRS guidance + at least one benchmark source.
- SS wage base, FICA rates, Additional Medicare thresholds cite current-year IRS tables.
- State franchise / minimum-tax figures cite the state DoR.
- Payroll-service / CPA cost ranges cite "industry typical" with provider examples.

## Deliverable shape

Markdown report `./money-desk/self-employed-planner/s-corp-election-<YYYYMMDD>.md`:
- **Headline** — e.g., "At $145k net SE, S-corp saves ~$5,800/yr in FICA after $3,200/yr admin → net $2,600/yr. Worth it but tight; budget for CPA + payroll service before electing."
- **Savings calculation** — current SE tax vs projected S-corp FICA, line by line.
- **Reasonable comp benchmark** — recommended W-2 wage with sources.
- **Admin cost itemization** — payroll, CPA, state franchise, bookkeeping.
- **Break-even table** — net SE thresholds where S-corp becomes / stops being worthwhile.
- **Hidden trade-offs** — bulleted (retirement, health, mortgage, audit).
- **Recommendation** — elect / don't elect / wait until income reaches $X.
- **If electing**: filing checklist (Form 2553, deadline = 2 months 15 days into the tax year for current-year effect; payroll setup; bookkeeping setup).

## Notes

- S-corp election is "easy to make, painful to undo" — IRS generally requires 5 years before re-electing. Take it seriously.
- Some states don't recognize the S-election (e.g., NJ requires separate state election; CA taxes S-corps regardless). Always check.
- For very-high-income (>$400k net) consultants, the conversation often shifts from "S-corp vs sole prop" to "S-corp + Defined Benefit plan" — recommend a CPA at that scale.
- Solo entrepreneurs who hate paperwork and time-on-back-office may rationally pass even if math says elect. Operational fit matters.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).