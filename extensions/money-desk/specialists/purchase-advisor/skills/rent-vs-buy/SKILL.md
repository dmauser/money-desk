# Rent vs Buy

description: Compare renting vs buying a home on total cost over a holding horizon, including opportunity cost of the down payment. Uses the "price-to-rent ratio" sanity check and a year-by-year NPV. Outputs a verdict with the break-even hold period. Use for any housing decision.

## When to use

- The user is debating buy vs rent in their current market.
- Move to a new city — buy or rent for the first year?
- Trying to decide if it's "throwing money away" to rent.

## Inputs needed

- Target home: price, expected property tax, HOA, expected maintenance (~1%/yr of price), insurance.
- Mortgage terms available: rate, term, down payment %.
- Comparable rent for an equivalent property in the same area.
- Expected holding horizon (years).
- Expected home-price appreciation (real, conservative — 0–2% is realistic in many markets after fees).
- Expected rent inflation (often 3–4%/yr).
- Down payment alternative — what return would the down-payment money earn if invested instead (e.g., 5–7% real).
- Tax rate and itemizing status (mortgage interest deduction — usually moot under standard deduction).
- Selling costs (~6–8% of sale price — agent commissions, transfer tax, closing).

## Workflow

1. **Price-to-rent ratio sanity check.** P2R = home price / (annual market rent). <15 → buying usually favored; 15–20 → toss-up; >20 → renting usually cheaper. This is a coarse filter only.
2. **Year-by-year buy scenario:**
   - Mortgage P&I.
   - Property tax, HOA, insurance, maintenance (~1%/yr of price), PMI if <20% down.
   - Tax benefit (only if itemizing — likely zero for most under TCJA).
   - Equity built (principal portion of payment).
   - Appreciation on home value.
   - At end of horizon: sale proceeds = current value − mortgage balance − selling costs.
3. **Year-by-year rent scenario:**
   - Monthly rent × 12, inflated by rent CAGR.
   - Renters insurance.
   - Down payment kept invested — compounded at expected investment return.
4. **Net worth comparison at horizon end.**
   - Buy: equity (sale − mortgage − selling cost) + post-tax investment of any monthly cash-flow surplus over rent (often negative in early years).
   - Rent: invested down payment + invested monthly-cost differential (often positive in early years).
5. **Break-even.** At what horizon does the buy scenario overtake the rent scenario? Often 5–7 years in stable markets; longer in high-cost / high-fee markets.
6. **Sensitivity sweep.** ±1% appreciation, ±1% investment return, ±1% rent inflation. Show range, not point estimate.
7. **Non-financial factors.** Flexibility (rent), stability (buy), DIY tolerance, school district stability, expected job mobility. List explicitly but don't try to monetize.

## Required citations

- Comparable rent cites the listing source.
- Maintenance and selling-cost assumptions cite typical ranges.
- Appreciation and investment returns are assumptions — labeled as such.

## Deliverable shape

- Markdown report `./money-desk/purchase-advisor/rent-vs-buy-<YYYYMMDD>.md`:
  - **Headline verdict** — buy / rent / break-even at year N.
  - **Price-to-rent ratio** + interpretation.
  - **Year-by-year comparison table** for at least 10 years.
  - **Net-worth-at-horizon** for buy vs rent.
  - **Sensitivity range** — range of break-even years under stress.
  - **Non-financial considerations.**

## Notes

- "Building equity" is real but expensive — closing costs alone can offset the first 2–3 years of equity build.
- Most cost calculators ignore maintenance and selling costs and overstate buy. Show both honestly.
- Negative carry (mortgage cost > rent) is fine if appreciation + equity build outweighs it over horizon.
- "Analysis only. Not professional real-estate or financial advice."


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
