## Lifestyle Inflation Audit

description: Compare 12-month spending trend against income trend to find where raises have leaked into spending categories invisibly. Surfaces specific creep categories and recommends an automated savings-rate ratchet to absorb future raises before they hit checking.

## When to use

- "I make more than I used to but I don't feel richer."
- After a meaningful raise / promotion / equity vest / bonus.
- Annual review baseline.
- After a job change with a higher salary.
- Couples where one partner's income increased materially.

## Inputs needed

- 12 months of categorized spending (from existing budget tool, Mint export, YNAB export, or bank-statement aggregation).
- Income for the same 12 months (gross AND net).
- Income for the prior 12 months (gross AND net) — required for the trend.
- Major one-offs to exclude (wedding, baby, medical, move) so the comparison is apples-to-apples.

## Workflow

### 1. Income trend
- Compute current-12-month gross income, prior-12-month gross income, and the % change.
- Compute current-12-month NET income (after tax, after 401(k), after HSA / FSA) and prior-12-month net.
- Compute the **raise capture rate** = (current net − prior net) ÷ (current gross − prior gross). For most people, this lands at 50-65%; below 50% suggests heavy 401(k) increase or higher tax bracket, both fine.

### 2. Spending trend, by category
- For each category, compute current-12-month vs prior-12-month and the % change.
- Sort by absolute $ increase (not %).
- Flag any category that increased > 15% YoY as a "creep candidate".
- Recompute excluding stated one-offs.

### 3. The savings-rate test
- **Savings rate** = (net income − total spending) ÷ net income.
- Compare current 12-month savings rate to prior 12-month savings rate.
- If income grew but less than 50% of the net raise was saved → lifestyle inflation is happening, regardless of feel.
- Healthy rule of thumb: 50% of every net raise goes to savings before the new lifestyle bakes in.

### 4. The categories most prone to creep (typical)
- **Housing** (a move, an upgrade, a vacation home) — the biggest and stickiest, hardest to reverse.
- **Cars** (lease upgrade, second car, "deserving" a new one) — second-biggest, second-stickiest.
- **Dining out + delivery** — slow leak, easy to dismiss but adds up.
- **Subscriptions** (especially auto-renewing at higher tiers).
- **Kids' activities + private school** — high cost, high social-pressure to maintain.
- **Travel** (class upgrade, frequency increase).
- **Wellness / fitness / personal services** (trainer, weekly cleaning, meal kits).

### 5. Recommendations
For each flagged category, the prescription is one of three:
- **Conscious keep** — user values it, can articulate why, willing to fund it. Move on.
- **Conscious cut** — user wants to reduce; pre-commit a target $ for next 90 days; revisit.
- **Automate around** — change the system so spending can't expand: split the paycheck before checking sees it.

### 6. The automated savings-rate ratchet
- Set up auto-transfer at the next pay cycle that takes the **incremental** net raise straight to investments (50%) and joint goals (25%), leaving only 25% to land in checking.
- For 401(k) contribution increase, use the employer's auto-escalation feature (typically 1%/year).
- The principle: a dollar that never hits the spendable account never has to be defended later.

## Output

- 12-month income vs spending trend chart (text table).
- Savings-rate comparison (this 12 vs prior 12).
- Top 5 creep categories with $ increase and recommendation per category.
- Specific automation suggestions (auto-transfer amounts, 401(k) escalation %).
- Pre-committed re-audit date (default 6 months).

## Citations / sources

- Lifestyle-inflation / hedonic-adaptation literature: Brickman & Campbell 1971; Diener et al. 2006. Cite or mark `[UNSOURCED]`.
- Savings-rate / retirement-readiness benchmarks: Vanguard "How America Saves" annual report.

## Disclaimer

Analysis only. Recommendations to "cut" a category are suggestions, not prescriptions — what matters is conscious choice. Pair this with `decision_journal` for any pre-committed cut so future-self can audit whether the cut held.

## Determinism rules

### Input keys

- `current_12m_spending` — list of `{ category, amount_usd }` (most recent 12 months)
- `prior_12m_spending` — list of `{ category, amount_usd }` (the 12 months before that; same category names)
- `current_12m_gross_usd`, `prior_12m_gross_usd` — numbers
- `current_12m_net_usd`, `prior_12m_net_usd` — numbers (after tax, 401(k), HSA/FSA, premiums)
- `one_offs` — list of `{ category, period: current | prior, amount_usd, label }` to exclude
- `next_raise_net_monthly_usd` — number or null (expected increase in monthly take-home)
- `user_category_choices` — optional map `{ category: keep | cut | automate }`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Spending and income for both 12-month windows | **Ask — no default** (no trend without the prior year) | — |
| One-off exclusions | None excluded unless the user lists them | `[USER-PROVIDED]` |
| Ratchet split of the incremental net raise (50% investments / 25% joint goals / 25% checking) | Skill convention stated in this file | `[ASSUMPTION]` |
| 401(k) auto-escalation step | Plan's own feature; **Ask** the plan — no default | — |

### Calculation method

1. Subtract `one_offs` from the matching category and period before any other step.
2. `gross_change_pct = (current_gross − prior_gross) / prior_gross × 100`; same for net.
3. **Raise capture rate** = `(current_net − prior_net) / (current_gross − prior_gross) × 100`; if gross change ≤ 0, report "Not applicable — no raise".
4. Per category: `Δ$ = current − prior`; `Δ% = Δ$ / prior × 100` (prior = 0 → "new category"). Unmatched category names → listed as new / dropped.
5. **Creep candidates** = categories with `Δ%` > 15 or "new category"; sort by `Δ$` descending; tie → category A–Z. Top 5 go in the report.
6. **Savings rate** (net basis) = `(net_income − total_spending) / net_income × 100` for each window; `Δ savings rate` in percentage points.
7. **Share of net raise saved** = `((current_net − current_spending) − (prior_net − prior_spending)) / (current_net − prior_net) × 100`.
8. **Ratchet amounts** (if `next_raise_net_monthly_usd` given, else use `(current_net − prior_net)/12`): investments 50%, joint goals 25%, checking 25%; round to whole dollars.
9. Re-audit date = today + 6 months.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Overall verdict | Result |
|---|---|---|
| 1 | `current_net − prior_net` ≤ 0 | No raise to leak — report category drift only; no ratchet |
| 2 | Share of net raise saved < 0 (savings fell while income rose) | **Lifestyle inflation — severe**; ratchet + cut review on top 5 |
| 3 | Share of net raise saved < 50 | **Lifestyle inflation**; set up the ratchet |
| 4 | Otherwise (≥ 50) | **Healthy** — raise mostly captured; ratchet optional |

| # | Per-category prescription | |
|---|---|---|
| 1 | User chose a prescription in `user_category_choices` | Use it |
| 2 | Category is Housing or Cars | Conscious keep or conscious cut — user decides; no automate option (contracted costs) |
| 3 | Otherwise | Automate around (default) |

### Output template

```markdown
# Lifestyle Inflation Audit — {current window} vs {prior window}

## Verdict
**{Healthy | Lifestyle inflation | Lifestyle inflation — severe | No raise}** (rule #{n})

## Income vs spending trend
| Metric | Prior 12 mo | Current 12 mo | Δ $ | Δ % |
|---|---|---|---|---|
| Gross income | | | | |
| Net income | | | | |
| Total spending | | | | |
| Savings rate (net) | | | {pp} | |
| Raise capture rate | | | | |
| Share of net raise saved | | | | |

## Top 5 creep categories
| Category | Prior | Current | Δ $ | Δ % | Prescription |
|---|---|---|---|---|---|
{or "None — no category rose more than 15%"}

## Excluded one-offs
{list — or "None"}

## Automation
| Transfer | $ / month | Destination |
|---|---|---|
| Investments (50%) | | |
| Joint goals (25%) | | |
| Stays in checking (25%) | | |
- 401(k) auto-escalation: {plan's step, or "Ask plan"}

## Re-audit date
{date}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
