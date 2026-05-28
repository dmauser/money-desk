# Credit Report Review

description: Review a credit report (Equifax / Experian / TransUnion) for inaccuracies, outdated items, identity-theft indicators, and score-impacting issues. Outputs a finding list with disputes to file. Use when the user pulls a fresh report at annualcreditreport.com.

## When to use

- Annual / pre-mortgage / pre-auto-loan checkup.
- After a denial or a surprise score drop.
- Suspected identity theft or after a data breach notification.

## Inputs needed

- A recent credit report (PDF or text export) from one or more bureaus.
- The user's own list of known accounts (for cross-check).
- Recent score(s) and any score-disclosure letter if a denial happened.

## Workflow

1. **Verify identifying info.** Name, addresses, employers, SSN footprint. Flag unknown addresses (potential ID theft).
2. **Account inventory.** For each tradeline: lender, type, opened, balance, limit, utilization, status, payment history, last reported. Compare to user's known accounts; flag unknown ones for dispute.
3. **Negative items.**
   - Late payments (30/60/90/120+) — date and frequency.
   - Collections — original creditor, collection agency, balance, status, date of first delinquency (DOFD).
   - Charge-offs.
   - Public records (bankruptcies — Ch 7 stays 10y, Ch 13 stays 7y).
   - All negative items have a 7-year clock from DOFD (10y for Ch 7). Flag any item past the clock as disputable.
4. **Utilization snapshot.** Per card + aggregate. Pre-statement-cut utilization is what gets reported — score-improvement plays target this.
5. **Credit-age and mix.** Average age of accounts; oldest account. Closing old accounts hurts; flag any planned closures.
6. **Inquiries.** Hard inquiries in last 2 years (affect score for 12 months). Note any unrecognized — possible ID theft.
7. **Dispute candidates.** Anything inaccurate, outdated, or unrecognized → dispute under FCRA. Generate a dispute letter via `dispute_letter_helper`.
8. **Score-impact priority.** Rank findings by likely score impact.

## Required citations

- Each tradeline cites the report (bureau + date pulled).
- Outdated items cite the 7y rule + DOFD.
- Score model assumptions cite which score (FICO 8 vs VantageScore 4) is being interpreted.

## Deliverable shape

- Markdown report `./reports/credit-identity/credit-report-review-<YYYYMMDD>.md`:
  - **Headline** — N findings, M disputes recommended, P high-impact items.
  - **Identifying info section** — verified vs anomalies.
  - **Account table** — known / unknown / disputable.
  - **Negative items table** — type, age, DOFD, clock status, action.
  - **Inquiries table.**
  - **Top-priority actions** — what to dispute, what to pay down for utilization, what to leave alone.
  - **Hand-offs** — `dispute_letter_helper` for each disputable item; `score_improvement_plan` for the score levers.

## Notes

- All three bureaus may have different data. Pull all three.
- Don't dispute accurate negative items — wasted effort.
- Identity-theft indicators (unknown accounts, addresses, SSN-mismatch) trigger Identity Theft Response immediately.
- "Not professional credit advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).