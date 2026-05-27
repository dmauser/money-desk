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
3. **Layer in healthcare.** Pre-65 (FIRE-age to 65): add the annual ACA-after-subsidy or self-pay cost × 25–33 × (years pre-65 / planning years). For >10-year pre-65 gap, healthcare is often the single biggest line. Post-65: add Medicare + Medigap layer.
4. **Compute each FIRE flavor's target.**
   - **Lean FIRE** — at the spend the user gave you OR lean-FIRE convention ~$30–50k household; show both.
   - **Coast FIRE** — current portfolio compounded at the real return for (FI-age − current-age) years should equal the FIRE number. Solve for whether the user is *already* coast.
   - **Barista FIRE** — FIRE number reduced by the present value of part-time-income contribution (cite the haircut explicitly).
   - **Chubby FIRE** — 1.5× the lean target (loose convention; cite).
   - **Fat FIRE** — typically $5M+ household or ≥$200k/yr spend; cite the convention you're using.
5. **Compare to today's portfolio.** Show gap in absolute $ AND in years-of-current-savings-rate to close. Bridge to Savings-Rate Optimizer if the gap is meaningful.
6. **Stress-test the assumption stack.** State explicitly what would happen if real return is 1% lower than assumed (years-to-FI extends ~5–8 yr). State what happens if spend is 20% higher than estimated (FIRE number jumps 20%, NOT 4%).
7. **One next step.** Almost always: **Safe-Withdrawal Stress Test** to validate the chosen WR for the user's horizon.

## Output template

```
# FIRE number — {user's target FI age, today's age, horizon}

## Inputs (cite each as [USER-PROVIDED] or [ASSUMPTION: <value>])
- Target spend (today's $): ${X}/yr  [USER-PROVIDED]
- Healthcare pre-65: ${A}/yr  [...]
- Healthcare post-65: ${B}/yr  [...]
- Real return: {R}%  [...]

## Your FIRE number, three withdrawal rates
| Withdrawal rate | Multiplier | Portfolio target |
|---|---|---|
| 4% (Trinity baseline, 30y horizon)   | 25.0× | ${25 × X} |
| 3.5% (Kitces 'safer' for 40y+)       | 28.6× | ${28.6 × X} |
| 3.0% (defensive / 50y+ / SOR-averse) | 33.3× | ${33.3 × X} |

## FIRE flavor targets (at 4% WR — show 3.5% column too)
- **Lean FIRE** (${lean spend}/yr): ${target}
- **Coast FIRE**: you {are / are NOT} already coast — current ${P} compounds to ${P × (1+R)^n} by age {FI age}, vs target ${T}.
- **Barista FIRE** ({hours × wage}/yr part-time): ${reduced target}
- **Chubby FIRE** (~1.5× lean): ${...}
- **Fat FIRE** ({fat convention}): ${...}

## Healthcare cost layered in
- Pre-65 layer ({years} × ${A}/yr × {1/WR}): ${...}
- Post-65 layer: ${...}
- → Pre-65 healthcare alone adds {Z}% to your FIRE number.

## Gap analysis
- Today's portfolio (total, all buckets): ${P}
- Gap to 4% target: ${gap_4}
- Gap to 3.5% target: ${gap_35}
- At current ${savings_rate}/yr savings rate, the 4% gap closes in ~{years} years (real return {R}%).

## Sensitivity
- If real return is 1% lower than assumed: gap closes in ~{years + 5–8} years.
- If spend is 20% higher than estimated: FIRE number jumps to ${X × 1.20 × 25}.

## Recommended next step
**Run Safe-Withdrawal Stress Test in FIRE Planner** to validate {chosen WR} for a {horizon}-year horizon — the 4% rule was calibrated on 30-year horizons; longer needs lower.
```

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
