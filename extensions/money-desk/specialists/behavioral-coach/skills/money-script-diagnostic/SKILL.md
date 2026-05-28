## Money Script Diagnostic

description: Short structured questionnaire mapping the user's money beliefs to the four Klontz money scripts (Money Avoidance, Money Worship, Money Status, Money Vigilance). Produces a personalized blind-spots report and matches the dominant script to its characteristic financial pitfalls — so the user can pre-commit to guardrails.

## When to use

- User reports a recurring pattern of financial regret without being able to name why ("I keep doing X and I don't know why").
- Recurring couples-money fights — different scripts in the partnership explain a huge fraction of these.
- After a `panic_circuit_breaker` event, to identify the underlying script driving the panic.
- New-client baseline as part of an annual review (`md_le_role`).

## Background (cite when used)

The four money scripts come from Brad Klontz and colleagues' research (Klontz et al., 2011, "Money Beliefs and Financial Behaviors: Development of the Klontz Money Script Inventory", Journal of Financial Therapy). The original Klontz Money Script Inventory (KMSI) is a longer instrument; this skill uses a short proxy version for triage.

## The four scripts (short)

1. **Money Avoidance** — money is bad / corrupting / dangerous. Manifests as: under-charging for one's services, avoiding statements, charitable over-giving, anti-wealth identity.
2. **Money Worship** — more money will make things better. Manifests as: never feeling secure, prioritizing income over satisfaction, lifestyle inflation, lottery-thinking.
3. **Money Status** — net worth = self worth. Manifests as: status-signaling spending, hiding finances from partner, inability to accept downward mobility, overspending on visible categories (car, house, watch).
4. **Money Vigilance** — money should be carefully watched, talked about reluctantly. Manifests as: under-investing (too much cash), discomfort discussing money even with spouse, anxiety even when finances are objectively secure.

**Important**: Vigilance is the only script associated with generally healthier financial behaviors — but taken too far becomes anxiety-driven under-investment.

## Inputs needed (short questionnaire — agree / disagree 1-5)

Ask the user to rate 1 (strongly disagree) to 5 (strongly agree). Three questions per script (12 total):

**Avoidance:**
- "Rich people are greedy."
- "It is not OK to have more than you need."
- "Money corrupts."

**Worship:**
- "More money will make me happier."
- "You can never have enough money."
- "Things would be better if I had more money."

**Status:**
- "Your self-worth equals your net worth."
- "People are only as successful as the amount of money they earn."
- "If something is not 'top of the line', it's not worth buying."

**Vigilance:**
- "It is important to save for a rainy day."
- "You should always look for the best deal, even if it takes more time."
- "It is wrong to talk about money openly."

## Workflow

1. Run the questionnaire.
2. Sum each script's score (3 questions × 1-5 = 3-15 per script).
3. Identify the **dominant** script (highest score) AND any **secondary** script within 2 points.
4. Match the dominant script to the characteristic pitfalls below.
5. Match to specific pre-commitment guardrails (see "Output").
6. If the user has a partner, run for both and produce a comparison.

## Output (per script)

**Money Avoidance dominant:**
- Pitfalls: under-charging for work, sub-optimal salary negotiation, hoarding cash from guilt about success, missing tax-advantaged accounts because investing "feels greedy".
- Guardrails: automate retirement contributions to current legal max; set fee-for-services with a coach BEFORE the next pricing decision; pre-commit charitable giving as a % of income rather than ad-hoc.

**Money Worship dominant:**
- Pitfalls: lifestyle inflation that erases raises, "next milestone" thinking, susceptibility to get-rich-quick pitches, FOMO on hot assets.
- Guardrails: pre-commit the next raise allocation (default 50% raise → savings increase, 50% → lifestyle); automated savings-rate ratchet; written 24-hour rule on any "this is THE opportunity" pitch.

**Money Status dominant:**
- Pitfalls: car/house over-spending, hidden debt to maintain appearance, inability to accept temporary downward mobility (e.g., during a sabbatical or job change), brittle to identity loss in a layoff.
- Guardrails: pre-commit max-house-price as a % of household income (default 28% PITI); car as % of income (default new car < 35% of annual gross); transparency dashboard with partner; written job-loss plan that explicitly allows lifestyle scale-back.

**Money Vigilance dominant:**
- Pitfalls: over-cash position (under-invested), money anxiety even when objectively secure, reluctance to spend on genuine joy or family experiences, secretive about finances even within marriage.
- Guardrails: written investment policy statement with target stock %; automated rebalancing; pre-commit a "joy budget" (small) that doesn't get questioned; scheduled monthly money date with partner with structured agenda (not freeform).

## Couples comparison

When run for both partners, compare scripts. Common high-friction combos:
- Avoidance + Worship: charged conversations about whether more income / spending is desirable.
- Status + Vigilance: spender vs saver, the most common couple-money fight pattern.
- Two Vigilance: usually low conflict but high anxiety; risk is under-investing as a household.

## Citations / sources

- Klontz, B., Britt, S. L., Mentzer, J., & Klontz, T. (2011). Money beliefs and financial behaviors: Development of the Klontz Money Script Inventory. Journal of Financial Therapy, 2(1).
- Klontz, B. & Klontz, T. (2009). Mind over Money. Broadway Books.

## Disclaimer

Analysis only. This is a triage proxy — not the validated full KMSI instrument. For deeper work, refer to a Financial Therapy Association (FTA) member therapist. Not a psychiatric diagnosis; not a substitute for therapy when therapy is indicated.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).