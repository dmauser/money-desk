## Goal-Based Savings Plan

description: For each named savings goal (home down payment, wedding, sabbatical, big car, dream trip, etc.), compute the required monthly contribution given target amount, time horizon, and an appropriate rate-of-return assumption. Recommend an account/allocation by horizon. Use when the user wants to size and sequence financial goals.

## When to use

- After Net Worth Snapshot and Emergency Fund (this is goal-tier above foundation).
- Major life event (engagement, planning a baby, planning a move).
- Annual planning ("what am I saving for this year").
- When goals feel vague — name them, time-stamp them, price them.

## Inputs needed

- For each goal:
  - **Name** — "House down payment", "2026 sabbatical", "Kitchen reno".
  - **Target amount** — today's dollars, or future dollars if known (e.g., "$80k for a 20% down on a $400k house"). Inflate if helpful.
  - **Target date** — month/year.
  - **Already saved** — current balance earmarked for this goal.
  - **Priority** — must-have / want / nice-to-have.
- Total monthly savings capacity (after taxes, essential expenses, EF contribution, retirement, debt payoff).

## Workflow

1. **Time-horizon bucket each goal.**
   - **< 2 years** — capital preservation. Assumed return: HYSA / T-bill rate (cite current).
   - **2–5 years** — conservative blend. Assumed return: 3–4% real (state explicitly).
   - **5+ years** — equity-heavy. Assumed return: 5–6% real.
2. **Compute required monthly contribution** for each goal.
   - PMT formula: PMT = (FV − PV × (1+r)^n) × r / ((1+r)^n − 1), where r = monthly rate, n = months.
   - Show the formula inputs in the report (FV, PV, r, n).
3. **Aggregate.** Sum required monthly across all goals. Compare to monthly savings capacity.
4. **If aggregate > capacity, sequence.** Three legitimate moves:
   - (a) Extend the timeline of lower-priority goals.
   - (b) Reduce the target (smaller wedding, used car instead of new).
   - (c) Increase savings capacity (Budget Coach).
   - Show the user the trade-offs explicitly; don't pick for them.
5. **Account/allocation recommendation per goal:**
   - Short-horizon: HYSA, named sub-account ("Wedding 2026").
   - Mid-horizon: brokerage with 40/60 or 60/40 allocation, low-cost index funds.
   - Long-horizon: brokerage with ~80/20 allocation; if 10+ years, often eligible to share allocation with retirement assets via Investing Advisor.
6. **Tax-account check.** Down payment can use up to $10k Roth IRA earnings penalty-free for first-time-buyer (lifetime); for other goals, taxable usually correct.

## Required citations

- Return assumptions cite "planning assumption — not a guarantee" with a source for the historical basis (e.g., long-run S&P returns from Damodaran or Vanguard).
- Current HYSA/T-bill rate cites institution + date.
- PMT math shows the inputs so the user can verify.

## Deliverable shape

Markdown report `./money-desk/net-worth-goals/goal-plan-<YYYYMMDD>.md`:
- **Headline** — e.g., "5 goals, $1,950/mo required, $2,200/mo capacity. Feasible."
- **Goal table** — goal, target, horizon, current $, assumed return, required $/mo, recommended account.
- **Aggregate** — sum vs capacity; surplus or deficit.
- **Scenarios (if deficit)** — three sequenced options with the trade-offs.
- **Action checklist** — open which accounts, set which auto-transfers, integrate with Budget Coach plan.

## Notes

- For a house down payment specifically, also include closing costs (~2–3% of price), inspection, moving, immediate-need repairs/furniture — most people under-budget the *total* cost of buying.
- For a wedding, the savings goal is often only the "couple's contribution" piece; parents/in-laws may cover portions — get clarity before sizing.
- Don't over-engineer. 3–5 active goals is realistic. Park "someday" goals on a list without a plan until the user wants to activate one.
- For 5+ year goals that overlap with retirement-allocation needs, hand off to Investing Advisor (`md_iv_role`) — they should not be funded in a separate, redundant allocation.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).