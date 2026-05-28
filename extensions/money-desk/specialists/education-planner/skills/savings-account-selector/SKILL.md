## Savings Account Selector

description: Compare account types for education savings — 529 vs Coverdell ESA vs UTMA/UGMA vs Roth IRA vs taxable brokerage — across tax treatment, control, financial-aid impact, contribution limits, and flexibility for non-college outcomes. Use when the user hasn't picked an account type yet, or wants to add a second vehicle.

## When to use

- New baby / first time saving for education.
- "Should I open a 529 or a UTMA?"
- High earner phased out of Roth IRA looking at backdoor + 529 strategy.
- User wants to leave flexibility for "what if kid doesn't go to college."

## Inputs needed

- Household AGI (drives Coverdell phase-out, Roth IRA eligibility).
- State of residence (drives 529 state-tax deduction value).
- How much control the user wants to retain at age 18/21 (UTMA loses parental control; 529 doesn't).
- Other savings goals competing for the same dollars (retirement, emergency fund).
- Time horizon (years until college).

## Workflow

1. **Score each vehicle** on:
   - **Federal tax treatment** — 529 / Coverdell / Roth: tax-free growth for qualified. UTMA: kid's tax rate, kiddie tax applies. Taxable: full LTCG/dividend tax.
   - **State tax treatment** — 529 only (most states); cite user's state.
   - **Contribution limits** — 529: aggregate limit per state ($235k–$575k); 5-yr superfund $95k/$190k. Coverdell: $2,000/yr/beneficiary, phased out above $95k/$190k MAGI. Roth IRA: $7k/$8k 50+ (2025), but requires earned income and phases out at $150k/$236k MAGI. UTMA: unlimited but gift-tax annual exclusion ($19k/$38k 2025).
   - **Qualified expenses** — 529: tuition, R&B, books, computer, K-12 up to $10k/yr, apprenticeships, $10k lifetime student loan. Coverdell: same plus K-12 broader. Roth: contributions anytime; earnings for higher-ed qualified but lose the retirement compounding.
   - **Penalty for non-qualified** — 529: 10% on earnings + income tax (waived for scholarships up to scholarship amount). Coverdell: 10%. Roth: 10% on earnings if under 59½ (contributions always penalty-free).
   - **Aid impact** — Parent-owned 529: 5.64% (FAFSA). UTMA: 20% (student asset). Roth IRA: doesn't count as asset; distributions count as income on next FAFSA — flag this. Grandparent 529: no FAFSA impact post-Simplification.
   - **Flexibility / change of beneficiary** — 529: easy beneficiary change to family. Coverdell: same. UTMA: ZERO flexibility — irrevocable gift, becomes child's at age of majority. Roth: full flexibility.
2. **Build a comparison matrix** (account × dimension).
3. **Recommend a primary + secondary stack.** Typical recommendations:
   - Most families: **529 first** (highest contribution ceiling, state-tax deduction, lowest aid hit).
   - Already-maxing 529 + want K-12 flexibility: **+ Coverdell** ($2k/yr, K-12 broader).
   - "What if no college": **Roth IRA** (if you have earned-income room and aren't displacing retirement saving) — works as backup retirement if unused.
   - **Avoid UTMA** for primary college funding in most cases — irrevocable, hurts aid more, taxed annually, becomes child's at 18/21.

## Required citations

- All contribution limits, MAGI phase-outs, and percentage figures cite the current IRS publication or year (e.g., Pub 970 for education tax benefits).
- State-tax-deduction figure cites the user's state plan website.

## Deliverable shape

Markdown report `./reports/<CHILD>/account-selector-<YYYYMMDD>.md`:
- **Headline recommendation** — e.g., "Open a Utah my529 (your state has no deduction; UT is cheapest plan); fund $X/mo; add a Coverdell only if you want K-12 private school flexibility."
- **Comparison matrix** — 5 vehicles × ~7 dimensions.
- **Reasoning** — why the recommended stack, what was eliminated and why.
- **Action checklist** — open account (URL), set monthly auto-contribution, name beneficiary + successor.

## Notes

- The Roth-for-education argument is **only** strong if the parent already has retirement on track. Otherwise the opportunity cost (lost retirement compounding) crushes the case.
- Some families like UTMA for the "first car / wedding / down-payment-help" use case — that's fine, just don't conflate it with college planning.
- 529 superfunding (5-year averaging of gift-tax annual exclusion) is the highest-leverage way for grandparents or high-income parents to seed an account.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).