# Retirement Projection

description: Project savings trajectory to a target retirement age using user inputs (current balances, contribution rate, expected return, inflation, target spend). Outputs the balance at retirement, the age the money runs out (if it does), the gap to goal, a sensitivity grid, a stress test, and the levers that close the gap. Deterministic — it does not compute a success probability. Use for "am I on track?" questions and for FIRE planning.

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

1. **Model in real (today's) dollars** so the target spend is intuitive. Document the assumption.
2. **Forecast accumulation.** For each year from now to target age:
   - Apply annual contribution (flat in real terms).
   - Employer match is already inside `annual_contribution`.
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
7. **Stress test** with a single −30% real return in year 1 of retirement (sequence-of-returns risk).

## Required citations

- All assumptions block (return, inflation, COLA, spend, SS, lifespan) appears at the top, dated.
- Source for SS estimate cited (ssa.gov MyStatement screenshot or stated estimate).
- Tax-bracket assumptions cited to current law.

## Deliverable shape

- Markdown report `./money-desk/retirement-planner/retirement-projection-<YYYYMMDD>.md`:
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

## Determinism rules

### Input keys

Names match the `md_rp_skill_retirement_projection` intake schema; extra keys follow.

- `current_age` — integer
- `target_retire_age` — integer
- `planning_age` — integer, age the plan must last to
- `trad_401k_balance`, `roth_balance`, `trad_ira_balance`, `taxable_balance`, `hsa_balance` — numbers, $ today
- `annual_contribution` — number, $ per year incl. employer match, all accounts, today's dollars
- `target_annual_spend` — number, $ per year in retirement, today's dollars, pre-tax equivalent
- `ss_monthly_estimate` — number, $ per month at claim age, today's dollars (0 = leave SS out)
- `expected_real_return_pct` — number, real (after-inflation) annual return
- `ss_claim_age` — integer, 62–70
- `other_income_annual_usd` — number, pension / rental / part-time in retirement, today's dollars
- `other_income_start_age`, `other_income_end_age` — integers

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ages, target spend, real return | **Ask — no default** (intake requires them) | — |
| Account balances, contributions | 0 for any bucket left blank | `[USER-PROVIDED]` / `[ASSUMPTION: 0]` |
| SS claim age (when `ss_monthly_estimate > 0`) | **Ask — no default** | — |
| Contribution growth | Flat in real terms (rises with inflation only) | `[ASSUMPTION]` |
| Inflation (only to show nominal equivalents) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_rate` (stored as a fraction — × 100) | `[ASSUMPTION]` |
| Taxes | None modelled — `target_annual_spend` is the pre-tax equivalent | `[ASSUMPTION]` |
| Other income | 0 | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** run steps 1–9 with `md_calc` → `retirement_projection` (params = the Input keys above; `expected_real_return_pct` as a percent). Use its numbers verbatim, tagged `[CALCULATED]`; the steps below define what it computes — work them by hand only if `md_calc` is unavailable.

All amounts are **real (today's) dollars**, **annual compounding**, `r = expected_real_return_pct / 100`. Contributions and withdrawals occur at **end of year**. One pooled balance (accounts are summed; per-account split is shown only at retirement, each grown at `r`).

1. `B₀ = Σ balances`. For each age `a` from `current_age` to `target_retire_age − 1`: `B ← B × (1 + r) + annual_contribution`. `B_ret` = balance at `target_retire_age`.
2. **Need** at age `a ≥ target_retire_age`: `need_a = target_annual_spend − (ss_monthly_estimate × 12 if a ≥ ss_claim_age) − (other income if within its ages)`, floor 0.
3. **Decumulation** for `a` = `target_retire_age` … `planning_age − 1`: `B ← B × (1 + r) − need_a`. Depletion age = first age where `B < 0`; set `B = 0` thereafter. Terminal balance = `B` at `planning_age`.
4. **Required at retirement:** `Req = Σ need_a / (1 + r)^(a − target_retire_age + 1)` over the decumulation years. `gap = Req − B_ret` (positive = shortfall).
5. **FIRE number:** `25 × target_annual_spend` and `30 × target_annual_spend` (gross of SS, as a cross-check only).
6. **Coast check:** coast if `B₀ × (1 + r)^(target_retire_age − current_age) ≥ Req`. Coast age = the earliest age `c ≥ current_age` such that the balance at `c` (with contributions to `c`) × `(1 + r)^(target_retire_age − c) ≥ Req`; "none before retirement" if no such `c`.
7. **Sensitivity:** rerun steps 1–3 for `r ∈ {r − 1 pp, r, r + 1 pp}` × spend `∈ {−10%, 0, +10%}` → 3 × 3 terminal-balance grid.
8. **Stress test (fixed path):** first decumulation year return = −30% real, then `r`; report terminal balance and depletion age.
9. **Gap-closing levers** (only if base terminal < 0), each solved alone, smallest value that makes base terminal ≥ 0: extra annual contribution (search in $100 steps, cap +$100,000), extra working years (integer, cap +15; contributions continue, decumulation starts later, planning age fixed), spend cut (whole percent, cap 50%). If the cap is hit, report "not closable by this lever alone".
10. **Success probability:** not computed — this is a deterministic projection; offer Monte Carlo as a separate follow-up.
11. Rounding: cents internally; whole dollars; ages as integers.

### Decision rules

Evaluate top to bottom; the first match is the headline.

| # | Condition | Headline |
|---|---|---|
| 1 | A required input is missing | No projection — list what's missing |
| 2 | Base terminal ≥ 0 and terminal at `r − 1 pp` ≥ 0 | **On track** — ahead by ${−gap} at retirement |
| 3 | Base terminal ≥ 0 and terminal at `r − 1 pp` < 0 | **On track, thin margin** — fails if returns are 1 pp lower |
| 4 | Base terminal < 0 and depletion age ≥ `planning_age − 5` | **Slightly behind** — short by ${gap}; smallest lever first |
| 5 | Otherwise | **Behind** — short by ${gap}; depletion at age {x} |

### Output template

```markdown
# Retirement Projection — {as_of_date}

## Headline
**{decision rule headline}** — projected ${B_ret} at {target_retire_age} vs ${Req} required (today's $).

## Assumptions
| Input | Value | Tag |
|---|---|---|

## Trajectory (selected ages, today's $)
| Age | Phase | Contribution / need | Balance end of year |
|---|---|---|---|

## Key metrics
| Metric | Value |
|---|---|
| Balance at retirement | |
| Required at retirement | |
| Gap (+ shortfall / − surplus) | |
| Terminal balance at {planning_age} | |
| Depletion age | |
| FIRE number 25× / 30× | |
| Coast status / coast age | |
| Success probability | Not applicable — deterministic projection |

## Sensitivity (terminal balance)
| Real return \ Spend | −10% | Base | +10% |
|---|---|---|---|
| r − 1 pp | | | |
| r | | | |
| r + 1 pp | | | |

## Gap-closing levers
| Lever | Amount needed |
|---|---|
{or "Not applicable — on track"}

## Stress test (−30% real in year 1 of retirement)
{terminal balance, depletion age}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
