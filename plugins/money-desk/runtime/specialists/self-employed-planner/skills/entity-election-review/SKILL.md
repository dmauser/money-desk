## Entity & S-Corp Election Review

description: For a sole prop / single-member LLC owner, analyze whether electing S-corp tax treatment (Form 2553) would save more in payroll taxes than it adds in administrative cost. Includes reasonable-compensation analysis, payroll-service costs, separate return / state franchise costs, and break-even net-income threshold. Does NOT file the election.

## When to use

- Net SE income at or above the break-even computed in Determinism rules (illustratively ~$60k–$80k when admin is ~$2,000).
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
   - As sole prop: net SE × 92.35% × 15.3% SE tax (SS portion up to `social_security_2026.wage_base`; then 2.9% Medicare on remainder; Additional Medicare above $200k/$250k).
   - As S-corp: pay yourself reasonable W-2 wages → FICA (employee 7.65% + employer 7.65% = 15.3% on wage). Remaining net (distributions) NOT subject to FICA.
   - **Savings = 15.3% × (net SE − reasonable W-2 wage)**, capped at SS wage base for the SS portion.
2. **Estimate reasonable compensation.**
   - IRS scrutiny: low-balling W-2 wage is the #1 audit trigger for S-corps.
   - Methods: market-rate-for-the-role survey (BLS, RC Reports, salary.com); profit-split methods; or rule-of-thumb "60/40 wage/distribution" — flag that rule-of-thumb is risky if audited; defensible benchmark is better.
   - Illustration only: for a consultant grossing $200k, reasonable comp is often $80k–$130k depending on the specialty — the analysis uses the user's cited benchmark (Determinism rules).
3. **Compute admin cost.**
   - **Payroll service**: Gusto/Square/QuickBooks Payroll ~$40–$80/mo + ~$6 per employee → ~$500–$1,000/yr.
   - **Separate tax return**: Form 1120-S preparation by CPA → typically $800–$2,500/yr.
   - **State franchise / minimum tax**: e.g., CA $800/yr minimum + 1.5% of net income; NY ~$25; varies wildly.
   - **Bookkeeping cleanup**: S-corp requires real bookkeeping; if user is currently winging it, add bookkeeper cost.
   - **Total annual admin** typically $2,000–$5,000.
4. **Break-even calculation.**
   - Savings − admin = net benefit.
   - **Compute the break-even** per Determinism rules step 8 (illustratively $60k–$80k net SE when admin is ~$2,000). Below it, S-corp loses money or barely breaks even *AND* adds operational burden — Decision rule 3.
   - Above the SS wage base (`social_security_2026.wage_base`), the FICA savings per extra dollar drops from 15.3% to 2.9% (Medicare only), so the marginal benefit of distributions vs higher wage diminishes above that band.
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

## Determinism rules

### Input keys

- `current_entity` — `sole_prop` | `smllc` | `partnership` | `s_corp`
- `net_se_income_prior_usd` — number; prior-year Schedule C net (or K-1 SE earnings)
- `net_se_income_current_usd` — number; current-year projection
- `net_se_income_3yr_avg_usd` — number; expected 3-year average; optional
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `other_ss_wages_usd` — number; the owner's other W-2 Social Security wages this year; default 0
- `state` — two-letter code
- `reasonable_comp_usd` — number; benchmarked W-2 salary for the role
- `reasonable_comp_source` — string (BLS OEWS, RC Reports, salary survey, etc.)
- `payroll_service_annual_usd`, `cpa_1120s_annual_usd`, `state_entity_tax_annual_usd`, `bookkeeping_added_annual_usd` — numbers; admin cost quotes
- `clean_books` — bool; separate business account and monthly reconciled books today

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Net SE income | **Ask — no default** | — |
| SS wage base, SS and Medicare rates | `md_facts` → `social_security_2026.wage_base`, `fica_employee_rate`, `medicare_employee_rate` | `[SSA 2026]` |
| Additional Medicare | `md_facts` → `social_security_2026.additional_medicare_rate_above_threshold_mfj_250k` (applies to wages and SE income alike — excluded from the comparison) | `[SSA 2026]` |
| SE earnings factor | 92.35% (statutory) | — |
| Reasonable compensation | **Ask — benchmark required.** If absent, an illustrative 60% of net (this skill's rule-of-thumb) is used and the recommendation is capped at rule 4 | `[ASSUMPTION — not audit-defensible]` |
| Admin costs (payroll, 1120-S prep, state entity tax, bookkeeping) | **Ask — quotes preferred.** If absent, total = $5,000/yr (top of this skill's stated $2,000–$5,000 typical range — conservative), with a $2,000 sensitivity row | `[ASSUMPTION]` |
| State entity / franchise tax | Not in md_facts — look up via `md_sources` (state DoR), else included only if the user supplies it and tagged `[UNSOURCED]` | `[UNSOURCED]` |
| Income-tax side effects (half-SE vs employer-FICA deduction, QBI changes, retirement-plan base) | Excluded from the dollar comparison; listed as trade-offs | `[ASSUMPTION]` |

### Calculation method

Compute in cents; report whole dollars. md_facts rates are decimals.

1. **Planning income** `N = min(net_se_income_current_usd, net_se_income_3yr_avg_usd)` if the average is supplied, else `net_se_income_current_usd`.
2. **Sole-prop SE tax.** `b = N × 0.9235`; `room = max(0, wage_base − other_ss_wages_usd)`; `se_tax = 2 × fica_employee_rate × min(b, room) + 2 × medicare_employee_rate × b`.
3. **Wage** `W = reasonable_comp_usd`, or `0.60 × N` if absent. If `W ≥ N`, skip to Decision rule 2.
4. **S-corp FICA** (employee + employer) on `W`: `fica = 2 × fica_employee_rate × min(W, room) + 2 × medicare_employee_rate × W`.
5. **Gross savings** `S = se_tax − fica`.
6. **Admin** `A = sum of the four admin inputs` (or the $5,000 fallback).
7. **Net benefit** `B = S − A`.
8. **Break-even.** Holding the wage ratio `r = W / N` fixed, find the smallest `N'` in $1,000 steps from $0 to $1,000,000 where steps 2–7 give `B ≥ 0`, and likewise `N_1k` where `B ≥ $1,000`. If none, report "no break-even below $1,000,000".
9. **Sensitivity table**: `B` at `N × 0.8`, `N`, `N × 1.2`, and (if admin was defaulted) at `A = $2,000`.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `N` missing | No analysis — ask |
| 2 | `W ≥ N` | Don't elect — no distribution left to save FICA on |
| 3 | `B < $1,000` | Don't elect / wait — revisit when planning income reaches `N_1k`. If `current_entity = s_corp`, review revocation with a CPA |
| 4 | Reasonable comp was defaulted (no benchmark) | Lean elect — obtain a cited reasonable-comp benchmark before filing Form 2553 |
| 5 | `$1,000 ≤ B < $3,000` and `clean_books = false` | Wait — set up clean books and payroll first, then elect |
| 6 | Otherwise | Elect S-corp (Form 2553 within 2 months 15 days of the tax-year start for current-year effect) |

### Output template

```markdown
# S-Corp Election Review — {date}

## Headline
At **${N}** planning income, S-corp saves **${S}** in payroll tax against **${A}** admin → net **${B}/yr**. Recommendation: **{rule # action}**.

## Savings calculation
| Line | Sole prop | S-corp |
|---|---|---|
| Net income | | |
| SE base (× 92.35%) / W-2 wage | | |
| Social Security portion | | |
| Medicare portion | | |
| Total payroll tax | | |
| Distribution (not subject to FICA) | n/a | |

## Reasonable compensation
${W} — source: {reasonable_comp_source or "[ASSUMPTION — 60% rule-of-thumb, not audit-defensible]"}

## Admin cost itemization
| Item | Annual cost | Source |
|---|---|---|

## Break-even
| Scenario | Planning income | Net benefit B |
|---|---|---|
Break-even planning income: **${N'}** · Income for $1,000 net benefit: **${N_1k}**

## Hidden trade-offs
- Retirement-plan base shifts to W-2 wage · health insurance through payroll · accountable plan for auto · disability coverage on W-2 · audit attention · state treatment ({state})

## If electing — filing checklist
{Form 2553 deadline, payroll setup, bookkeeping — or "Not applicable — rule #{n}"}

## Assumptions & flags
- {each [ASSUMPTION] / [UNSOURCED] item}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
