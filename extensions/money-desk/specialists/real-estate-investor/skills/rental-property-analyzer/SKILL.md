## Rental Property Analyzer

description: Underwrite a residential 1–4 unit rental property (existing or prospective purchase) with cap rate, cash-on-cash, IRR, DSCR, and the 1% / 50% sanity checks. Bake in honest vacancy, capex reserve, and management even if self-managed. Produces a go/no-go recommendation with the assumption sensitivities the deal lives or dies on.

## When to use

- Considering a rental property purchase (have a listing or pro-forma in hand).
- Reviewing an existing rental's actual performance vs underwriting.
- Comparing two candidate properties.
- Sanity-checking a syndicator / wholesaler / agent pro-forma.

## Inputs needed

- **Purchase price** (or current value if existing) and **down payment**.
- **Loan terms**: rate, amortization (15/20/30), fixed/ARM (and ARM reset details).
- **Gross rent** — current AND market. Get the market number from at least 2 comps (Rentometer, Zillow Rent Estimate, recent same-bedroom comps in the same building / block).
- **Operating expenses**: property tax, insurance, HOA, utilities owner pays, lawn / snow / pest.
- **Vacancy assumption** (default 8% if user has no local data).
- **Capex reserve** (default 1% of **property value per year** — roof, HVAC, water heater, flooring all have predictable useful lives; the older "8% of rent" rule of thumb under-reserves on appreciated properties).
- **Maintenance reserve** (default 1% of **property value per year** — routine repairs).
- **Management** (default 8–10% **of rent** even self-managed, so the deal stays honest when the owner later hires out or considers their time; use 0% only if the user is explicit about self-managing forever).
- Holding period assumed for IRR (default 10 years).
- Tax assumptions: marginal federal + state rate, depreciation schedule (residential 27.5y SL, land typically 20% of price).

## Workflow

1. **Validate the rent number.** If user gave one comp, push back; require 2-3 comps to anchor.
2. **Compute** Year-1 NOI: Gross Scheduled Rent − Vacancy − Operating Expenses (excluding debt service, depreciation, and capex by NOI convention; capex reserve is a separate line in cash-flow).
3. **Compute cap rate** = NOI ÷ Purchase Price. (No financing assumption.)
4. **Compute cash-on-cash** = (NOI − Annual Debt Service − Capex Reserve) ÷ Cash Invested (down + closing + immediate-repair reserve).
5. **Compute DSCR** = NOI ÷ Annual Debt Service. Most lenders require ≥ 1.20–1.25 for investment SFR / 2-4 unit.
6. **Run sanity checks**:
   - **1% rule**: monthly gross rent ÷ purchase price ≥ 1%? (rare in HCOL markets; missing it isn't a deal-killer, but it's a yellow flag).
   - **50% rule**: operating expenses (ex debt service) ~50% of gross rent. If pro-forma shows < 35%, something is missing.
7. **Project 10-year IRR** with rent growth (3%/y default), expense growth (3%/y), appreciation (3%/y), and exit at year 10 with 6% selling cost. Include depreciation recapture (25%) + LTCG (15–20% + 3.8% NIIT) + state tax on the sale.
8. **Sensitivity table**: re-run with rent down 5%, vacancy up to 12%, rate +1%, cap rate at exit +0.5% — show the cash-on-cash and IRR delta. A deal that only works at the base case is a fragile deal.

## Output

- One-page deal summary: address (masked), price, rent assumption, financing, key metrics (cap, CoC, DSCR, 10-yr IRR), and the recommendation (Pass / Marginal / Pursue).
- Sensitivity table.
- The two or three assumption levers the deal lives or dies on, explicitly named.

## Citations / sources

- Rent: cite comps (Rentometer, Zillow Rent Estimate, recent leased units).
- Expenses: cite the actual current numbers from MLS / current owner / listing agent, NOT defaults. Mark defaults as `[UNSOURCED]`.
- Tax assumptions: cite IRS Pub 527 for depreciation, current LTCG / NIIT brackets with tax year.

## Disclaimer

Analysis only. Not a recommendation to purchase. Recommend a local CPA + real-estate attorney for any actual purchase. State / county / city rules (rent control, transfer tax, registration requirements) vary widely — verify locally.


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
