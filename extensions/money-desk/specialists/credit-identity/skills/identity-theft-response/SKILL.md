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
   - Pull free credit reports from all 3 bureaus weekly initially (free at annualcreditreport.com).
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

- Markdown runbook `./reports/credit-identity/identity-theft-response-<YYYYMMDD>.md`:
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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).