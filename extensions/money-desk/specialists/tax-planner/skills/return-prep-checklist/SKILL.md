# Return Prep Checklist

description: Assemble every document needed to file a personal federal (and optionally state) tax return. Produces a categorized checklist with status (have / missing / requested). Use at the start of tax season or whenever the user says "help me get organized to file."

## When to use

- Pre-filing season (Jan–Mar) — primary use.
- After a life event that changes documentation needs (new job, new dependent, home purchase, retirement, side income, etc.).
- The user is switching from self-file to a CPA and wants to hand off a clean packet.

## Inputs needed

- Tax year and filing status.
- Prior year's return (single most useful reference — predicts most of this year's docs).
- List of major life changes since last filing.
- Approximate income sources (W-2 employer, 1099 payers, brokerages, etc.).
- Whether itemizing is on the table (drives deduction docs).

## Workflow

1. **Establish filing status and dependents.**
2. **Build the income document list** from sources:
   - **Wages:** W-2 per employer.
   - **Self-employment / contractor:** 1099-NEC / 1099-MISC / 1099-K (some states/platforms); plus business income records.
   - **Investment:** 1099-INT (interest), 1099-DIV (dividends), 1099-B (sales/lots), consolidated 1099s.
   - **Retirement:** 1099-R (distributions), SSA-1099 (Social Security), pension forms.
   - **Other:** K-1 (partnerships/S-corp), 1099-G (state refunds, unemployment), W-2G (gambling), 1099-Q (529 distributions).
3. **Build the deduction/credit document list:**
   - **Above-the-line:** HSA contributions, retirement contributions (IRA, self-employed), student-loan interest (1098-E), educator expenses, SE health insurance.
   - **Itemized:** mortgage interest (1098), property tax statements, state & local income tax records, charitable contributions (receipts and acknowledgement letters), medical above-AGI-threshold, casualty losses in declared disaster areas.
   - **Credits:** child & dependent care receipts, education (1098-T), energy-efficient home improvements, EV/clean-vehicle, child-tax-credit-eligible dependents.
4. **Mark status.** For each: `have` / `coming` / `request` / `n/a` (Determinism rules vocabulary).
5. **Cross-check against prior return.** Anything on Schedule 1/B/D/E last year should appear again unless a life change explains its absence.
6. **Output a chase list** for missing items, with where to get each (employer payroll portal, brokerage, mortgage servicer, charity).

## Required citations

- Every row cites the source (employer, broker, etc.) and the form name + box numbers used.
- Cross-reference flags cite the prior-year schedule/line.

## Deliverable shape

- Markdown checklist `./money-desk/tax-planner/return-prep-checklist-<YEAR>.md`:
  - **Status header** — total docs needed / have / missing.
  - **Income docs table** — form, source, expected by, status.
  - **Deduction/credit docs table** — same shape.
  - **State-specific items** if requested.
  - **Chase list** — what to request, from whom, with example wording.

## Notes

- 1099-K thresholds and form availability vary by year and platform. Confirm the current rules with the IRS site, not your memory.
- Itemizing is increasingly rare since TCJA; check the Deductions Review skill before assembling itemized docs.
- For ESPP / RSU / ISO holders: confirm the brokerage 1099-B + supplemental statement; basis on the 1099-B is often wrong for compensation income already taxed via W-2.

## Determinism rules

### Input keys

- `tax_year` — integer
- `filing_status` — `single` | `mfj` | `mfs` | `hoh` | `qss`
- `dependents` — list of `{ name, age, relationship }`
- `state` — two-letter code (or `none`); `part_year_states` — list, optional
- `prior_year_return_available` — bool
- `prior_year_schedules` — list of schedule names on last year's return (e.g. `1`, `B`, `C`, `D`, `E`, `SE`, `8949`, `8889`)
- `income_sources` — list of `{ type (w2 | 1099_nec | 1099_misc | 1099_k | 1099_int | 1099_div | 1099_b | 1099_r | ssa_1099 | k1 | 1099_g | w2g | 1099_q | rental | other), payer }`
- `deduction_credit_items` — list of `{ type (hsa | ira | se_retirement | student_loan_interest | educator | se_health | mortgage_interest | property_tax | state_income_tax | charitable | medical | casualty | dependent_care | tuition_1098t | energy | clean_vehicle), source }`
- `itemizing_likely` — `yes` | `no` | `unknown`
- `life_events` — list of strings since last filing
- `has_equity_comp` — bool (RSU / ESPP / ISO)
- `doc_status` — map of document id → `have` | `coming` | `request` | `n/a` (user-reported)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Filing status, tax year | **Ask — no default** | — |
| Itemizing likely | Verdict from **Deductions Review** (Tax Planner) if run; else `unknown` → itemized docs are listed with status `request` only for items the user named | `[ASSUMPTION]` |
| 1099-K reporting threshold for the tax year | Not in md_facts — look up via `md_sources` (IRS), else tag `[UNSOURCED]` and list 1099-K as "verify" for every payment-platform payer | `[UNSOURCED]` |
| Document status | Unreported documents default to `request` | `[ASSUMPTION]` |
| Expected-by date | Date stated by the issuer; otherwise "verify" (no default dates) | `[USER-PROVIDED]` |

### Calculation method

1. **Header facts:** filing status, dependents, states. If `filing_status` is missing, stop and ask.
2. **Income documents** — emit one row per `income_sources` entry, in this fixed order of type: W-2 → 1099-NEC → 1099-MISC → 1099-K → 1099-INT → 1099-DIV → 1099-B (add "supplemental statement" row when `has_equity_comp`) → 1099-R → SSA-1099 → K-1 → 1099-G → W-2G → 1099-Q → rental records → other. Within a type, payer A–Z.
3. **Deduction / credit documents** — fixed order: above-the-line (HSA 5498-SA/8889 data, IRA 5498, SE retirement, 1098-E, educator, SE health) → itemized (1098, property-tax bill, state tax records, charitable receipts/acknowledgements, medical, casualty) → credits (dependent-care receipts + provider TIN, 1098-T, energy invoices, clean-vehicle seller report, dependents' SSNs). Itemized rows are included only when `itemizing_likely` is `yes`, or the user named the item.
4. **Prior-year cross-check.** For each schedule in `prior_year_schedules`, map to its source documents (B → 1099-INT/DIV; C → business records/1099-NEC/K; D/8949 → 1099-B; E → rental records/K-1; SE → C/K-1; 8889 → HSA forms). Any mapped document absent from this year's list and not explained by a `life_events` entry → add row with status `request` and flag "on last year's return".
5. **Status** for every row from `doc_status`; default `request`. Vocabulary is fixed: `have`, `coming`, `request`, `n/a`.
6. **Counts:** `needed = rows − n/a`; `have`, `coming`, `request` counts; `readiness_pct = round(100 × have / needed)` (if `needed = 0`, readiness = 100).
7. **Chase list**: every `request` row, ordered income rows first (step-2 order) then deduction/credit rows (step-3 order), each with the issuer and where to get it (payroll portal, broker tax center, servicer, charity, county assessor).

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Status / recommendation |
|---|---|---|
| 1 | `filing_status` or `tax_year` missing | Not started — ask |
| 2 | Any K-1, 1099-B, or equity-comp supplemental row is `coming` or `request` | Not ready — these often arrive late or get corrected; wait |
| 3 | `readiness_pct = 100` | Ready to file / hand to CPA |
| 4 | `readiness_pct ≥ 80` and `request` count = 0 | Start prep; finalize when `coming` items arrive |
| 5 | Otherwise | Work the chase list first |

### Output template

```markdown
# Return Prep Checklist — {tax_year}, {filing_status}

## Status header
Needed **{needed}** · Have **{have}** · Coming **{coming}** · To request **{request}** · Readiness **{readiness_pct}%** → **{decision rule # status}**

## Income documents
| Form | Source / payer | Boxes used | Expected by | Status |
|---|---|---|---|---|

## Deduction & credit documents
| Form / record | Source | Category (above-the-line / itemized / credit) | Expected by | Status |
|---|---|---|---|---|

## Prior-year cross-check
| Prior-year schedule | Expected document | Found this year? | Explanation |
|---|---|---|---|
{or "Not applicable — prior-year return not available"}

## State-specific items
{rows — or "Not applicable — no state return / not requested"}

## Chase list
| # | Document | Request from | Where / how | Example wording |
|---|---|---|---|---|

## Assumptions & flags
- {1099-K threshold source, equity-comp basis warning, [ASSUMPTION] items}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).