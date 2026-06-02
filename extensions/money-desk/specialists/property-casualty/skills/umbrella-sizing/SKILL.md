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

- **Baseline recommended limit** = ceil((net worth + 10 × annual gross income), nearest $500k), with $1M minimum.
- Floor at $1M for any household with net worth ≥ $100k.

### 2. Adjust for exposure score

Each exposure factor adds risk-weight. Heuristic adjustment:

- Teen driver: +$1-2M (teen-driver collisions are the #1 personal-umbrella claim trigger).
- Pool / trampoline: +$500k-1M.
- Dog (breed-specific): +$500k-1M (some breeds excluded from many policies — check).
- Rental property: +$500k-1M per rental unit (separate landlord liability is on the rental policy; umbrella sits on top).
- Boat / RV: +$500k-1M each, depending on size/HP/usage. Verify umbrella covers watercraft (some exclude over a length / HP threshold).
- Board service (nonprofit, especially uninsured-D&O): +$1-2M.
- Public-facing profession / public profile: +$1-2M.

Sum the adjustments. Round up to the nearest carrier-offered increment (typically $500k or $1M steps).

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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).