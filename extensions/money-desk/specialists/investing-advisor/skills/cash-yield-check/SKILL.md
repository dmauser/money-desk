# Cash Yield Check

description: Survey current **high-yield savings (HYSA)**, **money-market (MMA)**, and **short-term CD** APYs from [depositaccounts.com](https://www.depositaccounts.com/) to find the best parking spot for an emergency fund or short-term cash bucket. Analysis only — does NOT open accounts, transfer money, or recommend a specific institution. The shortlist surfaces top-paying options with the gotchas (minimums, fees, tiers, insurance) that the headline APY doesn't show.

## When to use

- User asks "where should I keep my emergency fund?" / "what's the best high-yield savings account right now?" / "best money market rate?" / "should I move my cash out of my brick-and-mortar checking?"
- User's emergency fund or short-term savings is sitting in a sub-1% APY checking/savings account.
- User is laddering CDs and wants a current 3 / 6 / 12-month rate sweep.
- A Net Worth Review or Annual Financial Review surfaced idle cash earning materially below the market rate.

## Inputs needed

- **Cash bucket**: which money is this? (emergency fund / short-term goal / sinking fund / waiting-to-invest cash).
- **Amount to park** (approximate $).
- **Time horizon**: how soon might you need it? (≤3 mo → HYSA/MMA only; 3–12 mo → HYSA or short CD; 12+ mo → consider CD ladder or short-term Treasuries).
- **Access needs**: how many withdrawals per month, need debit-card / ATM / checks, OK with ACH-only?
- **Minimum-balance comfort**: can you keep $X locked to qualify for the headline APY, or do you need a no-minimum account?
- **Account-type constraint**: any preference / hard requirement around bank vs credit union, online-only vs brick-and-mortar, existing-relationship pricing?
- **State** (some credit unions and state-chartered banks are membership-restricted).
- **Risk tolerance for non-bank cash alternatives**: are money-market mutual funds (e.g. SPAXX, VMFXX, SWVXX) and short-term Treasury ETFs (e.g. SGOV, BIL) in scope, or strictly FDIC/NCUA-insured deposit accounts only? (depositaccounts.com only covers the latter — note the boundary explicitly.)

## Workflow

1. **Echo inputs** so the user can verify the bucket, amount, horizon, and access constraints before any rate work.
2. **Pull current rates from depositaccounts.com.** Use whatever web-fetch / web-search tool the runtime exposes (e.g. `web_fetch`, `web_search`). Hit the relevant category page(s):
   - Savings: <https://www.depositaccounts.com/savings/>
   - Money market: <https://www.depositaccounts.com/moneymarket/>
   - CDs (use the term the user needs): <https://www.depositaccounts.com/cd/>
   - Reward checking (only if the user is open to monthly debit-swipe / direct-deposit hoops): <https://www.depositaccounts.com/checking/reward-checking-accounts.html>
   If the runtime has no internet access, STOP and tell the user — do NOT fabricate APYs from memory. Every rate must cite the depositaccounts.com URL and the as-of timestamp shown on the page.
3. **Filter for the user's constraints.** Remove anything that:
   - Requires a minimum balance > the user's parked amount.
   - Requires hoops the user said no to (12 debit swipes/month, $5k direct deposit, $25k minimum for the headline tier, geo-restricted credit union the user can't join, etc.).
   - Caps the APY at a tier below the user's deposit (some accounts pay the headline APY only on the first $X — everything above earns the floor rate).
   - Has a teaser rate that drops after 3–6 months (note the post-promo APY).
4. **Build the shortlist (3–6 accounts).** Each row:
   - Institution name + product name.
   - Headline APY (as-of date) + URL.
   - Insurance: **FDIC** (banks) or **NCUA** (credit unions); coverage limit ($250k per depositor per insured bank, per ownership category).
   - Minimum to open / minimum to earn APY.
   - Monthly fee + how to waive.
   - Rate-tier structure (flat APY vs tiered; if tiered, where the user's balance lands).
   - Withdrawal / transaction limits.
   - Access mechanics (ACH only, debit card, ATM network, checks, mobile deposit).
   - Membership / eligibility friction (credit-union field-of-membership, state restriction, employer affiliation).
   - Notable gotchas (teaser-rate cliff, requires checking-account relationship, slow ACH, $X early-withdrawal penalty for CDs).
5. **Annualized dollar impact.** For the user's parked amount, compute `amount × (best-shortlist APY − current APY)` in dollars/year. Then `× (1 − marginal_tax_rate)` for after-tax, since interest is taxed as ordinary income (cite `[USER-PROVIDED]` for the marginal rate, or `[ASSUMPTION: 22%]` if the user hasn't said).
6. **Tax-aware alternatives (only if the user opted them in at intake step 7).** Briefly contrast:
   - **Money-market mutual funds** at the user's brokerage (often slightly higher 7-day yield than top HYSAs, SIPC-not-FDIC, $1 NAV not guaranteed but historically extremely stable).
   - **Short-term Treasuries / T-bill ETFs (SGOV, BIL)** or direct TreasuryDirect bills: federally taxed but **state-tax-free** — for a CA / NY / OR resident in a high bracket this can beat the top HYSA after tax.
   - Note this is informational comparison only — depositaccounts.com is the source for deposit-account rates, NOT for money-market mutual funds or Treasuries.
7. **Decision guidance, not a pick.** Present the shortlist and the trade-offs (rate vs hoops vs access vs insurance type). Explicitly do NOT pick one for the user; the choice depends on factors only they can weigh (existing-banking-relationship friction, app quality, customer-service preference). End with the recommended **next-step skill** (e.g. **Allocation Check** in Investing Advisor if the user has more cash than the bucket needs, or **Net Worth & Goals → Net Worth Review** if this is part of an annual sweep).

## Required citations

- Every APY cites the **depositaccounts.com URL** of the product page (or category page row) AND the **as-of timestamp** shown on that page. Rates change daily — a number without an as-of date is a stale number.
- FDIC / NCUA insurance status cites either the bank's FDIC certificate page (<https://banks.data.fdic.gov/api/>) or the credit union's NCUA page; if the source page on depositaccounts.com already lists the FDIC/NCUA cert, cite that row.
- The user's current APY cites `[USER-PROVIDED]` or a screenshot/statement.
- Marginal tax rate for the after-tax calc cites `[USER-PROVIDED]` or `[ASSUMPTION: <rate>]`; for the standard bracket lookup, call `md_facts` first and cite `[IRS 2026 limits]` if you derive it from income.

## Deliverable shape

Markdown report `./reports/investing-advisor/cash-yield-check-<YYYYMMDD>.md`:

- **Bucket & constraints** — echoed back: amount, horizon, access needs, minimums OK, eligibility constraints.
- **Shortlist table** — 3–6 rows. Columns: Institution + Product, APY (as-of), Insurance, Min to earn APY, Monthly fee, Tier cap, Access, Eligibility, Notes/gotchas.
- **Annualized dollar pickup** — `amount × ΔAPY` pre-tax and after-tax, vs the user's current APY.
- **CD ladder option** (only if horizon allows) — sample 3/6/12-mo ladder with current top APYs and total blended yield.
- **Non-deposit alternatives** (only if opted in) — money-market mutual fund + Treasury ETF comparison, with the FDIC-vs-SIPC and state-tax distinction called out.
- **What this is NOT** — explicit one-liner: "This is a rate survey, not a recommendation to open any specific account. Verify rates and terms on the institution's own site before applying."
- **Next step** — pointer to the friendly-named follow-up skill.

## Notes

- Rates move daily. Anything older than a week should be re-pulled before the user acts.
- **Teaser-rate trap**: some headline accounts pay X% for 3 months then drop to the standard tier. Read the small print and report the post-promo APY alongside the teaser.
- **Tier-cap trap**: an account advertising 5% APY may pay that ONLY on the first $5,000 — for a $50k emergency fund the *blended* APY is much lower. Compute the blended rate, don't quote the headline.
- **Liquidity vs yield**: a no-penalty CD or a 3-month CD can beat a HYSA without giving up much access — worth surfacing.
- **Sweep accounts**: if the user already has cash at a major brokerage, the default sweep is often a low rate, but switching the sweep to a money-market mutual fund (e.g. Fidelity SPAXX, Schwab SWVXX, Vanguard VMFXX) can capture most of the yield without opening a new bank account.
- **FDIC limit**: $250k per depositor per insured bank per ownership category — for emergency funds above that, either spread across institutions or use a network-sweep program (e.g. IntraFi / ICS / CDARS) — depositaccounts.com lists some of these.
- Analysis only. Not professional financial advice. Verify all APYs, fees, and terms on the institution's site before opening any account.
