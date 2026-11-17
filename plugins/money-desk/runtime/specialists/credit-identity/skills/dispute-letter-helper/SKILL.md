# Dispute Letter Helper

description: Draft a Fair Credit Reporting Act (FCRA) dispute letter for an inaccurate, outdated, or unrecognized credit-report item. Outputs a print-ready letter with the supporting-doc checklist and the correct mailing address per bureau. Analysis-only — the user signs and mails (or uses the bureau's online portal).

## When to use

- Credit Report Review flagged a disputable item.
- User identifies a tradeline they don't recognize.
- Late-payment mark the user believes is wrong (must have proof).
- Account past the 7-year reporting limit.

## Inputs needed

- Bureau(s) reporting the item (sometimes one, sometimes all three).
- The disputed item details: account name, account number (last 4 acceptable for letter), what's wrong, what it should say.
- Supporting documents: payment records, settlement letters, statements, ID theft report, etc.
- User's full name, current address, DOB, SSN-last-4.

## Workflow

1. **Identify dispute grounds.** Be specific:
   - Inaccurate balance, status, or payment history.
   - Account not mine (potential ID theft — also route to identity_theft_response).
   - Outdated (past 7y / 10y).
   - Duplicate reporting (same debt reported twice, sold and original).
   - Mixed file (data from another person's record).
2. **Draft the letter.** Required content:
   - Sender info (name, current address, DOB, last-4 SSN).
   - Date.
   - Bureau name and CRA dispute address.
   - Clear statement: "I am disputing the following item on my credit report under the Fair Credit Reporting Act, 15 U.S.C. § 1681i."
   - Specific item: creditor, account number (last 4), date opened, the inaccuracy.
   - Requested action: removal / correction.
   - List of enclosed supporting documents.
   - Signature line.
3. **Bureau-specific notes:**
   - Equifax, Experian, TransUnion each have a dispute department address — confirm current addresses from each bureau's website (they change).
   - Online portal is faster but mail is recommended for paper-trail with certified mail return-receipt.
4. **Furnisher dispute (optional).** Also dispute directly with the data furnisher (original creditor or collector). They have a separate FCRA obligation to investigate.
5. **Method of verification (MOV) follow-up.** If the bureau verifies the item, the user can request the MOV (how was it verified, by whom). Often reveals weak verification → re-dispute.
6. **Tracking.** Bureaus must respond within 30 days (45 if user provides additional info during investigation).

## Required citations

- Cite 15 U.S.C. § 1681 and the relevant subsection in the letter.
- Cite the bureau's current mailing address (verify from bureau site, not memory).
- Cite the supporting documents enclosed.

## Deliverable shape

- Markdown letter `./money-desk/credit-identity/dispute-letter-<BUREAU>-<YYYYMMDD>.md`:
  - **Letter (print-ready)** with placeholders for signature.
  - **Enclosures checklist** — supporting docs to include.
  - **Mail instructions** — certified mail, return receipt, keep copies.
  - **Follow-up tracker** — date sent, expected response by, escalation path (CFPB complaint) if bureau is unresponsive.

## Notes

- Don't dispute accurate negative items. The bureau is required to verify, will confirm, and the item stays.
- Don't use generic / templated language that suggests "credit repair" — bureaus may frivolously dismiss.
- One letter per bureau per item (don't bundle multiple bureaus into one letter).
- "Not legal advice. The user is the one disputing on their own behalf."

## Determinism rules

### Input keys

- `bureau` — `equifax` | `experian` | `transunion` (one letter per bureau; repeat the skill per bureau)
- `bureau_dispute_address` — string; verified from the bureau's website on `address_verified_date`
- `address_verified_date` — YYYY-MM-DD
- `item` — `{ creditor, account_last4, opened_date, reported_value, correct_value }`
- `dispute_ground` — `inaccurate` | `not_mine` | `outdated` | `duplicate` | `mixed_file` | `incomplete`
- `supporting_docs` — list of `{ title, date }`
- `consumer` — `{ full_name, current_address, dob, ssn_last4 }` (masked in any chat output)
- `send_method` — `certified_mail` | `online_portal`
- `sent_date` — YYYY-MM-DD (optional, for the tracker)
- `received_date` — YYYY-MM-DD (optional; from the return receipt)
- `additional_info_sent_during_investigation` — bool (optional)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Item details and dispute ground | **Ask — no default** | — |
| Bureau dispute address | **Ask — no default** — must be verified on the bureau's site, never from memory | — |
| Consumer identifiers | **Ask — no default** | — |
| Supporting documents | **Ask — no default**; `inaccurate` disputes without documents are flagged "weak" | — |
| Send method | `certified_mail` (return receipt) | `[ASSUMPTION]` |
| Investigation deadline | 30 days from bureau receipt; 45 if the consumer sends more information during the investigation (15 U.S.C. § 1681i(a)(1)) | Statutory — cite |
| Method-of-verification response | Within 15 days of the consumer's request (15 U.S.C. § 1681i(a)(7)) | Statutory — cite |

### Calculation method

1. **Validate** the inputs: one bureau, one item, one ground. If the user wants several items or bureaus, produce one letter per bureau per item.
2. **Ground → requested action:** `inaccurate` → correct to `correct_value`; `not_mine` → delete (and route to identity_theft_response); `outdated` → delete as obsolete under § 1681c; `duplicate` → delete the duplicate entry; `mixed_file` → delete data belonging to another person; `incomplete` → complete or delete.
3. **Assemble the letter** in this fixed order: sender block → date → bureau name + `bureau_dispute_address` → subject line "Dispute of inaccurate information — {creditor} ****{last4}" → the § 1681i statement → item description (creditor, last-4, opened date, what is reported, what is correct) → requested action → numbered enclosure list → signature line. Plain, specific language; no templated "credit repair" phrasing.
4. **Enclosures checklist:** copy of ID, proof of address, each `supporting_docs` item, and (for `not_mine`) the FTC Identity Theft Report.
5. **Tracker dates:** `start = received_date` if known, else `sent_date` labelled "estimate — use the return-receipt date"; `response_due = start + 30 days` (+ 45 instead of 30 if `additional_info_sent_during_investigation`); `mov_due = mov_request_date + 15 days`.
6. **Furnisher letter:** if the ground is `inaccurate`, `duplicate`, or `incomplete`, also draft the same letter addressed to the furnisher.

### Decision rules

Evaluate top to bottom; the first match is the next step.

| # | Condition | Next step |
|---|---|---|
| 1 | The item is accurate per the user's own records | Do not draft — accurate items are verified and stay |
| 2 | `dispute_ground` = `not_mine` | Draft letter + start Identity Theft Response |
| 3 | `dispute_ground` = `inaccurate` and no `supporting_docs` | Ask for documentation before drafting; if the user insists, draft and flag "weak" |
| 4 | Bureau result = verified, and no MOV request yet | Request the method of verification |
| 5 | MOV received and the user has new evidence | Re-dispute with the new evidence |
| 6 | No bureau response by `response_due` | CFPB complaint |
| 7 | Otherwise | Draft letter (+ furnisher letter per step 6), send by `send_method` |

### Output template

```markdown
# Dispute Letter — {Bureau} — {YYYY-MM-DD}

## Letter
{sender block}
{date}
{bureau name}
{bureau_dispute_address} (verified {address_verified_date})

Re: Dispute of inaccurate information — {creditor} ****{last4}

I am disputing the following item on my credit report under the Fair Credit Reporting Act, 15 U.S.C. § 1681i.
- Creditor: {creditor}; account ****{last4}; opened {opened_date}
- Reported: {reported_value}
- Correct: {correct_value}
- Ground: {dispute_ground}

Requested action: {requested action}.

Enclosures:
1. {document}

________________________ (signature)

## Enclosures checklist
- [ ] {item}

## Mail instructions
{certified mail with return receipt, keep copies — or portal steps}

## Furnisher letter
{draft — or "Not applicable — ground is {dispute_ground}"}

## Follow-up tracker
| Step | Date | Due | Status |
|---|---|---|---|
| Sent | | | |
| Bureau response | | {response_due} | |
| MOV request | | {mov_due} | |
| Escalation (CFPB) | | | |
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).