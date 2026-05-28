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
   - Irrevocable trust for estate-tax planning (federal estate-tax exemption changes — confirm working-year limit; many states have lower thresholds).
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

- Markdown checklist `./reports/estate-legacy/basics-checklist-<YYYYMMDD>.md`:
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).