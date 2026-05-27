## Retirement Plan Selector

description: For a self-employed individual (sole prop / single-member LLC / S-corp owner), compare Solo 401(k) vs SEP IRA vs SIMPLE IRA vs Defined Benefit / Cash Balance plan. Compute contribution limits at the user's net SE income, surface Roth availability, deadlines (open-by vs fund-by), and admin complexity. Recommends a primary plan with reasoning.

## When to use

- New 1099 income with no plan yet.
- Already-have-SEP user with growing income (Solo 401(k) often becomes the better choice).
- Spouse-only business considering Solo 401(k) with spouse contribution doubling effective limit.
- Very-high-income consultant (>$300k net) considering Defined Benefit / Cash Balance for $100k+ contributions.

## Inputs needed

- Net SE income (Schedule C line 31, or K-1 SE-earnings, or S-corp W-2 wages).
- Entity (sole prop / single-member LLC / S-corp / partnership).
- Whether ANY employees exist beyond owner+spouse (changes everything — Solo 401(k) ineligible).
- Age (50+ unlocks catch-up).
- Whether the user wants Roth contributions in the plan.
- Any other current-year W-2 401(k) deferrals (employee deferral limit is per-PERSON across all plans).
- Current-year projection vs prior-year actual (deadlines differ).

## Workflow

1. **Disqualify ineligible plans.** Solo 401(k) requires no W-2 employees other than owner+spouse. SEP IRA accepts employees but requires equal contributions for all (expensive). SIMPLE IRA suits 1–100 employees with 3% match obligation.
2. **Compute contribution headroom by plan**, using **2025 limits** (cite the source — IRS Notice / Pub 560):
   - **Solo 401(k):**
     - Employee deferral: $23,500 (Roth or pre-tax), +$7,500 catch-up if 50–59 or 64+, +$11,250 super-catch-up if 60–63 (SECURE 2.0).
     - Employer profit-sharing: up to 25% of net SE compensation (sole prop: 20% of net SE earnings after 1/2 SE tax). Combined limit $70,000 ($77,500 with 50+ catch-up; $81,250 with 60–63 super-catch-up).
     - Mega backdoor Roth (after-tax + in-plan Roth conversion) IF the plan document supports it (most Solo 401(k) prototypes do NOT — flag this; need a custom plan).
   - **SEP IRA:**
     - Lesser of 25% of net SE compensation or $70,000. No employee deferral. No catch-up. No Roth (until SECURE 2.0 SEP Roth — confirm provider supports).
   - **SIMPLE IRA:**
     - Employee deferral $16,500 + $3,500 catch-up at 50; employer 3% match or 2% nonelective. Lower ceiling than Solo 401(k).
   - **Defined Benefit / Cash Balance:**
     - Actuarially determined; can exceed $200k/yr for older high-earners; requires actuary, formal plan doc, vesting schedule. Worth analyzing above ~$300k net SE.
3. **Compute net-SE-comp adjusted contribution.**
   - Sole prop / single-member LLC: "net SE compensation" = Sch C net − 1/2 SE tax − employer retirement contribution itself (circular; use the IRS Pub 560 deduction worksheet).
   - S-corp owner: employer contribution based on W-2 wages (not on K-1 distribution). This often *reduces* total contribution capacity vs sole-prop — surface this trade-off.
4. **Deadlines.**
   - **Solo 401(k)**: Plan must be ESTABLISHED by Dec 31 of the contribution year (SECURE Act 2019 softened for sole prop: can establish by tax filing deadline for the employer contribution portion; employee deferral still typically Dec 31 designation). Funded by tax-filing deadline + extensions.
   - **SEP**: Establish and fund by tax-filing deadline including extensions (Apr 15 / Oct 15).
   - **SIMPLE**: Establish between Jan 1 and Oct 1; funding deadlines per the plan document.
   - **DB**: Establish by Dec 31 (with extensions in some cases); funded by tax deadline.
5. **Recommendation matrix.**
   - Low / variable SE income, no W-2 retirement saving: **Solo 401(k)** (employee deferral helps even at low income).
   - High SE income (>$70k net), wants Roth: **Solo 401(k)** with Roth option.
   - Want to avoid Form 5500 paperwork (>$250k plan assets triggers 5500-EZ): **SEP** is paper-free; Solo 401(k) requires 5500-EZ once over threshold.
   - Has even one W-2 employee: **SEP** (must cover) or **SIMPLE** (cheaper coverage).
   - $300k+ net SE, age 45+, predictable income: add **Cash Balance** plan on top of Solo 401(k).

## Required citations

- All dollar limits cite the IRS publication / current-year tax inflation announcement.
- Net SE comp calculation cites IRS Pub 560 worksheet.
- Deadline rules cite the SECURE Act / SECURE 2.0 relevant section if discussing recent changes.

## Deliverable shape

Markdown report `./reports/self-employed-planner/retirement-plan-<YYYYMMDD>.md`:
- **Headline recommendation** — e.g., "Open a Solo 401(k) with Roth at Fidelity/Schwab/E*TRADE; deferral $23,500 Roth + employer $16,200 pre-tax = $39,700 total at your $81k net SE income."
- **Contribution math table** — each plan, employee piece, employer piece, total, % of net SE.
- **Deadline table** — open-by vs fund-by for each plan.
- **Pros/cons table** — Roth available, paperwork, employee impact.
- **Action checklist** — which custodian (cite — major: Fidelity Solo 401(k), Schwab Individual 401(k), E*TRADE), forms to file (SS-4 EIN if needed), Dec 31 deadline reminder.

## Notes

- The SECURE 2.0 super-catch-up (60–63) is new — only relevant for users in that band; cite the rule.
- Solo 401(k) Roth contributions don't have the income phase-outs that Roth IRAs do — major win for high-earning consultants.
- SEP IRA contributions count as "employer" only, no employee deferral — so a $100k consultant maxes SEP at $25k vs Solo 401(k) potentially $48k+. The Solo 401(k) usually wins below the 25%-of-comp cap.
- If converting a SEP to a Solo 401(k) mid-year, plan timing carefully — same-year SEP contributions count against the $70k aggregate.
