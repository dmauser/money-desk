# Student Loan Review

description: Review federal and private student loans — repayment plan choice (IDR variants), PSLF eligibility, refinance trade-offs, and aggressive payoff vs invest-the-difference. Federal-vs-private framing is central. Use for any student-loan question.

## When to use

- Recent grad enrolling in a repayment plan.
- Working in qualifying public-service employment (PSLF candidate).
- Considering refinancing federal loans to private.
- Lump-sum decision (bonus → loans or → invest?).

## Inputs needed

- Per loan: lender (federal servicer or private), balance, rate, type (Direct Sub/Unsub, Grad PLUS, Parent PLUS, Perkins, FFEL, private), current repayment plan, months remaining.
- Total federal vs private split.
- Income, family size (drives IDR payment calc).
- Employer type (qualifying nonprofit / government for PSLF).
- Career horizon (likelihood of staying in qualifying employment for 120 payments).

## Workflow

1. **Separate federal from private.** Federal loans have unique protections (IDR, PSLF, deferment, forbearance, death/disability discharge) that should NOT be given up lightly.
2. **Federal repayment plan selection.**
   - Standard 10y — fastest, most total interest typically lowest unless IDR forgiveness applies.
   - Graduated / Extended — niche.
   - IDR variants (SAVE, PAYE, IBR, ICC — confirm currently-available plans by working year, as the landscape shifts with policy changes). IDR payment = % of discretionary income; remaining balance forgiven at 20/25/10 years depending on plan and tier.
3. **PSLF qualification.** Working at qualifying employer (501(c)(3), gov't), on IDR plan (or 10y standard), making 120 qualifying payments. Track via PSLF Help Tool. If on path → minimize payments (IDR), do NOT prepay.
4. **Refinance decision (federal → private).**
   - Pros: lower rate (if credit + income strong).
   - Cons: lose IDR, PSLF, death/disability discharge, deferment options.
   - Strong refi case: high-income borrower, no PSLF intent, large balance with high rate.
   - Weak refi case: any PSLF possibility, lower income, uncertain employment.
5. **Payoff vs invest the difference.** Compare loan rate (after any tax benefit) to expected real after-tax return. Rate ≥ 7% → pay aggressively. Rate ≤ 5% → minimum + invest the surplus. 5–7% → split extra cash 50/50. Loans on a PSLF / IDR-forgiveness path are never prepaid (Determinism rules table B).
6. **Tax interaction.** Student loan interest deduction up to $2,500/yr (IRC § 221); the income phase-out range is year-specific and not in `md_facts` — look it up via `md_sources` (IRS Pub. 970) or tag `[UNSOURCED]`. IDR forgiveness has been temporarily tax-free under recent law — flag the current working-year status.
7. **Action list.** Specific plan name to enroll in, employment certification cadence (annual for PSLF), refi quotes to gather if applicable.

## Required citations

- Loan terms cite the most recent statement / NSLDS export.
- IDR formula cites StudentAid.gov for the current plan rules.
- PSLF rules cite the PSLF Help Tool / StudentAid.gov.

## Deliverable shape

- Markdown report `./money-desk/debt-strategist/student-loan-review-<YYYYMMDD>.md`:
  - **Inventory** — federal vs private split, balances, rates.
  - **Recommended path** — Standard / IDR / PSLF / Refi — with reasoning.
  - **Projected total paid** under recommended path.
  - **Risks / decisions to revisit** — career change, family size change, policy change.
  - **Action list** — enrollment, certifications, quotes.

## Notes

- Policy on IDR plans (SAVE etc.) has changed multiple times in recent years. Always verify against StudentAid.gov for the working date.
- "Don't refi federal loans to private without a clear-eyed read of what you're giving up."
- "Not professional financial or legal advice."

## Determinism rules

### Input keys

- `loans` — list of `{ name, servicer, federal (bool), type (direct_sub | direct_unsub | grad_plus | parent_plus | perkins | ffel | private), balance_usd, rate_pct, current_plan, months_remaining, qualifying_pslf_payments_made (integer, federal only) }`
- `agi_usd` — number; most recent adjusted gross income
- `household_size` — integer
- `state` — two-letter code
- `filing_status` — `mfj` | `mfs` | `single` | `hoh`
- `employer_type` — `government` | `501c3` | `other_nonprofit` | `for_profit`
- `years_expected_in_qualifying_employment` — number
- `income_growth_pct` — number (optional)
- `extra_cash_monthly_usd` — number (optional; for payoff vs invest)
- `private_refi_quote` — `{ rate_pct, term_months }` (optional)
- `income_stable` — bool (user's own assessment)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Loan details, AGI, household size, employer type | **Ask — no default** (NSLDS export / statements) | — |
| Currently available repayment plans, IDR payment % and poverty-line multiple, forgiveness periods | Not in `md_facts` — look up on StudentAid.gov via `md_sources` for the working date; if unreachable, IDR math is not run and the figures are `[UNSOURCED]` | `[UNSOURCED]` |
| Poverty guideline | `md_facts` → `federal_poverty_level_2026_48_states.household_size_to_fpl` (48 states + DC; AK / HI via `md_sources`) | `[HHS FPL 2026]` |
| Income growth | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` (flat real income) | `[ASSUMPTION]` |
| Expected investment return (payoff vs invest) | `(1 + long_term_equity_real_return_percent)(1 + long_term_inflation_percent) − 1` from `md_facts` → `behavioral_assumptions_safe_defaults` | `[ASSUMPTION]` |
| Student-loan interest deduction limit and phase-out | Not in `md_facts` — look up via `md_sources` (IRS Pub. 970), else `[UNSOURCED]` | `[UNSOURCED]` |
| Tax treatment of IDR forgiveness in the forgiveness year | Not in `md_facts` — verify via `md_sources` for the working year | `[UNSOURCED]` |

### Calculation method

> **Calculator:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. **Split** loans into federal and private; totals and balance-weighted average rate for each (2 decimals).
2. **Standard 10-year** per federal loan: amortize `balance` over 120 months at `rate_pct/100/12`; total paid = payment × 120 (last payment adjusted to the cent).
3. **IDR** (only with sourced plan parameters): `discretionary = max(0, agi_usd − multiple × FPL(household_size))`; `monthly = pct/100 × discretionary ÷ 12`, capped where the plan caps it; project 12-month steps with AGI grown by `income_growth_pct`; balance accrues interest at the weighted rate (unpaid-interest rules per the sourced plan); stop at payoff or at the plan's forgiveness month. Total paid = Σ payments; forgiven = balance at that month.
4. **PSLF:** `remaining = 120 − qualifying_pslf_payments_made`; on track if `employer_type` ∈ {government, 501c3} and `years_expected_in_qualifying_employment × 12 ≥ remaining`. PSLF total paid = Σ IDR payments for `remaining` months.
5. **Private refi** (if quote): new payment by amortization; total paid; interest saving vs the current path.
6. **Payoff vs invest** for each loan: compare `rate_pct` with the thresholds in Decision table B.
7. **Rounding:** compute in cents; report whole dollars; rates 2 decimals.

### Decision rules

**A. Path for federal loans** — evaluate top to bottom; first match wins.

| # | Condition | Path |
|---|---|---|
| A1 | PSLF on track (step 4) | PSLF via the lowest-payment qualifying IDR plan; minimum payments only; annual employment certification |
| A2 | IDR parameters sourced and IDR total paid ≤ 90% of standard 10-year total paid | IDR — name the plan |
| A3 | No PSLF track, `income_stable` = true, private quote ≥ 1.00 pp below the federal weighted rate | Refinance quote is valid — present the protections lost (IDR, PSLF, deferment, death/disability discharge); user decides |
| A4 | Otherwise | Standard 10-year (or the user's current plan if it pays off sooner) |

**B. Extra cash** (for any loan not on a forgiveness path) — evaluate top to bottom.

| # | Condition | Extra cash goes to |
|---|---|---|
| B1 | Loan is on PSLF or IDR-forgiveness path | Invest / other goals — do not prepay |
| B2 | `rate_pct` ≥ 7.00 | Prepay this loan (highest rate first) |
| B3 | `rate_pct` ≤ 5.00 | Minimum payment; invest the surplus |
| B4 | Otherwise (5–7%) | Split 50 / 50 between prepaying and investing |

**C. Private loans** — rate ≥ 7.00 and a refi quote ≥ 1.00 pp lower → refinance; rate ≥ 7.00 without a better quote → prepay per B2; otherwise keep.

### Output template

```markdown
# Student Loan Review — {YYYY-MM-DD}

## Inventory
| Loan | Federal / private | Type | Balance | Rate | Current plan | Months remaining |
|---|---|---|---|---|---|---|
| **Federal total** | | | | {weighted} | | |
| **Private total** | | | | {weighted} | | |

## Recommended path
**{PSLF / IDR ({plan}) / Standard 10-year / Refinance (private)}** — rule {A#}: {reason}.

## Projected total paid
| Path | Monthly (first year) | Total paid | Forgiven | Payoff / forgiveness date |
|---|---|---|---|---|
| Standard 10-year | | | | |
| IDR ({plan}) | {or "Not applicable — plan parameters not sourced"} | | | |
| PSLF | {or "Not applicable — not on track"} | | | |
| Private refi | {or "Not applicable — no quote"} | | | |

## Extra cash
| Loan | Rate | Rule | Action |
|---|---|---|---|

## Tax notes
{interest deduction (sourced), forgiveness taxability (sourced) — or [UNSOURCED] flags}

## Risks / decisions to revisit
- {career change, family-size change, policy change}

## Action list
- {plan enrollment, PSLF certification cadence, refi quotes}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
