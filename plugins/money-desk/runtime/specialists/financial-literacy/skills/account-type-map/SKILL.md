## Account Type Map

description: Visual hierarchy of every common US personal-finance account — checking, HYSA, money market, brokerage, traditional 401(k), Roth 401(k), traditional IRA, Roth IRA, HSA, FSA, 529, custodial UTMA / UGMA, I-Bonds, CDs — with what each is FOR (purpose), the tax treatment (in / growth / out), and the typical placement order. The "I have an extra $500 — where should it go?" decoder ring.

## When to use

- "I have an extra $500 a month — where should it go?"
- User has never heard of half the account types and wants the map before making any account decisions.
- User is opening a new account and needs to pick a type.
- Before running **Contribution Optimizer** (Retirement Planner) — set the conceptual map first, then run the per-user waterfall.

## Inputs needed

- None required. (User's situation lets us emphasize what's relevant — but the map itself is universal.)
- Optional: current accounts the user already has, so the map can show "you're already using X; next step is Y".

## The map (memorize this shape)

Four families × tax-treatment matrix:

| Family | Account | Tax IN | Tax GROWTH | Tax OUT | Annual limit (`md_facts` → `irs_contribution_limits` key unless noted) |
|---|---|---|---|---|---|
| **Spending** | Checking | Taxed | n/a (no growth) | Taxed (if interest) | no limit |
| **Short-term savings** | HYSA / Money Market | Taxed | Taxed annually | Taxed annually | no limit |
| **Short-term savings** | CD | Taxed | Taxed annually | Taxed annually + early-withdraw penalty | no limit |
| **Short-term savings** | Series I Bonds | Taxed | Tax-deferred federal, no state | Federal taxed at redemption (state-free); education exclusion possible | $10k/yr electronic — not in `md_facts`; verify on TreasuryDirect `[UNSOURCED]` |
| **Long-term taxable** | Brokerage | Taxed | LTCG/qual div preferential rate | LTCG/qual div preferential rate | no limit |
| **Retirement — pre-tax** | Traditional 401(k) / 403(b) | Deducted | Tax-deferred | Taxed as ordinary income | `401k_employee_deferral` + `401k_employee_deferral_catchup_age_50_plus` (50+) or `…_catchup_age_60_to_63_secure_2_0` (60–63) |
| **Retirement — pre-tax** | Traditional IRA (deductible) | Deducted (income-limited if covered by employer plan) | Tax-deferred | Taxed as ordinary income | `ira_traditional_or_roth` + `ira_catchup_age_50_plus` |
| **Retirement — Roth** | Roth 401(k) | Taxed | Tax-free | Tax-free if 5+ yr + 59½ | `401k_employee_deferral` + catch-up as above |
| **Retirement — Roth** | Roth IRA | Taxed (income-limited; Backdoor if over) | Tax-free | Tax-free if 5+ yr + 59½; contributions accessible anytime | `ira_traditional_or_roth` + `ira_catchup_age_50_plus` |
| **Health** | HSA (HDHP-only) | Deducted | Tax-free | Tax-free for qualified medical (any age); ordinary income for non-medical 65+ | `hsa_self_only` / `hsa_family` + `hsa_catchup_age_55_plus` (55+) |
| **Health** | FSA | Deducted | n/a (use-it-or-lose-it) | Tax-free for qualified medical | `fsa_healthcare` |
| **Education** | 529 | Taxed federal (state deduction in ~30 states) | Tax-free | Tax-free for qualified education | no federal limit; gift exclusion `estate_and_gift_2026.annual_gift_exclusion_per_donee`/yr; 5× that with the 5-yr front-load election |
| **Kids' wealth** | Custodial UTMA / UGMA | Taxed (kiddie tax may apply on growth) | Kiddie tax | Taxed (kiddie-tax bands) | n/a |

> All limits are 2026 — re-verify with `md_facts` before quoting numbers to a user.

## The typical placement order (default waterfall)

1. **Stabilize.** Checking with 1 month essentials + minimum payments on all debt.
2. **Free money.** 401(k) up to the full employer match. (Most common 100% return you'll ever get.)
3. **Kill toxic debt.** Any debt with APR > 8% gets paid off before further investing.
4. **HSA max** (if HDHP-enrolled) — triple-tax-advantaged, the best account in the code.
5. **Roth IRA** (or Backdoor Roth if over the income limit).
6. **Rest of 401(k)** up to the employee limit (`md_facts` → `irs_contribution_limits.401k_employee_deferral`).
7. **Emergency fund** to 3-6 months essentials. (Most teachers say "fund this first"; behavioral evidence says people who fund their emergency fund first never get to step 2-6 because life keeps eating it. Two months in the HYSA, then back to the waterfall, is the modern compromise.)
8. **Mega Backdoor Roth** (if your 401(k) plan supports after-tax + in-plan conversion) — up to `401k_total_415c_limit_employee_plus_employer` − `401k_employee_deferral` − employer contributions of extra Roth space.
9. **Taxable brokerage** for anything past step 8 or for goals before age 59½.
10. **529** for kids' education (some states give an immediate deduction — capture that first even before step 7-8 if your state offers it).

> This is the *default*; per-user override is what **Contribution Optimizer** (Retirement Planner) does with your actual numbers.

## Workflow

1. Show the map (table above).
2. Show the placement order (10 steps above).
3. If the user shared what accounts they already have, **mark where they are on the ladder** and identify the next 1-2 unfilled rungs.
4. Hand off:
   - To run the personalized waterfall with their actual income / match / debt → **Contribution Optimizer** (Retirement Planner).
   - To understand any single line on the map → **Concept Explainer**.
   - To decide HDHP vs PPO (which unlocks the HSA) → **Health Plan Selector** (Health & Medicare).

## Output conventions

- Lead with the table; people remember structure.
- Always cite limits as of the current year and pull from `md_facts`.
- Use plain language for "what it's FOR" — not "tax-advantaged accumulation vehicle"; say "money for retirement you won't touch until 60+".

## Citations

- 2026 limits → `md_facts` (cite `[IRS 2026 limits]`).
- IRS Pub 590-A (IRAs), Pub 969 (HSAs), Pub 970 (education accounts).
- Bogleheads Wiki "Prioritizing investments" article (the canonical waterfall reference).

## Disclaimer

Educational map only. The personalized order — especially the trade-offs between Roth vs Traditional, when to skip the 529 in favor of a flexible taxable, and how to handle ESPP / RSU concentrated stock — is **Contribution Optimizer**'s job.

## Determinism rules

### Input keys

- `existing_accounts` — list of account types from the map (e.g. `checking`, `hysa`, `traditional_401k`, `roth_ira`, `hsa`, `529`), or empty
- `age` — integer or null (catch-up columns)
- `has_employer_match` — boolean or null; `contributing_to_match` — boolean or null
- `hdhp_enrolled` — boolean or null
- `highest_debt_apr_pct` — number or null
- `emergency_fund_months` — number or null (months of essentials in cash)
- `plan_allows_after_tax_and_conversion` — boolean or null
- `has_children` — boolean or null; `state_529_deduction` — boolean or null

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| All personal fields | Not required — the map is universal; unknown rungs are shown as "unknown" | — |
| 401(k)/403(b) limit and catch-ups | `md_facts` → `irs_contribution_limits.401k_employee_deferral`, `401k_employee_deferral_catchup_age_50_plus`, `401k_employee_deferral_catchup_age_60_to_63_secure_2_0` | `[IRS 2026 limits]` |
| IRA limit and catch-up | `md_facts` → `irs_contribution_limits.ira_traditional_or_roth`, `ira_catchup_age_50_plus` | `[IRS 2026 limits]` |
| HSA limits | `md_facts` → `irs_contribution_limits.hsa_self_only`, `hsa_family`, `hsa_catchup_age_55_plus` | `[IRS 2026 limits]` |
| Health FSA limit | `md_facts` → `irs_contribution_limits.fsa_healthcare` | `[IRS 2026 limits]` |
| 529 gift exclusion / 5-year front-load | `md_facts` → `estate_and_gift_2026.annual_gift_exclusion_per_donee` (front-load = 5 ×) | `[IRS Estate 2026]` |
| Mega Backdoor Roth space | `md_facts` → `401k_total_415c_limit_employee_plus_employer` − `401k_employee_deferral` − employer contributions (**Ask** employer amount) | `[IRS 2026 limits]` |
| I-Bond annual purchase limit | Not in md_facts — TreasuryDirect via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |
| Roth IRA income phase-out | Not in md_facts — IRS Pub 590-A via `md_sources`, else `[UNSOURCED]` | `[UNSOURCED]` |

### Calculation method

1. Call `md_facts` once and fill every "Annual limit" cell from the keys above — never from the table text.
2. Render the map table in the fixed row order shown in "The map".
3. Render the 10-step waterfall in the fixed order shown.
4. **Rung status** for each step, using the inputs:
   1. Stabilize — done if `existing_accounts` contains `checking`.
   2. Free money — done if `contributing_to_match = true`; N/A if `has_employer_match = false`.
   3. Toxic debt — done if `highest_debt_apr_pct` ≤ 8 or null-with-user-saying-no-debt.
   4. HSA — N/A if `hdhp_enrolled = false`; done if `hsa` in accounts and user says maxed.
   5. Roth IRA — done if `roth_ira` in accounts.
   6. Rest of 401(k) — done only if user states they contribute the full limit.
   7. Emergency fund — done if `emergency_fund_months` ≥ 3.
   8. Mega Backdoor — N/A if `plan_allows_after_tax_and_conversion` ≠ true.
   9. Taxable brokerage — done if `brokerage` in accounts.
   10. 529 — N/A if `has_children` ≠ true.
   Unknown input → status "unknown".
5. **Next rungs** = the first two steps (in order) whose status is not done and not N/A. Unknown counts as not done.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Condition | Hand-off |
|---|---|---|
| 1 | User asks "which is best for me" / wants amounts | **Contribution Optimizer** (Retirement Planner) |
| 2 | Next rung is HSA and `hdhp_enrolled` is null | **Health Plan Selector** (Health & Medicare) |
| 3 | `has_children = true` and `state_529_deduction = true` and step 10 not done | Flag the 529 state-deduction exception: capture it before steps 7–8 |
| 4 | User asks about a single account's mechanics | **Concept Explainer** (Financial Literacy) |
| 5 | Otherwise | Show next 2 rungs; hand off to **Contribution Optimizer** |

### Output template

```markdown
# Account Type Map — {tax year}

## The map
| Family | Account | Tax IN | Tax GROWTH | Tax OUT | Annual limit ({year}, md_facts) |
|---|---|---|---|---|---|

## The default waterfall
| Step | Rung | Your status |
|---|---|---|
| 1 | Stabilize | |
| 2 | Free money (match) | |
| 3 | Kill debt > 8% APR | |
| 4 | HSA max | |
| 5 | Roth IRA | |
| 6 | Rest of 401(k) | |
| 7 | Emergency fund 3–6 months | |
| 8 | Mega Backdoor Roth | |
| 9 | Taxable brokerage | |
| 10 | 529 | |

## Where you are
Next rung(s): {step #, step #} — or "Not applicable — no personal accounts shared"

## Next step
{ONE hand-off from the Decision rules}
```

## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./money-desk/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./money-desk/_renderers/` on first use).