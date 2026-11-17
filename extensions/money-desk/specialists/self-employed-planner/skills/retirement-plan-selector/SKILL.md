## Retirement Plan Selector

description: For a self-employed individual (sole prop / single-member LLC / S-corp owner), compare Solo 401(k) vs SEP IRA vs SIMPLE IRA vs Defined Benefit / Cash Balance plan. Compute contribution limits at the user's net SE income, surface Roth availability, deadlines (open-by vs fund-by), and admin complexity. Recommends a primary plan with reasoning.

## When to use

- New 1099 income with no plan yet.
- Already-have-SEP user with growing income (Solo 401(k) often becomes the better choice).
- Spouse-only business considering Solo 401(k) with spouse contribution doubling effective limit.
- Very-high-income consultant (>$300k net) considering Defined Benefit / Cash Balance for $100k+ contributions.

## Inputs needed

- Net SE income (Schedule C line 31, or K-1 SE-earnings, or S-corp W-2 wages).
- Entity (sole prop / single-member LLC / S-corp / partnership).
- Whether ANY employees exist beyond owner+spouse (changes everything — Solo 401(k) ineligible).
- Age (50+ unlocks catch-up).
- Whether the user wants Roth contributions in the plan.
- Any other current-year W-2 401(k) deferrals (employee deferral limit is per-PERSON across all plans).
- Current-year projection vs prior-year actual (deadlines differ).

## Workflow

1. **Disqualify ineligible plans.** Solo 401(k) requires no W-2 employees other than owner+spouse. SEP IRA accepts employees but requires equal contributions for all (expensive). SIMPLE IRA suits 1–100 employees with 3% match obligation.
2. **Compute contribution headroom by plan**, using the **md_facts `irs_contribution_limits` keys** named in Determinism rules (cite the source — IRS Notice / Pub 560):
   - **Solo 401(k):**
     - Employee deferral: `401k_employee_deferral` (Roth or pre-tax), + `401k_employee_deferral_catchup_age_50_plus` if 50–59 or 64+, or `401k_employee_deferral_catchup_age_60_to_63_secure_2_0` if 60–63 (SECURE 2.0).
     - Employer profit-sharing: up to 25% of net SE compensation (sole prop: 20% of net SE earnings after 1/2 SE tax). Combined limit `401k_total_415c_limit_employee_plus_employer`, plus the applicable catch-up.
     - Mega backdoor Roth (after-tax + in-plan Roth conversion) IF the plan document supports it (most Solo 401(k) prototypes do NOT — flag this; need a custom plan).
   - **SEP IRA:**
     - Lesser of 25% of net SE compensation (20% of net SE earnings after ½ SE tax for sole props) or `sep_ira_employer_max`. No employee deferral. No catch-up. No Roth (until SECURE 2.0 SEP Roth — confirm provider supports).
   - **SIMPLE IRA:**
     - Employee deferral `simple_ira_employee_deferral` + `simple_ira_catchup_age_50_plus` at 50; employer 3% match or 2% nonelective. Lower ceiling than Solo 401(k).
   - **Defined Benefit / Cash Balance:**
     - Actuarially determined; can exceed $200k/yr for older high-earners; requires actuary, formal plan doc, vesting schedule. Worth analyzing at $300k+ net SE (Decision rule 4).
3. **Compute net-SE-comp adjusted contribution.**
   - Sole prop / single-member LLC: "net SE compensation" = Sch C net − 1/2 SE tax − employer retirement contribution itself (circular; use the IRS Pub 560 deduction worksheet).
   - S-corp owner: employer contribution based on W-2 wages (not on K-1 distribution). This often *reduces* total contribution capacity vs sole-prop — surface this trade-off.
4. **Deadlines.**
   - **Solo 401(k)**: Plan must be ESTABLISHED by Dec 31 of the contribution year (SECURE Act 2019 softened for sole prop: can establish by tax filing deadline for the employer contribution portion; employee deferral still typically Dec 31 designation). Funded by tax-filing deadline + extensions.
   - **SEP**: Establish and fund by tax-filing deadline including extensions (Apr 15 / Oct 15).
   - **SIMPLE**: Establish between Jan 1 and Oct 1; funding deadlines per the plan document.
   - **DB**: Establish by Dec 31 (with extensions in some cases); funded by tax deadline.
5. **Recommendation matrix** (the binding order is Determinism rules → Decision rules).
   - Low / variable SE income, no W-2 retirement saving: **Solo 401(k)** (employee deferral helps even at low income).
   - Wants Roth: **Solo 401(k)** with Roth option.
   - Want to avoid Form 5500 paperwork (>$250k plan assets triggers 5500-EZ): **SEP** is paper-free; Solo 401(k) requires 5500-EZ once over threshold.
   - Has even one W-2 employee: **SEP** (must cover) or **SIMPLE** (cheaper coverage).
   - $300k+ net SE, age 45+, predictable income: add **Cash Balance** plan on top of Solo 401(k).

## Required citations

- All dollar limits cite the IRS publication / current-year tax inflation announcement.
- Net SE comp calculation cites IRS Pub 560 worksheet.
- Deadline rules cite the SECURE Act / SECURE 2.0 relevant section if discussing recent changes.

## Deliverable shape

Markdown report `./money-desk/self-employed-planner/retirement-plan-<YYYYMMDD>.md`:
- **Headline recommendation** — e.g., "Open a Solo 401(k) with Roth at Fidelity/Schwab/E*TRADE; deferral ${deferral} Roth + employer ${employer} pre-tax = ${total} at your ${net} net SE income."
- **Contribution math table** — each plan, employee piece, employer piece, total, % of net SE.
- **Deadline table** — open-by vs fund-by for each plan.
- **Pros/cons table** — Roth available, paperwork, employee impact.
- **Action checklist** — which custodian (cite — major: Fidelity Solo 401(k), Schwab Individual 401(k), E*TRADE), forms to file (SS-4 EIN if needed), Dec 31 deadline reminder.

## Notes

- The SECURE 2.0 super-catch-up (60–63) is new — only relevant for users in that band; cite the rule.
- Solo 401(k) Roth contributions don't have the income phase-outs that Roth IRAs do — major win for high-earning consultants.
- SEP IRA contributions count as "employer" only, no employee deferral — so at the same net SE income the SEP gets only the employer piece while the Solo 401(k) adds the full employee deferral on top. The Solo 401(k) usually wins below the 25%-of-comp cap.
- If converting a SEP to a Solo 401(k) mid-year, plan timing carefully — same-year SEP contributions count against the §415(c) aggregate (`401k_total_415c_limit_employee_plus_employer`).

## Determinism rules

### Input keys

- `entity` — `sole_prop` | `smllc` | `s_corp` | `partnership`
- `net_se_income_usd` — number; Schedule C line 31 / K-1 SE earnings (sole prop, SMLLC, partnership)
- `s_corp_w2_wages_usd` — number; owner's W-2 wages from the S-corp (S-corp only)
- `other_ss_wages_usd` — number; other W-2 Social Security wages; default 0
- `age` — integer, age on Dec 31 of the tax year
- `non_spouse_employees` — integer; W-2 employees other than owner and spouse; default 0
- `wants_roth` — bool
- `other_401k_deferrals_usd` — number; employee deferrals already made to any other 401(k)/403(b) this year; default 0
- `plan_assets_usd` — number; current balance in an existing one-participant plan; default 0
- `income_stable_3yr` — bool; net SE income within ±20% for each of the last 3 years
- `tax_year` — integer

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Net SE income (or S-corp W-2 wages), age, employees | **Ask — no default** | — |
| 401(k) employee deferral | `md_facts` → `irs_contribution_limits.401k_employee_deferral` | `[IRS 2026 limits]` |
| 401(k) catch-up | `md_facts` → `irs_contribution_limits.401k_employee_deferral_catchup_age_50_plus` (ages 50–59 and 64+); `401k_employee_deferral_catchup_age_60_to_63_secure_2_0` (ages 60–63, replaces the 50+ amount) | `[IRS 2026 limits]` |
| Annual additions limit (§415(c)) | `md_facts` → `irs_contribution_limits.401k_total_415c_limit_employee_plus_employer` | `[IRS 2026 limits]` |
| SEP maximum and compensation cap | `md_facts` → `irs_contribution_limits.sep_ira_employer_max`, `sep_ira_compensation_cap` | `[IRS 2026 limits]` |
| SIMPLE deferral and catch-up | `md_facts` → `irs_contribution_limits.simple_ira_employee_deferral`, `simple_ira_catchup_age_50_plus` | `[IRS 2026 limits]` |
| SS wage base and rates (for half-SE) | `md_facts` → `social_security_2026.wage_base`, `fica_employee_rate`, `medicare_employee_rate` | `[SSA 2026]` |
| Employer contribution rate | 25% of W-2 wages (S-corp); 20% of (net SE − half SE tax) for sole prop = 25% net of the contribution (IRS Pub 560) | — |
| SIMPLE employer contribution | 3% match of compensation (the plan's default; 2% nonelective is the alternative) | `[ASSUMPTION]` |
| Form 5500-EZ trigger | Plan assets > $250,000 (statutory, this skill) | — |
| Defined Benefit / Cash Balance contribution | Not computed — actuarial; **Ask** for an actuary quote | — |

### Calculation method

Compute in cents; report whole dollars. md_facts rates are decimals.

1. **Plan compensation `C`.**
   - Sole prop / SMLLC / partnership: `b = net_se_income_usd × 0.9235`; `se_tax = 2 × fica_employee_rate × min(b, max(0, wage_base − other_ss_wages_usd)) + 2 × medicare_employee_rate × b`; `C = net_se_income_usd − se_tax / 2`; employer rate `e = 0.20`.
   - S-corp: `C = s_corp_w2_wages_usd`; `e = 0.25`.
   - Cap: `C = min(C, sep_ira_compensation_cap)` for the employer-contribution calculation.
2. **Catch-up `K`**: age 60–63 → 60–63 amount; age ≥ 50 otherwise → 50+ amount; else 0.
3. **Solo 401(k)** (skip if `non_spouse_employees > 0`):
   - `deferral = min(401k_employee_deferral − other_401k_deferrals_usd, C)` (floor 0).
   - `employer = min(e × C, 415c_limit − deferral)` (floor 0); also `deferral + employer ≤ C`.
   - `catch_up = min(K, C − deferral − employer)` (floor 0).
   - `solo_total = deferral + employer + catch_up`.
4. **SEP IRA:** `sep_total = min(e × C, sep_ira_employer_max)`. (Must also cover eligible employees at the same %.)
5. **SIMPLE IRA:** `simple_def = min(simple_ira_employee_deferral, C)`; `simple_cu = min(simple_ira_catchup_age_50_plus if age ≥ 50 else 0, C − simple_def)`; `simple_er = 0.03 × C`; `simple_total = simple_def + simple_cu + simple_er`.
6. **Percent of net** for each plan = total / `net_se_income_usd` (or W-2 wages for S-corp), one decimal place.
7. **5500-EZ flag** if a 401(k) is chosen and `plan_assets_usd + solo_total > $250,000`.
8. **Deadlines** column per plan, from the Workflow step 4 rules (no other dates).

### Decision rules

Evaluate top to bottom; the first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | Net SE income / W-2 wages or age missing | No recommendation — ask |
| 2 | `non_spouse_employees > 0` and `≤ 100` | SIMPLE IRA (cheapest employee coverage); SEP as alternative; Solo 401(k) ineligible |
| 3 | `non_spouse_employees > 100` | Out of scope — refer to a plan consultant |
| 4 | `net_se_income_usd ≥ $300,000` and `age ≥ 45` and `income_stable_3yr = true` | Solo 401(k) **plus** Cash Balance plan — get an actuary quote |
| 5 | `wants_roth = true` | Solo 401(k) with Roth deferrals |
| 6 | `solo_total > sep_total` | Solo 401(k) |
| 7 | Otherwise (`solo_total ≤ sep_total`) | SEP IRA — same capacity, no 5500-EZ |

### Output template

```markdown
# Retirement Plan Selector — {tax_year}

## Headline recommendation
**{plan}** (rule #{n}) — deferral ${deferral} {Roth|pre-tax} + employer ${employer} + catch-up ${catch_up} = **${total}** at ${net_se_income_usd} net SE income.

## Contribution math
| Plan | Employee piece | Employer piece | Catch-up | Total | % of net |
|---|---|---|---|---|---|
| Solo 401(k) | | | | | |
| SEP IRA | — | | — | | |
| SIMPLE IRA | | | | | |
| Defined Benefit / Cash Balance | Not computed — actuarial | | | | |

## Compensation base
{step-1 arithmetic: net SE → half SE tax → plan compensation C}

## Deadline table
| Plan | Establish by | Fund by |
|---|---|---|

## Pros / cons
| Plan | Roth available | Paperwork (5500-EZ) | Employee impact |
|---|---|---|---|

## Action checklist
- {custodian, EIN (SS-4) if needed, plan adoption deadline, 5500-EZ flag}

## Assumptions & flags
- {md_facts keys used, [ASSUMPTION] items}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
