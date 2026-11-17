## Decision Journal

description: Pre-commitment framework for any big money decision ($10k+ purchase, job change, account opening, insurance application, real-estate purchase, business pivot). Captures the prediction, reasoning, and reversibility BEFORE the decision is made — so future-self can audit it honestly without hindsight bias. Inspired by Annie Duke (Thinking in Bets) and Daniel Kahneman.

## When to use

- BEFORE any decision involving ≥ $10k, irrevocable consequences, or affecting more than one person.
- BEFORE any insurance application (the rest of the policy term is irrevocable from the price you locked).
- BEFORE entering a §1031 exchange, S-corp election, account rollover, or any decision that's "easy to make, painful to undo".
- BEFORE saying yes to a job offer.
- AS A REVIEW TOOL at annual review (`md_le_role`) — read prior decision-journal entries and grade against outcome.

## Inputs needed

- **decision** (required) — one-sentence description of what the user is about to do (sell, buy, refinance, take a job, etc.).
- **dollars_at_stake** (required) — approximate $ amount involved.
- **deadline** — when must this be decided by? (date or "no hard deadline")
- **alternatives_considered** — list of other paths the user weighed, even briefly.
- **expected_outcome** — what the user expects to happen (the testable prediction).
- **kill_criteria** — what would make the user reverse course later?
- **emotional_state** — calm / anxious / excited / pressured / FOMO / regretful (free-text OK).

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
3. Save the completed journal entry as a dated file in `./money-desk/behavioral-coach/decision-journal/`.
4. Schedule the revisit date: 12 months out, or the earliest kill-criteria check date if that is sooner.
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

## Determinism rules

### Input keys

- `decision` — string, one sentence (required)
- `dollars_at_stake` — number, USD (required)
- `deadline` — `YYYY-MM-DD` or `none`
- `today` — `YYYY-MM-DD`
- `reversibility` — `reversible` | `partially_reversible` | `irreversible`
- `people_affected` — integer (including the user)
- `alternatives_considered` — list of strings
- `expected_outcome` — string (testable prediction); `prediction_horizon_months` — 12 | 36 | 60
- `confidence_pct` — integer 0–100
- `kill_criteria` — list of `{ metric, threshold, check_date: YYYY-MM-DD, action: reverse | partial_reverse | accept }`
- `emotional_state` — `calm` | `anxious` | `excited` | `pressured` | `fomo` | `regretful` | free text
- `emergency_fund_usd`, `annual_net_income_usd` — numbers or null (recovery check)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Decision, dollars, prediction, kill criteria | **Ask — no default** (the journal is the user's own words) | — |
| Reversibility | **Ask — no default** | — |
| Base rate for this decision type | Cite a source via `md_sources`; else write `[UNSOURCED]` — never a number from memory | `[UNSOURCED]` |
| Revisit date | Rule-driven (Decision rules), not assumed | — |

### Calculation method

1. **Rigor tier** from the Decision rules (Full = all 8 sections; Short = sections 1, 3, 4, 6).
2. **Options**: require ≥ 3 options including "do nothing"; if the user lists fewer, ask for more before continuing.
3. **Prediction test**: the prediction must name a metric, a number, and a date. If any is missing, rewrite it with the user until all three are present; do not proceed without them.
4. **Kill criteria**: at least one `{metric, threshold, check_date, action}`; earliest `check_date` = first checkpoint.
5. **Recovery check** (section 6): `recovery_months = dollars_at_stake / (annual_net_income_usd / 12)` if income given; flag "cannot recover within 24 months" when `recovery_months` > 24. If `emergency_fund_usd < dollars_at_stake` and reversibility is `irreversible`, flag "total loss exceeds emergency fund".
6. **Revisit date** = earlier of (`today + 12 months`) and the earliest kill-criteria `check_date`.
7. Summary line exactly: `Decision: {decision}. Reversibility: {R|PR|IR}. Confidence: {N}%. Revisit: {YYYY-MM-DD}.`
8. Never state or imply which option to choose.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Condition | Result |
|---|---|---|
| 1 | `emotional_state` ∈ {anxious, pressured, fomo, regretful} and (`deadline` within 2 days of `today` or `deadline = none` with the user saying "now") | Run **Panic Circuit Breaker** (Behavioral Coach) first; resume the journal after its cooldown |
| 2 | `reversibility = irreversible` or `dollars_at_stake` ≥ 10,000 or `people_affected` ≥ 2 | **Full** rigor — all 8 sections |
| 3 | Otherwise | **Short** rigor — sections 1, 3, 4, 6 |

### Output template

```markdown
# Decision Journal — {decision} ({today})

**Decision: {decision}. Reversibility: {R|PR|IR}. Confidence: {N}%. Revisit: {YYYY-MM-DD}.**
Rigor: {Full | Short} (rule #{n})

## 1. The decision
## 2. The frame
| Option | Problem it solves |
|---|---|
{or "Not applicable — Short rigor"}
## 3. The bet
- Prediction: {metric} reaches {number} by {date}
- Confidence: {N}%
## 4. Kill criteria
| Metric | Threshold | Check date | Action |
|---|---|---|---|
## 5. Base rate
{cited or [UNSOURCED] — or "Not applicable — Short rigor"}
## 6. Cost of being wrong
- Worst plausible outcome: {…}
- Recovery: {recovery_months} months of net income {flag}
- Who else is affected: {…}
## 7. Pre-mortem
{2–3 reasons + de-risk step — or "Not applicable — Short rigor"}
## 8. Motivated-reasoning check
{steelman, dissenting voices, status vs outcome — or "Not applicable — Short rigor"}

## Revisit log
| Date | Prediction outcome | Decision quality (process) | Outcome quality | Lesson |
|---|---|---|---|---|
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
