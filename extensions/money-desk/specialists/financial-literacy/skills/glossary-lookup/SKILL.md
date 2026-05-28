## Glossary Lookup

description: Terse one-paragraph definition of a personal-finance term, plus the one thing most people get wrong about it, plus a pointer to the deeper explanation if the user wants it. The "I just need a quick answer" companion to Concept Explainer.

## When to use

- "What does APY mean?" / "What's the difference between APR and APY?"
- User encounters a term mid-document and just needs a quick "what is this?" before getting back to the document.
- Specialist hand-off used a term the user didn't recognize.

## Workflow

1. **Define in one paragraph.** Plain language. Jargon defined inline.
2. **The common gotcha.** One sentence: "most people think X; actually Y".
3. **Deep-dive pointer.** "Want this explained at length? Call **Concept Explainer**."

## Inputs needed

- The term to look up.

## Output template

```
**{Term}** — {one-paragraph definition}.

⚠️ Most people get this wrong: {one-sentence gotcha}.

Deep dive: **Concept Explainer** (Financial Literacy) at beginner / intermediate / pro depth.
```

## Sample entries (representative — extend as needed)

- **APR** — Annual Percentage Rate. The yearly cost of borrowing, expressed as a %. Includes interest plus most fees, but **doesn't** account for compounding. ⚠️ APR is what you PAY on debt; APY is what you EARN on savings — same math, opposite direction.
- **APY** — Annual Percentage Yield. The yearly return on a deposit, expressed as a %. **Does** account for compounding within the year. ⚠️ A 5% APR on a credit card and a 5% APY on a HYSA are NOT the same number — APY is always slightly higher than the equivalent APR because of compounding.
- **Expense ratio** — The annual % of a fund's assets used to pay the fund's costs (management, admin, marketing). A 0.04% expense ratio on $100k = $40/year; a 1.0% expense ratio on the same $100k = $1,000/year, compounding against you for decades. ⚠️ It's deducted continuously, never as a visible "bill" — so it's easy to forget you're paying it.
- **Backdoor Roth** — A two-step move: contribute after-tax to a Traditional IRA, then convert to Roth. Lets high earners (above the Roth IRA income limit) still get money into a Roth IRA. ⚠️ The "pro-rata rule" can wreck the tax math if you have **any** pre-tax money in any Traditional / SEP / SIMPLE IRA on Dec 31 of the conversion year.
- **Mega Backdoor Roth** — Different move: contribute after-tax (above the regular $23,500 limit) inside a 401(k) that allows it, then in-plan-convert to Roth 401(k) (or rollover to Roth IRA). Up to ~$46,500 extra Roth space per year. ⚠️ Only works if your specific plan offers BOTH after-tax contributions AND in-plan Roth conversion (or in-service distributions). Most plans don't.
- **PMI** — Private Mortgage Insurance. Insurance that protects the LENDER (not you) when you put down less than 20% on a conventional mortgage. ⚠️ It's removable — by law you can request removal at 80% LTV and the lender must auto-cancel at 78% — but you have to ASK; nothing happens automatically before 78%.
- **HSA triple tax advantage** — (1) Contributions are pre-tax. (2) Growth is tax-free. (3) Qualified medical withdrawals are tax-free. ⚠️ This makes the HSA the most tax-efficient account in the US code — better than a 401(k) — but only if you're enrolled in an HSA-eligible HDHP.
- **Step-up basis** — When you inherit an asset, your "cost basis" for capital gains purposes resets to the asset's value on the date of the original owner's death. ⚠️ This wipes out potentially decades of unrealized capital gains tax — a huge reason NOT to gift highly appreciated assets while alive (better to let heirs inherit).
- **Term vs Whole life** — Term life pays out if you die during the term (10/20/30 yr), then expires worthless. Whole life pays out whenever you die and builds cash value. ⚠️ For 95%+ of people, term + investing the difference dominates whole life — but whole life is sold aggressively because commissions are 50-100% of year-1 premium.
- **Dollar-cost averaging (DCA)** — Investing on a fixed schedule (e.g. $X every paycheck) regardless of price. ⚠️ Mathematically, lump-sum investing beats DCA ~2/3 of the time historically — but DCA wins the "won't panic-sell" behavioral game, which is the actual game most people lose.

## Citations

- Standard finance reference sources: Investopedia, Bogleheads Wiki, IRS publications.
- For dollar limits / thresholds / current rates → always `md_facts` (cite with friendly source label).
- `[UNSOURCED]` for any factual claim you can't trace; flag "verify before relying on this".

## Disclaimer

Definitions only. Application is the diagnostic specialists' job.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).