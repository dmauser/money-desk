## Financial Aid Positioning

description: Surface what FAFSA and the CSS Profile actually count, compute approximate Student Aid Index (SAI, formerly EFC), and identify legal asset-positioning moves to optimize need-based aid. Use when the user expects to be aid-eligible (rough rule: AGI under ~$200k, more with multiple kids in college). Does NOT submit FAFSA on the user's behalf.

## When to use

- 18+ months before the child's FAFSA filing date (FAFSA opens Oct 1, but the new simplified FAFSA opens December).
- Reviewing the impact of a Roth conversion, capital gain, or 529 rollover that would land in a FAFSA "base year" (prior-prior year income).
- Grandparents asking how to help without hurting aid.

## Inputs needed

- Child's expected college start year (determines base year — FAFSA uses prior-prior-year income; 2025–26 FAFSA uses 2023 tax return).
- Household AGI for the base year.
- Parents' assets: cash, taxable brokerage, real estate equity (non-primary-residence), 529 accounts, business interest >$X depending on year.
- Student's assets: bank accounts, UTMA/UGMA, student-owned 529 (less common).
- Number of children expected to be in college simultaneously (post-FAFSA-Simplification this no longer gives a discount — flag this change).
- Whether either parent is a small-business owner (rules changed for businesses < 100 employees).

## Workflow

1. **Identify the base year.** SAI for academic year YYYY–(YYYY+1) uses the (YYYY−2) tax return. So senior-year-of-HS for a Sep 2026 start → uses 2024 income → planning window for income smoothing was 2023.
2. **Estimate parent contribution from income.** Per FAFSA Simplification formulas (2024–25 onward): parent AGI minus federal/state tax allowance minus FICA minus income-protection allowance ($X depending on household size), times the assessment rate (up to 47%).
3. **Estimate parent contribution from assets.** Cash + non-retirement investments + non-primary real estate, minus an asset-protection allowance (smaller post-Simplification), assessed at 5.64%. **Retirement accounts (401k, IRA) do NOT count.** **Primary residence does NOT count for FAFSA** (CSS Profile is different — many private colleges use CSS and DO count home equity).
4. **Estimate student contribution.** Student income above ~$10k assessed at 50%. Student assets assessed at 20% (much harsher than parent assets — flag the impact of UTMAs).
5. **Compute SAI.** Sum the four contributions. Compare to the cost of attendance at target schools. Need-based aid potential = COA − SAI (subject to school's aid policy and resources).
6. **Identify positioning levers.**
   - **Shift student assets to parent assets** before filing (e.g., spend down a UTMA on legitimate kid expenses — bike, computer, summer-camp — *before* the base year).
   - **Pay down debt** with non-retirement cash before filing (reduces countable assets).
   - **Max retirement contributions** in the base year (reduces AGI, moves assets to non-countable retirement).
   - **Time capital gains and Roth conversions** to avoid base years.
   - **Grandparent 529s** — post-Simplification, distributions from grandparent-owned 529s are no longer counted as student income on FAFSA. Major change. (Still counted on CSS Profile.)
7. **CSS Profile (if any target school uses it).** Different formula: home equity counts (often capped at 1.2× AGI), non-custodial parent income counts, small-business value counts more aggressively. Flag this if private/elite schools are on the list.

## Required citations

- SAI formula cites the current FAFSA EFC/SAI Formula Guide (year-specific PDF from studentaid.gov).
- Asset-protection allowance and income-protection allowance cite the year-specific tables.
- Any school-specific aid claim cites that school's published methodology / Common Data Set.

## Deliverable shape

Markdown report `./money-desk/<CHILD>/aid-positioning-<YYYYMMDD>.md`:
- **Headline** — e.g., "Estimated SAI: $X. At a $35k/yr in-state public, need-based aid potential is ~$Y."
- **SAI breakdown table** — parent income / parent assets / student income / student assets.
- **Positioning levers** — ranked by SAI impact, with the action and the deadline.
- **Base-year calendar** — what year's tax return matters for each application year.
- **CSS Profile callout** — if relevant, the additional differences.

## Notes

- The 2024–25 FAFSA Simplification eliminated the "sibling discount" (used to divide SAI by # in college). This is the biggest change for multi-kid families and often shocks them.
- Small-business and family-farm assets are now counted on FAFSA (used to be excluded). Cite this if relevant.
- This skill does **not** estimate merit aid (non-need-based). Use each target school's Net Price Calculator for that.
- 529 ownership: parent-owned counts as parent asset (5.64%); student-owned counts as student asset (20%) on FAFSA — but on the new FAFSA, the 529 *belongs* to the account owner regardless of beneficiary. Confirm with the plan.


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).