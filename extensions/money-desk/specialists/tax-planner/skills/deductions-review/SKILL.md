# Deductions Review

description: Compare itemized vs standard deduction; identify above-the-line deductions and credits the user may be missing. Outputs a year-end action list to maximize legal deductions before Dec 31. Use during tax planning or end-of-year tax moves.

## When to use

- November/December tax-move planning.
- After a major life event (home purchase, marriage, large medical year, big charitable gift).
- The user asks "am I leaving money on the table?"

## Inputs needed

- Tax year, filing status, AGI estimate.
- State (some itemized items vary by state, esp. SALT cap effects).
- For each potential itemized category: rough total YTD (mortgage interest, property tax, SALT income tax, charitable, medical).
- Pre-tax retirement / HSA contributions YTD.
- Major life events (home, marriage, kids, education).

## Workflow

1. **Compute current-year standard deduction** for filing status.
2. **Sum potential itemized deductions:**
   - Mortgage interest (1098).
   - State + local income/sales tax + property tax — but capped at $10k (SALT cap).
   - Charitable contributions (cash & non-cash; non-cash >$500 requires Form 8283).
   - Medical expenses above 7.5% of AGI.
   - Casualty losses (federally declared disaster only).
3. **Verdict.** If itemized > standard, recommend itemizing. If close, look for year-end moves that tip the scale (bunching charitable into one year, prepaying property tax where allowed, charity-via-DAF lump).
4. **Above-the-line (always available even with standard deduction):**
   - HSA contributions (if HDHP).
   - Traditional IRA (subject to income limits if covered by workplace plan).
   - SE retirement (SEP-IRA, Solo 401(k)) for 1099 income.
   - Student-loan interest (up to $2,500, with phase-outs).
   - Educator expenses, SE health insurance, etc.
5. **Credits often missed:**
   - Saver's Credit (low/mid AGI + retirement contributions).
   - Child & Dependent Care Credit (separate from CTC).
   - Lifetime Learning / American Opportunity (education).
   - Residential Clean Energy / Energy Efficient Home Improvement.
   - EV / clean vehicle (with strict eligibility rules — confirm current year).
6. **Bunching analysis.** If user is right at standard-deduction threshold and gives regularly, suggest a 2-year bunch (giving 2 years' worth in one tax year via DAF, taking standard the other year).
7. **Year-end checklist.** Specific actions with deadlines (most must complete by Dec 31; IRA + HSA have until tax-filing day).

## Required citations

- Each deduction amount cites a source doc (1098, charity letter, property-tax bill, HSA statement).
- Limits and phase-outs cite the tax year explicitly.

## Deliverable shape

- Markdown report `./reports/tax-planner/deductions-review-<YEAR>.md`:
  - **Itemize vs Standard verdict.**
  - **Itemized buildup** — line by line with cited amounts.
  - **Above-the-line summary** — what's claimed, what's available.
  - **Credit checklist** — eligible / not eligible / verify.
  - **Year-end action list** — bunching, DAF, prepayment, HSA top-up, IRA contribution.

## Notes

- Limits change yearly. Confirm with IRS docs for the working tax year.
- Roth IRA contributions are NOT deductible (they're not in scope here, but flag if the user conflates them).
- Charitable contributions to non-qualified orgs (e.g. individuals via GoFundMe) are NOT deductible.
- Donor-advised funds (DAF) let users bunch a multi-year charitable plan into one tax year while granting to charities over time.
- "Not professional tax advice — informational only."
