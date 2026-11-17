# Investment Policy Statement (IPS)

description: Draft a one-page personal Investment Policy Statement that codifies goals, time horizon, target allocation, rebalancing rules, contribution plan, and behavioral guardrails. The IPS is the pre-commitment device that prevents emotion-driven trading during market stress.

## When to use

- User is setting up their long-term investing approach (first time, post-windfall, post-job-change).
- User has been ad-hoc trading and wants discipline.
- After major life event (marriage, retirement, inheritance).
- Annually as part of the annual review.

## Inputs needed

- Goals (retirement, FI, kids' college, home down payment) with $ targets and dates.
- Time horizon for each goal.
- Risk tolerance — both stated AND implied by reaction to past drawdowns (be skeptical of "high" tolerance from users who haven't lived through one).
- Income, savings rate, account types available (401k, IRA, taxable, HSA).
- Constraints (concentrated employer stock, illiquid holdings, ESG preferences, religious restrictions).

## Workflow

1. **Goals & horizons.** List each goal, target $, target date, priority (must-have vs nice-to-have).
2. **Target allocation.** Stocks/bonds/cash split per goal-horizon from the horizon table in **Determinism rules** (e.g. a 5-year house goal → 30/70). Sub-targets: US/international, large/small, factor tilts. Justify each number.
3. **Account placement (tax location).** Default rule: bonds & REITs in tax-deferred, broad equities in Roth (most growth potential) and taxable (LTCG + step-up), international in taxable (foreign tax credit). Modify per situation.
4. **Investment vehicles.** Specify fund universe (e.g. "Vanguard or Fidelity index funds with ER ≤ 0.10%, target-date or 3-fund portfolio"). NAME the funds.
5. **Contribution plan.** Monthly amounts to each account, in what order (match → HSA → Roth → 401k → taxable).
6. **Rebalancing rules.** Annual calendar check plus a band of ±5 pp absolute or ±20% relative, whichever is tighter (Determinism rules step 6). Where possible, rebalance with new contributions or in tax-advantaged accounts to avoid capital gains.
7. **Behavioral guardrails.** Pre-commit:
   - "I will not check accounts more than monthly."
   - "I will not sell during a > 20% drawdown."
   - "I will not chase last year's winner."
   - "Major changes only at annual review or after a major life event."
8. **Review cadence.** Annual full review; quarterly progress check; ad-hoc only on life events.

## Required citations

- Each constraint (e.g. employer stock concentration) cites the holding/account.
- Risk-tolerance basis cites either a questionnaire or a stated past behavior.

## Deliverable shape

- Markdown IPS `./money-desk/investing-advisor/ips-<YEAR>.md`, one page printable:
  - Goals table.
  - Target allocation table (with current).
  - Account placement matrix.
  - Contribution waterfall.
  - Rebalancing rule (one sentence).
  - Behavioral rules (numbered list).
  - Signature line + date.

## Notes

- An IPS is only useful if the user signs it (literally) and re-reads it in market stress. Encourage printing.
- "Analysis only. Not professional investment advice."

## Determinism rules

### Input keys

- `goals` — list of `{ name, target_usd, target_date_yyyy_mm, priority }`; `priority` ∈ `must_have` | `nice_to_have`
- `current_age` — integer
- `risk_tolerance` — `conservative` | `moderate` | `aggressive`
- `drawdown_behavior` — `held` | `bought_more` | `sold` | `no_experience`
- `account_types` — list of `401k` | `403b` | `457b` | `traditional_ira` | `roth_ira` | `taxable` | `hsa` | `529`
- `monthly_savings_usd` — number
- `employer_match` — string, e.g. "100% up to 4%" (or `none`)
- `hdhp_enrolled` — boolean
- `fund_family` — `vanguard` | `fidelity` | `schwab` | `other` (where the accounts live)
- `current_allocation` — optional `{ equity_pct, bond_pct, cash_pct }`
- `constraints` — free text (employer stock, illiquid holdings, ESG, religious screens)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Goals, target $, dates, priorities | **Ask — no default** | — |
| Risk tolerance, drawdown behavior | **Ask — no default** | — |
| Long-horizon (> 10 y) equity % | Allocation Check age rule: conservative `100 − age`, moderate `110 − age`, aggressive `120 − age`; −10 if `drawdown_behavior = sold`; nearest 5 | `[ASSUMPTION: age-based rule]` |
| Fund ER ceiling | 0.10% (index funds) | `[ASSUMPTION]` |
| Rebalancing bands | 5 pp absolute or 20% relative, whichever is tighter | `[ASSUMPTION]` |
| Contribution limits used in the waterfall | `md_facts` → `irs_contribution_limits.*` (401k, IRA, HSA keys incl. catch-ups) | `[IRS 2026 limits]` |

### Calculation method

1. **Horizon per goal:** `horizon_years = (target_date − today) in months / 12`, one decimal.
2. **Allocation per goal** from the horizon table in Decision rules (first match). Bond = `100 − equity − cash`.
3. **Sub-targets:** equity sleeve US 65 / international developed 25 / EM 10 (same default as Allocation Check) unless the user states otherwise; bonds = one total-bond fund.
4. **Vehicles:** for each sleeve, name one fund from `fund_family` with ER ≤ 0.10% (fetch the ER live via `md_sources`); if none qualifies, name the cheapest and flag it. If the user prefers one fund, a target-date fund whose equity % is within 5 pp of the goal's target may replace the sleeves.
5. **Contribution waterfall** (fixed order, each capped by the `md_facts` limit for the user's age): employer match → HSA (if `hdhp_enrolled`) → Roth IRA → 401(k) to the limit → taxable. Allocate `monthly_savings_usd × 12` top-down; report $/month per account rounded to whole dollars.
6. **Rebalancing rule:** check on the user's chosen annual date and whenever a sleeve breaches `band = min(5, 0.20 × target_pct)`; rebalance with new contributions first, then inside tax-advantaged accounts, then taxable.
7. **Behavioral rules:** the four pre-commitments listed in Workflow step 7, verbatim, plus "I will rebalance, not sell, after a ≥ 20% drawdown."
8. Rounding: whole percents for targets, whole dollars for money.

### Decision rules

Allocation per goal by horizon — evaluate top to bottom; the first match wins.

| # | Condition | Equity / Bond / Cash |
|---|---|---|
| 1 | `horizon_years < 3` | 0 / 0 / 100 (cash or Treasury bills) |
| 2 | `3 ≤ horizon_years < 5` | 20 / 80 / 0 |
| 3 | `5 ≤ horizon_years ≤ 10` | 30 / 70 / 0 (40 / 60 / 0 if `nice_to_have`) |
| 4 | Retirement / FI goal with `horizon_years > 10` | Age rule from Assumptions |
| 5 | Otherwise (`horizon_years > 10`, non-retirement) | Age rule from Assumptions, capped at 80 / 20 / 0 |

### Output template

```markdown
# Investment Policy Statement — {name}, {YYYY}

## 1. Goals
| Goal | Target $ | Target date | Horizon (yrs) | Priority |
|---|---|---|---|---|

## 2. Target allocation
| Goal | Equity % | Bond % | Cash % | Current (if known) | Rule # |
|---|---|---|---|---|---|

## 3. Account placement
| Asset | Preferred account | Reason |
|---|---|---|

## 4. Investment vehicles
| Sleeve | Fund (ticker) | ER (as-of) |
|---|---|---|

## 5. Contribution waterfall
| Order | Account | $/month | Annual limit (md_facts) |
|---|---|---|---|

## 6. Rebalancing rule
{one sentence with the date and the band}

## 7. Behavioral rules
1. {rule}

## 8. Review cadence
Annual full review on {date}; quarterly progress check; ad-hoc only on life events.

## Signature
Signed: ____________________  Date: __________
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
