# Long-Term Care Planning

description: Plan for long-term care (LTC) — custodial care that Medicare does NOT cover and that hits 50%+ of seniors. Frames the funding strategy across self-insure / traditional LTC insurance / hybrid life+LTC / annuity+LTC / Medicaid planning. Sizes the potential liability against assets.

## When to use

- User is 50–65 — the sweet spot for traditional LTC underwriting (younger = harder to justify; older = harder to qualify and more expensive).
- User has parents needing LTC and is realizing they have no plan themselves.
- User has $500k–$3M net worth — the band most exposed (poorer qualifies for Medicaid, richer self-insures).
- User has a family history suggesting elevated risk (dementia, Parkinson's).

## Inputs needed

- Age, health status (controlled chronic conditions are usually OK; cognitive decline is disqualifying).
- Marital status (couples can stagger care; widowers have higher institutional-care risk).
- Net worth, breakdown (liquid investable vs home equity vs annuities).
- State of residence (LTC costs vary 3–4x; e.g., median nursing-home cost ranges from ~$90k/yr Texas-rural to $200k+/yr NYC/Boston/Bay Area; cite Genworth Cost of Care Survey).
- Income sources in retirement (SS, pension, withdrawals).
- Existing life insurance with riders, annuities.

## Workflow

1. **Size the liability.** Use state-specific Genworth data:
   - Average claim: ~3 years (scenario durations fixed in Determinism rules step 1).
   - Annual cost: home health, assisted living, nursing home — the user's state figures from the Genworth / CareScout survey (cite state + year).
   - Inflation: ~3–5%/yr historical; the model's projection rate is set in Determinism rules → Assumptions.
   - Probability: ~70% of 65-year-olds need some LTC; ~20% need it 5+ years; ~13% need nursing home.
2. **Funding-source decision matrix:**
   - **Self-insure** — viable if liquid investable assets > 5× expected lifetime LTC cost AND the user is comfortable spending principal. Cleanest, no premium.
   - **Traditional LTC insurance** — pure insurance; use-it-or-lose-it; premium can be raised (history of double-digit hikes); best leverage of dollar but commitment risk. Look for: 3–5 year benefit, 90-day elimination, 3–5% compound inflation, partnership program (state Medicaid asset-protection bonus).
   - **Hybrid life + LTC** (asset-based) — single or 10-pay premium; if LTC unused, death benefit pays beneficiaries. Higher upfront, no rate-hike risk. Best for users sitting on idle cash they'll otherwise leave to heirs.
   - **Annuity + LTC** — niche; useful for unhealthy applicants who can't qualify for LTC underwriting.
   - **Medicaid planning** — for users with limited assets; spend-down + look-back rules (5 years federal) require attorney-led strategy. Not a DIY path.
3. **Couples strategy.** Statistically the WIFE outlives the husband and is the one needing extended care — covering her is the higher-leverage decision.
4. **Home equity.** Reverse mortgage (HECM) is a contingent LTC funding source for users staying in home; flag it but don't recommend lightly (fees, complexity).
5. **State partnership program.** In many states, buying a qualified partnership LTC policy lets the user protect $1 of assets from Medicaid spend-down per $1 of policy benefit paid. Big deal.

## Required citations

- LTC cost numbers cite Genworth Cost of Care Survey + year + state.
- Probability stats cite HHS / ACL longterm care.gov data.
- Tax rules (Sec 7702B qualified plans, deductible premiums above 7.5% AGI threshold) cite IRS.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/ltc-planning-<YEAR>.md`:
  - Liability sizing (low / base / high scenario × state cost).
  - Self-insurance test (assets vs liability multiple).
  - Funding-source recommendation with reasoning.
  - If insurance recommended: minimum policy features to require.
  - Couples / wife-coverage prioritization (if applicable).

## Notes

- LTC underwriting is strict — getting quotes EARLIER while healthy is the single highest-leverage move.
- Traditional LTC premiums have HISTORICALLY been raised repeatedly (+30–50% over policy life) — budget at the quoted premium × 1.5 (Determinism rules step 6).
- "Analysis only. Not professional insurance, tax, or legal advice. Recommend a fee-only LTC specialist or elder-law attorney for Medicaid planning."

## Determinism rules

### Input keys

- `age` — integer; `spouse_age` — integer (optional)
- `marital_status` — `single` | `married` | `widowed` | `divorced`
- `persons_to_plan_for` — 1 | 2
- `health` — `excellent` | `good` | `average` | `below_average` | `cognitive_impairment` (per person if 2)
- `state` — two-letter code
- `investable_assets_usd` — number, liquid investable assets (excludes home equity and annuities)
- `home_equity_usd`, `annuity_value_usd` — numbers
- `comfortable_spending_principal` — bool
- `annual_cost_home_health_usd`, `annual_cost_assisted_living_usd`, `annual_cost_nursing_home_usd` — numbers, today's $, from the Genworth / CareScout Cost of Care Survey for `state` (cite year)
- `existing_ltc_benefit_pool_usd` — number, total benefit pool from existing LTC / riders (default 0)
- `traditional_ltc_annual_premium_quote_usd`, `hybrid_single_premium_quote_usd` — numbers (optional)
- `cash_earmarked_for_heirs_usd` — number (default 0)
- `partnership_state` — bool (state runs a qualified LTC Partnership program)
- `care_start_age` — integer (optional; only for the nominal projection)
- `ltc_cost_inflation_pct` — number, % per year (optional; only for the nominal projection)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| State annual costs by care type | **Ask — no default**; look up Genworth / CareScout Cost of Care via `md_sources`; if unreachable, tag `[UNSOURCED]` and stop sizing | — |
| Claim duration by scenario | Fixed convention: Low 1 yr, Base 3 yr (the ~3-year average claim cited from longtermcare.gov / ACL), High 5 yr | `[ASSUMPTION]` |
| LTC cost inflation (nominal projection only) | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_inflation_percent` (stored as a fraction); state that LTC costs have historically risen faster | `[ASSUMPTION]` |
| Care start age (nominal projection only) | **Ask — no default**; without it, report today's dollars only | — |
| Income offset during care | None — retirement income is assumed to keep covering ordinary living costs | `[ASSUMPTION]` |
| Traditional LTC premium increases | Budget at quoted premium × 1.5 (top of the +30–50% historical range) | `[ASSUMPTION]` |
| Medicaid asset / income limits and look-back | State-specific — not in md_facts; look up via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` until sourced |
| §7702B age-based deductible-premium limits | not in md_facts — look up the current IRS figure via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` until sourced |

### Calculation method

1. **Scenario liability per person (today's $):**
   - Low = `annual_cost_home_health_usd` × 1
   - Base = `annual_cost_assisted_living_usd` × 3
   - High = `annual_cost_nursing_home_usd` × 5
2. **Household liability** = per-person scenario × `persons_to_plan_for`.
3. **Net liability** = `max(0, household liability − existing_ltc_benefit_pool_usd)` for each scenario.
4. **Self-insurance multiple** = `investable_assets_usd / Base net liability`, rounded to 1 decimal (if Base net liability = 0, report "fully covered").
5. **Nominal projection (only if `care_start_age` given):** factor = `(1 + inflation)^(care_start_age − age)`; nominal liability = today's liability × factor. Otherwise print "Today's dollars only — care start age not supplied".
6. **Premium stress test (if quote given):** budgeted traditional premium = quote × 1.5; total premiums to age 85 = budgeted premium × max(0, 85 − age).
7. **Hybrid leverage (if quote given):** leverage = (benefit pool on the quote) ÷ `hybrid_single_premium_quote_usd`, 2 decimals; requires the quote's benefit pool, else "Not computed".
8. Compute in cents; report whole dollars. If no state cost data is available, stop after listing the missing data — never size from memory.

### Decision rules

Evaluate top to bottom; the first match is the funding recommendation (per person when health differs).

| # | Condition | Recommendation |
|---|---|---|
| 1 | State cost data missing | No recommendation — collect cost data |
| 2 | `health = cognitive_impairment` and `investable_assets_usd < Base net liability` | Medicaid planning with an elder-law attorney |
| 3 | `health = cognitive_impairment` | Self-insure (insurance is not available); plan the asset drawdown |
| 4 | Self-insurance multiple ≥ 5.0 and `comfortable_spending_principal` | Self-insure |
| 5 | `investable_assets_usd < Base net liability` (multiple < 1.0) | Medicaid planning with an elder-law attorney; a Partnership policy if `partnership_state` and premium is affordable |
| 6 | `health = below_average` | Annuity + LTC (simplified underwriting) — get quotes |
| 7 | `cash_earmarked_for_heirs_usd ≥ hybrid_single_premium_quote_usd` (quote supplied) | Hybrid life + LTC |
| 8 | Otherwise | Traditional LTC insurance (Partnership-qualified if `partnership_state`); minimum features: 3–5 yr benefit, 90-day elimination, 3–5% compound inflation |

Couples: when `persons_to_plan_for = 2` and the budget covers only one policy, insure the younger / female spouse first (longer expected care need).

### Output template

```markdown
# Long-Term Care Plan — {state}, {year}

## Headline
Recommended funding: **{option}** (Decision rule #{n}). Base-case net liability **${base_net}**; self-insurance multiple **{multiple}×**.

## Liability sizing (today's $)
| Scenario | Care type | Annual cost | Years | Per person | Household | Net of existing coverage |
|---|---|---|---|---|---|---|
| Low | Home health | | 1 | | | |
| Base | Assisted living | | 3 | | | |
| High | Nursing home | | 5 | | | |

## Nominal projection
{factor and inflated liability, or "Not applicable — care start age not supplied"}

## Self-insurance test
{investable assets ÷ Base net liability = multiple; threshold 5.0×}

## Funding options compared
| Option | Upfront / annual cost | Rate-hike risk | Unused-benefit value | Fit |
|---|---|---|---|---|

## Minimum policy features
{list, or "Not applicable — self-insure / Medicaid path"}

## Couples strategy
{who to insure first, or "Not applicable — single"}

## Actions
- {quotes to obtain while healthy, Partnership check, elder-law referral}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).