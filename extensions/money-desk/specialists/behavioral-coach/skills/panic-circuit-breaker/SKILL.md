## Panic Circuit Breaker

description: Protocol for when the user wants to make an urgent financial decision driven by fear (market drop, layoff news, scary headline) or greed (FOMO on a hot asset, "everyone's making money on X"). Slows the decision down, surfaces tax cost and IPS alignment, and either gets the user to a 24-48 hour cooldown OR confirms the action is genuinely IPS-consistent and proceeds.

## When to use

- "Should I sell everything?" / "The market is crashing"
- "I want to buy $20k of [hot asset] right now"
- "I'm going to cash out my 401k to pay off..."
- Any decision the user describes with "I need to do this NOW" / "before X happens"
- After-hours / weekend triggers when the user can't actually execute (perfect cooldown moment)

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
   - "The S&P has had a 10%+ intra-year drawdown in roughly half of all years since 1928. In years it drew down 10-20%, full-year returns were positive about 60% of the time. [UNSOURCED — cite from JPM Guide to the Markets or Capital Group's market-decline data for exact figures]." Always cite the source; don't invent.

7. **Decide the next step. One of three:**
   - **Wait 24-48h, then revisit.** (Most common — and the only one that requires no action right now.)
   - **Take a small, deliberate action that satisfies the urge without overriding the plan.** E.g., "rebalance to plan rather than going all-cash"; "buy a 1% position in the FOMO asset instead of 20%". Pre-commit the size IN WRITING.
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).