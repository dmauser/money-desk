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
   - Last resort: realize gains in taxable to relocate (only if long-run benefit exceeds tax cost — usually doesn't).
5. **Constraints to respect:**
   - Total allocation must stay on target.
   - Roth space is precious — fill with highest-expected-return assets.
   - Don't trigger big realized gains just to relocate.

## Required citations

- Each holding's account / shares / basis cites a statement export.
- Tax-bracket assumption stated explicitly.

## Deliverable shape

- Markdown report `./reports/investing-advisor/asset-location-<YEAR>.md`:
  - Current placement matrix.
  - Ideal placement matrix.
  - Tax-drag estimate of current (bps/yr).
  - Migration playbook (no-cost trades first, then directed contributions).

## Notes

- Asset location is downstream of asset allocation — set allocation FIRST.
- Munis only make sense if marginal bracket × pre-tax yield > muni yield.
- "Analysis only. Not professional investment or tax advice."
