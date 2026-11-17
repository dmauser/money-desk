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
2. **Run the 4-rate grid.** Run the three fixed return paths (base / stressed / bad first decade) in **Determinism rules** at 3% / 3.5% / 4% / 4.5%. Quote historical survival rates only from a cited source (Trinity, Kitces, or cFIREsim / Portfolio Visualizer) — otherwise say "not computed".
3. **Surface the SEQUENCE-OF-RETURNS RISK.** This is the headline. A bad first decade matters MORE than average return.
   - Show: the bad-first-decade path (−1% real for years 1–10, then the base return) vs the base path — depletion year or ending balance for each WR.
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

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

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

## Determinism rules

### Input keys

Names match the `md_fi_skill_swr_stress_test` intake schema (template named range in brackets); extra keys follow.

- `horizon_years` — integer [`horizon_yrs`]
- `target_annual_spend` — number, $ per year, today's dollars [`initial_withdrawal`]
- `portfolio_total` — number, $ [`portfolio_start`]
- `stock_pct`, `bond_pct`, `cash_pct` — numbers summing to 100
- `spend_pattern` — `Flat real (constant inflation-adjusted)` | `Rising real (lifestyle creep)` | `Declining real (retirement smile)` | `Variable / lumpy`
- `income_floor_annual` — number, SS + pension $ per year, today's dollars
- `income_floor_start_age` — integer
- `expected_real_return_pct` — number [`expected_real_return`]
- `spend_flexibility` — `Could cut 0–5%` | `Could cut 5–15%` | `Could cut 15–25%` | `Could cut 25%+`
- `current_age` — integer (needed when `income_floor_annual > 0`)
- `spend_real_change_pct_per_year` — number (needed for rising / declining patterns; + rising, − declining)
- `lumpy_expenses` — list of `{ year, amount_usd }` (variable pattern)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Horizon, spend, portfolio, allocation, real return, flexibility | **Ask — no default** (intake requires them) | — |
| `current_age` when an income floor is given | **Ask — no default** | — |
| Annual real spend change (rising / declining) | **Ask — no default**; flat pattern = 0 | — |
| Stressed real return [`stress_real_return`] | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_bond_real_return_rate` (fraction — × 100): "the whole portfolio earns only bond-like real returns" | `[ASSUMPTION]` |
| Bad-first-decade real return [`bad_first_decade_return`] | −1.0% real per year for years 1–10, then `expected_real_return_pct` (fixed path, same as the template) | `[ASSUMPTION]` |
| Guardrail starting WR (for reference) | `md_facts` → `behavioral_assumptions_safe_defaults.guyton_klinger_initial_withdrawal_rate` (× 100) | `[ASSUMPTION]` |
| SS haircut scenario | Income floor × 75% | `[ASSUMPTION]` |
| Historical survival rates | Cite a primary study (Trinity 1998/2011, Bengen 1994, Kitces/Pfau) or a historical-sequence tool via `md_sources`; otherwise the column reads "Not computed — no primary source retrieved" | `[UNSOURCED]` |

### Calculation method

Real dollars, annual compounding, **end-of-year withdrawals** (matches the template's `NPER` / annuity formulas). No random sampling — only the three fixed paths below.

1. **Grid:** `WR ∈ {3.0, 3.5, 4.0, 4.5}`; `W₁(WR) = portfolio_total × WR / 100`. The user's own rate `WR_user = target_annual_spend / portfolio_total × 100`.
2. **Year-t withdrawal:** `W_t = W₁ × (1 + g)^(t−1) + lumpy_t − floor_t`, floor 0, where `g = spend_real_change_pct_per_year / 100` (0 if flat) and `floor_t = income_floor_annual` from the year in which `current_age + t − 1 ≥ income_floor_start_age`.
3. **Paths** (each for every WR and for `WR_user`):
   - Base: `r_t = expected_real_return_pct` all years.
   - Stressed: `r_t = stress return` all years.
   - Bad first decade: `r_t = −1.0%` for t = 1–10, then base.
   - Loop: `B_t = B_{t−1} × (1 + r_t) − W_t`, `B_0 = portfolio_total`. Depletion year = first `t` with `B_t < 0`. "Lasts" = no depletion through `horizon_years`.
4. **Template cross-check** (flat spend, no floor): coverage years `= NPER(r, −W, P)` (∞ if `r × P ≥ W`); after-bad-decade balance `= P(1 + d)^10 − W((1 + d)^10 − 1) / d`; implied WR after bad decade `= W / that balance`. Report these exactly as the template does.
5. **Income-floor variants:** pre-floor WR = `W₁ / P`; post-floor WR = `(W₁ − floor) / balance at floor start (base path)`. Repeat the base and bad-decade paths with `floor × 0.75`.
6. **Required portfolio** at each WR: `target_annual_spend / (WR / 100)`; gap = required − `portfolio_total`.
7. Rounding: cents internally; whole dollars; years as integers; rates to two decimals.

### Decision rules

**A. User's current WR status** (template Summary!D8) — first match wins.

| # | Condition | Status |
|---|---|---|
| 1 | `WR_user ≤ 3.5` | OK |
| 2 | `WR_user ≤ 4.0` | WATCH (3.5–4%) |
| 3 | Otherwise | AGGRESSIVE |

**B. Defensible range** — a WR *passes* if it lasts the full horizon on **both** the stressed path and the bad-first-decade path (with the full income floor). First match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | No grid WR passes | Below 3% — spend is too high for this portfolio; required portfolio at 3% = `spend / 0.03` |
| 2 | `spend_flexibility` is `Could cut 15–25%` or `Could cut 25%+` | Range = highest passing WR → highest WR that lasts on the base path (guardrails required; cut rule stated) |
| 3 | Highest passing WR passes only with the full floor but fails with the 75% floor | Range = next lower grid WR → highest passing WR |
| 4 | Otherwise | Range = (highest passing WR − 0.5) → highest passing WR, floor 3.0 |

### Output template

```markdown
# Safe-withdrawal stress test — {horizon_years} years, ${spend}/yr target

## Headline
Your rate **{WR_user}%** — **{rule A status}**. Defensible range: **{X}–{Y}%** (rule B#{n}) = ${X·P}–${Y·P}/yr from the portfolio, plus ${floor}/yr from age {start}.

## Inputs
| Input | Value | Tag |
|---|---|---|

## Withdrawal-rate grid (horizon = {N} years)
| WR | Year-1 $ | Base path | Stressed path ({s}% real) | Bad-first-decade path | Historical survival (cited) | Passes? |
|---|---|---|---|---|---|---|
| 3.0% | | lasts / depletes yr {t} | | | | |
| 3.5% | | | | | | |
| 4.0% | | | | | | |
| 4.5% | | | | | | |

## Required portfolio at your spend
| WR | Required | Gap vs today |
|---|---|---|

## Sequence-of-returns risk
| Metric | Value |
|---|---|
| Coverage years @ base (template) | |
| Coverage years @ stressed (template) | |
| Balance after bad first decade | |
| Implied WR after bad decade | |

## Income floor
| Scenario | Pre-floor WR | Post-floor WR | Lasts? |
|---|---|---|---|
| 100% floor | | | |
| 75% floor | | | |
{or "Not applicable — no SS / pension floor entered"}

## The three SWR camps — pick one consciously
- **Bengen fixed-real**: …
- **Guardrails (Guyton-Klinger / Kitces)**: …
- **Bogleheads VPW**: …

## The four killers — your mitigations
- Bad first decade: {…}
- Inflation spike: {…}
- Healthcare blow-up: {…}
- Longevity tail: {…}

## Recommended next step
{ONE thing}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
