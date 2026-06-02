## Safe-Withdrawal Stress Test

description: Pressure-test a candidate withdrawal rate against the user's specific horizon, allocation, spend pattern, and bad-sequence risk. Presents 3% / 3.5% / 4% / 4.5% side-by-side. Names the failure modes (bad first decade, inflation spike, healthcare blow-up, longevity tail). Surfaces the three SWR camps (Bengen fixed-real, Kitces ratcheting / guardrails, Bogleheads VPW) honestly. NEVER endorses "the 4% rule" as a single answer — that was a 30-year-horizon, 50/50-stock-bond, US-only finding.

## When to use

- "Is the 4% rule actually safe for me?"
- After **FIRE Number Calculator** to validate the chosen WR for the user's horizon
- "I have $1.2M and want to spend $48k/yr — does that work for 45 years?"
- "What WR should I use?"
- User is FIRE-considering and has read mixed takes on the 4% rule

## Inputs needed

- **Horizon (years)** — current age and planning-to age. 40-year horizon is meaningfully harder than 30.
- **Target annual spend (today's $)** — same number used in FIRE Number Calculator.
- **Current portfolio total** + **stock/bond/cash allocation %**.
- **Spend pattern** — flat real, rising real (lifestyle creep), declining real (Bogleheads / Blanchett "retirement smile"), or variable (lumpy).
- **Income floor** — Social Security PIA (at claiming age) and any pension. USER-PROVIDED. The floor reduces required portfolio coverage.
- **Real return + real volatility assumption** — USER-PROVIDED. Common range: 4–5% real return / 12–16% real stdev for 60–80% stock. If the user doesn't know, mark [ASSUMPTION] and proceed.
- **Spend flexibility** — would the user trim spending 10–20% in a down year? (Most FIRE'd households can; some can't.)

## Workflow

1. **State the horizon honestly.** The 4% rule was studied for 30 years. At 40 years, historical success drops; at 50 years, lower again. Cite Kitces / Pfau.
2. **Run the 4-rate grid.** Show portfolio survival probability at 3% / 3.5% / 4% / 4.5% across the chosen horizon, given the user's allocation. Cite the source (Trinity, Kitces, or Cfiresim / Portfolio Visualizer — flag if you don't have a primary source).
3. **Surface the SEQUENCE-OF-RETURNS RISK.** This is the headline. A bad first decade matters MORE than average return.
   - Show: "If the first 5 years return -2% real, your 4% WR plan fails ~X% of the time vs ~Y% in the average case."
   - Name the specific worst start years (1929, 1966, 2000) and how a 4% WR plan starting in those years fared at 30 and 40 years.
4. **Present the three SWR camps honestly:**
   - **Bengen fixed-real (4% rule):** withdraw 4% of starting balance, adjust for inflation each year. Simple; ignores actual market.
   - **Kitces ratcheting / guardrails:** start higher (4.5%), with rules to cut spending if the portfolio drops a threshold or raise if it grows. Higher initial WR; requires discipline.
   - **Bogleheads VPW (Variable Percentage Withdrawal):** withdraw a horizon-and-age-indexed % of current portfolio. Never depletes the portfolio mechanically; spending varies year-to-year (potentially a LOT).
5. **Layer in the income floor.** SS + pension reduce the portfolio-coverage requirement starting at claiming age. Show pre-claiming and post-claiming WR. This is often the difference between "barely fails" and "comfortably fits."
6. **Name the four killers.** Each FIRE plan should have an explicit answer for:
   - Bad first decade (sequence risk) → mitigations: cash buffer, bond tent, dynamic WR.
   - Inflation spike → mitigations: TIPS allocation, I-Bonds, spending flexibility.
   - Healthcare blow-up → see Pre-65 Healthcare Plan.
   - Longevity tail (live to 100) → mitigations: SS optimization, deferred annuity (QLAC), lower WR.
7. **Make the recommendation a range, not a number.** "Given your inputs, a 3.5–4% withdrawal rate is defensible IF you accept these specific risks AND have a plan for these specific mitigations."
8. **Hand off the mechanics.** Allocation tweaks → **Investing Advisor**. Tax-bracket-filling conversion strategy → **Tax Planner**. ACA-subsidy MAGI cap on the WR → **Pre-65 Healthcare Plan**.

## Output template

```
# Safe-withdrawal stress test — {horizon} years, ${spend}/yr target

## Inputs
- Horizon: {N} years ({current age} → {planning to age})  [USER-PROVIDED]
- Spend: ${X}/yr today's dollars  [USER-PROVIDED]
- Portfolio: ${P} ({stock}% / {bond}% / {cash}%)  [USER-PROVIDED]
- SS / pension floor: ${F}/yr starting age {claim}  [USER-PROVIDED]
- Real return assumption: {R}%  [USER-PROVIDED]
- Spend flexibility: {Yes / No, can trim {X}% in down years}

## Withdrawal-rate grid (horizon = {N} years)
| WR  | Initial $ withdrawal | Historical survival | Recommended? |
|-----|----------------------|---------------------|--------------|
| 3.0% | ${0.03 × P}         | ~{cite}             | Defensive    |
| 3.5% | ${0.035 × P}        | ~{cite}             | Solid for {N}y |
| 4.0% | ${0.04 × P}         | ~{cite}             | Calibrated for 30y, marginal for {N}y |
| 4.5% | ${0.045 × P}        | ~{cite}             | Requires Kitces-style guardrails |

→ At your ${spend}/yr target, you need a portfolio of ${spend/WR} at each WR. Today: ${P}. Gap: ${...}.

## Sequence-of-returns risk
- Average case: ~{X}% portfolio survival.
- Bad-first-decade case (real returns -2% avg years 1–5): ~{Y}% survival.
- Historical worst starts (1929 / 1966 / 2000), {N}-yr horizon at 4% WR: {survived? / failed when?}.
- **What this means for you:** the next 5 years matter MORE than the next 30 years' average.

## The three SWR camps — pick one consciously
- **Bengen fixed-real (4%)**: simple, ignores market. Use if you want predictable spending and accept lower starting %.
- **Kitces guardrails (4.5% + cut rules)**: higher initial spend; requires you to cut 10–20% in a triggered down year.
- **Bogleheads VPW**: never runs out mechanically; spending varies. Use if you have very high spending flexibility.

## The four killers — your specific mitigations
- Bad first decade: {cash buffer / bond tent / dynamic WR}
- Inflation spike: {TIPS / I-Bonds / variable spend}
- Healthcare blow-up: {see Pre-65 Healthcare Plan}
- Longevity tail: {SS optimization / lower WR / QLAC}

## Recommendation
Given your {horizon}-year horizon, {allocation}, and {flexibility}, defensible range: **{X}–{Y}% WR**. This translates to ${...}–${...}/yr from the portfolio, plus ${F}/yr SS at age {claim}.

## Recommended next step
{ONE thing — most often: Withdrawal Order Optimizer in FIRE Planner, OR Pre-65 Healthcare Plan if MAGI cap is binding, OR Glide-Path / Portfolio Review in Investing Advisor if allocation looks wrong for the horizon.}
```

## Common mistakes to flag

- **30-year SWR research applied to 50-year horizon** — different problem; haircut required.
- **Ignoring sequence risk** — averages lie. The worst 5-year start dominates.
- **No spending flexibility plan** — the 4% rule survives ~95% of historical 30-year periods, but the 5% failures are TERRIBLE if you can't trim spending. Plan the trim rule NOW.
- **Treating Bengen as scripture** — Bengen himself has revised upward to 4.5–4.7% based on later research; Pfau has gone lower (3.0–3.3%) for current low-yield era. The honest answer is "it depends."
- **Counting SS at $1 today's dollars** — political risk is real; show the plan with full SS and with 75% SS.

## Citations / sources

- **Bengen 1994** — *Journal of Financial Planning*, "Determining Withdrawal Rates Using Historical Data" — origin of the 4% rule (30y horizon, 50/50, US data 1926–1976).
- **Trinity Study 1998** — Cooley/Hubbard/Walz, *AAII Journal* — survival probabilities by WR + allocation; updated 2011.
- **Kitces** — extensive blog research on horizon adjustment, sequence risk, ratcheting, guardrails.
- **Pfau** — *Reversing the Conventional Wisdom* (lower current-era SWR).
- **Bengen updated** — Bengen now suggests 4.5–4.7% with broader allocation; cite his recent interviews / papers.
- **Bogleheads VPW** — wiki page.
- 2026 SS PIA / claim-age table → `md_facts` (cite [SSA 2026]).

## Disclaimer

Historical SWR research is a *historical envelope*, not a forecast. The future could be better OR worse. Plan for the worse case, hope for the better. Always pair this with **Pre-65 Healthcare Plan** (the most common FIRE blowup) and **Withdrawal Order Optimizer** (the tax efficiency lever that often adds 0.5%+ to sustainable WR).

## Next step

**Next step → FIRE Planner:** "Run Withdrawal Order Optimizer for $X/yr spend with $A taxable, $B Traditional, $C Roth, $D HSA, ACA-MAGI ceiling $E."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).


### XLSX deliverables — template + named-ranges contract

When this skill produces an XLSX, it **MUST**:

1. **Start from the shipped template** at `template.xlsx.json` in this skill's
   folder. The template pre-declares the Inputs schema, named ranges, and
   Summary/Analysis formulas. Fill only **values** (and narrative cells) —
   never hand-author raw `A1` coordinates in formulas.
2. **Reference cells by name**, never coordinate. Use
   `=PMT(mortgage_rate/12, mortgage_term_years*12, -loan_amount)` rather
   than `=PMT(Inputs!B5/12, Inputs!B4*12, -B11)`. This is the bug class the
   template system exists to prevent: a Rent vs Buy report once shipped with
   Monthly P&I pointing at Inputs!B6 (holding horizon) instead of Inputs!B4
   (mortgage term) — off by 75% — and the BUY/RENT cells pointing at the
   same source.
3. **Recompute every headline figure** independently in Python and assert
   agreement within 1% before declaring done (see
   `report_quality.self_verification` in `data/preferences.yaml`).
4. **Recalculate the workbook** after rendering (LibreOffice headless on
   Linux/Mac, Excel COM on Windows, or the `formulas` package) and reload
   with `data_only=True`; openpyxl alone does not evaluate formulas.
5. **Cross-format diff**: if markdown + XLSX (or DOCX) are both produced,
   diff every headline figure across formats; abort and re-render if any
   pair differs by more than 1%.
6. **Flag duplicate-value-with-different-label** in the same table — that
   pattern is almost always a reference-pointing bug, not a coincidence.
