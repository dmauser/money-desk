## Geographic Arbitrage Planner

description: Map the cost-of-living arbitrage opportunity for a FIRE'd household — domestic (no-state-income-tax states, low-COL metros) and international (Portugal D7 / Spain NLV / Mexico Temporary / Thailand LTR / Malaysia MM2H / etc.). Output: COL-adjusted spend impact, residency/visa overview, tax-residency implications, healthcare implications, banking + currency exposure, and the explicit handoff to International / Expat for the actual filing mechanics. STRATEGY only — do NOT execute international moves from a chat. Tax-residency and FBAR are CPA / immigration-attorney work.

## When to use

- "Should I move somewhere cheaper for FIRE?"
- "Can I retire to Portugal / Mexico / Thailand?"
- "What's the cheapest US state for FIRE?"
- "How does geographic arbitrage actually work tax-wise?"

## Inputs needed

This skill is exploratory — partial answers are fine and the rest can be gathered as you go.

- **current_location** — where the user lives today (city, state, country).
- **candidate_destinations** — one or more places the user is considering.
- **household_status** — single / couple / family with kids (ages helpful).
- **us_person_status** — US citizen / green-card holder / non-US (drives tax citizenship rules).
- **annual_spend_today** — approximate household annual spend in current location.
- **work_status** — employed / self-employed / retired / FIRE / studying.
- **healthcare_situation** — current coverage and what would change after the move.
- **reversibility_preference** — willing to commit long-term, or want to pilot first?

## Workflow

1. **Surface the cost lever honestly.** Geographic arbitrage CAN materially extend a FIRE plan — a household spending $80k/yr in California can often live the same lifestyle for $40–55k in a low-COL US state or $25–45k in many international destinations. That's a 30–70% reduction in the FIRE number.
2. **Distinguish DOMESTIC vs INTERNATIONAL arbitrage** — the mechanics, risks, and reversibility are very different.
3. **Domestic arbitrage runbook:**
   - **State tax dimension:** 9 no-state-income-tax states (AK, FL, NV, NH, SD, TN, TX, WA, WY). NH and WA tax interest/dividends or capital gains differently — verify. CA, NJ, NY, OR, MN are high-tax retirement destinations.
   - **Property tax dimension:** TX/NJ have high property tax even without income tax. FL, NV more friendly.
   - **Healthcare dimension:** ACA subsidies and Marketplace plan availability vary by state. Some states (NY, MA, MN, CA, WA) have richer state-level subsidies; some (FL, TX, GA) didn't expand Medicaid → coverage cliffs.
   - **Property cost dimension:** mortgage / rent / property tax / insurance combined.
   - **Lifestyle dimension:** weather, family proximity, walkability, healthcare access, kid schooling.
4. **International arbitrage runbook:**
   - **Visa pathways (popular FIRE destinations — verify current law):**
     - **Portugal D7** (passive-income visa) — historically welcoming; NHR tax regime was scaled back in 2024 — verify current status.
     - **Spain Non-Lucrative Visa (NLV)** — passive-income visa; no work permitted.
     - **Mexico Temporary Resident Visa** — income/savings thresholds; renewable to permanent.
     - **Thailand LTR (Long-Term Resident) visa** — 10-year visa for high-net-worth or retiree categories.
     - **Malaysia MM2H** — relaunched with higher thresholds in 2024.
     - **Panama Pensionado** — pension-based.
     - **Costa Rica Pensionado / Rentista** — pension or rental income.
   - **Tax-residency:** most countries trigger tax residency at 183 days. US citizens / green-card holders are ALWAYS US-tax resident (citizenship-based taxation — one of two countries globally, the other is Eritrea). FEIE vs FTC analysis is a CPA problem.
   - **FBAR / FATCA:** US-person foreign account aggregate above `md_facts` → `expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd` triggers FBAR. Form 8938 (FATCA) thresholds by filing status and residence: `md_facts` → `expat_quick_reference_2026.fatca_form_8938_threshold_*` (higher thresholds once living abroad). Penalties are brutal — non-willful per-violation and willful penalties are inflation-adjusted annually (cite via `md_sources`), plus criminal exposure.
   - **PFIC trap:** US persons MUST NOT buy non-US-domiciled mutual funds / ETFs. Buy US-domiciled funds only, hold in US-domiciled brokerage (Schwab International, IBKR).
   - **Healthcare:** in many destinations, private health insurance is $1–4k/yr per person, OR national health systems are accessible to residents. Compare to US ACA cost.
   - **Currency exposure:** monthly expenses in destination currency, portfolio in USD — major FX risk if dollar weakens. Hedge consideration.
5. **Reversibility check.** Domestic moves are reversible at low cost. International moves can be harder — selling US home with §121 exclusion + replacing it later, kids' schooling continuity, social network rebuild. Surface honestly.
6. **Lifestyle compatibility check.** Lots of FIRE'd households move abroad and return within 2 years. Language, culture, family proximity, healthcare quality, climate. Don't price the move purely on COL.
7. **Surface the §877A risk** for households that might end up renouncing citizenship long-term — covered-expatriate exit tax. International / Expat handles this.
8. **Hand off filing mechanics.** Every international destination decision ends with **International / Expat** + CPA referral.

## Output template

The canonical report skeleton is the `### Output template` under **Determinism rules** below — use it exactly.

## Common mistakes to flag

- **Pricing on COL index alone.** The all-in cost includes healthcare, taxes, FX hedging cost, kids' international-school tuition (often $15–30k/yr at the top end), and the cost of re-anchoring socially. Price the all-in cost line by line (Determinism rules step 2) — a headline COL index understates it.
- **Forgetting US tax residency for US citizens.** No matter where you live, you file. FEIE / FTC ≠ "no US tax."
- **Buying non-US-domiciled funds abroad.** PFIC trap. Penalty: punitive tax + multi-year reporting nightmare.
- **Treating international visa policy as permanent.** Portugal NHR scaled back 2024; Malaysia MM2H reset thresholds; rules change. Verify at decision time.
- **Renouncing citizenship without §877A modeling.** Covered-expatriate exit tax can be huge.
- **Single-spouse decision.** International moves are 100% household decisions; if both adults aren't aligned, the move fails.

## Citations / sources

- **IRC §877A** — covered-expatriate exit tax.
- **IRC §911** — FEIE.
- **IRC §901** — FTC.
- **IRC §1297** — PFIC.
- **31 USC §5314 / 31 CFR Chapter X** — FBAR.
- **IRC §6038D / Form 8938** — FATCA reporting.
- Cite visa programs as "current as of {year}, verify with destination embassy / immigration attorney before relying."
- US state tax structures — cite state DOR or `[UNSOURCED]` with verify pointer.

## Disclaimer

International tax / immigration is the highest-stakes Money Desk domain. The FBAR penalty regime alone (inflation-adjusted civil penalties, up to 50% of the account for willful violations, plus criminal exposure) makes this CPA-with-expat-experience + immigration-attorney territory. NEVER execute an international move from a chat transcript. A 90-day trial in the destination BEFORE committing is the single best money you'll spend on the plan.

## Next step

**Next step → International / Expat:** "Run **Expat Tax Overview** for US person moving to {destination}, current US spend ${X}/yr, expected destination spend ${Y}/yr, asset structure {taxable $A / Trad $B / Roth $C}, source-of-income {portfolio / passive / consulting}."

## Determinism rules

### Input keys

- `current_location` — string (city, state, country)
- `candidate_destinations` — list of `{ name, type (domestic|international), col_index?, spend_estimate_annual_usd?, healthcare_annual_usd?, state_income_tax_annual_usd?, property_tax_annual_usd?, visa_path? }`
- `current_col_index` — number, same index as the candidates
- `household_status` — `single` | `couple` | `family`; `kids_ages` — list of integers
- `us_person_status` — `us_citizen` | `green_card` | `non_us`
- `annual_spend_today` — number, $ per year in the current location
- `current_healthcare_annual_usd`, `current_state_income_tax_annual_usd`, `current_property_tax_annual_usd` — numbers
- `work_status` — `employed` | `self_employed` | `retired` | `fire` | `studying`
- `healthcare_situation` — free text
- `reversibility_preference` — `commit` | `pilot_first`
- `withdrawal_rate_pct` — number
- `foreign_account_aggregate_usd` — number, expected max aggregate balance in foreign accounts
- `filing_status` — `single` | `mfj`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Current spend, candidates | **Ask — no default** (partial answers allowed; uncomputed rows say so) | — |
| COL index values | One named index for all locations via `md_sources`; else `[UNSOURCED]` and the row is not computed | `[UNSOURCED]` |
| Destination healthcare, state income tax, property tax | Quotes / state DOR / county assessor via `md_sources`; else **Ask** | `[UNSOURCED]` |
| Visa income / savings thresholds | Destination embassy / immigration authority via `md_sources` — current as of the lookup date | `[UNSOURCED]` |
| FBAR threshold | `md_facts` → `expat_quick_reference_2026.fbar_filing_threshold_aggregate_usd` | `[IRS / FinCEN Expat 2026]` |
| FATCA (Form 8938) thresholds | `md_facts` → `expat_quick_reference_2026.fatca_form_8938_threshold_{single,mfj}_{resident_us,abroad}_end_of_year` | `[IRS / FinCEN Expat 2026]` |
| FEIE maximum | `md_facts` → `expat_quick_reference_2026.feie_max_per_qualifying_individual` | `[IRS / FinCEN Expat 2026]` |
| FBAR / FATCA penalty amounts | Inflation-adjusted annually — not in md_facts; cite via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| Withdrawal rate | `md_facts` → `behavioral_assumptions_safe_defaults.safe_withdrawal_rate_30yr_horizon_percent` (× 100) | `[ASSUMPTION]` |

### Calculation method

Real (today's) dollars; annual figures.

1. **Core spend at destination:** `spend_estimate_annual_usd` if given; else `(annual_spend_today − current healthcare − current state income tax − current property tax) × col_index / current_col_index`.
2. **All-in annual cost:** `core + healthcare + state income tax + property tax`. For international candidates, keep the current US state income tax unless the user confirms state domicile will end (verify with the state DOR). Missing component → row "incomplete" and excluded from ranking.
3. **Current all-in:** `annual_spend_today` (it already includes current healthcare and taxes).
4. **Net annual impact:** `impact = all_in_destination − all_in_current` (negative = saving). `impact_pct = impact / annual_spend_today × 100`.
5. **FIRE-number change:** `impact / (WR / 100)`.
6. **Compliance flags (US persons, international):** FBAR required if `foreign_account_aggregate_usd >` the md_facts threshold; Form 8938 required if above the md_facts threshold for filing status and residence (abroad thresholds apply after the move).
7. **Ranking:** by `impact` ascending (biggest saving first) → tie: domestic before international → name A–Z.
8. Rounding: whole dollars; percents to one decimal.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `us_person_status = non_us` | Out of scope for US-person mechanics — route to **International / Expat** |
| 2 | No candidate has a complete all-in row | No ranking — list the missing data per candidate |
| 3 | Best candidate saving < 10% of `annual_spend_today` | Arbitrage too small to justify a move on money alone; lifestyle reasons only |
| 4 | Best candidate is international | Present it, require a 90-day trial and **Expat Tax Overview** in International / Expat + an expat-experienced CPA before any commitment |
| 5 | `reversibility_preference = pilot_first` | Best domestic candidate — pilot (3-month rental) before selling or buying |
| 6 | Otherwise | Best domestic candidate; route to the state-move / goal-planning hand-off |

### Output template

```markdown
# Geographic arbitrage analysis

## Headline
Best candidate: **{destination}** — **${saving}/yr** ({impact_pct}%), FIRE number −${fire_change} at {WR}%. Recommendation: **rule #{k}**.

## Your inputs
| Input | Value | Tag |
|---|---|---|

## Domestic candidates
| Destination | COL-adj core spend | State income tax | Property tax | Healthcare | All-in | Net annual impact | FIRE-number change |
|---|---|---|---|---|---|---|---|
{or "Not applicable — no domestic candidates"}

## International candidates
| Destination | Visa path (threshold, source) | COL-adj core spend | Healthcare | All-in | Net annual impact | US tax residency | Big-rock risks |
|---|---|---|---|---|---|---|---|
{or "Not applicable — no international candidates"}

## US-person compliance (international only)
| Item | Threshold (md_facts) | Applies to you? |
|---|---|---|
| FBAR | | |
| Form 8938 (FATCA) | | |
| PFIC | US-domiciled funds only | |
{or "Not applicable — domestic only"}

## Reversibility
{domestic vs international}

## Lifestyle compatibility check
{paragraph; 90-day trial}

## Recommended next step
{hand-off}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
