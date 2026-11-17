## Savings-Rate Optimizer

description: Show the user the savings-rate → years-to-FI curve (the Mr. Money Mustache table — savings rate is the dominant variable, dwarfing investment-return optimization), find the next achievable 5–10% in the user's actual budget, and route the budget-surgery work to Budget Coach. Output: the user's current point on the curve, the realistic next point, the year-impact of moving there, and the specific budget-surgery handoff.

## When to use

- "How can I FIRE faster?"
- "What's the biggest lever I have?"
- "Should I work harder on returns or save more?" (always: save more)
- After **FIRE Number Calculator** when the time-to-FI is longer than the user wants
- Annual FIRE plan tune-up

## Inputs needed

- **Current take-home pay** (post-tax, post-pre-tax-deductions; the number that hits checking).
- **Current monthly spending** (or take-home minus what's saved, if not tracked).
- **Current savings rate** (savings ÷ take-home, OR savings ÷ gross — be explicit which).
- **Top 5 spending categories** and rough monthly $ for each (housing, transport, food, healthcare, kids/school, lifestyle).
- **Income-side levers** the user has — raise possible / side income possible / spouse-income possible / job-change possible.
- **What the user has already tried and rejected** — to avoid suggesting it again.
- **Hard-no list** — kid's school, specific subscription, location, vehicle the user explicitly will not touch.

## Workflow

1. **Plot today's point on the curve.** Use the canonical MMM table: savings rate → years to FI assuming 5% real return and 4% WR (recompute it with the formula in Determinism rules step 3 when the user's assumptions differ).
   - 10% savings rate → ~51 years to FI
   - 25% → ~32 years
   - 40% → ~22 years
   - 50% → ~17 years
   - 65% → ~10.5 years
   - 75% → ~7 years
   - 80% → ~5.5 years
   Cite as: "Mr. Money Mustache, *The Shockingly Simple Math Behind Early Retirement*, 2012."
2. **Show the second derivative.** Going from 10% → 25% saves ~19 years. Going from 70% → 80% saves only ~2 years. Diminishing returns matter — match the user's expectation.
3. **Anchor on the biggest three line items.** Housing, transport, food typically = 60–75% of household spend. The next 5% almost always comes from one of these three, not from a $4 coffee.
4. **Income-side equally.** A $10k raise at 70% take-home + 100% saved = +$7k savings rate. A 1% lower fund fee = ~0.05% on a $500k portfolio = $250. Income > expense optimization for most users.
5. **Identify the realistic next-5% (and next-10%) moves.** Examples:
   - Refinance / restructure housing → see **Purchase Advisor / Refinance**.
   - Switch one car to used / kill the second car → **Purchase Advisor / Buy vs Lease**.
   - Renegotiate fixed subscriptions (insurance / phone / internet / streaming).
   - Cook more meals at home (price it from the user's food category, not a generic range).
   - HSA pre-funding (taxes saved + invested) — **Health & Medicare**.
   - Roth IRA back-fill (if not maxed) — **Retirement Planner**.
   - Side-income angle (1099 / second job / W-2 promotion path).
6. **Quantify each.** "Refi from 6.5% to 5.5% on $400k mortgage saves ~$300/mo = +5% savings rate at $5k/mo take-home = ~3 years off your FI date."
7. **Filter through the hard-no list.** Respect it; surface alternatives.
8. **Pick ONE move for this quarter.** Don't list 12; the user will do zero. Pick the one with the best $/effort ratio and route to the specialist that executes it.
9. **Re-anchor savings rate as the headline KPI.** "Track this monthly. Income changes, expense changes, life changes — savings rate is the single number that says whether you're on track."

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Latte myth applied wrong.** Yes, daily $5 spend adds up — but it adds up to ~1% savings rate, not "the difference between FIRE-at-45 and 65." Don't pretend it does.
- **Optimizing expense ratios before savings rate.** A 0.1% lower expense ratio is a footnote vs a 10% higher savings rate.
- **Income-side ignored.** The user can usually move income by more % than expense in a year.
- **12 moves at once.** Pick one. Land it. Then come back.
- **Counting employer 401(k) match as savings rate** — fine, but be consistent; don't double-count once it's in the contribution.

## Citations / sources

- **Mr. Money Mustache, *The Shockingly Simple Math Behind Early Retirement* (2012)** — the canonical savings-rate-to-FI table.
- Cite the assumptions made in the table (5% real return, 4% WR) explicitly; recompute if the user's assumptions differ materially.

## Disclaimer

The MMM curve is an *envelope*, not a prediction. Real-life FI timelines also include kids, divorce, layoffs, parental care, and luck. The point of the optimizer is to surface the biggest lever, not to schedule your retirement to the year.

## Next step

**Next step → Budget Coach:** "Execute {specific budget move} — current ${X}/mo, target ${Y}/mo, savings-rate impact +{Z}%."

## Determinism rules

### Input keys

- `take_home_monthly_usd` — number, net pay hitting checking per month
- `spending_monthly_usd` — number
- `top_categories` — list of `{ name, monthly_usd }` (housing, transport, food, healthcare, kids, lifestyle, …)
- `candidate_moves` — list of `{ name, category, monthly_saving_usd, effort_tier (1|2|3), source }` — savings quantified from the user's own numbers or quotes
- `income_levers` — list of `{ name, annual_take_home_increase_usd }` (raise, side income, spouse income, job change)
- `rejected_moves` — list of strings
- `hard_no` — list of strings
- `current_portfolio_usd` — number (0 = curve from zero, as in the canonical table)
- `expected_real_return_pct` — number
- `withdrawal_rate_pct` — number

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Take-home, spending | **Ask — no default** | — |
| Savings-rate basis | Take-home basis: `(take_home − spending) / take_home` (the MMM convention) | `[ASSUMPTION]` |
| Real return | 5% — the Mr. Money Mustache (2012) table convention | `[ASSUMPTION: MMM 2012]` |
| Withdrawal rate | `md_facts` → `behavioral_assumptions_safe_defaults.safe_withdrawal_rate_30yr_horizon_percent` (× 100) | `[ASSUMPTION]` |
| Current portfolio | 0 (matches the canonical table) | `[ASSUMPTION]` |
| Dollar value of any move | From the user's category $ or a quote; never a generic "typical" saving — **Ask** | — |
| Effort tier | 1 = one-time call / switch; 2 = recurring habit change; 3 = major life change (move, sell a car, job change) | `[ASSUMPTION]` |

### Calculation method

Real dollars, annual compounding, savings added at end of year.

1. `S = (take_home − spending) × 12`; `E = spending × 12`; `sr = S / (take_home × 12) × 100`.
2. **Years to FI:** target `T = E / (WR / 100)`; smallest integer `n` with `P(1 + r)^n + S((1 + r)^n − 1)/r ≥ T`; cap 100 → "> 100". Report also the unrounded value via `NPER(r, −S, −P, T)` to one decimal.
3. **The curve:** recompute years to FI at savings rates 10, 25, 40, 50, 65, 75, 80% with the same `r`, `WR`, `P = 0` (this reproduces the MMM table when `r = 5%`, `WR = 4%`; if the user's assumptions differ, label the column "your assumptions").
4. **+5 pp / +10 pp:** new `S' = S + take_home × 12 × Δ/100`, `E' = E − take_home × 12 × Δ/100`; `years_saved = n − n'`.
5. **Each candidate move** (excluding `rejected_moves` and anything matching `hard_no`): `Δsr = monthly_saving / take_home × 100`; `years_saved` via step 4 with the move's dollars (expense moves lower `E` too; income moves raise `S` only). `score = annual $ saving / effort_tier`.
6. **Category shares:** `share = category monthly / spending × 100` for the top three by $.
7. Rounding: cents internally; whole dollars; savings rate to one decimal; years to one decimal.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `take_home ≤ spending` | No FI path yet — route to **Cashflow Review** in Budget Coach |
| 2 | No quantified candidate move or income lever | Ask the user to price one move in each of the top three categories; no pick |
| 3 | `sr ≥ 65` and best move saves < 1.0 year | Diminishing returns — recommend the highest-score move but say lifestyle trade-off may not be worth it |
| 4 | Otherwise | The single highest-`score` move; tie → larger `years_saved` → lower effort tier → name A–Z |

### Output template

```markdown
# Savings-rate optimizer — where's your next 5%?

## Headline
Savings rate **{sr}%** → about **{n} years** to FI. Next move: **{move}** = +{Δsr} pp = **{years_saved} years** sooner.

## Today's snapshot
| Item | Value | Tag |
|---|---|---|
| Take-home / mo | | [USER-PROVIDED] |
| Spending / mo | | [USER-PROVIDED] |
| Savings rate (take-home basis) | | |
| Real return / WR used | | |

## The curve
| Savings rate | Years to FI ({r}% real, {WR}% WR) |
|---|---|
| 10% | |
| 25% | |
| 40% | |
| 50% | |
| 65% | |
| 75% | |
| 80% | |

+5 pp saves {x} years; +10 pp saves {y} years.

## Where the next 5% lives
| Category | $/mo | Share of spend |
|---|---|---|

## Candidate moves
| Move | $/mo | +pp savings rate | Years saved | Effort tier | Score | Excluded? |
|---|---|---|---|---|---|---|

## Realistic next move (one)
**{move}** — rule #{k}.

## Hard-no list respected
{excluded items and the alternative angle — or "None given"}

## Recommended next step
{ONE hand-off}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
