## FIRE Flavor Classifier

description: Help the user decide which flavor of FIRE actually fits — lean / coast / barista / chubby / fat. The flavor is decided BOTH by numbers (savings rate, target spend, current portfolio, FI age target) AND by lifestyle priorities (frugality tolerance, career attachment, geographic flexibility, spouse alignment). Output: a recommended flavor, the specific portfolio number that goes with it, the lifestyle trade-offs, and the FIRE-flavor-specific failure modes.

## When to use

- "What kind of FIRE am I really targeting?"
- "Lean FIRE vs coast FIRE — which fits me?"
- "I'm not sure I want to fully retire — barista or coast?"
- "We're a high-income couple; is fat FIRE realistic in 10 years?"
- Before committing to a multi-year savings + spending plan

## Inputs needed

- **Current age** and **household structure** (single / couple / kids).
- **Current household income** (gross) and **current household spend** (today's $).
- **Current savings rate** (% of gross saved per year).
- **Portfolio total + by tax bucket** (taxable / Trad / Roth / HSA).
- **Hard-floor target spend in retirement** — the absolute MINIMUM you'd accept if forced.
- **Comfortable target spend in retirement** — what you'd actually want.
- **Earliest age you'd consider quitting full-time work**.
- **Lifestyle priorities** (rank): geographic flexibility / kids' college / international travel / hobbies-with-fixed-cost / financial security buffer / inheritance to leave.
- **Career attachment** — do you actively dislike work? Love it? Neutral?
- **Spouse alignment** (if applicable) — same target? Different timeline? Hasn't been discussed?

## Workflow

1. **Run the 5 flavor definitions cleanly.** Each has a numerical convention AND a lifestyle stance:
   - **Lean FIRE** — ~$25–50k/yr household spend; tight budget; high geographic flexibility usually required; very high savings rate (50–70%); FI in ~10–15 years from a normal income; identity-tight ("we live small").
   - **Coast FIRE** — current portfolio is large enough that, without ANY more contributions, it'll compound to a normal-retirement number by normal retirement age (default 65); user keeps working but only to cover current expenses; flexibility to switch to lower-paid / fulfilling work.
   - **Barista FIRE** — full FI not yet hit; user covers ~50% of expenses with portfolio WR and 50% with part-time work that often provides healthcare; typical post-50, popular pre-Medicare.
   - **Chubby FIRE** — ~1.5× lean; comfortable middle-class retirement spend (typically $80–140k/yr household; this skill's naming band is $50,001–$199,999); moderate frugality not extreme; the "we don't want to count every dollar" version.
   - **Fat FIRE** — $200k+/yr spend; $5M+ household; typically high-income professionals or business exits; geographic flexibility optional; lifestyle preserved or expanded post-retirement.
2. **Match the user's numbers to each flavor.** Show: at current savings rate, when does the user hit each flavor's target?
3. **Match the user's lifestyle to each flavor.** Lean and coast require *very different* personalities. Barista requires comfort with part-time identity. Fat requires the income to get there.
4. **Surface the FOUR flavor-specific failure modes:**
   - **Lean FIRE failure:** lifestyle inflation creep blowing the tight budget; healthcare cost surprise; identity collapse if the frugality identity erodes.
   - **Coast FIRE failure:** career flexibility never actually materializes (user keeps grinding by default); investment under-performance ruins the compounding assumption; spouse moves at different pace.
   - **Barista FIRE failure:** part-time work dries up (recession, age discrimination); employer-provided health insurance disappears; income doesn't actually cover the half it was supposed to.
   - **Chubby / Fat FIRE failure:** lifestyle inflation between target-set and FIRE-date (the goal-post moves); sequence risk hits a larger spend so the absolute $ pain is bigger; high spend leaves no buffer.
5. **Spouse alignment check.** If the household is two people, get an explicit answer to "have you both said the same target out loud in the last 90 days?" If no → route to **Behavioral Coach / Couples Money Alignment** before any plan.
6. **Recommend ONE flavor** as the working target, with the path: "you're targeting X; your number is $Y; this requires Z years at current savings rate (or A years if you cut spending W%)."
7. **Name what changes if you're wrong.** If the user picks lean but actually wants chubby, surface it: "your spending might creep — re-run this skill annually."

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Picking lean by numbers alone.** Lean FIRE is a lifestyle choice as much as a math one. If frugality isn't a positive value, lean will crack.
- **Confusing coast and barista.** Coast = working same job, just no longer saving. Barista = working LESS, often for healthcare.
- **"Fat FIRE in 5 years" with a $150k income.** Math doesn't usually work; surface the gap honestly.
- **Single-pick spouse.** If two people are on different flavors, the household is on neither.
- **Treating flavor as permanent.** People shift flavors as life changes. Re-run this skill at major life events.

## Citations / sources

- Flavor definitions are convention-based, not regulatory; cite as "FIRE community convention" — Mr. Money Mustache (lean), Mad Fientist (barista / coast), ChooseFI podcast (general), r/financialindependence (fat). Avoid quoting specific founders' exact thresholds without checking.
- Mr. Money Mustache savings-rate-to-FI table — *The Shockingly Simple Math Behind Early Retirement* (2012).

## Disclaimer

FIRE flavor is a working hypothesis, not a contract. Most users shift flavors at least once across the journey. Re-run annually, after any income / family / housing change, and at every 5-year-from-target checkpoint.

## Next step

**Next step → FIRE Planner:** "Run FIRE Number Calculator for {recommended flavor}, ${target spend}/yr, target FI age {E}."

## Determinism rules

### Input keys

- `current_age` — integer
- `household` — `single` | `couple`; `kids_count` — integer
- `gross_income_annual_usd` — number
- `current_spend_annual_usd` — number, today's dollars
- `savings_rate_pct` — number, % of gross saved
- `taxable_balance`, `trad_balance`, `roth_balance`, `hsa_balance`, `cash_balance` — numbers, $
- `hard_floor_spend_annual_usd` — number, minimum acceptable retirement spend, today's dollars
- `comfortable_spend_annual_usd` — number, desired retirement spend, today's dollars
- `earliest_quit_age` — integer
- `planning_to_age` — integer
- `lifestyle_priorities` — ranked list from `geographic_flexibility`, `kids_college`, `international_travel`, `fixed_cost_hobbies`, `security_buffer`, `inheritance`
- `career_attachment` — `dislike` | `neutral` | `love`
- `spouse_alignment` — `same` | `different` | `unaddressed` | `not_applicable`
- `expected_real_return_pct` — number
- `part_time_income_annual_usd` — number (0 = none); `part_time_years` — integer
- `effective_tax_rate_pct` — number, for the "+20% income" path
- `coast_retirement_age` — integer, optional; the normal retirement age used for the Coast FIRE test (default 65)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Income, spend, savings rate, portfolio, floor and comfortable spend, quit age, planning age, real return | **Ask — no default** | — |
| Lifestyle priorities, career attachment, spouse alignment | **Ask — no default** | — |
| Withdrawal rate | Horizon rule shared with FIRE Number Calculator: `H = planning_to_age − earliest_quit_age`; H ≤ 30 → 4.0%, 31–49 → 3.5%, ≥ 50 → 3.0% | `[ASSUMPTION]` |
| Normal retirement age for Coast FIRE (`coast_retirement_age`) | 65 (community convention; same rule as FIRE Number Calculator) | `[ASSUMPTION]` |
| Spend bands for naming | Lean ≤ $50,000; Chubby $50,001–$199,999; Fat ≥ $200,000 (household, today's $; community convention) | `[ASSUMPTION]` |
| Chubby multiple | 1.5 × lean target | `[ASSUMPTION]` |
| Part-time income / years | 0 | `[ASSUMPTION: 0]` |
| Effective tax rate | **Ask — no default**; without it the "+20% income" line is "Not applicable" | — |

### Calculation method

Real dollars, annual compounding, `r = expected_real_return_pct / 100`, savings at end of year.

1. `P = Σ balances`; `S = gross_income_annual_usd × savings_rate_pct / 100`; `M = 100 / WR`; `quit_gap = earliest_quit_age − current_age`.
2. **Targets:** Lean `= hard_floor × M`; Comfortable `= comfortable × M`; Chubby `= 1.5 × Lean`; Fat `= max(comfortable, 200000) × M`; Barista `= Comfortable − part_time_income × AF(r, part_time_years)` with `AF = (1 − (1 + r)^−n)/r`.
3. **Coast:** `coast_need_today = Comfortable / (1 + r)^(coast_retirement_age − current_age)`; coast = `P ≥ coast_need_today`.
4. **Years to each target:** smallest integer `n` with `P(1 + r)^n + S((1 + r)^n − 1)/r ≥ target`; cap 60 → "> 60".
5. **Paths for the recommended flavor:** spend −10% (`S + 0.10 × current_spend`, target × 0.90); income +20% (`S + 0.20 × gross × (1 − effective_tax_rate/100)`).
6. **Lifestyle-fit stars:** start at 3 per flavor, apply each matching signal, clamp 1–5:
   - Lean: +1 `geographic_flexibility` in top 3; −1 `international_travel` or `fixed_cost_hobbies` in top 2; −1 `kids_college` in top 3.
   - Coast: +1 career `love` or `neutral`; −1 career `dislike`.
   - Barista: +1 career `neutral`/`dislike` and part-time income > 0; −1 part-time income = 0.
   - Chubby: +1 `security_buffer` in top 3.
   - Fat: +1 `inheritance` in top 3; −1 years to Fat > `quit_gap + 10`.
7. `spend_flavor(x)` = Lean / Chubby / Fat by the spend bands.
8. Rounding: whole dollars; years as integers.

### Decision rules

Evaluate top to bottom; the first match is the recommended flavor.

| # | Condition | Recommended flavor |
|---|---|---|
| 1 | `household = couple` and `spouse_alignment = unaddressed` | None yet — route to **Couples Money Alignment** in Behavioral Coach |
| 2 | `P ≥ Comfortable` | Already FI — `spend_flavor(comfortable)` |
| 3 | Years to Comfortable ≤ `quit_gap` | `spend_flavor(comfortable)` |
| 4 | Coast = true and `career_attachment` ≠ `dislike` | Coast |
| 5 | Part-time income > 0 and years to Barista ≤ `quit_gap` | Barista |
| 6 | Years to Lean ≤ `quit_gap` and Lean stars ≥ 3 | Lean |
| 7 | Otherwise | `spend_flavor(comfortable)` with the longer timeline — route to **Savings-Rate Optimizer** |

### Output template

```markdown
# FIRE Flavor recommendation

## Headline
Recommended: **{flavor}** (rule #{k}). Number: **${T}** at {WR}%; gap ${T − P}; ~{n} years at current savings.

## Your inputs
| Input | Value | Tag |
|---|---|---|

## How each flavor fits you
| Flavor | Annual spend | Target portfolio | Years at current savings | Lifestyle fit (stars) |
|---|---|---|---|---|
| Lean | | | | |
| Coast | n/a (target at {coast_retirement_age}) | need ${coast_need_today} today | {coast now / not yet} | |
| Barista | | | | |
| Chubby | | | | |
| Fat | | | | |

## Path
| Scenario | Years to close |
|---|---|
| Current savings rate | |
| Cut spend 10% | |
| Income +20% | {or "Not applicable — no tax rate given"} |

## Flavor-specific failure modes ({flavor})
- {failure mode + guard rail}
- {failure mode + guard rail}

## If you're wrong about the flavor
{what to watch; re-run annually and at income / family / housing changes}

## Recommended next step
{ONE hand-off}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
