# RMD Planner

description: Plan Required Minimum Distributions from tax-deferred accounts at and after the RMD age (currently 73 per SECURE 2.0; 75 for those born 1960+). Projects RMDs forward, surfaces tax-bracket and IRMAA impact, models pre-RMD Roth conversions, and evaluates QCDs as an RMD-satisfying strategy.

## When to use

- User is within ~10 years of RMD age (planning window for Roth conversions).
- User is at RMD age and needs to calculate this year's RMD.
- User is approaching RMDs with large traditional balances (RMD pressure on tax bracket).
- User wants to evaluate QCD to satisfy part/all of RMD.

## Inputs needed

- Date of birth (determines RMD age: 73 for born 1951–1959, 75 for born 1960+).
- Account balances as of Dec 31 prior year for each tax-deferred account (Traditional IRA, Rollover IRA, SEP, SIMPLE, 401(k) if separated).
- Marital status and spouse's age (>10y younger spouse uses different table).
- Other income sources, filing status.
- Roth IRA balance and Roth conversion history.
- Charitable giving target (for QCD).

## Workflow

1. **Compute current-year RMD.**
   - Per-account (prior-year 12/31 balance) ÷ (IRS Uniform Lifetime Table divisor at age).
   - Traditional IRAs can be aggregated and taken from any one IRA; 401(k)s cannot be aggregated and must be taken from each plan separately.
   - Roth IRAs have NO RMD for the original owner.
   - Cite the table used.
2. **Project 10-year RMD path.** Assume X% real growth on the remaining balance; compute RMD each year. Add to other income; show projected marginal bracket and IRMAA tier each year.
3. **Identify the squeeze.** Are projected RMDs going to push the user into a higher bracket or IRMAA tier than today? That's the case for action.
4. **Roth conversion sizing.** Recommend annual conversion amount in pre-RMD years to "level" the tax-bracket trajectory: fill 22% or 24% bracket today rather than 32%+ later.
5. **QCD overlay** (age 70½+). QCDs up to the annual cap (cite year) count toward RMD AND reduce AGI — uniquely valuable for IRMAA-sensitive retirees. Cap is $108k in 2025, indexed.
6. **First-year timing rule.** First RMD can be deferred to April 1 of the following year — but doing so creates TWO RMDs in that year. Almost always better to take in the first year.
7. **Penalty awareness.** Missed RMD = 25% excise tax (10% if corrected within 2 years per SECURE 2.0). Process: take the missed amount NOW, file Form 5329 with waiver request explaining reasonable cause.

## Required citations

- RMD age cites SECURE 2.0 by birth-year.
- Divisor cites the Uniform Lifetime Table (or Joint Life if spouse >10y younger).
- QCD limit cites the tax year.
- IRMAA brackets cite the Medicare year (2-year lookback applies).

## Deliverable shape

- Markdown plan `./reports/retirement-planner/rmd-planner-<YEAR>.md`:
  - This year's RMD per account + aggregation rules.
  - 10-year projection table: RMD $, total income, marginal bracket, IRMAA tier.
  - Conversion recommendation table (year-by-year $).
  - QCD recommendation (if 70½+).
  - First-year deferral analysis (if applicable).

## Notes

- 401(k) "still-working" exception: if user is still working at the sponsoring employer and is NOT a >5% owner, they can defer RMDs on that 401(k) only.
- Inherited IRA rules differ (10-year rule, EDBs) — outside this skill; flag for separate review.
- "Analysis only. Not professional retirement or tax advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).