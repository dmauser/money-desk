## FIRE Flavor Classifier

description: Help the user decide which flavor of FIRE actually fits — lean / coast / barista / chubby / fat. The flavor is decided BOTH by numbers (savings rate, target spend, current portfolio, FI age target) AND by lifestyle priorities (frugality tolerance, career attachment, geographic flexibility, spouse alignment). Output: a recommended flavor, the specific portfolio number that goes with it, the lifestyle trade-offs, and the FIRE-flavor-specific failure modes.

## When to use

- "What kind of FIRE am I really targeting?"
- "Lean FIRE vs coast FIRE — which fits me?"
- "I'm not sure I want to fully retire — barista or coast?"
- "We're a high-income couple; is fat FIRE realistic in 10 years?"
- Before committing to a multi-year savings + spending plan

## Inputs needed

- **Current age** and **household structure** (single / couple / kids).
- **Current household income** (gross) and **current household spend** (today's $).
- **Current savings rate** (% of gross saved per year).
- **Portfolio total + by tax bucket** (taxable / Trad / Roth / HSA).
- **Hard-floor target spend in retirement** — the absolute MINIMUM you'd accept if forced.
- **Comfortable target spend in retirement** — what you'd actually want.
- **Earliest age you'd consider quitting full-time work**.
- **Lifestyle priorities** (rank): geographic flexibility / kids' college / international travel / hobbies-with-fixed-cost / financial security buffer / inheritance to leave.
- **Career attachment** — do you actively dislike work? Love it? Neutral?
- **Spouse alignment** (if applicable) — same target? Different timeline? Hasn't been discussed?

## Workflow

1. **Run the 5 flavor definitions cleanly.** Each has a numerical convention AND a lifestyle stance:
   - **Lean FIRE** — ~$25–50k/yr household spend; tight budget; high geographic flexibility usually required; very high savings rate (50–70%); FI in ~10–15 years from a normal income; identity-tight ("we live small").
   - **Coast FIRE** — current portfolio is large enough that, without ANY more contributions, it'll compound to a normal-retirement number by 65; user keeps working but only to cover current expenses; flexibility to switch to lower-paid / fulfilling work.
   - **Barista FIRE** — full FI not yet hit; user covers ~50% of expenses with portfolio WR and 50% with part-time work that often provides healthcare; typical post-50, popular pre-Medicare.
   - **Chubby FIRE** — ~1.5× lean; comfortable middle-class retirement spend ($80–140k/yr household); moderate frugality not extreme; the "we don't want to count every dollar" version.
   - **Fat FIRE** — $200k+/yr spend; $5M+ household; typically high-income professionals or business exits; geographic flexibility optional; lifestyle preserved or expanded post-retirement.
2. **Match the user's numbers to each flavor.** Show: at current savings rate, when does the user hit each flavor's target?
3. **Match the user's lifestyle to each flavor.** Lean and coast require *very different* personalities. Barista requires comfort with part-time identity. Fat requires the income to get there.
4. **Surface the FOUR flavor-specific failure modes:**
   - **Lean FIRE failure:** lifestyle inflation creep blowing the tight budget; healthcare cost surprise; identity collapse if the frugality identity erodes.
   - **Coast FIRE failure:** career flexibility never actually materializes (user keeps grinding by default); investment under-performance ruins the compounding assumption; spouse moves at different pace.
   - **Barista FIRE failure:** part-time work dries up (recession, age discrimination); employer-provided health insurance disappears; income doesn't actually cover the half it was supposed to.
   - **Chubby / Fat FIRE failure:** lifestyle inflation between target-set and FIRE-date (the goal-post moves); sequence risk hits a larger spend so the absolute $ pain is bigger; high spend leaves no buffer.
5. **Spouse alignment check.** If the household is two people, get an explicit answer to "have you both said the same target out loud in the last 90 days?" If no → route to **Behavioral Coach / Couples Money Alignment** before any plan.
6. **Recommend ONE flavor** as the working target, with the path: "you're targeting X; your number is $Y; this requires Z years at current savings rate (or A years if you cut spending W%)."
7. **Name what changes if you're wrong.** If the user picks lean but actually wants chubby, surface it: "your spending might creep — re-run this skill annually."

## Output template

```
# FIRE Flavor recommendation

## Your inputs
- Household: {single / couple [+ kids]}
- Income / spend / savings rate: ${I} / ${S} / {sr}%  [USER-PROVIDED]
- Portfolio: ${P} ({by-bucket breakdown})
- Hard-floor / comfortable spend: ${HF} / ${C} (today's $)  [USER-PROVIDED]
- Earliest quit age: {E}
- Top lifestyle priorities: {ranked list}
- Career attachment: {dislike / neutral / love}
- Spouse alignment: {same / different / unaddressed}

## How each flavor fits YOU

| Flavor   | Annual spend | Target portfolio | Years from now at current savings | Lifestyle fit |
|----------|--------------|------------------|----------------------------------|---------------|
| Lean     | ${...}       | ${...}           | {N}                              | {1–5 stars}   |
| Coast    | n/a (target normal retirement) | (already there? or needs ${gap}) | n/a — coast now | {...} |
| Barista  | ${...}       | ${...}           | {N}                              | {...}         |
| Chubby   | ${...}       | ${...}           | {N}                              | {...}         |
| Fat      | ${...}       | ${...}           | {N}                              | {...}         |

## Recommended flavor: **{X}**

Why: {one paragraph tying numbers + lifestyle inputs to the recommendation}.

Path:
- FIRE number: ${T}
- Gap from today: ${T - P}
- Years to close at current savings rate: ~{N}
- Years to close if you cut spend by 10%: ~{N - 2}
- Years to close if you increase income by 20%: ~{N - 3}

## Flavor-specific failure modes (yours: {X})
- {failure mode 1, with the specific guard rail}
- {failure mode 2, with the specific guard rail}

## If you're wrong about the flavor
{Plain sentence on what to watch for and when to re-run this skill — usually annually + at any income / family / housing change.}

## Recommended next step
{ONE thing — usually: "Run Savings-Rate Optimizer in FIRE Planner" if income flex needed, OR "Run Couples Money Alignment in Behavioral Coach" if spouse alignment unaddressed, OR "Run FIRE Number Calculator in FIRE Planner" to lock in the target.}
```

## Common mistakes to flag

- **Picking lean by numbers alone.** Lean FIRE is a lifestyle choice as much as a math one. If frugality isn't a positive value, lean will crack.
- **Confusing coast and barista.** Coast = working same job, just no longer saving. Barista = working LESS, often for healthcare.
- **"Fat FIRE in 5 years" with a $150k income.** Math doesn't usually work; surface the gap honestly.
- **Single-pick spouse.** If two people are on different flavors, the household is on neither.
- **Treating flavor as permanent.** People shift flavors as life changes. Re-run this skill at major life events.

## Citations / sources

- Flavor definitions are convention-based, not regulatory; cite as "FIRE community convention" — Mr. Money Mustache (lean), Mad Fientist (barista / coast), ChooseFI podcast (general), r/financialindependence (fat). Avoid quoting specific founders' exact thresholds without checking.
- Mr. Money Mustache savings-rate-to-FI table — *The Shockingly Simple Math Behind Early Retirement* (2012).

## Disclaimer

FIRE flavor is a working hypothesis, not a contract. Most users shift flavors at least once across the journey. Re-run annually, after any income / family / housing change, and at every 5-year-from-target checkpoint.

## Next step

**Next step → FIRE Planner:** "Run FIRE Number Calculator for {recommended flavor}, ${target spend}/yr, target FI age {E}."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).