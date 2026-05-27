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

| Family | Account | Tax IN | Tax GROWTH | Tax OUT | Annual limit (2026 — call `md_facts`) |
|---|---|---|---|---|---|
| **Spending** | Checking | Taxed | n/a (no growth) | Taxed (if interest) | no limit |
| **Short-term savings** | HYSA / Money Market | Taxed | Taxed annually | Taxed annually | no limit |
| **Short-term savings** | CD | Taxed | Taxed annually | Taxed annually + early-withdraw penalty | no limit |
| **Short-term savings** | Series I Bonds | Taxed | Tax-deferred federal, no state | Federal taxed at redemption (state-free); education exclusion possible | $10k/yr |
| **Long-term taxable** | Brokerage | Taxed | LTCG/qual div preferential rate | LTCG/qual div preferential rate | no limit |
| **Retirement — pre-tax** | Traditional 401(k) / 403(b) | Deducted | Tax-deferred | Taxed as ordinary income | $23,500 + $7,500 catch-up if 50+ |
| **Retirement — pre-tax** | Traditional IRA (deductible) | Deducted (income-limited if covered by employer plan) | Tax-deferred | Taxed as ordinary income | $7,000 + $1,000 catch-up |
| **Retirement — Roth** | Roth 401(k) | Taxed | Tax-free | Tax-free if 5+ yr + 59½ | $23,500 + $7,500 catch-up |
| **Retirement — Roth** | Roth IRA | Taxed (income-limited; Backdoor if over) | Tax-free | Tax-free if 5+ yr + 59½; contributions accessible anytime | $7,000 + $1,000 catch-up |
| **Health** | HSA (HDHP-only) | Deducted | Tax-free | Tax-free for qualified medical (any age); ordinary income for non-medical 65+ | $4,300 self / $8,550 family + $1,000 catch-up 55+ |
| **Health** | FSA | Deducted | n/a (use-it-or-lose-it) | Tax-free for qualified medical | $3,300 |
| **Education** | 529 | Taxed federal (state deduction in ~30 states) | Tax-free | Tax-free for qualified education | no federal limit; $19k/yr gift exclusion; $95k 5-yr front-load |
| **Kids' wealth** | Custodial UTMA / UGMA | Taxed (kiddie tax may apply on growth) | Kiddie tax | Taxed (kiddie-tax bands) | n/a |

> All limits are 2026 — re-verify with `md_facts` before quoting numbers to a user.

## The typical placement order (default waterfall)

1. **Stabilize.** Checking with 1 month essentials + minimum payments on all debt.
2. **Free money.** 401(k) up to the full employer match. (Most common 100% return you'll ever get.)
3. **Kill toxic debt.** Any debt with APR > 8% gets paid off before further investing.
4. **HSA max** (if HDHP-enrolled) — triple-tax-advantaged, the best account in the code.
5. **Roth IRA** (or Backdoor Roth if over the income limit).
6. **Rest of 401(k)** up to the $23,500 employee limit.
7. **Emergency fund** to 3-6 months essentials. (Most teachers say "fund this first"; behavioral evidence says people who fund their emergency fund first never get to step 2-6 because life keeps eating it. Two months in the HYSA, then back to the waterfall, is the modern compromise.)
8. **Mega Backdoor Roth** (if your 401(k) plan supports after-tax + in-plan conversion) — up to ~$46,500 more Roth space.
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
