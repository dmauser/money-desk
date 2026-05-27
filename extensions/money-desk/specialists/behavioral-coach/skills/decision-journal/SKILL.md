## Decision Journal

description: Pre-commitment framework for any big money decision ($10k+ purchase, job change, account opening, insurance application, real-estate purchase, business pivot). Captures the prediction, reasoning, and reversibility BEFORE the decision is made — so future-self can audit it honestly without hindsight bias. Inspired by Annie Duke (Thinking in Bets) and Daniel Kahneman.

## When to use

- BEFORE any decision involving ≥ $10k, irrevocable consequences, or affecting more than one person.
- BEFORE any insurance application (the rest of the policy term is irrevocable from the price you locked).
- BEFORE entering a §1031 exchange, S-corp election, account rollover, or any decision that's "easy to make, painful to undo".
- BEFORE saying yes to a job offer.
- AS A REVIEW TOOL at annual review (`md_le_role`) — read prior decision-journal entries and grade against outcome.

## The template (fill in BEFORE deciding)

### 1. The decision
- One sentence: what am I about to decide?
- Reversible / partially reversible / irreversible? If irreversible, escalate the rigor of steps 2-7.

### 2. The frame
- What are my candidate options? (Force at least 3, including the "do nothing" option.)
- What problem am I trying to solve? (One sentence.)

### 3. The bet (the testable prediction)
- "If I do this, I predict that in [12 / 36 / 60 months] the outcome will be: ____."
- Be specific and falsifiable. "I'll be happier" is not testable; "Total household income up $X with same hours, OR commute under 30 min, OR equity vesting on schedule" is.
- What's my confidence (0-100%) in that prediction?

### 4. The kill criteria
- What would make me abandon this decision later?
- Pre-commit the numbers: "If by month 12 [the metric] is below [number], I will [reverse / partial reverse / accept loss]."
- Most decisions fail because no one defined what failure looks like in advance.

### 5. The base rate
- For decisions like this in general, how often do they work? (Don't anchor to your specific case; look up the population data.)
- E.g., "Most rentals deliver IRR within 2% of projection in year 1 and degrade thereafter" or "Most career changes in industry X result in a 10-30% pay cut for 2-3 years before recovery". Cite source or `[UNSOURCED]`.

### 6. The cost of being wrong
- What's the worst plausible outcome?
- Could I recover financially within 12-24 months if it's a total loss?
- Who else is affected and how?

### 7. The pre-mortem
- Imagine it's 12 months from now and this decision was a clear failure. What were the 2-3 reasons that became obvious in hindsight?
- Now: which of those reasons can I de-risk now, BEFORE deciding?

### 8. The motivated reasoning check
- What's the strongest counter-argument to my decision? Steelman it.
- Who close to me disagrees, and what are their reasons (not just "they don't get it")?
- Am I optimizing for "looks good" (status) over "is good" (outcome)?

## Workflow

1. User describes a pending decision.
2. Walk through the 8 sections in order.
3. Save the completed journal entry as a dated file in `./reports/behavioral-coach/decision-journal/`.
4. Schedule the revisit date (12 months default; sooner for high-volatility decisions).
5. At revisit: re-open, score the prediction against actual outcome, identify which sections most helped or most missed.

## What this skill does NOT do

- It does not tell the user what to decide. That's the user's choice.
- It does not validate the decision retroactively. The point is to separate **decision quality** (was the process sound?) from **outcome quality** (did it work out?) — they are independent. A good decision can have a bad outcome (variance); a bad decision can have a good outcome (luck).

## Output

- The completed structured journal entry as markdown.
- A 1-line summary: "Decision: X. Reversibility: [R/PR/IR]. Confidence: N%. Revisit: [date]."

## Citations / sources

- Annie Duke, Thinking in Bets (2018) — separating decision quality from outcome quality.
- Daniel Kahneman, Thinking Fast and Slow (2011) — pre-mortem technique.
- Gary Klein — pre-mortem methodology (Klein, 2007, "Performing a Project Pre-Mortem", Harvard Business Review).

## Disclaimer

Analysis only. A decision journal does not guarantee a good outcome — it improves decision quality and creates an honest audit trail. Outcome variance still matters.
