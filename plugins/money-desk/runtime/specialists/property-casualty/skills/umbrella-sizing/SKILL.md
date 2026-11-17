## Umbrella Sizing

description: Recommend the right personal umbrella liability policy size from net worth, future earnings, and liability-exposure scoring. Confirms underlying-liability minimums on auto and home are met for the umbrella to attach. Explains the asymmetry of umbrella ($300-500 premium for $1-5M coverage) and the specific situations that elevate the need (teen driver, pool, dog, rental property, board service, public profile).

## When to use

- Any household with net worth ≥ $250k that doesn't already have umbrella.
- Net worth grew materially since the umbrella was last sized.
- Liability exposure increased (teen driver hit driving age, joined a non-profit board, bought rental property, public-facing job, social-media following).
- Current umbrella is at $1M and the user's wealth or exposure has grown.

## Inputs needed

- Net worth (assets minus liabilities) including retirement accounts.
- Future earnings — annual income × remaining working years (drives "what's at risk").
- Current auto liability limits (split limits per-person/per-accident/property, or combined single limit).
- Current home or renters liability limit.
- Current umbrella if any: limit + premium + carrier.
- Liability-exposure factors (check all that apply):
  - Teen driver in household
  - Pool / hot tub / trampoline at residence
  - Dog (breed; some breeds elevate)
  - Rental property owned (and how many units)
  - Boat / RV / motorcycle / ATV
  - Frequent in-home guests (party hosting, regular visitors)
  - Non-profit board membership (especially uninsured-D&O nonprofits)
  - Public-facing profession (doctor, lawyer, executive)
  - Public profile (social-media following, media exposure)
  - Home-based business or side-hustle interacting with public

## Workflow

### 1. Compute "what's at risk"

Conventional wisdom: insure liability up to net worth. Better rule: insure up to **net worth + protected future earnings**, because lawsuit judgments include garnishment of future income (subject to state law — some states protect more aggressively than others).

- **Baseline recommended limit** = ceil((net worth + annual gross income × min(10, years to retirement)), nearest $500k), with $1M minimum.
- Floor at $1M for any household with net worth ≥ $100k.

### 2. Adjust for exposure score

Each exposure factor adds risk-weight. Typical ranges below; the model uses the low end of each range (Determinism rules step 3):

- Teen driver: +$1-2M (teen-driver collisions are the #1 personal-umbrella claim trigger).
- Pool / trampoline: +$500k-1M.
- Dog (breed-specific): +$500k-1M (some breeds excluded from many policies — check).
- Rental property: +$500k-1M per rental unit (separate landlord liability is on the rental policy; umbrella sits on top).
- Boat / RV: +$500k-1M each, depending on size/HP/usage. Verify umbrella covers watercraft (some exclude over a length / HP threshold).
- Board service (nonprofit, especially uninsured-D&O): +$1-2M.
- Public-facing profession / public profile: +$1-2M.

Sum the adjustments. Round the total up to the next $1M (the common carrier increment).

### 3. Confirm underlying-liability minimums

Umbrella does NOT attach until the underlying policy pays its limit. Most carriers require:
- Auto: 250k/500k/100k split limits or $300k CSL minimum.
- Home: $300k personal liability minimum.
- Some carriers require higher ($500k CSL auto, $500k home) for the umbrella to attach.

Check the umbrella quote's underlying-requirements section. If user's current auto/home don't meet, raise them — usually adds $50-150/year. Without meeting requirements, a claim hits a coverage gap = umbrella refuses to attach = full personal exposure.

### 4. Cost-benefit reality check

- Typical umbrella pricing: $300-500/year for $1M; $400-700 for $2M; $600-900 for $3M; scales sub-linearly.
- For most households, $1M of umbrella costs about as much as 1-2 dinners out per month.
- Asymmetry: an at-fault accident with serious injury can easily exceed $1M judgment. Single-claim downside is bankruptcy-grade; premium is a rounding error.

### 5. Verify policy specifics

- **Worldwide coverage?** Most umbrellas cover anywhere; verify if user travels internationally or owns foreign property.
- **Auto coverage scope** — does the umbrella cover rental cars, non-owned autos, boats, RVs?
- **Personal injury** (vs bodily injury) coverage — covers libel, slander, false arrest, malicious prosecution. Increasingly important for active social-media users and public-facing professionals.
- **Defense costs** — outside the limits (preserves full limit for judgment) or inside (eats into limit)? Outside is preferable.
- **Exclusions** — business activities, intentional acts, watercraft over a threshold, motor vehicles over a HP threshold, criminal acts.

### 6. Carrier check

- Standard carriers (Geico, Progressive, Allstate, State Farm, Travelers, USAA) up to ~$5M typical.
- Above $5M usually requires high-net-worth specialty carrier (Chubb, PURE, AIG Private Client) — different underwriting, often packaged with home + auto.
- Standalone umbrella from RLI: available even when auto/home are split across multiple carriers. Useful when shopping but unwilling to consolidate.

## Output

- Recommended umbrella amount with the math (net worth + 10× income + exposure adjustments).
- Underlying-liability-minimum check; specific raises needed on auto / home if required.
- Carrier-suitability flag (standard vs high-net-worth specialty).
- One-page premium-vs-protection comparison at the recommended limit.
- Sanity disclosure: "This costs roughly $X/year for $YM of protection."

## Citations / sources

- Insurance Information Institute data on average jury verdicts and umbrella claim frequency.
- Carrier underlying-liability requirements (from sample declarations / underwriting guides).
- State asset-protection statutes (key for sizing the "future earnings" component).

## Disclaimer

Analysis only. Umbrella exclusions vary significantly between carriers — read the actual umbrella policy form before relying on coverage. For unusual exposures (private aviation, ocean-going watercraft, large equestrian operation, art collection, public profile), engage a high-net-worth specialty broker.

## Determinism rules

### Input keys

- `net_worth_usd` — number, assets − liabilities, including retirement accounts
- `annual_gross_income_usd` — number, household
- `years_to_retirement` — integer (0 if retired)
- `auto_liability` — `{ bi_per_person_usd, bi_per_accident_usd, pd_usd }` or `{ csl_usd }`
- `home_liability_usd` — number
- `current_umbrella` — `{ limit_usd, annual_premium_usd, carrier }` or null
- `carrier_underlying_requirements` — `{ auto_csl_usd?, auto_split?, home_liability_usd? }` from the umbrella quote (optional)
- `exposures` — `{ teen_drivers (integer), pool_trampoline (bool), dog (bool), rental_units (integer), boats_rvs (integer), nonprofit_board (bool), public_profile_or_profession (bool), home_business (bool), frequent_guests (bool) }`
- `premium_quote_usd` — number, annual premium for the recommended limit (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Net worth, income | **Ask — no default** | — |
| Years of future earnings protected | `min(10, years_to_retirement)` | `[ASSUMPTION]` |
| Exposure adjustments | Fixed table in step 3 (low end of each range in the Workflow) | `[ASSUMPTION]` |
| Underlying minimums | `carrier_underlying_requirements` if supplied; else auto 250/500/100 or $300k CSL, home $300k | `[ASSUMPTION]` |
| Premium | Carrier quote; otherwise "to be quoted" — no estimate | — |
| State wage-garnishment / homestead protections | Not in md_facts — cite state statute via `md_sources`, else `[UNSOURCED]`; does not change the number | — |

### Calculation method

1. `future_earnings = annual_gross_income_usd × min(10, years_to_retirement)`.
2. `baseline = max($1,000,000, ceil((net_worth_usd + future_earnings) / 500,000) × 500,000)`.
3. **Exposure adjustments** (sum all that apply):
   - Teen driver: +$1,000,000 per teen driver
   - Pool / hot tub / trampoline: +$500,000
   - Dog: +$500,000
   - Rental property: +$500,000 per rental unit
   - Boat / RV / motorcycle / ATV: +$500,000 each
   - Nonprofit board: +$1,000,000
   - Public-facing profession or public profile: +$1,000,000 (once, even if both)
   - Frequent guests, home business: +$0 (flag only; home business is usually excluded — needs its own policy)
4. `target_limit = ceil((baseline + adjustments) / 1,000,000) × 1,000,000`.
5. **Underlying check:** auto meets requirement if CSL ≥ required CSL, or each split limit ≥ the required split; home meets if `home_liability_usd` ≥ required. List each shortfall with the limit to raise to.
6. **Carrier tier:** `target_limit > $5,000,000` → high-net-worth specialty carrier; else standard carrier.
7. Report whole dollars. If net worth or income is missing, stop and list the missing inputs.

### Decision rules

Evaluate top to bottom; the first match wins. Underlying shortfalls from step 5 are always listed as required actions alongside the recommendation.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Net worth or income missing | No recommendation — collect inputs |
| 2 | `net_worth_usd < $100,000` and no exposure factor is true | Umbrella optional; if bought, $1M |
| 3 | `current_umbrella.limit_usd ≥ target_limit` | Keep the current umbrella |
| 4 | `target_limit > $5,000,000` | Buy/raise to `target_limit` through a high-net-worth specialty carrier |
| 5 | Otherwise | Buy/raise to `target_limit` with a standard carrier (or a standalone umbrella if auto/home are split across carriers) |

### Output template

```markdown
# Umbrella Sizing — {YYYY-MM-DD}

## Headline
Recommended umbrella: **${target_limit}** (Decision rule #{n}). {premium sentence, or "Premium to be quoted"}

## What's at risk
| Component | Amount |
|---|---|
| Net worth | |
| Future earnings ({years} × income) | |
| Baseline (rounded up to $500k, min $1M) | |

## Exposure adjustments
| Factor | Count / present | Adjustment |
|---|---|---|
| **Total** | | |

## Underlying-liability check
| Policy | Current | Required | Shortfall / action |
|---|---|---|---|
| Auto | | | |
| Home | | | |

## Carrier suitability
{standard vs high-net-worth specialty}

## Policy specifics to verify
- Worldwide coverage · rental / non-owned autos · watercraft limits · personal injury (libel/slander) · defense costs outside limits · exclusions

## Actions
- {raise underlying limits, obtain quotes}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
