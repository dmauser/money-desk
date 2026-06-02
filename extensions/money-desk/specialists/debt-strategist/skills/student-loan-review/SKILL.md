# Student Loan Review

description: Review federal and private student loans — repayment plan choice (IDR variants), PSLF eligibility, refinance trade-offs, and aggressive payoff vs invest-the-difference. Federal-vs-private framing is central. Use for any student-loan question.

## When to use

- Recent grad enrolling in a repayment plan.
- Working in qualifying public-service employment (PSLF candidate).
- Considering refinancing federal loans to private.
- Lump-sum decision (bonus → loans or → invest?).

## Inputs needed

- Per loan: lender (federal servicer or private), balance, rate, type (Direct Sub/Unsub, Grad PLUS, Parent PLUS, Perkins, FFEL, private), current repayment plan, months remaining.
- Total federal vs private split.
- Income, family size (drives IDR payment calc).
- Employer type (qualifying nonprofit / government for PSLF).
- Career horizon (likelihood of staying in qualifying employment for 120 payments).

## Workflow

1. **Separate federal from private.** Federal loans have unique protections (IDR, PSLF, deferment, forbearance, death/disability discharge) that should NOT be given up lightly.
2. **Federal repayment plan selection.**
   - Standard 10y — fastest, most total interest typically lowest unless IDR forgiveness applies.
   - Graduated / Extended — niche.
   - IDR variants (SAVE, PAYE, IBR, ICC — confirm currently-available plans by working year, as the landscape shifts with policy changes). IDR payment = % of discretionary income; remaining balance forgiven at 20/25/10 years depending on plan and tier.
3. **PSLF qualification.** Working at qualifying employer (501(c)(3), gov't), on IDR plan (or 10y standard), making 120 qualifying payments. Track via PSLF Help Tool. If on path → minimize payments (IDR), do NOT prepay.
4. **Refinance decision (federal → private).**
   - Pros: lower rate (if credit + income strong).
   - Cons: lose IDR, PSLF, death/disability discharge, deferment options.
   - Strong refi case: high-income borrower, no PSLF intent, large balance with high rate.
   - Weak refi case: any PSLF possibility, lower income, uncertain employment.
5. **Payoff vs invest the difference.** Compare loan rate (after any tax benefit) to expected real after-tax return. High-rate private loans (>~7%) → pay aggressively. Low-rate federal (~3–5%) → minimum + invest the surplus, especially if PSLF is in play.
6. **Tax interaction.** Up to $2,500/yr student loan interest deduction (subject to phase-outs). IDR forgiveness has been temporarily tax-free under recent law — flag the current working-year status.
7. **Action list.** Specific plan name to enroll in, employment certification cadence (annual for PSLF), refi quotes to gather if applicable.

## Required citations

- Loan terms cite the most recent statement / NSLDS export.
- IDR formula cites StudentAid.gov for the current plan rules.
- PSLF rules cite the PSLF Help Tool / StudentAid.gov.

## Deliverable shape

- Markdown report `./money-desk/debt-strategist/student-loan-review-<YYYYMMDD>.md`:
  - **Inventory** — federal vs private split, balances, rates.
  - **Recommended path** — Standard / IDR / PSLF / Refi — with reasoning.
  - **Projected total paid** under recommended path.
  - **Risks / decisions to revisit** — career change, family size change, policy change.
  - **Action list** — enrollment, certifications, quotes.

## Notes

- Policy on IDR plans (SAVE etc.) has changed multiple times in recent years. Always verify against StudentAid.gov for the working date.
- "Don't refi federal loans to private without a clear-eyed read of what you're giving up."
- "Not professional financial or legal advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).