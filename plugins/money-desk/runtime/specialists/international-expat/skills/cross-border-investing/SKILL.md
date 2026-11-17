## Cross-Border Investing

description: Map the cross-border investing landscape for US persons abroad and non-US persons with US ties. Covers the PFIC trap on non-US mutual funds, US-broker residency restrictions, foreign retirement-plan US tax treatment (UK ISA / SIPP, Canadian TFSA / RRSP, Australian superannuation), and brokerage-account choice when neither country is "home" in the simple sense.

## When to use

- US person abroad considering local-country mutual funds, ETFs, or pension contributions.
- US broker (Vanguard, Schwab, Fidelity) notifies user the account will be restricted / closed due to foreign address.
- User with a UK ISA / Canadian TFSA / Australian super wondering "is this taxable in the US?"
- Cross-border family: one spouse US-person, one spouse non-US-person — investing decisions split.
- Inherited foreign investment accounts.

## Inputs needed

- **us_person_status** (required) — US citizen / green-card holder / non-US person currently in US / former US person.
- **country_of_residence** (required) — current country of tax residence.
- **investment_accounts** (required) — list of brokerage / retirement / pension accounts with country and rough balance.
- **fund_holdings** — fund / ETF tickers held in non-US accounts (drives the PFIC analysis).
- **currency_mix** — approximate % of assets in USD vs other currencies.
- **planned_move** — any planned country change in the next 12–24 months.
- **employer_retirement_plan** — country and type of any employer-sponsored plan (UK SIPP, Canadian RRSP, Australian superannuation, etc.).

## Workflow

### 1. Inventory current investment accounts
- For each: country, custodian, account type, balance, asset composition (% mutual funds / ETFs / individual stocks / bonds / cash).
- Flag any non-US-domiciled mutual funds or ETFs — PFIC exposure.
- Flag any tax-advantaged foreign account — foreign-pension treatment.

### 2. The PFIC trap (cornerstone)
- Any non-US-domiciled pooled investment vehicle (most foreign mutual funds, foreign ETFs, foreign unit trusts, foreign hedge funds) is a Passive Foreign Investment Company for US-tax purposes.
- US default tax regime on PFIC: "excess distribution" gets allocated over the entire holding period, taxed at the **highest ordinary rate** in each year, with an interest charge for the deferral. Effectively punitive.
- Two opt-outs require fund cooperation:
  - **QEF** (Qualified Electing Fund) election — taxed pass-through-like; requires fund to provide annual PFIC Annual Information Statement. Almost no non-US funds provide it.
  - **Mark-to-Market** election — annual taxable mark to year-end value at ordinary rates. Possible for publicly traded PFICs; still ordinary-rate.
- Form 8621 required per PFIC per year regardless of election (with limited exception under $25k aggregate).
- **Rule for US persons**: buy US-domiciled ETFs/funds ONLY. Stick with Vanguard / iShares (US) / SPDR (US) / Schwab — never the UCITS or local-country sibling.

### 3. US broker residency restrictions
- Major US brokers have varying policies on non-US-resident customers:
  - **Schwab International / Interactive Brokers**: most permissive; serve US persons abroad in many countries.
  - **Vanguard / Fidelity**: increasingly restrictive; often allow existing accounts to maintain but block new contributions or new account opening from foreign address.
  - **Robinhood, M1, most fintechs**: US-address required.
- **Don't lie about address** — KYC / FATCA penalties for the broker, and account-freeze risk for the user.
- **Solution**: open with a broker that serves expats BEFORE moving (Schwab International is the most common choice). Migration after move is harder.
- For non-US persons opening US accounts: W-8BEN required; income subject to US withholding tax (potentially reduced by treaty).

### 4. Foreign retirement-plan US tax treatment
- **UK SIPP**: typically treated as qualified pension under US-UK treaty Article 17; tax-deferred until withdrawal; some return-position complexity around contributions.
- **UK ISA**: NOT a US-qualified account. Annual income and gains are US-taxable; ISA tax exemption is UK-only. Many US persons unknowingly accumulate PFIC exposure inside an ISA (funds inside ISAs are typically UK-domiciled).
- **Canadian RRSP**: US-Canada treaty grants automatic tax deferral (post-2014); declared on Form 8891 historically (now automatic election).
- **Canadian TFSA**: NOT recognized by US as tax-advantaged; income annually US-taxable; potential foreign trust complications (Forms 3520 / 3520-A).
- **Australian superannuation**: complex. No clear US treaty; positions range from "treated as foreign grantor trust" (requiring 3520 / 3520-A) to "treated as employees' trust" (US-tax-deferred). Position must be taken with cross-border CPA; do NOT default.
- **EU pillar-2 / pillar-3** plans: country-specific; default to treaty article on pensions if treaty exists, else flexible-grantor-trust treatment.

### 5. Currency exposure of the portfolio
- US person abroad earning in local currency, spending in local currency, retiring in [TBD] — the "home" currency for portfolio purposes is debated.
- Default: hold core equities in USD via US-domiciled funds; hold local-currency cash for a 6-month expense reserve (12 if income is variable — Determinism rules); rebalance to currency exposure annually as part of portfolio review.

## Output

- Cleanup checklist per account: keep / restructure / liquidate / move.
- Recommended brokerage architecture for expat (Schwab International or equivalent + local-currency bank).
- Foreign retirement-account tax-treatment summary with the position required on the return.
- PFIC-exposure inventory if any, with Form 8621 / liquidation recommendation.

## Citations / sources

- IRC §1291-1298 (PFIC), §6048 (foreign trusts).
- IRS Pub 597 (US-Canada), Pub 901 (treaty tax tables).
- US-UK Income Tax Treaty (2001) Article 17 (pensions), 18 (other plans).
- AICPA International Tax Section technical resources.

## Disclaimer

Educational. Cross-border investment positions can create significant penalty exposure if mis-classified. Strongly recommend a cross-border CPA + (for foreign-trust / 3520-A issues) a specialist with that explicit experience.

## Determinism rules

### Input keys

Names match this skill's Inputs needed.

- `us_person_status` — `citizen` | `green_card` | `non_us_person_in_us` | `former_us_person` (required)
- `country_of_residence` — string (required)
- `investment_accounts` — list of `{ name, country, custodian, account_type (brokerage | isa | sipp | rrsp | tfsa | superannuation | eu_pension | other_pension | us_ira | us_401k | other), balance_usd }` (required)
- `fund_holdings` — list of `{ account, ticker_or_isin, domicile (us | non_us), type (fund | etf | stock | bond | cash), value_usd }`
- `currency_mix` — map of currency → percent of total assets
- `planned_move` — `{ country, date (YYYY-MM) }` or none
- `employer_retirement_plan` — `{ country, type }` or none
- `local_law_blocks_us_funds` — bool; default false
- `monthly_local_expenses_usd` — number; optional (cash-reserve sizing)
- `income_variable` — bool; default false

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Accounts, balances, fund domicile | **Ask — no default**; a fund with unknown domicile is treated as `non_us` (PFIC risk) until confirmed | `[ASSUMPTION]` |
| PFIC default regime / Form 8621 | `md_facts` → `expat_quick_reference_2026.pfic_default_taxation_form_8621_required` | `[IRS / FinCEN Expat 2026]` |
| Treaty treatment of a foreign plan | Per the table in Workflow step 4; plans not listed → treaty article lookup via `md_sources` (IRS Treaties Resource Center), else `[UNSOURCED]` and CPA | `[UNSOURCED]` |
| US broker policy for foreign addresses | Broker's current published policy via `md_sources` / broker site; the broker list in Workflow step 3 is a starting point | `[UNSOURCED]` |
| Local-currency cash reserve | 6 months of `monthly_local_expenses_usd` (12 if `income_variable`) — the ends of this skill's 6–12 month range | `[ASSUMPTION]` |
| Tax cost of liquidating a PFIC | Not computed — CPA computes the excess-distribution tax before any sale | — |

### Calculation method

1. **Scope.** If `us_person_status = non_us_person_in_us`, only the W-8BEN / treaty-withholding note and US-broker items apply; PFIC and foreign-plan rules do not.
2. **Inventory** every account; sort by country A–Z, then balance descending.
3. **Holding classification:** `PFIC` = `domicile = non_us` and `type ∈ {fund, etf}`; `OK` otherwise. `pfic_value = Σ value_usd of PFIC holdings` per account and in total.
4. **Account treatment** by `account_type`, fixed mapping: `sipp` → treaty pension (keep); `rrsp` → treaty-deferred (keep); `isa` → US-taxable account; `tfsa` → US-taxable + possible foreign-trust forms (3520 / 3520-A); `superannuation` → position required with cross-border CPA (no default); `eu_pension` / `other_pension` → treaty-article lookup; `brokerage` → taxable; `us_ira` / `us_401k` → US-qualified (check custodian residency policy).
5. **Broker residency check:** for each US custodian, status = `restricts foreign address` / `serves expats` / `unknown` from the step-4 assumption source; `at_risk` if `restricts` and (`country_of_residence ≠ US` or `planned_move` within 24 months).
6. **Cash reserve** target (step-4 assumption) in the residence currency, compared with current local-currency cash.

### Decision rules

Per account; evaluate top to bottom; the first match wins.

| # | Condition | Action |
|---|---|---|
| 1 | `account_type = superannuation` or TFSA, or a pension with no treaty article found | **Restructure — CPA position first** (no default treatment) |
| 2 | `pfic_value > 0` and `local_law_blocks_us_funds = false` | **Liquidate PFIC holdings → replace with US-domiciled funds** after the CPA computes the tax cost; file Form 8621 for the year held |
| 3 | `pfic_value > 0` and `local_law_blocks_us_funds = true` | **Keep with Form 8621 compliance**, or switch to individual stocks |
| 4 | US custodian `at_risk` | **Move** to an expat-serving broker before the move / restriction date |
| 5 | US custodian status `unknown` and resident abroad or moving within 24 months | **Confirm broker policy** in writing |
| 6 | Otherwise | **Keep** |

### Output template

```markdown
# Cross-Border Investing Review — {date}

## Headline
{N} accounts · PFIC exposure **${pfic_value}** in {k} accounts · {at_risk_count} US accounts at residency risk.

## Account cleanup checklist
| Account | Country | Type | Balance | US treatment | PFIC value | Action (rule #) |
|---|---|---|---|---|---|---|

## Recommended brokerage architecture
- US-domiciled funds at an expat-serving US broker + local-currency bank for spending
- Local-currency cash reserve: target ${reserve_target} vs current ${local_cash}

## Foreign retirement-account treatment
| Account | Treaty / article | Position required on the return | CPA needed? |
|---|---|---|---|
{or "Not applicable — no foreign retirement accounts"}

## PFIC inventory
| Account | Holding | Domicile | Value | Recommendation |
|---|---|---|---|---|
{or "None"}

## Assumptions & flags
- {unknown domiciles, broker-policy sources, [UNSOURCED] items}

Educational. Confirm positions with a cross-border CPA.
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
