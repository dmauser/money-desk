# Subscription Audit

description: Scan statements for recurring subscriptions, group by service, flag unused or duplicate, and quantify annualized cost. Outputs a "keep / cancel / negotiate" action list. Use when the user wants to clean up recurring charges or is surprised by their monthly subscription burden.

## When to use

- The user mentions "subscriptions are killing me" or similar.
- Cashflow Review showed >$100/mo in small recurring charges.
- Annual review / post-trial-period sweep.

## Inputs needed

- 6–12 months of statement data (Cashflow Review output works).
- Optional: the user's list of services they *know* they have (to cross-check).

## Workflow

1. **Detect recurring charges.** A charge is a subscription candidate if it appears ≥3 times with the same or near-same amount and merchant pattern, on a regular cadence (weekly, monthly, annually).
2. **Normalize merchants.** "AMZN MKTPL PRIME*123" / "Amazon Prime" / "Amazon Pmt" → all map to "Amazon Prime".
3. **Group and annualize.** For each subscription: monthly cost (averaged across cadence), annual cost, billing frequency, first seen, last seen, account.
4. **Flag categories:**
   - **Unknown** — user didn't list it. Confirm before recommending action.
   - **Duplicate functionality** — Spotify + Apple Music + YouTube Premium with music; multiple cloud-storage providers; overlapping streaming.
   - **Inactive** — last login data not available, but flag low-use signals like charges that match free-trial-converted patterns.
   - **Annual surprises** — yearly charges (insurance, domains, software) that the user may have forgotten.
5. **Quantify the gap.** Total annualized subscription burden, % of net income, top 10 by annual cost.
6. **Recommend.** Keep / cancel / negotiate (some services drop price if you call to cancel; flag the candidates). Note any contractual commitments (annual prepaid, multi-year).

## Required citations

- Each subscription cites: first transaction date, most recent transaction date, charge count, total $ paid in window.
- Annualized cost shows the math: monthly × 12 OR per-charge × cadence.

## Deliverable shape

- Markdown report `./reports/<ACCOUNT>/subscription-audit-<YYYYMMDD>.md`:
  - **Headline** — "$X/mo in subscriptions ($Y/yr); Z% of net income."
  - **Table** — service, account, $/mo, $/yr, cadence, first seen, last seen, action.
  - **Recommended cancellations** — with the cancellation channel (web account / phone-only / app-store).
  - **Recommended renegotiations** — services known to discount on call (e.g. some ISPs, gyms, satellite radio).
- Offer XLSX export with full transaction lineage per subscription.

## Notes

- App Store / Play Store subscriptions can be hidden — they show as single-line "Apple.com/Bill" or "Google *Service". Flag these for the user to check in their account settings.
- Family-plan opportunities (Apple One, YouTube Premium Family, Spotify Duo/Family) can consolidate multiple individual plans across a household.
- This agent does NOT call merchants or cancel anything. The user clicks the cancel button.
