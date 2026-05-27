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

1. **Compute bridge size needed.** `(59.5 − FIRE age) × annual spend × inflation adjustment`. Sketch with no haircut for SS / pension that arrives after 59.5.
2. **Inventory the user's bucket distribution.** Where is the money actually sitting?
3. **Pick the primary bridge mechanism** based on inventory:
   - Big taxable balance → **brokerage bridge** (potentially + Roth ladder for tax efficiency).
   - Mostly Traditional, no taxable → **SEPP/72(t)** likely required (or 5 years of cash before ladder activates).
   - Mostly Roth → already great (Roth contributions accessible anytime).
   - HDHP eligible → ALWAYS stack HSA on top of whatever else.
4. **Layer the secondary mechanism.** Most plans combine 2 or more: e.g., brokerage bridge years 1–5 → Roth ladder years 6+ → SS at 67/70.
5. **Surface the ACA-MAGI tension.** Pre-65 healthcare via ACA depends on MAGI staying below cliffs (or in the enhanced-subsidy range). Conversions / LTCG realizations raise MAGI. Often the binding constraint on conversion size.
6. **Hand off mechanics.** Every plan ends with **Tax Planner** for the execution model and a CPA referral.

## Output template

```
# Pre-59½ bridge plan — FIRE at {age}, bridge years {N}

## Sizing
- Annual spend in early-retirement (today's $): ${X}  [USER-PROVIDED]
- Bridge years (FIRE → 59.5): {N}
- Approximate total bridge $ needed: ${X × N × inflation factor}

## Your bucket inventory
| Bucket          | Balance | Notes |
|-----------------|---------|-------|
| Taxable         | ${...}  | unlock: anytime, LTCG cost basis = ${...} |
| Trad 401(k)/IRA | ${...}  | unlock: SEPP / conversion ladder / Rule of 55 if applicable |
| Roth contribs   | ${...}  | unlock: anytime, tax + penalty-free |
| Roth earnings   | ${...}  | unlock: 5y + age 59.5 OR conversion ladder |
| HSA             | ${...}  | unlock: receipts anytime, qualified med tax-free |
| Cash            | ${...}  | unlock: now |

## Recommended bridge stack
**Primary:** {Brokerage bridge / SEPP / Roth ladder / combination}
**Secondary:** {layered piece}
**Stealth boost:** HSA receipts if HDHP-eligible.

## Plan sketch by year
- Year 1–{X}: pull ${...}/yr from {bucket} (cost basis impact / MAGI impact noted)
- Year {X+1}–{Y}: shift to {next mechanism}
- ...

## ACA-MAGI ceiling
- {Subsidy band that minimizes premium cost or hits enhanced-subsidy regime}
- → Limits annual Roth conversion to ~${conversion ceiling}
- Coordinate with **Pre-65 Healthcare Plan** in FIRE Planner.

## IRREVERSIBLE warnings (if SEPP selected)
- Modification = 10% penalty retroactively on ALL prior SEPP payments + interest.
- Get a CPA before electing.

## Recommended next step
**Tax Planner** owns the execution model. Hand off: "Build me a {N}-rung Roth conversion ladder starting tax year {year}, $X/yr conversions, ACA-MAGI ceiling $Y."
```

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
