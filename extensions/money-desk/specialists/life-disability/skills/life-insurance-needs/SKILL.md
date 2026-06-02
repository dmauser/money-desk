# Life Insurance Needs

description: Calculate term life insurance need using the DIME / income-replacement / human-life-value methods. Outputs a recommended face amount, term length, and approximate premium range. Use after marriage, kid, home purchase, or when the user asks "how much life insurance do I need?"

## When to use

- Marriage or new dependent.
- Home purchase with a mortgage co-signed by a non-earning or lower-earning spouse.
- The user has a policy and wants to verify it's enough.
- Renewing or converting an existing policy.

## Inputs needed

- Age, sex, smoking status, broad health profile.
- Income of insured + spouse.
- Dependents' ages.
- Mortgage balance + other debts.
- Existing life coverage (employer + private).
- Estimated college / education funding goal.
- Final-expenses estimate (~$15k).

## Workflow

1. **Method 1 — DIME (Debt + Income + Mortgage + Education):**
   - **D** — total non-mortgage debts.
   - **I** — 5–10 years of income (longer if dependents are young).
   - **M** — outstanding mortgage balance.
   - **E** — estimated education funding for dependents.
   Sum.
2. **Method 2 — Income replacement.** Annual income × multiplier (10–15× for primary earner). Crude but quick.
3. **Method 3 — Human Life Value.** PV of future earnings stream net of personal consumption. More rigorous.
4. **Subtract existing coverage** (employer LTD + group life + private). Note employer coverage usually ends if user leaves the job and conversion options are expensive.
5. **Recommend term length** matching the longest dependent-period need (e.g., until youngest child is 22 + a buffer; mortgage payoff date if a no-kids couple).
6. **Term vs permanent.** Default to term for most users. Permanent (whole/UL/IUL) is appropriate in narrow cases (estate-tax planning at HNW, lifetime care of a special-needs dependent). Surface the case for term + invest-the-difference explicitly.
7. **Smoker / health rating impact.** Premium can be 2–3× standard. If smoker, flag the option to re-rate after 1 year tobacco-free.
8. **Carrier strength.** A-rated or better. Long-tail product — carrier must outlive the policy term.
9. **Spouse coverage.** Non-earning spouse needs coverage too — replacement-of-services cost (childcare + home management) is often $40–80k/yr equivalent.

## Required citations

- Income figures cite the most recent pay stub / tax return.
- Existing coverage cites the policy decs.
- Recommended face amount shows the build (DIME or replacement) explicitly.

## Deliverable shape

- Markdown report `./money-desk/insurance-reviewer/life-insurance-needs-<YYYYMMDD>.md`:
  - **Headline** — recommended face $ and term length.
  - **DIME buildup table.**
  - **Income-replacement cross-check.**
  - **Existing-coverage gap.**
  - **Approximate premium range** by health rating bucket.
  - **Action list** — get quotes from 2–3 carriers, medical exam expectations.

## Notes

- Most users are under-insured.
- Never replace an existing policy without an in-force quote on the new one — gap risk during underwriting.
- Avoid mortgage life insurance (the bank-marketed product). Term life is cheaper and more flexible.
- "Not professional insurance advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).