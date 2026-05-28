## Sell vs Hold Rental

description: For an existing rental property the owner is considering selling, compute after-tax sale proceeds and compare to the NPV of continuing to hold. Factors in depreciation recapture, LTCG, NIIT, state tax, selling costs, owner's time burden, and portfolio concentration risk.

## When to use

- Owner is tired of being a landlord ("the toilet calls" fatigue).
- Property has appreciated significantly — temptation to lock gains.
- Cash flow has deteriorated (vacancy, rent control, expense creep).
- Property is becoming a concentration risk in the user's net worth.
- Considering §1031 into a different property type (e.g., out of a high-management SFR into a passive DST or NNN).
- Approaching retirement and re-evaluating income vs simplicity.

## Inputs needed

- Property: current estimated value (with broker price opinion or recent appraisal), original cost basis, accumulated depreciation, current outstanding loan balance.
- Selling cost assumption (default 7-8%: 5-6% commission + 1-2% closing costs).
- Owner: filing status, marginal federal + state rate, MAGI (for NIIT 3.8% threshold), tax year.
- Current annual cash flow (NOI − debt service − capex reserve).
- Owner's required return (discount rate) for the NPV comparison.
- Time spent annually managing this property (be honest; convert to $ at owner's earning rate).
- Alternative deployment of sale proceeds: paying down own mortgage, equity index funds, another rental, dividend stocks, etc.

## Workflow

### Net sale proceeds
1. **Sale price** − **selling costs** = **net sale price**.
2. **Net sale price** − **outstanding loan balance** = **gross cash to seller**.
3. **Total gain on sale** = Net sale price − Adjusted cost basis (original basis + capital improvements − accumulated depreciation).
4. **Depreciation recapture** = accumulated depreciation × **25%** (unrecaptured §1250 gain rate).
5. **LTCG portion** = (Total gain − recapture portion) × **15% or 20%** depending on income bracket.
6. **NIIT** = 3.8% on the gain if MAGI > $200k single / $250k MFJ.
7. **State tax** = state rate on full gain (most states don't have preferential LTCG).
8. **After-tax cash** = Gross cash to seller − (recapture tax + LTCG + NIIT + state tax).

### Hold scenario NPV
- Project 10-year cash flow with rent growth, expense growth, capex events.
- Project year-10 sale with the same after-tax computation (price grown at assumption, depreciation accumulated to date).
- Discount at owner's required rate.
- Subtract owner's annual time cost in dollars.

### Decision framework
- If sell-now after-tax cash invested at the alternative return > hold-NPV → sell (do the §1031 evaluation first if the gain is large).
- If concentration risk is severe (this property > 30% of net worth) → bias toward partial-sell (impossible) or §1031 into multiple smaller assets / DST.
- If user explicitly wants to stop being a landlord, that's a valid preference; don't argue them out of it for marginal NPV.

### §1031 consideration
- Always compute "what if we §1031 into X instead of selling?" as a third scenario.
- The deferred tax compounding at the user's after-tax return is meaningful; the §1031 option is rarely a bad ANALYTICAL outcome but is often the wrong fit for someone who wants to be done with being a landlord.
- DST (Delaware Statutory Trust) is the passive option: 1031 into fractional commercial ownership; no management; illiquid 5-10 years; sponsor fees.

## Output

- Three scenarios side-by-side: **Sell + invest proceeds**, **Hold**, **§1031 into [alternative]**.
- For each: after-tax cash today, projected 10-year wealth, projected 10-year time burden.
- Sensitivity on the two assumptions most likely to flip the decision.
- Clear recommendation with the user-preference factor (time / simplicity) named explicitly.

## Citations / sources

- Cost basis: cite settlement statement, capital-improvement receipts, depreciation schedule from prior returns.
- Tax rates: cite current-year IRS LTCG brackets, state DOR for state.
- NIIT: IRC §1411.
- Recapture: IRC §1250.

## Disclaimer

Analysis only. Strongly recommend a CPA familiar with real-estate dispositions before any sale or §1031 contract. State / local transfer taxes vary widely and can change the answer materially. Mortgage-payoff and prepayment-penalty terms vary — confirm with servicer.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).