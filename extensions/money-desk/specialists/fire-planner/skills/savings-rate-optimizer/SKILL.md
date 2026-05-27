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

1. **Plot today's point on the curve.** Use the canonical MMM table: savings rate → years to FI assuming 5% real return and 4% WR.
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
   - Cook 5 more meals at home per week (typical $300–600/mo).
   - HSA pre-funding (taxes saved + invested) — **Health & Medicare**.
   - Roth IRA back-fill (if not maxed) — **Retirement Planner**.
   - Side-income angle (1099 / second job / W-2 promotion path).
6. **Quantify each.** "Refi from 6.5% to 5.5% on $400k mortgage saves ~$300/mo = +5% savings rate at $5k/mo take-home = ~3 years off your FI date."
7. **Filter through the hard-no list.** Respect it; surface alternatives.
8. **Pick ONE move for this quarter.** Don't list 12; the user will do zero. Pick the one with the best $/effort ratio and route to the specialist that executes it.
9. **Re-anchor savings rate as the headline KPI.** "Track this monthly. Income changes, expense changes, life changes — savings rate is the single number that says whether you're on track."

## Output template

```
# Savings-rate optimizer — where's your next 5%?

## Today's snapshot
- Take-home: ${TH}/mo  [USER-PROVIDED]
- Spending: ${SP}/mo  [USER-PROVIDED]
- Savings rate: {sr}%
- → On the MMM table, you're at ~{years} years to FI assuming {R}% real return and {WR}% withdrawal.

## The curve (Mr. Money Mustache, 2012)
| Savings rate | Years to FI |
|--------------|-------------|
| 10%          | ~51         |
| 25%          | ~32         |
| 40%          | ~22         |
| 50%          | ~17         |
| 65%          | ~10.5       |
| 75%          | ~7          |
| 80%          | ~5.5        |

→ Moving from your {sr}% to {sr+5}% saves about {N} years. From {sr}% to {sr+10}% saves ~{2N} years.

## Where the next 5% lives in YOUR budget

Top three categories (where the next 5% almost always is):
- **Housing** (${H}/mo, {h}%): {specific moves — refinance / right-size / location flex}
- **Transport** (${T}/mo, {t}%): {specific moves}
- **Food** (${F}/mo, {f}%): {specific moves}

Next tier:
- **Insurance bundle review:** typically saves $50–200/mo. Route to **Property & Casualty**.
- **HSA pre-funding** (if HDHP-eligible and not maxed): tax savings + invested = real money. Route to **Health & Medicare**.
- **Income side:** {raise / side / spouse / job change} — quantify if the user named one.

## Realistic next move (one)
**{Specific move}**: ${monthly savings}/mo = +{X}% savings rate = ~{N} years off your FI date.

## Hard-no list respected
{What the user excluded, and the alternative angle for the same dollars.}

## Recommended next step
{ONE thing — usually: "Run **Budget Audit** in Budget Coach" to execute the move, OR "Run **Refinance / Mortgage Review** in Purchase Advisor" if housing is the lever, OR "Run **Contribution Optimizer** in Retirement Planner" if tax-advantaged space is unused.}
```

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
