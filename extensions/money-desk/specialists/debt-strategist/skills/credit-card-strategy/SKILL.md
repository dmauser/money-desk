# Credit Card Strategy

description: Optimize credit card mix for the user's spend profile — categorized rewards, annual fees vs effective rewards, balance transfers, and 0% APR offers. Outputs a "use this card for this category" map and any pruning recommendations. Use for cardholders or those starting to build.

## When to use

- User has 2+ cards and wants to know which to use where.
- Considering a new card and wants to compare to existing wallet.
- Carrying revolving balances — interest-cost analysis.
- Cleaning up card collection (close vs keep open).

## Inputs needed

- Per-card: issuer, name, annual fee, APR, current balance, statement date, due date, rewards structure (categories, caps, rotating), authorized users.
- Annual spend by category (from Cashflow Review).
- Goal: maximize rewards / minimize fees / minimize interest / build credit history.

## Workflow

1. **Pay-balance analysis first.** If any card carries a balance, rewards math is moot — net APR cost beats rewards every time. Route to Payoff Plan if applicable.
2. **Compute effective rewards.** For each card: annual rewards earned given the user's spend, minus annual fee, minus any "use it or lose it" credits (Amex / Chase credits) the user actually uses.
3. **Category map.** For each spend category, which card is best:
   - Groceries / dining / gas / travel / streaming / general spend.
   - Watch for category caps (5% on $1,500/quarter etc.).
4. **Prune candidates.** Cards with negative effective rewards (annual fee > rewards) — recommend keep / downgrade / close.
   - **Closing cards** can hurt credit score by reducing total available credit and shortening avg age. Prefer downgrading to a no-fee version of the same card-family when possible.
5. **Welcome offers** — flag only when Determinism rules table C is met (spend requirement fits existing spend; first-year value beats the best existing card by ≥ $200). Sensitive to issuer rules (Chase 5/24, Amex once-per-lifetime, etc.).
6. **Balance transfer evaluation** if carrying balance: model fee + 0% promo period + payoff schedule (route to Payoff Plan with promo deadline).
7. **Authorized users and credit history.** Spouse / family piggybacking can boost credit history.
8. **Utilization tip.** Aim total + per-card utilization <30% (under 10% is ideal) at statement-cut date — sometimes by paying *before* statement closes, not by the due date.

## Required citations

- Reward rates cite the card's terms doc.
- Spend by category cites the Cashflow Review output.
- Issuer rules (5/24, etc.) cite a current source.

## Deliverable shape

- Markdown report `./money-desk/debt-strategist/credit-card-strategy-<YYYYMMDD>.md`:
  - **Headline** — projected annual net rewards under current vs optimized usage.
  - **Per-card P&L** — fee, credits used, rewards earned, net.
  - **Category map** — spend category → preferred card.
  - **Keep / downgrade / close** list with credit-score impact note.
  - **Optional new-card** if there's a clear gap and welcome-offer opportunity.

## Notes

- Don't chase points if it changes the user's spending behavior. Manufactured spend / category-stretch can erase rewards math.
- Set every card to auto-pay statement balance to eliminate late fees and protect score.
- "Not professional financial advice."

## Determinism rules

### Input keys

- `cards` — list of `{ name, issuer, annual_fee_usd, apr_pct, balance_usd, limit_usd, pays_in_full (bool), opened_date, statement_cut_day, due_day, earn_rates (map category → rate_pct or points per $), base_rate, caps (list of { category, cap_usd, period: month | quarter | year }), point_value_cents, credits_used_usd_per_year, no_fee_downgrade_available (bool) }`
- `annual_spend_usd` — map category → $/year (from Cashflow Review); categories: groceries, dining, gas, travel, streaming, other
- `goal` — `maximize_rewards` | `minimize_fees` | `minimize_interest` | `build_history`
- `balance_transfer_offer` — `{ fee_pct, promo_apr_pct, promo_months, new_card_name }` (optional)
- `monthly_payment_toward_cards_usd` — number (only if any balance is carried)
- `planned_credit_application_within_6_months` — bool (mortgage / auto)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Card terms, balances, limits | **Ask — no default** (cite each card's terms doc) | — |
| Annual spend by category | **Ask — no default** (run Cashflow Review) | — |
| Point value | **Ask — no default**; else the card's stated cash-redemption value from its terms | `[USER-PROVIDED]` / cite terms |
| Credits actually used | $0 | `[ASSUMPTION]` |
| Issuer application rules (e.g. 5/24, once-per-lifetime bonuses) | Not in `md_facts` — look up via `md_sources`, else tag | `[UNSOURCED]` |

### Calculation method

1. **Balance check:** carried balance = any card with `balance_usd` > 0 and `pays_in_full` = false. Annual interest cost = Σ `balance × apr_pct/100`.
2. **Category assignment** (current usage = the card the user names per category; optimized usage = this step): for each category, rank cards by effective rate (`rate_pct`, or points × `point_value_cents`); assign spend to the top card up to its cap (annualized: monthly cap × 12, quarterly × 4), overflow to the next card. Tie: no-fee card first, then name A–Z.
3. **Per-card rewards** = Σ assigned spend × effective rate + overflow at `base_rate`.
4. **Net value** per card = rewards + `credits_used_usd_per_year` − `annual_fee_usd`. Do this for current and optimized usage.
5. **Utilization:** per card and aggregate `balance ÷ limit × 100` (1 decimal); target < 30%, ideal < 10% at statement cut.
6. **Balance transfer** (if offer and a carried balance): `fee = balance × fee_pct/100`; run the Payoff Plan monthly loop (APR/12 convention) on the existing card and on the transfer (promo APR until `promo_months`, then the new card's APR) with `monthly_payment_toward_cards_usd`; `bt_saving = interest_current − (interest_transfer + fee)`; `cleared_in_promo` = transfer balance reaches $0 within `promo_months`.
7. **Close impact:** for a close candidate, aggregate utilization after closing = `Σ balance ÷ (Σ limit − that card's limit)`; flag if it is the oldest open card.
8. **Rounding:** compute in cents; report whole dollars.

### Decision rules

**A. Overall** — evaluate top to bottom; first match wins.

| # | Condition | Recommendation |
|---|---|---|
| A1 | Carried balance and `bt_saving` ≥ $100 and `cleared_in_promo` | Balance transfer, then Payoff Plan with the promo deadline; rewards optimization deferred |
| A2 | Carried balance | Payoff Plan first (Debt Strategist); rewards optimization deferred |
| A3 | Aggregate utilization ≥ 30% | Pay before statement cut to bring utilization < 30%; then apply the category map |
| A4 | Otherwise | Apply the optimized category map and per-card actions |

**B. Per card** — evaluate top to bottom; first match wins.

| # | Condition | Action |
|---|---|---|
| B1 | Net value (optimized) ≥ 0 | Keep |
| B2 | Net value < 0 and `no_fee_downgrade_available` | Downgrade to the no-fee version |
| B3 | Net value < 0 and (oldest open card, or closing pushes aggregate utilization ≥ 30%, or `planned_credit_application_within_6_months`) | Keep for now — ask for a retention offer; revisit after the application / once utilization allows |
| B4 | Otherwise | Close |

**C. New card** — recommend only if A4 applied, `planned_credit_application_within_6_months` = false, the welcome bonus's minimum spend fits the user's existing spend in the window, and first-year (bonus + rewards − fee) beats the best existing card on that spend by ≥ $200; otherwise "No new card".

### Output template

```markdown
# Credit Card Strategy — {YYYY-MM-DD}

## Headline
Net annual rewards: **${current}** current → **${optimized}** optimized. Overall: **{recommendation}** (rule {A#}).

## Balances and utilization
| Card | Balance | Limit | Utilization | APR | Annual interest |
|---|---|---|---|---|---|
| Aggregate | | | | | |

## Balance transfer
{fee, interest current vs transfer, bt_saving, cleared in promo? — or "Not applicable — no carried balance / no offer"}

## Per-card P&L
| Card | Annual fee | Credits used | Rewards (optimized) | Net | Action (rule) |
|---|---|---|---|---|---|

## Category map
| Category | Annual spend | Use this card | Effective rate | Cap note |
|---|---|---|---|---|

## Keep / downgrade / close
| Card | Action | Credit-score note |
|---|---|---|

## New card
{recommendation — or "No new card"}

## Setup
- Auto-pay statement balance on every card; pay before statement cut where utilization matters.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).