## Pre-65 Healthcare Plan

description: The pre-Medicare gap is the #1 FIRE blocker. Map the user's options — employer-sponsored COBRA bridge, ACA Marketplace with premium subsidies (managed via MAGI), HSA stacking, MediShare and direct-primary-care alternatives, spouse-coverage piggyback. Output: which option(s) fit, the MAGI ceiling that maximizes subsidies, the annual cost estimate, and the explicit handoff to Health & Medicare for plan-by-plan comparison. STRATEGY only — actual enrollment is Health & Medicare's job.

## When to use

- "What about healthcare before Medicare?"
- "Can I afford to retire at 50 without employer health insurance?"
- "How do ACA subsidies actually work for FIRE'd households?"
- Always invoke alongside **Pre-59½ Bridge Strategy** — the MAGI ceiling these two share is usually the binding constraint.

## Inputs needed

- **FIRE age** and **spouse FIRE age** (if applicable).
- **Years pre-65 to cover** for each household member.
- **Household size and ages** (kids on plan? aging out at 26?).
- **Health condition flags** — chronic conditions, expensive medications, planned procedures.
- **State** (ACA Marketplace differs; some states expanded Medicaid, some didn't; the subsidy math differs).
- **Target annual taxable income post-FIRE** — the user's MAGI lever.
- **Current HSA balance**.
- **Geographic flexibility** — open to moving to lower-cost-of-care state? (Some FIRE'd households domicile for healthcare.)

## The five bridge mechanisms

### 1. ACA Marketplace + premium subsidies (most common)

- **Mechanism:** Buy Marketplace plan on healthcare.gov (or state exchange). Subsidies are based on **MAGI** as % of Federal Poverty Level (FPL). Under the IRA 2022 / 2025 enhanced subsidies (cite current law year), the 400% FPL "cliff" was replaced with a phase-out capping premiums at 8.5% of MAGI — verify whether this regime is still in force for the user's plan year.
- **Critical lever:** MAGI is the input. Roth conversions, realized cap gains, dividends, interest — all push MAGI up and can reduce or eliminate subsidies.
- **Sweet spots (verify for current year):** ~150% FPL (silver-plan CSR enhanced cost-sharing kicks in), staying under the legacy 400% FPL cliff if enhanced subsidies sunset.
- **Cost in FIRE-optimal MAGI band:** can be very low for a family of 4 in the right MAGI band; for high-MAGI households, full premium.
- **Owner of plan-by-plan comparison:** **Health & Medicare**.

### 2. COBRA bridge (short-term)

- **Mechanism:** Continue employer plan post-separation for 18 months (29 months in some disability cases, 36 months for some dependents). Full premium + 2% admin fee — typically $700–2,500/mo per person.
- **Fits:** Recently FIRE'd household with health condition mid-treatment, planned procedure pre-FIRE, or buying time to set up ACA.
- **Cost:** high; usually a stopgap, not a multi-year solution.

### 3. Spouse coverage piggyback

- **Mechanism:** One spouse keeps working (potentially part-time / barista-FIRE) to maintain employer coverage for the household.
- **Fits:** Couples where one spouse genuinely enjoys their work and family-coverage cost is reasonable.
- **Cost:** "free" if the spouse was working anyway; high opportunity cost otherwise.

### 4. Direct Primary Care (DPC) + catastrophic coverage

- **Mechanism:** Pay a monthly DPC membership ($50–150/mo) for unlimited primary care, plus a high-deductible catastrophic plan for hospital / specialist. Total often less than ACA Bronze.
- **Fits:** Generally healthy households comfortable with paying cash for routine care, wanting predictable primary-care relationship.
- **Watch:** Catastrophic plans have very limited availability under ACA — must qualify (under 30, OR have a hardship exemption). Otherwise the cheaper plan is Bronze.

### 5. Health-sharing ministries (MediShare, CHM, Samaritan)

- **Mechanism:** Member-funded sharing pool. Lower monthly cost than ACA. NOT insurance — no legal guarantee of payment. Pre-existing conditions often excluded.
- **Fits:** Households comfortable with the religious-affiliation requirement, willing to accept the no-guarantee risk, generally healthy.
- **Watch:** Major pre-existing conditions or expected expensive procedure → catastrophic risk. Not appropriate for high-medical-need household.

## Workflow

1. **Compute the gap.** Years × $/year per household member. Pre-65 healthcare commonly runs $15–25k/yr for a family-of-four without ACA subsidies. With subsidies in the MAGI sweet spot, this can drop to a few thousand.
2. **Set the MAGI ceiling.** The ACA-subsidy max-benefit MAGI band is the binding constraint on the user's Roth conversion ladder and realized cap gains. Make this number explicit.
3. **Compare options at the user's actual situation.**
   - Healthy + flexible income → ACA + MAGI management is usually winner.
   - Mid-treatment / procedure scheduled → COBRA for 12–18 months, then ACA.
   - One spouse loves working → spouse plan if family-coverage cost reasonable.
   - Generally healthy + risk-tolerant → DPC + catastrophic or HSA + bronze ACA.
4. **Layer HSA.** If HDHP-eligible (ACA Bronze HDHP qualifies), max HSA. Triple tax advantage in working years, stealth IRA in retirement.
5. **Geographic factor.** Some states (NY, CA, MN) have richer state-level subsidies; some (Florida, Texas) didn't expand Medicaid and have coverage cliffs. Surface if relevant.
6. **Cost projection through 65.** Show the multi-year cost at current MAGI plan AND at the MAGI ceiling the user is targeting.
7. **Hand off enrollment to Health & Medicare.** That specialist owns the plan-by-plan selector.

## Output template

```
# Pre-65 healthcare plan — household of {N}, FIRE at {age}, bridge to 65

## Gap
- Years pre-65: {self} {N1}y, {spouse} {N2}y, {kids if relevant}
- Approximate gross annual cost without subsidies: ${...}
- Approximate annual cost in MAGI-optimized ACA: ${...}
- **Savings from MAGI management: ${...}/yr** (cite current IRA-enhanced-subsidy regime status)

## Your MAGI ceiling
- Target MAGI band: {X}–{Y}% FPL (= ${...}–${...}/yr for household of {N} in {state})  [HHS FPL 2026]
- → Coordinates with **Pre-59½ Bridge Strategy** Roth conversion cap.

## Option fit (your situation)
| Option                       | Annual cost | Fit | Notes |
|------------------------------|-------------|-----|-------|
| ACA + MAGI management        | ${...}      | {★★★★★} | usually winner for FIRE'd households |
| COBRA (18 mo)                | ${...}      | {★}     | bridge only |
| Spouse plan                  | ${...}      | {?}    | only if spouse working |
| DPC + catastrophic           | ${...}      | {?}    | healthy + risk-tolerant only |
| Health-sharing ministry      | ${...}      | {?}    | not insurance; pre-existing risk |

## HSA stacking (if HDHP-eligible)
- Annual HSA contribution: ${current-year limit from md_facts}  [IRS 2026 limits]
- Strategy: pay medical out-of-pocket, save receipts, let HSA compound. Withdraw tax-free in retirement against accumulated receipts.

## Recommended primary
**{Option}**: estimated ${X}/yr in the {Y}% FPL band.

## Coordination required
- Roth conversion cap: ${...}  → Pre-59½ Bridge Strategy
- Realized cap-gain budget: ${...} → Withdrawal Order Optimizer
- ACA plan selection: → **Health & Medicare**

## Recommended next step
**Health & Medicare** owns plan-by-plan comparison. Hand off: "Compare ACA Bronze/Silver/Gold for household of {N} in {state}, MAGI target ${X}, expected medical spend ${Y}/yr."
```

## Common mistakes to flag

- **Ignoring MAGI as the lever.** Many FIRE'd households leave $10–20k/yr of subsidy on the table by over-converting.
- **Counting subsidies that may sunset.** The IRA-2022 enhanced subsidies were extended through 2025; verify current law for the plan year you're projecting.
- **Treating health-sharing as insurance.** It is not. Lawsuits exist for unpaid claims.
- **DPC + catastrophic without checking eligibility.** Catastrophic plans require age <30 or hardship.
- **COBRA for the entire bridge.** Almost always cheaper to switch to ACA after 1–6 months.

## Citations / sources

- **IRC §36B** — ACA premium tax credits.
- **IRA 2022 (Inflation Reduction Act)** — enhanced subsidies through 2025 (verify current law year before quoting).
- **HHS / CMS FPL multiples** — annual; cite `md_facts` [HHS FPL 2026].
- **COBRA** — Consolidated Omnibus Budget Reconciliation Act 1985; 18-month continuation.
- **HSA** — IRC §223; current-year limits from `md_facts`.

## Disclaimer

Healthcare policy changes. The IRA enhanced-subsidy regime is one example — political risk is real. Always verify current-plan-year rules before treating any subsidy projection as locked in. Plan-by-plan enrollment requires a state-of-residence Marketplace navigator or licensed broker; do NOT enroll from a chat.

## Next step

**Next step → Health & Medicare:** "Compare ACA plans for household of {N} in {state}, MAGI target ${X}, expected annual medical spend ${Y}, HDHP eligibility {required for HSA stack}."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).