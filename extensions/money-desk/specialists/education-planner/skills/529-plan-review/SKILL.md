## 529 Plan Review

description: Audit an existing 529 college-savings plan: state plan choice, fund lineup and expense ratios, age-based glidepath, beneficiary correctness, state tax deduction or recapture exposure, and whether to roll to a better plan. Use when the user wants a tune-up of an existing 529 (not selecting a first one).

## When to use

- The user has a 529 they "set up years ago" and never reviewed.
- After a state move (state tax deduction may shift; some states have recapture).
- When considering changing beneficiaries (kid 2 → kid 1, parent → kid).
- Before approaching college (glidepath should be majority bonds/cash within 3–5y of college).

## Inputs needed

- 529 plan statement (most recent): plan name (e.g., "Utah my529", "NY 529 Direct Plan"), balance, monthly contribution, beneficiary, fund holdings.
- User's state of residence (for tax-deduction analysis).
- Beneficiary's expected college start year.
- Whether the user is currently taking the state-tax deduction.

## Workflow

1. **State plan vs out-of-state plan.** Identify whether the current plan is the user's own state's plan. If not, quantify the state-tax-deduction lost ($x/yr at user's marginal state rate) and weigh against expense-ratio savings of the chosen plan. Note: some states (e.g., NY, VA, IN, MD) require *in-state* plan to claim deduction; others (AZ, KS, MN, MO, MT, PA) allow deduction for any state's plan.
2. **Fund lineup audit.** List holdings, expense ratio of each, age-based / target-date glidepath if applicable. Flag funds with expense ratio > 0.20% as expensive for a 529.
3. **Glidepath check.** Plot current stock/bond allocation against years-to-college. Heuristic: ~80%+ stocks when 15+ years out, sliding to ~20% stocks at college start (similar to a target-date retirement fund but compressed).
4. **Beneficiary check.** Confirm beneficiary is correct and SSN is right. Confirm successor owner is set (matters if the parent dies before the child uses the funds).
5. **Recapture risk.** If the user moved states or is contemplating rolling to a different state's plan, flag recapture rules (e.g., NY recaptures the state deduction on rollover out).
6. **2024+ rules.** Note new 529-to-Roth IRA rollover (up to $35k lifetime, account 15+ years old, contribution limits apply); flag if relevant.

## Required citations

- Plan name cites the statement.
- Expense ratios cite the plan's official disclosure (state .gov or plan website).
- State-tax-deduction $ amount cites the user's marginal state rate and current contribution.

## Deliverable shape

Markdown report `./money-desk/<CHILD>/529-review-<YYYYMMDD>.md`:
- **Headline** — e.g., "Plan is fine but glidepath is 5 years behind; rolling to in-state would gain $440/yr in state tax savings."
- **Plan summary table** — plan, state, balance, monthly contribution, beneficiary, successor.
- **Fund audit table** — fund, % of portfolio, expense ratio, asset class, flag.
- **Glidepath chart** (text-based OK) — current vs recommended stock/bond mix by years-to-college.
- **Action list** — ranked by $ impact, with the actual steps (which form, which website).

## Notes

- 529-to-Roth rollover (SECURE 2.0): $35k lifetime cap, account must be 15+ years old, last 5 years of contributions can't be rolled, subject to annual Roth IRA contribution limits and earned-income requirement. Useful for "what if Kid doesn't go to college" — but not a primary planning tool.
- Apprenticeships and student-loan payments (up to $10k lifetime) are now qualified 529 expenses.
- For high earners, the state-tax deduction is often a smaller win than the lower expense ratios at the cheapest plans (UT, NY, IL Bright Start). Show the user the math.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).