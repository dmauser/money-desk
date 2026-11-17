# Social Security Review

description: Project Social Security benefits at 62 / 67 (FRA) / 70 claim ages, model spousal & survivor strategies, and estimate breakeven ages. Helps the user choose a claiming age. Use as the user approaches 60 or runs retirement projections.

## When to use

- User is within ~5–10 years of eligibility.
- Couple is coordinating two earner records.
- A surviving spouse is deciding when to claim.
- Recheck if Congress changes SS rules (rare but possible).

## Inputs needed

- Most recent SSA statement (ssa.gov → "My Social Security") — provides PIA estimate.
- Birth date(s).
- Filing status now and projected.
- Other retirement income (drives the SS taxability calculation).
- Health & longevity expectations.
- Spouse's record if married (their PIA, age).

## Workflow

1. **Identify FRA** (Full Retirement Age) — 66y to 67y depending on birth year.
2. **Compute the three benefit levels:**
   - Age 62: 70–75% of PIA depending on FRA (permanent reduction; statutory formula in Determinism rules step 1).
   - FRA: 100%.
   - Age 70: 124–132% of PIA (delayed retirement credits, 8%/yr after FRA).
3. **Breakeven analysis.** Cumulative benefits at age 62 vs FRA vs 70:
   - 62 vs FRA breakeven: typically late 70s.
   - FRA vs 70 breakeven: typically early-to-mid 80s.
   - User living past breakeven → delaying wins. Compute the exact breakeven to the month (Determinism rules step 4).
4. **Spousal & survivor.**
   - Spousal benefit: up to 50% of higher earner's PIA at FRA.
   - Survivor benefit: 100% of deceased's actual benefit (so delaying boosts survivor benefit).
   - General couple rule: higher earner delays to 70, lower earner claims earlier — maximizes survivor.
5. **Taxability of SS.** Up to 85% of SS is taxable above provisional-income thresholds. Coordinate with Withdrawal Strategy to avoid pushing SS into the 85%-taxable zone unnecessarily.
6. **Working while collecting.** Pre-FRA earnings test reduces benefits above an annual limit (`md_facts` → `social_security_2026.earnings_test_limit_under_fra` / `earnings_test_limit_year_of_fra`) (withheld amounts are restored at FRA via recalc). If user plans to keep working, claiming early may not give them as much as they think.
7. **Recommendation.** A specific claiming age per person with rationale tied to longevity expectation, marital status, and other income.

## Required citations

- PIA estimate cites the SSA statement date.
- Breakeven math cites the assumed COLA and longevity.
- Spousal / survivor rules cite SSA POMS / publications.

## Deliverable shape

- Markdown report `./money-desk/retirement-planner/social-security-review-<YYYYMMDD>.md`:
  - **Claim-age table** — 62 / FRA / 70 with monthly + cumulative benefit at age 85 / 90 / 95.
  - **Couple coordination** — recommended ages for higher and lower earner.
  - **Tax interaction note** — how the claim age interacts with provisional income and bracket.
  - **Recommended claim age** with explicit rationale.

## Notes

- Don't claim early just because "you might die" — most retirees outlive 62-vs-FRA breakeven, especially women.
- "File and Suspend" and "Restricted Application" strategies were largely eliminated by the 2015 BBA. Only those born before 1/2/1954 may still use restricted application — rare today.
- COLA is applied to the PIA from age 62 forward regardless of when you claim — delaying does not "miss" COLAs.
- "Not professional advice. SSA.gov is the authoritative source."

## Determinism rules

### Input keys

Names match the `md_rp_skill_social_security_review` intake schema; extra keys follow.

- `current_age` — integer
- `pia_estimate` — number, $ per month at FRA (from the ssa.gov statement)
- `fra` — `"66"` | `"66 + 2 mo"` | … | `"67"` (convert to months: `fra_months = 66 × 12 + extra`)
- `marital_status` — `Single` | `Married` | `Divorced (10+ year marriage)` | `Widowed`
- `spouse_pia` — number, $ per month at the spouse's FRA (0 if none)
- `still_working` — boolean
- `longevity_outlook` — `Below average` | `Average` | `Above average` | `Family history of long life`
- `birth_date` — `YYYY-MM-DD`
- `spouse_birth_date` — `YYYY-MM-DD` or null
- `spouse_fra` — same format as `fra`
- `expected_earnings_annual_usd` — number, wages / SE income in the years before FRA while claiming
- `statement_date` — `YYYY-MM-DD` of the SSA statement

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| PIA, FRA, marital status, longevity outlook | **Ask — no default** | — |
| Early-claim reduction | Statutory: 5/9 of 1% per month for the first 36 months before FRA, 5/12 of 1% per additional month (20 CFR 404.410) | — |
| Delayed retirement credits | Statutory: 2/3 of 1% per month after FRA to age 70 (born 1943+) | — |
| Spousal benefit | Statutory: up to 50% of the other spouse's PIA; early reduction 25/36 of 1% per month for the first 36 months, 5/12 of 1% beyond; no delayed credits | — |
| FRA for born 1960+ | `md_facts` → `social_security_2026.full_retirement_age_born_1960_or_later` | `[SSA 2026]` |
| Earnings-test limits | `md_facts` → `social_security_2026.earnings_test_limit_under_fra`, `.earnings_test_limit_year_of_fra` | `[SSA 2026]` |
| COLA | Benefits modelled in real (today's) dollars — COLA applies equally to every claim age, so it does not change the comparison; current COLA from `md_facts` → `social_security_2026.cola_for_year` is cited only | `[SSA 2026]` |
| Longevity age used for comparison | Below average → 80; Average → 85; Above average → 90; Family history of long life → 95 | `[ASSUMPTION]` |
| Discount rate for breakeven | 0% real (undiscounted cumulative benefits) | `[ASSUMPTION]` |
| SS taxability thresholds | IRC §86 / IRS Pub 915 (statutory, not indexed) | — |

### Calculation method

1. **Benefit factor** for claim at age-in-months `c`: `m = fra_months − c`. If `m > 0`: `factor = 1 − (min(m, 36) × 5/9 + max(0, m − 36) × 5/12) / 100`. If `m < 0`: `factor = 1 + (−m) × (2/3) / 100`, with `c` capped at 70 × 12. `benefit = round(pia × factor, 2)` per month, real dollars.
2. **Claim ages evaluated:** 62 (62 × 12 months), FRA, 70. Optionally every whole age 62–70 in an appendix.
3. **Cumulative benefits** to age `L` = `benefit × (L × 12 − c)` (0 if `L × 12 ≤ c`), for `L` = 85, 90, 95 and the longevity age.
4. **Breakeven** between claim ages `c₁ < c₂`: the first month at which cumulative(`c₂`) ≥ cumulative(`c₁`); report as age in years and months.
5. **Spousal (lower earner):** `spousal_excess = max(0, 0.5 × higher_pia − own_pia)`, reduced by the spousal early-reduction formula if claimed before the lower earner's FRA. Total = own benefit + spousal excess (spousal available only once the higher earner has filed; divorced: marriage ≥ 10 years and not remarried).
6. **Survivor:** survivor at their own FRA receives `max(own benefit, deceased's actual monthly benefit)`; if the deceased claimed early, floor at 82.5% of the deceased's PIA. Show the survivor amount for each of the higher earner's claim ages.
7. **Earnings test** (claim before FRA and `still_working`): withheld `= (earnings − under_fra_limit) / 2` per year before the FRA year; `(earnings − year_of_fra_limit) / 3` in the FRA year (months before FRA). Floor 0, cap at the annual benefit.
8. **Taxation note:** state whether `provisional income = other AGI + tax-exempt interest + 50% of SS` exceeds the IRC §86 base amounts (qualitative; detailed math belongs to Withdrawal Strategy).
9. Rounding: cents internally; whole dollars monthly and cumulative; breakeven to the month.

### Decision rules

Claim-age recommendation per person — evaluate top to bottom; the first match wins. "Best" = the claim age (62, FRA, 70) with the highest cumulative benefit through the comparison age; tie → the later age.

| # | Condition | Recommended claim age |
|---|---|---|
| 1 | `still_working` and earnings-test withholding ≥ 50% of the pre-FRA annual benefit | Not before FRA; then best of FRA / 70 through the longevity age |
| 2 | Married / Widowed / Divorced (10+) and this person has the higher PIA | Best through the **longer** of the two spouses' longevity ages (survivor horizon) |
| 3 | Married and this person has the lower PIA, and `spousal_excess > 0` | FRA (spousal benefit is not increased by delay) unless own-benefit best through own longevity age is 70 |
| 4 | Widowed | Claim survivor and own benefit in the order that gives the higher cumulative total through the longevity age (switch strategy) |
| 5 | Otherwise | Best through own longevity age |

### Output template

```markdown
# Social Security Review — {as_of_date}

## Headline
Recommended claim age: **{age}** ({person}){; spouse **{age}**}. Rule #{n}: {one-line reason}.

## Inputs
| Input | Value | Source |
|---|---|---|

## Claim-age table ({person})
| Claim age | Monthly benefit (today's $) | % of PIA | Cumulative to 85 | Cumulative to 90 | Cumulative to 95 |
|---|---|---|---|---|---|

## Breakeven ages
| Comparison | Breakeven (age y m) |
|---|---|
| 62 vs FRA | |
| FRA vs 70 | |
| 62 vs 70 | |

## Couple coordination
{higher / lower earner ages, spousal and survivor amounts — or "Not applicable — single"}

## Earnings test
{withholding estimate — or "Not applicable — not working or claiming at/after FRA"}

## Tax interaction note
{provisional-income position}

## Rationale
{decision rule # and the numbers}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).