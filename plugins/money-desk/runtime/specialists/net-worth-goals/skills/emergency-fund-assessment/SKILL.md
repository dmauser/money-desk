## Emergency Fund Assessment

description: Quantify months-of-essential-expenses currently covered by liquid emergency reserves, recommend a target based on the user's situation (income stability, dependents, dual-income), and propose the right account placement (HYSA / money market / T-bill ladder). Use for "how much emergency fund do I need" or "where should I keep it".

## When to use

- New-to-budgeting users (almost always a foundational gap).
- After a layoff scare, illness, or income variability event.
- When a user is over-funded in cash and missing investment returns (yes, this is also a problem).
- Before transitioning to a single-income household, going self-employed, or any income-volatility increase.

## Inputs needed

- Current emergency-fund balance(s) and where they sit (account name, APY if known).
- Monthly essential expenses (rent/mortgage, utilities, food at home, transport, insurance, minimum debt payments, childcare). EXCLUDE: dining out, entertainment, vacations, discretionary shopping.
- Income source(s): single vs dual income; W-2 vs 1099; commission vs salary; tenure / stability.
- Dependents (kids, elderly parents).
- Health-insurance situation (employer-provided vs self-paid vs marketplace) — affects realistic "how long can I be without income" math.
- Other liquid backstops (HELOC available, Roth IRA contributions accessible, parents' loan).

## Workflow

1. **Compute essential monthly outflow.** Sum the categories above. If the user can't itemize, run Cashflow Review (Budget Coach) first — there is no take-home-fraction default.
2. **Compute current coverage.** EF balance ÷ essential monthly outflow = months covered.
3. **Recommend target months** —
   - **3 months** — dual W-2 with no modifiers (no dependents, tenure ≥ 2 years, employer / spouse / public health coverage, no high-interest debt).
   - **6 months** — single-earner household (single W-2, stay-at-home spouse, dual mixed) with no modifiers, or dual W-2 with any modifier.
   - **9 months** — single-earner with tenure < 2 years, self-paid health, or elevated job-search risk (recent health event, niche specialty, executive, near-retirement sequence risk); or self-employed / 1099 / commission with no modifiers.
   - **12 months** — self-employed / 1099 / commission with dependents, self-paid health, or elevated job-search risk.
   - Exact rules: Determinism rules table A. Flag the modifiers that fired explicitly.
4. **Gap analysis.** Recommended target × essential outflow − current EF = gap (or excess). If excess, compute the opportunity cost of holding it in cash vs deploying to other goals or investing.
5. **Account placement** —
   - High-yield savings (HYSA) at top-tier rate: best for ≤6 months of EF. Cite current top rates and the institution.
   - Money market mutual fund (in brokerage): competitive yield, T+1 settlement.
   - Short-term Treasury bills (4-week / 8-week / 13-week): state-tax-free; ladder for stable rolling liquidity.
   - I-Bonds: NOT primary EF (1-year lockup, 5-yr penalty), but a tier-2 reserve for amounts beyond near-term EF.
   - **Avoid**: equity ETFs/funds (downside risk), CDs longer than 6 months (illiquidity), checking (no yield).
6. **Build-up plan if underfunded.** Often: starter EF ($2,000) → high-interest debt payoff → fund the rest of EF. Cite Dave Ramsey / FOO origin if the user references it but don't dogmatize.

## Required citations

- Current EF balance cites the account statement.
- Essential expenses cite their source (Budget Coach output, statement extracts, or "user-reported").
- HYSA / T-bill rate suggestions cite the source and date (rates move; flag stale).
- Target-month recommendation cites which modifiers triggered the higher band.

## Deliverable shape

Markdown report `./money-desk/net-worth-goals/emergency-fund-<YYYYMMDD>.md`:
- **Headline** — e.g., "You have 2.3 months of essentials in EF; recommended target is 6 months. Gap: $14,200."
- **Math table** — essential outflow, current EF, months covered, target, gap.
- **Why this target** — bullet list of modifiers.
- **Account placement** — recommended split (e.g., "$10k HYSA for instant access; remaining $20k in 4-/8-/13-wk T-bill ladder for state-tax savings"). **Cite every HYSA / MMA / CD rate to a DepositAccounts.com URL (category or product page) with the as-of timestamp, tagged `[UNSOURCED — verify on issuer page]`, and link the bank/credit-union's own product page alongside it. Money-market mutual funds cite the fund issuer's 7-day-yield page; T-bills cite TreasuryDirect.gov or the brokerage's auction page.** For every option in the placement, show:
  - **Expense ratio / net expense** — `n/a` for deposits; prospectus net-expense for MMFs (e.g. SPAXX 0.42%, VMFXX 0.11%, SWVXX 0.34%, VUSXX 0.09%); ETF net-expense for T-bill ETFs (SGOV 0.09%, BIL 0.135%).
  - **Federal tax treatment** — all interest is ordinary income (1099-INT for deposits and T-bills; 1099-DIV for MMFs). No federal exemption.
  - **State tax treatment** — HYSA / MMA / CD → fully state-taxable. Treasury MMFs / T-bill ETFs / direct T-bills → **state-tax-free** (IRC §103). Prime MMFs → partially state-taxable; multiply state tax by `(1 − USGO%)` using the fund's published year-end USGO breakdown.
  - **After-tax APY** for this user's marginal fed + state brackets (cite `[USER-PROVIDED]` / `[ASSUMPTION]` / `[IRS 2026 limits]` via `md_facts`). This often flips the ranking for CA / NY / OR / HI / NJ / MN residents.
  - **Considerations** — liquidity (same-day ACH vs T+1 settle vs T-bill maturity), insurance type (FDIC / NCUA / SIPC / US govt full-faith-and-credit), $250k per-institution FDIC cap, reinvestment risk on CD ladders.
  Include a one-line "Primary rate source: DepositAccounts.com" footnote (note any one-off override the user requested for this turn).
- **Build-up plan** — monthly contribution and months-to-target; sequenced with debt payoff if applicable.
- **Excess scenario (if applicable)** — deployment plan for over-funded cash.

## Notes

- "Months of essential expenses" is the right denominator — NOT months of take-home pay. Many users overfund because they use the wrong denominator.
- A HELOC is a *line of credit*, not an emergency fund. Don't count it as part of the EF, but DO note it exists as a tier-2 backstop.
- Roth IRA contributions are withdrawable penalty-free — viable last-resort backstop for younger users but tapping it destroys retirement compounding; not the first line of defense.
- If the user has high-interest consumer debt AND no EF, sequence: small starter EF ($2,000) → aggressive debt payoff → full EF. "High-interest" means APR ≥ 10%.

## Determinism rules

### Input keys

Names match the `md_nw_skill_emergency_fund_assessment` intake schema; amounts are USD.

- `current_balance` — number; liquid emergency-fund balance
- `where_held` — string; account + APY if known
- `monthly_essentials` — number; essential monthly outflow (housing, utilities, groceries, transport, insurance, minimum debt payments, childcare)
- `income_type` — `Single W-2` | `Dual W-2` | `Single 1099 / self-employed` | `Dual mixed` | `Commission / variable` | `Single income with stay-at-home spouse`
- `tenure_years` — number; primary earner's years at current employer
- `dependents` — integer
- `health_insurance` — `Employer (any plan)` | `Employer HDHP+HSA` | `ACA marketplace` | `Self-paid private` | `Medicaid / Medicare` | `Spouse's employer`
- `heloc_available` — number (tier-2 backstop only; never counted in the EF)
- `roth_contributions_accessible` — number (last-resort backstop only; never counted in the EF)
- `high_interest_debt_usd` — number; consumer debt at APR ≥ 10% (optional, default 0)
- `elevated_job_search_risk` — bool; recent health event, niche specialty, executive role, or near-retirement sequence risk (optional, default false)
- `monthly_contribution_capacity_usd` — number; what the user can add per month (optional)
- `marginal_federal_rate_pct`, `marginal_state_rate_pct` — numbers (for after-tax yield ranking)
- `placement_options` — list of `{ name, type (hysa | mma | treasury_mmf | govt_mmf | prime_mmf | tbill | tbill_etf | cd), apy_pct, usgo_pct?, source_url, as_of_date }`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| EF balance, essentials, income type, tenure, health insurance | **Ask — no default** (if essentials can't be itemized, run Cashflow Review first) | — |
| High-interest debt | $0 | `[ASSUMPTION]` |
| Elevated job-search risk | false | `[ASSUMPTION]` |
| Marginal federal rate | **Ask — no default** (derive from `md_facts` → `income_tax_brackets_mfj_2026.brackets` if taxable income and filing status are given) | `[IRS 2026 limits]` |
| Marginal state rate | **Ask — no default** | — |
| Current deposit / MMF / T-bill yields | **Ask — no default**; look up per the deposit-rate source policy (DepositAccounts.com, fund 7-day yield page, TreasuryDirect) | `[UNSOURCED — verify on issuer page]` |
| Long-run equity real return (opportunity cost of excess) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` (decimal; 0.06 = 6%) | `[ASSUMPTION]` |
| Inflation | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |
| Starter EF | $2,000 (upper end of the $1k–$2k starter convention) | `[ASSUMPTION]` |

### Calculation method

1. `months_covered = current_balance ÷ monthly_essentials`, 1 decimal. HELOC and Roth contributions are excluded.
2. `target_months` = first matching row of Decision table A.
3. `target_usd = target_months × monthly_essentials`; `gap_usd = target_usd − current_balance` (negative = excess).
4. **Build-up** (gap > 0): `months_to_target = ceil(gap_usd ÷ monthly_contribution_capacity_usd)`; if capacity is not given, show the monthly amount needed for 12 and 24 months (`ceil(gap ÷ 12)`, `ceil(gap ÷ 24)`).
5. **Excess** (balance > 1.5 × target_usd): `excess_usd = current_balance − target_usd`; illustrative annual opportunity cost = `excess_usd × (equity_real_return − (best_cash_apy − inflation))`, using the `md_facts` decimals ×100 and the best after-tax cash APY from step 6. Tag `[ASSUMPTION]`.
6. **After-tax APY** per option: `hysa` / `mma` / `cd` → `apy × (1 − fed − state)`; `treasury_mmf` / `tbill` / `tbill_etf` → `apy × (1 − fed)`; `prime_mmf` / `govt_mmf` → `apy × (1 − fed − state × (1 − usgo_pct/100))` (fund's published year-end USGO %; if unknown, treat as fully state-taxable). Rates are percents; 2 decimals.
7. **Placement:** Tier 1 = `min(target_usd, 6 × monthly_essentials)` in the highest after-tax option with same-day or T+1 liquidity (`hysa`, `mma`, `treasury_mmf`, `govt_mmf`, `prime_mmf`); tie → `hysa`. Tier 2 = any remainder of the target in the highest after-tax option of all types (a `tbill` choice becomes a 4/8/13-week ladder in equal thirds); tie → the more liquid option. CDs > 6 months, equities, and I-Bonds are never Tier 1 or Tier 2.
8. **Rounding:** whole dollars; months 1 decimal; APYs 2 decimals.

### Decision rules

**A. Target months** — evaluate top to bottom; first match wins. "Variable income" = `Single 1099 / self-employed` or `Commission / variable`. "Single-earner" = `Single W-2`, `Single income with stay-at-home spouse`, or `Dual mixed`. "Self-paid health" = `ACA marketplace` or `Self-paid private`.

| # | Condition | Target months |
|---|---|---|
| A1 | Variable income and (`dependents` ≥ 1 or self-paid health or `elevated_job_search_risk`) | 12 |
| A2 | Variable income | 9 |
| A3 | Single-earner and (`tenure_years` < 2 or self-paid health or `elevated_job_search_risk`) | 9 |
| A4 | Single-earner | 6 |
| A5 | `Dual W-2` and (`dependents` ≥ 1 or `tenure_years` < 2 or self-paid health or `high_interest_debt_usd` > 0 or `elevated_job_search_risk`) | 6 |
| A6 | Otherwise (`Dual W-2`, no modifiers) | 3 |

**B. Recommendation** — evaluate top to bottom; first match wins.

| # | Condition | Recommendation |
|---|---|---|
| B1 | `high_interest_debt_usd` > 0 and `current_balance` < $2,000 | Build starter EF to $2,000 → route high-interest debt to Debt Strategist → then full EF |
| B2 | `high_interest_debt_usd` > 0 and `current_balance` ≥ $2,000 and gap > 0 | Hold the EF; extra cash to debt payoff first (Debt Strategist), then resume build-up |
| B3 | gap > 0 | Build up — contribution and months-to-target per step 4 |
| B4 | `current_balance` > 1.5 × `target_usd` | Over-funded — deploy `excess_usd` (Goal-Based Savings Plan / Investing Advisor) |
| B5 | Otherwise | Fully funded — maintain; re-place per step 7 if the current account is not the top option |

### Output template

```markdown
# Emergency Fund Assessment — {YYYY-MM-DD}

## Headline
You have **{months_covered} months** of essentials; target is **{target_months} months** (rule {A#}). {Gap: ${gap} / Excess: ${excess} / Fully funded}.

## Math
| Line | Value |
|---|---|
| Monthly essentials | |
| Current EF | |
| Months covered | |
| Target months | |
| Target $ | |
| Gap (excess) | |

## Why this target
- Rule {A#}: {modifiers that fired}

## Account placement
| Tier | Amount | Option | APY | After-tax APY | Expense ratio | Federal tax | State tax | Liquidity | Insurance | Source (as of) |
|---|---|---|---|---|---|---|---|---|---|---|
Primary rate source: DepositAccounts.com{; override note}

## Backstops (not counted)
HELOC ${heloc_available}; Roth contributions ${roth_contributions_accessible}.

## Build-up plan
{months_to_target at $X/mo, or 12- and 24-month amounts — or "Not applicable — fully funded"}

## Excess scenario
{excess, illustrative opportunity cost, deployment hand-off — or "Not applicable — not over-funded"}

## Recommendation
{Decision rule B# and action}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
