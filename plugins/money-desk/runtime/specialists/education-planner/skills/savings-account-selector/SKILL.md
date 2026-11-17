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
   - **Contribution limits** — 529: aggregate limit per state ($235k–$575k); 5-yr superfund = 5 × `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` per donor. Coverdell: $2,000/yr/beneficiary, phased out from $95k (single) / $190k (MFJ) MAGI (statutory, not indexed). Roth IRA: `md_facts` → `irs_contribution_limits.ira_traditional_or_roth` (+ `.ira_catchup_age_50_plus`), requires earned income; MAGI phase-out not in `md_facts` — source via `md_sources`. UTMA: unlimited but gift-tax annual exclusion (`annual_gift_exclusion_per_donee`, ×2 with gift splitting).
   - **Qualified expenses** — 529: tuition, R&B, books, computer, K-12 tuition up to the federal annual limit (not in `md_facts` — verify the current figure via `md_sources`), apprenticeships, $10k lifetime student loan. Coverdell: same plus K-12 broader. Roth: contributions anytime; earnings for higher-ed qualified but lose the retirement compounding.
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

Markdown report `./money-desk/<CHILD>/account-selector-<YYYYMMDD>.md`:
- **Headline recommendation** — e.g., "Open a Utah my529 (your state has no deduction; UT is cheapest plan); fund $X/mo; add a Coverdell only if you want K-12 private school flexibility."
- **Comparison matrix** — 5 vehicles × ~7 dimensions.
- **Reasoning** — why the recommended stack, what was eliminated and why.
- **Action checklist** — open account (URL), set monthly auto-contribution, name beneficiary + successor.

## Notes

- The Roth-for-education argument is **only** strong if the parent already has retirement on track. Otherwise the opportunity cost (lost retirement compounding) crushes the case.
- Some families like UTMA for the "first car / wedding / down-payment-help" use case — that's fine, just don't conflate it with college planning.
- 529 superfunding (5-year averaging of gift-tax annual exclusion) is the highest-leverage way for grandparents or high-income parents to seed an account.

## Determinism rules

### Input keys

- `household_magi_usd` — number
- `filing_status` — `mfj` | `single` | `hoh` | `mfs`
- `residence_state` — two-letter code; `state_529_deduction_available` — bool
- `goal` — `college` | `k12_and_college` | `general_gift_to_child`
- `years_to_college` — integer
- `retirement_on_track` — bool (retirement savings at target per Retirement Planner, or the user's own statement)
- `emergency_fund_funded` — bool
- `parent_has_earned_income_room` — bool (can still make a Roth IRA contribution this year, direct or backdoor)
- `non_college_flexibility_priority` — bool
- `wants_k12_flexibility` — bool
- `lump_sum_available_usd` — number (default 0)
- `parent_age_50_plus` — bool

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Annual gift exclusion (UTMA gifts, 529 contributions) | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` (×2 for a married couple splitting gifts) | `[IRS Estate 2026]` |
| 529 five-year superfund | 5 × `annual_gift_exclusion_per_donee` per donor | `[IRS Estate 2026]` |
| Roth IRA contribution limit | `md_facts` → `irs_contribution_limits.ira_traditional_or_roth` + `.ira_catchup_age_50_plus` | `[IRS 2026 limits]` |
| Roth IRA MAGI phase-out | `md_facts` → `credits_and_ira_phaseouts_2026.roth_ira_contribution_phaseout_single_hoh` / `.roth_ira_contribution_phaseout_mfj` (MAGI `start`–`end`) | `[IRS credits & IRA phase-outs 2026]` |
| Coverdell limit ($2,000 / beneficiary) and MAGI phase-out ($95k–$110k single, $190k–$220k MFJ) | Statutory, not inflation-indexed (IRC §530) | statute |
| 529 K-12 tuition annual limit | not in md_facts — verify the current federal limit via `md_sources` (changed by 2025 legislation), else `[UNSOURCED]` | `[UNSOURCED]` until sourced |
| State 529 deduction | State plan website via `md_sources`; else "Unknown" | — |
| FAFSA asset rates | Parent-owned 529 ≈ 5.64% max; student assets (UTMA) 20%; retirement accounts excluded | statute |

### Calculation method

1. **Fixed comparison matrix** — fill every cell from this table (cite Pub 970 / IRC section), never re-score:

   | Vehicle | Federal tax on growth | State deduction | Annual limit | FAFSA treatment | Control at 18/21 | Non-college use |
   |---|---|---|---|---|---|---|
   | 529 (parent-owned) | Tax-free if qualified | State-dependent | Gift-exclusion driven; state aggregate cap | Parent asset | Owner keeps | Earnings taxed + 10%; beneficiary change or 529-to-Roth |
   | Coverdell ESA | Tax-free if qualified | None | $2,000 / beneficiary | Parent asset | Owner keeps until 30 | Earnings taxed + 10% |
   | UTMA / UGMA | Kiddie tax | None | Gift exclusion | Student asset (20%) | Child takes control | Any use for the child |
   | Roth IRA (parent) | Tax-free contributions out; earnings rules | None | IRA limit | Not an asset; withdrawals count as income | Parent keeps | Retirement |
   | Taxable brokerage | LTCG / dividends taxed | None | None | Parent asset | Parent keeps | Any |

2. **Coverdell eligibility** — `household_magi_usd` below the phase-out start for `filing_status`; partial inside the band; none above.
3. **Roth eligibility** — `parent_has_earned_income_room = true`.
4. **Superfund flag** — `lump_sum_available_usd ≥ 2 × annual_gift_exclusion_per_donee` → note the 5-year election (Form 709 required).
5. If an input needed by a rule is missing, treat the rule's condition as false and list the missing input.

### Decision rules

Evaluate top to bottom; the first match is the recommended stack.

| # | Condition | Recommended stack |
|---|---|---|
| 1 | `goal = general_gift_to_child` | Taxable brokerage in the parent's name; UTMA only if an irrevocable gift to the child is intended |
| 2 | `emergency_fund_funded = false` or `retirement_on_track = false` | 529 only, at a modest amount; no Roth-for-education; fix emergency fund / retirement first (Budget Coach / Retirement Planner) |
| 3 | `wants_k12_flexibility` and Coverdell-eligible (step 2) | 529 primary + Coverdell secondary ($2,000/yr) |
| 4 | `non_college_flexibility_priority` and Roth-eligible (step 3) | 529 primary + parent Roth IRA as flexible backup |
| 5 | Otherwise | 529 only |

Plan choice within the 529: in-state plan when `state_529_deduction_available`; otherwise the lowest-cost plan nationally — hand off to **529 Plan Review** for the fee/deduction math. UTMA is never the primary college vehicle under these rules.

### Output template

```markdown
# Education Savings Account Selector — {child}, {YYYY-MM-DD}

## Headline
Recommended stack: **{stack}** (Decision rule #{n}).

## Comparison matrix
| Vehicle | Federal tax on growth | State deduction | Annual limit | FAFSA treatment | Control at 18/21 | Non-college use |
|---|---|---|---|---|---|---|

## Eligibility checks
| Check | Result |
|---|---|
| Coverdell MAGI | |
| Roth IRA room | |
| Superfund option | |

## Why this stack
{rule that fired; vehicles eliminated and why}

## Action checklist
- [ ] Open account ({plan / URL})
- [ ] Monthly auto-contribution ${x}
- [ ] Name beneficiary and successor owner
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
