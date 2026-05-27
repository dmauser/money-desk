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
- **Savings rate** = (income − total spending) ÷ income.
- Compare current 12-month savings rate to prior 12-month savings rate.
- If income grew but savings rate did NOT grow proportionally → lifestyle inflation is happening, regardless of feel.
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
