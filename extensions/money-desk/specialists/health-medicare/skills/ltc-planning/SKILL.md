# Long-Term Care Planning

description: Plan for long-term care (LTC) — custodial care that Medicare does NOT cover and that hits 50%+ of seniors. Frames the funding strategy across self-insure / traditional LTC insurance / hybrid life+LTC / annuity+LTC / Medicaid planning. Sizes the potential liability against assets.

## When to use

- User is 50–65 — the sweet spot for traditional LTC underwriting (younger = harder to justify; older = harder to qualify and more expensive).
- User has parents needing LTC and is realizing they have no plan themselves.
- User has $500k–$3M net worth — the band most exposed (poorer qualifies for Medicaid, richer self-insures).
- User has a family history suggesting elevated risk (dementia, Parkinson's).

## Inputs needed

- Age, health status (controlled chronic conditions are usually OK; cognitive decline is disqualifying).
- Marital status (couples can stagger care; widowers have higher institutional-care risk).
- Net worth, breakdown (liquid investable vs home equity vs annuities).
- State of residence (LTC costs vary 3–4x; e.g., median nursing-home cost ranges from ~$90k/yr Texas-rural to $200k+/yr NYC/Boston/Bay Area; cite Genworth Cost of Care Survey).
- Income sources in retirement (SS, pension, withdrawals).
- Existing life insurance with riders, annuities.

## Workflow

1. **Size the liability.** Use state-specific Genworth data:
   - Average claim: ~3 years.
   - Annual cost: home health $X, assisted living $Y, nursing home $Z (cite state).
   - Inflation: ~3–5%/yr historical.
   - Probability: ~70% of 65-year-olds need some LTC; ~20% need it 5+ years; ~13% need nursing home.
2. **Funding-source decision matrix:**
   - **Self-insure** — viable if liquid investable assets > 5× expected lifetime LTC cost AND the user is comfortable spending principal. Cleanest, no premium.
   - **Traditional LTC insurance** — pure insurance; use-it-or-lose-it; premium can be raised (history of double-digit hikes); best leverage of dollar but commitment risk. Look for: 3–5 year benefit, 90-day elimination, 3–5% compound inflation, partnership program (state Medicaid asset-protection bonus).
   - **Hybrid life + LTC** (asset-based) — single or 10-pay premium; if LTC unused, death benefit pays beneficiaries. Higher upfront, no rate-hike risk. Best for users sitting on idle cash they'll otherwise leave to heirs.
   - **Annuity + LTC** — niche; useful for unhealthy applicants who can't qualify for LTC underwriting.
   - **Medicaid planning** — for users with limited assets; spend-down + look-back rules (5 years federal) require attorney-led strategy. Not a DIY path.
3. **Couples strategy.** Statistically the WIFE outlives the husband and is the one needing extended care — covering her is the higher-leverage decision.
4. **Home equity.** Reverse mortgage (HECM) is a contingent LTC funding source for users staying in home; flag it but don't recommend lightly (fees, complexity).
5. **State partnership program.** In many states, buying a qualified partnership LTC policy lets the user protect $1 of assets from Medicaid spend-down per $1 of policy benefit paid. Big deal.

## Required citations

- LTC cost numbers cite Genworth Cost of Care Survey + year + state.
- Probability stats cite HHS / ACL longterm care.gov data.
- Tax rules (Sec 7702B qualified plans, deductible premiums above 7.5% AGI threshold) cite IRS.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/ltc-planning-<YEAR>.md`:
  - Liability sizing (low / base / high scenario × state cost).
  - Self-insurance test (assets vs liability multiple).
  - Funding-source recommendation with reasoning.
  - If insurance recommended: minimum policy features to require.
  - Couples / wife-coverage prioritization (if applicable).

## Notes

- LTC underwriting is strict — getting quotes EARLIER while healthy is the single highest-leverage move.
- Traditional LTC premiums have HISTORICALLY been raised repeatedly — assume +30–50% over policy life when budgeting.
- "Analysis only. Not professional insurance, tax, or legal advice. Recommend a fee-only LTC specialist or elder-law attorney for Medicaid planning."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).