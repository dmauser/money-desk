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

1. **Compute essential monthly outflow.** Sum the categories above. If the user can't itemize, default to a fraction of take-home (typically 65–75%) and flag.
2. **Compute current coverage.** EF balance ÷ essential monthly outflow = months covered.
3. **Recommend target months** —
   - **3 months** — dual income, stable W-2, no dependents, employer health, no consumer debt.
   - **6 months** — single income, stable W-2, dependents.
   - **9–12 months** — self-employed / 1099 / commission, single income with dependents, recent health event, niche specialty, near-retirement with sequence-of-returns concern, executive (long job-search times).
   - Flag the modifiers (income variability, health risk, dependents) explicitly.
4. **Gap analysis.** Recommended target × essential outflow − current EF = gap (or excess). If excess, compute the opportunity cost of holding it in cash vs deploying to other goals or investing.
5. **Account placement** —
   - High-yield savings (HYSA) at top-tier rate: best for ≤6 months of EF. Cite current top rates and the institution.
   - Money market mutual fund (in brokerage): competitive yield, T+1 settlement.
   - Short-term Treasury bills (4-week / 8-week / 13-week): state-tax-free; ladder for stable rolling liquidity.
   - I-Bonds: NOT primary EF (1-year lockup, 5-yr penalty), but a tier-2 reserve for amounts beyond near-term EF.
   - **Avoid**: equity ETFs/funds (downside risk), CDs longer than 6 months (illiquidity), checking (no yield).
6. **Build-up plan if underfunded.** Often: starter EF ($1k–$2k) → high-interest debt payoff → fund the rest of EF. Cite Dave Ramsey / FOO origin if the user references it but don't dogmatize.

## Required citations

- Current EF balance cites the account statement.
- Essential expenses cite their source (Budget Coach output, statement extracts, or "user-reported").
- HYSA / T-bill rate suggestions cite the source and date (rates move; flag stale).
- Target-month recommendation cites which modifiers triggered the higher band.

## Deliverable shape

Markdown report `./reports/net-worth-goals/emergency-fund-<YYYYMMDD>.md`:
- **Headline** — e.g., "You have 2.3 months of essentials in EF; recommended target is 6 months. Gap: $14,200."
- **Math table** — essential outflow, current EF, months covered, target, gap.
- **Why this target** — bullet list of modifiers.
- **Account placement** — recommended split (e.g., "$10k HYSA for instant access; remaining $20k in 4-/8-/13-wk T-bill ladder for state-tax savings").
- **Build-up plan** — monthly contribution and months-to-target; sequenced with debt payoff if applicable.
- **Excess scenario (if applicable)** — deployment plan for over-funded cash.

## Notes

- "Months of essential expenses" is the right denominator — NOT months of take-home pay. Many users overfund because they use the wrong denominator.
- A HELOC is a *line of credit*, not an emergency fund. Don't count it as part of the EF, but DO note it exists as a tier-2 backstop.
- Roth IRA contributions are withdrawable penalty-free — viable last-resort backstop for younger users but tapping it destroys retirement compounding; not the first line of defense.
- If the user has high-interest consumer debt AND no EF, sequence: small starter EF ($1k–$2k) → aggressive debt payoff → full EF.
