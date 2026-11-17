# Buy vs Lease

description: Compare buying vs leasing a vehicle on total lifetime cost, monthly cash flow, and break-even ownership horizon. Outputs a verdict tied to the user's planned hold period and mileage. Use for any car-acquisition decision.

## When to use

- Considering a new or used car acquisition.
- Lease is ending and the user is deciding whether to buy out, re-lease, or buy a different vehicle.
- Comparing across dealer offers.

## Inputs needed

- Vehicle: MSRP / purchase price; identical trim if comparing.
- Loan terms: APR, term, down payment.
- Lease terms: monthly payment, term, money factor, residual %, drive-off, mileage allowance, excess-mileage rate, disposition fee.
- Expected ownership horizon (years) and annual mileage.
- Resale value estimate at end of horizon (KBB / Edmunds / Black Book).
- Tax rate (sales tax) and state (some states tax lease payments differently than purchases).

## Workflow

1. **Build the purchase scenario.**
   - Down payment + loan amount.
   - Total monthly P&I × term.
   - Sales tax (full sale price taxed up-front in most states).
   - Insurance (typically slightly less than lease — no GAP requirement).
   - Maintenance and unscheduled repairs (year 1–3 minimal, escalates after warranty).
   - At horizon: estimated resale value.
   - **Lifetime cost = (price + interest + tax + insurance + maintenance) − resale value.**
2. **Build the lease scenario.**
   - Drive-off (down + first month + fees).
   - Monthly payment × term.
   - Sales tax (often on monthly only).
   - Insurance (often slightly higher; GAP usually included).
   - Excess-mileage penalty if over allowance × $/mi.
   - Disposition fee at lease end (unless waived on next lease).
   - **No resale credit** (you return the car).
   - **Lifetime cost = drive-off + (monthly × term) + tax + insurance + over-mileage + disposition.**
3. **Multi-cycle comparison.** A buy held 8–10 years vs 2 back-to-back leases (each ~3y) over the same horizon — the buy almost always wins on math if the user actually keeps the car.
4. **Break-even analysis.** Find the ownership-horizon point where buy becomes cheaper than perpetual leasing.
5. **Special cases:**
   - Business / 1099 user — Section 179 depreciation, lease deductibility different. Flag for Tax Planner.
   - High-mileage user — lease usually punishing (excess-mile rates 15–25¢/mi).
   - Frequent-replacement user (loves new cars every 2–3 years) — lease cash flow may be lower than buy + sell hassle.
   - EV — incentives and residual-value uncertainty change the math; surface this.
6. **Verdict.** Buy, lease, buy-and-keep-longer, or toss-up per the Determinism rules decision table, with the dollar gap and the horizon assumption.

## Required citations

- All numbers cite the source (dealer offer sheet, KBB lookup, insurance quote).
- Resale value cites the lookup tool + date.

## Deliverable shape

- Markdown report `./money-desk/purchase-advisor/buy-vs-lease-<YYYYMMDD>.md`:
  - **Headline verdict** — buy vs lease + $ gap over horizon.
  - **Purchase scenario buildup.**
  - **Lease scenario buildup.**
  - **Break-even analysis.**
  - **Sensitivities** — what if you keep 2 more years / drive 5k more miles?
  - **Recommended action** with negotiation pointers (lease money factor benchmarks, buy-out timing, etc.).

## Notes

- Leasing is often marketed as "cheaper" because of the lower monthly. Cash-flow ≠ total cost.
- Lease residual is set by the captive finance company — sometimes the lease-end buyout is below market and worth taking; sometimes it's above market and you walk away.
- Negotiation: cap cost ≈ purchase price; money factor ≈ (APR/2400). Treat lease negotiation like buying first, then converting to lease.
- "Analysis only. Not professional financial advice."

## Determinism rules

### Input keys

Names match the `md_pa_skill_buy_vs_lease` intake schema; extra keys follow the `_usd` / `_pct` convention.

- `vehicle` — string
- `msrp` — number, USD; MSRP or negotiated cap cost (same price used for both scenarios)
- `lease_residual_pct` — number (e.g. 58 = 58% of MSRP)
- `lease_money_factor` — number (APR ≈ MF × 2400)
- `lease_term_months` — integer
- `lease_due_at_signing` — number, USD
- `purchase_apr` — number, %
- `purchase_loan_term_months` — integer
- `annual_miles` — integer
- `ownership_horizon_years` — integer
- `trade_in_value` — number, USD (down payment / trade-in on the purchase)
- `lease_monthly_payment_usd` — number (optional; the dealer worksheet payment, pre-tax)
- `lease_miles_allowance_annual` — integer
- `excess_mileage_rate_usd` — number, $/mile
- `disposition_fee_usd`, `acquisition_fee_usd` — numbers
- `sales_tax_pct` — number; `lease_tax_on_payment` — bool (true where the state taxes the monthly lease payment)
- `resale_value_at_horizon_usd` — number; `resale_value_at_horizon_plus_2_usd` — number (optional)
- `insurance_annual_buy_usd`, `insurance_annual_lease_usd` — numbers
- `maintenance_annual_buy_usd` — list by year (optional); `maintenance_annual_lease_usd` — number (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Schema-required fields | **Ask — no default** | — |
| Resale value at horizon | **Ask — no default** (KBB / Edmunds / Black Book lookup + date) | — |
| Sales-tax rate and lease tax method | **Ask — no default** | — |
| Mileage allowance, excess rate, fees | **Ask — no default** (from the lease worksheet) | — |
| Insurance | **Ask — no default**; if only one quote is given, the same figure is used for both and flagged | `[ASSUMPTION]` |
| Maintenance | Excluded from both scenarios and flagged "not modeled" | `[ASSUMPTION]` |
| Lease terms over repeat cycles | Today's lease terms repeat unchanged | `[ASSUMPTION]` |
| Trade-in sales-tax credit | Not modeled (varies by state) | `[ASSUMPTION]` |

### Calculation method

`H = ownership_horizon_years × 12` months. Compute in cents; report whole dollars.

1. **Purchase:** `L = msrp − trade_in_value`; `r = purchase_apr/100/12`; `P = L × r ÷ (1 − (1+r)^−n)` with `n = purchase_loan_term_months` (`P = L ÷ n` if APR = 0). Upfront cash = `trade_in_value + msrp × sales_tax_pct/100`.
2. **Buy cost over H** = upfront cash + `P × min(H, n)` + loan balance remaining at month H (if `n` > H) + insurance_buy × years + Σ maintenance_buy (years 1..H/12) − `resale_value_at_horizon_usd`.
3. **Lease payment:** use `lease_monthly_payment_usd` if given; else `cap = msrp + acquisition_fee_usd − lease_due_at_signing`, `res = msrp × lease_residual_pct/100`, `payment = (cap − res) ÷ lease_term_months + (cap + res) × lease_money_factor`. Add tax `× (1 + sales_tax_pct/100)` when `lease_tax_on_payment`.
4. **Lease cycle cost** = `lease_due_at_signing + payment × lease_term_months + excess_miles_cost + disposition_fee_usd`, where `excess_miles_cost = max(0, annual_miles − lease_miles_allowance_annual) × lease_term_months/12 × excess_mileage_rate_usd`.
5. **Lease cost over H** = cycle cost × `H ÷ lease_term_months` (a partial last cycle is prorated by months; early-termination fees are not modeled) + insurance_lease × years + maintenance_lease × years.
6. **Gap** = `lease_cost − buy_cost` (positive = buying is cheaper). **Monthly cash flow** = loan payment vs lease payment, shown side by side.
7. **Keep-longer check** (only if `resale_value_at_horizon_plus_2_usd` given): rerun step 2 at H + 24; compare buy cost per month at H and at H + 24.
8. **Sensitivities** (one at a time, each a full rerun): horizon + 2 years; `annual_miles` + 5,000; resale −20%.
9. **Break-even:** the smallest whole-year horizon at which buy cost ≤ lease cost — only computable when resale values are given for those years; else "Not applicable — resale curve not supplied".

### Decision rules

Evaluate top to bottom; the first match is the verdict. `threshold = max($500, 2% of msrp)`.

| # | Condition | Verdict |
|---|---|---|
| 1 | Resale value at horizon not supplied | No verdict — ask for a resale lookup; show monthly cash flow only |
| 2 | `|gap|` < threshold | Toss-up — decide on cash flow, mileage risk, and preference |
| 3 | gap > 0 and keep-longer check shows a lower buy cost per month at H + 24 | Buy and keep longer |
| 4 | gap > 0 | Buy |
| 5 | Otherwise (gap < 0) | Lease |

### Output template

```markdown
# Buy vs Lease — {vehicle} — {YYYY-MM-DD}

## Headline verdict
**{Buy / Buy and keep longer / Lease / Toss-up}** — {buy or lease} is **${|gap|}** cheaper over **{ownership_horizon_years} years** (rule #{n}).

## Monthly cash flow
| Scenario | Monthly payment | Due at start |
|---|---|---|
| Buy | | |
| Lease | | |

## Purchase scenario
| Line | Amount |
|---|---|
| Upfront cash (down/trade-in + sales tax) | |
| Loan payments within horizon | |
| Loan balance at horizon | |
| Insurance | |
| Maintenance | |
| Less resale | |
| **Total** | |

## Lease scenario
| Line | Amount |
|---|---|
| Lease cycles in horizon | |
| Due at signing (all cycles) | |
| Payments | |
| Excess mileage | |
| Disposition fees | |
| Insurance | |
| Maintenance | |
| **Total** | |

## Break-even
{year — or "Not applicable — resale curve not supplied"}

## Sensitivities
| Case | Buy total | Lease total | Gap | Verdict |
|---|---|---|---|---|
| Base | | | | |
| Keep 2 more years | | | | |
| +5,000 miles/yr | | | | |
| Resale −20% | | | | |

## Recommended action
{negotiation pointers: cap cost ≈ purchase price, MF × 2400 vs purchase APR, buy-out timing}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
