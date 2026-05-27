## Health Plan Selector

description: Pick the best health plan for the household this year — from an employer's open-enrollment menu, an ACA Marketplace shop, or a Cobra-vs-Marketplace decision after a job change. Computes expected total cost = premium + expected out-of-pocket utilization + HSA tax benefit (when applicable) and compares HDHP+HSA vs PPO vs HMO with the household's actual utilization pattern.

## When to use

- Annual open enrollment (typically Oct-Dec).
- Job change with new employer's benefits menu.
- Coming off Cobra and shopping the ACA Marketplace.
- ACA Marketplace eligible (self-employed, retiree-before-Medicare, between-jobs).
- Medicare-eligible spouse but pre-65 spouse needs separate coverage.

## Inputs needed

- All available plan options: monthly premium (employee-only and family tier), deductible, out-of-pocket max (OOPM), copay / coinsurance structure, in-network vs out-of-network, prescription tier costs.
- Whether plan is HDHP-qualified (deductible meets IRS HSA-eligible HDHP minimum — $1,650 self / $3,300 family for 2025, check current year).
- Household composition: ages, any chronic conditions, planned procedures, expected scripts.
- Last 12 months actual medical utilization (visits, ER, scripts, procedures) — proxy for next 12 months unless known reason to differ (planned pregnancy, planned surgery, new chronic dx).
- Marginal tax rate (federal + FICA + state) — drives HSA tax-benefit math.
- For ACA Marketplace: household MAGI estimate (eligibility for Premium Tax Credit + cost-sharing reduction tier 100-250% FPL).

## Workflow

### 1. Set the utilization assumption
- Pull last 12 months: count of routine visits, specialist visits, ER visits, lab work, imaging, scripts, any procedures.
- Convert to estimated allowed-amount dollars. (Allowed amount = what the network has agreed; the user pays a share of that, not the chargemaster price.)
- Apply known upcoming events (planned surgery, expected pregnancy, new chronic condition treatment).
- Output: low / base / high utilization scenarios.

### 2. Compute expected total cost per plan
- **Total cost** = annual premium + expected OOP at base utilization − HSA tax benefit (if HSA-eligible plan).
- **Stress test** at high-utilization scenario to find the OOPM — that's the worst case per plan.
- **HSA tax benefit** = HSA contribution × marginal tax rate (federal + FICA-on-employer-payroll-deduction-only + state). For someone in 24% federal + 7.65% FICA + 5% state = ~36% benefit on every dollar contributed.

### 3. HDHP + HSA vs PPO trade-off
- HDHP wins for: healthy households who can fund the HSA at the family-tier limit ($8,550 for 2025 plus $1,000 catch-up if 55+), and who don't expect to hit the OOPM.
- PPO wins for: predictable-high-utilization households, families with young children needing many sick visits, anyone needing many specialists, anyone with expensive non-generic scripts.
- HMO wins for: tight-budget households comfortable with single-PCP gatekeeping and a limited regional network.
- The HSA tax benefit can flip the analysis: even with similar gross premium + OOP, the HDHP can be the lowest after-tax option for a high-income household.

### 4. ACA Marketplace specifics (if applicable)
- Premium Tax Credit (PTC) makes Marketplace premiums income-based; "subsidy cliff" was extended through 2025 by IRA (no upper-income cliff currently, capped at 8.5% of income; verify current law).
- **MAGI levers**: increasing 401(k), HSA, traditional IRA contributions; deductible self-employed health insurance; FSA contributions — all reduce MAGI and increase PTC.
- **Cost-Sharing Reduction (CSR)**: extra subsidy at 100-250% FPL — silver-plan only. Below 250% FPL, almost always choose Silver (CSR makes silver effectively a platinum-equivalent OOP structure).
- **Reconcile at tax time**: Form 8962. If actual income > estimate, PTC clawback up to repayment cap (or full repayment above 400% FPL).

### 5. Cobra vs ACA Marketplace decision
- After job loss / job change: Cobra is the employer plan continued, full premium + 2% admin fee = 102% × group-rate cost (often $700-1,500/month single, $2,000-2,500/month family).
- ACA Marketplace at full price often comparable; with PTC at low post-job-loss income, almost always cheaper than Cobra.
- **Special enrollment period**: 60 days from job loss to enroll in Marketplace. Cobra election doesn't extend the SEP — you can switch to Marketplace within the 60-day SEP, but missing it locks you in until next open enrollment.
- Cobra wins when: mid-year deductible already met, planned upcoming high-cost care, or specific provider only in employer network.

## Output

- Plan-by-plan expected total cost table (base case + worst case).
- HSA tax-benefit calculation if HDHP option.
- ACA PTC eligibility and projected monthly cost.
- Recommendation with reasoning and the conditions that would flip it.
- HSA contribution recommendation if HDHP selected.

## Citations / sources

- Plan documents: Summary of Benefits and Coverage (SBC) — every plan must provide.
- IRS Pub 969 (HSA rules), IRS Pub 502 (medical and dental expenses).
- HDHP / HSA-eligibility thresholds: IRS Revenue Procedure (annual).
- ACA Premium Tax Credit: IRC §36B; healthcare.gov for current FPL / subsidy structure.

## Disclaimer

Analysis only. Network-coverage and formulary details change; verify your specific providers and prescriptions are covered on the chosen plan BEFORE election. For Medicare-eligible household members, route to Medicare & IRMAA Review (`md_ih_skill_medicare_irmaa_review`).
