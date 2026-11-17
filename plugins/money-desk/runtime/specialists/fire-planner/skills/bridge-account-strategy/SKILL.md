## Pre-59½ Bridge Strategy

description: The four legal mechanisms to access retirement money before 59½ without the 10% penalty — Roth conversion ladder (5-year rule), SEPP/72(t) (life-expectancy fixed payments), brokerage bridge (taxable account sized to span the gap), HSA-as-stealth-IRA stacking. Output: which combination fits the user, the rough sizing, and the explicit handoff to Tax Planner for execution mechanics. STRATEGY only — none of these can be executed safely from a chat.

## When to use

- "How do I access my 401(k) before 59½?"
- "What's a Roth conversion ladder?"
- "Can I use 72(t)?"
- "Do I need a big brokerage account to retire at 45?"
- Anyone with FIRE age < 55 (Rule of 55 doesn't cover them — need real bridge)

## Inputs needed

- **Current age** and **target FIRE age**.
- **Bridge years required** — `59.5 − FIRE age`. (For FIRE-at-45, bridge is 14.5 years.)
- **Annual spend in early-retirement (today's $)**.
- **Portfolio by tax bucket:** taxable / Trad 401(k) + IRA / Roth 401(k) + IRA contributions vs earnings (5-year rules differ) / HSA / cash.
- **Spouse income post-FIRE** (any) — affects MAGI/ACA + tax-bracket-filling room.
- **Other income post-FIRE** (real estate / consulting / pension) — same.
- **State** — CA / NJ / OR do NOT recognize the 10% penalty exception cleanly; SEPP may still owe state penalty in some.

## The four bridge mechanisms — when each fits

### 1. Roth Conversion Ladder (typical first choice)

- **Mechanism:** Convert Traditional → Roth in retirement (after FIRE). Wait 5 calendar years per converted batch, then withdraw the *converted principal* tax-free and penalty-free. (IRC §408A(d)(3)(F); Treas. Reg. §1.408A-6 Q&A-5.)
- **Fits:** FIRE'd household with large Traditional balance and 5+ years of brokerage / cash to cover the first 5-year wait window.
- **Tax cost:** conversion is taxed at ordinary rates in conversion year. Beauty: in low-income early-FIRE years, you can fill the 0% / 10% / 12% brackets with conversions.
- **Watch:** ACA-MAGI ceiling — conversions raise MAGI and can blow up premium subsidies. Pre-65 healthcare interacts directly.
- **Mechanics owner:** **Tax Planner**.

### 2. SEPP / 72(t) (substantially equal periodic payments)

- **Mechanism:** Take fixed annual distributions for ≥5 years OR until age 59½ (whichever is LONGER). Computed via IRS life-expectancy methods (RMD method, fixed amortization, fixed annuitization). Notice 2022-6 added a 5% floor rate option (much more useful at low yields).
- **Fits:** FIRE'd household with most assets locked in Traditional and *no* big brokerage bridge — needs cash flow now, can't wait 5 years for a ladder.
- **Tax cost:** distributions taxed ordinary. NO 10% penalty if SEPP is properly elected.
- **Watch:** **IRREVERSIBLE.** Modify the payment schedule at all (even by mistake) → 10% penalty retroactively applied to ALL prior payments + interest. Most expensive math error in personal finance.
- **Mechanics owner:** **Tax Planner** (and you should have a CPA on this; do NOT execute from a chat).

### 3. Brokerage Bridge

- **Mechanism:** Save / hold taxable account large enough to cover spend from FIRE age to 59½ (or to bridge-the-bridge until the Roth ladder matures).
- **Fits:** Household that planned ahead — large taxable balance. Most flexible (no IRS election, no MAGI shock from conversions if you don't want them).
- **Tax cost:** LTCG on appreciated lots; 0% LTCG bracket is real in low-income early-FIRE years (cite [IRS 2026 limits]).
- **Watch:** ACA-MAGI: realized LTCG is in MAGI. Use specific-lot sales to minimize realized gain; consider tax-loss harvesting in working years to bank losses.
- **Mechanics owner:** **Investing Advisor** for tax-aware sale order; **Tax Planner** for ACA-MAGI interaction.

### 4. HSA-as-Stealth-IRA

- **Mechanism:** HSA contributions are pre-tax (triple-tax-advantaged if used for qualified medical) AND can be used at *any age* for accumulated qualified medical receipts (no time limit on reimbursement). Pay medical bills out-of-pocket for decades, keep receipts, withdraw HSA tax-free in retirement.
- **Fits:** Anyone with current HDHP eligibility who is FIRE-targeting. Strict subset of household but a free addition to the strategy.
- **Tax cost:** $0 if reimbursing qualified medical.
- **Watch:** After 65, non-medical HSA withdrawals are ordinary income (still no penalty). Before 65, non-medical is ordinary + 20% penalty.
- **Mechanics owner:** **Health & Medicare** (HSA contribution sizing) + **Net Worth & Goals** (tracking receipts).

## Workflow

1. **Compute bridge size needed.** `(59.5 − FIRE age) × annual need` in today's dollars, where annual need = spend − spouse and other income (Determinism rules steps 1–3). No haircut for SS / pension that arrives after 59.5.
2. **Inventory the user's bucket distribution.** Where is the money actually sitting?
3. **Pick the primary bridge mechanism** with the Decision rules (coverage years vs bridge years); in words:
   - Big taxable balance → **brokerage bridge** (potentially + Roth ladder for tax efficiency).
   - Mostly Traditional, no taxable → **SEPP/72(t)** likely required (or 5 years of cash before ladder activates).
   - Mostly Roth → already great (Roth contributions accessible anytime).
   - HDHP eligible → ALWAYS stack HSA on top of whatever else.
4. **Layer the secondary mechanism.** Most plans combine 2 or more: e.g., brokerage bridge years 1–5 → Roth ladder years 6+ → SS at 67/70.
5. **Surface the ACA-MAGI tension.** Pre-65 healthcare via ACA depends on MAGI staying below cliffs (or in the enhanced-subsidy range). Conversions / LTCG realizations raise MAGI. Often the binding constraint on conversion size.
6. **Hand off mechanics.** Every plan ends with **Tax Planner** for the execution model and a CPA referral.

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **5-year rule confusion** — there are TWO 5-year rules. (a) 5 years from each conversion before the converted principal is penalty-free. (b) Roth account 5-year-old before earnings are qualified. Don't conflate.
- **SEPP modification** — even unintentional modification (e.g., rollover that disturbs the account) restarts the penalty clock and applies it retroactively. Highest-stakes irreversible decision.
- **Rule of 55 misapplied** — only the 401(k) of the employer you separated from AT OR AFTER 55, and only for that 401(k). Doesn't cover IRA, doesn't cover other 401(k)s.
- **Ignoring ACA-MAGI** — converting $50k/yr might blow up a $1,200/mo premium subsidy ($14.4k/yr lost). Conversion strategy is healthcare strategy.
- **Treating brokerage cap-gains as free** — they're MAGI; they affect ACA + IRMAA (post-65).

## Citations / sources

- **IRC §408A(d)(3)(F)** — 5-year rule for conversions.
- **Treas. Reg. §1.408A-6 Q&A-5** — conversion principal withdrawal rules.
- **IRC §72(t)(2)(A)(iv)** — SEPP exception.
- **Notice 2022-6** — current SEPP life-expectancy tables + 5% floor rate.
- **IRC §72(t)(10)** — Rule of 55 for 401(k).
- **IRC §223** — HSA.
- 2026 LTCG brackets / IRMAA / ACA FPL → `md_facts` (cite [IRS 2026 limits], [HHS FPL 2026], [CMS Medicare 2026]).

## Disclaimer

These mechanisms have multi-year tax and benefit consequences. SEPP in particular is irreversible and the failure mode is brutal. Execute with a CPA who has explicit pre-59½ FIRE experience — this is NOT general-practice CPA work.

## Next step

**Next step → Tax Planner:** "Build me a {primary mechanism} plan for ${spend}/yr bridge from age {FIRE age} to 59.5, current buckets {taxable $A / Trad $B / Roth $C / HSA $D}, target ACA-MAGI ceiling ${E}."

## Determinism rules

### Input keys

Names match the `md_fi_skill_bridge_account_strategy` intake schema; extra keys follow.

- `current_age`, `target_fire_age` — integers
- `annual_spend_early_retirement` — number, $ per year, today's dollars
- `taxable_balance`, `taxable_cost_basis` — numbers, $
- `trad_balance` — number, $ (401(k) + IRA)
- `roth_contributions_accessible`, `roth_earnings` — numbers, $
- `hsa_balance`, `cash_balance` — numbers, $
- `spouse_income_post_fire`, `other_income_post_fire` — numbers, $ per year
- `filing_status` — `Single` | `Married Filing Jointly` | `Married Filing Separately` | `Head of Household`
- `state` — two-letter code
- `aca_magi_ceiling` — number, $ per year (0 = not using ACA)
- `hsa_unreimbursed_receipts_usd` — number, saved qualified-medical receipts not yet reimbursed
- `rule_of_55_eligible` — boolean; separating from the employer whose 401(k) holds money in or after the year the user turns 55
- `rule_of_55_balance_usd` — number, balance in that 401(k)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Ages, spend, filing status, state | **Ask — no default** (intake requires them) | — |
| Bucket balances, other incomes | 0 | `[USER-PROVIDED]` / `[ASSUMPTION: 0]` |
| HSA receipts | 0 (HSA not counted as accessible) | `[ASSUMPTION]` |
| Return on bridge assets | 0% real (conservative — bridge money is spent) | `[ASSUMPTION]` |
| Inflation (only for nominal display) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` (× 100) | `[ASSUMPTION]` |
| Standard deduction, ordinary brackets, 0% LTCG ceiling | `md_facts` → `income_tax_brackets_mfj_2026.standard_deduction_*`, `.brackets`, `.ltcg_qualified_dividend_brackets_mfj` (MFJ; other statuses: `.brackets_single` / `.brackets_hoh` / `.brackets_mfs` and `.ltcg_qualified_dividend_brackets_single` / `_hoh` / `_mfs`) | `[IRS 2026 brackets]` |
| SEPP interest rate | 5.00% — the Notice 2022-6 rate that is always permitted (the alternative "120% of federal mid-term rate" via `md_sources`) | — |
| SEPP life-expectancy divisor | Not in md_facts — IRS Single Life Table (Treas. Reg. §1.401(a)(9)-9) via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| State early-distribution treatment | State DOR via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |

### Calculation method

> **Calculators:** `md_calc` → `loan_amortization` for every fixed-rate loan payment, balance and payoff time; `md_calc` → `federal_income_tax` for ordinary tax, marginal rate and bracket headroom. Use the calculator's numbers verbatim, tagged `[CALCULATED]`, instead of mental arithmetic.

Real (today's) dollars throughout.

1. **Bridge length:** `bridge_years = 59.5 − target_fire_age` (one decimal). If ≤ 0 → Decision rule 1.
2. **Annual need:** `need = max(0, annual_spend_early_retirement − spouse_income_post_fire − other_income_post_fire)`.
3. **Bridge total:** `bridge_usd = need × bridge_years`.
4. **Accessible before 59½:** `access = taxable_balance + roth_contributions_accessible + cash_balance + min(hsa_balance, hsa_unreimbursed_receipts_usd)` (+ `rule_of_55_balance_usd` if `rule_of_55_eligible` and `target_fire_age ≥ 55`). Unrealized gain = `taxable_balance − taxable_cost_basis`.
5. **Coverage:** `coverage_years = access / need` (∞ if `need = 0`).
6. **Conversion ceiling per year:** if `aca_magi_ceiling > 0`, `conv_cap = aca_magi_ceiling − spouse_income_post_fire − other_income_post_fire − planned realized gains`; else `conv_cap = standard deduction + top of the 12% bracket − ordinary income` (md_facts). Floor 0.
7. **Roth ladder:** rung size = `min(need, conv_cap, remaining trad balance)` converted every year from FIRE year 1; rung converted in year `y` becomes spendable in year `y + 5` (5-tax-year rule). Ladder covers year `t ≥ 6` if rung `t − 5` ≥ `need`.
8. **SEPP (amortization method):** `payment = trad_balance × i / (1 − (1 + i)^−n)` with `i = 0.05`, `n` = single life expectancy at the age in the first distribution year (sourced). Required duration = later of 5 years or age 59½.
9. **Year sketch:** years 1–5 funded from `access` (cash → taxable → Roth contributions → HSA receipts); years 6 … bridge end from ladder rungs, topped up from remaining `access`; SEPP only if Decision rules select it.
10. Rounding: cents internally; whole dollars; years to one decimal.

### Decision rules

Primary mechanism — evaluate top to bottom; the first match wins. HSA receipts are always stacked when `hsa_unreimbursed_receipts_usd > 0`.

| # | Condition | Primary bridge |
|---|---|---|
| 1 | `bridge_years ≤ 0` | Not applicable — already 59½ at FIRE |
| 2 | `rule_of_55_eligible` and `target_fire_age ≥ 55` and `rule_of_55_balance_usd ≥ bridge_usd` | Rule of 55 (that 401(k) only) |
| 3 | `coverage_years ≥ bridge_years` | Brokerage bridge (+ Roth ladder conversions inside `conv_cap` if `trad_balance > 0`) |
| 4 | `coverage_years ≥ 5` and `trad_balance > 0` | Brokerage bridge years 1–5 → Roth conversion ladder from year 6 |
| 5 | `trad_balance > 0` and `coverage_years < 5` | SEPP / 72(t) sized to the gap — **IRREVERSIBLE**, CPA required |
| 6 | Otherwise | Shortfall — FIRE age not bridgeable; route to Savings-Rate Optimizer |

### Output template

```markdown
# Pre-59½ bridge plan — FIRE at {target_fire_age}, bridge {bridge_years} years

## Headline
Primary: **{mechanism}** (rule #{n}). Bridge need **${bridge_usd}** (today's $); accessible now **${access}** = **{coverage_years} years**.

## Sizing
| Item | Value |
|---|---|
| Annual need (spend − other income) | |
| Bridge years | |
| Bridge total (today's $) | |
| Conversion ceiling / yr | |

## Bucket inventory
| Bucket | Balance | Accessible before 59½? | Notes |
|---|---|---|---|

## Recommended bridge stack
**Primary:** {…} · **Secondary:** {… or "None"} · **HSA receipts:** {$ or "Not applicable"}

## Plan by year
| Year | Age | Source(s) | Amount | Roth conversion | Realized gain | Est. MAGI |
|---|---|---|---|---|---|---|

## ACA-MAGI ceiling
{ceiling and its effect — or "Not applicable — not using ACA"}

## SEPP
{payment, divisor source, duration, IRREVERSIBLE warning — or "Not applicable — SEPP not selected"}

## Recommended next step
**Tax Planner** owns execution: "{hand-off sentence}"
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
