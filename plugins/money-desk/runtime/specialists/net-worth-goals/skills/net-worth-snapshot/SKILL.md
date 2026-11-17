## Net Worth Snapshot

description: Build a point-in-time net-worth statement (assets minus liabilities) grouped sensibly, with sub-totals by category. Plot a trend if prior snapshots exist. Use when the user wants a single-number "where am I" view or quarterly/annual net-worth tracking.

## When to use

- First-time "what's my net worth" request.
- Quarterly or annual review.
- Before a major life decision (job change, home purchase, retirement, divorce).
- Year-end financial check-in.

## Inputs needed

- All asset balances:
  - **Cash** — checking, savings, HYSA, money market, brief T-bills.
  - **Taxable investments** — brokerage accounts (individual, joint, trust).
  - **Retirement** — 401(k)/403(b)/457, traditional IRA, Roth IRA, HSA-as-investment, pension cash value, annuities.
  - **Real estate** — primary residence market value, rental properties, land.
  - **Other** — vehicles (KBB / Edmunds estimate), business interests, collectibles only if material (>1% of NW).
- All liability balances:
  - **Secured** — mortgage(s), HELOC, auto loans.
  - **Unsecured** — credit cards (current statement balance), personal loans, student loans, medical debt.
  - **Other** — taxes owed, money owed to family.
- Snapshot date (default: today).
- Any prior snapshots (date + total net worth at minimum).

## Workflow

1. **Collect balances** by account; mask account numbers to last-4 in any output.
2. **Group into categories.** Standard 5-bucket model:
   - Cash & equivalents
   - Taxable investments
   - Retirement & tax-advantaged
   - Real estate (at market value)
   - Other tangible assets
   - (Liabilities mirrored: mortgage / consumer / other)
3. **Compute sub-totals and net worth.** Net worth = Σ assets − Σ liabilities.
4. **Useful ratios** —
   - **Liquid net worth** — cash + taxable investments − all liabilities. (What you could mobilize quickly.)
   - **Investable net worth** — cash + taxable + retirement. (What's working in markets.)
   - **Home-equity %** — primary-home equity / total net worth. (Concentration check; > 50% is concentrated.)
   - **Liability-to-asset ratio** — liabilities ÷ assets. (Health metric; < 0.5 is healthy.)
5. **Trend (if prior data).** Plot net worth over time; compute YoY change, savings rate ((change in NW − investment gains) / income).
6. **Spot concentration risk.** Flag any single asset > 25% of NW (often: home, single-stock RSU position, business interest).

## Required citations

- Each balance cites: account institution, account type, last-4, statement date.
- Real-estate value cites the source (Zillow URL with date, recent appraisal, comparable sale).
- Prior snapshots cite the date.

## Deliverable shape

Markdown report `./money-desk/net-worth-goals/net-worth-<YYYYMMDD>.md`:
- **Headline** — e.g., "Net worth as of YYYY-MM-DD: $XYZ. ↑ 8% YoY."
- **Net Worth Table** — category, sub-total, % of total.
- **Liabilities Table** — category, sub-total, interest rate where known.
- **Ratios** — liquid NW, investable NW, home-equity %, liability-to-asset.
- **Trend** (if data) — table or simple ASCII chart of NW over time.
- **Concentration flags** — single assets > 25% of NW.
- **Next steps** — typically: run Emergency Fund Assessment + Goal-Based Savings Plan; or hand off to Investing Advisor if investable NW is large and unallocated.
- Offer XLSX export with full line-item detail.

## Notes

- For a primary residence, two valuations are reasonable: market value − selling costs (user-supplied %; see Determinism rules) for a conservative figure, or raw market value for the headline. Show both when the user supplies a selling-cost %.
- Don't include term life insurance face value (no cash value). Include cash value of permanent life policies (whole / universal).
- HSA balances are counted in full under Retirement & tax-advantaged (one consistent rule; see Determinism rules).
- Vehicle values depreciate fast — re-pull KBB each snapshot rather than carrying old numbers.

## Determinism rules

### Input keys

Names match the `md_nw_skill_net_worth_snapshot` intake schema; all amounts USD, 0 if not applicable.

- Assets: `cash_checking`, `hysa_money_market`, `trad_retirement`, `roth_retirement`, `taxable_brokerage`, `hsa`, `primary_home_value`, `rental_property_value`, `vehicle_value`, `other_assets`
- Liabilities: `mortgage_balance`, `rental_mortgage_balance`, `auto_loans`, `student_loans`, `credit_card_balance`, `other_debt`
- `snapshot_date` — YYYY-MM-DD (default: today)
- `prior_snapshots` — list of `{ date, net_worth_usd }` (optional)
- `annual_take_home_usd` — number (optional; for the savings-rate trend line)
- `investment_gains_usd` — number; market gains since the most recent prior snapshot (optional)
- `largest_single_holdings` — list of `{ name, value_usd }` (optional; e.g. single-stock RSU position, business interest)
- `monthly_essentials_usd` — number (optional; for the cash-reserve check)
- `home_selling_cost_pct` — number (optional; for the conservative home value)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Any balance | $0 (user confirms the category does not apply) | `[USER-PROVIDED]` |
| Home market value | **Ask — no default** (cite Zillow/Redfin URL + date, appraisal, or comp) | — |
| Home selling costs | **Ask — no default**; if not supplied the conservative home value is "Not applicable" | — |
| HSA treatment | Whole HSA balance counted in Retirement & tax-advantaged (one consistent rule) | `[ASSUMPTION]` |
| Monthly essentials | Cash-reserve check marked "Not applicable — essentials not supplied" | — |
| Investment gains for savings-rate trend | Savings-rate line marked "Not applicable" | — |

### Calculation method

1. **Buckets:** Cash & equivalents = `cash_checking + hysa_money_market`; Taxable investments = `taxable_brokerage`; Retirement & tax-advantaged = `trad_retirement + roth_retirement + hsa`; Real estate = `primary_home_value + rental_property_value`; Other tangible = `vehicle_value + other_assets`. Collectibles inside `other_assets` are listed only if > 1% of net worth.
2. **Liabilities:** Mortgage = `mortgage_balance + rental_mortgage_balance`; Consumer = `auto_loans + student_loans + credit_card_balance`; Other = `other_debt`.
3. `total_assets = Σ assets`; `total_liabilities = Σ liabilities`; `net_worth = total_assets − total_liabilities`.
4. **Ratios** (1 decimal): liquid NW = Cash + Taxable − total_liabilities; investable NW = Cash + Taxable + Retirement; home-equity % = `(primary_home_value − mortgage_balance) ÷ net_worth × 100` (only if net_worth > 0); liability-to-asset = `total_liabilities ÷ total_assets` (2 decimals).
5. **Thresholds:** home-equity % > 50 → "Concentrated"; liability-to-asset < 0.50 → "Healthy", ≥ 0.50 → "Elevated"; any single item (each asset line, each of `largest_single_holdings`) > 25% of net worth → concentration flag.
6. **Conservative home value** (if `home_selling_cost_pct` given) = `primary_home_value × (1 − pct/100)`; shown alongside the headline, never replacing it.
7. **Trend** (if `prior_snapshots`): sort by date; change vs each prior; YoY % = vs the snapshot closest to 365 days earlier (tie: the earlier one); savings-rate estimate = `(Δ NW − investment_gains_usd) ÷ annual_take_home_usd × 100` when both are given.
8. **Cash-reserve check** (if `monthly_essentials_usd`): `cash_months = Cash ÷ monthly_essentials_usd`.
9. **Rounding:** whole dollars; percentages 1 decimal.

### Decision rules

Evaluate top to bottom; the first match is the primary next step.

| # | Condition | Next step |
|---|---|---|
| 1 | `credit_card_balance` > 0 | Debt Strategist — carried card balance first |
| 2 | `net_worth` < 0 | Debt Strategist + Budget Coach |
| 3 | `monthly_essentials_usd` not supplied, or `cash_months` < 3 | Emergency Fund Assessment |
| 4 | Any concentration flag (single item > 25% of NW, excluding the primary home) | Investing Advisor — concentration review |
| 5 | `cash_months` > 12 | Emergency Fund Assessment (likely over-funded) + Investing Advisor |
| 6 | Otherwise | Goal-Based Savings Plan |

### Output template

```markdown
# Net Worth Snapshot — {snapshot_date}

## Headline
Net worth as of {snapshot_date}: **${net_worth}**. {↑/↓ X% YoY — or "No prior snapshot"}.

## Assets
| Category | Sub-total | % of total assets |
|---|---|---|
| Cash & equivalents | | |
| Taxable investments | | |
| Retirement & tax-advantaged | | |
| Real estate | | |
| Other tangible | | |
| **Total assets** | | 100% |

## Liabilities
| Category | Sub-total | Interest rate (if known) |
|---|---|---|
| Mortgage | | |
| Consumer | | |
| Other | | |
| **Total liabilities** | | |

## Ratios
| Ratio | Value | Read |
|---|---|---|
| Liquid net worth | | |
| Investable net worth | | |
| Home-equity % | | |
| Liability-to-asset | | |
| Conservative home value | {value or "Not applicable — selling cost not supplied"} | |

## Trend
| Date | Net worth | Change |
|---|---|---|
{or "Not applicable — no prior snapshots"}

## Concentration flags
{items > 25% of NW — or "None"}

## Next steps
{decision rule # and hand-off}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).