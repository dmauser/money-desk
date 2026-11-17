## Moving Country Checklist

description: Pre-move runbook for someone changing countries — ideally 6-12 months in advance, but useful any time before or shortly after the move. Covers tax-residency change planning, employer-benefits transferability, US-account portability, brokerage residency restrictions, exit-tax screening for high-net-worth expatriates, and post-move first-year-of-filing tracking.

## When to use

- "We just accepted a job abroad."
- "I'm moving back to the US after years overseas."
- "Considering retiring abroad."
- "My spouse is being relocated by their employer."
- Already moved and trying to clean up the trailing edges.

## Inputs needed

- Origin country / state, destination country / state, planned move date.
- Citizenship of each household member.
- Visa / immigration status in destination (work permit, dependent visa, residency permit, citizenship-eligible).
- Employer arrangement: same employer in new country / new employer in new country / self-employed / not working (trailing spouse / retiree).
- Net worth approximate range (drives exit-tax screen for US-person expatriating).
- All accounts at origin: checking, savings, brokerage, retirement, real estate, insurance, loans.
- All known accounts already in destination.
- Years held green card if surrendering (8 of 15 triggers covered-expatriate exit-tax under §877A).

## The runbook by phase

### T-12 to T-6 months (pre-move planning)

- [ ] **Identify tax-residency strategy**. Departing US citizen / green-card holder remains US-taxable on worldwide income — there is no "tax-out" by leaving. Departing US-state resident CAN disengage state-tax if domicile evidence is intentional.
- [ ] **Document state-tax disengagement** for sticky states (CA, NY, NM, SC, VA, others). Change driver's license, voter registration, mailing address; terminate state-specific subscriptions; document the move date.
- [ ] **Open destination-country bank account** in advance if possible — much easier with a US address than after the move.
- [ ] **Confirm brokerage policy on foreign addresses** for current US brokers. Migrate to expat-friendly broker (e.g., Schwab International, Interactive Brokers) BEFORE the move if current broker will restrict.
- [ ] **Surrender / retain US driver's license** decision based on state.
- [ ] **Voting strategy**: federal voting from abroad via FVAP (Federal Voting Assistance Program); state voting depends on last state of residence.
- [ ] **Health-insurance bridge** for the gap between US coverage ending and destination coverage starting. International medical insurance (e.g., Cigna Global, IMG, Allianz) for the gap if needed.
- [ ] **Real estate**: sell, rent out, or keep vacant? Tax implications differ; sell triggers §121 primary-residence exclusion (`mortgage_and_real_estate_2026.section_121_exclusion_single` / `_mfj`) if 2 of 5 owner-occupied — clock matters (last eligible sale date in Determinism rules step 5).
- [ ] **Inventory and consolidate retirement accounts**. Old 401(k)s often easier to manage as rollover IRAs from abroad than employer plans (employer may force-distribute if account address goes foreign).
- [ ] **Update beneficiary designations** to reflect new family / dependent situation BEFORE leaving.

### T-6 to T-1 month (final pre-move)

- [ ] **Tax-projection** for the move year — split-year filing strategy, FEIE-eligibility partial year, state-final-return.
- [ ] **Inform US payroll** (if continuing US employer) — withholding adjusts; may need US-employer-of-record vs foreign-payroll arrangement.
- [ ] **Open destination-country tax-residency** preparation: foreign tax-ID number, social-security/national-insurance number.
- [ ] **Power of attorney** (US) for someone still at home to handle banking, tax, real-estate matters.
- [ ] **Mail forwarding** to a US-address mail service (recommended even with foreign address — avoids brokerage and bank "we couldn't deliver" account-freezes).
- [ ] **Cancel** US-state specific recurring (gym, parking permits, libraries) and document the cancellation.

### T-0 to T+90 days (move month and first quarter)

- [ ] **File Form 8822** (IRS address change).
- [ ] **Open destination-country bank** + national-insurance / social-security registration.
- [ ] **Confirm receipt** of all expected income at destination accounts.
- [ ] **Document the move date** in writing — driver's license issued, visa stamped, lease signed, utilities started.
- [ ] **Notify** US brokers / IRAs / 401(k) administrators / insurance carriers of new foreign address.
- [ ] **Confirm health-insurance** active in destination.
- [ ] **First foreign tax-year** awareness — destination country's tax year, deadlines, residency-status determination.

### T+90 days through first-year filing

- [ ] **First-year US return** with split FEIE + Form 1116, plus state-final return.
- [ ] **First foreign tax return** in destination — use that filing to plan next year's FEIE-vs-FTC.
- [ ] **First FBAR** if aggregate non-US accounts > `expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd`.
- [ ] **First Form 8938** if applicable thresholds met.
- [ ] **First PFIC clean-up** if any foreign mutual funds picked up.
- [ ] **Beneficiary, will, POA** review — does the US-drafted will conform to destination-country succession law? Often not; consider a parallel destination-country will.
- [ ] **Annual review** scheduled — cross-border situations need yearly check-in, not 3-yearly.

### Special case: US-citizenship renunciation or green-card surrender

- [ ] **Section 877A exit-tax screening** for "covered expatriate" status:
  - Net worth ≥ $2,000,000, OR
  - Average annual US income tax for the 5 prior years > the indexed threshold for the expatriation year (not in md_facts — look up via `md_sources`), OR
  - Failure to certify 5-year compliance on Form 8854.
- [ ] If covered → mark-to-market deemed sale of worldwide assets on the day before expatriation. Tax owed on net gain > the indexed §877A exclusion for the expatriation year (not in md_facts — look up via `md_sources`). Specific deferred-comp and IRA rules apply.
- [ ] Renunciation appointment at US consulate; renunciation fee per the current State Department fee schedule (look up via `md_sources`).
- [ ] Effects on US-source income post-expatriation: subject to 30% withholding on most US-source FDAP income (unless treaty applies); real-estate FIRPTA on US-real-property dispositions.
- [ ] Visa-return restrictions: Reed Amendment can bar former US citizens (rarely enforced but legally on the books).

## Output

- Personalized timeline of the relevant T-12 through T+90 checklist items, with dates filled in.
- Tax-residency disengagement audit specific to user's state.
- Brokerage / account migration plan.
- Insurance bridge recommendation.
- Form-and-deadline summary for first cross-border filing year.
- Exit-tax screen result if applicable.

## Citations / sources

- IRS Pub 519 (US Tax Guide for Aliens), Pub 54 (US Citizens Abroad).
- IRC §877A (exit tax), Form 8854.
- State-by-state domicile rules: each state DOR; e.g., CA FTB Pub 1031.
- US State Department Renunciation procedures (Department of State 7 FAM 1200 series).

## Disclaimer

Educational. Cross-border moves with significant assets, business interests, or covered-expatriate status must be planned with a cross-border CPA + immigration attorney + (for citizenship change) US-State-Department-experienced attorney. Mistakes here are expensive and frequently irreversible.

## Determinism rules

### Input keys

- `today` — YYYY-MM-DD
- `move_date` — YYYY-MM-DD
- `origin_country`, `destination_country` — strings; `origin_us_state` — two-letter code or none
- `household` — list of `{ name, citizenships, us_person (bool) }`
- `visa_status` — string
- `employer_arrangement` — `same_employer` | `new_foreign_employer` | `self_employed` | `not_working`
- `filing_status` — `single` | `mfj` | `mfs` | `hoh`
- `net_worth_usd` — number
- `renouncing_or_surrendering` — `none` | `renounce_citizenship` | `surrender_green_card`
- `green_card_years_in_last_15` — integer; only for surrender
- `avg_annual_us_income_tax_5yr_usd` — number; only if expatriating
- `form_8854_compliance_5yr` — bool; only if expatriating
- `us_home` — `{ owned (bool), occupied_months_ending_at_move_out (continuous principal-residence months), move_out_date (YYYY-MM-DD), estimated_gain_usd }`; optional
- `accounts` — list of `{ institution, type, country, balance_usd }`
- `done_items` — list of item ids already completed (see step 2)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Move date | **Ask — no default** | — |
| §121 exclusion | `md_facts` → `mortgage_and_real_estate_2026.section_121_exclusion_single` / `section_121_exclusion_mfj` | `[FHFA / IRS RE 2026]` |
| §121 use test | 24 months owner-occupied in the 5 years before sale (statutory, this skill's "2 of 5") | — |
| FBAR threshold | `md_facts` → `expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd` | `[IRS / FinCEN Expat 2026]` |
| Form 8938 thresholds (abroad) | `md_facts` → `expat_quick_reference_2026.fatca_form_8938_threshold_single_abroad_end_of_year` / `_mfj_abroad_end_of_year` | `[IRS / FinCEN Expat 2026]` |
| Covered-expatriate net-worth test | $2,000,000 (statutory, not indexed) | — |
| Covered-expatriate average-tax test and §877A exclusion amount | Not in md_facts — look up via `md_sources` (IRS Form 8854 instructions for the expatriation year), else tag `[UNSOURCED]` and treat the screen as "unknown" | `[UNSOURCED]` |
| Renunciation fee | Not in md_facts — look up via `md_sources` (State Department fee schedule), else tag `[UNSOURCED]` | `[UNSOURCED]` |
| Long-term resident (green card) | Held in ≥ 8 of the last 15 tax years (this skill) | — |
| Item completion | Items not in `done_items` are open | `[ASSUMPTION]` |

### Calculation method

1. **Days to move** `d = move_date − today` (calendar days; negative after the move).
2. **Items and due dates.** Every checkbox in the runbook above is an item, id-numbered in document order within its phase (A1…, B1…, C1…, D1…, E1… for the expatriation section). Due dates are fixed offsets from `move_date`: phase A (T-12 to T-6) → `move_date − 182 days`; phase B (T-6 to T-1) → `move_date − 30 days`; phase C (T-0 to T+90) → `move_date + 90 days`; phase D → April 15 after the move year (FBAR: per `md_facts` → `fbar_filing_deadline`); phase E → before the renunciation / surrender appointment.
3. **Applicability filters** (item removed with reason, not silently dropped): state-tax items only if `origin_us_state` is set; US-account items only if any household member is `us_person`; real-estate item only if `us_home.owned`; phase E only if `renouncing_or_surrendering ≠ none` (and, for green cards, `green_card_years_in_last_15 ≥ 8` — otherwise E is replaced by "not a long-term resident — exit tax not applicable").
4. **Status per item:** `done` if in `done_items`; `overdue` if open and due date < `today`; `due_soon` if open and due within 30 days; `open` otherwise.
5. **§121 window** (if applicable): if `occupied_months_ending_at_move_out ≥ 24`, last eligible sale date = `move_out_date + 3 years`; else "use test not met — partial-exclusion rules, CPA". Show the date, `estimated_gain_usd`, and the md_facts exclusion for `filing_status` (MFJ key for `mfj`, single key otherwise).
6. **Exit-tax screen** (phase E only): `covered = net_worth_usd ≥ $2,000,000` OR `avg_annual_us_income_tax_5yr_usd > sourced threshold` OR `form_8854_compliance_5yr = false`. If the threshold is unsourced and the other tests are false, result = `unknown`.
7. **First-year filing tests:** FBAR if `Σ foreign balance_usd > threshold`; Form 8938 if over the abroad year-end threshold for `filing_status`.

### Decision rules

Headline; evaluate top to bottom; the first match wins. The full item table is always shown.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `move_date` missing | No timeline — ask |
| 2 | Phase E applies and exit-tax screen is `covered` or `unknown` | Stop — cross-border CPA + attorney before any expatriation step |
| 3 | Any item `overdue` | Clear overdue items first (listed by due date, then item id) |
| 4 | `d > 0` | Work the current phase's `due_soon` then `open` items |
| 5 | Otherwise (`d ≤ 0`) | Post-move: phase C items, then phase D first-year filing items |

### Output template

```markdown
# Moving Country Checklist — {origin_country} → {destination_country}, move {move_date}

## Headline
{d} days to move · {overdue} overdue · {due_soon} due in 30 days. Recommendation: **{rule # action}**.

## Personalized timeline
| ID | Phase | Item | Due date | Status |
|---|---|---|---|---|

## Tax-residency disengagement audit
{state items and status — or "Not applicable — no US state of origin"}

## Brokerage / account migration plan
| Institution | Type | Action | By date |
|---|---|---|---|

## US home (§121)
{eligibility, last eligible sale date, exclusion amount — or "Not applicable — no US home owned"}

## Insurance bridge
{gap dates and coverage plan}

## First cross-border filing year
| Form | Required? | Test | Due date |
|---|---|---|---|

## Exit-tax screen
{covered / not covered / unknown with each test — or "Not applicable — not expatriating"}

Educational. Plan with a cross-border CPA and immigration attorney.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
