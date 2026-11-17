# Identity Theft Response

description: Step-by-step incident-response runbook for confirmed or suspected identity theft. Covers immediate containment (freezes, fraud alerts), reporting (FTC IdentityTheft.gov, police), recovery (account-by-account), and ongoing monitoring. Use when ID theft is suspected.

## When to use

- Unknown accounts on credit report.
- Notifications of accounts opened in user's name.
- Tax-related ID theft (rejected return because someone filed first).
- Data breach notification + suspicious activity.

## Inputs needed

- What happened (which signal, which accounts/institutions).
- What the user has already done (frozen / alerts / reported).
- Recent address history.
- Affected accounts and institutions.

## Workflow

1. **Hour 0 — Immediate containment:**
   - **Place a fraud alert** with one bureau (it propagates to the other two). Free, lasts 1 year. Extended alert (7y) requires an ID-theft report.
   - **Freeze credit at all three bureaus** — Equifax, Experian, TransUnion. Free under federal law. Plus ChexSystems for bank-account opening protection. NCTUE for telecom.
   - **Change passwords** on email (especially the email used for financial accounts), then bank, then everything else. Enable 2FA (prefer app or hardware key, not SMS).
   - **Lock SIM** with carrier (SIM-swap is a common attack vector for 2FA bypass).
2. **Hour 1–24 — Report and document:**
   - **FTC IdentityTheft.gov** — file an Identity Theft Report. This generates an FTC Affidavit used by bureaus / creditors.
   - **Police report** — file with local police (sometimes the FTC affidavit alone is enough; some creditors require police report).
   - **Contact each affected institution's fraud department.** Document: ticket number, agent name, date, what they're doing.
   - **IRS:** if tax-related, file Form 14039 (Identity Theft Affidavit) + report at IdentityTheft.gov.
   - **Social Security:** if SSN compromised, contact SSA; consider Identity Protection PIN with IRS.
3. **Week 1 — Cleanup:**
   - Dispute fraudulent items with each bureau using FTC report + dispute letters.
   - Close fraudulent accounts with creditors; demand removal from credit reports.
   - Replace compromised cards / bank accounts.
4. **Week 2+ — Monitoring:**
   - Pull free credit reports from all 3 bureaus weekly for 12 weeks, then monthly through month 12 (free at annualcreditreport.com).
   - Subscribe to free monitoring (CreditWise, etc.) — paid services are nice-to-have but not necessary.
   - Set up bank/card alerts for every transaction > $1.
   - Monitor email for password-reset attempts.
5. **Long term:**
   - Keep credit freeze in place permanently — only thaw temporarily when applying for credit.
   - IP PIN with IRS, every year.
   - Use unique strong passwords per account (password manager).
6. **Recovery tracker** — table of every account / agency contacted, ticket number, status, follow-up date.

## Required citations

- FTC site URLs cited.
- Each bureau's freeze URL cited.
- IRS Form 14039 cited.

## Deliverable shape

- Markdown runbook `./money-desk/credit-identity/identity-theft-response-<YYYYMMDD>.md`:
  - **Hour-0 checklist** with status markers.
  - **24-hour checklist.**
  - **Week-1 checklist.**
  - **Ongoing monitoring plan.**
  - **Contact tracker** — institution, channel, ticket, status, next step.
  - **Document inventory** — what's been filed, where copies are stored.

## Notes

- Speed matters in hour zero. Containment first, paperwork second.
- Don't use SMS 2FA on financial accounts if avoidable — SIM-swap risk.
- Freezing credit is free and reversible. There's no downside.
- "Not legal advice. Consider consulting an attorney if losses are large or institutions are uncooperative."

## Determinism rules

### Input keys

- `signals` — list from: `unknown_account`, `new_account_notice`, `unknown_hard_inquiry`, `unknown_address`, `unauthorized_transaction`, `tax_return_rejected`, `ssn_misuse`, `breach_notice`, `account_takeover` (password/2FA changed without the user)
- `detected_date` — YYYY-MM-DD
- `actions_done` — list from: `fraud_alert`, `freeze_equifax`, `freeze_experian`, `freeze_transunion`, `freeze_chexsystems`, `freeze_nctue`, `email_password_changed`, `financial_passwords_changed`, `sim_lock`, `ftc_report`, `police_report`, `irs_14039`, `ip_pin`
- `affected_institutions` — list of `{ name, account_last4?, type }`
- `loss_usd` — number; known financial loss to date (optional)
- `address_history` — list of addresses, last 7 years

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| What happened (signals) | **Ask — no default** | — |
| Actions already done | None done | `[ASSUMPTION]` |
| Affected institutions | **Ask — no default** | — |
| Fraud alert durations | Initial 1 year; extended 7 years with an identity-theft report (15 U.S.C. § 1681c-1) | Statutory — cite |
| Follow-up interval for open tickets | 14 calendar days | `[ASSUMPTION]` |

### Calculation method

1. **Triage severity** with the Decision rules table (first match wins).
2. **Build the checklist** from the fixed master list below, in this order, keeping only the phases the severity requires. Items in `actions_done` are marked ✅ with the user's date; the rest ⬜.
   - **Hour 0:** (1) fraud alert at one bureau; (2) freeze Equifax; (3) freeze Experian; (4) freeze TransUnion; (5) freeze ChexSystems; (6) freeze NCTUE; (7) change email password + app/hardware 2FA; (8) change financial-account passwords; (9) carrier SIM / port-out lock.
   - **Hour 1–24:** (10) FTC IdentityTheft.gov report; (11) police report; (12) fraud department of each `affected_institutions` entry, one row each; (13) IRS Form 14039 if `tax_return_rejected`; (14) SSA contact if `ssn_misuse`; (15) IRS IP PIN.
   - **Week 1:** (16) dispute each fraudulent item with each bureau (one `dispute_letter_helper` letter per bureau per item); (17) close fraudulent accounts; (18) replace compromised cards / accounts.
   - **Week 2+:** (19) pull all three reports weekly for 12 weeks, then monthly through month 12; (20) free monitoring; (21) transaction alerts > $1 on every card/bank account; (22) watch for password-reset emails.
   - **Long term:** (23) keep freezes on; thaw only for applications; (24) IP PIN every year; (25) unique passwords via a password manager.
3. **Due dates:** Hour-0 items due `detected_date`; Hour 1–24 items due `detected_date + 1 day`; Week-1 items due `+ 7 days`; each contact-tracker row's follow-up date = contact date + 14 days, repeating until the status is Resolved.
4. **Escalation flags:** `loss_usd` ≥ $1,000 or an institution refusing to act after two follow-ups → add "consult a consumer-law attorney (NACA.net)".

### Decision rules

Evaluate top to bottom; the first match is the severity and the phases to run.

| # | Condition | Severity | Phases |
|---|---|---|---|
| 1 | Any of `unknown_account`, `new_account_notice`, `unauthorized_transaction`, `tax_return_rejected`, `ssn_misuse`, `account_takeover` | S1 — Confirmed misuse | All phases, items 1–25 |
| 2 | Any of `unknown_hard_inquiry`, `unknown_address` | S2 — Suspected | Hour 0 (1–9), item 10 (FTC report) once the user confirms the item is not theirs, Week 2+, Long term |
| 3 | `breach_notice` only | S3 — Exposure, no misuse seen | Hour 0 items 2–9, Week 2+, Long term |
| 4 | Otherwise | S4 — No identity-theft signal | No runbook; offer Credit Report Review |

### Output template

```markdown
# Identity Theft Response — {detected_date}

## Severity
**{S1–S4}** — rule #{n}: {signals that fired}.

## Hour-0 checklist (due {date})
| # | Action | Status | Date done | Link / note |
|---|---|---|---|---|

## 24-hour checklist (due {date})
| # | Action | Status | Date done | Link / note |
|---|---|---|---|---|
{or "Not applicable — severity {S}"}

## Week-1 checklist (due {date})
| # | Action | Status | Date done | Link / note |
|---|---|---|---|---|
{or "Not applicable — severity {S}"}

## Ongoing monitoring plan
| # | Action | Cadence | Until |
|---|---|---|---|

## Contact tracker
| Institution | Channel | Ticket # | Agent | Contact date | Status | Next follow-up |
|---|---|---|---|---|---|---|

## Document inventory
| Document | Filed / obtained | Date | Stored where |
|---|---|---|---|

## Escalation
{attorney / CFPB flag — or "None"}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
