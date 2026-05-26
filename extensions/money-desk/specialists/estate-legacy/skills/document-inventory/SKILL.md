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
4. **Stale flag.** Documents > 5 years old should be reviewed; > 10 years old likely need refresh; any document predating a divorce, remarriage, or new child is presumptively stale.
5. **State-specific notes.** Some doc types vary by state (e.g., transfer-on-death deeds aren't available everywhere; community property states have specific rules). Flag for the user to confirm with an attorney.
6. **Master register output.** A single doc that lists every estate document, where it lives, and who has access. Stored in a place the executor / agents can actually find.

## Required citations

- Each document's existence cited (user-provided / scanned).
- Storage location cited.
- Stale flags cite the date + the triggering life event.

## Deliverable shape

- Markdown register `./reports/estate-legacy/document-inventory-<YYYYMMDD>.md`:
  - **Headline** — N documents, M missing, P stale.
  - **Master register table** — category, date, location, agent/beneficiary, status.
  - **Missing items** — what doesn't exist and why it matters.
  - **Stale items** — what to update and the trigger.
  - **Storage plan** — fireproof safe + attorney + executor copy + digital vault.

## Notes

- Estate documents are state-law-specific. This skill organizes; it does NOT replace an attorney.
- Beneficiary designations on retirement accounts OVERRIDE wills — a stale beneficiary form is the #1 way wills get effectively ignored.
- "This is NOT legal advice. Recommend consulting a licensed estate attorney for drafting and review."
