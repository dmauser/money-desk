## Concept Explainer

description: Plain-language explanation of any personal-finance concept at user-chosen depth (beginner / intermediate / pro). Defines jargon inline on first use, offers one well-chosen analogy where it helps, anchors the concept to "here's why this matters for you", and ends with a pointer to the diagnostic specialist that uses the concept.

## When to use

- "What is a Roth IRA?" / "What does 'expense ratio' mean?" / "Explain compound interest."
- User clearly doesn't yet know what a concept means but is about to invoke a diagnostic skill that depends on it — explain first, run second.
- User has the concept half-right and wants to confirm or correct their mental model.

## Workflow

1. **Calibrate depth.** Ask the user (or infer): **beginner** (no prior knowledge), **intermediate** (knows the term, wants nuance / trade-offs), or **pro** (just the edge case). Default to intermediate. State which depth you're answering at.
2. **Define.** One-sentence definition, no jargon. Then expand.
3. **Analogy (only if it helps).** One well-chosen analogy. Bad analogies are worse than no analogy.
4. **Worked example with real numbers.** Concrete > abstract. If user provided their own numbers, use those (cite `[USER-PROVIDED]`). Otherwise use a labeled `[ASSUMPTION:]` value.
5. **Common misconceptions.** "Most people think X; actually Y." This is where the value lives — flatly stating definitions is what Investopedia does.
6. **Why this matters for you.** Connect to a decision the user will face.
7. **Next step.** Either (a) the glossary terms to look up next, (b) the diagnostic skill to run now that the concept clicks, or (c) "you're ready — go do X this week".

## Inputs needed

- The concept / term to explain.
- Desired depth (beginner / intermediate / pro) — default intermediate if not specified.
- Optionally: the user's situation that prompted the question (so the "why this matters for you" lands).

## Output template

```
# {Concept} — explained at the {depth} level

**In one sentence:** {plain-language def, no jargon}

## How it actually works
{expanded explanation, jargon defined inline on first use}

## Worked example
{concrete numbers}

## Most people get this wrong about it
{the common misconception + the correction}

## Why this matters for you
{1-3 sentences connecting to a decision the user will face}

## Next step
{ONE specific next thing — glossary term / diagnostic skill / action}
```

## Examples of good first-line definitions

- **Compound interest:** Interest earning interest — you stop being paid just on your money and start being paid on your past interest, too.
- **Expense ratio:** The slice of your fund's assets the manager takes every year, whether the fund made money or not.
- **Tax bracket:** A staircase, not an elevator — only the dollars in each step pay that step's rate.
- **Roth IRA:** A retirement account where you pay tax on the money going IN so you owe zero tax on everything coming OUT later (growth included).
- **Dollar-cost averaging:** Investing on a fixed schedule regardless of price, trading "best possible price" for "won't panic and freeze".

## Citations

- Cite primary sources where possible: IRS publications, SEC Investor.gov, CFPB tools, Bogleheads Wiki for portfolio concepts.
- For 2026 limits / brackets / thresholds → call `md_facts` first, cite with the friendly source label.
- `[UNSOURCED]` only as last resort, always with a "verify before relying on this" pointer.

## Disclaimer

Education, not advice. "Here's how a Backdoor Roth works" is in scope. "You personally should do a Backdoor Roth this year" is out of scope — route to **Tax Planner** for the personal call.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).