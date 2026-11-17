# Subscription Audit

description: Scan statements for recurring subscriptions, group by service, flag unused or duplicate, and quantify annualized cost. Outputs a "keep / cancel / negotiate" action list. Use when the user wants to clean up recurring charges or is surprised by their monthly subscription burden.

## When to use

- The user mentions "subscriptions are killing me" or similar.
- Cashflow Review showed ≥$50/mo in small recurring charges.
- Annual review / post-trial-period sweep.

## Inputs needed

- 6–12 months of statement data (Cashflow Review output works).
- Optional: the user's list of services they *know* they have (to cross-check).

## Workflow

1. **Detect recurring charges.** A charge is a subscription candidate if it repeats with the same or near-same amount (±10%) and merchant pattern on a regular cadence: ≥3 charges for weekly / monthly / quarterly; 2 charges (or 1 on a service the user listed) for annual. Cadence bands are in the Determinism rules.
2. **Normalize merchants.** "AMZN MKTPL PRIME*123" / "Amazon Prime" / "Amazon Pmt" → all map to "Amazon Prime".
3. **Group and annualize.** For each subscription: monthly cost (averaged across cadence), annual cost, billing frequency, first seen, last seen, account.
4. **Flag categories:**
   - **Unknown** — user didn't list it. Confirm before recommending action.
   - **Duplicate functionality** — Spotify + Apple Music + YouTube Premium with music; multiple cloud-storage providers; overlapping streaming.
   - **Inactive** — last login data not available, but flag low-use signals like charges that match free-trial-converted patterns.
   - **Annual surprises** — yearly charges (insurance, domains, software) that the user may have forgotten.
5. **Quantify the gap.** Total annualized subscription burden, % of net income, top 10 by annual cost.
6. **Recommend.** Keep / cancel / negotiate / confirm per the Determinism rules decision table (some services drop price if you call to cancel; flag the candidates). Note any contractual commitments (annual prepaid, multi-year).

## Required citations

- Each subscription cites: first transaction date, most recent transaction date, charge count, total $ paid in window.
- Annualized cost shows the math: monthly × 12 OR per-charge × cadence.

## Deliverable shape

- Markdown report `./money-desk/<ACCOUNT>/subscription-audit-<YYYYMMDD>.md`:
  - **Headline** — "$X/mo in subscriptions ($Y/yr); Z% of net income."
  - **Table** — service, account, $/mo, $/yr, cadence, first seen, last seen, action.
  - **Recommended cancellations** — with the cancellation channel (web account / phone-only / app-store).
  - **Recommended renegotiations** — services known to discount on call (e.g. some ISPs, gyms, satellite radio).
- Offer XLSX export with full transaction lineage per subscription.

## Notes

- App Store / Play Store subscriptions can be hidden — they show as single-line "Apple.com/Bill" or "Google *Service". Flag these for the user to check in their account settings.
- Family-plan opportunities (Apple One, YouTube Premium Family, Spotify Duo/Family) can consolidate multiple individual plans across a household.
- This agent does NOT call merchants or cancel anything. The user clicks the cancel button.

## Determinism rules

### Input keys

- `transactions` — list of `{ date (YYYY-MM-DD), account (last-4), merchant, amount_usd }` covering `statement_window_months`
- `statement_window_months` — integer; 6–12 recommended
- `known_services` — list of service names the user knows they pay for (optional)
- `net_income_monthly_usd` — number; take-home per month (for % of income)
- `services_not_used` — list of service names the user says they no longer use (optional; asked after detection)
- `commitments` — list of `{ service, prepaid_through_yyyy_mm }` for annual / multi-year contracts (optional)
- `keep_in_overlap_group` — map overlap group → service the user wants to keep (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Transactions | **Ask — no default** | — |
| Net income | **Ask — no default**; without it the "% of net income" line is "Not applicable — income not supplied" | — |
| Usage of each service | **Ask — no default**; unanswered services are not recommended for cancellation on usage grounds | — |
| Contract commitments | None (month-to-month) unless the user or the charge pattern shows a prepaid term | `[ASSUMPTION]` |

### Calculation method

1. **Normalize merchants** to one service name (strip processor prefixes, store IDs, and `*` suffixes; map aliases such as "AMZN MKTPL PRIME*" → "Amazon Prime"). App-store lines ("Apple.com/Bill", "Google *") stay as their own service and are flagged for the user to itemize.
2. **Detect recurring charges** per service: amounts within ±10% of the service's median charge, with the median gap between charges in one cadence band — weekly 6–8 days, monthly 27–33, quarterly 85–95, annual 358–372.
   - Weekly / monthly / quarterly: require ≥ 3 charges.
   - Annual: require 2 charges in the band, or 1 charge on a service in `known_services`; a single unlisted annual-sized charge is listed as "Possible annual — confirm".
3. **Monthly cost:** weekly = median × 52 ÷ 12; monthly = median; quarterly = median ÷ 3; annual = median ÷ 12. **Annual cost** = monthly cost × 12. Compute in cents; report whole dollars.
4. **Per service record:** first seen, last seen, charge count, total paid in window, cadence, account.
5. **Flags** (all that apply): Unknown (not in `known_services`); Overlap (two or more services in the same group: music streaming, video streaming, cloud storage, news/magazines, fitness apps, VPN, password managers); Trial-converted (first charge preceded within 35 days by a $0–$1.99 charge from the same merchant); Annual surprise (annual cadence).
6. **Totals:** Σ monthly cost, Σ annual cost, `pct_of_net_income = Σ monthly ÷ net_income_monthly_usd × 100` (1 decimal); top 10 by annual cost (tie: name A–Z).
7. **Action per service** = first matching Decision rule. Projected annual saving = Σ annual cost of "Cancel" services.

### Decision rules

Evaluated per service, top to bottom; the first match is that service's action.

| # | Condition | Action |
|---|---|---|
| 1 | Service has a `commitments` entry with `prepaid_through_yyyy_mm` in the future | Keep until term end — set a cancel-or-renew reminder 7 days before renewal |
| 2 | Flag = Unknown, or "Possible annual — confirm" | Confirm — no action until the user identifies it |
| 3 | Service is in `services_not_used` | Cancel |
| 4 | Flag = Overlap and the service is not the one in `keep_in_overlap_group` (if none given: not the cheapest in the group) | Cancel (overlap) |
| 5 | Service is internet, mobile phone, cable/satellite TV, satellite radio, or gym **and** annual cost ≥ $120 | Negotiate (call retention before cancelling) |
| 6 | Otherwise | Keep |

### Output template

```markdown
# Subscription Audit — {first_month} to {last_month}

## Headline
**${monthly}/mo** in subscriptions (**${annual}/yr**); **{pct}%** of net income. Cancelling the recommended items saves **${saving}/yr**.

## Subscriptions
| Service | Account | $/mo | $/yr | Cadence | First seen | Last seen | Charges | Paid in window | Flags | Action |
|---|---|---|---|---|---|---|---|---|---|---|

## Recommended cancellations
| Service | $/yr | Reason (rule #) | Cancellation channel |
|---|---|---|---|
{or "None"}

## Recommended renegotiations
| Service | $/yr | Note |
|---|---|---|
{or "None"}

## Needs your confirmation
{Unknown, Possible annual, app-store bundles — or "None"}

## Consolidation opportunities
{family / bundle plans covering overlap groups — or "None"}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
