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
6. **Verdict.** Buy, lease, or buy-and-keep-longer, with the dollar gap and the horizon assumption.

## Required citations

- All numbers cite the source (dealer offer sheet, KBB lookup, insurance quote).
- Resale value cites the lookup tool + date.

## Deliverable shape

- Markdown report `./reports/purchase-advisor/buy-vs-lease-<YYYYMMDD>.md`:
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).