## Geographic Arbitrage Planner

description: Map the cost-of-living arbitrage opportunity for a FIRE'd household — domestic (no-state-income-tax states, low-COL metros) and international (Portugal D7 / Spain NLV / Mexico Temporary / Thailand LTR / Malaysia MM2H / etc.). Output: COL-adjusted spend impact, residency/visa overview, tax-residency implications, healthcare implications, banking + currency exposure, and the explicit handoff to International / Expat for the actual filing mechanics. STRATEGY only — do NOT execute international moves from a chat. Tax-residency and FBAR are CPA / immigration-attorney work.

## When to use

- "Should I move somewhere cheaper for FIRE?"
- "Can I retire to Portugal / Mexico / Thailand?"
- "What's the cheapest US state for FIRE?"
- "How does geographic arbitrage actually work tax-wise?"

## Inputs needed

This skill is exploratory — partial answers are fine and the rest can be gathered as you go.

- **current_location** — where the user lives today (city, state, country).
- **candidate_destinations** — one or more places the user is considering.
- **household_status** — single / couple / family with kids (ages helpful).
- **us_person_status** — US citizen / green-card holder / non-US (drives tax citizenship rules).
- **annual_spend_today** — approximate household annual spend in current location.
- **work_status** — employed / self-employed / retired / FIRE / studying.
- **healthcare_situation** — current coverage and what would change after the move.
- **reversibility_preference** — willing to commit long-term, or want to pilot first?

## Workflow

1. **Surface the cost lever honestly.** Geographic arbitrage CAN materially extend a FIRE plan — a household spending $80k/yr in California can often live the same lifestyle for $40–55k in a low-COL US state or $25–45k in many international destinations. That's a 30–70% reduction in the FIRE number.
2. **Distinguish DOMESTIC vs INTERNATIONAL arbitrage** — the mechanics, risks, and reversibility are very different.
3. **Domestic arbitrage runbook:**
   - **State tax dimension:** 9 no-state-income-tax states (AK, FL, NV, NH, SD, TN, TX, WA, WY). NH and WA tax interest/dividends or capital gains differently — verify. CA, NJ, NY, OR, MN are high-tax retirement destinations.
   - **Property tax dimension:** TX/NJ have high property tax even without income tax. FL, NV more friendly.
   - **Healthcare dimension:** ACA subsidies and Marketplace plan availability vary by state. Some states (NY, MA, MN, CA, WA) have richer state-level subsidies; some (FL, TX, GA) didn't expand Medicaid → coverage cliffs.
   - **Property cost dimension:** mortgage / rent / property tax / insurance combined.
   - **Lifestyle dimension:** weather, family proximity, walkability, healthcare access, kid schooling.
4. **International arbitrage runbook:**
   - **Visa pathways (popular FIRE destinations — verify current law):**
     - **Portugal D7** (passive-income visa) — historically welcoming; NHR tax regime was scaled back in 2024 — verify current status.
     - **Spain Non-Lucrative Visa (NLV)** — passive-income visa; no work permitted.
     - **Mexico Temporary Resident Visa** — income/savings thresholds; renewable to permanent.
     - **Thailand LTR (Long-Term Resident) visa** — 10-year visa for high-net-worth or retiree categories.
     - **Malaysia MM2H** — relaunched with higher thresholds in 2024.
     - **Panama Pensionado** — pension-based.
     - **Costa Rica Pensionado / Rentista** — pension or rental income.
   - **Tax-residency:** most countries trigger tax residency at 183 days. US citizens / green-card holders are ALWAYS US-tax resident (citizenship-based taxation — one of two countries globally, the other is Eritrea). FEIE vs FTC analysis is a CPA problem.
   - **FBAR / FATCA:** US-person foreign account aggregate > $10k triggers FBAR. $50k single / $100k MFJ aggregate triggers FATCA (Form 8938). Penalties are brutal ($10k/yr non-willful baseline; willful up to greater of $100k or 50% of balance, criminal exposure).
   - **PFIC trap:** US persons MUST NOT buy non-US-domiciled mutual funds / ETFs. Buy US-domiciled funds only, hold in US-domiciled brokerage (Schwab International, IBKR).
   - **Healthcare:** in many destinations, private health insurance is $1–4k/yr per person, OR national health systems are accessible to residents. Compare to US ACA cost.
   - **Currency exposure:** monthly expenses in destination currency, portfolio in USD — major FX risk if dollar weakens. Hedge consideration.
5. **Reversibility check.** Domestic moves are reversible at low cost. International moves can be harder — selling US home with §121 exclusion + replacing it later, kids' schooling continuity, social network rebuild. Surface honestly.
6. **Lifestyle compatibility check.** Lots of FIRE'd households move abroad and return within 2 years. Language, culture, family proximity, healthcare quality, climate. Don't price the move purely on COL.
7. **Surface the §877A risk** for households that might end up renouncing citizenship long-term — covered-expatriate exit tax. International / Expat handles this.
8. **Hand off filing mechanics.** Every international destination decision ends with **International / Expat** + CPA referral.

## Output template

```
# Geographic arbitrage analysis

## Your inputs
- Current location / spend: {city / state} @ ${X}/yr
- Target FIRE spend (current location): ${X}/yr
- Open to: {domestic only / international / both}
- Constraints: {family proximity / kid schooling / health needs / pet / etc.}

## Domestic arbitrage candidates
| Destination | COL-adj spend | State tax | Property tax | ACA / health | Net annual impact |
|-------------|---------------|-----------|--------------|--------------|-------------------|
| {City A, ST}| ${...}        | 0% / X%   | {...}/yr     | {notes}      | {-${...}/yr}      |
| {City B, ST}| ${...}        | ...       | ...          | ...          | {-${...}/yr}      |

→ Best domestic candidate: **{City}**, estimated **${X}/yr savings** = reduces FIRE number by **${X × 25}** at 4% WR.

## International arbitrage candidates
| Destination | Visa path  | Approx COL | US tax-residency | Healthcare cost | Net annual impact | Big-rock risks |
|-------------|------------|-----------|------------------|-----------------|-------------------|----------------|
| Portugal    | D7         | ${...}    | Yes (always)     | ${...}/yr       | {-${...}/yr}      | NHR scaled back; tax-residency; FX |
| Mexico      | Temporal   | ${...}    | Yes              | ${...}/yr       | {-${...}/yr}      | safety regional; FX |
| Thailand    | LTR        | ${...}    | Yes              | ${...}/yr       | {-${...}/yr}      | distance; visa renewal |
| ...         | ...        | ...       | ...              | ...             | ...               | ...            |

## Universal US-citizen reminders (INTERNATIONAL only)
- You remain US-tax resident regardless of where you live.
- FBAR + FATCA filing required at thresholds.
- PFIC trap: US-domiciled funds in US brokerage only.
- Tax-treaty / FEIE / FTC analysis: **CPA with expat experience**, NOT a chat.

## Reversibility
- Domestic move: easy to reverse (months, modest cost).
- International move: hard to reverse (year+, significant cost: sell home, ship belongings, kids' schooling continuity, replace social network).

## Lifestyle compatibility check
{Honest paragraph on the things that derail moves: language barrier, family distance, healthcare quality, climate, social network. Suggest a 3-month "trial run" before committing.}

## Recommended next step
{If domestic: "Run **State Tax Move Planner** in Tax Planner" if it exists, or "Run **Net Worth & Goals — Goal Planner** in Net Worth & Goals." If international: ALWAYS "Run **Expat Tax Overview** in International / Expat first, then engage an expat-experienced CPA before any commitment."}
```

## Common mistakes to flag

- **Pricing on COL index alone.** The all-in cost includes healthcare, taxes, FX hedging cost, kids' international-school tuition (often $15–30k/yr at the top end), and the cost of re-anchoring socially. Real total is often 1.3–1.5× the headline COL number.
- **Forgetting US tax residency for US citizens.** No matter where you live, you file. FEIE / FTC ≠ "no US tax."
- **Buying non-US-domiciled funds abroad.** PFIC trap. Penalty: punitive tax + multi-year reporting nightmare.
- **Treating international visa policy as permanent.** Portugal NHR scaled back 2024; Malaysia MM2H reset thresholds; rules change. Verify at decision time.
- **Renouncing citizenship without §877A modeling.** Covered-expatriate exit tax can be huge.
- **Single-spouse decision.** International moves are 100% household decisions; if both adults aren't aligned, the move fails.

## Citations / sources

- **IRC §877A** — covered-expatriate exit tax.
- **IRC §911** — FEIE.
- **IRC §901** — FTC.
- **IRC §1297** — PFIC.
- **31 USC §5314 / 31 CFR Chapter X** — FBAR.
- **IRC §6038D / Form 8938** — FATCA reporting.
- Cite visa programs as "current as of {year}, verify with destination embassy / immigration attorney before relying."
- US state tax structures — cite state DOR or `[UNSOURCED]` with verify pointer.

## Disclaimer

International tax / immigration is the highest-stakes Money Desk domain. The FBAR penalty alone ($10k/yr non-willful, willful up to 50% of account or $100k criminal) makes this CPA-with-expat-experience + immigration-attorney territory. NEVER execute an international move from a chat transcript. A 90-day trial in the destination BEFORE committing is the single best money you'll spend on the plan.

## Next step

**Next step → International / Expat:** "Run **Expat Tax Overview** for US person moving to {destination}, current US spend ${X}/yr, expected destination spend ${Y}/yr, asset structure {taxable $A / Trad $B / Roth $C}, source-of-income {portfolio / passive / consulting}."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).