# Asset Location Review

description: Place each asset class in the most tax-efficient account type. Distinct from asset *allocation* (what to own); asset *location* is where (which account) to own it. Done right, can add 15–75 bps of annual after-tax return at no risk cost.

## When to use

- User has meaningful balances across taxable + tax-deferred + Roth.
- Tax-drag in taxable account is high (e.g. holds bond funds, REITs, actively-managed funds throwing distributions).
- After consolidating accounts or rolling over a 401(k).

## Inputs needed

- Holdings list across all accounts with account-type tag (taxable / Trad / Roth / HSA / 529).
- Cost basis in taxable (rearranging may trigger gains).
- Marginal tax bracket (federal + state) and expected retirement bracket.
- Annual contributions by account-type going forward.

## Workflow

1. **Map current placement.** Build a matrix: rows = asset classes (US equity, intl equity, REITs, corporate bonds, treasuries, TIPS, etc.); columns = account types; cells = % of total portfolio.
2. **Tax-efficiency ranking.** From most tax-inefficient (best in tax-deferred) to most tax-efficient (best in taxable):
   1. REITs, high-yield bonds, actively-managed funds with high turnover → **tax-deferred**.
   2. Investment-grade corporate bonds → **tax-deferred**.
   3. Treasuries / muni bonds → either (munis prefer taxable; treasuries state-tax-free).
   4. Broad-market index equity → **taxable** (LTCG + step-up + tax-loss harvesting potential).
   5. International equity → **taxable** (foreign tax credit only works there).
   6. Highest-expected-return assets (small-cap / emerging-markets / growth tilts) → **Roth** (tax-free growth maximally valuable).
   7. HSA → highest-return long-duration equity (triple tax advantage if used for medical in retirement).
3. **Gap analysis.** Compare current vs ideal placement; quantify tax drag of current setup.
4. **Migration plan.** Move FIRST via:
   - New contributions to underweight buckets (no tax cost).
   - Rebalancing trades inside tax-advantaged accounts.
   - Last resort: realize gains in taxable to relocate (only if the tax cost pays back within 5 years — Decision rule 4).
5. **Constraints to respect:**
   - Total allocation must stay on target.
   - Roth space is precious — fill with highest-expected-return assets.
   - Don't realize gains whose payback exceeds 5 years just to relocate.

## Required citations

- Each holding's account / shares / basis cites a statement export.
- Tax-bracket assumption stated explicitly.

## Deliverable shape

- Markdown report `./money-desk/investing-advisor/asset-location-<YEAR>.md`:
  - Current placement matrix.
  - Ideal placement matrix.
  - Tax-drag estimate of current (bps/yr).
  - Migration playbook (no-cost trades first, then directed contributions).

## Notes

- Asset location is downstream of asset allocation — set allocation FIRST.
- Munis only make sense if marginal bracket × pre-tax yield > muni yield.
- "Analysis only. Not professional investment or tax advice."

## Determinism rules

### Input keys

- `holdings` — list of `{ ticker, current_value, cost_basis?, account_type, asset_class, distribution_yield_pct?, qualified_dividend_share_pct? }`; `account_type` ∈ `taxable`, `traditional_401k`, `roth_401k`, `traditional_ira`, `roth_ira`, `hsa`, `529`, `other`; `asset_class` ∈ `reit`, `high_yield_bond`, `active_high_turnover`, `corporate_bond`, `treasury`, `tips`, `muni_bond`, `us_equity_index`, `intl_equity`, `small_cap_em_tilt`, `cash`
- `federal_marginal_rate_pct` — number (22 = 22%)
- `state_marginal_rate_pct` — number
- `ltcg_rate_pct` — number, federal rate on qualified dividends / long-term gains
- `annual_contributions` — `{ taxable_usd, traditional_usd, roth_usd, hsa_usd }`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Holdings, account types, cost basis | **Ask — no default** | — |
| Federal marginal rate | Derive from taxable income with `md_facts` → `income_tax_brackets_mfj_2026.brackets` (MFJ; other statuses: `.brackets_single` / `.brackets_hoh` / `.brackets_mfs`) | `[IRS 2026 brackets]` |
| LTCG / qualified-dividend rate | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` (MFJ only; else **Ask**) | `[IRS 2026 brackets]` |
| State marginal rate | **Ask — no default** | — |
| Distribution yield, qualified share per fund | Fund issuer page via `md_sources`; if not retrieved, `[UNSOURCED]` and exclude that holding from the drag total | `[UNSOURCED]` |
| Future contributions | 0 per account | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

1. **Current placement matrix.** Rows = asset classes, columns = account groups (`taxable`; `tax_deferred` = traditional 401k/IRA; `roth` = Roth 401k/IRA; `hsa`); cell = `value / total × 100`, one decimal. `529`/`other` are reported but excluded from relocation.
2. **Tax-inefficiency rank** (fixed): 1 `reit`, `high_yield_bond`, `active_high_turnover` → 2 `corporate_bond` → 3 `treasury`, `tips` → 4 `cash` → 5 `us_equity_index` → 6 `intl_equity` → 7 `small_cap_em_tilt`. `muni_bond` is always placed in taxable.
3. **Ideal placement** — fill capacities (each group's current total balance) in this order, keeping each asset class's total dollars fixed:
   1. `tax_deferred`: classes in rank order 1 → 7 until full.
   2. `hsa`, then `roth`: remaining classes in reverse rank order 7 → 1 until full.
   3. `taxable`: everything left.
   Ties inside a rank: larger dollar class first, then class name A–Z.
4. **Annual tax drag (taxable holdings only)** per holding: `value × yield/100 × [q × (ltcg + state) + (1 − q) × (federal + state)] / 100`, where `q = qualified_dividend_share_pct / 100` (Treasuries: drop `state`; munis: 0). Compute for current and ideal placement; `drag_saving_usd = current − ideal`; also report as bps of the total portfolio.
5. **Migration cost.** For each move that sells in taxable: `tax_cost_usd = max(0, value − cost_basis) × (ltcg + state)/100`. Moves inside tax-advantaged accounts and redirected contributions cost $0. `payback_years = tax_cost_usd / drag_saving_usd` for the taxable moves (∞ if saving ≤ 0).
6. **Muni check** (only for taxable bond holdings): prefer munis if `muni_yield > taxable_yield × (1 − (federal + state)/100)`; yields from `md_sources`, else mark "not evaluated".
7. Rounding: cents internally; report whole dollars, percents to one decimal, bps to whole numbers.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Only one account group holds assets | Not applicable — nothing to relocate; set allocation via Allocation Check |
| 2 | `drag_saving_usd < max($100, 0.05% of total portfolio)` | No relocation; direct future contributions per the ideal matrix |
| 3 | All ideal moves can be made inside tax-advantaged accounts or with the next 12 months of contributions | Execute those moves; no taxable sales |
| 4 | Taxable relocation needed and `payback_years ≤ 5` | Include those taxable sales (specific-lot, losses first) |
| 5 | Otherwise | Do not sell in taxable; migrate gradually via contributions and in-account trades |

### Output template

```markdown
# Asset Location Review — {as_of_date}

## Headline
Current tax drag **${current_drag}/yr ({bps} bps)** → ideal **${ideal_drag}/yr**; saving **${drag_saving}/yr**. Recommendation: **{decision rule # → action}**.

## Tax rates used
| Rate | Value | Source |
|---|---|---|

## Current placement (% of total)
| Asset class | Taxable | Tax-deferred | Roth | HSA |
|---|---|---|---|---|

## Ideal placement (% of total)
| Asset class | Taxable | Tax-deferred | Roth | HSA |
|---|---|---|---|---|

## Migration playbook
| Order | Account | Action | Asset class / ticker | $ | Tax cost $ | Payback (yrs) |
|---|---|---|---|---|---|---|

## Muni check
{result — or "Not applicable — no taxable bond holdings"}

## Holdings excluded (missing yield data)
{list — or "None"}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
