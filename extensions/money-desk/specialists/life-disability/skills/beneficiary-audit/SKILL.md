## Beneficiary Audit

description: Audit beneficiary designations across every account that has one — 401(k) / 403(b) / IRA / Roth IRA / HSA / pension / life insurance / annuities / TOD-brokerage / POD-bank / transfer-on-death-deed / 529 successor. Flags stale designations (ex-spouse, deceased parent, plain "estate"), missing contingents, ERISA spousal-consent issues, and the dangerous "named the minor child directly" mistake. Beneficiary designations override the will; this is the cheapest mistake to fix and the most common to find.

## When to use

- After ANY life event: marriage, divorce, birth, adoption, death of a parent / spouse / sibling, large inheritance, big lawsuit, move to a community-property state.
- Annual review baseline.
- "I haven't checked my beneficiaries in years."
- After a job change (new 401(k) starts with no beneficiary by default; old 401(k) often forgotten).
- After consolidating accounts (transfer-in often does NOT carry over the beneficiary from the originating account).
- After opening any TOD / POD / brokerage account.

## Inputs needed

- Inventory of EVERY account with a beneficiary, including:
  - 401(k) / 403(b) / 457(b) / TSP — current and old employer-based.
  - Traditional IRA / Roth IRA / SEP / SIMPLE / Solo 401(k).
  - HSA.
  - Pension plan (if any).
  - Life insurance policies (group through employer + individual term + permanent).
  - Annuities.
  - Brokerage with TOD designation.
  - Bank accounts (checking, savings) with POD designation.
  - Real estate with TOD-deed (in states that allow it).
  - 529 plans (successor owner — different from beneficiary-student).
- Current beneficiary form snapshots for each (the actual form on file at the custodian, NOT the user's recollection).
- Marital status (current + history if applicable).
- Children's ages.
- State of residence (community-property states have special rules).
- Existence and date of will; existence of trust(s) and their funding status.

## Workflow

### 1. Build the account inventory

This is often the longest step — many people have 5-15 accounts with beneficiaries and have not assembled the full list.

### 2. For each account, capture: primary beneficiary(ies), contingent beneficiary(ies), date last updated, allocation %.

If the user can't easily find the current beneficiary on file — that itself is the finding. Force a custodian call / portal login for each account, document the actual on-file designation.

### 3. Flag the common findings

#### Stale designations
- **Ex-spouse still named** — far more common than people expect. Many states have automatic-revocation-on-divorce statutes (Uniform Probate Code §2-804), but ERISA-governed 401(k) plans are NOT subject to state revocation law — ex-spouse stays the beneficiary unless changed (Egelhoff v. Egelhoff, US Supreme Court 2001). Federal preemption.
- **Deceased parent / sibling / friend** still named as primary or contingent. If primary deceased and no contingent → account flows per the plan default (usually estate, which means probate).
- **Old address / Last name / partial info** suggesting the form is so old the custodian's processing may struggle.

#### Missing contingents
- Primary-only designation: if primary predeceases the account owner, asset goes per default rule (often "estate" → probate).
- ALWAYS name contingent(s); ideally a "per stirpes" designation so a deceased contingent's share passes to their descendants, not back to the pool.

#### Generic "estate" or "my estate" named as beneficiary
- Forces the asset into probate (the very thing the beneficiary designation exists to avoid).
- For retirement accounts, "estate" as beneficiary is particularly bad — destroys the inherited-IRA stretch (SECURE Act 2.0: 5-year payout instead of 10-year for non-designated beneficiaries) and ends Roth tax-free compounding sooner.

#### ERISA spousal-consent violation
- 401(k) / 403(b) / qualified plans: a married participant naming anyone other than spouse as primary beneficiary requires **notarized spousal consent on the plan's specific form**. Missing → designation is VOID, spouse takes regardless.
- IRA accounts are NOT subject to this rule (spousal consent not required, with limited state exceptions in community-property states).

#### Minor children named directly
- Custodian cannot pay a minor; courts appoint a guardian-of-the-estate at significant cost and delay.
- Solution: name a testamentary or revocable-living trust as beneficiary (not the minor directly). Estate attorney drafts the trust language; account beneficiary form names the trust.

#### Trust as beneficiary, but with wrong setup
- For retirement accounts naming a trust as beneficiary: trust must be "see-through" / "look-through" (specific drafting requirements under IRC §401(a)(9)) to qualify for any stretch / SECURE-Act 10-year rule beneficial treatment. If not, default to 5-year rule.
- Many trusts drafted before SECURE Act (2020) had stretch-IRA language that no longer works the same way. Re-review with estate attorney.

#### Community-property state issues
- In community-property states (AZ, CA, ID, LA, NV, NM, TX, WA, WI), retirement contributions made during marriage may be community property. Naming a non-spouse as beneficiary can be challenged by the spouse.

#### HSA-specific
- Spouse beneficiary: HSA continues as HSA in spouse's name (favorable).
- Non-spouse beneficiary: HSA ceases to be HSA; entire balance becomes taxable income in beneficiary's hands (unfavorable, unless small).
- Recommendation: spouse primary; charity or trust contingent (charity gets tax-free since charity is tax-exempt).

#### 529 successor owner
- Different from beneficiary (which is the student).
- If the account OWNER dies without naming a successor, account goes through probate even though it has a named beneficiary.
- Common miss — most 529 accounts never have a successor named.

### 4. Produce the to-do list

For each finding, the action is one of:
- **Update** primary or contingent designation.
- **Add** contingent designation (if missing).
- **Re-draft** trust language with estate attorney before the account designates the trust.
- **Coordinate** with overall estate plan — beneficiary designations vs will / trust must be consistent or the conflict creates litigation.

### 5. Document the new state

After updates, request and retain a written confirmation from each custodian. Email screenshots of updated portal designations.

## Output

- Tabular account-by-account beneficiary inventory (current state).
- Findings table with severity (Critical / High / Medium) per account.
- Action list with owner and priority.
- Post-update confirmation checklist.

## Citations / sources

- Egelhoff v. Egelhoff Ex Rel. Breiner, 532 U.S. 141 (2001) — ERISA preemption of state divorce-revocation.
- Kennedy v. Plan Administrator for DuPont Savings, 555 U.S. 285 (2009) — plan document controls.
- IRC §401(a)(9) and Treas. Reg. §1.401(a)(9)-5 — see-through trust requirements.
- SECURE Act 2.0 — inherited-IRA distribution rules.
- Uniform Probate Code §2-804 — revocation on divorce (non-ERISA accounts).

## Disclaimer

Analysis only. Does not change beneficiaries — that requires the user to file the form with the custodian. Trust-as-beneficiary drafting MUST go to an estate attorney; getting the see-through language wrong can convert a 10-year inherited-IRA stretch into a 5-year forced distribution at higher tax cost.

## Determinism rules

### Input keys

- `accounts` — list of `{ name, type (401k | 403b | 457b | tsp | ira | roth_ira | sep | simple | solo_401k | hsa | pension | life_group | life_individual | annuity | tod_brokerage | pod_bank | tod_deed | 529), erisa (bool), primary: [{ name, relationship, share_pct, living (bool), is_minor (bool) }], contingent: [same], per_stirpes (bool), last_updated_yyyy_mm, verified_from_custodian (bool), successor_owner? (529 only) }`
- `marital_status` — `single` | `married` | `divorced` | `widowed`
- `spouse_name`, `former_spouse_names` — strings
- `spousal_consent_on_file` — map `{ account name: bool }`
- `children_ages` — list of integers
- `state` — two-letter code
- `last_life_event_yyyy_mm` — string (marriage, divorce, birth, adoption, death, inheritance)
- `will_date_yyyy`, `trusts` — list of `{ name, drafted_yyyy, see_through_reviewed (bool) }`

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| On-file designations | **Ask — no default**; must come from the custodian form / portal, not memory. Unverified accounts are a finding, not a guess | — |
| Community-property states | AZ, CA, ID, LA, NV, NM, TX, WA, WI (fixed list) | statute |
| Minor | Beneficiary age < 18 (age of majority varies by state; `[UNSOURCED]` for 19/21 states unless sourced) | `[ASSUMPTION]` |
| Stale-review threshold | `last_updated_yyyy_mm` more than 5 years before the review date | `[ASSUMPTION]` |

None of the checks needs a dollar figure from `md_facts`.

### Calculation method

Run these checks per account, in this order; each failing check produces one finding with the fixed severity shown.

1. **Unverified** — `verified_from_custodian = false` → High ("confirm the on-file designation").
2. **Ex-spouse named** — any primary/contingent name in `former_spouse_names` → Critical (ERISA plans: state revocation statutes do not apply — Egelhoff).
3. **ERISA spousal consent** — `erisa` and `married` and the spouse is not 100% primary and `spousal_consent_on_file[account] ≠ true` → Critical.
4. **No living primary** — every primary has `living = false` → Critical if no living contingent, else High.
5. **Deceased person named** (any position) → High.
6. **Estate named** — "estate" as primary: retirement account (`401k`…`solo_401k`) → High; other types → Medium.
7. **Minor named directly** — any beneficiary with `is_minor = true` → High (name a trust / UTMA custodian instead).
8. **Shares don't sum** — primary `share_pct` total ≠ 100, or contingent total ≠ 100 when contingents exist → High.
9. **Missing contingent** — no contingent → Medium.
10. **No per stirpes** with 2+ individual primaries → Medium.
11. **Trust beneficiary** on a retirement account with `drafted_yyyy < 2020` or `see_through_reviewed = false` → High (estate-attorney review).
12. **Community property** — `state` in the list, `married`, and non-spouse primary on a retirement account → Medium.
13. **HSA** — `married` and spouse is not primary → Medium.
14. **529 successor owner** missing → Medium.
15. **Stale** — `last_updated_yyyy_mm` earlier than `last_life_event_yyyy_mm` → High; else older than 5 years → Medium.
16. **Will/trust consistency** — beneficiary named on the account conflicts with the will's or trust's stated plan for that asset → Medium.

Sort findings by severity (Critical → High → Medium), then account name A–Z, then check number. A check whose input is missing is listed as "Not checked — {input}".

### Decision rules

Evaluate top to bottom; the first match is the overall verdict.

| # | Condition | Verdict |
|---|---|---|
| 1 | No accounts supplied | No audit — build the inventory first |
| 2 | Any Critical finding | **Urgent** — file updated forms within 30 days, Critical items first |
| 3 | Any High finding | **Update** — file forms within 90 days; route trust items to an estate attorney |
| 4 | Any Medium finding | **Tidy up** at the next annual review |
| 5 | Otherwise | **Current** — no changes; re-check after the next life event |

### Output template

```markdown
# Beneficiary Audit — {YYYY-MM-DD}

## Headline
Verdict: **{verdict}** (Decision rule #{n}). {count} accounts · {count} Critical · {count} High · {count} Medium.

## Account inventory
| Account | Type | ERISA | Primary (share %) | Contingent (share %) | Per stirpes | Last updated | Verified |
|---|---|---|---|---|---|---|---|

## Findings
| # | Account | Check | Severity | Finding | Action |
|---|---|---|---|---|---|

## Trust coordination
{trust items for estate attorney, or "Not applicable — no trust named"}

## Action list
| Priority | Account | Action | Owner |
|---|---|---|---|

## Confirmation checklist
- [ ] Written confirmation / portal screenshot from each custodian after updates
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
