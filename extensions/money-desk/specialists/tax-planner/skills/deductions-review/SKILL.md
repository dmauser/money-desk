# Deductions Review

description: Compare itemized vs standard deduction; identify above-the-line deductions and credits the user may be missing. Outputs a year-end action list to maximize legal deductions before Dec 31. Use during tax planning or end-of-year tax moves.

## When to use

- November/December tax-move planning.
- After a major life event (home purchase, marriage, large medical year, big charitable gift).
- The user asks "am I leaving money on the table?"

## Inputs needed

- Tax year, filing status, AGI estimate.
- State (some itemized items vary by state, esp. SALT cap effects).
- For each potential itemized category: rough total YTD (mortgage interest, property tax, SALT income tax, charitable, medical).
- Pre-tax retirement / HSA contributions YTD.
- Major life events (home, marriage, kids, education).

## Workflow

1. **Compute current-year standard deduction** for filing status (`md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_*`).
2. **Sum potential itemized deductions:**
   - Mortgage interest (1098).
   - State + local income/sales tax + property tax — capped at the SALT cap after its income phase-down: `effective_salt_cap = max(salt_cap_floor, salt_cap − salt_cap_phase_down_rate × max(0, MAGI − salt_cap_phase_down_magi_start))` (MFS: use the `_mfs` / `salt_cap_married_filing_separately` keys), all keys under `md_facts` → `mortgage_and_real_estate_2026`.
   - Charitable contributions (cash & non-cash; non-cash >$500 requires Form 8283).
   - Medical expenses above 7.5% of AGI.
   - Casualty losses (federally declared disaster only).
3. **Verdict.** If itemized > standard, recommend itemizing. If within 10% below standard (Decision rule 4), look for year-end moves that tip the scale (bunching charitable into one year, prepaying property tax where allowed, charity-via-DAF lump).
4. **Above-the-line (always available even with standard deduction):**
   - HSA contributions (if HDHP).
   - Traditional IRA (subject to income limits if covered by workplace plan).
   - SE retirement (SEP-IRA, Solo 401(k)) for 1099 income.
   - Student-loan interest (up to $2,500, with phase-outs).
   - Educator expenses, SE health insurance, etc.
5. **Credits often missed:**
   - Saver's Credit (low/mid AGI + retirement contributions).
   - Child & Dependent Care Credit (separate from CTC).
   - Lifetime Learning / American Opportunity (education).
   - Residential Clean Energy / Energy Efficient Home Improvement.
   - EV / clean vehicle (with strict eligibility rules — confirm current year).
6. **Bunching analysis.** If the Determinism-rules bunching test shows a positive benefit and the user gives regularly, suggest a 2-year bunch (giving 2 years' worth in one tax year via DAF, taking standard the other year).
7. **Year-end checklist.** Specific actions with deadlines (most must complete by Dec 31; IRA + HSA have until tax-filing day).

## Required citations

- Each deduction amount cites a source doc (1098, charity letter, property-tax bill, HSA statement).
- Limits and phase-outs cite the tax year explicitly.

## Deliverable shape

- Markdown report `./money-desk/tax-planner/deductions-review-<YEAR>.md`:
  - **Itemize vs Standard verdict.**
  - **Itemized buildup** — line by line with cited amounts.
  - **Above-the-line summary** — what's claimed, what's available.
  - **Credit checklist** — eligible / not eligible / verify.
  - **Year-end action list** — bunching, DAF, prepayment, HSA top-up, IRA contribution.

## Notes

- Limits change yearly. Confirm with IRS docs for the working tax year.
- Roth IRA contributions are NOT deductible (they're not in scope here, but flag if the user conflates them).
- Charitable contributions to non-qualified orgs (e.g. individuals via GoFundMe) are NOT deductible.
- Donor-advised funds (DAF) let users bunch a multi-year charitable plan into one tax year while granting to charities over time.
- "Not professional tax advice — informational only."

## Determinism rules

### Input keys

- `tax_year` — integer
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `agi_estimate_usd` — number
- `state` — two-letter code
- `age_65_or_blind_count` — integer 0–2 (qualifiers on the return); default 0
- `mortgage_interest_usd` — number; Form 1098 interest on acquisition debt
- `mortgage_principal_usd` — number; average acquisition-debt balance (for the interest cap)
- `state_local_income_or_sales_tax_usd` — number
- `property_tax_usd` — number
- `charitable_cash_usd` — number; to qualified 501(c)(3) organizations
- `charitable_noncash_usd` — number; fair market value
- `medical_expenses_usd` — number; unreimbursed
- `casualty_loss_federal_disaster_usd` — number; default 0
- `planned_annual_giving_usd` — number; typical yearly giving (for bunching); default = `charitable_cash_usd + charitable_noncash_usd`
- `hsa_contrib_ytd_usd`, `ira_contrib_ytd_usd`, `se_retirement_contrib_ytd_usd`, `student_loan_interest_usd`, `se_health_premiums_usd` — numbers; default 0
- `hdhp_coverage` — `none` | `self_only` | `family`
- `age` — integer (catch-up eligibility)
- `life_events` — list of strings (home purchase, marriage, birth, education, etc.)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Itemizable amounts per category | Treated as $0 and listed as "not provided" | `[USER-PROVIDED]` |
| AGI estimate, filing status | **Ask — no default** | — |
| Standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_mfj` / `standard_deduction_single` / `standard_deduction_hoh` (MFS = single) | `[IRS 2026 brackets]` |
| Additional standard deduction (65+/blind) | `md_facts` → `income_tax_brackets_mfj_2026.additional_standard_deduction_age_65_or_blind_mfj_per_qualifier` (MFJ/MFS) or `additional_standard_deduction_age_65_or_blind_unmarried` (single/HoH) | `[IRS 2026 brackets]` |
| SALT cap | `md_facts` → `mortgage_and_real_estate_2026.salt_cap`, `.salt_cap_phase_down_magi_start`, `.salt_cap_phase_down_rate`, `.salt_cap_floor` (MFS: `_mfs` keys) | `[FHFA / IRS RE 2026]` |
| Mortgage-interest debt cap | `md_facts` → `mortgage_and_real_estate_2026.mortgage_interest_deduction_cap_post_tcja` | `[FHFA / IRS RE 2026]` |
| Medical AGI floor | 7.5% of AGI (statutory) | — |
| HSA limits | `md_facts` → `irs_contribution_limits.hsa_self_only` / `hsa_family` / `hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| IRA limits | `md_facts` → `irs_contribution_limits.ira_traditional_or_roth` / `ira_catchup_age_50_plus` | `[IRS 2026 limits]` |
| IRA deductibility phase-outs, student-loan-interest phase-outs, Saver's Credit / education / energy credit limits | Not in md_facts — look up via `md_sources`, else tag `[UNSOURCED]` and mark the item "verify" | `[UNSOURCED]` |
| Marginal federal rate | Bracket containing `agi_estimate_usd − chosen deduction` from `md_facts` → `income_tax_brackets_mfj_2026.brackets` (MFJ), `.brackets_single`, `.brackets_hoh` or `.brackets_mfs` | `[IRS 2026 brackets]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Compute in cents; report whole dollars.

1. **Standard deduction** `std = base(filing_status) + age_65_or_blind_count × additional_amount`.
2. **Itemized buildup**, each line capped before summing:
   1. Mortgage interest: if `mortgage_principal_usd > cap`, `mi = mortgage_interest_usd × cap / mortgage_principal_usd`, else full.
   2. SALT: `salt = min(state_local_income_or_sales_tax_usd + property_tax_usd, effective_salt_cap)` where `effective_salt_cap = max(salt_cap_floor, salt_cap − salt_cap_phase_down_rate × max(0, MAGI − salt_cap_phase_down_magi_start))` (MFS: use the `_mfs` / `salt_cap_married_filing_separately` keys). If MAGI is unknown, ask; do not assume it is below the phase-down start.
   3. Charitable: `cash ≤ 60% × AGI`, `noncash ≤ 30% × AGI` (public charities; statutory per IRS Pub 526); excess listed as carryforward.
   4. Medical: `max(0, medical_expenses_usd − 0.075 × agi_estimate_usd)`.
   5. Casualty: federal-disaster amount as provided (net of the statutory floors — mark "verify with preparer").
   6. `itemized = sum(1–5)`.
3. **Margin** `margin = itemized − std`.
4. **Bunching test** (two-year view, giving held constant at `g = planned_annual_giving_usd`, other categories held constant). `base = itemized − allowed charitable`.
   - No bunching: `total_no = 2 × max(std, base + g)`.
   - Bunching (two years of giving in year 1, none in year 2): `total_bunch = max(std, base + 2g) + max(std, base)` (apply the 60%-of-AGI cash cap to `2g`).
   - `bunch_benefit = total_bunch − total_no` (deduction dollars); tax value = `bunch_benefit × marginal_rate`.
5. **Above-the-line headroom** for each item: `headroom = limit − ytd` (floored at 0). HSA only if `hdhp_coverage ≠ none`. IRA headroom is shown with deductibility "verify" if covered by a workplace plan.
6. **Credit checklist** in this fixed order: Child Tax Credit, Child & Dependent Care, American Opportunity, Lifetime Learning, Saver's Credit, Residential Clean Energy, Energy Efficient Home Improvement, Clean Vehicle. Status per credit: `eligible` (all user facts satisfy the rule), `not eligible` (a user fact fails the rule), `verify` (missing fact or limit not in md_facts).
7. **Tax value** of each action = deduction dollars × marginal rate (credits dollar-for-dollar). Rank the year-end action list by tax value descending; tie → earlier deadline first → A–Z.
8. **Deadlines:** itemized and charitable actions by Dec 31; IRA and HSA by the filing deadline (no extensions).

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Filing status or AGI missing | No verdict — ask |
| 2 | `margin > 0` | Itemize; list the year-end moves that raise `itemized` further |
| 3 | `margin ≤ 0` and `bunch_benefit > 0` and `planned_annual_giving_usd > 0` | Standard this year **or** bunch two years of giving (DAF) into one year — show the tax value of each |
| 4 | `margin ≤ 0` and `margin ≥ −10% × std` | Standard deduction; flag as "close" and list moves that could tip it (prepay property tax where allowed, bunch charitable) |
| 5 | Otherwise | Standard deduction; skip itemized-doc collection |

Above-the-line headroom items and eligible credits are listed under every row.

### Output template

```markdown
# Deductions Review — {tax_year}, {filing_status}

## Itemize vs standard verdict
**{Itemize|Standard|Bunch}** — itemized ${itemized} vs standard ${std} (margin ${margin}). Decision rule #{n}.

## Itemized buildup
| Category | Claimed amount | Cap / floor applied | Allowed | Source |
|---|---|---|---|---|

## Bunching analysis
{two-year comparison table, or "Not applicable — no planned giving"}

## Above-the-line summary
| Item | Limit (md_facts key) | YTD | Headroom | Deadline |
|---|---|---|---|---|

## Credit checklist
| Credit | Status (eligible / not eligible / verify) | Reason |
|---|---|---|

## Year-end action list
| Rank | Action | Est. tax value | Deadline |
|---|---|---|---|

## Assumptions & flags
- {[ASSUMPTION] / [UNSOURCED] items, SALT-cap verification note}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).