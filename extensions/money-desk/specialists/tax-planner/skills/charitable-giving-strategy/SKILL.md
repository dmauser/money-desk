# Charitable Giving Strategy

description: Optimize the tax treatment of charitable gifts. Compares cash giving vs appreciated-securities vs Qualified Charitable Distributions (QCD) vs Donor-Advised Fund (DAF) "bunching" strategies given the user's income, AGI, itemize/standard posture, age, and giving target.

## When to use

- User regularly gives to charity and wants to maximize the tax benefit.
- User had a high-income year (RSU vesting, business sale, Roth conversion) and wants to offset.
- User is 70½+ (QCD eligible) and giving from an IRA.
- User has highly appreciated taxable holdings.

## Inputs needed

- Annual giving target ($) and recipient organizations (501(c)(3) status — public charity vs private foundation matters).
- Filing status, AGI estimate, current standard-vs-itemized posture.
- Taxable-account holdings with cost basis and holding period (>1 year matters).
- Age (for QCD eligibility — 70½+).
- Traditional IRA balance (for QCD).
- Whether the user already has or is open to a DAF (Fidelity / Schwab / Vanguard Charitable).

## Workflow

1. **Establish baseline.** Will the user itemize this year? If standard, cash gifts have zero federal tax benefit — the strategy needs to change.
2. **Appreciated-securities path.** For long-term-held positions with embedded gains, donating shares (not cash) avoids the cap-gains tax AND gives the FMV deduction (if itemizing). Deduction capped at 30% of AGI for public charities (vs 60% for cash). Cite tax year.
3. **Bunching via DAF.** If standard deduction usually wins, compute how many years of giving (typically 2–5) to "bunch" into one year via a DAF to clear the standard-deduction threshold once, then take standard in off-years. Models AGI cap and 5-year carryover.
4. **QCD path** (age 70½+). Direct IRA → charity transfer up to the annual QCD limit (cite year; $108k in 2025, indexed) counts toward RMD and is excluded from AGI — better than itemizing for many retirees because it lowers AGI (helps with IRMAA, SS taxability, NIIT). Must be direct trustee-to-charity transfer.
5. **Stacking.** Often optimal: QCD for RMD-age users + appreciated securities for high-AGI years + DAF for bunching.
6. **Non-cash gotchas.** Anything > $500 needs Form 8283; > $5,000 may need a qualified appraisal; private foundations have lower AGI caps (20–30%).

## Required citations

- AGI caps cite tax year and IRS Pub 526.
- QCD age (70½) and annual limit cite year and SECURE 2.0.
- Standard deduction amount cites tax year.

## Deliverable shape

- Markdown report `./reports/tax-planner/charitable-giving-<YEAR>.md`:
  - **Strategy stack** — which giving vehicle for which dollars and why.
  - **Tax savings table** — federal + state savings under each path; cash-out-of-pocket equivalent.
  - **DAF bunching schedule** (if applicable) — years on vs years off.
  - **Action checklist** — open DAF / instruct trustee on QCD / select shares to gift.

## Notes

- QCDs must go DIRECTLY from IRA trustee to the charity — the user cannot take a distribution and then donate it.
- DAF contributions are irrevocable but grants are recommended by the donor over time.
- "Analysis only. Not professional tax/legal advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).