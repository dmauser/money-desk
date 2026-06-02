## Withdrawal Order Optimizer

description: Sequence the drawdown of taxable / Traditional / Roth / HSA buckets to maximize after-tax sustainable spend across the FIRE horizon. NOT the traditional "brokerage → Trad → Roth" default — early FIRE'd households can fill low brackets with Roth conversions, capture 0% LTCG, and stretch the portfolio meaningfully (often +0.5%/yr sustainable WR). Binding constraints: ACA-MAGI pre-65, IRMAA post-65, Bengen failure horizons, RMD pressure starting at 73. Output: sequenced plan, the lever (MAGI / bracket-filling / RMD smoothing), the explicit handoff to Tax Planner for execution.

## When to use

- "What order should I withdraw from my accounts?"
- "Should I convert Traditional → Roth in early retirement?"
- "I want to fill the 12% bracket every year — what does that look like?"
- After **FIRE Number Calculator** and **Safe-Withdrawal Stress Test**
- Anyone post-FIRE with multiple tax buckets — the optimization is meaningful

## Inputs needed

- **Current age, FIRE age, planning-to age**.
- **Portfolio by bucket:** taxable (with cost basis), Trad 401(k)+IRA, Roth 401(k)+IRA (separate contributions vs earnings), HSA, cash.
- **Target annual spend (post-tax, today's $)**.
- **Spouse income post-FIRE** (any) — affects bracket-filling room.
- **Other income** (pension / real estate / SS at claim age).
- **ACA-MAGI ceiling** from **Pre-65 Healthcare Plan**.
- **Filing status** post-FIRE (single / MFJ / etc.).
- **State** — determines additional state-tax interaction with conversions / realizations.
- **Roth contributions accessible** (always penalty-free) vs Roth earnings (5y + 59.5).

## The mental model

There are FOUR independent levers:

1. **Bucket order** — which account funds the year's spend.
2. **Roth conversions** — voluntarily moving Trad → Roth at the year's marginal rate.
3. **Realized gains in taxable** — sell appreciated lots (0% LTCG bracket is a real opportunity).
4. **ACA-MAGI / IRMAA ceiling** — limits #2 and #3.

The "right" answer integrates all four. The naive "brokerage → Trad → Roth" default is usually wrong for early FIRE — it leaves the early low-income years' bracket-filling opportunity un-captured AND faces a giant Trad balance + RMD pressure at 73.

## Workflow

1. **Compute the early-FIRE bracket room.** With no W-2, the standard deduction + 10% + 12% brackets are large — for MFJ in 2026, ~$120k+ of taxable income at ≤12% federal. Plus 0% LTCG up to a similar ceiling for the bottom of the 12% bracket. This is the gift.
2. **Constrain by ACA-MAGI ceiling.** Conversions and realized gains both push MAGI up. The user's pre-65 healthcare plan sets the MAGI ceiling. Conversion + realization total must fit under it (or accept higher healthcare cost as the trade-off — explicitly).
3. **Sequence the years:**
   - **Years 1 to (59.5−FIRE age):** the bridge period. Spend from taxable + Roth contributions; do Roth conversions up to MAGI ceiling AND 12%-bracket ceiling.
   - **Years (59.5) to (73):** full account access. Continue conversion strategy if RMDs ahead loom large; otherwise default to lowest-tax bucket.
   - **Years 73+:** RMDs force Trad withdrawals. Less optimization room. Pre-emptive conversions during 59.5–72 are the lever to reduce RMD-driven over-withdrawal.
4. **Surface the RMD pressure point.** Project Trad balance at 73. If RMDs will exceed actual spend need, the user is being forced to take ordinary income they don't want — convert more, earlier.
5. **Layer HSA.** Reimburse against accumulated qualified medical receipts tax-free at any age. Roth-equivalent in retirement.
6. **Surface state-tax interaction.** Some states tax retirement income, some don't. Some tax Roth conversions at ordinary rates. State move pre-FIRE has multi-year tax implications.
7. **Output: year-by-year sequenced plan** with annual conversion target, annual realized-gain budget, and bucket pulls.
8. **Hand off execution to Tax Planner.** Year-by-year tax filing, conversion timing within the year, and CPA referral.

## Output template

```
# Withdrawal order plan — FIRE {age} → {planning age}

## Constraints
- Annual spend (post-tax, today's $): ${X}  [USER-PROVIDED]
- ACA-MAGI ceiling: ${M}  [from Pre-65 Healthcare Plan]
- IRMAA ceiling (post-65): ${I}  [CMS Medicare 2026]
- Filing status: {...}
- State: {...} (state-tax notes)

## Bucket inventory
| Bucket | Balance | Notes |
|--------|---------|-------|
| Taxable | ${...} | cost basis ${...}; LTCG bracket interaction |
| Trad | ${...} | RMD at 73; project to ${...} by 73 if unconverted |
| Roth contributions | ${...} | accessible anytime |
| Roth earnings | ${...} | qualified at 59.5 + 5y |
| HSA | ${...} | qualified medical anytime; reimburse accumulated receipts |
| Cash | ${...} | bridge |

## Year-by-year sequence (annual snapshot — full table in handoff)

### Bridge years (FIRE → 59.5)
- Spend from: taxable ${A} + Roth contributions ${B}
- Roth conversion: ${C}/yr (filling 10–12% bracket up to MAGI ceiling)
- Realized cap gains budget: ${D}/yr (0% LTCG capture)
- Total annual MAGI: ${C + D + dividends + interest} → under ${M} ✓

### Mid years (59.5 → SS claim, ~65/67/70)
- Continue conversion strategy if RMD projection still high
- Begin Trad withdrawals if no further conversion room
- HSA reimbursement of accumulated medical receipts

### Late years (post-RMD, 73+)
- RMD-driven Trad pulls (forced); residual spend from Roth or taxable
- IRMAA ceiling now binding (replaces ACA-MAGI)

## Lever you're pulling
**Primary:** {bracket-filling conversions / 0% LTCG capture / RMD pressure relief / spread-the-tax-bill}
**Quantified benefit:** approximate sustainable WR uplift {0.3–0.7%} vs naive brokerage-first default.

## RMD pressure check
- Current Trad balance: ${...}
- Projected to age 73 (no conversions): ${...} → RMD-1 ≈ ${...}/yr
- Projected to age 73 (with ${C}/yr conversion): ${...} → RMD-1 ≈ ${...}/yr
- → Conversions reduce age-73 RMD by ${...}.

## Coordination
- ACA: confirms ${C} + ${D} ≤ MAGI ceiling
- Pre-59½ bridge: confirms taxable + Roth contributions cover spend during conversion-ladder wait
- IRMAA: not yet binding pre-65

## Recommended next step
**Tax Planner** owns the year-by-year execution. Hand off: "Build full year-by-year tax model for {N}-year FIRE horizon, ${C}/yr Trad-to-Roth conversion, ${D}/yr realized LTCG, MAGI ceiling ${M}, filing {MFJ/single}, state {ST}."
```

## Common mistakes to flag

- **Naive brokerage → Trad → Roth default** — leaves the early-retirement low-bracket opportunity un-captured.
- **All-Roth-first** — wastes the low-bracket conversion years; user ends up over-paying tax in late life on RMDs.
- **Ignoring ACA-MAGI when planning conversions** — converting $50k can cost $10–15k in lost subsidies. The conversion ISN'T free.
- **Over-converting** — if marginal conversion rate ≥ projected withdrawal rate, conversion adds zero or negative value.
- **Ignoring state-tax move opportunity** — moving from CA (13.3% top) to TX (0%) pre-conversion saves real money.
- **Counting Social Security at 100%** when modeling — show both 100% and 75% scenarios.

## Citations / sources

- **IRC §401(a)(9)** — RMD rules.
- **IRC §1(h)** — LTCG / qualified dividends bracket structure.
- **IRC §36B** — ACA premium tax credit (MAGI definition).
- 2026 brackets, LTCG thresholds, IRMAA brackets, RMD divisors → `md_facts` (cite [IRS 2026 limits], [CMS Medicare 2026]).
- Kitces / White Coat Investor / Bogleheads literature on withdrawal sequencing.

## Disclaimer

Withdrawal-order optimization is a year-by-year tax problem, not a one-time plan. Tax law changes (cf. Secure Act, Secure 2.0); ACA / IRMAA brackets change annually. Re-run this skill annually and any year MAGI / income / state changes materially. Execute with a CPA who has explicit FIRE / early-retirement experience.

## Next step

**Next step → Tax Planner:** "Build year-by-year tax model: {N}-year horizon, ${C}/yr Trad→Roth conversion, ${D}/yr realized LTCG, MAGI ceiling ${M}, filing {status}, state {ST}, target spend ${X}/yr."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).