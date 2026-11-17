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
  - **Property** — property tax (if not escrowed), HOA annual assessment, home maintenance (user-confirmed % of home value; 1% is a common rule of thumb).
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
5. **Per-bucket monthly contribution table** + target balance (the largest single bill in the bucket), staged so the soonest-due bills are funded first (see Determinism rules).
6. **Integration with Monthly Plan.** Hand off the per-bucket monthly $ to Budget Coach (`md_bc_role`) to slot into the spending plan.

## Required citations

- Each annual expense cites the source (last year's statement, current premium notice, prior tax bill).
- Home-maintenance rule of thumb (1% of home value) cites the source ("widely used rule of thumb" + disclaim that actual varies by home age / climate).
- HYSA account suggestions cite institution + current rate + date.

## Deliverable shape

Markdown report `./money-desk/net-worth-goals/sinking-funds-<YYYYMMDD>.md`:
- **Headline** — e.g., "Bumpy cash flow smoothed: $980/mo across 6 sinking-fund buckets covers $11,760 of annual irregulars."
- **Funds table** — bucket, annual total, monthly contribution, target balance to maintain.
- **Account structure** — recommendation with rationale. **For every HYSA / MMA / sub-account suggested, cite the DepositAccounts.com URL (category or product page) with the as-of timestamp, tagged `[UNSOURCED — verify on issuer page]`, and link the institution's own product page alongside it.** For each option include: expense ratio (`n/a` for deposits), federal-tax treatment (ordinary income via 1099-INT), and state-tax treatment (fully taxable for HYSA / MMA / CD; state-tax-free for T-bill alternatives if the user prefers them for sinking-fund cash with > 4-week horizons). Include a one-line "Primary rate source: DepositAccounts.com" footnote (note any one-off override the user requested).
- **Calendar** — which fund spends in which month (so the user can see why the balances dip in some months).
- **Action checklist** — open buckets/sub-accounts, set auto-transfers, integrate with monthly plan.

## Notes

- Not every irregular needs a sinking fund. Tiny ones (e.g., $50/yr Costco) can stay in the main checking buffer. Sinking funds matter for $300+ annual items.
- For users who escrow property tax and homeowners insurance, those are already smoothed in the mortgage payment — don't double-up.
- Home maintenance is the silent killer for new homeowners. The 1%-of-value rule is just an average; older homes / harsh climates / luxury finishes can run 2–3%.
- An "Annual Subscriptions" bucket pairs naturally with Subscription Audit (`md_bc_skill_subscription_audit`) — run that first to right-size what you're actually funding.

## Determinism rules

### Input keys

- `irregular_expenses` — list of `{ name, bucket, annual_usd, due_months (list of 1–12), escrowed (bool) }`; `bucket` from: Insurance & Property, Vehicle, Holidays & Gifts, Travel, Healthcare, Home Maintenance, Annual Subscriptions, Pets, Other
- `current_sinking_balance_usd` — map bucket → existing balance (optional, default 0)
- `start_yyyy_mm` — first contribution month (default: next calendar month)
- `home_value_usd` — number (optional; Home Maintenance bucket)
- `home_maintenance_pct` — number (optional; e.g. 1.0 = 1% of home value per year)
- `monthly_capacity_usd` — number (optional; what the plan can absorb per month)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Each expense's annual amount and timing | **Ask — no default** | — |
| Home maintenance rate | **Ask — no default**; the user may adopt the 1%-of-value rule of thumb (Notes), recorded as `[USER-PROVIDED]` | — |
| Existing balances | $0 | `[ASSUMPTION]` |
| HYSA rates | Look up per the deposit-rate source policy | `[UNSOURCED — verify on issuer page]` |

### Calculation method

1. **Screen** each expense: `escrowed` = true → excluded ("already in mortgage payment"); `annual_usd` < $300 → "Checking buffer" (not funded); else funded.
2. **Home maintenance** (if `home_value_usd` and `home_maintenance_pct` given): add `home_value_usd × pct/100` as one Home Maintenance expense, due month 12 by convention.
3. **Bucket count:** if more than 8 funded buckets, merge the smallest by annual total into "Other irregulars" until 8 remain.
4. **Steady-state monthly** per bucket = `ceil(Σ annual_usd ÷ 12)` (whole dollars).
5. **First-year catch-up** per expense: `m` = months from `start_yyyy_mm` to its next due month (1–12, counting the due month); `amount_due` = `annual_usd ÷ count(due_months)`; required monthly = `max(steady_monthly_share, ceil((amount_due − allocated_existing_balance) ÷ m))`. Existing bucket balances are allocated to that bucket's expenses by soonest due date first.
6. **Target balance** per bucket = the largest single `amount_due` among its expenses (the peak just before the biggest bill).
7. **Calendar:** a 12-month grid starting at `start_yyyy_mm` showing each bucket's contributions, withdrawals, and month-end balance.
8. **Totals:** Σ steady-state monthly, Σ first-year monthly, Σ annual funded.
9. **Account structure:** see Decision table B.
10. **Rounding:** whole dollars, rounded up for contributions.

### Decision rules

**A. Funding plan** — evaluate top to bottom; first match wins.

| # | Condition | Plan |
|---|---|---|
| A1 | No funded expenses after screening | No sinking funds needed — keep a checking buffer |
| A2 | `monthly_capacity_usd` given and Σ steady-state monthly > capacity | Over capacity — fund buckets in order of next due date until capacity is used; route the rest to Budget Coach |
| A3 | `monthly_capacity_usd` given and Σ first-year monthly > capacity | Stage it — steady-state amounts now; buckets due within 3 months get catch-up first; flag shortfalls by month |
| A4 | Otherwise | Fund all buckets at their first-year amounts, dropping to steady-state after each bucket's first payout |

**B. Account structure** — evaluate top to bottom; first match wins.

| # | Condition | Structure |
|---|---|---|
| B1 | User asks for separate banks per goal | Separate banks (note: usually overkill) |
| B2 | Funded buckets ≤ 3 | One HYSA tracked by category in a spreadsheet or budgeting app |
| B3 | Otherwise (4–8 buckets) | One HYSA with a named sub-account per bucket |

### Output template

```markdown
# Sinking Funds Setup — {start_yyyy_mm}

## Headline
**${steady_monthly}/mo** across **{B} buckets** covers **${annual_total}** of annual irregulars (first-year: ${first_year_monthly}/mo). Plan: {A#}.

## Funds
| Bucket | Annual total | Steady $/mo | First-year $/mo | Target balance | Next due |
|---|---|---|---|---|---|

## Not funded
| Expense | Annual | Reason |
|---|---|---|
{escrowed / under $300 — or "None"}

## Account structure
{B# recommendation}
| Option | APY | Expense ratio | Federal tax | State tax | Source (as of) |
|---|---|---|---|---|---|
Primary rate source: DepositAccounts.com{; override note}

## Calendar
| Month | {Bucket 1} | {Bucket 2} | … | Total in | Total out |
|---|---|---|---|---|---|

## Action checklist
- [ ] {open buckets/sub-accounts, set auto-transfers, hand per-bucket $ to Budget Coach}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
