## Goal-Based Savings Plan

description: For each named savings goal (home down payment, wedding, sabbatical, big car, dream trip, etc.), compute the required monthly contribution given target amount, time horizon, and an appropriate rate-of-return assumption. Recommend an account/allocation by horizon. Use when the user wants to size and sequence financial goals.

## When to use

- After Net Worth Snapshot and Emergency Fund (this is goal-tier above foundation).
- Major life event (engagement, planning a baby, planning a move).
- Annual planning ("what am I saving for this year").
- When goals feel vague — name them, time-stamp them, price them.

## Inputs needed

- For each goal:
  - **Name** — "House down payment", "2026 sabbatical", "Kitchen reno".
  - **Target amount** — today's dollars, or future dollars if known (e.g., "$80k for a 20% down on a $400k house"). Inflate if helpful.
  - **Target date** — month/year.
  - **Already saved** — current balance earmarked for this goal.
  - **Priority** — must-have / want / nice-to-have.
- Total monthly savings capacity (after taxes, essential expenses, EF contribution, retirement, debt payoff).

## Workflow

1. **Time-horizon bucket each goal.**
   - **< 2 years** — capital preservation. Assumed return: current HYSA / T-bill rate (cite it) minus `md_facts` inflation.
   - **2–5 years** — conservative 40/60 blend. Assumed real return built from `md_facts` equity and bond real-return defaults (state explicitly).
   - **5+ years** — equity-heavy 80/20. Assumed real return built from the same `md_facts` defaults.
   - Exact formulas: Determinism rules step 3.
2. **Compute required monthly contribution** for each goal.
   - PMT formula: PMT = (FV − PV × (1+r)^n) × r / ((1+r)^n − 1), where r = monthly rate, n = months.
   - Show the formula inputs in the report (FV, PV, r, n).
3. **Aggregate.** Sum required monthly across all goals. Compare to monthly savings capacity.
4. **If aggregate > capacity, sequence.** Three legitimate moves:
   - (a) Extend the timeline of lower-priority goals.
   - (b) Reduce the target (smaller wedding, used car instead of new).
   - (c) Increase savings capacity (Budget Coach).
   - Show the user the trade-offs explicitly; don't pick for them.
5. **Account/allocation recommendation per goal:**
   - Short-horizon: HYSA, named sub-account ("Wedding 2026").
   - Mid-horizon: brokerage with 40/60 equity/bond allocation, low-cost index funds.
   - Long-horizon: brokerage with 80/20 equity/bond allocation; if 10+ years, often eligible to share allocation with retirement assets via Investing Advisor.
6. **Tax-account check.** Down payment can use up to $10k Roth IRA earnings penalty-free for first-time-buyer (lifetime); for other goals, taxable usually correct.

## Required citations

- Return assumptions cite "planning assumption — not a guarantee" with a source for the historical basis (e.g., long-run S&P returns from Damodaran or Vanguard).
- Current HYSA/T-bill rate cites institution + date.
- PMT math shows the inputs so the user can verify.

## Deliverable shape

Markdown report `./money-desk/net-worth-goals/goal-plan-<YYYYMMDD>.md`:
- **Headline** — e.g., "5 goals, $1,950/mo required, $2,200/mo capacity. Feasible."
- **Goal table** — goal, target, horizon, current $, assumed return, required $/mo, recommended account.
- **Aggregate** — sum vs capacity; surplus or deficit.
- **Scenarios (if deficit)** — three sequenced options with the trade-offs.
- **Action checklist** — open which accounts, set which auto-transfers, integrate with Budget Coach plan.

## Notes

- For a house down payment specifically, also include closing costs (size from the lender's Loan Estimate; ~2–3% of price is context only), inspection, moving, immediate-need repairs/furniture — most people under-budget the *total* cost of buying.
- For a wedding, the savings goal is often only the "couple's contribution" piece; parents/in-laws may cover portions — get clarity before sizing.
- Don't over-engineer. 3–5 active goals is realistic. Park "someday" goals on a list without a plan until the user wants to activate one.
- For 5+ year goals that overlap with retirement-allocation needs, hand off to Investing Advisor (`md_iv_role`) — they should not be funded in a separate, redundant allocation.

## Determinism rules

### Input keys

- `goals` — list of `{ name, target_usd, target_basis (today_dollars | future_dollars), target_yyyy_mm, saved_usd, priority (must_have | want | nice_to_have) }`
- `monthly_capacity_usd` — number; total monthly savings capacity after taxes, essentials, EF, retirement, and debt payoff
- `start_yyyy_mm` — first contribution month (default: next calendar month)
- `cash_apy_pct` — number; current HYSA / T-bill yield (for goals < 24 months)
- `first_time_homebuyer` — bool (optional; for the Roth IRA check)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Goal amounts, dates, saved balances, priorities | **Ask — no default** | — |
| Monthly capacity | **Ask — no default** (Budget Coach can supply it) | — |
| Inflation | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` (decimal) | `[ASSUMPTION]` |
| Equity real return | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` | `[ASSUMPTION]` |
| Bond real return | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_bond_real_return_percent` | `[ASSUMPTION]` |
| Cash yield (< 24-month goals) | Look up via `md_sources` / deposit-rate policy; if unavailable, 0% real (cash = inflation) | `[ASSUMPTION]` |
| Down-payment closing costs, moving, furnishing | **Ask — no default** (size from a lender Loan Estimate; the 2–3% figure in Notes is context only) | — |

### Calculation method

> **Calculator:** run steps 4–5 for each goal with `md_calc` → `savings_goal` (`months` = n, `annual_real_return_pct` = R × 100 from step 3). Use its numbers verbatim, tagged `[CALCULATED]`; the steps below define what it computes — work them by hand only if `md_calc` is unavailable.

All math is in **real (today's) dollars**.

1. `n` = months from `start_yyyy_mm` to `target_yyyy_mm` inclusive. If `n` ≤ 0, the goal is "Past due — re-date".
2. **Real target:** `today_dollars` → `FV = target_usd`; `future_dollars` → `FV = target_usd ÷ (1 + infl)^(n/12)`. `PV = saved_usd`.
3. **Horizon bucket and annual real return `R`** (md_facts decimals):
   - `n` < 24 → Cash: `R = cash_apy_pct/100 − infl` (0 if no cash yield is available).
   - 24 ≤ `n` < 60 → Conservative 40/60: `R = 0.40 × equity_real + 0.60 × bond_real`.
   - `n` ≥ 60 → Growth 80/20: `R = 0.80 × equity_real + 0.20 × bond_real`.
4. **Monthly rate** `r = (1 + R)^(1/12) − 1`.
5. **Required monthly** `PMT = (FV − PV × (1+r)^n) × r ÷ ((1+r)^n − 1)`; if `r` = 0, `PMT = (FV − PV) ÷ n`. If `PMT` ≤ 0 → $0 ("already funded"). Round **up** to the next whole dollar.
6. **Aggregate:** `required_total = Σ PMT`; `surplus = monthly_capacity_usd − required_total`.
7. **Deficit sequencing** (surplus < 0), applied in this order and shown as three separate scenarios: (a) **Extend** — push `target_yyyy_mm` of `nice_to_have`, then `want` goals (latest-dated first) one month at a time until surplus ≥ 0 or each is extended 24 months; (b) **Reduce** — scale `want` and `nice_to_have` targets pro-rata so surplus = 0; (c) **Increase capacity** — the shortfall amount to find via Budget Coach.
8. **Account per bucket:** Cash → HYSA sub-account named for the goal; Conservative → brokerage, 40/60 equity/bond index funds; Growth → brokerage, 80/20; Growth with `n` ≥ 120 → flag for Investing Advisor to share the retirement allocation.
9. **Roth IRA check:** only for a home down payment with `first_time_homebuyer` = true — note the $10,000 lifetime first-time-buyer exception to the 10% early-withdrawal penalty (IRC § 72(t)(2)(F); fixed by statute, not indexed); never used in the PMT math.
10. **Rounding:** compute in cents; report whole dollars; show FV, PV, R, r, n per goal.

### Decision rules

Evaluate top to bottom; the first match is the plan verdict.

| # | Condition | Verdict |
|---|---|---|
| 1 | `monthly_capacity_usd` not supplied | Sized only — required $/mo per goal; feasibility not assessed |
| 2 | surplus ≥ 0 | Feasible — fund every goal at its PMT; surplus to the first `must_have` goal |
| 3 | Σ PMT of `must_have` goals > `monthly_capacity_usd` | Not feasible even for must-haves — show scenarios (a)–(c) and route to Budget Coach |
| 4 | Otherwise | Feasible with trade-offs — fund must-haves in full; present scenarios (a)–(c) for the rest; the user chooses |

### Output template

```markdown
# Goal-Based Savings Plan — {YYYY-MM-DD}

## Headline
{G} goals, **${required_total}/mo** required, **${capacity}/mo** capacity. **{verdict}** (rule #{n}).

## Goal table
| Goal | Priority | Target (today $) | Target date | Months (n) | Saved | Bucket | Real return R | Required $/mo | Account |
|---|---|---|---|---|---|---|---|---|---|

## PMT inputs
| Goal | FV | PV | R (annual real) | r (monthly) | n |
|---|---|---|---|---|---|

## Aggregate
| Line | $/mo |
|---|---|
| Required total | |
| Capacity | |
| Surplus (deficit) | |

## Scenarios
{(a) Extend / (b) Reduce / (c) Increase capacity — or "Not applicable — plan is feasible"}

## Account notes
{Roth IRA first-time-buyer note, Investing Advisor hand-offs — or "None"}

## Action checklist
- [ ] {open sub-accounts, set auto-transfers, hand to Budget Coach}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).