# Basics Checklist

description: A one-page "estate hygiene basics" checklist — the minimum documents and tasks every adult should have completed. Outputs a status report (have / missing / outdated) with the priority order. NOT legal advice — surfaces what's needed and recommends attorney engagement for drafting.

## When to use

- The user has never thought about estate planning.
- Quick health-check after life events.
- For young adults (post-college, first job) starting from zero.

## Inputs needed

- Marital status, children, dependents.
- Property owned (home, retirement, life insurance, business interest).
- State of legal residence.
- Existing documents (if any).

## Workflow

1. **The minimum five for every adult:**
   1. **Will** — names executor, distributes assets, names guardians for minor children. Without one, state intestacy decides who gets what (often slowly and badly).
   2. **Durable Financial POA** — names an agent to handle money matters if you're incapacitated. Without this, family must petition for guardianship.
   3. **Healthcare POA / Medical Proxy** — names an agent to make medical decisions when you can't.
   4. **Living Will / Advance Directive** — written end-of-life preferences.
   5. **HIPAA authorization** — lets named people access your medical records.
2. **Plus, for almost everyone:**
   - Beneficiary designations on every retirement account, life policy, HSA — current and with contingents.
   - Adequate term life insurance if you have dependents (`life_insurance_needs`).
3. **For households with kids:**
   - Named guardians (in will). Discuss with the guardian *before* naming them.
   - Trust structure for inheritance flowing to minors.
4. **For higher-net-worth or complex situations:**
   - Revocable living trust to avoid probate.
   - Irrevocable trust for estate-tax planning (federal estate-tax exemption: `md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual`, verify via `md_sources`; many states have lower thresholds — look up via `md_sources`).
   - Business succession planning.
   - Special-needs trust for any dependents who receive means-tested benefits.
5. **Storage and accessibility.**
   - Original will in a fireproof safe + copy with attorney + executor knows location.
   - POAs in a place the agent can reach quickly.
6. **Discuss with the people named.** Executors, agents, guardians, healthcare proxy — they should know they're named and what's expected.

## Required citations

- State intestacy rules cite state statute.
- Federal estate-tax exemption cites the IRS for the working year.

## Deliverable shape

- Markdown checklist `./money-desk/estate-legacy/basics-checklist-<YYYYMMDD>.md`:
  - **Headline** — N of 5 minimums in place.
  - **The 5 minimum docs** — status, gap, action.
  - **Beneficiary check pointer** — `beneficiary_audit`.
  - **Life insurance pointer** — `life_insurance_needs`.
  - **Kids-section** if dependents.
  - **HNW-section** if applicable.
  - **Action plan** — which to do first (usually: appointment with an estate attorney + run a beneficiary audit immediately).

## Notes

- DIY tools (LegalZoom, etc.) work for very simple situations. Anything with blended family, business interest, special-needs, or HNW assets — use a licensed attorney.
- "NOT legal advice. The user must engage a licensed estate attorney in their state to draft and review documents."

## Determinism rules

### Input keys

- `state` — two-letter code of legal residence
- `marital_status` — `single` | `married` | `partnered` | `divorced` | `widowed`
- `minor_children_count` — integer; default 0
- `dependent_on_means_tested_benefits` — bool; default false
- `owns_business` — bool; `real_estate_states_count` — integer; `blended_family` — bool
- `estimated_net_worth_usd` — number
- `has_dependents_relying_on_income` — bool; `life_insurance_in_place` — bool
- `docs` — map for `will`, `financial_poa`, `healthcare_poa`, `living_will`, `hipaa` → `{ exists (yes | no | unsure), date_executed (YYYY-MM) }`
- `guardians_named` — bool; `trust_for_minors` — bool
- `beneficiaries_reviewed_date` — YYYY-MM; optional
- `last_major_life_event_date` — YYYY-MM (marriage, divorce, birth/adoption, death of a named person, move to a new state); optional
- `review_date` — YYYY-MM-DD; default today

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Document existence | `unsure` is scored as **missing** until the user confirms | `[ASSUMPTION]` |
| Document date | Unknown date is scored as **outdated** | `[ASSUMPTION]` |
| Federal estate-tax exemption | `md_facts` → `estate_and_gift_2026.lifetime_exemption_per_individual` (md_facts flags possible legislative change — verify via `md_sources`) | `[IRS Estate 2026]` |
| State estate / inheritance-tax threshold | Not in md_facts — look up via `md_sources` (state DoR), else tag `[UNSOURCED]` | `[UNSOURCED]` |
| State intestacy rules, document formalities | Not computed — cite state statute or defer to the attorney | — |

### Calculation method

1. **Score each of the five minimums**, in this fixed order: Will, Durable Financial POA, Healthcare POA, Living Will / Advance Directive, HIPAA authorization.
   - `missing` — `exists` is `no` or `unsure`.
   - `outdated` — exists and (`date_executed` unknown, or more than 5 years before `review_date`, or before `last_major_life_event_date`, or the user moved states after signing).
   - `in_place` — otherwise.
2. **Headline score** = count of `in_place` (0–5).
3. **Beneficiary check:** `due` if `beneficiaries_reviewed_date` is missing or more than 12 months before `review_date`.
4. **Life-insurance pointer:** `gap` if `has_dependents_relying_on_income` and not `life_insurance_in_place`.
5. **Kids section** applies when `minor_children_count > 0`: items = guardians named (yes/no), trust or custodian structure for minors (yes/no).
6. **HNW / complex section** applies when any of: `owns_business`; `dependent_on_means_tested_benefits`; `real_estate_states_count ≥ 2`; `blended_family`; `estimated_net_worth_usd ≥` the state estate-tax threshold (if the state has one) or the federal exemption. Items: revocable trust (probate), irrevocable / estate-tax planning, business succession, special-needs trust — only those whose trigger fired.
7. **Action list order:** `missing` before `outdated`; within a status, the step-1 order; then beneficiary audit, life-insurance pointer, kids items, HNW items.

### Decision rules

Evaluate top to bottom; the first match is the headline recommendation.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `state` missing | No checklist — ask (estate law is state-specific) |
| 2 | Will `missing` or `outdated` and `minor_children_count > 0` | Urgent: estate-attorney appointment for a will naming guardians; run **Beneficiary Audit** the same week |
| 3 | Any minimum `missing` | Book an estate attorney for the missing documents; run **Beneficiary Audit** |
| 4 | Any minimum `outdated` | Attorney review/update of outdated documents |
| 5 | Beneficiary check `due` or life-insurance `gap` | Run **Beneficiary Audit** / **Life Insurance Needs** (Life & Disability) |
| 6 | Otherwise | Maintenance — re-run this checklist in 12 months or after any life event |

### Output template

```markdown
# Estate Basics Checklist — {review_date}

## Headline
**{score} of 5** minimum documents in place. Recommendation: **{rule # action}**.

## The 5 minimum documents
| # | Document | Status (in_place / outdated / missing) | Date executed | Gap | Action |
|---|---|---|---|---|---|

## Beneficiary check
{due / current — pointer to **Beneficiary Audit** (Estate & Legacy)}

## Life insurance
{gap / no gap — pointer to **Life Insurance Needs** (Life & Disability)}

## Kids section
{guardian + trust items — or "Not applicable — no minor children"}

## HNW / complex section
{triggered items — or "Not applicable — no trigger fired"}

## Action plan
| Priority | Action | Who | Why |
|---|---|---|---|

NOT legal advice. Engage a licensed estate attorney in {state} to draft and review documents.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
