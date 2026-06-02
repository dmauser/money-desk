# Return Prep Checklist

description: Assemble every document needed to file a personal federal (and optionally state) tax return. Produces a categorized checklist with status (have / missing / requested). Use at the start of tax season or whenever the user says "help me get organized to file."

## When to use

- Pre-filing season (Jan–Mar) — primary use.
- After a life event that changes documentation needs (new job, new dependent, home purchase, retirement, side income, etc.).
- The user is switching from self-file to a CPA and wants to hand off a clean packet.

## Inputs needed

- Tax year and filing status.
- Prior year's return (single most useful reference — predicts most of this year's docs).
- List of major life changes since last filing.
- Approximate income sources (W-2 employer, 1099 payers, brokerages, etc.).
- Whether itemizing is on the table (drives deduction docs).

## Workflow

1. **Establish filing status and dependents.**
2. **Build the income document list** from sources:
   - **Wages:** W-2 per employer.
   - **Self-employment / contractor:** 1099-NEC / 1099-MISC / 1099-K (some states/platforms); plus business income records.
   - **Investment:** 1099-INT (interest), 1099-DIV (dividends), 1099-B (sales/lots), consolidated 1099s.
   - **Retirement:** 1099-R (distributions), SSA-1099 (Social Security), pension forms.
   - **Other:** K-1 (partnerships/S-corp), 1099-G (state refunds, unemployment), W-2G (gambling), 1099-Q (529 distributions).
3. **Build the deduction/credit document list:**
   - **Above-the-line:** HSA contributions, retirement contributions (IRA, self-employed), student-loan interest (1098-E), educator expenses, SE health insurance.
   - **Itemized:** mortgage interest (1098), property tax statements, state & local income tax records, charitable contributions (receipts and acknowledgement letters), medical above-AGI-threshold, casualty losses in declared disaster areas.
   - **Credits:** child & dependent care receipts, education (1098-T), energy-efficient home improvements, EV/clean-vehicle, child-tax-credit-eligible dependents.
4. **Mark status.** For each: have / missing-but-coming / missing-and-need-to-request / N/A.
5. **Cross-check against prior return.** Anything on Schedule 1/B/D/E last year should appear again unless a life change explains its absence.
6. **Output a chase list** for missing items, with where to get each (employer payroll portal, brokerage, mortgage servicer, charity).

## Required citations

- Every row cites the source (employer, broker, etc.) and the form name + box numbers used.
- Cross-reference flags cite the prior-year schedule/line.

## Deliverable shape

- Markdown checklist `./money-desk/tax-planner/return-prep-checklist-<YEAR>.md`:
  - **Status header** — total docs needed / have / missing.
  - **Income docs table** — form, source, expected by, status.
  - **Deduction/credit docs table** — same shape.
  - **State-specific items** if requested.
  - **Chase list** — what to request, from whom, with example wording.

## Notes

- 1099-K thresholds and form availability vary by year and platform. Confirm the current rules with the IRS site, not your memory.
- Itemizing is increasingly rare since TCJA; check the Deductions Review skill before assembling itemized docs.
- For ESPP / RSU / ISO holders: confirm the brokerage 1099-B + supplemental statement; basis on the 1099-B is often wrong for compensation income already taxed via W-2.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).