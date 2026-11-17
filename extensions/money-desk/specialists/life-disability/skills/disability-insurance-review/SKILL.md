# Disability Insurance Review

description: Review and size long-term disability (LTD) coverage — the most under-bought insurance relative to actual risk for working-age adults. A 30-year-old has a ~25% chance of being disabled before 65; lost income dwarfs the lifetime cost of any other insurable loss.

## When to use

- User is working-age (especially 25–55) and dependent on earned income.
- User just changed jobs (group LTD almost always shrinks vs prior or vs need).
- User is self-employed / 1099 / partner (no group LTD — individual policy is the only option).
- User has high income (>$100k) — group LTD typically caps and replaces too little.
- User is in a physically demanding or specialty profession (surgeon, dentist, pilot — needs own-occupation).

## Inputs needed

- Gross annual income (W-2, K-1, 1099 — list separately).
- Pre-tax employee benefits (if employer LTD premium is paid pre-tax, benefits are TAXABLE; if post-tax, benefits are tax-FREE — flips the replacement math).
- Existing group LTD: benefit %, monthly cap, elimination period, benefit period, own-occ vs any-occ definition, mental/nervous limit.
- Existing individual disability policy details if any.
- Other coverage: SSDI (effectively useless under 50; strict definition), state programs (CA, NY, NJ, RI, HI, PR have state disability).
- Monthly fixed expenses + dependents.
- Emergency fund size.

## Workflow

1. **Compute net income need.** Target 60% of GROSS as an after-tax benefit (which approximates 100% of NET after the user's income tax + payroll taxes go away); the 60% figure is fixed in Determinism rules. Subtract fixed reductions in retirement (savings, payroll tax) but add health insurance if employer was paying.
2. **Audit the group policy carefully.**
   - **Definition of disability** — "own occupation" (you can't do YOUR job) is the gold standard; "any occupation" (you can't do ANY job you're reasonably suited for) pays much less in practice.
   - **Benefit cap** — typical group cap $10–15k/mo. High earners often hit the cap and get a much lower replacement ratio than the headline percent.
   - **Taxability** — if employer pays the premium pre-tax, benefits are taxable → effective replacement is ~40% not 60%.
   - **Mental/nervous limit** — many group policies limit M/N to 24 months. Anxiety, depression, burnout claims are a meaningful share of claims.
   - **COLA rider** — without inflation adjustment, a 30-year claim loses huge purchasing power.
   - **Portability** — does it survive job change? Usually no.
3. **Identify the gap.** Net need − group benefit (after tax adjustment) = supplemental individual policy size.
4. **Supplemental individual policy specs to request:**
   - True own-occupation (specialty letters for physicians/dentists).
   - Non-cancelable, guaranteed renewable to age 65 or 67.
   - Future-purchase option / Benefit Increase Rider (lock in insurability while young + healthy).
   - Residual / partial disability rider.
   - COLA rider for 30+ year potential claims.
   - 90-day elimination period typical; 180 days if the emergency fund covers ≥ 6 months of fixed expenses.
5. **Self-employed users.** No group fallback exists. Individual policy + business overhead expense (BOE) policy (covers business fixed costs during disability) is the standard pair.
6. **Premium sanity check.** Quality individual LTD costs ~1–3% of income per year. For a 35-year-old non-smoker professional, $5k/mo benefit ~$1,500–$3,000/yr premium is typical (varies by occupation class).

## Required citations

- Disability probability stats cite SSA / Council for Disability Awareness.
- Group policy details cite the certificate of coverage / SPD.
- Tax treatment of benefits cites IRS Pub 525.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/disability-review-<YEAR>.md`:
  - Income-replacement target.
  - Current coverage audit (with after-tax effective benefit).
  - Gap size.
  - Individual policy spec sheet to shop.
  - Premium check against the 1–3%-of-income band (from carrier quotes).

## Notes

- Disability insurance is medically underwritten — quote and lock in EARLY while healthy.
- Two specialists, two coverages: doctors/dentists need TRUE own-occupation with specialty language.
- "Analysis only. Not professional insurance advice. Recommend a fee-only independent broker who can quote 3–4 carriers."

## Determinism rules

### Input keys

- `gross_annual_income_usd` — number, earned income (W-2 + 1099 + active K-1) covered by disability insurance
- `employment_type` — `w2` | `self_employed`
- `specialty_occupation` — bool (physician, dentist, surgeon, pilot, etc.)
- `group_ltd` — `{ benefit_pct, monthly_cap_usd, elimination_days, benefit_period, definition (own_occ | any_occ | modified_own_occ), mental_nervous_limit_months, premium_paid_by (employer_pretax | employee_aftertax), cola (bool), portable (bool) }` or null
- `individual_policies` — list of `{ monthly_benefit_usd, definition, cola (bool), noncancelable (bool) }`
- `state_disability_program` — bool
- `effective_tax_rate_pct` — number, %, combined average federal + state rate expected on a taxable benefit
- `monthly_fixed_expenses_usd` — number
- `emergency_fund_usd` — number
- `business_fixed_expenses_monthly_usd` — number (self-employed only; default 0)
- `individual_quote_annual_premium_usd` — number (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, group policy terms | **Ask — no default** (certificate of coverage / SPD) | — |
| Replacement target | 60% of gross earned income, treated as an after-tax target (≈ net pay once payroll and income taxes stop) | `[ASSUMPTION]` |
| Tax rate on a taxable benefit | **Ask — no default** | — |
| Individual-policy benefits | Tax-free (premium paid with after-tax dollars) | IRS Pub 525 |
| SSDI and state programs | Excluded from the gap (offsets / strict definitions) | `[ASSUMPTION]` |
| Elimination period | 90 days; 180 days if `emergency_fund_usd ≥ 6 × monthly_fixed_expenses_usd` | `[ASSUMPTION]` |
| Premium sanity band | 1%–3% of gross income (Workflow step 6) | `[ASSUMPTION]` |

### Calculation method

1. `gross_monthly = gross_annual_income_usd / 12`; `target = 0.60 × gross_monthly`.
2. `group_gross = min(benefit_pct/100 × gross_monthly, monthly_cap_usd)` (0 if no group LTD).
3. `group_after_tax = group_gross × (1 − effective_tax_rate_pct/100)` if `premium_paid_by = employer_pretax`, else `group_gross`.
4. `individual_total = Σ individual_policies.monthly_benefit_usd`.
5. `gap = max(0, target − group_after_tax − individual_total)`; supplemental benefit to shop = `ceil(gap / 100) × 100`.
6. `effective_replacement_pct = (group_after_tax + individual_total) / gross_monthly × 100`, 1 decimal.
7. `expense_coverage_pct = (group_after_tax + individual_total) / monthly_fixed_expenses_usd × 100`, 1 decimal.
8. Elimination period per the Assumptions rule.
9. Premium check (if quote given): `premium_pct = individual_quote_annual_premium_usd / gross_annual_income_usd × 100`; flag "above typical band" if > 3.0.
10. Audit flags (fixed order): definition = any_occ; mental_nervous_limit_months ≤ 24; no COLA; not portable; benefit cap binding (`group_gross = monthly_cap_usd`).
11. Report dollars whole, percentages to 1 decimal. Missing group terms → stop and list them.

### Decision rules

Evaluate top to bottom; the first match is the recommendation.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Required input missing | No recommendation — list the missing inputs |
| 2 | `employment_type = self_employed` and gap > 0 | Individual own-occ policy for the gap; add Business Overhead Expense cover if `business_fixed_expenses_monthly_usd > 0` |
| 3 | Gap ≥ $500/month | Supplemental individual policy for the gap (spec sheet below) |
| 4 | `specialty_occupation` and group `definition ≠ own_occ` and no individual own-occ policy | Individual true own-occupation policy (specialty language) even though the gap is under $500 |
| 5 | Gap > 0 | Optional — gap under $500/month; cover it from the emergency fund or a small individual policy |
| 6 | Otherwise | Coverage meets the target; address audit flags only |

### Output template

```markdown
# Disability Insurance Review — {year}

## Headline
{recommendation} (Decision rule #{n}). Effective replacement today: **{effective_replacement_pct}%** of gross vs 60% target.

## Income-replacement target
| Item | Monthly |
|---|---|
| Gross earned income | |
| Target (60%) | |

## Current coverage
| Source | Gross benefit | Taxable? | After-tax benefit |
|---|---|---|---|
| Group LTD | | | |
| Individual | | | |
| **Total** | | | |

## Gap
{gap and rounded supplemental benefit; expense coverage %}

## Group policy audit
| Check | Finding |
|---|---|
| Definition of disability | |
| Benefit cap binding | |
| Mental / nervous limit | |
| COLA | |
| Portability | |

## Individual policy spec sheet
{benefit, own-occ, non-cancelable to 65/67, FPO/BIR, residual, COLA, elimination period — or "Not applicable — no gap"}

## Premium check
{premium % of income vs 1–3% band, or "Not applicable — no quote supplied"}

## Actions
- {quote 3–4 carriers via independent broker; apply while healthy}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
