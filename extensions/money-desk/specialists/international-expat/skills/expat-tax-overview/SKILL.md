## Expat Tax Overview

description: Explain the US-citizen / green-card-holder filing landscape for someone living abroad: the FEIE vs Foreign Tax Credit decision, the FBAR and FATCA / 8938 thresholds, PFIC reporting trigger, state-tax disengagement strategy, totalization agreements for self-employment tax. Educational triage — actual filing requires a cross-border CPA.

## When to use

- US citizen or green-card holder moving abroad or already abroad.
- Returning to the US after years overseas (catch-up filing).
- Suspecting a non-filing exposure (Streamlined Filing Compliance Procedures candidate).
- Choosing between FEIE and FTC at year-end.

## Inputs needed

- Citizenship + green-card status (and any history of changes).
- Country of residence and physical-presence days (FEIE requires either Bona Fide Residence or `expat_quick_reference_2026.physical_presence_test_days_abroad_in_12_months` days outside the US in 12 months).
- Employment type: US employer remote, foreign employer, self-employed, dual.
- Earned income (USD-converted), foreign tax paid (USD), foreign-tax-year vs US-tax-year alignment.
- All non-US financial accounts: aggregate peak balance, count of accounts, custodian country (for FBAR / 8938 thresholds).
- Tax-treaty country (if any).
- State of last US residence (drives state-tax disengagement question).

## The core decisions

### FEIE (§911) vs Foreign Tax Credit (§901)
- **FEIE** excludes up to `md_facts` → `expat_quick_reference_2026.feie_max_per_qualifying_individual` (indexed) of foreign earned income from US tax. Requires Bona Fide Residence OR Physical Presence. Form 2555.
- **FTC** credits foreign income tax paid against US tax owed on the same income. Form 1116. No earned-income cap. Carryback 1 year, carryforward 10 years.
- **Rule of thumb** (the binding comparison is in Determinism rules → Decision rules):
  - Live in a HIGH-tax country (most of Western Europe, UK, Canada, Australia, Japan) → FTC almost always wins (foreign tax > US tax, full credit).
  - Live in a LOW / ZERO-tax country (UAE, KSA, Bermuda, Bahamas, Singapore for many cases) → FEIE wins.
  - Mid-tax country → run both, take the lower-tax outcome. Once you elect FEIE, revoking is permanent for 5 years without IRS consent — be deliberate.
- **FEIE quirk**: housing exclusion / deduction stacks on top of FEIE (Form 2555, capped). Self-employed get housing deduction; employed get housing exclusion.

### FBAR (FinCEN 114)
- Required if aggregate of ALL non-US financial accounts > **`expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd`** at ANY point in the tax year.
- File via FinCEN, NOT IRS. Separate from 1040.
- Due April 15 with automatic extension to October 15.
- **Penalty up to $10,000 per non-willful violation per year**; willful can be greater of $100k or 50% of account balance. This is the harshest US-cross-border penalty regime.

### FATCA / Form 8938
- Higher thresholds than FBAR, filed WITH 1040.
- Year-end thresholds: `md_facts` → `expat_quick_reference_2026.fatca_form_8938_threshold_*` (single / MFJ, residing in US / abroad). Any-time-during-year thresholds (illustratively $75k / $150k in US, $300k / $600k abroad) are not in md_facts — verify via `md_sources`.
- Different from FBAR scope: 8938 includes some assets FBAR doesn't (foreign-issued securities held in foreign brokerage), but excludes some FBAR-covered accounts (foreign safety deposit boxes).
- BOTH may apply. File both if both apply.

### PFIC (Passive Foreign Investment Company) — Form 8621
- ANY non-US-domiciled mutual fund or ETF triggers PFIC rules.
- The default tax regime is punitive (highest ordinary rate + interest charge on deferred income).
- Two elections (QEF or Mark-to-Market) require annual reporting from the fund — most foreign funds don't provide it.
- **Rule**: US-person investors should NOT buy non-US-domiciled funds. Buy US-domiciled ETFs (Vanguard / BlackRock / SPDR / etc.) ALWAYS, even when living abroad — unless local-law restrictions block it (then accept the PFIC compliance cost or use individual stocks).

### Self-employment tax + totalization agreements
- US SE tax (15.3%) applies to US-citizen self-employed worldwide.
- US has totalization agreements with ~`totalization_agreement_countries_count_approx` countries (md_facts) that prevent double-SS-taxation; the self-employed person pays SS only to the country of residence (with a certificate of coverage).
- Without a totalization agreement: US SE tax owed in addition to foreign social security. Painful.

### State-tax disengagement
- US federal: worldwide income, no escape (without renouncing).
- State: varies. CA, NY, NM, SC, VA are "sticky states" — they pursue residents who claim to have moved abroad without changing domicile-evidence (driver's license, voter registration, dependents, real-estate).
- BEFORE departure: change driver's license, voter registration, mailing address, terminate state-specific subscriptions/memberships, sell or rent out real estate, document the move.

## Workflow

1. Triage filing compliance: any past-due FBARs / 1040s? If yes, route to Streamlined Filing Compliance Procedures evaluation with a cross-border CPA URGENTLY.
2. For current year: run FEIE-vs-FTC comparison.
3. Confirm FBAR + 8938 thresholds — file if exceeded.
4. Audit investment accounts for PFIC exposure; if any non-US-domiciled funds, recommend specific cleanup.
5. Confirm state-tax disengagement is documented.

## Output

- Filing-obligation checklist for the current and next year.
- FEIE-vs-FTC comparison with the winner and reasoning.
- PFIC exposure inventory and cleanup recommendation.
- State-tax disengagement audit.
- Specific list of forms (Form 2555 / 1116 / 8938 / 8621 / FinCEN 114) and due dates.

## Citations / sources

- IRS Pub 54 (Tax Guide for US Citizens Abroad).
- IRC §911 (FEIE), §901-907 (FTC), §1291-1298 (PFIC), §6038D (FATCA).
- FinCEN BSA E-Filing System for FBAR.
- Bilateral tax treaties: IRS Treaties Resource Center.
- Totalization agreements: SSA International Programs.

## Disclaimer

Educational only. Cross-border filing must be done by a CPA / EA with explicit expat experience. The penalty structure (especially FBAR willful) creates criminal exposure for missteps. If past-due, do NOT quiet-disclose without legal advice — that path can convert non-willful into willful.

## Determinism rules

### Input keys

- `us_person_status` — `citizen` | `green_card` | `former_us_person` | `non_us_person`
- `tax_year` — integer
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `country_of_residence` — string; `treaty_country` — bool
- `bona_fide_resident_full_year` — bool
- `days_outside_us_in_12mo` — integer; best 12-month window overlapping the tax year
- `qualifying_days_in_tax_year` — integer; days of the tax year inside the qualifying period (default 365)
- `employment_type` — `us_employer_remote` | `foreign_employer` | `self_employed` | `mixed`
- `foreign_earned_income_usd` — number
- `foreign_income_tax_paid_usd` — number
- `other_us_taxable_income_usd` — number; default 0
- `foreign_housing_expenses_usd` — number; default 0
- `foreign_accounts` — list of `{ country, type, max_balance_usd, year_end_balance_usd, non_us_domiciled_funds (bool) }`
- `other_specified_foreign_assets_year_end_usd`, `other_specified_foreign_assets_max_usd` — numbers; default 0
- `lives_abroad` — bool (for Form 8938 thresholds)
- `totalization_agreement_country` — bool; `certificate_of_coverage` — bool
- `past_due_filings` — bool (any missing 1040 / FBAR / 8938 / 8621)
- `last_us_state` — two-letter code; `state_ties_remaining` — list from {`drivers_license`, `voter_registration`, `mailing_address`, `real_estate`, `dependents_in_state`, `bank_address`}

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, foreign tax paid, days abroad, account balances | **Ask — no default** | — |
| FEIE maximum | `md_facts` → `expat_quick_reference_2026.feie_max_per_qualifying_individual` | `[IRS / FinCEN Expat 2026]` |
| Housing base | `md_facts` → `expat_quick_reference_2026.foreign_housing_exclusion_base_rate_of_feie` × FEIE max | `[IRS / FinCEN Expat 2026]` |
| Housing cap | 30% of FEIE max unless a higher locality cap for the city is found via `md_sources` (IRS notice) | `[ASSUMPTION]` |
| Physical-presence test | `md_facts` → `expat_quick_reference_2026.physical_presence_test_days_abroad_in_12_months` | `[IRS / FinCEN Expat 2026]` |
| FBAR threshold and deadline | `md_facts` → `expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd`, `fbar_filing_deadline` | `[IRS / FinCEN Expat 2026]` |
| Form 8938 year-end thresholds | `md_facts` → `expat_quick_reference_2026.fatca_form_8938_threshold_single_resident_us_end_of_year` / `_mfj_resident_us_` / `_single_abroad_` / `_mfj_abroad_end_of_year` (MFS and HoH use the single figures) | `[IRS / FinCEN Expat 2026]` |
| Form 8938 any-time-during-year thresholds | Not in md_facts — look up via `md_sources` (Form 8938 instructions), else tag `[UNSOURCED]` and run the year-end test only | `[UNSOURCED]` |
| Brackets — MFJ / standard deduction | `md_facts` → `income_tax_brackets_mfj_2026.brackets`, `standard_deduction_*` | `[IRS 2026 brackets]` |
| Brackets — other statuses | Single / HoH / MFS: `md_facts` → `income_tax_brackets_mfj_2026.brackets_single` / `.brackets_hoh` / `.brackets_mfs` and stop the FEIE/FTC comparison | `[UNSOURCED]` |
| Foreign-tax-year mismatch, FTC baskets, carryovers | Not modelled — single general basket, current-year only; flag for CPA | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Compute in cents; report whole dollars. md_facts rates are decimals.

1. **Scope.** If `us_person_status = non_us_person`, stop (out of scope). If `past_due_filings`, stop after listing the obligations (Decision rule 2).
2. **FEIE eligibility** = `bona_fide_resident_full_year` or `days_outside_us_in_12mo ≥ physical-presence days`.
3. **Common base.** `total = foreign_earned_income_usd + other_us_taxable_income_usd`; `ti_all = max(0, total − standard deduction)`; `T(x)` = bracket tax on `x`.
4. **FEIE path** (only if eligible): `cap = feie_max × qualifying_days_in_tax_year / 365`; `excl = min(foreign_earned_income_usd, cap)`; housing `h = max(0, min(foreign_housing_expenses_usd, housing_cap) − housing_base) × qualifying_days_in_tax_year / 365`, limited to `foreign_earned_income_usd − excl`. Stacking rule (IRC §911(f) — verify via IRS Pub 54): `tax_feie = T(ti_all) − T(min(ti_all, excl + h))`. No FTC is taken on excluded income (conservative: remaining foreign tax not credited).
5. **FTC path:** `us_tax = T(ti_all)`; `limit = us_tax × foreign_earned_income_usd / total`; `ftc = min(foreign_income_tax_paid_usd, limit)`; `tax_ftc = us_tax − ftc`; `carryover = foreign_income_tax_paid_usd − ftc` (listed, not valued).
6. **FBAR** required if `Σ max_balance_usd > fbar threshold`.
7. **Form 8938** required if `Σ year_end_balance_usd + other_specified_foreign_assets_year_end_usd > year-end threshold` for (`filing_status`, `lives_abroad`), or the any-time test is met when sourced.
8. **PFIC:** Form 8621 flagged for every account with `non_us_domiciled_funds`.
9. **SE tax:** if `employment_type` includes self-employment: US SE tax applies unless `totalization_agreement_country` and `certificate_of_coverage` (then residence-country social security only).
10. **State disengagement:** `ties = count(state_ties_remaining)`; state status = `exposed` if `ties ≥ 1`, else `documented`. List CA, NY, NM, SC, VA as higher-scrutiny states (this skill).
11. **Forms and due dates** in fixed order: 1040 (+2555 or 1116), FinCEN 114, 8938, 8621, Schedule SE / certificate of coverage, final state return.

### Decision rules

FEIE vs FTC recommendation; evaluate top to bottom; the first match wins. Filing obligations (steps 6–11) are listed under every row.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `us_person_status = non_us_person` | Out of scope — refer to a residence-country advisor |
| 2 | `past_due_filings = true` | Urgent: cross-border CPA to evaluate Streamlined Filing Compliance Procedures before any other step; no quiet disclosure |
| 3 | Bracket table unavailable for the filing status | No FEIE/FTC verdict — obligations only |
| 4 | FEIE not eligible (step 2 false) | FTC (Form 1116) |
| 5 | `tax_feie ≤ tax_ftc − $1,000` | FEIE (Form 2555) — note the 5-year re-election lock after revocation |
| 6 | Otherwise | FTC (Form 1116) — keeps flexibility and carries excess credits |

### Output template

```markdown
# Expat Tax Overview — {tax_year}

## Headline
Recommendation: **{FEIE|FTC|Urgent compliance}** (rule #{n}). US tax under FEIE ${tax_feie} vs FTC ${tax_ftc}.

## Filing-compliance triage
{past-due status and next step — or "Current — no past-due filings reported"}

## FEIE vs FTC comparison
| Line | FEIE path | FTC path |
|---|---|---|
| Foreign earned income | | |
| Excluded (FEIE + housing) | | — |
| US tax before credits | | |
| Foreign tax credit | — | |
| **Net US tax** | | |
| Carryover foreign tax | — | |

## Filing obligations
| Form | Required? | Test (value vs threshold) | Due date |
|---|---|---|---|
| Form 1040 + 2555 / 1116 | | | |
| FinCEN 114 (FBAR) | | | |
| Form 8938 | | | |
| Form 8621 (PFIC) | | | |
| SE tax / certificate of coverage | | | |

## PFIC exposure
{accounts with non-US-domiciled funds and cleanup recommendation — or "None"}

## State-tax disengagement audit
| Tie | Status |
|---|---|
State: {last_us_state} — {exposed|documented}

## Assumptions & flags
- {md_facts keys used, [UNSOURCED] items, CPA hand-off}

Educational only. Filing must be done by a CPA / EA with expat experience.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
