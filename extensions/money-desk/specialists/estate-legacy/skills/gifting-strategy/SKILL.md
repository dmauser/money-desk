# Gifting Strategy

description: Plan lifetime gifts to family — annual-exclusion gifts, direct-pay medical & tuition, 529 superfunding, gifts of appreciated securities, and use of the lifetime estate & gift tax exemption. Surfaces tax reporting (Form 709), basis transfer rules, and the upcoming exemption sunset.

## When to use

- High-net-worth user approaching or above the lifetime estate & gift tax exemption.
- Grandparent funding 529s for grandchildren.
- Parent helping adult child with home down payment, wedding, business.
- User wants to support aging parents tax-efficiently.
- Charitable + family gifting need to be coordinated.

## Inputs needed

- Estimated net worth (federal + state — some states have lower estate-tax thresholds, e.g. NY, MA, OR, WA).
- Filing status (married couples have 2× exclusions and can split gifts).
- Recipients (children, grandchildren, parents, others) with ages and needs.
- Asset types available to gift (cash, appreciated stock, real estate, business interest).
- Existing 529 balances by beneficiary.
- State of residence (estate-tax states matter).
- Prior Form 709 filings (for lifetime-exemption tracking).

## Workflow

1. **Annual exclusion gifts.** Cite the year's annual exclusion ($19k per donor per recipient in 2025; indexed). No tax, no Form 709 required. Married couples can each give = $38k per recipient per year. Gift-splitting requires both spouses' consent on a Form 709.
2. **Direct-pay medical & tuition.** UNLIMITED, in ADDITION to annual exclusion, IF paid DIRECTLY to the institution (school, hospital, provider). Tuition only — not room/board/books. Powerful for grandparents.
3. **529 superfunding (5-year election).** Gift up to 5× annual exclusion to a 529 in one year ($95k per donor per beneficiary in 2025; $190k for a couple) and elect on Form 709 to treat as ratable over 5 years. Front-loads growth. Donor cannot make additional excluded gifts to same beneficiary during the 5-year period.
4. **Gifts of appreciated securities.**
   - To family: CARRYOVER basis (recipient inherits the donor's basis); useful if recipient is in a 0%/15% LTCG bracket and the donor is at 20%+NIIT.
   - To charity: FMV deduction + no cap-gains tax (see Charitable Giving Strategy).
   - Wash-sale doesn't apply (it's a gift, not a sale).
5. **Lifetime exemption tracking.** Federal lifetime estate + gift exemption ($13.99M per person in 2025, ~$27.98M per couple). SCHEDULED TO SUNSET to ~$7M (inflation-adjusted) on 2026-01-01 unless Congress acts. Window: 2025 calendar year is the last guaranteed-high-exemption year. Large gifts above the annual exclusion eat into this lifetime exemption (filed on Form 709 but no tax due until exemption is exhausted).
6. **State estate-tax exposure.** State exclusions are MUCH lower than federal in some states:
   - CT $13.99M (matches federal), NY $7.16M (2025; cliff!), MA $2M, OR $1M, WA $2.193M (2025), HI/MN/RI/VT/MD/IL/DC vary.
   - State-level planning may matter even when federal doesn't.
7. **Coordination with estate plan.** Lifetime gifting removes future appreciation from the estate but uses BASIS (no step-up). For highly-appreciated low-basis assets, often better to HOLD until death for step-up than gift during life (counter-intuitive).
8. **Form 709 triggers.** Any single gift > annual exclusion, any 529 superfund election, any gift-splitting. Due April 15 of following year.

## Required citations

- Annual exclusion + lifetime exemption cite the tax year + IRS Rev Proc.
- 529 superfunding cites IRC §529(c)(2)(B).
- State estate-tax thresholds cite the state department of revenue.
- Sunset cites TCJA (P.L. 115-97) §2001.

## Deliverable shape

- Markdown plan `./reports/estate-legacy/gifting-strategy-<YEAR>.md`:
  - Annual-exclusion gift plan per recipient.
  - Direct-pay opportunities identified.
  - 529 superfund recommendation (if applicable).
  - Appreciated-securities gift vs hold-for-step-up analysis.
  - Lifetime-exemption usage tracker (running total).
  - 2025 sunset action items (if HNW).
  - Form 709 filing checklist.

## Notes

- This skill does NOT draft trust documents — recommend an estate attorney for SLATs, GRATs, IDGTs, dynasty trusts.
- Gifting to minors directly is risky (UTMA becomes theirs at 18/21); 529s and trusts retain control.
- "Analysis only. Not professional tax or legal advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).