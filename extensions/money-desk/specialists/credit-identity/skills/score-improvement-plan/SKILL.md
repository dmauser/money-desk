# Score Improvement Plan

description: Quantify which actions will most improve the user's credit score and by roughly how much, sequenced by impact and time-to-effect. Outputs a 1- / 3- / 6-month action plan. Use after Credit Report Review or pre-mortgage / pre-loan applications.

## When to use

- 6+ months before a major application (mortgage, auto, refi).
- Score is within 10 points below a rate-pricing band floor (e.g. 740, 760, 780) — see Determinism rules.
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
5. **Pre-application freeze.** From 60 days before a mortgage (or any planned application), stop opening / closing accounts entirely. Lock everything in place.
6. **Estimate point impact.** Only two approximate ranges are quoted: dropping utilization from 50% to 10% = 20–50 pts; removing a 30-day late = 0–30 pts depending on profile. Every other action gets a High / Medium / Low impact label, not a point figure. Be honest that these are estimates — score models are non-linear.

## Required citations

- Current score cites the source and as-of date.
- Score-model nuance cites FICO / VantageScore docs.
- Utilization computed from Credit Report Review.

## Deliverable shape

- Markdown report `./money-desk/credit-identity/score-improvement-plan-<YYYYMMDD>.md`:
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

## Determinism rules

### Input keys

- `current_score` — `{ value, model (FICO 8 | FICO 9 | FICO 10 | VantageScore 3 | VantageScore 4), as_of_date, source }`
- `target_score` — integer (optional)
- `target_date` — YYYY-MM (date of the planned application; optional)
- `application_type` — `mortgage` | `auto` | `card` | `refinance` | `none`
- `cards` — list of `{ name, balance_usd, limit_usd, apr_pct, statement_cut_day, opened_date }` (from Credit Report Review)
- `negatives` — list of `{ type (late_30 | late_60 | late_90 | late_120 | collection_medical | collection_other | charge_off), date, paid (bool), balance_usd }`
- `hard_inquiries_last_12_months` — integer
- `paydown_cash_usd` — number; cash available now for balance pay-downs
- `authorized_user_candidate` — bool; a family member with a long-history, low-utilization card is willing

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Current score and model | **Ask — no default** | — |
| Card balances and limits | **Ask — no default** (run Credit Report Review) | — |
| Pay-down cash | $0 (plan shows the cash needed for each utilization step instead) | `[ASSUMPTION]` |
| Target score | Next pricing band floor above `current_score` (step 2) | `[ASSUMPTION]` |
| Point-impact ranges | Only the two ranges in Workflow step 6 are quoted; every other action is "directional — not quantified" | `[ASSUMPTION]` — cite FICO/VantageScore docs |
| Pricing bands | 20-point bands 640–780 (lender rate-pricing grids, e.g. Fannie Mae LLPA matrix) — verify via `md_sources` | `[UNSOURCED]` until verified |

### Calculation method

1. **Months of runway** = months from today to `target_date` (integer, floor); no `target_date` → 12.
2. **Band:** bands are 640, 660, 680, 700, 720, 740, 760, 780. `next_band` = lowest band > `current_score` (none if ≥ 780). Near-breakpoint = `next_band − current_score ≤ 10`.
3. **Utilization now:** per card `balance ÷ limit × 100`; aggregate `Σ balance ÷ Σ limit × 100` (1 decimal).
4. **Pay-down ladder** (cash shown for each step even if `paydown_cash_usd` is short):
   - Step A — every card to ≤ 29%: `need_A = Σ max(0, balance − 0.29 × limit)`.
   - Step B — every card to ≤ 9%: `need_B = Σ max(0, balance − 0.09 × limit)` (cumulative).
   - Allocate `paydown_cash_usd` in this order: cards by per-card utilization descending (tie: higher APR, then name A–Z), each down to 29%; then the same order down to 9%.
   - Timing: each payment posts ≥ 3 days before that card's `statement_cut_day`.
5. **Bucket each action** (fixed mapping): 1-month — pay-down ladder, statement-cut timing, goodwill request for a single 30-day late, authorized-user add; 3-month — pay-for-delete / pay collections (medical first, since FICO 9/10 and VantageScore 4 ignore paid medical collections), no new applications; 6-month — on-time history, let lates age, keep old cards open.
6. **Pre-application freeze:** if `application_type` ≠ `none`, add "no account openings or closings from `target_date − 2 months`" to every bucket that overlaps that window.
7. **Impact label per action:** High = payment-history or utilization action; Medium = length-of-history action; Low = new-credit or mix action (FICO factor weights). Quote points only for utilization 50% → 10% (20–50 pts) and removal of a single 30-day late (0–30 pts).
8. **Rounding:** whole dollars; utilization 1 decimal.

### Decision rules

Evaluate top to bottom; the first match is the plan headline.

| # | Condition | Headline |
|---|---|---|
| 1 | Any negative is unverified or disputable per Credit Report Review | Disputes first — run `dispute_letter_helper`, then this plan |
| 2 | Runway ≤ 2 months and `application_type` ≠ `none` | Lock-in mode — only the pay-down ladder and statement-cut timing; no other changes |
| 3 | Aggregate utilization ≥ 30% | Utilization first — fund Step A, then Step B |
| 4 | Any negative dated within the last 24 months | Recovery — goodwill / pay-for-delete where applicable; let time work |
| 5 | Near-breakpoint (≤ 10 points below `next_band`) | Breakpoint push — Step B pay-down and zero new inquiries |
| 6 | Otherwise | Maintain — keep utilization < 10%, no new applications in the runway |

### Output template

```markdown
# Score Improvement Plan — {as_of_date}

## Headline
Current **{score} ({model})** → target **{target}** by **{target_date}**. Plan: **{headline}** (rule #{n}). Next pricing band: {next_band or "Top band"}.

## Utilization ladder
| Card | Balance | Limit | Utilization | Pay to reach 29% | Pay to reach 9% | Pay by (date) |
|---|---|---|---|---|---|---|
| Aggregate | | | | {need_A} | {need_B} | |

## 1-month actions
| Action | Impact | Point estimate | Due |
|---|---|---|---|

## 3-month actions
| Action | Impact | Point estimate | Due |
|---|---|---|---|

## 6-month actions
| Action | Impact | Point estimate | Due |
|---|---|---|---|

## Things to NOT do
- {close old cards, new applications, new large balances, during the freeze window}

## Tracker
| Score to watch | Model | Where | Check cadence |
|---|---|---|---|
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
