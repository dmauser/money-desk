## Mortgage Strategy Review

description: For an existing mortgage holder, evaluate refinance, recast, ARM-vs-fixed, and HELOC-vs-cash-out-refi decisions with explicit break-even math and total-interest-paid comparisons. Applies to primary residence and investment property.

## When to use

- Mortgage rate has dropped meaningfully (or user thinks it has).
- Considering refi from ARM to fixed, fixed to ARM, or 30y → 15y.
- Have a windfall and considering recast vs prepay vs invest.
- Need to access home equity (HELOC vs cash-out refi vs reverse mortgage).
- ARM about to reset.

## Inputs needed

- Current mortgage: balance, rate, remaining term, type (fixed / ARM with reset details), monthly P&I.
- Property: current estimated value, original purchase price, owner-occupied vs investment.
- Quote(s) for new loan: rate, term, points, closing costs (all-in, not just origination).
- Planned holding period for the property.
- Marginal tax rate (interest deductibility depends on standard vs itemized).
- For HELOC / cash-out: intended use of cash and amount.

## Workflow

1. **Compute new payment** at the quoted terms.
2. **Compute monthly savings** = old P&I − new P&I.
3. **Compute true closing cost** (lender + third-party + escrow funding − escrow refund − rate-buydown credits).
4. **Break-even** = closing cost ÷ monthly savings (months).
5. **Decision**: refi only if planned holding period > break-even by a meaningful margin (default rule of thumb: holding period ≥ 1.5× break-even).
6. **Total-interest comparison** over remaining holding period: old vs new — refi can have shorter break-even but worse total interest if user is restarting a 30-year amortization.
7. **ARM-vs-fixed**: compare initial-rate savings against worst-case post-reset rate (current rate + max periodic cap, current rate + lifetime cap). Default rule: prefer fixed unless ARM initial-period exceeds planned holding period by ≥ 2 years.
8. **Recast (if windfall)**: paying down principal and re-amortizing at same rate / term lowers monthly payment without restarting amortization or closing costs. Usually requires $5–10k+ principal-curtailment + a $250–500 recast fee. Compare to investing the same lump sum at after-tax expected return.
9. **HELOC vs cash-out refi**: HELOC = variable rate, only-pay-on-balance-used, doesn't touch the first lien (preserves a low fixed first-mortgage rate). Cash-out refi = locks in today's rate on the entire new principal, prepayment-friendly but resets amortization. Almost always: if first-mortgage rate is meaningfully below current rates, keep the first and use a HELOC.

## Output

- Side-by-side: current loan vs proposed loan(s).
- Break-even months + total-interest-over-holding-period.
- Recommendation with the conditions (holding period, rate environment) that would flip it.

## Citations / sources

- Loan terms: cite the Loan Estimate (LE) document — every cost line itemized there. Mark verbal quotes `[UNSOURCED]`.
- Rate-environment context: cite Freddie Mac PMMS or current rate-tracker for benchmark.
- Tax treatment: cite IRC §163(h) and current standard-deduction amount; interest deductibility only matters if itemizing.

## Disclaimer

Analysis only. Doesn't apply, doesn't lock, doesn't sign anything. Recommend an independent mortgage broker (paid by lender or flat-fee) for shopping; flag captive-lender commission incentives.


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
