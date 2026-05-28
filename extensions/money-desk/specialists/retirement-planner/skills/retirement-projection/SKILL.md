# Retirement Projection

description: Project savings trajectory to a target retirement age using user inputs (current balances, contribution rate, expected return, inflation, target spend). Outputs success probability, gap-to-goal, and the levers that close the gap. Use for "am I on track?" questions and for FIRE planning.

## When to use

- Annual checkpoint.
- Career change / income jump (recalibrate).
- FIRE feasibility check.
- Pre-retirement (within 5–10 years) — high precision needed.

## Inputs needed

- Current age, target retirement age (or "withdrawal start" age).
- Current retirement balances by account type (401k trad/Roth, IRA, taxable bridge, HSA).
- Annual contributions (employee + employer match) by account type.
- Expected annual return (real or nominal — be explicit).
- Inflation assumption.
- Target annual spend in retirement (today's dollars).
- Other income in retirement: Social Security estimate, pension, rental, part-time.
- Life expectancy planning age (often 90–95 for safety).

## Workflow

1. **Decide nominal vs real.** Prefer modeling in real (today's) dollars so the target spend is intuitive. Document the assumption.
2. **Forecast accumulation.** For each year from now to target age:
   - Apply annual contribution (with COLA assumption).
   - Apply employer match.
   - Apply expected real return.
   - Account-by-account so tax treatment is preserved.
3. **Forecast decumulation.** From retirement age to life-expectancy:
   - Subtract annual spend.
   - Add Social Security (start age modeled — 62 / 67 / 70).
   - Apply real return.
   - Run through tax-aware withdrawal sequence (see `withdrawal_strategy`).
4. **Result metrics:**
   - Terminal balance at planning age (positive = surplus, negative = shortfall).
   - Year of depletion (if any).
   - "Coast FIRE" age — when, if contributions stopped today, the existing balance compounds to the target.
   - "FIRE number" — 25× annual spend (4% rule) or 30× for added safety.
5. **Sensitivity sweep.** Re-run with ±1% real return and ±10% spend. Show range, not just a point estimate.
6. **Gap-closing levers.** If under-funded, quantify what closes it:
   - +X% contribution rate.
   - +Y years working.
   - −Z% spend.
   - Higher allocation to equities (with the risk caveat).
7. **Stress test** with a single 30% drawdown at year 1 of retirement (sequence-of-returns risk).

## Required citations

- All assumptions block (return, inflation, COLA, spend, SS, lifespan) appears at the top, dated.
- Source for SS estimate cited (ssa.gov MyStatement screenshot or stated estimate).
- Tax-bracket assumptions cited to current law.

## Deliverable shape

- Markdown report `./reports/retirement-planner/retirement-projection-<YYYYMMDD>.md`:
  - **Headline** — On track / behind by $X / ahead by $X.
  - **Assumptions block** — every input.
  - **Trajectory chart description** — accumulation curve, depletion curve, terminal balance.
  - **Sensitivity table** — terminal balance under ±1% real return × ±10% spend.
  - **Gap-closing levers** — quantified.
  - **Stress test** — Year-1 30% drop scenario outcome.

## Notes

- Linear projections are wrong. Sensitivity ranges are the honest output.
- Monte Carlo would be ideal — note if user wants probabilistic and offer that as a follow-up (out of scope for this skill).
- "Analysis only. Not investment or retirement advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).