# Total Cost of Ownership

description: Compute total cost of ownership over the planned hold period for a durable purchase — upfront + financing + operating + maintenance + opportunity − resale. Lets the user compare options on lifetime cost, not sticker. Use for car / appliance / boat / second-home / tech rig decisions.

## When to use

- The user is deciding between two cars at different price points and reliability profiles.
- Comparing appliance tiers (entry vs premium).
- Second home or vacation property cash-flow analysis.
- Any "is the cheaper one actually cheaper?" question.

## Inputs needed

- Each candidate option's:
  - Purchase price (or lease cost if leasing).
  - Financing terms.
  - Annual operating cost (fuel/electricity, registration, insurance).
  - Expected annual maintenance + likelihood of major repairs.
  - Expected resale value at horizon.
- Hold-period horizon (years).
- User's opportunity cost of capital (often = expected investment return or = loan rate).

## Workflow

1. **Per option, build the year-by-year cash flow:**
   - Year 0: down payment + tax + registration + dealer fees.
   - Year 1..N: financing payment + insurance + fuel/electricity + maintenance + expected repair fund.
   - Year N: − resale value (cash inflow on disposal).
2. **NPV the cash flows** at the user's opportunity-cost rate. Present-value all costs/resales to today.
3. **Per-mile or per-year normalization.** Total NPV / expected miles or years gives an "all-in cost per mile" or "all-in cost per year" — extremely useful for comparing options with different lifespans.
4. **Reliability adjustment.** For options with known reliability differences (Toyota vs European luxury sedan), apply a realistic repair-cost premium beyond the warranty window. Use Consumer Reports / RepairPal data points where possible.
5. **Insurance differential.** Get actual quotes — premium cars / sports cars insure for materially more. Don't estimate.
6. **Fuel / energy.** Compute annual based on user's miles × MPG or kWh/mi × electricity cost.
7. **Resale curve.** Use brand+model depreciation curves (KBB / iSeeCars / Black Book). Some brands hold value notably better.
8. **Sensitivity sweep.** ±20% miles/yr, ±1pp opportunity cost, ±20% major-repair fund. Show range.
9. **Decision output.** Rank options by lifetime cost; surface the trade-offs (higher upfront but lower TCO, vs lower upfront with higher operating cost).

## Required citations

- Fuel economy cites the EPA / manufacturer spec + adjusted for user's typical mix.
- Insurance cites quote.
- Resale cites lookup tool + date.
- Reliability premium cites a public data source.

## Deliverable shape

- Markdown report `./reports/purchase-advisor/tco-<ITEM>-<YYYYMMDD>.md`:
  - **Headline** — TCO per option over N years; winner.
  - **Per-option buildup** — line by line.
  - **Per-year cash-flow table.**
  - **Per-mile / per-year normalized number.**
  - **Sensitivity table.**
  - **Decision** — recommended option with reasoning.

## Notes

- Sticker price is rarely the right comparison. Insurance + fuel + reliability often swap which option is "cheaper."
- For EVs vs ICE: factor charging-infrastructure cost, home-charger install, electricity rate seasonality.
- For appliances: factor energy efficiency, warranty differences, expected service life.
- "Analysis only. Not professional advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).