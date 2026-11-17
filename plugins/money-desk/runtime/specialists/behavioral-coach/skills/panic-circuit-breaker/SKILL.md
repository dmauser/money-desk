## Panic Circuit Breaker

description: Protocol for when the user wants to make an urgent financial decision driven by fear (market drop, layoff news, scary headline) or greed (FOMO on a hot asset, "everyone's making money on X"). Slows the decision down, surfaces tax cost and IPS alignment, and either gets the user to a 24-48 hour cooldown OR confirms the action is genuinely IPS-consistent and proceeds.

## When to use

- "Should I sell everything?" / "The market is crashing"
- "I want to buy $20k of [hot asset] right now"
- "I'm going to cash out my 401k to pay off..."
- Any decision the user describes with "I need to do this NOW" / "before X happens"
- After-hours / weekend triggers when the user can't actually execute (perfect cooldown moment)

## Inputs needed

Keep it short — this skill must run FAST during a panic moment.

- **trigger** (required) — what just happened? (market drop, layoff news, scary headline, FOMO on hot asset, etc.)
- **urge** (required) — what does the user want to do RIGHT NOW? (sell everything, cash out 401k, buy $20k of X)
- **dollar_size** (required) — approximate $ involved
- **account_type** (required) — `taxable` / `traditional_401k_or_ira` / `roth` / `hsa` / `529` / `other`
- **has_written_ips** — does the user have a written Investment Policy Statement?
- **market_hours** — can the user actually execute right now, or is it after-hours/weekend?

## The protocol (run it like a checklist)

1. **Acknowledge the feeling, don't dismiss it.**
   - "Markets dropping fast is genuinely uncomfortable; you're not wrong to feel anxious."
   - This is NOT "calm down" — that's invalidating and triggers more action.

2. **State the cooldown rule explicitly.**
   - "Money Desk rule: any urgent reversal of your written plan waits 24 hours. 48 if it's > $50k or irrevocable."
   - "If you still want it after the wait, we'll do the math together and you decide. The wait is the only commitment you make right now."

3. **Anchor to the IPS (Investment Policy Statement).**
   - "Your written plan says: [target stock %, rebalance rule, when to sell criteria]. Does this action match those criteria, or override them?"
   - If no IPS exists, that's the next session — but for now, surface what was previously decided in calmer conditions.

4. **Surface the tax + transaction cost of the urgent action.**
   - Selling taxable account at gain: LTCG / STCG hit, NIIT.
   - Selling 401(k) pre-59½: 10% penalty + ordinary income + employer payment may withhold 20%.
   - 30-day wash sale rule if planning to re-buy.
   - Bid-ask spread + (if applicable) ETF premium/discount on a panic day.
   - Concrete dollar number: "this action costs you $X in tax + ~$Y in transaction friction."

5. **Surface the prediction implicit in the action.**
   - "Selling now bets that prices will be lower when you re-buy. What's your re-entry rule? At what price do you buy back?"
   - Almost always: there is no re-entry rule. This usually ends the panic on its own.

6. **Surface the historical base rate.**
   - Quote the frequency of 10%+ intra-year S&P 500 drawdowns and how often those years still finished positive, taken from JPM Guide to the Markets or Capital Group's market-decline data with source and date. If you cannot retrieve it, say so and tag `[UNSOURCED]` — never quote a number from memory.

7. **Decide the next step. One of three:**
   - **Wait 24-48h, then revisit.** (Most common — and the only one that requires no action right now.)
   - **Take a small, deliberate action that satisfies the urge without overriding the plan.** E.g., "rebalance to plan rather than going all-cash"; "buy a small position in the FOMO asset instead of the full amount" — capped at 5% of the urge's dollar size. Pre-commit the size IN WRITING.
   - **Confirm the action IS IPS-consistent and proceed.** (Rare — but if the IPS includes a documented "sell-when-X" rule and X is happening, then execute the planned action, not an emotional one.)

8. **Document the agreement.**
   - Write the cooldown commitment and the next-revisit date in the user's plan file. Sets accountability.

## Output

A short 5-7 line protocol message to the user, ending with the chosen next step (wait / partial / proceed) and the next-revisit date.

## What this skill does NOT do

- It does not analyze the portfolio (hand to `md_iv_role` after cooldown).
- It does not recommend a market view ("I think it's a buying opportunity" / "I think it'll crash more"). Money Desk doesn't predict markets.
- It does not handle non-money panic (job, health, relationship). Refer to appropriate professional.

## Citations / sources

- Loss aversion / disposition effect: Kahneman & Tversky 1979; cite as "behavioral-economics literature" and mark `[UNSOURCED]` if specific numbers used.
- Historical drawdown stats: cite the source (JPM Guide to the Markets, Capital Group, or Morningstar).
- Wash sale: IRC §1091.

## Disclaimer

Analysis only. Not therapy. If urgency is driven by something beyond money (e.g., gambling addiction, suicidal ideation, suspected financial abuse) — refer to 988 (US) or appropriate professional immediately. Do not coach through a crisis.

## Determinism rules

### Input keys

Names match `md_bh_skill_panic_circuit_breaker` in `intake-schemas.mjs`:

- `trigger` — string, what just happened
- `urge` — string, the action the user wants to take now
- `dollar_size` — number, USD involved
- `account_type` — `taxable` | `traditional_401k_or_ira` | `roth` | `hsa` | `529` | `other`
- `has_written_ips` — boolean (default false)
- `market_hours` — boolean (default true; false = after-hours / weekend / holiday)

Optional (used only if the user volunteers them; never block on them): `cost_basis_usd`, `holding_period_over_1yr` (boolean), `age` (integer), `marginal_rate_pct`, `ips_rule_text` (string).

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Cost basis / holding period (taxable sale) | **Ask — no default**; if not given, show the tax line as a formula, not a dollar figure | — |
| Marginal rate | **Ask — no default** | — |
| LTCG rate bands | `md_facts` → `income_tax_brackets_mfj_2026.ltcg_qualified_dividend_brackets_mfj` | `[IRS 2026 limits]` |
| NIIT threshold | `md_facts` → `income_tax_brackets_mfj_2026.niit_threshold_mfj` / `niit_threshold_single` | `[IRS 2026 limits]` |
| 10% early-withdrawal penalty, 20% mandatory 401(k) withholding | Statutory (IRC §72(t), §3405(c)) — cite | — |
| Historical drawdown base rates | Cite JPM Guide to the Markets / Capital Group / Morningstar via `md_sources`; else `[UNSOURCED]` — never quote a number from memory | `[UNSOURCED]` |

### Calculation method

1. Classify the urge: **sell/withdraw** (urge reduces invested assets) or **buy** (urge adds a concentrated position). If unclear, ask one clarifying question.
2. **Cooldown hours** from the Decision rules cooldown table.
3. **Cost of the urgent action** (sell/withdraw only):
   - `taxable`: `gain = dollar_size − cost_basis_usd`; tax = gain × (LTCG rate if `holding_period_over_1yr` else `marginal_rate_pct`/100) (+ 3.8% NIIT if over threshold). If basis unknown → print the formula with `[need basis]`.
   - `traditional_401k_or_ira`: tax = `dollar_size × marginal_rate_pct/100` + penalty `dollar_size × 10%` if `age` < 59½ (rule-of-55 exceptions noted); 401(k) cash withheld at 20%.
   - `roth`, `hsa`, `529`: name the specific non-qualified-withdrawal consequence (earnings taxed + 10% / 20% HSA / 10% 529 penalty) without a dollar figure unless earnings are known.
   - Wash-sale note if the urge includes re-buying within 30 days.
4. **Prediction prompt**: state the implicit prediction and ask for the re-entry rule (sell) or exit rule (buy).
5. **Partial-action cap** (if chosen): sell → rebalance back to the IPS target only; buy → ≤ 5% of `dollar_size`, written down before execution.
6. Revisit date = now + cooldown hours (if `market_hours = false`, the cooldown starts now and the earliest action is the next market open after the cooldown ends).
7. Keep the user-facing message to 5–7 lines.

### Decision rules

Evaluate top to bottom; first match wins within each table.

| # | Cooldown | Hours |
|---|---|---|
| 1 | Urge involves self-harm, gambling, coercion, or a non-money crisis | Stop — refer to 988 / professional; no money protocol |
| 2 | `dollar_size` > 50,000 or action is irrevocable (withdrawal from a tax-advantaged account, account closure, surrender) | 48 |
| 3 | Otherwise | 24 |

| # | Next step | Choice |
|---|---|---|
| 1 | `has_written_ips = true` and `ips_rule_text` names this exact trigger and action | **Proceed** — execute the IPS action as written (after cooldown if row 2 above applied) |
| 2 | User has no re-entry / exit rule and accepts the cooldown | **Wait** 24/48h, then revisit |
| 3 | User refuses to wait | **Small deliberate action** — capped per step 5, written down first |
| 4 | Otherwise | **Wait** |

### Output template

```markdown
**Circuit breaker — {trigger}**

1. {acknowledgement — one sentence, no "calm down"}
2. Rule: this waits **{24 | 48} hours** — until {revisit datetime}.
3. Your plan: {IPS rule, or "No written IPS — that's the next session"}
4. Cost of acting now: {tax $ / penalty $ / formula} + transaction friction
5. The bet you'd be making: {implicit prediction} — your re-entry/exit rule? {answer or "none"}
6. History: {cited base-rate line, or "[UNSOURCED] — not quoting a number"}
7. **Next step: {Wait | Small deliberate action ({cap}) | Proceed per IPS}** — revisit {date}.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
