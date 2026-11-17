## Concept Explainer

description: Plain-language explanation of any personal-finance concept at user-chosen depth (beginner / intermediate / pro). Defines jargon inline on first use, offers one well-chosen analogy where it helps, anchors the concept to "here's why this matters for you", and ends with a pointer to the diagnostic specialist that uses the concept.

## When to use

- "What is a Roth IRA?" / "What does 'expense ratio' mean?" / "Explain compound interest."
- User clearly doesn't yet know what a concept means but is about to invoke a diagnostic skill that depends on it — explain first, run second.
- User has the concept half-right and wants to confirm or correct their mental model.

## Workflow

1. **Calibrate depth.** Use the user's stated depth: **beginner** (no prior knowledge), **intermediate** (knows the term, wants nuance / trade-offs), or **pro** (just the edge case). Default to intermediate. State which depth you're answering at.
2. **Define.** One-sentence definition, no jargon. Then expand.
3. **Analogy (only if it helps).** One well-chosen analogy. Bad analogies are worse than no analogy.
4. **Worked example with real numbers.** Concrete > abstract. If user provided their own numbers, use those (cite `[USER-PROVIDED]`). Otherwise follow the example-selection rule in Determinism rules (labeled `[ASSUMPTION:]`).
5. **Common misconceptions.** "Most people think X; actually Y." This is where the value lives — flatly stating definitions is what Investopedia does.
6. **Why this matters for you.** Connect to a decision the user will face.
7. **Next step.** Either (a) the glossary terms to look up next, (b) the diagnostic skill to run now that the concept clicks, or (c) "you're ready — go do X this week".

## Inputs needed

- The concept / term to explain.
- Desired depth (beginner / intermediate / pro) — default intermediate if not specified.
- Optionally: the user's situation that prompted the question (so the "why this matters for you" lands).

## Output template

Use the skeleton in **Determinism rules → Output template** below — it is the single source of truth for this skill's report shape.

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

## Determinism rules

### Input keys

- `concept` — string, the term or concept
- `depth` — `beginner` | `intermediate` | `pro` (default `intermediate`)
- `user_context` — string or null (the situation that prompted the question)
- `user_numbers` — object or null (any figures the user supplied, e.g. `{ balance_usd, rate_pct, years }`)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Depth | `intermediate` (stated in the heading) | `[ASSUMPTION: intermediate]` |
| Worked-example principal | Fixed illustrative base: $10,000 | `[ASSUMPTION: illustrative $10,000]` |
| Worked-example growth rate | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` (stocks) or `long_term_bond_real_return_percent` (bonds/cash); value is a fraction (0.06 = 6%) | `[ASSUMPTION]` |
| Inflation in examples | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` | `[ASSUMPTION]` |
| Current-year limits / brackets / thresholds | `md_facts` (topic + key named in the text) | `[IRS 2026 limits]` etc. |
| Any figure not in md_facts | `md_sources`; else `[UNSOURCED]` + "verify before relying on this" | `[UNSOURCED]` |

### Calculation method

1. Resolve `depth` (default intermediate) and print it in the heading.
2. Write the six sections in the fixed order of the Output template; never add or drop a section.
3. **Length and reading level** (whole answer, excluding the example table):

   | Depth | Words | Reading level | Jargon |
   |---|---|---|---|
   | beginner | 250–400 | ≤ US grade 8 | every term defined inline on first use |
   | intermediate | 350–600 | ≤ grade 10 | define terms not in the Glossary Lookup sample list |
   | pro | 150–300 | no cap | no definitions; lead with the edge case |

4. **Example selection** (first match): (a) `user_numbers` present → use them, tag `[USER-PROVIDED]`; (b) concept is a limit/bracket/threshold → use the md_facts value; (c) concept involves growth → $10,000 at the md_facts rate over 10 and 30 years; (d) otherwise → $10,000 with the simplest arithmetic that shows the mechanism. Show the formula and the result; round to whole dollars.
5. **Analogy**: at most one; omit at `pro` depth.
6. **Misconception**: exactly one, phrased "Most people think X; actually Y."
7. **Next step**: exactly one item chosen by the Decision rules.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Condition | Next step |
|---|---|---|
| 1 | User asks "should I…" about their own situation | Route to the diagnostic specialist that owns the decision (e.g. Backdoor Roth → **Tax Planner**; expense ratio → **Fund Expense Audit** (Investing Advisor)) |
| 2 | `depth = beginner` and the answer used ≥ 2 other terms the user may not know | Glossary Lookup for those terms (name them) |
| 3 | A diagnostic skill directly uses this concept | That skill (friendly name + specialist) |
| 4 | Otherwise | "You're ready — {one concrete action} this week" |

### Output template

```markdown
# {Concept} — explained at the {depth} level

**In one sentence:** {plain-language definition, no jargon}

## How it actually works
{expanded explanation}

## Worked example
{formula → numbers → result, with tags}

## Most people get this wrong about it
Most people think {X}; actually {Y}.

## Why this matters for you
{1–3 sentences; if no user_context: "Not personalized — no situation shared"}

## Next step
{ONE item from the Decision rules}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).