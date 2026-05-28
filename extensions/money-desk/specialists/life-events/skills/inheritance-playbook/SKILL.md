# Inheritance Playbook

description: 0-to-9-month runbook for receiving an inheritance. The first rule is "do nothing fast" — the worst money decisions in personal finance are made in the first 30 days after sudden wealth. Sequences the estate-elections (9-month window for disclaimers), tax-aware liquidation, beneficiary type (inherited IRA 10-year rule), debt paydown, and integration into long-term plan.

## When to use

- User just received an inheritance (any size, any asset type).
- Inheritance is imminent (parent or relative in late-stage illness, prudent pre-planning).
- Lump-sum life insurance benefit received as beneficiary.

## Inputs needed

- Decedent date of death (drives basis step-up + 9-month disclaimer window).
- Relationship (spouse vs non-spouse changes EVERYTHING for inherited IRAs).
- Inheritance composition: cash, taxable brokerage, retirement (Traditional vs Roth), real estate, business interest, life insurance, collectibles.
- Approximate $ amount per category.
- User's existing financial position (income, NW, debt, retirement readiness).
- Whether estate has been probated / executor named.
- State of decedent + state of beneficiary (state inheritance/estate tax — only ~6 states have inheritance tax).

## Workflow (sub-skill orchestration)

### Days 0–30 — DO NOTHING FAST

The single most important rule. Park cash in a HYSA / money market / treasury MMF. Resist the urge to spend, gift, invest, or quit your job. Most blowups happen here.

1. **Establish the "do nothing" parking spot** — recommend a HYSA at a separate institution from existing accounts (psychological separation). High-yield + FDIC.
2. **Assemble the team:**
   - Estate attorney (decedent's, if usable; else hire one).
   - CPA familiar with estate / fiduciary tax (1041 vs 1040).
   - Fee-only fiduciary CFP if NW now > $1M.
3. **Inventory what was actually received** vs what's promised vs what's still in probate. Don't count chickens.

### Days 30–90 — Tax & estate elections

4. **Cost-basis step-up.** Most inherited assets get a step-up to date-of-death FMV. For taxable brokerage, REQUEST the basis adjustment from the broker in writing. For real estate, get a date-of-death appraisal (preferably formal — supports basis if ever audited).
5. **Inherited IRA rules** (the big one — non-spouses):
   - SECURE Act 10-year rule: account must be FULLY distributed by Dec 31 of the 10th year after death. RMDs required in years 1–9 if decedent was past RBD.
   - Spouse can roll into own IRA (treat as own) — best option for spouses.
   - Eligible designated beneficiary (EDB) — spouse, minor child, disabled, chronically ill, sibling within 10 years — gets lifetime stretch.
   - Plan the 10-year distribution schedule to LEVEL taxable income (don't bunch in year 10).
6. **Inherited Roth IRA** — also 10-year rule but distributions are tax-free; usually best to let it grow 9 years then take all in year 10.
7. **Disclaimer election** — within **9 months of death**, beneficiary can disclaim ALL or part. Inheritance passes per the will/beneficiary form. Useful when: beneficiary doesn't need money, wants it to skip a generation, or has estate-tax-exposure issues. Once 9 months passes, gone forever.
8. **State estate / inheritance tax** — check both decedent and beneficiary states. PA, NJ, KY, MD, NE, IA have inheritance tax (paid by beneficiary; rates vary by relationship class).

### Days 90–180 — Integration

9. **Re-run Net Worth Snapshot** — `md_nw_skill_net_worth_snapshot` with the new assets.
10. **Re-run Retirement Projection** — `md_rp_skill_retirement_projection`. Did you just fast-forward retirement by N years?
11. **Investment Policy Statement update** — `md_iv_skill_investment_policy_statement`. New money requires new IPS, not seat-of-pants investing.
12. **Asset Location Review** — `md_iv_skill_asset_location_review` if mix of taxable + tax-deferred + Roth changed materially.
13. **Tax-loss harvest opportunities in inherited brokerage** — `md_tx_skill_tax_loss_harvest_review`. Stepped-up basis means low-gain positions; consider rebalancing immediately while drift is low.
14. **Debt paydown decision** — high-rate debt (CC, personal loan) almost always wins. Mortgage at 3% vs invest at 7% expected — keep mortgage. Mortgage at 7% — paydown often wins.
15. **Emergency Fund Assessment** — `md_nw_skill_emergency_fund_assessment`. May now be able to fund 9–12 months effortlessly.

### Days 180–270 — Wealth-management upgrades

16. **Estate Basics Checklist** — `md_el_skill_basics_checklist`. NW jumped → revisit your own estate plan (your kids, charity, etc.).
17. **Gifting Strategy** — `md_el_skill_gifting_strategy` if NW now near federal estate exemption.
18. **Charitable Giving Strategy** — `md_tx_skill_charitable_giving_strategy` (DAF, QCD if 70½+) to absorb taxable distributions efficiently.
19. **Insurance Coverage Gap Audit** — `md_ir_skill_coverage_gap_audit`. Bigger NW → umbrella policy now matters (≥ NW).

## Hard-deadline checklist

- ⚠️ **9 months from death**: disclaimer election window closes — irrevocable.
- ⚠️ **9 months from death**: Form 706 (estate tax return) filing if estate > exemption.
- ⚠️ **Dec 31 of year 1**: first inherited-IRA RMD if decedent was past RBD.
- ⚠️ **Dec 31 of year 10**: inherited IRA must be fully distributed.

## Required citations

- 10-year rule cites SECURE Act / SECURE 2.0.
- Basis step-up cites IRC §1014.
- Disclaimer rules cite IRC §2518.
- State inheritance tax cites state department of revenue.

## Deliverable shape

- Markdown playbook `./reports/life-events/inheritance-<DATE>.md`:
  - **Inventory** (asset type / value / cost basis / account type / tax treatment).
  - **30-day rules** (what NOT to do, where money sits).
  - **9-month decisions** (disclaimers, basis docs, IRA elections).
  - **10-year IRA distribution schedule** (year-by-year $).
  - **Integration plan** (debt, retirement re-projection, IPS update).
  - **Specialist hand-offs.**

## Notes

- The 10-year rule is a MAJOR tax-planning lever — don't default to "wait until year 10."
- Co-mingle nothing in 0–30: keep inherited money in a separate account until you know what you want to do.
- Beware of unsolicited "advisors" who appear after inheritances — fee-only fiduciary only.
- "Analysis only. Inheritance is one of the most legal- and tax-complex events in personal finance. CPA + estate attorney + fee-only CFP, in that order."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).