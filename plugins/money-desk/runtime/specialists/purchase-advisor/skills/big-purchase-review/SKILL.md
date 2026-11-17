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
   - No high-interest debt (APR ≥ 10%) being neglected?
   - If financed: monthly payment fits inside discretionary budget?
3. **Compare options.** New vs used vs refurbished vs higher-tier vs lower-tier. Cost differential vs feature differential.
4. **Total cost of ownership.** Don't just price-shop the sticker. Maintenance, consumables, accessories, software subscriptions, insurance if applicable. Route to `total_cost_of_ownership` for items that warrant the deep dive.
5. **Timing.** Is there a known seasonal discount window (Black Friday, end-of-model-year, holiday clearance)? If waiting saves 20%, surface that even when the user wants it now.
6. **Resale and exit.** What's the resale market like at 1 / 3 / 5 years? Highly depreciating items (electronics, designer fashion) are different from durable goods (quality tools, well-made furniture).
7. **Financing decision.** Cash > 0% promo (paid off in window) > standard credit > store-card. Avoid "deferred interest" store financing — retroactive interest if not paid in full by deadline.
8. **Sleep on it (when feasible).** Particularly for >$2k discretionary buys.
9. **Output.** Buy now / buy later / buy different / don't buy per the Determinism rules decision table, with the deciding factor and any conditions.

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

## Determinism rules

### Input keys

- `item` — string
- `price_usd` — number; all-in price (incl. sales tax, delivery, install)
- `purchase_type` — `need` (solves a current problem) | `replacement` (existing item failing) | `upgrade` | `want`
- `urgent` — bool; delaying 30 days causes a real cost (broken essential appliance, job requirement)
- `financing` — `{ apr_pct, term_months, promo_apr_pct?, promo_months?, deferred_interest (bool) }` (optional)
- `cash_paid_usd` — number; cash leaving savings at purchase (= `price_usd` if paid in cash, or the down payment)
- `ef_balance_usd` — number; emergency-fund balance
- `monthly_essentials_usd` — number
- `high_interest_debt_usd` — number; balances at APR ≥ 10%
- `monthly_discretionary_surplus_usd` — number; cash left after essentials, savings goals, and debt minimums
- `alternatives` — list of `{ name, price_usd, meets_need (bool), notes }` (new / used / refurbished / other tier)
- `expected_discount_pct`, `discount_window_days` — numbers (optional; known sale window)
- `uses_per_month` — number (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Price, purchase type, EF balance, essentials | **Ask — no default** | — |
| High-interest debt | $0 | `[USER-PROVIDED]` once confirmed |
| Discretionary surplus | **Ask — no default** (only needed when financing) | — |
| Alternatives | None — options table shows only the chosen item | — |
| Seasonal discount | None known | `[ASSUMPTION]` |
| Resale value | **Ask — no default**; omit if unknown | — |

### Calculation method

> **Calculator:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. **Post-purchase EF months** = `(ef_balance_usd − cash_paid_usd) ÷ monthly_essentials_usd`, 1 decimal.
2. **Financed payment** (if financing): standard amortization `P = L × r ÷ (1 − (1+r)^−n)`, `r = apr_pct/100/12`, `L = price_usd − cash_paid_usd`. For a 0% promo: `promo_payment = L ÷ promo_months` (payment needed to clear it inside the promo).
3. **Payment fit:** payment (or `promo_payment`) ≤ `monthly_discretionary_surplus_usd`.
4. **Cost per use** = `price_usd ÷ (uses_per_month × 12 × expected years of use)` when both are known; else "Not applicable".
5. **Options table:** every alternative with `price_usd`, `Δ vs item`, `meets_need`. `cheapest_meeting_need` = lowest-priced alternative with `meets_need` = true (tie: name A–Z).
6. **Financing order** (first that applies): cash if post-purchase EF ≥ 3 months → 0% promo if `promo_payment` fits (deferred-interest promos only if `promo_payment` fits with ≥ 20% headroom) → standard credit if payment fits → none (financing does not fit).
7. **TCO hand-off** if the item has recurring costs (consumables, subscriptions, insurance, maintenance) totalling ≥ 10% of `price_usd` per year.
8. **Rounding:** whole dollars; months 1 decimal.

### Decision rules

Evaluate top to bottom; the first match is the verdict.

| # | Condition | Verdict |
|---|---|---|
| 1 | `purchase_type` ∈ {upgrade, want} and (post-purchase EF < 3 months or `high_interest_debt_usd` > 0) | Don't buy now — revisit when EF ≥ 3 months after purchase and high-interest debt = $0 |
| 2 | `purchase_type` ∈ {need, replacement} and post-purchase EF < 3 months and a cheaper alternative meets the need | Buy different — `cheapest_meeting_need` |
| 3 | Financing needed and step 6 returns "none" | Buy different (cheapest meeting need) if one exists; otherwise Wait and save |
| 4 | `urgent` = false and `expected_discount_pct` ≥ 20 and `discount_window_days` ≤ 90 | Wait for the discount window |
| 5 | `cheapest_meeting_need` costs ≤ 80% of `price_usd` and `purchase_type` ≠ need | Buy different — show the saving; user may still choose the item |
| 6 | `purchase_type` ∈ {upgrade, want} and `price_usd` > $2,000 | Buy — after sleeping on it (at least one night) |
| 7 | Otherwise | Buy now |

### Output template

```markdown
# Big Purchase Review — {item} — {YYYY-MM-DD}

## The decision
**{Buy now / Buy after sleeping on it / Wait / Buy different / Don't buy now}** — rule #{n}: {deciding factor}.

## Need vs want
Type: {purchase_type}; urgent: {yes/no}; what it solves; alternative; cost of waiting 30 days.

## Affordability check
| Check | Value | Pass? |
|---|---|---|
| EF after purchase (months) | | ≥ 3 |
| High-interest debt | | = $0 |
| Payment fits surplus | | {or "Not applicable — cash purchase"} |

## Options comparison
| Option | Price | Δ vs item | Meets need? | Key differences |
|---|---|---|---|---|

## Timing notes
{discount window — or "No known discount window"}

## TCO summary
{cost per use; hand-off to total_cost_of_ownership — or "Not applicable — recurring costs < 10% of price/yr"}

## Financing recommendation
{step-6 result with payment}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
