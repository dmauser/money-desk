# Disability Insurance Review

description: Review and size long-term disability (LTD) coverage — the most under-bought insurance relative to actual risk for working-age adults. A 30-year-old has a ~25% chance of being disabled before 65; lost income dwarfs the lifetime cost of any other insurable loss.

## When to use

- User is working-age (especially 25–55) and dependent on earned income.
- User just changed jobs (group LTD almost always shrinks vs prior or vs need).
- User is self-employed / 1099 / partner (no group LTD — individual policy is the only option).
- User has high income (>$100k) — group LTD typically caps and replaces too little.
- User is in a physically demanding or specialty profession (surgeon, dentist, pilot — needs own-occupation).

## Inputs needed

- Gross annual income (W-2, K-1, 1099 — list separately).
- Pre-tax employee benefits (if employer LTD premium is paid pre-tax, benefits are TAXABLE; if post-tax, benefits are tax-FREE — flips the replacement math).
- Existing group LTD: benefit %, monthly cap, elimination period, benefit period, own-occ vs any-occ definition, mental/nervous limit.
- Existing individual disability policy details if any.
- Other coverage: SSDI (effectively useless under 50; strict definition), state programs (CA, NY, NJ, RI, HI, PR have state disability).
- Monthly fixed expenses + dependents.
- Emergency fund size.

## Workflow

1. **Compute net income need.** Aim to replace 60–70% of GROSS (which approximates 100% of NET after the user's income tax + payroll taxes go away). Subtract fixed reductions in retirement (savings, payroll tax) but add health insurance if employer was paying.
2. **Audit the group policy carefully.**
   - **Definition of disability** — "own occupation" (you can't do YOUR job) is the gold standard; "any occupation" (you can't do ANY job you're reasonably suited for) pays much less in practice.
   - **Benefit cap** — typical group cap $10–15k/mo. High earners often hit the cap and get a much lower replacement ratio than the headline percent.
   - **Taxability** — if employer pays the premium pre-tax, benefits are taxable → effective replacement is ~40% not 60%.
   - **Mental/nervous limit** — many group policies limit M/N to 24 months. Anxiety, depression, burnout claims are a meaningful share of claims.
   - **COLA rider** — without inflation adjustment, a 30-year claim loses huge purchasing power.
   - **Portability** — does it survive job change? Usually no.
3. **Identify the gap.** Net need − group benefit (after tax adjustment) = supplemental individual policy size.
4. **Supplemental individual policy specs to request:**
   - True own-occupation (specialty letters for physicians/dentists).
   - Non-cancelable, guaranteed renewable to age 65 or 67.
   - Future-purchase option / Benefit Increase Rider (lock in insurability while young + healthy).
   - Residual / partial disability rider.
   - COLA rider for 30+ year potential claims.
   - 90-day elimination period typical (longer if larger emergency fund).
5. **Self-employed users.** No group fallback exists. Individual policy + business overhead expense (BOE) policy (covers business fixed costs during disability) is the standard pair.
6. **Premium sanity check.** Quality individual LTD costs ~1–3% of income per year. For a 35-year-old non-smoker professional, $5k/mo benefit ~$1,500–$3,000/yr premium is typical (varies by occupation class).

## Required citations

- Disability probability stats cite SSA / Council for Disability Awareness.
- Group policy details cite the certificate of coverage / SPD.
- Tax treatment of benefits cites IRS Pub 525.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/disability-review-<YEAR>.md`:
  - Income-replacement target.
  - Current coverage audit (with after-tax effective benefit).
  - Gap size.
  - Individual policy spec sheet to shop.
  - Premium estimate range.

## Notes

- Disability insurance is medically underwritten — quote and lock in EARLY while healthy.
- Two specialists, two coverages: doctors/dentists need TRUE own-occupation with specialty language.
- "Analysis only. Not professional insurance advice. Recommend a fee-only independent broker who can quote 3–4 carriers."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).