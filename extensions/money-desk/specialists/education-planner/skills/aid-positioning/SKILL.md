## Financial Aid Positioning

description: Surface what FAFSA and the CSS Profile actually count, compute approximate Student Aid Index (SAI, formerly EFC), and identify legal asset-positioning moves to optimize need-based aid. Use when the user expects to be aid-eligible (rough rule: AGI under ~$200k, more with multiple kids in college). Does NOT submit FAFSA on the user's behalf.

## When to use

- 18+ months before the child's FAFSA filing date (FAFSA open date for the award year: `md_facts` → `fafsa_and_education_2026_27.fafsa_open_date`).
- Reviewing the impact of a Roth conversion, capital gain, or 529 rollover that would land in a FAFSA "base year" (prior-prior year income).
- Grandparents asking how to help without hurting aid.

## Inputs needed

- Child's expected college start year (determines base year — FAFSA uses prior-prior-year income; 2025–26 FAFSA uses 2023 tax return).
- Household AGI for the base year.
- Parents' assets: cash, taxable brokerage, real estate equity (non-primary-residence), 529 accounts, business interest >$X depending on year.
- Student's assets: bank accounts, UTMA/UGMA, student-owned 529 (less common).
- Number of children expected to be in college simultaneously (post-FAFSA-Simplification this no longer gives a discount — flag this change).
- Whether either parent is a small-business owner (rules changed for businesses < 100 employees).

## Workflow

1. **Identify the base year.** SAI for academic year YYYY–(YYYY+1) uses the (YYYY−2) tax return. So senior-year-of-HS for a Sep 2026 start → uses 2024 income → planning window for income smoothing was 2023.
2. **Estimate parent contribution from income.** Per FAFSA Simplification formulas (2024–25 onward): parent AGI minus federal/state tax allowance minus FICA minus income-protection allowance (year-specific table by household size from the SAI Formula Guide — not in `md_facts`), times the assessment rate (up to 47%).
3. **Estimate parent contribution from assets.** Cash + non-retirement investments + non-primary real estate, minus an asset-protection allowance (smaller post-Simplification), assessed at 5.64%. **Retirement accounts (401k, IRA) do NOT count.** **Primary residence does NOT count for FAFSA** (CSS Profile is different — many private colleges use CSS and DO count home equity).
4. **Estimate student contribution.** Student income above the student income protection allowance (year-specific; SAI Formula Guide) assessed at 50%. Student assets assessed at 20% (much harsher than parent assets — flag the impact of UTMAs).
5. **Compute SAI.** Sum the four contributions. Compare to the cost of attendance at target schools. Need-based aid potential = COA − SAI (subject to school's aid policy and resources).
6. **Identify positioning levers.**
   - **Shift student assets to parent assets** before filing (e.g., spend down a UTMA on legitimate kid expenses — bike, computer, summer-camp — *before* the base year).
   - **Pay down debt** with non-retirement cash before filing (reduces countable assets).
   - **Max retirement contributions** in the base year (reduces AGI, moves assets to non-countable retirement).
   - **Time capital gains and Roth conversions** to avoid base years.
   - **Grandparent 529s** — post-Simplification, distributions from grandparent-owned 529s are no longer counted as student income on FAFSA. Major change. (Still counted on CSS Profile.)
7. **CSS Profile (if any target school uses it).** Different formula: home equity counts (often capped at 1.2× AGI), non-custodial parent income counts, small-business value counts more aggressively. Flag this if private/elite schools are on the list.

## Required citations

- SAI formula cites the current FAFSA EFC/SAI Formula Guide (year-specific PDF from studentaid.gov).
- Asset-protection allowance and income-protection allowance cite the year-specific tables.
- Any school-specific aid claim cites that school's published methodology / Common Data Set.

## Deliverable shape

Markdown report `./money-desk/<CHILD>/aid-positioning-<YYYYMMDD>.md`:
- **Headline** — e.g., "Estimated SAI: $X. At a $35k/yr in-state public, need-based aid potential is ~$Y."
- **SAI breakdown table** — parent income / parent assets / student income / student assets.
- **Positioning levers** — ranked by SAI impact, with the action and the deadline.
- **Base-year calendar** — what year's tax return matters for each application year.
- **CSS Profile callout** — if relevant, the additional differences.

## Notes

- The 2024–25 FAFSA Simplification eliminated the "sibling discount" (used to divide SAI by # in college). This is the biggest change for multi-kid families and often shocks them.
- Small-business and family-farm assets are now counted on FAFSA (used to be excluded). Cite this if relevant.
- This skill does **not** estimate merit aid (non-need-based). Use each target school's Net Price Calculator for that.
- 529 ownership: parent-owned counts as parent asset (5.64%); student-owned counts as student asset (20%) on FAFSA — but on the new FAFSA, the 529 *belongs* to the account owner regardless of beneficiary. Confirm with the plan.

## Determinism rules

### Input keys

- `college_start_year` — integer (fall term of first year)
- `household_size`, `parents_in_household` — integers
- `base_year_agi_usd` — number, parents' AGI for the base (prior-prior) year
- `base_year_untaxed_income_usd` — number (default 0)
- `base_year_taxes_paid_usd` — number, federal income tax paid (Form 1040)
- `parent_assets` — `{ cash_usd, taxable_investments_usd, non_primary_real_estate_equity_usd, business_farm_net_worth_usd, parent_owned_529_usd }`
- `primary_home_equity_usd`, `retirement_accounts_usd` — numbers (reported, not counted on FAFSA)
- `student_income_usd` — number, student's base-year income
- `student_assets` — `{ cash_usd, utma_ugma_usd, student_owned_529_usd }`
- `grandparent_529_usd` — number (default 0)
- `target_schools` — list of `{ name, cost_of_attendance_usd, uses_css_profile (bool) }`
- `planned_events` — list of `{ type (roth_conversion | capital_gain | bonus | asset_sale), amount_usd, year }`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Base-year income and assets | **Ask — no default** | — |
| SAI allowance tables (income protection, employment expense, asset protection, state tax allowance, parent contribution schedule, student income protection allowance) | Year-specific — not in md_facts. Look up the SAI Formula Guide for the award year via `md_sources` (studentaid.gov); if unavailable, tag `[UNSOURCED]` and do not compute a full SAI | `[UNSOURCED]` until sourced |
| Parent asset conversion rate | 12% of net worth after the asset-protection allowance, assessed through the contribution schedule (≈ 5.64% max) — statutory FAFSA Simplification Act formula | statute |
| Student asset rate | 20% | statute |
| Student income rate | 50% of income above the student income protection allowance | statute |
| FAFSA open date | `md_facts` → `fafsa_and_education_2026_27.fafsa_open_date` | `[FSA / Ed Dept 2026-27]` |
| Maximum Pell Grant | `md_facts` → `fafsa_and_education_2026_27.pell_grant_max_annual` | `[FSA / Ed Dept 2026-27]` |
| Cost of attendance | **Ask — no default**; the school's published COA (cite) | — |
| CSS Profile methodology | Institution-specific — not modelled numerically; flag only | — |

### Calculation method

1. **Award year** = `college_start_year`–(`college_start_year`+1). **Base year** = `college_start_year − 2`. List the base year for each of the student's expected years in college (start year + 0..3).
2. **Countable parent assets (FAFSA)** = cash + taxable investments + non-primary real-estate equity + business/farm net worth + parent-owned 529 (+ student-owned 529, reported as a parent asset when the student is a dependent). Primary home equity and retirement accounts = 0.
3. **Countable student assets** = cash + UTMA/UGMA.
4. **Full SAI** (only when the year's tables are sourced): follow the SAI Formula Guide worksheet A line by line; SAI floor is −1,500. Otherwise report "SAI not computed — tables unsourced" and continue with steps 5–6.
5. **Lever impact on SAI** (statutory rates; each computed independently):
   - Spend a student asset of $X on the student before filing: −$X × 20%.
   - Move a student asset of $X to a parent-owned 529 (UTMA → custodial 529 counts as parent asset): −$X × (20% − 5.64%).
   - Pay down non-mortgage debt with $X of countable parent cash: −$X × 5.64%.
   - Move a `planned_events` amount out of a base year: −amount × 47% (top parent-contribution rate) — label as an upper bound when tables are unsourced.
   - Grandparent 529 distributions: $0 FAFSA impact; flag CSS schools.
6. **Need per school** = `cost_of_attendance_usd − SAI` (floor 0), only when SAI is computed.
7. **Rank levers** by SAI impact descending; tie → earliest deadline (end of the base year, else filing date); tie → name A–Z.
8. Report whole dollars. Never present an SAI built from unsourced tables.

### Decision rules

Evaluate top to bottom; the first match is the overall stance.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Base-year AGI or parent assets missing | No estimate — collect inputs |
| 2 | SAI computed and `SAI ≥ max(cost_of_attendance_usd)` across target schools | **Not need-aid eligible at these schools** — do not distort finances for FAFSA; focus on merit aid / Net Price Calculators |
| 3 | SAI computed and need > 0 at one or more schools | **Position for aid** — execute levers in rank order before their deadlines; file on the FAFSA open date |
| 4 | SAI not computed and the top lever's impact ≥ $1,000 | **Run the top levers** (deltas are statutory and valid without the tables); source the tables to estimate need |
| 5 | Otherwise | **File FAFSA as is** — no lever moves the SAI by $1,000 or more |

Any school with `uses_css_profile = true` adds the CSS callout regardless of the row that fires.

### Output template

```markdown
# Financial Aid Positioning — {student}, award year {YYYY–YY}

## Headline
{stance} (Decision rule #{n}). Estimated SAI: {SAI or "not computed — tables unsourced"}.

## Base-year calendar
| Award year | Base (tax) year | FAFSA opens |
|---|---|---|

## SAI components
| Component | Countable amount | Contribution |
|---|---|---|
| Parent income | | |
| Parent assets | | |
| Student income | | |
| Student assets | | |
| **SAI** | | |

## Need by school
| School | Cost of attendance | SAI | Need | CSS Profile |
|---|---|---|---|---|

## Positioning levers (ranked)
| # | Lever | Amount moved | SAI impact | Deadline |
|---|---|---|---|---|

## CSS Profile callout
{differences, or "Not applicable — no CSS Profile schools"}

## Actions
- {levers, filing date, Net Price Calculator per school}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
