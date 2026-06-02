## Paycheck Walkthrough

description: Line-by-line decode of a pay stub. Names every deduction (FIT / FICA OASDI / FICA Medicare / state / SDI / 401(k) / HSA / health premium / etc.), explains what each does, flags lines that commonly look wrong, and ends with the "where would I push back?" checklist. Education, not a withholding recommendation (that's `md_tx_skill_withholding_check`'s job).

## When to use

- First paycheck at a new job and the user wants to understand it.
- User's net pay changed and they don't know why.
- User suspects an error (W-4 not updated, benefits enrollment wrong, state tax wrong after a move).
- User wants to understand WHY their gross-to-net ratio is what it is BEFORE running a withholding analysis.

## Inputs needed

- A copy of the pay stub (or the line items the user is confused about). Mask the SSN / full account numbers before sharing.
- Filing status from the W-4 on file (single / MFJ / HoH / etc.).
- State of residence (and state of work if different).

## Workflow

1. **Identify pay frequency.** Weekly / bi-weekly / semi-monthly / monthly. This changes how you annualize.
2. **Walk top-down through the stub.** Group lines into four families:
   - **Gross** (regular wages, overtime, bonuses, RSUs / stock comp).
   - **Pre-tax deductions** (401(k) traditional, HSA, FSA, health / dental / vision premium, commuter, parking) — these reduce taxable wages.
   - **Taxes** (Federal Income Tax / FIT, Social Security / OASDI 6.2%, Medicare 1.45% + 0.9% Additional Medicare over $200k single, State Income Tax, Local Income Tax, State Disability Insurance, Unemployment in some states).
   - **Post-tax deductions** (Roth 401(k), ESPP, after-tax life, garnishments, union dues).
3. **Verify each tax line.** Use 2026 rates (call `md_facts` for current limits).
4. **Flag anything that looks off.** See "Common red flags" below.
5. **Compute the take-home rate.** Net ÷ Gross = take-home %. Quick gut check: most W-2 employees land 60-75% net depending on state / contributions / income.
6. **Hand off if action needed.** Withholding looks wrong → **Withholding Check** (Tax Planner). 401(k) contribution % feels low → **Contribution Optimizer** (Retirement Planner). HSA available but not maxed → **Concept Explainer** for "HSA triple tax advantage", then **Health Plan Selector** (Health & Medicare).

## Common red flags to check for

- **FICA OASDI (Social Security 6.2%)** stops at the annual wage base (2026 wage base in `md_facts`); if your YTD gross > wage base and OASDI is still being deducted, that's an over-withholding error.
- **Medicare Additional 0.9%** kicks in over $200k YTD wages (single threshold — employer doesn't know your filing status). If you'll file jointly and you + spouse stay under $250k, you'll get the excess back at tax time, but you can plan around it.
- **Federal withholding flat % look wrong** — most common cause is a stale W-4 (multiple jobs, second-income spouse, side-income, RSU vests) → withholding is calibrated to a single W-2 view and will under-withhold.
- **State tax for a state you don't live in** after a move — employer's payroll wasn't updated.
- **Health premium higher than benefits-guide PDF said** — pre-tax vs post-tax classification or the dependent tier was miscoded at enrollment.
- **401(k) % off by a decimal** — "I set 10%, stub shows 1%" happens.
- **No HSA contribution** despite HDHP enrollment — common, and you may be missing both the tax deduction and the employer match.
- **Bonus withheld at the supplemental 22% flat rate** when your marginal bracket is higher (24/32/35/37%) → you'll owe at tax time; not an error, but plan for it.

## Output template

```
# Paycheck walkthrough — pay period {dates}, frequency {weekly/bi-weekly/etc.}

## Top-line
- Gross: ${X}
- Pre-tax deductions: ${Y}
- Taxable wages: ${X - Y}
- Total taxes: ${Z}
- Post-tax deductions: ${W}
- Net (take-home): ${X - Y - Z - W}
- Take-home rate: {N}%

## Line-by-line

### Gross
- {line}: ${amount} — {one-sentence what it is}

### Pre-tax deductions
- {line}: ${amount} — {what it does + tax savings}

### Taxes
- FIT: ${amount} — withheld based on W-4; reconciles at tax filing. {Flag if YTD looks off relative to annualized projection.}
- FICA OASDI (6.2%): ${amount} — funds Social Security retirement / disability / survivor benefits. {Flag if YTD > 6.2% × wage base.}
- FICA Medicare (1.45%): ${amount} — funds Medicare Part A. {+ 0.9% Additional Medicare over $200k YTD if applicable.}
- State {ST}: ${amount} — {state-specific notes}.
- {SDI / local / etc. as applicable}

### Post-tax deductions
- {line}: ${amount} — {what it is}

## Red flags I'm flagging
- {issue 1, with the specific fix}
- {issue 2}

## Recommended next step
{ONE thing — usually either: (a) run **Withholding Check** in Tax Planner, (b) update W-4 with payroll, or (c) you're all set, nothing to do}
```

## Citations

- 2026 FICA wage base, OASDI / Medicare rates, Additional Medicare threshold, bracket-aligned supplemental withholding rate → `md_facts` (cite as `[IRS 2026 limits]` / `[SSA 2026]`).
- IRS Pub 15 / 15-T (employer's tax guide and withholding methods).
- State withholding rates → state DOR; cite `[UNSOURCED]` if not in `md_facts` and tell the user to verify.

## Disclaimer

This explains the stub; it doesn't recommend a new W-4. For a personal withholding recommendation, hand off to **Withholding Check** in **Tax Planner**.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).