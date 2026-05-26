# Policy Comparison

description: Compare 2+ quotes for the same insurance type apples-to-apples — coverage limits, exclusions, deductibles, premium, financial strength of carrier. Outputs a side-by-side and a recommendation. Use when shopping for renewal or new policy.

## When to use

- Current policy is up for renewal.
- Carrier raised the premium > inflation.
- Major life event triggers a re-shop.

## Inputs needed

- 2+ quotes / declarations pages for the same insurance type.
- Current policy as the baseline (if renewing).
- User's priorities (lowest premium / best coverage / specific feature like roadside).

## Workflow

1. **Normalize coverage.** Verify each quote has the same coverage type — auto liability vs auto liability, not auto liability vs full-coverage.
2. **Side-by-side limits.** Per coverage line: limit, deductible, sub-limits, exclusions. Highlight differences.
3. **Premium comparison.** Annual premium, payment frequency surcharges, discounts applied (multi-policy, paperless, safe-driver, etc.).
4. **Carrier financial strength.** A.M. Best, S&P, Moody's ratings. Avoid B-rated or unrated carriers for life / long-tail liability — settlement may not arrive when needed.
5. **Customer-experience proxies.** Complaint ratios at the state DOI website. Claims-paid satisfaction (JD Power). Flag carriers with disproportionate complaint counts.
6. **Read exclusions carefully.** Most quotes look similar at the limit-level; the exclusions are where it matters (water-backup, mold, pets, business-use, etc.).
7. **Total-cost-of-protection.** Premium + expected deductible exposure given probability of claim. Higher-deductible policies are cheaper but only work for users with the savings to absorb the deductible.
8. **Switching cost.** Cancel fees, prepaid premium refunds, gap risk on cancellation timing.

## Required citations

- Each quote cites the carrier, quote date, validity period.
- Carrier ratings cite the rating agency + as-of date.
- Complaint ratios cite the state DOI.

## Deliverable shape

- Markdown report `./reports/insurance-reviewer/policy-comparison-<TYPE>-<YYYYMMDD>.md`:
  - **Headline** — winner + reason.
  - **Side-by-side table** — coverage / limits / deductible / premium / carrier rating.
  - **Exclusion delta** — what each policy excludes that others don't.
  - **Switching plan** — effective date, cancellation timing, document transfer.

## Notes

- "Cheapest premium" is not the winner if coverage is materially thinner. Highlight the trade-off explicitly.
- Bundle discounts (auto + home with same carrier) can be worth less than the standalone-best on each — model both.
- "Not professional insurance advice."
