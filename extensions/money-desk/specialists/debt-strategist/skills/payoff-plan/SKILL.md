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
6. **Pick the method** using the Decision rules below (snowball wins only when its extra interest is small and its first payoff comes at least 3 months sooner).
7. **Special cases:**
   - Promo APR debts: pay them in the right order (just before promo expires) to avoid retroactive interest on deferred-interest cards.
   - Federal student loans: don't aggressively prepay if PSLF / IDR forgiveness applies (route to Student Loan Review).
   - 0% balance-transfer offers: model the transfer + fee and the new schedule.
8. **Behavioral notes.** Auto-pay set up. Calendar reminders for promo expirations. No new debt during the plan.

## Required citations

- Each debt cites the statement/source.
- Schedule arithmetic is verifiable; show the formula for the first month and last month.

## Deliverable shape

- Markdown report + optional XLSX `./money-desk/debt-strategist/payoff-plan-<YYYYMMDD>.md`:
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

## Determinism rules

### Input keys

- `debts` — list of `{ name, balance_usd, apr_pct, min_payment_usd, promo_apr_pct?, promo_end_yyyy_mm?, deferred_interest? (bool), federal_student_loan? (bool), forgiveness_track? (bool — PSLF / IDR) }`
- `monthly_budget_usd` — number; total $/month available for all debts (minimums + extra)
- `method_preference` — `avalanche` | `snowball` | `undecided`
- `start_yyyy_mm` — first payment month (default: next calendar month)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Balance, APR, minimum payment per debt | **Ask — no default** | — |
| Monthly budget | **Ask — no default** | — |
| APR after a promo ends | The debt's regular `apr_pct` | `[USER-PROVIDED]` |
| Minimum payment over time | Held at today's `min_payment_usd` (conservative; real minimums fall as balances fall) | `[ASSUMPTION]` |
| No new charges during the plan | Fixed convention | `[ASSUMPTION]` |

### Calculation method

1. **Feasibility.** If `sum(min_payment_usd) > monthly_budget_usd`, stop: report the shortfall and route to Budget Coach. No schedule is produced.
2. **Exclusions.** Debts with `forgiveness_track = true` get minimum payments only and never receive extra; flag them for Student Loan Review.
3. **Target order** (fixed at month 0, never re-sorted):
   - Avalanche: `apr_pct` descending → tie: smaller `balance_usd` first → tie: `name` A–Z.
   - Snowball: `balance_usd` ascending → tie: higher `apr_pct` first → tie: `name` A–Z.
   - Override (both methods): a `deferred_interest` debt whose balance would not reach $0 by `promo_end_yyyy_mm` under the method's order moves to the front of the order.
4. **Monthly loop**, for month m = 1, 2, … in this exact sequence:
   1. Interest per debt = `round(balance × (rate_pct / 100) / 12, 2)`, where `rate_pct` is `promo_apr_pct` while the promo is active, else `apr_pct`. Monthly APR/12 convention, no daily compounding.
   2. Add interest to each balance.
   3. Pay each debt `min(min_payment_usd, balance)`.
   4. `extra = monthly_budget_usd − total paid in step 3` (this automatically rolls freed minimums from paid-off debts forward).
   5. Apply `extra` to the first unpaid debt in target order; if it hits $0, carry the remainder to the next target in the same month.
   6. Stop when every balance is $0. Hard cap: 600 months — if reached, report "does not pay off at this budget".
5. **Totals per method:** months to debt-free, total interest (sum of step-1 interest), debt-free month (`start_yyyy_mm` + months − 1), month each debt reaches $0.
6. **Rounding:** compute in cents; report dollars rounded to the nearest $1 and months as integers.
7. **Verification line:** show the step-4 arithmetic for month 1 and the final month of the recommended method.
8. Run the loop as code when a code tool is available; otherwise compute it in full and show the month-1 and final-month check.

### Decision rules

Evaluate top to bottom; the first match is the recommendation. `interest_gap = snowball_total_interest − avalanche_total_interest`; `first_win_gap = avalanche months to first payoff − snowball months to first payoff`.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Feasibility failed (step 1) | No plan — Budget Coach first |
| 2 | `method_preference` is `avalanche` or `snowball` | That method; state `interest_gap` as its cost or saving |
| 3 | `interest_gap ≤ max($250, 1% of total starting balance)` **and** `first_win_gap ≥ 3` | Snowball (motivation is worth the small cost) |
| 4 | Otherwise | Avalanche |

### Output template

```markdown
# Debt Payoff Plan — {start_yyyy_mm}

## Headline
Recommended: **{method}** — debt-free in **{months} months ({debt_free_yyyy_mm})**, total interest **${interest}**.

## Debt inventory
| Debt | Balance | APR | Minimum | Promo / notes |
|---|---|---|---|---|

## Method comparison
| Method | Months to debt-free | Debt-free month | Total interest | First debt paid off (month) |
|---|---|---|---|---|
| Avalanche | | | | |
| Snowball | | | | |

## Payoff order and milestones ({method})
| Order | Debt | Paid off (month #) | Paid off (YYYY-MM) |
|---|---|---|---|

## Why this method
{decision rule # that fired and the numbers behind it}

## Special cases
{deferred-interest overrides, forgiveness-track exclusions — or "None"}

## Verification
{month-1 and final-month arithmetic}

## Action list
- {auto-pay, promo-expiry reminders, routing}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).