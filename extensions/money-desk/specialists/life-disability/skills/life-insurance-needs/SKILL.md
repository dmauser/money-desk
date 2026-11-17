# Life Insurance Needs

description: Calculate term life insurance need using the DIME / income-replacement / human-life-value methods. Outputs a recommended face amount, term length, and approximate premium range. Use after marriage, kid, home purchase, or when the user asks "how much life insurance do I need?"

## When to use

- Marriage or new dependent.
- Home purchase with a mortgage co-signed by a non-earning or lower-earning spouse.
- The user has a policy and wants to verify it's enough.
- Renewing or converting an existing policy.

## Inputs needed

- Age, sex, smoking status, broad health profile.
- Income of insured + spouse.
- Dependents' ages.
- Mortgage balance + other debts.
- Existing life coverage (employer + private).
- Estimated college / education funding goal.
- Final-expenses estimate (~$15k).

## Workflow

1. **Method 1 — DIME (Debt + Income + Mortgage + Education):**
   - **D** — total non-mortgage debts.
   - **I** — annual income × `income_replacement_years` (the user's choice; the intake form suggests 10–20, longer if dependents are young).
   - **M** — outstanding mortgage balance.
   - **E** — estimated education funding for dependents.
   Sum.
2. **Method 2 — Income replacement.** Annual income × multiplier, shown at both 10× and 15× for a primary earner. Crude but quick; a cross-check only.
3. **Method 3 — Human Life Value.** PV of future earnings stream net of personal consumption. More rigorous; computed only when retirement age and consumption % are supplied.
4. **Subtract existing coverage** (group life + private life; disability coverage does not count). Note employer coverage usually ends if user leaves the job and conversion options are expensive.
5. **Recommend term length** matching the longest dependent-period need (the longest of: youngest child reaching 22, mortgage payoff, or the income-replacement years — rounded up to the next 10/15/20/25/30-year term).
6. **Term vs permanent.** Default to term for most users. Permanent (whole/UL/IUL) is appropriate in narrow cases (estate-tax planning at HNW, lifetime care of a special-needs dependent). Surface the case for term + invest-the-difference explicitly.
7. **Smoker / health rating impact.** Premium can be 2–3× standard. If smoker, flag the option to re-rate after 1 year tobacco-free.
8. **Carrier strength.** A-rated or better. Long-tail product — carrier must outlive the policy term.
9. **Spouse coverage.** Non-earning spouse needs coverage too — replacement-of-services cost (childcare + home management) is often $40–80k/yr equivalent — ask the user for the local figure rather than assuming one.

## Required citations

- Income figures cite the most recent pay stub / tax return.
- Existing coverage cites the policy decs.
- Recommended face amount shows the build (DIME or replacement) explicitly.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/life-insurance-needs-<YYYYMMDD>.md`:
  - **Headline** — recommended face $ and term length.
  - **DIME buildup table.**
  - **Income-replacement cross-check.**
  - **Existing-coverage gap.**
  - **Approximate premium range** by health rating bucket (from carrier quotes; otherwise "to be quoted").
  - **Action list** — get quotes from 2–3 carriers, medical exam expectations.

## Notes

- Most users are under-insured.
- Never replace an existing policy without an in-force quote on the new one — gap risk during underwriting.
- Avoid mortgage life insurance (the bank-marketed product). Term life is cheaper and more flexible.
- "Not professional insurance advice."

## Determinism rules

### Input keys

Names match the intake schema `md_lp_skill_life_insurance_needs`; extra keys are optional.

- `age` — integer
- `smoker` — bool
- `health` — `Excellent` | `Good` | `Average` | `Below average`
- `annual_income` — number, USD/year gross income of the insured
- `spouse_income` — number, USD/year (default 0)
- `dependents_ages` — string, comma-separated ages, or `none`
- `income_replacement_years` — number, years of income to replace (user's choice)
- `mortgage_balance` — number, USD (default 0)
- `mortgage_years_remaining` — integer (optional)
- `other_debt` — number, USD, non-mortgage debts (default 0)
- `existing_coverage` — number, USD, group + private life coverage on the insured (default 0)
- `existing_group_coverage_usd` — number, USD, the employer-group portion of `existing_coverage` (optional; flagged as non-portable)
- `education_goal_per_child` — number, USD (default 0)
- `final_expenses_usd` — number, USD (optional)
- `retirement_age` — integer; `personal_consumption_pct` — number, % of income the insured personally consumes (both optional; Human Life Value only)
- `permanent_need_reason` — `none` | `estate_liquidity` | `special_needs_dependent` (default `none`)
- `insured_is_non_earning_spouse` — bool; `replacement_services_annual_usd` — number, USD/year cost to replace childcare / home management (only when insuring a non-earning spouse)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, dependents, years to replace | **Ask — no default** | — |
| Final expenses | **Ask**; if the user has no figure, $15,000 (the planning figure in Inputs needed) | `[ASSUMPTION: $15,000]` |
| Children counted for education | Each dependent aged ≤ 17 | `[ASSUMPTION]` |
| Real discount rate (Human Life Value only) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_bond_real_return_percent` (stored as a fraction); income held flat in today's dollars | `[ASSUMPTION]` |
| Personal consumption % (HLV only) | **Ask — no default**; HLV is skipped if absent | — |
| Replacement-of-services cost (non-earning spouse) | **Ask — no default** | — |
| Premiums | Carrier quotes only; otherwise "to be quoted" — never estimated | — |

### Calculation method

1. Parse `dependents_ages` into a list of integers (`none` → empty). `n_children` = count of ages ≤ 17. `youngest` = min age, or null.
2. **Income component** = `annual_income × income_replacement_years` (for a non-earning spouse: `replacement_services_annual_usd × income_replacement_years`).
3. **DIME need** = `other_debt` + income component + `mortgage_balance` + `education_goal_per_child × n_children` + final expenses.
4. **Gap** = `DIME need − existing_coverage`. **Recommended face** = `ceil(gap / 50,000) × 50,000` when gap > 0, else 0.
5. **Income-multiple cross-check** = `annual_income × 10` and `annual_income × 15` (shown, not used to set the face).
6. **Human Life Value** (only if `retirement_age` and `personal_consumption_pct` given): `n = retirement_age − age`, `net = annual_income × (1 − personal_consumption_pct/100)`, `r` = real bond return; `HLV = net × (1 − (1 + r)^−n) / r`. Shown as a cross-check only.
7. **Term length:** `years_needed = max(22 − youngest (if any), mortgage_years_remaining (if any), income_replacement_years)`; term = the smallest of {10, 15, 20, 25, 30} that is ≥ `years_needed`; if > 30, use 30 and flag the shortfall.
8. **Non-portable flag:** if `existing_group_coverage_usd > 0`, also show the gap without group coverage (`DIME need − (existing_coverage − existing_group_coverage_usd)`).
9. Compute in cents; report whole dollars. If a required input is missing, stop and list it.

### Decision rules

Evaluate top to bottom; the first match is the recommendation.

| # | Condition | Recommendation |
|---|---|---|
| 1 | A required input is missing | No recommendation — list the missing inputs |
| 2 | `dependents_ages = none`, `mortgage_balance = 0`, `other_debt = 0`, `spouse_income ≥ annual_income` and `permanent_need_reason = none` | No income-replacement need; final expenses only (`max(0, final expenses − existing_coverage)`) |
| 3 | Gap ≤ 0 | Existing coverage is sufficient; if group coverage is needed to reach it (step 8 gap > 0), recommend portable term for that gap |
| 4 | `permanent_need_reason ≠ none` | Term for the gap at the step-7 length, **and** refer the permanent-need portion to a fee-only advisor / estate attorney |
| 5 | Otherwise | Level term: face = recommended face, term = step-7 length |

Smoker or `Below average` health does not change the face amount; it adds the note "expect rated premiums; re-quote after 12 months tobacco-free" (smoker).

### Output template

```markdown
# Life Insurance Needs — {YYYY-MM-DD}

## Headline
Recommended: **${face} {term}-year level term** (Decision rule #{n}).

## DIME build
| Component | Basis | Amount |
|---|---|---|
| D — Non-mortgage debt | | |
| I — Income ({years} yrs) | | |
| M — Mortgage | | |
| E — Education ({n_children} × ${per_child}) | | |
| Final expenses | | |
| **Total need** | | |
| Less existing coverage | | |
| **Gap → face (rounded up to $50k)** | | |

## Cross-checks
| Method | Amount |
|---|---|
| 10× income | |
| 15× income | |
| Human Life Value | {amount, or "Not computed — consumption % not supplied"} |

## Term length
{years_needed and why; chosen term}

## Existing coverage
{group vs individual; portability flag — or "None"}

## Premiums
{carrier quotes by health class, or "To be quoted — get 2–3 carrier quotes"}

## Spouse coverage
{replacement-of-services build, or "Not applicable — insured is not a non-earning spouse"}

## Actions
- {quotes, medical exam, keep existing policy in force until new one issues}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
