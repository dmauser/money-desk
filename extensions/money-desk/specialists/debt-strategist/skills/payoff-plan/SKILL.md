# Payoff Plan

description: Build a debt payoff plan comparing avalanche (highest APR first) vs snowball (smallest balance first), with a hybrid option. Outputs month-by-month schedule, total interest paid, and payoff date for each method. Use whenever the user wants to "get out of debt."

## When to use

- Multiple debts and the user wants a written plan.
- The user is choosing between avalanche and snowball methods.
- Post-budget-review when surplus cash has been identified.

## Inputs needed

- Per-debt: lender, balance, APR (separate purchase / cash-advance / promo APRs), minimum payment, due date.
- Total monthly $ available for debt payment (sum of minimums + the "extra").
- Any introductory / promo APRs and their expiration dates.
- Special features (deferred-interest store cards, balance-transfer windows, federal vs private student loans).

## Workflow

1. **Compile the debt inventory** sorted in two views — by APR descending (avalanche) and by balance ascending (snowball).
2. **Cover all minimums.** Confirm `total minimums ≤ available $/mo`. If not, this is a budget problem first — route to Budget Coach.
3. **Apply extra payment** in two models:
   - **Avalanche:** extra → highest-APR debt until paid; cascade.
   - **Snowball:** extra → smallest balance until paid; cascade.
4. **Compute schedules.** Month-by-month: balance, interest accrued, payment, ending balance. Per debt and aggregated.
5. **Compare outputs.**
   - Total months to debt-free.
   - Total interest paid.
   - Cash flow freed per month over the schedule (helpful chart).
6. **Hybrid recommendation.** Sometimes the snowball "win" of paying off a small card first is worth $50–$200 of extra interest to keep the user motivated. Flag this if the avalanche savings are small.
7. **Special cases:**
   - Promo APR debts: pay them in the right order (just before promo expires) to avoid retroactive interest on deferred-interest cards.
   - Federal student loans: don't aggressively prepay if PSLF / IDR forgiveness applies (route to Student Loan Review).
   - 0% balance-transfer offers: model the transfer + fee and the new schedule.
8. **Behavioral notes.** Auto-pay set up. Calendar reminders for promo expirations. No new debt during the plan.

## Required citations

- Each debt cites the statement/source.
- Schedule arithmetic is verifiable; show the formula for the first month and last month.

## Deliverable shape

- Markdown report + optional XLSX `./reports/debt-strategist/payoff-plan-<YYYYMMDD>.md`:
  - **Headline** — months-to-debt-free and total interest under each method.
  - **Inventory table** — debt, balance, APR, min, due date.
  - **Avalanche schedule summary** + key milestones.
  - **Snowball schedule summary** + key milestones.
  - **Hybrid recommendation** with rationale.
  - **Action list** — what to set up (auto-pay, transfers, etc.).

## Notes

- Avalanche always wins on math. Snowball sometimes wins on adherence. Recommend the one the user will actually finish.
- Watch for "minimum payment" definitions that include only interest — those don't make progress.
- "Not professional financial or legal advice."
