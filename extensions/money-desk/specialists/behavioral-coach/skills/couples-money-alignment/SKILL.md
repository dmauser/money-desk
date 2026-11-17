## Couples Money Alignment

description: Structured framework for couples to discuss money productively — monthly "money date" template with agenda and ground rules, three-bucket account architecture (yours / mine / ours), and defusal scripts for the four recurring couple-money fights. The skill is structural, not therapeutic; suspected financial abuse or relationship-level conflict is out of scope and routed.

## When to use

- "We just had a fight about money."
- "We never talk about money and I want to start."
- "How should we split bills?" / "How should we structure accounts after marriage?"
- "Spender vs saver" dynamic.
- Pre-marriage planning conversation.
- After a job change / new baby / inheritance changes the household financial dynamic.

## Inputs needed

- Both partners present (or both agree to a structured async version).
- Both partners' income, debt, credit score (approximate is fine for the conversation).
- Current account architecture: fully joint / fully separate / hybrid.
- The specific recent friction or topic, if any.
- Any prior agreements (prenup, postnup, written household budget).

## The Monthly Money Date Template

### Cadence
- **Monthly**, 60 minutes, calendar-blocked (NOT spontaneous).
- Same time each month if possible (first Sunday after payday is common).
- Neither partner is allowed to bring up money OUTSIDE the money date for routine items — that's the deal that lets the money date work. Emergencies (job loss, large unexpected bill) excepted.

### Ground rules (read aloud at start)
1. **No surprise items.** Topics agreed beforehand; new items get parked for next month.
2. **No blame language.** "I noticed X" and "I felt Y" — not "you always".
3. **Two-minute rule.** Each partner speaks for two uninterrupted minutes per topic before discussion.
4. **Pause rule.** Either partner can call a 10-minute break, no questions asked. Reconvene or table to next month.
5. **End on appreciation.** Last 5 minutes: each partner names one financial thing the other did well this month.

### Agenda (60 min)
- **5 min**: numbers review — net worth, savings rate, big variances vs budget. Just the numbers, no debate.
- **10 min**: previous-month action items review — what was committed, what got done, what didn't.
- **20 min**: this month's topics (agreed beforehand).
- **15 min**: upcoming month — big expenses, deadlines, decisions pending.
- **5 min**: action items + owner + due date.
- **5 min**: appreciation closing.

## The Three-Bucket Account Architecture

This is the most-validated structural fix for spender / saver friction. It works for most couples regardless of income split.

1. **Joint account** ("ours") — household shared expenses (rent / mortgage, utilities, groceries, kids, joint goals). Funded by proportional contribution from each partner (% of income, NOT 50/50 unless incomes match).
2. **Personal account each** ("yours" and "mine") — discretionary, no-justification-needed spending. Same dollar amount per partner (NOT proportional). This is the "you don't get to comment on what I bought" account.
3. **Joint goals account(s)** ("ours-future") — house down payment, big trip, sabbatical. Funded by joint contribution at agreed rate; visible to both, withdrawn only by joint decision.

**Common allocation pattern**:
- All paychecks → joint checking.
- Auto-transfer monthly: each partner's personal allowance + each joint goal's monthly contribution.
- Joint checking left with the household expenses.

## The four recurring couple-money fights and their defusal

### Fight 1: "You spend too much on X."
- **Root**: discretionary categorization mismatch.
- **Fix**: the personal-account architecture above. If it came out of "yours", no comment allowed.
- **Defusal script**: "Did this come out of your personal? — Yes. — OK, that's the system, we're done. Let's move on."

### Fight 2: "You don't make enough / I make all the money."
- **Root**: contribution-vs-power asymmetry, often stress-amplified.
- **Fix**: proportional contribution to joint expenses (not 50/50) restores fairness; AND name explicitly the non-monetary contributions (childcare, household management, career-prioritization for the higher earner).
- **Defusal**: this one cannot be solved on a money date alone; recommend a Financial Therapy Association therapist if recurring.

### Fight 3: "Why didn't you tell me about X?"
- **Root**: transparency gap, often a status-script partner hiding spending from a vigilance-script partner.
- **Fix**: monthly review automatically surfaces all transactions over a pre-committed dollar threshold the couple sets (no default). Removes the dynamic of "telling" — it just appears.
- **Defusal**: "We have a transparency-threshold rule. Anything over our agreed threshold shows up in our monthly review. That's the structure; let's stick to it."

### Fight 4: "We have different priorities."
- **Root**: actual misalignment about life goals (which is real, not just communication).
- **Fix**: NOT on the money date — schedule a separate "values date" first. Goals conversation must precede money mechanics conversation.
- **Defusal**: "This isn't a money mechanics question. Let's table it and schedule a values conversation separately."

## Output

- Tailored money-date agenda for THIS couple.
- Recommended bucket architecture with specific dollar amounts and monthly transfers.
- Identification of which of the four fight patterns is recurring (from inputs) and the specific defusal applicable.
- Schedule + ground rules in writing to share between partners.

## Citations / sources

- Bucket architecture: widely-documented pattern; see "The Mom-and-Pop Money Manual" (Sethi), "Smart Couples Finish Rich" (Bach) — `[UNSOURCED]` for specific %.
- Couples financial conflict research: Britt et al., Journal of Family and Economic Issues.

## Disclaimer

Structural / educational only. Not couples therapy. If conflict involves: coercive control, hidden debt being weaponized, inability of one partner to access accounts, threats — this is financial abuse and requires a licensed therapist or domestic-violence financial-empowerment counselor (in the US, National Domestic Violence Hotline 1-800-799-7233 or Allstate Foundation Moving Ahead curriculum). Do not coach through abuse.

## Determinism rules

### Input keys

- `both_present` — boolean (false → async version)
- `partner_a`, `partner_b` — each `{ name, net_income_monthly_usd, debt_usd, credit_score? }`
- `shared_expenses_monthly_usd` — number (rent/mortgage, utilities, groceries, kids, insurance)
- `personal_allowance_monthly_usd` — number, same for each partner (agreed by the couple)
- `joint_goals` — list of `{ name, target_usd, target_yyyy_mm, monthly_usd? }`
- `current_architecture` — `fully_joint` | `fully_separate` | `hybrid`
- `transparency_threshold_usd` — number (agreed by the couple)
- `recent_friction` — free text, or `none`
- `prior_agreements` — list (prenup / postnup / written budget), or empty
- `abuse_indicators` — boolean (any of: coercive control, blocked account access, weaponized hidden debt, threats)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Incomes, shared expenses | **Ask — no default** | — |
| Personal allowance amount | **Ask — no default** (couple chooses; skill does not suggest a number) | — |
| Transparency threshold | **Ask — no default** | — |
| Joint-goal monthly amounts | Computed from `target_usd` and months to `target_yyyy_mm` (no growth assumed) | `[ASSUMPTION: 0% growth]` |

### Calculation method

1. **Safety screen first.** If `abuse_indicators = true`, stop and output only the referral (Disclaimer section). Nothing else is produced.
2. **Proportional shares**: `share_a = a.net_income / (a.net_income + b.net_income)`; `share_b = 1 − share_a`. Round to one decimal %.
3. **Joint-goal monthly** = `monthly_usd` if given, else `ceil(target_usd / months_until_target)`.
4. **Joint funding need** = `shared_expenses_monthly_usd + Σ joint-goal monthly`.
5. **Contribution per partner** = `share × joint funding need`. **Leftover per partner** = `net_income − contribution − personal_allowance_monthly_usd`. If either leftover < 0, report the shortfall and route to Budget Coach — do not adjust the shares.
6. **Fight classification** from `recent_friction` keywords, first match in this order: Fight 3 (hid / didn't tell / surprise purchase) → Fight 2 (earn / make more / provider / power) → Fight 4 (goals / priorities / values / future) → Fight 1 (spend / bought / too much on). No match → "None identified".
7. **Money date**: fixed 60-minute agenda (5/10/20/15/5/5) and the five ground rules, verbatim; first date = the first Sunday after the next payday unless the couple names a date.

### Decision rules

Evaluate top to bottom; first match wins.

| # | Condition | Recommendation |
|---|---|---|
| 1 | `abuse_indicators = true` | Stop — financial-abuse referral only |
| 2 | Fight 2 or Fight 4 recurring (named in ≥ 2 recent conflicts) | Schedule a values date before any money date; refer to a Financial Therapy Association therapist if Fight 2 |
| 3 | Any leftover < 0 | Budget Coach first; architecture on hold |
| 4 | `current_architecture = hybrid` with proportional joint funding already | Keep; add only missing pieces (transparency threshold, goals account) |
| 5 | Otherwise | Three-bucket architecture with proportional joint funding |

### Output template

```markdown
# Couples Money Alignment — {partner_a.name} & {partner_b.name}, {date}

## Safety check
{"No indicators reported" — or referral text only, and nothing below}

## Recommended architecture (rule #{n})
| Bucket | Funded by | $ / month |
|---|---|---|
| Joint ("ours") | A {share_a}% / B {share_b}% | |
| Personal — {A} | A | |
| Personal — {B} | B | |
| Joint goal: {name} | Joint | |

## Monthly transfers
| From | To | $ | Day of month |
|---|---|---|---|

## Recurring fight + defusal
{Fight # and script — or "None identified"}

## Money date
- First date: {date}, 60 minutes
- Agenda: 5 numbers / 10 last month's actions / 20 topics / 15 upcoming / 5 action items / 5 appreciation
- Ground rules: {five rules verbatim}
- Transparency threshold: ${transparency_threshold_usd}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
