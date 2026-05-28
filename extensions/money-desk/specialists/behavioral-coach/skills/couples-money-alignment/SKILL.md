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
- **Fix**: monthly review automatically surfaces all transactions over a pre-committed threshold (e.g., $X). Removes the dynamic of "telling" — it just appears.
- **Defusal**: "We have a transparency-threshold rule. Anything over $X shows up in our monthly review. That's the structure; let's stick to it."

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


## Report Quality

This skill's deliverable follows the Money Desk **Report Quality Rules** — call `md_report_quality` for the full policy.

- **Default = render the deliverable as markdown inline in chat.** Do NOT auto-write files.
- After delivering, **OFFER** PDF / DOCX / XLSX / HTML and only produce them if the user accepts.
- File naming when files are produced: `./reports/<specialist-slug>/<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` — never overwrite a prior scenario.
- Brand styling, 9 standard sections, table hygiene, citation tags, and self-verification steps are encoded in `md_report_quality`. Renderer scripts ship at `extensions/money-desk/renderers/` (copy to `./reports/_renderers/` on first use).