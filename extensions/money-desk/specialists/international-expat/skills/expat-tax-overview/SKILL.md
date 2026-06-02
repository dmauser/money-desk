## Expat Tax Overview

description: Explain the US-citizen / green-card-holder filing landscape for someone living abroad: the FEIE vs Foreign Tax Credit decision, the FBAR and FATCA / 8938 thresholds, PFIC reporting trigger, state-tax disengagement strategy, totalization agreements for self-employment tax. Educational triage — actual filing requires a cross-border CPA.

## When to use

- US citizen or green-card holder moving abroad or already abroad.
- Returning to the US after years overseas (catch-up filing).
- Suspecting a non-filing exposure (Streamlined Filing Compliance Procedures candidate).
- Choosing between FEIE and FTC at year-end.

## Inputs needed

- Citizenship + green-card status (and any history of changes).
- Country of residence and physical-presence days (FEIE requires either Bona Fide Residence or 330 of 365 days outside the US).
- Employment type: US employer remote, foreign employer, self-employed, dual.
- Earned income (USD-converted), foreign tax paid (USD), foreign-tax-year vs US-tax-year alignment.
- All non-US financial accounts: aggregate peak balance, count of accounts, custodian country (for FBAR / 8938 thresholds).
- Tax-treaty country (if any).
- State of last US residence (drives state-tax disengagement question).

## The core decisions

### FEIE (§911) vs Foreign Tax Credit (§901)
- **FEIE** excludes up to $130,000 (2025, indexed) of foreign earned income from US tax. Requires Bona Fide Residence OR Physical Presence (330/365). Form 2555.
- **FTC** credits foreign income tax paid against US tax owed on the same income. Form 1116. No earned-income cap. Carryback 1 year, carryforward 10 years.
- **Decision rule**:
  - Live in a HIGH-tax country (most of Western Europe, UK, Canada, Australia, Japan) → FTC almost always wins (foreign tax > US tax, full credit).
  - Live in a LOW / ZERO-tax country (UAE, KSA, Bermuda, Bahamas, Singapore for many cases) → FEIE wins.
  - Mid-tax country → run both, take the lower-tax outcome. Once you elect FEIE, revoking is permanent for 5 years without IRS consent — be deliberate.
- **FEIE quirk**: housing exclusion / deduction stacks on top of FEIE (Form 2555, capped). Self-employed get housing deduction; employed get housing exclusion.

### FBAR (FinCEN 114)
- Required if aggregate of ALL non-US financial accounts > **$10,000** at ANY point in the tax year.
- File via FinCEN, NOT IRS. Separate from 1040.
- Due April 15 with automatic extension to October 15.
- **Penalty up to $10,000 per non-willful violation per year**; willful can be greater of $100k or 50% of account balance. This is the harshest US-cross-border penalty regime.

### FATCA / Form 8938
- Higher thresholds than FBAR, filed WITH 1040.
- US-residing single filer: $50k year-end / $75k peak. MFJ: $100k / $150k.
- US-citizen-residing-abroad single: $200k / $300k. MFJ abroad: $400k / $600k.
- Different from FBAR scope: 8938 includes some assets FBAR doesn't (foreign-issued securities held in foreign brokerage), but excludes some FBAR-covered accounts (foreign safety deposit boxes).
- BOTH may apply. File both if both apply.

### PFIC (Passive Foreign Investment Company) — Form 8621
- ANY non-US-domiciled mutual fund or ETF triggers PFIC rules.
- The default tax regime is punitive (highest ordinary rate + interest charge on deferred income).
- Two elections (QEF or Mark-to-Market) require annual reporting from the fund — most foreign funds don't provide it.
- **Rule**: US-person investors should NOT buy non-US-domiciled funds. Buy US-domiciled ETFs (Vanguard / BlackRock / SPDR / etc.) ALWAYS, even when living abroad — unless local-law restrictions block it (then accept the PFIC compliance cost or use individual stocks).

### Self-employment tax + totalization agreements
- US SE tax (15.3%) applies to US-citizen self-employed worldwide.
- US has totalization agreements with ~30 countries that prevent double-SS-taxation; the self-employed person pays SS only to the country of residence (with a certificate of coverage).
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).