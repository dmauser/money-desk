## Cross-Border Investing

description: Map the cross-border investing landscape for US persons abroad and non-US persons with US ties. Covers the PFIC trap on non-US mutual funds, US-broker residency restrictions, foreign retirement-plan US tax treatment (UK ISA / SIPP, Canadian TFSA / RRSP, Australian superannuation), and brokerage-account choice when neither country is "home" in the simple sense.

## When to use

- US person abroad considering local-country mutual funds, ETFs, or pension contributions.
- US broker (Vanguard, Schwab, Fidelity) notifies user the account will be restricted / closed due to foreign address.
- User with a UK ISA / Canadian TFSA / Australian super wondering "is this taxable in the US?"
- Cross-border family: one spouse US-person, one spouse non-US-person — investing decisions split.
- Inherited foreign investment accounts.

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
- Default: hold core equities in USD via US-domiciled funds; hold local-currency cash for 6-12 month expense reserve; rebalance to currency exposure annually as part of portfolio review.

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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).