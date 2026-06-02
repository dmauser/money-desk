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
- [ ] **Real estate**: sell, rent out, or keep vacant? Tax implications differ; sell triggers §121 ($250k/$500k) primary-residence exclusion if 2 of 5 owner-occupied — clock matters.
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
- [ ] **First FBAR** if aggregate non-US accounts > $10,000.
- [ ] **First Form 8938** if applicable thresholds met.
- [ ] **First PFIC clean-up** if any foreign mutual funds picked up.
- [ ] **Beneficiary, will, POA** review — does the US-drafted will conform to destination-country succession law? Often not; consider a parallel destination-country will.
- [ ] **Annual review** scheduled — cross-border situations need yearly check-in, not 3-yearly.

### Special case: US-citizenship renunciation or green-card surrender

- [ ] **Section 877A exit-tax screening** for "covered expatriate" status:
  - Net worth ≥ $2,000,000, OR
  - Average annual US income tax > ~$201,000 for 5 prior years (2024 figure; check current year), OR
  - Failure to certify 5-year compliance on Form 8854.
- [ ] If covered → mark-to-market deemed sale of worldwide assets on the day before expatriation. Tax owed on net gain > exclusion (~$821,000 for 2024). Specific deferred-comp and IRA rules apply.
- [ ] Renunciation appointment at US consulate; $2,350 renunciation fee.
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).