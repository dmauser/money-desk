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
8. **Score-impact priority.** Rank findings by severity, then FICO factor, per the Determinism rules.

## Required citations

- Each tradeline cites the report (bureau + date pulled).
- Outdated items cite the 7y rule + DOFD.
- Score model assumptions cite which score (FICO 8 vs VantageScore 4) is being interpreted.

## Deliverable shape

- Markdown report `./money-desk/credit-identity/credit-report-review-<YYYYMMDD>.md`:
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

## Determinism rules

### Input keys

- `reports` — list of `{ bureau (equifax | experian | transunion), pulled_date (YYYY-MM-DD), text_or_pdf }`
- `as_of_date` — YYYY-MM-DD; date the clocks are measured to (default: latest `pulled_date`)
- `known_accounts` — list of `{ lender, type, last4? }` the user recognizes
- `known_addresses` — list of addresses the user has lived at
- `known_employers` — list (optional)
- `scores` — list of `{ value, model (FICO 8 | FICO 9 | FICO 10 | VantageScore 3 | VantageScore 4), as_of_date, source }` (optional)
- `adverse_action_letter` — bool / text (optional; from a recent denial)
- `planned_applications` — list of `{ type (mortgage | auto | card | other), target_yyyy_mm }` (optional)

Per tradeline the review extracts: `lender, type (revolving | installment | mortgage | collection), opened_date, balance_usd, limit_usd, status, worst_late (none | 30 | 60 | 90 | 120+), dofd (YYYY-MM-DD, negatives only), last_reported_date`.

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Credit reports | **Ask — no default** (all three bureaus; review only what is provided and list missing bureaus) | — |
| Known accounts / addresses | **Ask — no default**; without them, "unknown" findings cannot be made and are listed as "Unverified" | — |
| Score model being interpreted | FICO 8 factor categories (payment history, amounts owed, length of history, new credit, mix) | `[ASSUMPTION]` |
| Reporting-period limits | 7 years from DOFD for most negatives; 10 years for Chapter 7 (15 U.S.C. § 1681c); Chapter 13 removed at 7 years by bureau policy | Statutory — cite |
| Hard-inquiry window | Visible 24 months; scored for 12 months (FICO) | `[ASSUMPTION]` — cite FICO docs |

### Calculation method

1. **Mask PII** first: SSN → `***-**-####`, account numbers → `****####`.
2. **Identifying info** (fixed order: names, addresses, SSN variations, DOB, employers): each item → Verified (in user's lists) or Anomaly.
3. **Tradeline inventory**, one row per bureau per account. Status = Known (matches `known_accounts` by lender + type, plus last-4 when available) or Unknown.
4. **Utilization** (revolving, open, with a limit): per card `balance ÷ limit × 100`; aggregate `Σ balance ÷ Σ limit × 100`; 1 decimal. Cards with no reported limit are excluded and listed.
5. **Age:** oldest account age and average age of open + closed accounts (months, from `opened_date` to `as_of_date`).
6. **Negative items:** for each, `clock_end = dofd + 7 years` (`filing_date + 10 years` for Chapter 7; `+ 7 years` for Chapter 13). Clock status: **Past clock** if `as_of_date > clock_end`; **≤ 12 months left** if within 12 months; else **Running**. Missing DOFD → "DOFD missing — dispute for completeness".
7. **Inquiries:** hard inquiries with date ≤ 24 months before `as_of_date`; flag any the user does not recognize.
8. **Cross-bureau check:** the same account with different balance, status, or late history across bureaus is a finding on each bureau that differs from the user's records.
9. **Classify each finding** with the first matching severity:
   - **Critical** — Unknown account, unrecognized hard inquiry, unknown address, or SSN variation (identity-theft indicators).
   - **High** — Inaccurate or past-clock negative item; aggregate utilization ≥ 50%.
   - **Medium** — Inaccurate non-negative data (balance, limit, status); any card ≥ 90% utilized; aggregate utilization 30–49.9%.
   - **Low** — Everything else worth noting (aggregate utilization 10–29.9%, outdated employer, cosmetic errors).
10. **Score-impact rank** within the action list: severity (Critical → Low), then FICO factor (payment history → amounts owed → length → new credit → mix), then larger balance first, then most recent date first.
11. **Counts:** N = total findings, M = items with action "Dispute", P = Critical + High.

### Decision rules

Evaluated per finding, top to bottom; the first match is that finding's action.

| # | Condition | Action |
|---|---|---|
| 1 | Severity = Critical | Identity Theft Response immediately; then dispute via `dispute_letter_helper` (ground: not mine) |
| 2 | Negative item, Past clock | Dispute — outdated |
| 3 | Item inaccurate per the user's records (with documentation) or cross-bureau mismatch | Dispute — inaccurate |
| 4 | Negative item, DOFD missing | Dispute — incomplete |
| 5 | Single 30-day late, account otherwise current with no other lates in 24 months | Goodwill request to the creditor (not a dispute) |
| 6 | Utilization finding | Pay down before statement-cut — hand to `score_improvement_plan` |
| 7 | Otherwise (accurate) | Leave alone — accurate items are not disputed |

### Output template

```markdown
# Credit Report Review — {as_of_date}

## Headline
**{N} findings**, **{M} disputes recommended**, **{P} high-impact** (Critical + High). Bureaus reviewed: {list}; missing: {list or "none"}.

## Identifying information
| Item | Bureau | Value (masked) | Status |
|---|---|---|---|

## Accounts
| Bureau | Lender | Type | Opened | Balance | Limit | Utilization | Status | Known / Unknown |
|---|---|---|---|---|---|---|---|---|

## Utilization
| Scope | Balance | Limit | Utilization % |
|---|---|---|---|
| Aggregate | | | |

## Negative items
| Bureau | Lender | Type | DOFD | Clock end | Clock status | Accurate? | Action |
|---|---|---|---|---|---|---|---|
{or "None"}

## Inquiries (last 24 months)
| Bureau | Date | Creditor | Recognized? |
|---|---|---|---|

## Top-priority actions
| Rank | Finding | Severity | Action (rule #) |
|---|---|---|---|

## Hand-offs
- Identity Theft Response: {yes — reason / "Not applicable — no Critical findings"}
- Dispute letters: {one per bureau per item, list}
- Score Improvement Plan: {yes / "Not applicable"}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).