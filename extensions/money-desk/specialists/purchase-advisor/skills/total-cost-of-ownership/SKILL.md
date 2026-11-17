# Total Cost of Ownership

description: Compute total cost of ownership over the planned hold period for a durable purchase — upfront + financing + operating + maintenance + opportunity − resale. Lets the user compare options on lifetime cost, not sticker. Use for car / appliance / boat / second-home / tech rig decisions.

## When to use

- The user is deciding between two cars at different price points and reliability profiles.
- Comparing appliance tiers (entry vs premium).
- Second home or vacation property cash-flow analysis.
- Any "is the cheaper one actually cheaper?" question.

## Inputs needed

- Each candidate option's:
  - Purchase price (or lease cost if leasing).
  - Financing terms.
  - Annual operating cost (fuel/electricity, registration, insurance).
  - Expected annual maintenance + likelihood of major repairs.
  - Expected resale value at horizon.
- Hold-period horizon (years).
- User's opportunity cost of capital (if not supplied, the `md_facts`-based default in Determinism rules; same rate for every option).

## Workflow

1. **Per option, build the year-by-year cash flow:**
   - Year 0: down payment + tax + registration + dealer fees.
   - Year 1..N: financing payment + insurance + fuel/electricity + maintenance + expected repair fund.
   - Year N: − resale value (cash inflow on disposal).
2. **NPV the cash flows** at the user's opportunity-cost rate. Present-value all costs/resales to today.
3. **Per-mile or per-year normalization.** Total NPV / expected miles or years gives an "all-in cost per mile" or "all-in cost per year" — extremely useful for comparing options with different lifespans.
4. **Reliability adjustment.** For options with known reliability differences (Toyota vs European luxury sedan), apply a repair-cost premium beyond the warranty window taken from a cited public source (Consumer Reports / RepairPal). If no source is available, don't estimate — flag "reliability not modeled".
5. **Insurance differential.** Get actual quotes — premium cars / sports cars insure for materially more. Don't estimate.
6. **Fuel / energy.** Compute annual based on user's miles × MPG or kWh/mi × electricity cost.
7. **Resale curve.** Use brand+model depreciation curves (KBB / iSeeCars / Black Book). Some brands hold value notably better.
8. **Sensitivity sweep.** ±20% miles/yr, ±1pp opportunity cost, ±20% major-repair fund. Show range.
9. **Decision output.** Rank options by lifetime cost; surface the trade-offs (higher upfront but lower TCO, vs lower upfront with higher operating cost).

## Required citations

- Fuel economy cites the EPA / manufacturer spec + adjusted for user's typical mix.
- Insurance cites quote.
- Resale cites lookup tool + date.
- Reliability premium cites a public data source.

## Deliverable shape

- Markdown report `./money-desk/purchase-advisor/tco-<ITEM>-<YYYYMMDD>.md`:
  - **Headline** — TCO per option over N years; winner.
  - **Per-option buildup** — line by line.
  - **Per-year cash-flow table.**
  - **Per-mile / per-year normalized number.**
  - **Sensitivity table.**
  - **Decision** — recommended option with reasoning.

## Notes

- Sticker price is rarely the right comparison. Insurance + fuel + reliability often swap which option is "cheaper."
- For EVs vs ICE: factor charging-infrastructure cost, home-charger install, electricity rate seasonality.
- For appliances: factor energy efficiency, warranty differences, expected service life.
- "Analysis only. Not professional advice."

## Determinism rules

### Input keys

- `options` — list of `{ name, price_usd, upfront_fees_usd (tax + registration + dealer/doc fees), down_payment_usd, loan_apr_pct?, loan_term_months?, annual_insurance_usd, annual_energy_usd?, annual_maintenance_usd, annual_repair_fund_usd, resale_value_at_horizon_usd, efficiency? ({ mpg } or { kwh_per_mile, usd_per_kwh }), fuel_usd_per_gallon? }`
- `horizon_years` — integer
- `annual_miles` — integer (vehicles; omit for appliances etc.)
- `discount_rate_pct` — number; the user's opportunity cost of capital (nominal)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Price, fees, financing, horizon | **Ask — no default** | — |
| Insurance | **Ask — no default** — use actual quotes, never estimates | — |
| Resale at horizon | **Ask — no default** (KBB / iSeeCars / Black Book + date) | — |
| Maintenance and repair fund | **Ask — no default** (cite Consumer Reports / RepairPal); if unavailable, $0 for every option and flagged "reliability not modeled" | `[ASSUMPTION]` |
| Energy cost | Computed in step 2 when efficiency and prices are given; else **Ask** | — |
| Discount rate | `(1 + md_facts long_term_equity_real_return_percent) × (1 + md_facts long_term_inflation_percent) − 1` from `behavioral_assumptions_safe_defaults` | `[ASSUMPTION]` |
| Cost escalation | Operating costs grow at `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Annual periods, end-of-year convention. Same discount rate `d` and horizon `N` for every option.

1. **Year 0** = `down_payment_usd + upfront_fees_usd` (whole `price_usd` + fees if no loan).
2. **Energy** (vehicles): ICE `annual_miles ÷ mpg × fuel_usd_per_gallon`; EV `annual_miles × kwh_per_mile × usd_per_kwh`.
3. **Financing:** monthly payment by standard amortization on `price_usd − down_payment_usd` (`r = apr/100/12`); annual financing = Σ payments in that year; remaining balance at year N is added to year N.
4. **Year t (1..N)** = financing + (insurance + energy + maintenance + repair fund) × `(1 + infl)^(t−1)`.
5. **Year N** also subtracts `resale_value_at_horizon_usd`.
6. **NPV TCO** = Σ `CF_t ÷ (1 + d)^t`, t = 0..N. Also report undiscounted total.
7. **Normalization:** per year = NPV ÷ N; per mile = NPV ÷ (`annual_miles` × N) when miles apply.
8. **Sensitivity** (one at a time): `annual_miles` ±20%, `d` ±1 pp, repair fund ±20%; record NPV and rank under each.
9. **Rank** options by NPV TCO ascending; tie (equal to the dollar) → lower year-0 cost first.
10. **Rounding:** compute in cents; report whole dollars; per-mile to $0.01.

### Decision rules

Evaluate top to bottom; the first match is the recommendation. `gap` = NPV of rank-2 − NPV of rank-1.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Any option lacks resale value or insurance quote | No ranking — list missing inputs; show partial build-ups only |
| 2 | `gap` < 3% of rank-1 NPV | Toss-up — choose on upfront cash, reliability risk, or preference |
| 3 | Rank-1 option is not rank-1 in at least one sensitivity case | Rank-1, flagged "sensitive to {case}" |
| 4 | Otherwise | Rank-1 option |

### Output template

```markdown
# Total Cost of Ownership — {item} — {YYYY-MM-DD}

## Headline
Over **{N} years** at **{d}%**: {option A} **${npv_A}**, {option B} **${npv_B}**. Recommended: **{option}** (rule #{n}).

## Per-option build-up
| Line | {Option A} | {Option B} |
|---|---|---|
| Year-0 cash | | |
| Financing (total) | | |
| Insurance (total) | | |
| Energy (total) | | |
| Maintenance + repair fund (total) | | |
| Less resale | | |
| Undiscounted total | | |
| **NPV TCO** | | |

## Per-year cash flow
| Year | {Option A} | {Option B} |
|---|---|---|

## Normalized cost
| Option | Per year | Per mile |
|---|---|---|
{per-mile "Not applicable — no mileage" for non-vehicles}

## Sensitivity
| Case | {Option A} NPV | {Option B} NPV | Winner |
|---|---|---|---|

## Decision
{rule #, trade-off: higher upfront / lower TCO vs lower upfront / higher operating cost}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
