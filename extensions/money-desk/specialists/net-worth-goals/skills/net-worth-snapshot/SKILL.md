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

- For a primary residence, two valuations are reasonable: market value − selling costs (~6%) for a conservative figure, or raw market value for the headline. Show both if material.
- Don't include term life insurance face value (no cash value). Include cash value of permanent life policies (whole / universal).
- HSA balances above current-year medical expenses count as retirement assets; rest is cash. Pick one and be consistent.
- Vehicle values depreciate fast — re-pull KBB each snapshot rather than carrying old numbers.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).