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

- Markdown plan `./reports/retirement-planner/withdrawal-strategy-<YEAR>.md`:
  - **Year-by-year table** — gross income target, source breakdown (taxable cap-gains / traditional / Roth / SS), Roth conversion amount, projected MAGI, IRMAA risk flag, marginal bracket touched.
  - **Conversion plan** — total to convert and by when (before RMD start + before SS).
  - **Cliff calendar** — which years are most/least flexible.

## Notes

- Sequence is highly user-specific. Don't sell the simple "taxable → traditional → Roth" rule as gospel.
- Cost-basis tracking matters in taxable — specific-lot ID.
- "Analysis only. Not professional retirement or tax advice."
