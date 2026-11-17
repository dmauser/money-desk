# Document Inventory

description: Build a structured inventory of all estate-related documents — will, trust, POAs, healthcare directive, beneficiary forms, account list, digital assets list. Outputs a master register and a "missing or stale" gap list. NOT legal advice. Use as the entry point for any estate hygiene work.

## When to use

- User has never organized estate documents.
- After a life event (marriage, kid, divorce, death of a parent).
- Pre-retirement / pre-major-travel.
- An aging parent's documents need consolidation.

## Inputs needed

- Whatever documents the user has — wills, trusts, POAs, healthcare directives, deeds, titles, beneficiary forms.
- Account inventory (banks, brokerages, retirement, insurance, crypto).
- Names and contact info for executor, agents under POA, healthcare proxy, guardians for minor children.
- Storage locations (safe deposit, attorney, fireproof safe, digital vault).

## Workflow

1. **Document categories to cover:**
   - **Will** — when executed, where stored, named executor + alternates, named guardians for minors.
   - **Trust(s)** — type (revocable / irrevocable), date, trustee + successors, beneficiaries, funded vs unfunded.
   - **Financial POA** — agent + alternates, springing vs durable, scope.
   - **Healthcare POA / Medical Proxy** — agent + alternates.
   - **Living Will / Advance Directive** — end-of-life preferences.
   - **HIPAA authorization.**
   - **Deeds and titles** — house, car, boat, etc. — with TOD/POD designations where applicable.
   - **Beneficiary designations** — retirement accounts, life insurance, annuities, TOD brokerage accounts.
   - **Digital estate** — password manager + emergency access, social media legacy contacts, crypto recovery phrases.
   - **Burial / funeral preferences** — if documented.
2. **For each document:** date executed, where stored, who has copies, whether it's still current (named executors still living, addresses current, named minor children now adults, etc.).
3. **Gap flag.** Missing categories listed first — every adult should have at least a will + POAs + healthcare directive.
4. **Stale flag.** Documents > 5 years old are `review`; > 10 years old are `refresh`; any document predating a divorce, remarriage, or new child is presumptively stale.
5. **State-specific notes.** Some doc types vary by state (e.g., transfer-on-death deeds aren't available everywhere; community property states have specific rules). Flag for the user to confirm with an attorney.
6. **Master register output.** A single doc that lists every estate document, where it lives, and who has access. Stored in a place the executor / agents can actually find.

## Required citations

- Each document's existence cited (user-provided / scanned).
- Storage location cited.
- Stale flags cite the date + the triggering life event.

## Deliverable shape

- Markdown register `./money-desk/estate-legacy/document-inventory-<YYYYMMDD>.md`:
  - **Headline** — N documents, M missing, P stale.
  - **Master register table** — category, date, location, agent/beneficiary, status.
  - **Missing items** — what doesn't exist and why it matters.
  - **Stale items** — what to update and the trigger.
  - **Storage plan** — fireproof safe + attorney + executor copy + digital vault.

## Notes

- Estate documents are state-law-specific. This skill organizes; it does NOT replace an attorney.
- Beneficiary designations on retirement accounts OVERRIDE wills — a stale beneficiary form is the #1 way wills get effectively ignored.
- "This is NOT legal advice. Recommend consulting a licensed estate attorney for drafting and review."

## Determinism rules

### Input keys

- `documents` — list of `{ category, exists (yes | no | unsure), date_executed (YYYY-MM), storage_location, copies_held_by, named_people: [{ role, name, living, contact_current }], funded? (trusts only), tod_pod? (deeds/titles) }` where `category` ∈ `will`, `trust`, `financial_poa`, `healthcare_poa`, `living_will`, `hipaa`, `deeds_titles`, `beneficiary_designations`, `digital_estate`, `funeral_preferences`
- `life_events` — list of `{ event (marriage | divorce | remarriage | birth | adoption | death | state_move), date (YYYY-MM) }`
- `minor_children` — list of `{ name, birth_yyyy_mm }`
- `state` — two-letter code
- `review_date` — YYYY-MM-DD; default today

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Document existence | `unsure` is treated as **missing** | `[ASSUMPTION]` |
| Unknown execution date | Treated as **stale — refresh** | `[ASSUMPTION]` |
| State-specific instruments (TOD deeds, community property) | Not computed — flagged for attorney confirmation | — |

None — no year-specific figures are used.

### Calculation method

1. **Categories** are always listed in the Input-keys order (10 rows minimum, one row per document when several exist).
2. **Status per document**, first match wins:
   - `missing` — `exists` is `no` or `unsure`.
   - `refresh` — `date_executed` unknown, or more than 10 years before `review_date`, or before any `divorce`, `remarriage`, `birth`, `adoption`, `death` of a named person, or `state_move` event; or any named person has `living = false`; or a trust has `funded = false`.
   - `review` — more than 5 years before `review_date`, or a named minor has since turned 18, or any named contact is not current.
   - `current` — otherwise.
3. **Required core** = will, financial POA, healthcare POA, living will (advance directive). `core_missing` = count of core categories with status `missing`.
4. **Counts:** documents found, missing (categories), stale (`refresh` + `review`).
5. **Gap list** order: core missing (step-3 order) → other missing → `refresh` → `review`; within a group, the step-1 order.

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | No documents information supplied | No register — ask |
| 2 | `core_missing ≥ 1` | Book an estate attorney to draft the missing core documents; run **Basics Checklist** |
| 3 | Any `refresh` | Attorney update of `refresh` documents (named trigger shown per item) |
| 4 | Any `review` | Self-review the `review` documents; attorney only if something changed |
| 5 | Any non-core category `missing` | Complete the non-core items (beneficiary forms → **Beneficiary Audit**, digital → **Digital Estate Review**) |
| 6 | Otherwise | Register current — re-inventory in 12 months or after any life event |

### Output template

```markdown
# Estate Document Inventory — {review_date}

## Headline
{N} documents · {M} missing · {P} stale. Recommendation: **{rule # action}**.

## Master register
| Category | Date executed | Location | Copies held by | Agent / beneficiary | Status |
|---|---|---|---|---|---|

## Missing items
| Category | Why it matters | Next step |
|---|---|---|
{or "None"}

## Stale items
| Category | Status (refresh / review) | Trigger | Next step |
|---|---|---|---|
{or "None"}

## Storage plan
- Fireproof safe · attorney copy · executor copy · digital vault — {current locations and gaps}

## State-specific notes
{items for attorney confirmation in {state}}

This is NOT legal advice. Consult a licensed estate attorney for drafting and review.
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).