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
5. **Compute the take-home rate.** Net ÷ Gross = take-home %. Quick gut check: most W-2 employees land 60-75% net depending on state / contributions / income `[UNSOURCED]` — context only, not a red-flag trigger.
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

Use the skeleton in **Determinism rules → Output template** below — it is the single source of truth for this skill's report shape.

## Citations

- 2026 FICA wage base, OASDI / Medicare rates, Additional Medicare threshold, bracket-aligned supplemental withholding rate → `md_facts` (cite as `[IRS 2026 limits]` / `[SSA 2026]`).
- IRS Pub 15 / 15-T (employer's tax guide and withholding methods).
- State withholding rates → state DOR; cite `[UNSOURCED]` if not in `md_facts` and tell the user to verify.

## Disclaimer

This explains the stub; it doesn't recommend a new W-4. For a personal withholding recommendation, hand off to **Withholding Check** in **Tax Planner**.

## Determinism rules

### Input keys

- `pay_frequency` — `weekly` | `biweekly` | `semimonthly` | `monthly`
- `period_start`, `period_end` — `YYYY-MM-DD`
- `lines` — list of `{ label, amount_usd, ytd_usd?, family: gross | pretax | tax | posttax }` (family filled by the skill if absent)
- `gross_usd`, `net_usd` — numbers (current period), `ytd_gross_usd` — number
- `filing_status` — `single` | `mfj` | `mfs` | `hoh` (from W-4)
- `residence_state`, `work_state` — two-letter codes
- `hdhp_enrolled` — boolean or null
- `elected_401k_pct` — number or null (what the user believes they elected)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Stub lines, frequency, filing status, states | **Ask — no default** | — |
| Social Security wage base | `md_facts` → `social_security_2026.wage_base` | `[SSA 2026]` |
| OASDI and Medicare employee rates | `md_facts` → `social_security_2026.fica_employee_rate`, `medicare_employee_rate` | `[SSA 2026]` |
| Additional Medicare rate | `md_facts` → `social_security_2026.additional_medicare_rate_above_threshold_mfj_250k` | `[SSA 2026]` |
| Employer Additional-Medicare withholding trigger ($200,000 wages, any filing status) | Not in md_facts — IRS (Form 8959 / Pub 15) via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| Federal supplemental withholding rate (22%) | Not in md_facts — IRS Pub 15 via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| State / local withholding rates | Not in md_facts — state DOR via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |

### Calculation method

1. **Periods per year**: weekly 52, biweekly 26, semimonthly 24, monthly 12. Annualized = period amount × periods.
2. **Classify lines** into the four families and present them in this fixed order: Gross → Pre-tax deductions → Taxes → Post-tax deductions. Within Taxes, fixed order: FIT, OASDI, Medicare, Additional Medicare, State, Local, SDI/PFL, other.
3. **Taxable wages** = gross − pre-tax deductions (note: 401(k) traditional reduces FIT wages but not FICA wages; Section 125 premiums/HSA reduce both).
4. **OASDI check**: expected = `min(FICA wages, max(0, wage_base − prior YTD FICA wages)) × fica_employee_rate`. Flag if `|actual − expected|` > $1.00, or if YTD OASDI > `wage_base × fica_employee_rate` + $1.00.
5. **Medicare check**: expected = FICA wages × `medicare_employee_rate` (+ Additional rate on YTD wages over the employer trigger). Flag if off by > $1.00.
6. **401(k) check**: implied % = 401(k) line / gross × 100; flag if `elected_401k_pct` given and `|implied − elected|` > 0.5.
7. **Take-home rate** = `net_usd / gross_usd × 100`, one decimal.
8. **Arithmetic tie-out**: gross − pre-tax − taxes − post-tax must equal net within $0.01; otherwise flag "stub does not tie" with the difference.

### Decision rules

Red-flag checks — evaluate **every** row; list each that fires. Then the next step is chosen from the second table (first match wins).

| # | Red flag condition | Flag text |
|---|---|---|
| 1 | YTD FICA wages > wage_base and OASDI > $0 this period | OASDI over-withheld past wage base |
| 2 | OASDI or Medicare off by > $1.00 (steps 4–5) | FICA calculation mismatch |
| 3 | State tax line for a state ≠ `residence_state` and ≠ `work_state` | Wrong state — payroll not updated |
| 4 | 401(k) mismatch > 0.5 points | 401(k) election miscoded |
| 5 | `hdhp_enrolled = true` and no HSA line | HSA not set up |
| 6 | A bonus line withheld at the supplemental rate | Bonus at flat supplemental rate — may under-withhold |
| 7 | Stub does not tie (step 8) | Arithmetic error on stub |
| 8 | Otherwise | No red flags |

| # | Next step | |
|---|---|---|
| 1 | Flag 3, 4, 5 or 7 fired | Contact payroll / HR with the specific fix |
| 2 | Flag 1, 2 or 6 fired, or FIT annualized looks inconsistent with filing status | **Withholding Check** (Tax Planner) |
| 3 | Otherwise | "You're all set — nothing to do" |

### Output template

```markdown
# Paycheck walkthrough — pay period {period_start}–{period_end}, frequency {pay_frequency}

## Top-line
| Item | This period | Annualized |
|---|---|---|
| Gross | | |
| Pre-tax deductions | | |
| Taxable wages (FIT) | | |
| Total taxes | | |
| Post-tax deductions | | |
| Net (take-home) | | |
| Take-home rate | {N}% | |

## Line-by-line
### Gross
| Line | Amount | What it is |
|---|---|---|
### Pre-tax deductions
| Line | Amount | What it does |
|---|---|---|
### Taxes
| Line | Amount | Expected | Check |
|---|---|---|---|
### Post-tax deductions
| Line | Amount | What it is |
|---|---|---|
{"None" where a family is empty}

## Red flags I'm flagging
- {flag text + specific fix — or "No red flags"}

## Recommended next step
{ONE item from the Next-step table}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).