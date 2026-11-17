# Refinance Analysis

description: Evaluate refinancing a mortgage, auto loan, or personal loan: break-even months, lifetime savings, NPV at the user's discount rate. Decision: refi / don't / wait. Use when rates have moved or when the user's profile has improved (credit score, equity, income).

## When to use

- An offered rate is below the current loan's rate (break-even vs hold period decides — see Determinism rules).
- Credit score has improved materially.
- User's mortgage PMI removal is in sight (refi can drop it).
- ARM is approaching reset.

## Inputs needed

- Current loan: balance, original term, months remaining, current rate, monthly P&I, escrowed amount (mortgage), PMI status, prepayment penalty (rare).
- Proposed loan: rate, term, total closing costs (origination + appraisal + title + recording + lender fees), lender credits if any.
- Time the user expects to stay in the home / keep the car.
- Tax-deduction status (mortgage interest deductibility if itemizing — usually moot under TCJA standard deduction).

## Workflow

1. **Build the new payment.** P&I given new rate and term.
2. **Compute monthly savings** = old P&I − new P&I (note: extending term lowers monthly but extends payoff and increases lifetime interest).
3. **Break-even months** = total closing costs / monthly savings. If the user plans to keep the loan past breakeven, refi is favorable.
4. **Lifetime interest comparison.** Old loan: remaining interest if continued to maturity. New loan: total interest over new term. Net delta.
5. **NPV check (optional, more rigorous).** Discount the savings stream at the user's opportunity-cost rate (often equal to the loan rate). Compare to upfront cost.
6. **Cash-in / cash-out variants** (mortgage):
   - Cash-out raises balance and may push back into PMI or jumbo territory.
   - Cash-in (paying down at refi) can drop into a better LTV bucket.
7. **Same-term vs reset-term decision.** Refi-ing a 30y mortgage with 22 years left into a fresh 30y resets — lower payment but more total interest. A 22y or 25y custom term often preserves payoff timeline.
8. **Edge cases:**
   - ARM with low initial period — model the reset path before committing.
   - Auto refi: short remaining term often means closing costs swamp savings.
   - HELOC / personal loan: variable rate risk in the proposal.

## Required citations

- Quoted new loan terms cite the Loan Estimate doc/page.
- Current loan terms cite the most recent statement.
- Closing-cost line items broken out (recording fees etc. roll into states/counties — note assumptions).

## Deliverable shape

- Markdown report `./money-desk/debt-strategist/refinance-analysis-<YYYYMMDD>.md`:
  - **Headline verdict** — Refi now / wait / don't, with the strongest reason.
  - **Side-by-side payment table** — current vs proposed.
  - **Break-even months.**
  - **Lifetime interest** — current vs proposed.
  - **Sensitivity** — what if rates drop 25 bps more / closing costs are 20% higher?
  - **Action list** — get N quotes, lock rate timing, document checklist.

## Notes

- Always shop ≥3 lenders. Loan estimates are standardized — apples-to-apples.
- Don't compare "monthly savings" without break-even months — refinancing from 30y/22-remaining to a new 30y often shows "savings" that aren't real.
- Watch for "no closing cost" loans — the cost is usually baked into a higher rate. Model both options.
- "Not professional financial advice."

## Determinism rules

### Input keys

- `loan_type` — `mortgage` | `auto` | `personal` | `heloc`
- `current` — `{ balance_usd, rate_pct, months_remaining, monthly_pi_usd, pmi_monthly_usd, prepayment_penalty_usd, is_arm (bool), arm_reset_yyyy_mm?, reset_rate_pct? }`
- `proposed` — `{ rate_pct, term_months, closing_costs_usd, lender_credits_usd, pmi_monthly_usd, cash_out_usd, cash_in_usd, is_variable (bool) }`
- `hold_months` — integer; how long the user expects to keep the loan / home / car
- `discount_rate_pct` — number (optional)
- `itemizes` — bool; `marginal_federal_rate_pct` — number (only if itemizing)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Current loan terms | **Ask — no default** (most recent statement) | — |
| Proposed terms and closing costs | **Ask — no default** (Loan Estimate) | — |
| Hold period | **Ask — no default** | — |
| Discount rate | The current loan's `rate_pct` | `[ASSUMPTION]` |
| Mortgage-rate sanity check | `md_facts` → `behavioral_assumptions_safe_defaults.mortgage_rate_assumption_check_freddie_pmms` (compare the quote to the current PMMS via `md_sources`) | `[UNSOURCED]` until fetched |
| Tax effect of interest | Ignored unless `itemizes` = true (then interest × marginal rate, with the cap in `md_facts` → `mortgage_and_real_estate_2026.mortgage_interest_deduction_cap_post_tcja`) | `[IRS 2026 limits]` |
| ARM reset rate | **Ask — no default** | — |

### Calculation method

> **Calculator:** run steps 1–8 with `md_calc` → `refinance` (fixed-rate loans; call it again with changed inputs for steps 9–10; ARM resets by hand). Use its numbers verbatim, tagged `[CALCULATED]`; the steps below define what it computes — work them by hand only if `md_calc` is unavailable.

1. **New principal** = `current.balance_usd + cash_out_usd − cash_in_usd` (closing costs paid in cash, not rolled in, unless the Loan Estimate says otherwise — then add them here and set out-of-pocket to 0).
2. **New P&I** by standard amortization, `r = rate_pct/100/12`, `n = term_months`.
3. **Monthly saving** = `(current.monthly_pi_usd + current.pmi_monthly_usd) − (new P&I + proposed.pmi_monthly_usd)`.
4. **Net upfront cost** = `closing_costs_usd − lender_credits_usd + prepayment_penalty_usd`.
5. **Break-even months** = `ceil(net upfront cost ÷ monthly saving)`; if monthly saving ≤ 0, "No break-even".
6. **Hold-period cost** (the primary test): `old = Σ old payments for min(hold_months, months_remaining) + old balance at hold_months`; `new = net upfront cost + Σ new payments for min(hold_months, n) + new balance at hold_months − cash_out_usd + cash_in_usd`. `hold_saving = old − new`. ARM: old-loan payments switch to `reset_rate_pct` at `arm_reset_yyyy_mm`.
7. **Lifetime interest:** old = Σ interest to maturity on the current schedule; new = Σ interest over `n`. `lifetime_delta = old − new`.
8. **NPV** = −net upfront cost + Σ `monthly saving ÷ (1 + d/12)^t`, t = 1..min(hold_months, n), `d = discount_rate_pct/100`.
9. **Term-match check:** if `term_months` > `months_remaining` + 12, rerun steps 2–8 with the shortest standard term ≥ `months_remaining` (mortgage: 180, 240, 300, 360; auto/personal: 36, 48, 60, 72) and show it alongside.
10. **Sensitivity:** proposed rate −0.25 pp; closing costs +20%.
11. **Rounding:** compute in cents; report whole dollars; months as integers.

### Decision rules

Evaluate top to bottom; the first match is the verdict.

| # | Condition | Verdict |
|---|---|---|
| 1 | Federal student loan → private | Route to Student Loan Review (federal protections would be lost) |
| 2 | `hold_saving` ≤ 0 | Don't refinance |
| 3 | Monthly saving > 0 and break-even months > `hold_months` | Don't refinance |
| 4 | Monthly saving > 0 and break-even months > `hold_months` − 12 | Wait — marginal; re-quote if rates fall another 0.25 pp or costs drop |
| 5 | `term_months` > `months_remaining` + 12 and `lifetime_delta` < 0 | Refinance with the matched term from step 9 (if it still passes rows 1–2), else Don't |
| 6 | `proposed.is_variable` = true | Refinance only with the rate-cap / reset path shown; flag variable-rate risk |
| 7 | Otherwise | Refinance now — shop ≥ 3 Loan Estimates |

### Output template

```markdown
# Refinance Analysis — {loan_type} — {YYYY-MM-DD}

## Headline verdict
**{Refinance now / Refinance with matched term / Wait / Don't refinance}** — rule #{n}: {strongest reason}.

## Side-by-side
| Item | Current | Proposed | Matched term |
|---|---|---|---|
| Balance / principal | | | |
| Rate | | | |
| Term remaining (months) | | | |
| Monthly P&I | | | |
| PMI | | | |
| Monthly total | | | |

## Break-even
Net upfront cost ${cost} ÷ monthly saving ${saving} = **{months} months** vs hold **{hold_months} months**.

## Hold-period cost
| Scenario | Cost over hold | Saving |
|---|---|---|

## Lifetime interest
| Scenario | Total interest |
|---|---|
| Current | |
| Proposed | |
| Delta | |

## NPV
{value at {d}%}

## Sensitivity
| Case | Break-even | Hold saving | Verdict |
|---|---|---|---|
| Base | | | |
| Rate −0.25 pp | | | |
| Closing costs +20% | | | |

## Action list
- {get ≥ 3 Loan Estimates, lock timing, document checklist}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
