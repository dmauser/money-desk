# Cash Yield Check

description: Survey current **high-yield savings (HYSA)**, **money-market (MMA)**, and **short-term CD** APYs from [depositaccounts.com](https://www.depositaccounts.com/) to find the best parking spot for an emergency fund or short-term cash bucket. Analysis only — does NOT open accounts, transfer money, or recommend a specific institution. The shortlist surfaces top-paying options with the gotchas (minimums, fees, tiers, insurance) that the headline APY doesn't show.

## Source policy (DEFAULT — persisted across all sessions)

**DepositAccounts.com (<https://www.depositaccounts.com/>) is the DEFAULT preferred source** for current US deposit-product rates: HYSA, money market accounts (MMA / MMDA), CDs (including no-penalty and bump-up CDs), reward-checking accounts, and credit-union specials. Rules:

1. Query **DepositAccounts.com FIRST** for any "best / top / highest" rate request — before Bankrate, NerdWallet, DoctorOfCredit, or any other aggregator. ⚠️ `web_fetch` on `depositaccounts.com` returns **HTTP 403** (the site blocks scrapers), so use `web_search` with a site-restricted query like `site:depositaccounts.com <product> rates` — the search snippets contain the current APYs and as-of dates. See the workflow's fetch strategy below for the full fallback chain.
2. **Cite the DepositAccounts.com URL on every figure in the output report** (category page or product page) and tag the rate **`[UNSOURCED — verify on issuer page]`**. Deposit rates change daily; a number without an as-of date is stale.
3. **Cross-check the headline APY against the bank or credit-union's OWN product page** before recommending action. If they disagree, quote the issuer page as live and note the DepositAccounts figure as indexed.
4. **Money-market MUTUAL FUNDS (VMFXX, SPAXX, SWVXX, SPRXX, VUSXX, FZDXX, etc.) are NOT in DepositAccounts' scope.** Use the **fund issuer's official 7-day-yield page** (Vanguard / Fidelity / Schwab) and cite that URL. Call out the FDIC-vs-SIPC distinction explicitly when contrasting with deposit accounts.
5. **Treasury bills are NOT in DepositAccounts' scope.** Use **TreasuryDirect.gov** (<https://www.treasurydirect.gov/auctions/auction-query/>) or the brokerage's T-bill auction page. For SGOV / BIL and similar T-bill ETFs, use the ETF issuer's fund page.
6. **One-off override.** If the user says "use Bankrate instead this time" (or names another aggregator) for a single query, honor it for that turn only and revert to DepositAccounts.com on the next deposit-rate question.

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
2. **Pull current rates from depositaccounts.com — the DEFAULT preferred source per the policy above.** ⚠️ **Known issue:** `web_fetch` against `depositaccounts.com` returns **HTTP 403** (they block automated user-agents). Do NOT attempt `web_fetch` on that domain — it will fail every time and waste a turn. Use this fetch strategy instead, in order:

   - **Primary — `web_search` with a site-restricted query.** This returns snippet text from Google/Bing that contains the current APYs and as-of dates, without triggering the 403. Examples:
     - `site:depositaccounts.com best HYSA rates`
     - `site:depositaccounts.com 6 month CD rates`
     - `site:depositaccounts.com money market account rates`
     - `site:depositaccounts.com reward checking accounts`
     - `site:depositaccounts.com no penalty CD`
   - **Secondary — direct `web_fetch` on the bank or credit-union's OWN product page** for each candidate surfaced by the search. Individual issuer sites generally don't block fetches and are also the authoritative source for the cross-check step (rule 3 of the source policy).
   - **Last resort — `web_search` against another aggregator** (Bankrate, NerdWallet, DoctorOfCredit) if both of the above fail to surface enough candidates. When you do this, **say so explicitly in the report's source footer**: "DepositAccounts.com `web_fetch` returned 403; results above sourced via `web_search site:depositaccounts.com` and cross-checked on issuer pages. <Aggregator X> used as a secondary cross-check."
   - **Never fabricate APYs from memory.** If `web_search` is also unavailable in this runtime, STOP and tell the user — do not invent numbers. Every rate must cite either a DepositAccounts URL (from the search-result snippet), an issuer product-page URL, or both. Rates change daily.

   Relevant DepositAccounts.com category pages to use as `site:` targets (and to link from the report even if you didn't fetch them directly):
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
5. **Annualized dollar impact.** For the user's parked amount, compute `amount × (best-shortlist APY − current APY)` in dollars/year. Then `× (1 − marginal_tax_rate)` for after-tax, since interest is taxed as ordinary income (cite `[USER-PROVIDED]` for the marginal rate; if the user hasn't said, derive it from income with `md_facts` brackets or report after-tax as "Not applicable" — never assume a rate; see Determinism rules).
6. **Tax-aware alternatives (only if the user opted them in at intake step 7).** Briefly contrast:
   - **Money-market mutual funds** at the user's brokerage (often slightly higher 7-day yield than top HYSAs, SIPC-not-FDIC, $1 NAV not guaranteed but historically extremely stable).
   - **Short-term Treasuries / T-bill ETFs (SGOV, BIL)** or direct TreasuryDirect bills: federally taxed but **state-tax-free** — for a CA / NY / OR resident in a high bracket this can beat the top HYSA after tax.
   - Note this is informational comparison only — depositaccounts.com is the source for deposit-account rates, NOT for money-market mutual funds or Treasuries.
7. **Decision guidance, not a pick.** Present the shortlist and the trade-offs (rate vs hoops vs access vs insurance type). Explicitly do NOT pick one for the user; the choice depends on factors only they can weigh (existing-banking-relationship friction, app quality, customer-service preference). End with the recommended **next-step skill** (e.g. **Allocation Check** in Investing Advisor if the user has more cash than the bucket needs, or **Net Worth & Goals → Net Worth Review** if this is part of an annual sweep).

## Required citations

- Every APY cites the **depositaccounts.com URL** of the product page (or category page row) AND the **as-of timestamp** shown on that page. Rates change daily — a number without an as-of date is a stale number.
- FDIC / NCUA insurance status cites either the bank's FDIC certificate page (<https://banks.data.fdic.gov/api/>) or the credit union's NCUA page; if the source page on depositaccounts.com already lists the FDIC/NCUA cert, cite that row.
- The user's current APY cites `[USER-PROVIDED]` or a screenshot/statement.
- Marginal tax rate for the after-tax calc cites `[USER-PROVIDED]`, or — if derived from income — `md_facts` → `income_tax_brackets_mfj_2026` cited `[IRS 2026 brackets]`. Never an assumed rate.

## Deliverable shape

Markdown report `./money-desk/investing-advisor/cash-yield-check-<YYYYMMDD>.md`:

- **Source** — at the top of the report, a one-liner: `Primary source: DepositAccounts.com (<category-page-URL>), as-of <timestamp shown on page>. Cross-checked on issuer product pages (links in shortlist). [UNSOURCED — verify on issuer page]`. If a one-off override was used this turn (e.g. Bankrate), name the override source here and note that the persisted default is DepositAccounts.com.
- **Bucket & constraints** — echoed back: amount, horizon, access needs, minimums OK, eligibility constraints.
- **Shortlist table** — 3–6 rows. **Required columns:**
  - Institution + Product
  - APY (as-of) — tagged `[UNSOURCED — verify on issuer page]`
  - **Expense ratio / net-expense** — `n/a` for deposit accounts (HYSA / MMA / CD); for MMFs use the current prospectus net expense ratio; for T-bill ETFs the ETF's current net expense ratio. Cite the fund-issuer page and as-of date.
  - **Fed tax** — always "Ordinary income, Form 1099-INT (deposits) or 1099-DIV (MMFs) or 1099-INT box 3 (Treasuries)". For deposits and most prime MMFs: 100% federally taxable. For Treasury MMFs / T-bill ETFs / direct T-bills: 100% federally taxable.
  - **State tax** — the column that often flips the decision:
    - HYSA / MMA / CD / reward checking → **fully state-taxable** (ordinary income).
    - Prime / corporate MMFs (SPAXX, SWVXX, SPRXX) → **mostly state-taxable**; a partial state exemption may apply for the portion in US-government obligations (issuer publishes a year-end "% from US government" breakdown that varies annually — use the current published figure).
    - Treasury MMFs (VUSXX, FDLXX, SNSXX), T-bill ETFs (SGOV, BIL), and direct T-bills → **state-tax-free** (interest from direct US Treasury obligations is exempt from state and local tax — IRC §103). Note: CA, NY, CT require ≥50% USGO holdings in a fund for the state exemption to pass through; check the fund's USGO % each year.
    - Municipal money-market funds (if surfaced) → federally tax-free; state-tax-free only if single-state and matches the user's state of residence. Out of scope for most users; flag only if the user is in a high state-tax bracket with a large taxable cash bucket.
  - Insurance — FDIC / NCUA / SIPC (with coverage limits)
  - Min to earn APY
  - Monthly fee + how to waive
  - Tier cap (if any) and blended APY at the user's deposit size
  - Access mechanics (ACH only, debit card, ATM network, checks, mobile deposit, T+1 settlement)
  - Eligibility / membership friction
  - Notes / gotchas (teaser-rate cliff, post-promo APY, slow ACH, $X early-withdrawal penalty, requires checking-account relationship, etc.)
- **After-tax yield comparison** — for each shortlisted option, compute the **after-tax APY** explicitly:
  - Deposits: `APY × (1 − fed_marginal − state_marginal)`
  - Treasury MMF / T-bill ETF / direct T-bill: `(yield − net_expense_ratio) × (1 − fed_marginal)` (no state-tax subtraction)
  - Prime MMF with partial USGO%: `(yield − net_expense_ratio) × (1 − fed_marginal − state_marginal × (1 − usgo_pct))`
  - Cite `[USER-PROVIDED]` for both fed and state marginal rates, or `[IRS 2026 brackets]` for a federal rate derived from income via `md_facts`. Never an assumed rate.
  - Tabulate side-by-side so the user sees the **after-tax winner**, which is often DIFFERENT from the headline-APY winner in CA / NY / OR / HI / NJ / MN brackets.
- **Annualized dollar pickup** — `amount × ΔAPY` pre-tax and after-tax, vs the user's current APY.
- **CD ladder option** (only if horizon allows) — sample 3/6/12-mo ladder with current top APYs (each citing its DepositAccounts row + issuer page) and total blended yield. Show pre- and after-tax.
- **Non-deposit alternatives** (only if opted in) — money-market mutual fund (cite the fund issuer's 7-day yield + net expense ratio + USGO%) + Treasury ETF / T-bill (cite TreasuryDirect or brokerage auction page + ETF expense ratio) comparison, with FDIC-vs-SIPC and state-tax distinction called out. Do NOT cite DepositAccounts for these — it does not cover them.
- **Considerations** (bulleted, plain English):
  - Tax-treatment summary (which options are state-tax-free for this user's state).
  - Liquidity vs yield trade-off (HYSA same-day ACH vs MMF T+1 vs CD lockup vs T-bill maturity calendar).
  - Insurance type (FDIC vs NCUA vs SIPC vs "no insurance — full faith and credit of US government" for T-bills) and how the user's amount compares to the per-institution $250k FDIC cap.
  - Reinvestment risk (rates drop while CD is locked) vs rate-cut protection (CD locks the current rate before cuts).
  - Tax-form impact (1099-INT vs 1099-DIV vs 1099-B; some brokerages don't issue 1099 below $10 — interest is still reportable).
  - Behavioral fit (one-account simplicity vs squeezing the last 25 bps).
- **Notes** (gotchas specific to this user's shortlist) — teaser-rate cliffs, tier-cap surprises, eligibility friction, account-opening hard pulls, account-closing fees if closed within 90/180 days.
- **What this is NOT** — explicit one-liner: "This is a rate survey, not a recommendation to open any specific account. Verify rates, fees, terms, and current USGO% on the institution's own site before applying."
- **Next step** — pointer to the friendly-named follow-up skill.

## Notes

- Rates move daily. Anything older than a week should be re-pulled before the user acts.
- **Teaser-rate trap**: some headline accounts pay X% for 3 months then drop to the standard tier. Read the small print and report the post-promo APY alongside the teaser.
- **Tier-cap trap**: an account advertising 5% APY may pay that ONLY on the first $5,000 — for a $50k emergency fund the *blended* APY is much lower. Compute the blended rate, don't quote the headline.
- **Liquidity vs yield**: a no-penalty CD or a 3-month CD can beat a HYSA without giving up much access — worth surfacing.
- **Sweep accounts**: if the user already has cash at a major brokerage, the default sweep is often a low rate, but switching the sweep to a money-market mutual fund (e.g. Fidelity SPAXX, Schwab SWVXX, Vanguard VMFXX) can capture most of the yield without opening a new bank account.
- **FDIC limit**: $250k per depositor per insured bank per ownership category — for emergency funds above that, either spread across institutions or use a network-sweep program (e.g. IntraFi / ICS / CDARS) — depositaccounts.com lists some of these.
- Analysis only. Not professional financial advice. Verify all APYs, fees, and terms on the institution's site before opening any account.

## Determinism rules

### Input keys

- `cash_bucket` — `emergency_fund` | `short_term_goal` | `sinking_fund` | `waiting_to_invest`
- `amount_usd` — number, amount to park
- `horizon_months` — integer, months until the money may be needed
- `withdrawals_per_month` — integer
- `access_needs` — list of `ach` | `debit_card` | `atm` | `checks` | `mobile_deposit`
- `max_min_balance_usd` — number, largest minimum balance the user accepts
- `rejected_hoops` — list, e.g. `debit_swipes`, `direct_deposit`, `membership_restricted`
- `institution_preference` — `any` | `bank_only` | `credit_union_only` | `online_ok` | `branch_required`
- `state` — two-letter state code
- `non_deposit_ok` — boolean; money-market mutual funds / T-bill ETFs / direct T-bills in scope
- `current_apy_pct` — number, what the cash earns today
- `federal_marginal_rate_pct` — number
- `state_marginal_rate_pct` — number

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Amount, horizon, access needs | **Ask — no default** | — |
| Every APY / 7-day yield / expense ratio / USGO % | Live lookup per the Source policy (DepositAccounts.com via `web_search`, issuer pages, fund-issuer pages, TreasuryDirect); never from memory | `[UNSOURCED — verify on issuer page]` |
| Current APY | **Ask — no default** | — |
| Federal marginal rate | Derive from taxable income with `md_facts` → `income_tax_brackets_mfj_2026.brackets` (MFJ only); otherwise **Ask — no default** | `[IRS 2026 brackets]` |
| State marginal rate | **Ask — no default** | — |
| Insurance limit | FDIC / NCUA standard maximum deposit insurance amount — statutory (12 U.S.C. §1821(a)), not year-indexed | — |
| `non_deposit_ok` | `false` (deposit accounts only) | `[ASSUMPTION]` |

If either marginal rate is not provided, after-tax columns are reported as "Not applicable — marginal rate not provided" and ranking uses pre-tax yield.

### Calculation method

1. **Eligible product types by horizon:** `horizon_months ≤ 3` → HYSA, MMA, (if `non_deposit_ok`) MMF and T-bill ETF; `4–12` → add CDs and T-bills with term ≤ `horizon_months`; `> 12` → add CD ladders and Treasuries with maturity ≤ `horizon_months`.
2. **Filter** (drop the product if any is true): minimum to earn APY > `max_min_balance_usd` or > `amount_usd`; requires a hoop in `rejected_hoops`; membership not available to the user's `state`; access doesn't cover `access_needs`; transaction limits < `withdrawals_per_month`.
3. **Effective APY** per product, over `h = max(1, min(horizon_months, 12))` months:
   - Tiered: `blended = Σ(tier_amount × tier_apy) / amount_usd` using the user's amount.
   - Teaser: `effective = (min(promo_months, h) × promo_apy + max(0, h − promo_months) × post_promo_apy) / h`.
   - MMF / ETF: `yield − net_expense_ratio` (if the quoted yield is already net of expenses, do not subtract twice — state which).
4. **After-tax yield** (`f` = federal, `s` = state, as decimals):
   - Deposits: `effective × (1 − f − s)`
   - Treasury MMF / T-bill ETF / direct T-bill: `effective × (1 − f)`
   - Prime MMF: `effective × (1 − f − s × (1 − usgo_share))`
5. **Rank** by after-tax yield (pre-tax if rates missing) descending → tie: lower minimum → tie: institution name A–Z. Shortlist = top 6 (fewer only if fewer pass the filter; if fewer than 3 pass, say so).
6. **Dollar pickup** vs current: `amount_usd × (best − current) / 100`, pre-tax and after-tax (current APY taxed as a deposit). Compute in cents, report whole dollars; APYs to two decimals.
7. **Insurance check.** If a deposit product's balance would exceed the per-depositor, per-institution, per-ownership-category limit, flag the excess and list the split needed.
8. If no rate source is reachable, stop before step 1 — report "no live rates available" (never estimate APYs).

### Decision rules

The skill presents a ranked shortlist; it never picks an institution. Evaluate top to bottom; first match wins.

| # | Condition | Output |
|---|---|---|
| 1 | No live rate source reachable | Stop — tell the user; no figures |
| 2 | Fewer than 1 product passes the filter | Relax constraints list: show which filter removed the most products; ask the user which to relax |
| 3 | After-tax $ pickup of the #1 ranked option < $100/yr | "Current account is within $100/yr of the best eligible option — switching is optional" |
| 4 | `amount_usd` > insured limit and #1 is a deposit product | Shortlist + "split across institutions or use a network-sweep program" |
| 5 | Otherwise | Shortlist ranked by after-tax yield; #1 flagged as highest after-tax yield, user chooses |

### Output template

```markdown
# Cash Yield Check — {as_of_date}

## Source
Primary source: DepositAccounts.com ({category URL}), as-of {timestamp}. Cross-checked on issuer pages. [UNSOURCED — verify on issuer page]

## Bucket & constraints
| Item | Value |
|---|---|
| Bucket | |
| Amount | |
| Horizon (months) | |
| Access needs | |
| Max minimum balance | |
| Eligible product types | |

## Shortlist (ranked by after-tax yield)
| Rank | Institution + product | APY / yield (as-of, URL) | Net expense ratio | Fed tax | State tax | Insurance | Min to earn APY | Fee / waiver | Tier cap & blended APY | Access | Eligibility | After-tax yield | Gotchas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Annualized dollar pickup vs current {current_apy}%
| Option | Pre-tax $/yr | After-tax $/yr |
|---|---|---|

## CD ladder option
{ladder table — or "Not applicable — horizon ≤ 3 months"}

## Non-deposit alternatives
{MMF / T-bill rows — or "Not applicable — user kept scope to insured deposits"}

## Considerations
- {tax treatment, liquidity, insurance, reinvestment risk, 1099 form, behavioral fit}

## Decision
{decision rule # and its output}

## What this is NOT
This is a rate survey, not a recommendation to open any specific account. Verify rates, fees, terms, and current USGO% on the institution's own site before applying.

## Next step
{friendly skill name + specialist}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
