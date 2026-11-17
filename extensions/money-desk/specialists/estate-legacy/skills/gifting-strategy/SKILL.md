# Gifting Strategy

description: Plan lifetime gifts to family — annual-exclusion gifts, direct-pay medical & tuition, 529 superfunding, gifts of appreciated securities, and use of the lifetime estate & gift tax exemption. Surfaces tax reporting (Form 709), basis transfer rules, and the exemption sunset / legislative status.

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

1. **Annual exclusion gifts.** Cite the year's annual exclusion (`md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee`, per donor per recipient; indexed). No tax, no Form 709 required. Married couples can each give, = 2 × that amount per recipient per year. Gift-splitting requires both spouses' consent on a Form 709.
2. **Direct-pay medical & tuition.** UNLIMITED, in ADDITION to annual exclusion, IF paid DIRECTLY to the institution (school, hospital, provider). Tuition only — not room/board/books. Powerful for grandparents.
3. **529 superfunding (5-year election).** Gift up to 5× annual exclusion to a 529 in one year (5 × `annual_gift_exclusion_per_donee` per donor per beneficiary; double for a couple) and elect on Form 709 to treat as ratable over 5 years. Front-loads growth. Donor cannot make additional excluded gifts to same beneficiary during the 5-year period.
4. **Gifts of appreciated securities.**
   - To family: CARRYOVER basis (recipient inherits the donor's basis); useful if recipient is in a 0%/15% LTCG bracket and the donor is at 20%+NIIT.
   - To charity: FMV deduction + no cap-gains tax (see Charitable Giving Strategy).
   - Wash-sale doesn't apply (it's a gift, not a sale).
5. **Lifetime exemption tracking.** Federal lifetime estate + gift exemption per person: `md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual` (×2 for a couple). md_facts notes the level depends on whether the TCJA sunset was changed by legislation — verify current law via `md_sources` before advising. Large gifts above the annual exclusion eat into this lifetime exemption (filed on Form 709 but no tax due until exemption is exhausted).
6. **State estate-tax exposure.** State exclusions are MUCH lower than federal in some states:
   - Thresholds are not in md_facts — look up the current figure via `md_sources` (state DoR), else tag `[UNSOURCED]`. States with an estate or inheritance tax include CT, NY (cliff), MA, OR, WA, HI, MN, RI, VT, MD, IL, DC.
   - State-level planning may matter even when federal doesn't.
7. **Coordination with estate plan.** Lifetime gifting removes future appreciation from the estate but uses BASIS (no step-up). For highly-appreciated low-basis assets, often better to HOLD until death for step-up than gift during life (counter-intuitive).
8. **Form 709 triggers.** Any single gift > annual exclusion, any 529 superfund election, any gift-splitting. Due April 15 of following year.

## Required citations

- Annual exclusion + lifetime exemption cite the tax year + IRS Rev Proc.
- 529 superfunding cites IRC §529(c)(2)(B).
- State estate-tax thresholds cite the state department of revenue.
- Sunset cites TCJA (P.L. 115-97) §2001 and any later legislation found via `md_sources`.

## Deliverable shape

- Markdown plan `./money-desk/estate-legacy/gifting-strategy-<YEAR>.md`:
  - Annual-exclusion gift plan per recipient.
  - Direct-pay opportunities identified.
  - 529 superfund recommendation (if applicable).
  - Appreciated-securities gift vs hold-for-step-up analysis.
  - Lifetime-exemption usage tracker (running total).
  - Exemption-change action items (if HNW).
  - Form 709 filing checklist.

## Notes

- This skill does NOT draft trust documents — recommend an estate attorney for SLATs, GRATs, IDGTs, dynasty trusts.
- Gifting to minors directly is risky (UTMA becomes theirs at 18/21); 529s and trusts retain control.
- "Analysis only. Not professional tax or legal advice."

## Determinism rules

### Input keys

- `tax_year` — integer
- `donors` — integer 1 or 2 (both spouses giving, or gift-splitting elected)
- `gift_splitting` — bool (married couple electing to split on Form 709)
- `spouse_us_citizen` — bool; only for gifts to a spouse
- `recipients` — list of `{ name, relationship, age, cash_gifts_planned_usd, tuition_paid_direct_usd, medical_paid_direct_usd, superfund_529_usd, superfund_election_year? }`
- `prior_taxable_gifts_usd` — number per donor (lifetime total from prior Form 709s); default 0
- `estimated_net_worth_usd` — number (household)
- `state` — two-letter code
- `appreciated_assets` — list of `{ asset, fmv_usd, basis_usd, intended_recipient }`; optional
- `donor_ltcg_rate_pct`, `recipient_ltcg_rate_pct` — numbers (federal + NIIT + state combined), optional

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Annual exclusion per donee | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` | `[IRS Estate 2026]` |
| Lifetime estate & gift exemption | `md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual` — md_facts notes the figure depends on whether the TCJA sunset was changed by legislation; verify via `md_sources` before advising | `[IRS Estate 2026]` |
| Annual exclusion to a non-citizen spouse | `md_facts` → `estate_and_gift_2026.annual_exclusion_to_non_citizen_spouse` | `[IRS Estate 2026]` |
| 529 superfunding | 5 × annual exclusion per donor per beneficiary, ratable over 5 years (IRC §529(c)(2)(B)) | — |
| State estate / inheritance-tax threshold | Not in md_facts — look up via `md_sources` (state DoR), else tag `[UNSOURCED]` and mark state exposure "unknown" | `[UNSOURCED]` |
| Donor / recipient LTCG rates | **Ask — no default**; without them the carryover-basis comparison is qualitative only | `[USER-PROVIDED]` |
| Prior taxable gifts | $0 if no Form 709 was ever filed (user confirms) | `[USER-PROVIDED]` |

### Calculation method

Compute in cents; report whole dollars.

1. **Exclusion capacity per recipient** `cap = AE × donors` (`donors = 2` only if both spouses give or `gift_splitting`). Gifts to a non-citizen spouse use the non-citizen-spouse amount instead.
2. **Direct-pay** tuition and medical paid directly to the institution are excluded in full and do not use `cap`.
3. **529 superfund** per recipient: `sf_excluded = min(superfund_529_usd, 5 × AE × donors)`; `sf_share = sf_excluded / 5`, counted against `cap` in each of the 5 years from `superfund_election_year` (default `tax_year`); `sf_excess = superfund_529_usd − sf_excluded` is a taxable gift this year.
4. **Taxable gift per recipient** `= max(0, cash_gifts_planned_usd + sf_share − cap) + sf_excess`, split equally between donors when `donors = 2`.
5. **Lifetime exemption remaining per donor** `= exemption − prior_taxable_gifts_usd − this year's taxable gifts`. If negative, gift tax is due — stop and route to a CPA / estate attorney.
6. **Estate exposure.** Federal: `fed_excess = max(0, estimated_net_worth_usd − Σ remaining exemption of both spouses)` (only one spouse's if single; portability is not assumed). State: `state_excess = max(0, estimated_net_worth_usd − state_threshold)` if sourced, else "unknown".
7. **Appreciated assets** (only if rates supplied): `gain = fmv − basis`; `gift_saving = gain × (donor_rate − recipient_rate)` (if the recipient will sell); `step_up_saving = gain × donor_rate` (if held until death). Order assets by gain ratio `gain / fmv` descending.
8. **Form 709 triggers** (fixed list): any donor's gift to one recipient > AE (excluding direct-pay); any 529 superfund election; any gift-splitting election. Due April 15 of the following year.

### Decision rules

Overall plan; evaluate top to bottom; the first match wins. Annual-exclusion and direct-pay gifts are recommended under every row.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Net worth or recipient list missing | No plan — ask |
| 2 | Step 5 gives negative remaining exemption | Stop — gift tax due; CPA / estate attorney before any further gift |
| 3 | `fed_excess > 0` or `state_excess > 0` | Estate-reduction gifting: use full exclusions + superfunding; gift high-growth assets; refer to estate attorney for SLAT / GRAT / IDGT review |
| 4 | State exposure "unknown" and the state has an estate or inheritance tax | Source the state threshold before large gifts; proceed with exclusion-only gifts |
| 5 | Any appreciated asset with `step_up_saving > gift_saving` | Hold those assets for step-up; gift cash or high-basis assets instead |
| 6 | Otherwise | Exclusion-based gifting only; no lifetime-exemption use needed |

### Output template

```markdown
# Gifting Strategy — {tax_year}

## Headline
Recommendation: **{rule # action}**. Annual exclusion ${AE} per donor per recipient [IRS Estate 2026]; lifetime exemption remaining ${remaining} per donor.

## Annual-exclusion gift plan
| Recipient | Relationship | Exclusion capacity | Planned cash | Taxable portion |
|---|---|---|---|---|

## Direct-pay opportunities
| Recipient | Tuition (direct) | Medical (direct) |
|---|---|---|
{or "Not applicable — none planned"}

## 529 superfunding
| Beneficiary | Amount | Excluded | Excess | Election years |
|---|---|---|---|---|
{or "Not applicable — no superfunding planned"}

## Appreciated securities: gift vs hold for step-up
| Asset | FMV | Basis | Gain | Gift saving | Step-up saving | Decision |
|---|---|---|---|---|---|---|
{or "Not applicable — no appreciated assets or rates not supplied"}

## Lifetime-exemption tracker
| Donor | Exemption (md_facts) | Prior taxable gifts | This year | Remaining |
|---|---|---|---|---|

## Estate exposure
| Level | Threshold (source) | Excess |
|---|---|---|
| Federal | | |
| State ({state}) | | |

## Exemption-change action items
{verification of current exemption law and HNW actions — or "Not applicable — no estate exposure"}

## Form 709 checklist
{triggers fired and due date — or "Not required — no trigger"}

Analysis only. Not professional tax or legal advice.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).