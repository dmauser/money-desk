# Social Security Review

description: Project Social Security benefits at 62 / 67 (FRA) / 70 claim ages, model spousal & survivor strategies, and estimate breakeven ages. Helps the user choose a claiming age. Use as the user approaches 60 or runs retirement projections.

## When to use

- User is within ~5–10 years of eligibility.
- Couple is coordinating two earner records.
- A surviving spouse is deciding when to claim.
- Recheck if Congress changes SS rules (rare but possible).

## Inputs needed

- Most recent SSA statement (ssa.gov → "My Social Security") — provides PIA estimate.
- Birth date(s).
- Filing status now and projected.
- Other retirement income (drives the SS taxability calculation).
- Health & longevity expectations.
- Spouse's record if married (their PIA, age).

## Workflow

1. **Identify FRA** (Full Retirement Age) — 66y to 67y depending on birth year.
2. **Compute the three benefit levels:**
   - Age 62: ~70–75% of FRA benefit (permanent reduction).
   - FRA: 100%.
   - Age 70: ~124–132% (delayed retirement credits, 8%/yr after FRA).
3. **Breakeven analysis.** Cumulative benefits at age 62 vs FRA vs 70:
   - 62 vs FRA breakeven: typically late 70s.
   - FRA vs 70 breakeven: typically early-to-mid 80s.
   - User living past breakeven → delaying wins.
4. **Spousal & survivor.**
   - Spousal benefit: up to 50% of higher earner's PIA at FRA.
   - Survivor benefit: 100% of deceased's actual benefit (so delaying boosts survivor benefit).
   - General couple rule: higher earner delays to 70, lower earner claims earlier — maximizes survivor.
5. **Taxability of SS.** Up to 85% of SS is taxable above provisional-income thresholds. Coordinate with Withdrawal Strategy to avoid pushing SS into the 85%-taxable zone unnecessarily.
6. **Working while collecting.** Pre-FRA earnings test reduces benefits above an annual cap (withheld amounts are restored at FRA via recalc). If user plans to keep working, claiming early may not give them as much as they think.
7. **Recommendation.** A specific claiming age per person with rationale tied to longevity expectation, marital status, and other income.

## Required citations

- PIA estimate cites the SSA statement date.
- Breakeven math cites the assumed COLA and longevity.
- Spousal / survivor rules cite SSA POMS / publications.

## Deliverable shape

- Markdown report `./reports/retirement-planner/social-security-review-<YYYYMMDD>.md`:
  - **Claim-age table** — 62 / FRA / 70 with monthly + cumulative benefit at age 85 / 90 / 95.
  - **Couple coordination** — recommended ages for higher and lower earner.
  - **Tax interaction note** — how the claim age interacts with provisional income and bracket.
  - **Recommended claim age** with explicit rationale.

## Notes

- Don't claim early just because "you might die" — most retirees outlive 62-vs-FRA breakeven, especially women.
- "File and Suspend" and "Restricted Application" strategies were largely eliminated by the 2015 BBA. Only those born before 1/2/1954 may still use restricted application — rare today.
- COLA is applied to the PIA from age 62 forward regardless of when you claim — delaying does not "miss" COLAs.
- "Not professional advice. SSA.gov is the authoritative source."
