## Sinking Funds Setup

description: Convert known irregular expenses (annual insurance premium, car maintenance, holiday gifts, property tax, annual subscriptions) into smooth monthly sinking-fund contributions so cash flow doesn't lurch. Recommend account structure (HYSA buckets or sub-accounts) and per-fund monthly amount.

## When to use

- User reports their budget "works most months but blows up in [month]".
- Annual expenses (renewals, property tax, holidays) cause regular cash-flow crunches.
- After Cashflow Review revealed lumpy outflows.
- Pairs naturally with Monthly Plan (Budget Coach).

## Inputs needed

- List of known irregular expenses, with annual amount and rough timing:
  - **Insurance** — auto (6 or 12 mo), home/renters, umbrella, life premium (if annual pay).
  - **Property** — property tax (if not escrowed), HOA annual assessment, home maintenance (1% of home value rule of thumb).
  - **Vehicle** — registration/tags, maintenance, tires (every 3–5 yr).
  - **Holiday & gifts** — Christmas, birthdays, anniversaries.
  - **Travel** — annual family trip, weddings to attend.
  - **Healthcare** — deductible reserve, annual dental, vision.
  - **Subscriptions** — annual SaaS, domain, gym, Amazon Prime, AAA, Costco.
  - **Pets** — annual vet, grooming.
  - **Other** — back-to-school, kid camps, charitable annual gifts.

## Workflow

1. **List every irregular expense** with annual $ and timing.
2. **Sum to annual total**; divide by 12 → required monthly sinking-fund contribution.
3. **Group by category** — typically 4–8 buckets is the sweet spot (not 20). Examples: Insurance & Property, Vehicle, Holidays & Gifts, Travel, Healthcare, Home Maintenance, Annual Subs.
4. **Account structure recommendation:**
   - **Simplest (most users):** one HYSA, tracked in a spreadsheet or budgeting app with named categories.
   - **Slightly more:** HYSA with named sub-accounts (Ally, Capital One 360, SoFi all support this) — one per major bucket.
   - **Maximalist (avoid for most):** separate banks per goal — usually overkill.
5. **Per-bucket monthly contribution table** + recommended balance to keep on hand (typically equal to annual sum, but staged: start with what's due soonest first).
6. **Integration with Monthly Plan.** Hand off the per-bucket monthly $ to Budget Coach (`md_bc_role`) to slot into the spending plan.

## Required citations

- Each annual expense cites the source (last year's statement, current premium notice, prior tax bill).
- Home-maintenance rule of thumb (1% of home value) cites the source ("widely used rule of thumb" + disclaim that actual varies by home age / climate).
- HYSA account suggestions cite institution + current rate + date.

## Deliverable shape

Markdown report `./reports/net-worth-goals/sinking-funds-<YYYYMMDD>.md`:
- **Headline** — e.g., "Bumpy cash flow smoothed: $980/mo across 6 sinking-fund buckets covers $11,760 of annual irregulars."
- **Funds table** — bucket, annual total, monthly contribution, target balance to maintain.
- **Account structure** — recommendation with rationale. **For every HYSA / MMA / sub-account suggested, cite the DepositAccounts.com URL (category or product page) with the as-of timestamp, tagged `[UNSOURCED — verify on issuer page]`, and link the institution's own product page alongside it.** Include a one-line "Primary rate source: DepositAccounts.com" footnote (note any one-off override the user requested).
- **Calendar** — which fund spends in which month (so the user can see why the balances dip in some months).
- **Action checklist** — open buckets/sub-accounts, set auto-transfers, integrate with monthly plan.

## Notes

- Not every irregular needs a sinking fund. Tiny ones (e.g., $50/yr Costco) can stay in the main checking buffer. Sinking funds matter for $300+ annual items.
- For users who escrow property tax and homeowners insurance, those are already smoothed in the mortgage payment — don't double-up.
- Home maintenance is the silent killer for new homeowners. The 1%-of-value rule is just an average; older homes / harsh climates / luxury finishes can run 2–3%.
- An "Annual Subscriptions" bucket pairs naturally with Subscription Audit (`md_bc_skill_subscription_audit`) — run that first to right-size what you're actually funding.
