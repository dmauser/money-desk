# Score Improvement Plan

description: Quantify which actions will most improve the user's credit score and by roughly how much, sequenced by impact and time-to-effect. Outputs a 1- / 3- / 6-month action plan. Use after Credit Report Review or pre-mortgage / pre-loan applications.

## When to use

- 6+ months before a major application (mortgage, auto, refi).
- Score is just below a tier breakpoint (740, 760, 780) where rate pricing improves.
- Recovering from a derogatory event.

## Inputs needed

- Current score and which model (FICO 8 / 9, VantageScore 3 / 4) — they prioritize differently.
- Credit Report Review output (account list, utilization, age, negatives).
- Target score and target date.
- Bandwidth to make changes (cash available to pay down balances).

## Workflow

1. **Score factors and their typical weights (FICO 8):**
   - Payment history (35%).
   - Amounts owed / utilization (30%).
   - Length of credit history (15%).
   - Credit mix (10%).
   - New credit (10%).
2. **Quick wins (0–60 days):**
   - **Lower utilization.** Pay balances *before* statement-cut date so the lower balance reports. Aim aggregate <30%, ideally <10%. Per-card matters too — no single card maxed.
   - **Goodwill removal of one-off lates.** Call issuer; sometimes a single 30-day late on an otherwise-clean account is removed on request.
   - **Authorized-user piggyback** on a long-history, low-utilization family card.
3. **Medium wins (1–6 months):**
   - **Pay collections / charge-offs strategically.** Newer FICO models (FICO 9 / 10, VantageScore 4) ignore paid medical collections, weigh others less. Older models still hold them. Pay-for-delete agreements where possible.
   - **Reduce hard inquiries** — apply for nothing during the runway window.
   - **Don't close old cards** — even if unused, age + utilization headroom matters.
4. **Long-term (6+ months):**
   - **Time** — late payments age and reduce impact each year.
   - **Build positive history** with on-time payments on existing accounts.
5. **Pre-application freeze.** 30–60 days before a mortgage, stop opening / closing accounts entirely. Lock everything in place.
6. **Estimate point impact.** Approximate ranges per action (e.g., dropping utilization from 50% to 10% = 20–50 pts; removing a 30-day late = 0–30 pts depending on profile). Be honest that these are estimates — score models are non-linear.

## Required citations

- Current score cites the source and as-of date.
- Score-model nuance cites FICO / VantageScore docs.
- Utilization computed from Credit Report Review.

## Deliverable shape

- Markdown report `./reports/credit-identity/score-improvement-plan-<YYYYMMDD>.md`:
  - **Headline** — current score, target, estimated achievable lift by target date.
  - **1-month action list** — utilization moves, statement-cut timing.
  - **3-month action list.**
  - **6-month action list.**
  - **Things to NOT do** — close cards, new applications, large new balances.
  - **Tracker** — which score to monitor and where (free issuer offerings like CreditWise, MyFICO if user is paying).

## Notes

- Free scores from issuers (Chase, Cap One, etc.) are usually VantageScore — lenders pull FICO. Track both if possible.
- Watch for "credit repair" scams promising guaranteed results — credit repair only does what the user can do themselves for free.
- "Not professional credit advice."


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).