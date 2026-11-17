## FIRE Number Calculator

description: Compute the user's FIRE *number* — the asset base at which their portfolio can plausibly cover their target annual spend indefinitely. Presents lean / coast / barista / chubby / fat targets side-by-side. Layers in healthcare honestly (pre-65 ACA + post-65 Medicare). Shows the number at three withdrawal rates (3% / 3.5% / 4%), not one. Surfaces what's missing vs assumed.

## When to use

- "What's my FIRE number?"
- "How much do I need to retire at 45?"
- "Is $1.5M enough?"
- User wants to see lean / coast / chubby / fat side-by-side
- BEFORE running Withdrawal Order Optimizer or Pre-59½ Bridge Strategy (those need a target)

## Inputs needed

- **Target annual spend in retirement (today's $)** — what life costs you per year, not income. EXCLUDE the mortgage if it'll be paid off by FIRE; INCLUDE healthcare honestly.
- **Current age** and **target FI age**.
- **Current portfolio by tax bucket:** taxable / Traditional 401(k) + IRA / Roth / HSA / cash.
- **Annual healthcare cost assumption pre-65** (USER-PROVIDED — if you don't know, run Pre-65 Healthcare Plan first).
- **Annual healthcare cost assumption post-65** (USER-PROVIDED — Medicare + Medigap + Part D typically $5–10k/person/yr in today's $; cite [USER-PROVIDED] or [ASSUMPTION: <value>]).
- **Expected real return** (USER-PROVIDED — common range 3–5%; YOUR view).
- **Optional: post-FI part-time income expectation** (barista FIRE inputs).
- **Optional: Social Security claiming-age PIA estimate** (from ssa.gov; if you'd rather plan without it, set to $0).

## Workflow

1. **Anchor on annual spend.** This is THE driver. If the user says "I want $80k/yr," confirm: today's dollars, post-tax, post-mortgage-if-paid-off, includes-healthcare-or-not.
2. **Compute the three multipliers side-by-side.** Show 25× (4% WR), 28.6× (3.5% WR), 33.3× (3% WR). The "right" number depends on horizon — 30+ years argues for ≥28.6×.
3. **Layer in healthcare.** Pre-65 (FIRE-age to 65): add the pre-65 cost above the post-65 cost as an annuity over the years to 65 (Determinism rules step 3). For >10-year pre-65 gap, healthcare is often the single biggest line. Post-65: add the Medicare + Medigap layer at the WR multiple.
4. **Compute each FIRE flavor's target.**
   - **Lean FIRE** — at the user's lean spend (`lean_annual_spend`); not applicable if none given.
   - **Coast FIRE** — current portfolio compounded at the real return, with no further contributions, until normal retirement age (default 65, not the early FI age) should equal the FIRE number. Solve for whether the user is *already* coast.
   - **Barista FIRE** — FIRE number reduced by the present value of part-time income over `part_time_years` (cite the haircut explicitly).
   - **Chubby FIRE** — 1.5× the lean target (loose convention; cite).
   - **Fat FIRE** — typically $5M+ household or ≥$200k/yr spend; cite the convention you're using.
5. **Compare to today's portfolio.** Show gap in absolute $ AND in years-of-current-savings-rate to close. Bridge to Savings-Rate Optimizer if the gap is meaningful.
6. **Stress-test the assumption stack.** State explicitly what would happen if real return is 1% lower than assumed (recompute years-to-FI). State what happens if spend is 20% higher than estimated (FIRE number jumps 20%, NOT 4%).
7. **One next step.** Almost always: **Safe-Withdrawal Stress Test** to validate the chosen WR for the user's horizon.

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Ignoring healthcare** — pre-65 ACA without subsidies can be $20–30k/yr for a family. That's $500k–$1M added to the FIRE number.
- **Using gross income, not actual spend** — "I make $150k so I need $150k in retirement" is wrong; back into actual spend.
- **Assuming mortgage will be paid off when it won't** — keep the line item or shorten the timeline.
- **Forgetting taxes on Traditional withdrawals** — $1M in Traditional ≠ $1M of spend. Adjust by expected effective rate or model in Withdrawal Order Optimizer.
- **Single-WR thinking** — "the 4% rule says…" is shorthand, not a plan. Always present the range.

## Citations / sources

- **Bengen 1994** — origin of the 4% rule.
- **Trinity Study 1998 / 2011 update** — 30-year survival rates by WR.
- **Kitces** on horizon-adjusted SWR (longer horizons need lower WR; sequence risk drives the haircut).
- 2026 ACA FPL multiples / subsidy cliffs → `md_facts` (cite [HHS FPL 2026]).
- 2026 Medicare premiums / IRMAA → `md_facts` (cite [CMS Medicare 2026]).

## Disclaimer

A target number is not a plan. The actual portfolio that supports the number depends on allocation (Investing Advisor), drawdown sequence (Withdrawal Order Optimizer), and tax mechanics (Tax Planner). Always pair this with at minimum **Safe-Withdrawal Stress Test** before treating any number as "the number."

## Next step

**Next step → FIRE Planner:** "Run Safe-Withdrawal Stress Test on $X spend, Y-year horizon, Z% real return." And track progress vs the number → **Net Worth Snapshot** in **Net Worth & Goals**.

## Determinism rules

### Input keys

Names match the `md_fi_skill_fire_number_calculator` intake schema; extra keys follow.

- `current_age`, `target_fi_age`, `planning_to_age` — integers
- `target_annual_spend` — number, $ per year, today's dollars, post-tax
- `taxable_balance`, `trad_balance`, `roth_balance`, `hsa_balance`, `cash_balance` — numbers, $
- `annual_healthcare_pre65` — number, $ per year (household) from FI age to 65
- `annual_healthcare_post65` — number, $ per year (household) from 65
- `expected_real_return_pct` — number
- `ss_monthly_estimate` — number, $ per month at claim age, today's dollars (0 = plan without SS)
- `part_time_income_annual` — number, $ per year after FI (0 = none)
- `spend_includes_healthcare` — boolean; does `target_annual_spend` already include healthcare?
- `lean_annual_spend` — number, optional; the user's bare-bones spend
- `ss_claim_age` — integer 62–70 (needed when `ss_monthly_estimate > 0`)
- `part_time_years` — integer (needed when `part_time_income_annual > 0`)
- `annual_savings_usd` — number, $ saved per year until FI
- `coast_retirement_age` — integer, optional; the normal retirement age used for the Coast FIRE test (default 65)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ages, spend, healthcare pre/post-65, real return | **Ask — no default** (intake requires them) | — |
| `spend_includes_healthcare` | **Ask — no default** | — |
| Buckets, SS, part-time income | 0 | `[USER-PROVIDED]` / `[ASSUMPTION: 0]` |
| `ss_claim_age`, `part_time_years` (when the related income > 0) | **Ask — no default** | — |
| Annual savings | **Ask — no default**; without it, years-to-close is "Not applicable" | — |
| Withdrawal-rate grid | 4.0% / 3.5% / 3.0% (fixed); 4.0% is `md_facts` → `behavioral_assumptions_safe_defaults.safe_withdrawal_rate_30yr_horizon` | `[ASSUMPTION]` |
| Chubby multiple | 1.5 × lean (community convention) | `[ASSUMPTION]` |
| Normal retirement age for Coast FIRE (`coast_retirement_age`) | 65 (community convention; same rule as the FIRE flavor classifier) | `[ASSUMPTION]` |
| Fat-FIRE spend floor | $200,000 / yr (community convention) | `[ASSUMPTION]` |

### Calculation method

> **Calculator:** run steps 1–8 and both Decision-rule tables with `md_calc` → `fire_number` (params = the Input keys above). Use its numbers verbatim, tagged `[CALCULATED]`; the steps below define what it computes — work them by hand only if `md_calc` is unavailable.

Real dollars, annual compounding, `r = expected_real_return_pct / 100`, savings added at end of year.

1. **Multipliers:** `M(WR) = 100 / WR` → 25.0, 28.571…, 33.333… (use full precision; display one decimal).
2. **Non-healthcare spend:** `core = target_annual_spend − annual_healthcare_pre65` if `spend_includes_healthcare` and `target_fi_age < 65`; `core = target_annual_spend − annual_healthcare_post65` if it includes healthcare and `target_fi_age ≥ 65`; else `core = target_annual_spend`.
3. **Layers** for each WR:
   - Core: `core × M`.
   - Post-65 healthcare: `annual_healthcare_post65 × M`.
   - Pre-65 extra: `n = max(0, 65 − target_fi_age)`; `(annual_healthcare_pre65 − annual_healthcare_post65) × AF(r, n)` where `AF(r, n) = (1 − (1 + r)^−n) / r` (= `n` if `r = 0`); floor 0.
   - `FIRE(WR) = core layer + post-65 layer + pre-65 layer`. Healthcare share = `(post-65 + pre-65 layers) / FIRE × 100`.
4. **SS-adjusted variant** (only if `ss_monthly_estimate > 0`): subtract `ss_monthly_estimate × 12 × M / (1 + r)^(ss_claim_age − target_fi_age)` (exponent floor 0). The headline uses the un-adjusted number.
5. **Flavors** (at each WR):
   - Lean: `lean_annual_spend × M` + healthcare layers; "Not applicable — no lean spend provided" if missing.
   - Chubby: `1.5 × lean target`; not applicable if lean missing.
   - Fat: `max(target_annual_spend, 200000) × M`.
   - Barista: `FIRE(WR) − part_time_income_annual × AF(r, part_time_years)`; not applicable if part-time income is 0.
   - Coast: `coast_needed_today = FIRE(headline WR) / (1 + r)^(coast_retirement_age − current_age)` (not `target_fi_age`: Coast means no more saving and retiring at a normal age); coast = `P ≥ coast_needed_today`, where `P = Σ buckets`.
6. **Gap:** `gap(WR) = FIRE(WR) − P` (≤ 0 = reached).
7. **Years to close** (needs `annual_savings_usd`): smallest integer `n ≥ 0` with `P × (1 + r)^n + S × ((1 + r)^n − 1) / r ≥ FIRE` (`S × n` if `r = 0`); cap 60 → "> 60 years".
8. **Sensitivity:** years to close at `r − 1 pp`; FIRE number with spend × 1.20 (all layers recomputed).
9. Rounding: cents internally; whole dollars; years as integers.

### Decision rules

**A. Headline withdrawal rate** by horizon `H = planning_to_age − target_fi_age` — first match wins.

| # | Condition | Headline WR |
|---|---|---|
| 1 | `H ≤ 30` | 4.0% |
| 2 | `31 ≤ H ≤ 49` | 3.5% |
| 3 | Otherwise (`H ≥ 50`) | 3.0% |

**B. Status** — first match wins.

| # | Condition | Status |
|---|---|---|
| 1 | `gap(headline WR) ≤ 0` | FI reached at the headline WR |
| 2 | Coast = true | Coast FI — current portfolio compounds to the target by `coast_retirement_age` without new savings |
| 3 | Years to close ≤ `target_fi_age − current_age` | On pace for the target FI age |
| 4 | Otherwise | Behind pace — route to Savings-Rate Optimizer |

### Output template

```markdown
# FIRE number — FI at {target_fi_age} (today {current_age}), {H}-year horizon

## Headline
**${FIRE_headline}** at a **{WR}%** withdrawal rate (rule A#{n}). Status: **{rule B status}**.

## Inputs
| Input | Value | Tag |
|---|---|---|

## Your FIRE number, three withdrawal rates
| Withdrawal rate | Multiplier | Core | Healthcare layers | Portfolio target |
|---|---|---|---|---|
| 4.0% (Trinity baseline, 30y) | 25.0× | | | |
| 3.5% (40y+) | 28.6× | | | |
| 3.0% (50y+ / defensive) | 33.3× | | | |

## FIRE flavor targets
| Flavor | Annual spend basis | Target @ 4.0% | Target @ 3.5% | Notes |
|---|---|---|---|---|
| Lean | | | | |
| Coast | | | | {are / are not} coast — need ${coast_needed_today} today |
| Barista | | | | |
| Chubby | | | | |
| Fat | | | | |

## Healthcare layered in
| Layer | Amount @ headline WR |
|---|---|
| Post-65 | |
| Pre-65 extra ({n} years) | |
| Share of FIRE number | {Z}% |

## Social Security variant
{SS-adjusted number — or "Not applicable — planning without SS"}

## Gap analysis
| WR | Target | Today's portfolio | Gap | Years to close |
|---|---|---|---|---|

## Sensitivity
| Scenario | Result |
|---|---|
| Real return −1 pp | years to close {x} |
| Spend +20% | FIRE number ${y} |

## Recommended next step
Run **Safe-Withdrawal Stress Test** in FIRE Planner to validate {WR}% for a {H}-year horizon.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
