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
5. **Welcome offers** — flag if the user has open slots and the math (spend req vs sign-up bonus) is favorable. Sensitive to issuer rules (Chase 5/24, Amex once-per-lifetime, etc.).
6. **Balance transfer evaluation** if carrying balance: model fee + 0% promo period + payoff schedule (route to Payoff Plan with promo deadline).
7. **Authorized users and credit history.** Spouse / family piggybacking can boost credit history.
8. **Utilization tip.** Aim total + per-card utilization <30% (under 10% is ideal) at statement-cut date — sometimes by paying *before* statement closes, not by the due date.

## Required citations

- Reward rates cite the card's terms doc.
- Spend by category cites the Cashflow Review output.
- Issuer rules (5/24, etc.) cite a current source.

## Deliverable shape

- Markdown report `./reports/debt-strategist/credit-card-strategy-<YYYYMMDD>.md`:
  - **Headline** — projected annual net rewards under current vs optimized usage.
  - **Per-card P&L** — fee, credits used, rewards earned, net.
  - **Category map** — spend category → preferred card.
  - **Keep / downgrade / close** list with credit-score impact note.
  - **Optional new-card** if there's a clear gap and welcome-offer opportunity.

## Notes

- Don't chase points if it changes the user's spending behavior. Manufactured spend / category-stretch can erase rewards math.
- Set every card to auto-pay statement balance to eliminate late fees and protect score.
- "Not professional financial advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).