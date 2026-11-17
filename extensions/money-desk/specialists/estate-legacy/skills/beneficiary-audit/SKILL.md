# Beneficiary Audit

description: Audit beneficiary designations on every retirement account, life policy, annuity, HSA, and TOD account. Cross-checks against the will. Outputs a gap list of missing, stale, or contradictory designations. NOT legal advice. Use after marriage, divorce, death, birth.

## When to use

- Marriage, divorce, death of a beneficiary, birth of a child.
- The user has never audited.
- A new account was opened.

## Inputs needed

- List of accounts with beneficiary capability:
  - 401(k), 403(b), 457, IRAs (Trad & Roth), HSA.
  - Life insurance policies.
  - Annuities.
  - TOD / POD designations on brokerage and bank accounts.
- Currently-named primary and contingent beneficiaries per account.
- Will and any trust beneficiaries — for cross-reference.
- Marital and family status changes since beneficiaries were set.

## Workflow

1. **Inventory.** Account, custodian, primary beneficiary, contingent(s), share %, date last updated.
2. **Cross-check vs current intent.** Match every beneficiary to the user's current wishes. Ex-spouses on accounts after divorce, deceased grandparents still listed, minor children listed without a trust structure — all are red flags.
3. **Minor children consideration.** Naming a minor directly is problematic — funds may end up in court-supervised guardianship until 18 or 21. Recommend a trust as beneficiary, or a UTMA setup with an adult custodian.
4. **Contingent beneficiaries.** Always name at least one contingent. Without contingents, if the primary predeceases, the account falls into the will (slow + probate).
5. **Trust as beneficiary.** Requires careful naming language. Some retirement accounts (IRA) lose the "stretch" provisions under SECURE Act if a non-qualifying trust is the beneficiary. Flag for attorney review.
6. **Spousal-consent rules.** ERISA plans (most 401(k)s) require spouse to be primary beneficiary unless spouse consents in writing.
7. **State-law overrides.** Some states automatically revoke an ex-spouse beneficiary on divorce; others don't. Don't rely on this — explicitly update.
8. **Re-confirm.** Designations can be quietly reset by custodian system migrations, plan changes, or "default" assumptions. Recommend an annual confirmation.

## Required citations

- Each designation cites the custodian / form / date.
- Stale flags cite the triggering event.
- ERISA / SECURE Act rules cite the statute name.

## Deliverable shape

- Markdown report `./money-desk/estate-legacy/beneficiary-audit-<YYYYMMDD>.md`:
  - **Headline** — N accounts, M with missing contingents, P with stale primaries.
  - **Per-account table** — custodian, primary, contingent, % split, last-updated.
  - **Red flags** — ex-spouse, minor without trust, missing contingent, contradiction with will.
  - **Action list** — which form to update at which custodian, with online portal vs paper-form path.
  - **Hand-off to attorney** — for trust-as-beneficiary language and complex setups.

## Notes

- Beneficiary designations OVERRIDE the will. A perfectly drafted will means nothing if the 401(k) still names an ex-spouse.
- Don't change beneficiaries to "estate" by default — usually slower and worse than naming a person/trust.
- "NOT legal advice. Trust language and complex family situations require an attorney."

## Determinism rules

### Input keys

- `accounts` — list of `{ account_type (401k | 403b | 457 | trad_ira | roth_ira | hsa | life | annuity | tod_brokerage | pod_bank), custodian, last4, erisa_plan (bool), primaries: [{ name, relationship, share_pct, is_minor, living }], contingents: [same], spousal_consent_on_file (bool), last_updated (YYYY-MM), source (form / portal / statement / memory) }`
- `marital_status` — `single` | `married` | `divorced` | `widowed`
- `spouse_name` — string; `ex_spouse_names` — list
- `life_events` — list of `{ event, date (YYYY-MM) }`
- `will_intent` — list of `{ beneficiary, share_pct }` (from will / trust); optional
- `review_date` — YYYY-MM-DD; default today

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Named beneficiaries per account | **Ask — no default** (the custodian's beneficiary page is the source) | — |
| Designations recalled from memory | Accepted but tagged; re-verify with custodian | `[UNSOURCED]` |
| Unknown `last_updated` | Treated as older than every life event | `[ASSUMPTION]` |
| ERISA status | 401(k)/403(b) = ERISA unless the user says governmental/church plan; IRAs/HSA/TOD = not ERISA | `[ASSUMPTION]` |
| State divorce-revocation statute | Not relied on — flagged regardless (this skill's rule) | — |

None of the analysis needs year-specific figures.

### Calculation method

1. **Inventory** every account; sort by account type in the Input-keys order, then custodian A–Z.
2. **Run checks per account**, in this fixed order, each with a fixed severity:
   - **C1** No primary named — Critical
   - **C2** A primary is in `ex_spouse_names` — Critical
   - **C3** A primary has `living = false` — Critical
   - **H1** Primary `share_pct` total ≠ 100 (tolerance ±0.01) — High
   - **H2** `erisa_plan` and `marital_status = married` and spouse is not sole primary and `spousal_consent_on_file = false` — High
   - **H3** A primary or contingent `is_minor` with no trust / UTMA custodian named — High
   - **H4** Designation contradicts `will_intent` (a person in one but not the other) — High
   - **M1** No contingent named — Medium
   - **M2** Contingent shares total ≠ 100 — Medium
   - **M3** `last_updated` is before the latest `life_events` date — Medium
   - **M4** Primary is "estate" — Medium
   - **M5** A trust is named (SECURE Act see-through review needed) — Medium (attorney)
   - **L1** `last_updated` more than 12 months before `review_date` — Low
3. **Account severity** = highest severity triggered (Critical > High > Medium > Low > None).
4. **Counts:** accounts, accounts per severity, missing contingents (M1), stale primaries (C2 + C3 + M3).
5. **Action rows** sorted by severity, then the step-1 order; each names the custodian form / portal path.

### Decision rules

Applied to the household's highest account severity; evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | No accounts supplied | No audit — ask for the account list |
| 2 | Any Critical | Update those designations within 7 days; Critical items listed first |
| 3 | Any High | Update within 30 days; trust / minor / ERISA consent items to attorney |
| 4 | Any Medium | Update within 90 days |
| 5 | Any Low | Re-confirm at the custodian at the next annual review |
| 6 | Otherwise | No changes — re-audit in 12 months or after any life event |

### Output template

```markdown
# Beneficiary Audit — {review_date}

## Headline
{N} accounts · {critical} Critical · {high} High · {M1_count} missing contingents · {stale_count} stale primaries. Recommendation: **{rule # action}**.

## Per-account table
| Account | Custodian (last-4) | Primary (share %) | Contingent (share %) | Last updated | Severity | Checks triggered |
|---|---|---|---|---|---|---|

## Red flags
| Check | Account | Detail | Severity |
|---|---|---|---|
{or "None"}

## Action list
| Priority | Account | Change | Form / portal path | Deadline |
|---|---|---|---|---|

## Hand-off to attorney
{trust-as-beneficiary, minor structures, ERISA consent — or "Not applicable — no attorney items"}

NOT legal advice. Trust language and complex family situations require an attorney.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).