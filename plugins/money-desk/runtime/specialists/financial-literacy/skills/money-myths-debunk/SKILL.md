## Money Myths Debunk

description: Evidence-based correction of common money myths. Each myth gets the popular claim, the kernel of truth (most myths have one — that's why they spread), the actual evidence, and the better mental model. Not contrarian for its own sake; says "it depends" honestly when it depends.

## When to use

- "Is it true that...?"
- User cites a piece of advice from a parent / friend / influencer and wants a sanity check.
- A diagnostic skill needs to push back on an assumption the user is holding ("but I heard renting is throwing money away") before the math will land.

## Inputs needed

- The myth or claim to evaluate.
- Optionally: where the user heard it (sets the context — a parent's lifelong rule vs a TikTok pitch get different treatments).

## Workflow

1. **State the myth verbatim** so the user sees we heard it correctly.
2. **Verdict in one line:** TRUE / MOSTLY TRUE / IT DEPENDS / MOSTLY FALSE / FALSE.
3. **Kernel of truth.** Why does this myth persist? What real-world observation seeded it?
4. **What the evidence actually says.** Cite primary research / data where possible. Be honest about uncertainty.
5. **The better mental model.** What should the user think instead?
6. **Pointer.** Which diagnostic skill answers the personal version ("does THIS apply to ME?").

## Myth catalog (representative — extend as needed)

### "Credit cards are bad — you should pay cash"
- **Verdict: MOSTLY FALSE** for financially organized adults; **TRUE** for anyone carrying a balance.
- **Kernel of truth:** Carrying a balance at 20-29% APR is a wealth-destruction machine, and the industry profits when you do.
- **Evidence:** If you pay in full every month, you get 2-5% back, build credit history, get fraud protection (Reg E for debit doesn't compare), and pay $0 in interest. The CFPB's own data: ~55% of US cardholders pay in full monthly and benefit from the system.
- **Better model:** Credit cards are tools — neutral. Pay in full every month or don't use them. The decision is about your self-discipline, not the card.
- **Pointer:** **Credit & Identity** for utilization / score impact.

### "Renting is throwing money away"
- **Verdict: IT DEPENDS** — the math is genuinely a coin flip on a 5-7 year horizon in most metros.
- **Kernel of truth:** Mortgage principal builds equity; rent doesn't.
- **Evidence:** Rent vs buy is dominated by (a) price-to-rent ratio in your specific market, (b) how long you'll stay, (c) maintenance + property tax + insurance + opportunity cost of the down payment. NYT's rent-vs-buy calculator (built on Krugman / Shiller work) reliably shows BUY winning only at horizons > ~6 years in most US metros with P/R > 20.
- **Better model:** Renting buys flexibility and offloads variance. Buying buys stability and forced savings. Both are legitimate. The "throwing money away" framing ignores property tax / maintenance / opportunity cost — which are also "thrown away" in the buy case.
- **Pointer:** **Rent vs Buy** in Purchase Advisor for the personalized number.

### "You should always max your 401(k)"
- **Verdict: MOSTLY TRUE** for the match; **DEPENDS** above the match.
- **Kernel of truth:** Match = 100% return; tax-deferral compounds for decades.
- **Evidence:** Order matters — match → toxic debt payoff → HSA → Roth IRA → rest of 401(k) is the consensus waterfall. Maxing your 401(k) at the employee limit (`md_facts` → `irs_contribution_limits.401k_employee_deferral`) when you have $40k of 22% APR credit-card debt is a wealth-destroyer.
- **Better model:** "Max the match" is universal advice; "max the whole 401(k)" is contextual.
- **Pointer:** **Contribution Optimizer** (Retirement Planner) for your personal waterfall.

### "Carry a small credit-card balance to build credit"
- **Verdict: FALSE.**
- **Kernel of truth:** Using cards (then paying them off) DOES build credit; "use them" is the half that's right.
- **Evidence:** FICO and VantageScore both reward LOW utilization (< 10% ideal, < 30% acceptable) and **on-time payment**. Carrying a balance costs you interest AND raises utilization (bad for score). The myth confuses "use the card" with "carry a balance".
- **Better model:** Use the card, pay it off in full before the statement closes, score goes up.
- **Pointer:** **Credit & Identity** for the score model breakdown.

### "Whole life insurance is an investment"
- **Verdict: FALSE** for 95%+ of buyers.
- **Kernel of truth:** Whole life does build cash value, and cash value does grow tax-deferred.
- **Evidence:** Cash-value IRR for typical whole-life policies in years 1-20 is 0-3% (state insurance department data — required disclosures in the policy illustration). Term life + investing the premium difference dominates whole life in long-horizon Monte Carlo > 95% of paths. Whole life makes sense in narrow cases: estate-tax illiquidity, special-needs dependents, certain business buy-sell structures.
- **Better model:** Insurance is for transferring risk. Investing is for growing wealth. Combining them usually does both poorly.
- **Pointer:** **Life Insurance Needs** (Life & Disability) for sizing; **Concept Explainer** for term-vs-whole deep dive.

### "Time in the market beats timing the market"
- **Verdict: MOSTLY TRUE.**
- **Kernel of truth:** Missing the best 10 trading days from 1995-2020 cuts returns roughly in half (multiple studies — Putnam, Fidelity, JP Morgan). Those best days cluster near the worst days, so the "I'll just sit out the bad ones" plan fails in practice.
- **Evidence:** Behavioral, not just math. The "time in" advice survives because investors who try to time consistently underperform — DALBAR's annual study puts the gap at 3-5% / year between equity-fund returns and equity-fund-INVESTOR returns.
- **Better model:** Pick an asset allocation you can stick with through a 50% drawdown, automate contributions, ignore the news.
- **Pointer:** **Behavioral Coach** if the temptation is acute right now.

### "Get a 30-year mortgage and invest the difference — you'll come out ahead vs a 15-year"
- **Verdict: IT DEPENDS** (and behaviorally it's MOSTLY FALSE).
- **Kernel of truth:** Math: if you actually invest the payment difference into equities at ~7% real, you historically beat the ~6-7% mortgage rate over 15-20 years. So in spreadsheet land, yes.
- **Evidence:** Almost nobody actually invests the difference. They spend it. The 15-year payer forced-saves ~30-40% more equity than the "30-year + invest" cohort over the same period (Federal Reserve Survey of Consumer Finances data).
- **Better model:** Pick the loan term you'll actually behave well under. For most people that's 30-year if they DO have an automated investing habit; 15-year if they don't.
- **Pointer:** **Rent vs Buy** for the broader decision, **Behavioral Coach** for the discipline question.

### "Pay off your mortgage early — debt-free is always better"
- **Verdict: IT DEPENDS.**
- **Kernel of truth:** Guaranteed return = mortgage rate (after-tax), risk-free, and the psychological win of no mortgage is real.
- **Evidence:** If your mortgage is 3.0% from 2021 refis and you can buy 5%+ Treasuries / 7%+ in equities, extra payments are mathematically dominated by investing — but the gap closes fast at 7%+ mortgage rates.
- **Better model:** At < 5% mortgage rate, invest the extra; at 5-7%, it's a wash and behavioral preference wins; at > 7%, lean toward extra principal.
- **Pointer:** **Debt Strategist** for personalized payoff vs invest trade-off.

## Output template

Use the skeleton in **Determinism rules → Output template** below — it is the single source of truth for this skill's report shape.

## Guardrails

- Don't be contrarian for its own sake. Some myths are actually true.
- "It depends" is the honest answer for ~40% of money questions — say it when it's true, then lay out the conditions.
- Cite primary sources (CFPB, FRB, DALBAR, Bogleheads, IRS) — never made-up "studies show".
- Use `[UNSOURCED]` for any claim you can't trace, and tell the user to verify before relying on it.

## Disclaimer

General evidence-based education. Whether the myth applies to YOUR specific situation is the relevant diagnostic specialist's call.

## Determinism rules

### Input keys

- `claim` — string, the myth verbatim
- `source_context` — `family` | `friend` | `influencer` | `media` | `advisor_or_salesperson` | `other` | null
- `user_numbers` — object or null (e.g. `{ mortgage_rate_pct }` for the payoff myth)

### Assumptions

| Assumption | If the user doesn't supply it | Tag |
|---|---|---|
| Current-year limits in evidence text (e.g. 401(k) limit) | `md_facts` → `irs_contribution_limits.401k_employee_deferral` etc. | `[IRS 2026 limits]` |
| Long-run return used in "invest the difference" math | `md_facts` → `behavioral_assumptions_safe_defaults.long_term_equity_real_return_percent` | `[ASSUMPTION]` |
| Study statistics (DALBAR, CFPB, SCF, best-days studies) | Cite the named primary source via `md_sources`; else `[UNSOURCED]` + "verify" | `[UNSOURCED]` |
| User's mortgage rate (payoff myth) | **Ask — no default**; without it, show all three bands | — |

### Calculation method

1. Quote the claim verbatim.
2. **Catalog match**: if the claim matches a catalog myth (same core assertion, ignoring wording), use that entry's verdict and structure unchanged; refresh any dollar figure from md_facts.
3. **New myth**: assign the verdict with the rubric in the Decision rules, using only cited evidence.
4. Write the five sections in the Output template's fixed order; evidence = 1–3 paragraphs, each with ≥ 1 citation or an `[UNSOURCED]` tag.
5. "Personalize this" = exactly one diagnostic skill (friendly name + specialist).
6. For the mortgage-payoff myth with `user_numbers.mortgage_rate_pct`, apply the bands in the Decision rules and state which fired.

### Decision rules

Verdict rubric for myths **not** in the catalog — evaluate top to bottom; first match wins.

| # | Condition (from cited evidence) | Verdict |
|---|---|---|
| 1 | No citable evidence either way | IT DEPENDS — and say the evidence is thin |
| 2 | The answer flips on a user-specific variable (rate, horizon, behavior, income) that the claim ignores | IT DEPENDS — name the variable and the flip point |
| 3 | Claim holds in every cited source with no material exception | TRUE |
| 4 | Claim holds in most cited sources; exceptions are narrow and nameable | MOSTLY TRUE |
| 5 | Claim fails in every cited source | FALSE |
| 6 | Otherwise (fails in most sources with a real kernel) | MOSTLY FALSE |

Mortgage-payoff bands (catalog myth "Pay off your mortgage early"):

| # | `mortgage_rate_pct` | Lean |
|---|---|---|
| 1 | > 7 | Extra principal |
| 2 | ≥ 5 and ≤ 7 | Wash — behavioral preference decides |
| 3 | Otherwise (< 5) | Invest the extra |

### Output template

```markdown
# Myth: "{exact claim}"

**Verdict:** {TRUE / MOSTLY TRUE / IT DEPENDS / MOSTLY FALSE / FALSE} ({catalog | rubric rule #n})

**Kernel of truth:** {why this spread}

**What the evidence says:** {1–3 paragraphs with citations}

**Better mental model:** {1–2 sentences}

**Personalize this:** {ONE diagnostic skill — friendly name + specialist}
```

## Report Quality

Deliver this skill's report as markdown inline in chat; do NOT auto-write files. Afterwards, offer PDF / DOCX / XLSX / HTML and produce them only if the user accepts. Before any user-facing deliverable call `md_report_quality` and follow it: it is authoritative for file names and folders, brand styling, the standard sections, table hygiene, citation tags, and self-verification.
