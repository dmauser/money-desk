## Business Deductions & QBI Review

description: Audit Schedule C (or S-corp) business deductions for completeness and defensibility — home office, mileage vs actual auto, self-employed health insurance, retirement, Section 179 / bonus depreciation, meals, supplies, professional services, software — and check QBI (Section 199A) 20% pass-through deduction with income-threshold phase-outs and SSTB rules.

## When to use

- First Schedule C — surface deductions the user is missing.
- Year-end planning — flag eligible expenses to time before Dec 31.
- After a CPA review — sanity-check completeness.
- Annual: re-audit because rules and limits change.

## Inputs needed

- Type of business / SSTB status (consulting, law, health, accounting, financial services, performing arts, athletics, investment management = SSTB; engineering, architecture, manufacturing, retail = non-SSTB).
- Gross revenue.
- Itemized expenses to date (or chart of accounts).
- Home-office details: dedicated room? Square footage? Total home square footage? Home mortgage interest / rent / utilities / depreciation basis?
- Vehicle: business miles, personal miles, vehicle cost basis, year placed in service.
- Health insurance premiums (self-employed): paid personally? On a marketplace plan?
- Filing status, taxable income (drives QBI phase-out).
- Whether the user uses an accountable plan (S-corp) for reimbursements.

## Workflow

1. **Walk the standard deduction checklist** (cite Schedule C line):
   - **Line 8 Advertising** — website, ads, business cards.
   - **Line 9 Car & truck expenses** — standard mileage (67¢/mi 2024, cite current) OR actual + depreciation. Standard easier; actual better for expensive vehicle / heavy use. Once actual chosen for a vehicle, can't switch back to standard.
   - **Line 10 Commissions and fees** — referral fees, platform fees (Stripe, Upwork, etc.).
   - **Line 11 Contract labor** — issue 1099-NEC for $600+ to non-employee contractors.
   - **Line 13 Depreciation / Section 179** — equipment >$2,500 typically depreciated; Sec 179 expensing up to $1.16M (2024) for qualifying property; bonus depreciation 60% for 2024 (sunsetting).
   - **Line 14 Employee benefits** — only if employees; not the owner's solo health.
   - **Line 15 Insurance (non-health)** — liability, E&O, malpractice, business property. Health insurance is separate (line 29 Sch 1).
   - **Line 16 Interest** — business loan, business credit card interest. Personal-card interest only deductible if business-only card.
   - **Line 17 Legal & professional** — CPA fees, attorney for business matters, registered agent.
   - **Line 18 Office expense** — supplies, postage.
   - **Line 19 Pension & profit-sharing** — handled separately on Sch 1 for owner; Sch C only for employees.
   - **Line 20 Rent or lease** — office, equipment, vehicle (lease only).
   - **Line 21 Repairs & maintenance** — for business assets.
   - **Line 22 Supplies** — consumables.
   - **Line 23 Taxes & licenses** — business licenses, state franchise tax, employer payroll tax. NOT income tax.
   - **Line 24 Travel & meals** — travel 100%; meals 50% (was 100% pandemic-era, now 50% standard, cite year).
   - **Line 25 Utilities** — business phone, business internet (or home-office allocation).
   - **Line 27 Other expenses** — itemize anything not above.
   - **Line 30 Home office** — simplified method ($5/sqft up to 300 sqft = $1,500 max) OR regular method (% of home costs × business-use fraction). Regular usually larger but adds depreciation recapture on home sale.
2. **Above-the-line adjustments** (Schedule 1, not Sch C, but SE-specific):
   - **Half SE tax deduction** (Sch 1 line 15).
   - **Self-employed health insurance** (Sch 1 line 17) — premiums for self + family, capped at net SE income, not eligible if user/spouse eligible for any subsidized employer plan.
   - **SE retirement contribution** (Sch 1 line 16) — Solo 401(k) / SEP / SIMPLE employer portion.
   - **HSA** (Sch 1 line 13) — if HDHP-covered.
3. **QBI deduction (Section 199A)** — 20% of qualified business income.
   - **Below threshold** (2025: $241,950 single / $483,900 MFJ): full 20% with simple formula.
   - **In phase-out band** ($241,950–$291,950 single / $483,900–$583,900 MFJ): partial; SSTB-status starts mattering.
   - **Above threshold**: SSTBs lose QBI entirely; non-SSTBs subject to wage / UBIA limitations (W-2 wages OR W-2 wages + 2.5% of unadjusted basis).
   - For S-corp owner: QBI computed on K-1 distribution piece (not W-2 wage piece) — interacts with reasonable-comp choice.
4. **Surface missed deductions.** Common omissions: home internet allocation, business portion of cell phone, software subscriptions, continuing education / certifications, books and journals (subscription audit pairs well here), bank fees on business account, business gifts ($25/recipient/yr cap), startup costs ($5k expensing in year one).
5. **Flag risk areas.** Aggressive deductions that draw IRS attention: 100% business use of vehicle when user only owns one car, home office in a non-dedicated space, excessive meals deduction, family members on payroll without real work, "consulting" classification when actually employment.

## Required citations

- Mileage rate, Sec 179 cap, bonus-depreciation percentage cite current-year IRS notice.
- QBI thresholds cite current-year inflation adjustment.
- Schedule C line numbers cite the current form.

## Deliverable shape

Markdown report `./reports/self-employed-planner/deductions-<YYYYMMDD>.md`:
- **Headline** — e.g., "Identified $X in additional deductions vs current filing; estimated tax savings ~$X × marginal rate."
- **Sch C deduction table** — line, amount currently claimed, amount recommended, $delta, notes.
- **Above-the-line adjustments** — half-SE, SEHI, retirement, HSA.
- **QBI calculation** — QBI, threshold band, applicable limitation, deduction amount.
- **Missed deduction recommendations** — ranked by $ impact.
- **Year-end timing list** — purchases / contributions to make before Dec 31.
- **Risk callouts** — aggressive items to substantiate or back off.

## Notes

- The IRS rule of thumb: a deduction needs to be "ordinary AND necessary" for your business. "Ordinary" = common in your industry; "Necessary" = helpful and appropriate. Most legitimate business expenses pass.
- Receipts: under $75 not required for non-lodging; lodging always. Keep regardless for digital audit trail.
- Home office and vehicle are the highest-leverage deductions but also the most-audited. Do them right (contemporaneous mileage log, dedicated home-office space) and they're bulletproof.
- This skill audits and recommends; it does NOT prepare the return. For complex situations (multi-state, asset disposition, depreciation recapture), hand off to a CPA.
