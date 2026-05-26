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

- Markdown letter `./reports/credit-identity/dispute-letter-<BUREAU>-<YYYYMMDD>.md`:
  - **Letter (print-ready)** with placeholders for signature.
  - **Enclosures checklist** — supporting docs to include.
  - **Mail instructions** — certified mail, return receipt, keep copies.
  - **Follow-up tracker** — date sent, expected response by, escalation path (CFPB complaint) if bureau is unresponsive.

## Notes

- Don't dispute accurate negative items. The bureau is required to verify, will confirm, and the item stays.
- Don't use generic / templated language that suggests "credit repair" — bureaus may frivolously dismiss.
- One letter per bureau per item (don't bundle multiple bureaus into one letter).
- "Not legal advice. The user is the one disputing on their own behalf."
