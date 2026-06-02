# Big Purchase Review

description: General-purpose decision framework for any major purchase ($1,000+ or anything that meaningfully impacts cash flow / debt / lifestyle). Surfaces the "do I need this, can I afford this, is this the best option, what's the exit" framework. Use when the purchase doesn't fit a more specific skill (car, home).

## When to use

- New appliance, furniture set, computer / tech rig, e-bike, boat, RV, jewelry, etc.
- Home-renovation project.
- Vacation / large discretionary purchase.
- Anything that triggers user uncertainty about whether to pull the trigger.

## Inputs needed

- The item, price, and seller(s).
- Financing terms if any.
- Replacement or upgrade context (existing item being replaced?).
- The user's emergency-fund balance and current debts (cash-affordability check).
- Use-frequency expectation.

## Workflow

1. **Need vs Want check.** Force a clear articulation: what problem does this solve, what's the alternative, what happens if the user waits 30 days. Surface this without being preachy.
2. **Affordability check.** Quick rules:
   - Emergency fund still ≥ 3 months expenses after purchase?
   - No high-interest debt being neglected?
   - If financed: monthly payment fits inside discretionary budget?
3. **Compare options.** New vs used vs refurbished vs higher-tier vs lower-tier. Cost differential vs feature differential.
4. **Total cost of ownership.** Don't just price-shop the sticker. Maintenance, consumables, accessories, software subscriptions, insurance if applicable. Route to `total_cost_of_ownership` for items that warrant the deep dive.
5. **Timing.** Is there a known seasonal discount window (Black Friday, end-of-model-year, holiday clearance)? If waiting saves 20%, surface that even when the user wants it now.
6. **Resale and exit.** What's the resale market like at 1 / 3 / 5 years? Highly depreciating items (electronics, designer fashion) are different from durable goods (quality tools, well-made furniture).
7. **Financing decision.** Cash > 0% promo (paid off in window) > standard credit > store-card. Avoid "deferred interest" store financing — retroactive interest if not paid in full by deadline.
8. **Sleep on it (when feasible).** Particularly for >$2k discretionary buys.
9. **Output.** Buy now / buy later / buy different / don't buy, with the deciding factor and any conditions.

## Required citations

- Prices cite the listing / quote.
- Comparison alternatives cited with the source for their price.

## Deliverable shape

- Markdown report `./money-desk/purchase-advisor/big-purchase-review-<YYYYMMDD>.md`:
  - **The decision** — Buy / Wait / Don't.
  - **Need vs want analysis.**
  - **Affordability check** — emergency-fund / debt / budget status.
  - **Options comparison** — table of alternatives with price + key differentiators.
  - **Timing notes.**
  - **TCO summary** with hand-off to `total_cost_of_ownership` if warranted.
  - **Financing recommendation.**

## Notes

- Don't moralize. Surface the trade-offs and let the user decide.
- "Lifestyle inflation" is real — flag it gently when small upgrades compound.
- Some purchases are emotionally driven and that's fine; just confirm affordability is honest.
- "Analysis only. Not professional financial advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).