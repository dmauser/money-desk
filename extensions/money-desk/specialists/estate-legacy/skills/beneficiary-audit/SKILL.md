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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).