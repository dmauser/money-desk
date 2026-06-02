# Withdrawal Strategy

description: Sequence retirement-account withdrawals (taxable, traditional, Roth) to minimize lifetime tax. Models Roth conversions in low-income years, RMDs, IRMAA cliffs, and ACA subsidies if applicable. Use as the user nears or enters retirement.

## When to use

- Within 5 years of retirement.
- Already retired and managing draws.
- Considering Roth conversions in a low-income window (early retirement, gap year, sabbatical).

## Inputs needed

- Account balances by type: taxable, traditional 401k/IRA, Roth, HSA, others.
- Cost basis in taxable (for capital-gains planning).
- Current age and ages 73 / 75 RMD start (per SECURE 2.0 — confirm working year rules).
- Expected annual spend in retirement and Social Security start age.
- Tax filing status and state.
- Healthcare plan (pre-65 ACA, 65+ Medicare; IRMAA brackets matter).

## Workflow

1. **Map the buckets.** Each account's tax treatment on withdrawal:
   - Taxable — capital gains on appreciation; basis returned tax-free.
   - Traditional — ordinary income on full withdrawal.
   - Roth — tax-free (if seasoning met).
   - HSA — tax-free for qualified medical, otherwise ordinary income (+ penalty before 65).
2. **Standard sequencing default (oversimplified):**
   1. Taxable first (lets tax-advantaged keep compounding tax-free).
   2. Traditional next.
   3. Roth last (lets it grow tax-free; passes to heirs efficiently).
   But this is rarely optimal — see step 3.
3. **Optimize by filling brackets, not draining one bucket at a time.**
   - Each year, fill the standard deduction + lower brackets with traditional withdrawals (or Roth conversions) — these are essentially "free" or low-cost income.
   - Top up to spend target from taxable (LT gains taxed at 0% / 15% / 20%).
   - Roth as overflow / for big lumpy spends that would push into a higher bracket.
4. **Roth conversion windows.** Pre-Social-Security and pre-RMD years are often the lowest-income years of retirement. Converting traditional → Roth at low brackets reduces future RMDs and locks in low rates.
5. **RMD pressure.** Project traditional balance at RMD start. If RMDs will push the user into IRMAA / higher brackets, that's a strong case to convert now.
6. **Cliffs to avoid:**
   - IRMAA Medicare surcharge brackets (65+) — staying $1 below a bracket saves real money.
   - ACA subsidy cliff (pre-65) — converting too much can spike the user's marketplace premium.
   - NIIT 3.8% threshold ($200k single / $250k MFJ MAGI).
   - SS taxability thresholds (up to 85% taxable above $34k single / $44k MFJ provisional income).
7. **Year-by-year plan.** Recommend specific draws + conversions for the next 3–5 years; longer horizon as a directional plan.

## Required citations

- Every bracket / cliff cites the tax year explicitly.
- RMD age cites the applicable SECURE Act provision.
- IRMAA brackets cite Medicare.gov.

## Deliverable shape

- Markdown plan `./money-desk/retirement-planner/withdrawal-strategy-<YEAR>.md`:
  - **Year-by-year table** — gross income target, source breakdown (taxable cap-gains / traditional / Roth / SS), Roth conversion amount, projected MAGI, IRMAA risk flag, marginal bracket touched.
  - **Conversion plan** — total to convert and by when (before RMD start + before SS).
  - **Cliff calendar** — which years are most/least flexible.

## Notes

- Sequence is highly user-specific. Don't sell the simple "taxable → traditional → Roth" rule as gospel.
- Cost-basis tracking matters in taxable — specific-lot ID.
- "Analysis only. Not professional retirement or tax advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).


### XLSX deliverables — template + named-ranges contract

When this skill produces an XLSX, it **MUST**:

1. **Start from the shipped template** at `template.xlsx.json` in this skill's
   folder. The template pre-declares the Inputs schema, named ranges, and
   Summary/Analysis formulas. Fill only **values** (and narrative cells) —
   never hand-author raw `A1` coordinates in formulas.
2. **Reference cells by name**, never coordinate. Use
   `=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)` rather
   than `=PMT(Inputs!B5/12, Inputs!B4*12, -B11)`. This is the bug class the
   template system exists to prevent: a Rent vs Buy report once shipped with
   Monthly P&I pointing at Inputs!B6 (holding horizon) instead of Inputs!B4
   (mortgage term) — off by 75% — and the BUY/RENT cells pointing at the
   same source.
3. **Recompute every headline figure** independently in Python and assert
   agreement within 1% before declaring done (see
   `report_quality.self_verification` in `data/preferences.yaml`).
4. **Recalculate the workbook** after rendering (LibreOffice headless on
   Linux/Mac, Excel COM on Windows, or the `formulas` package) and reload
   with `data_only=True`; openpyxl alone does not evaluate formulas.
5. **Cross-format diff**: if markdown + XLSX (or DOCX) are both produced,
   diff every headline figure across formats; abort and re-render if any
   pair differs by more than 1%.
6. **Flag duplicate-value-with-different-label** in the same table — that
   pattern is almost always a reference-pointing bug, not a coincidence.
