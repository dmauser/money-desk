# Deductible Optimizer

description: Find the optimal deductible across auto, home, and health policies given the user's emergency fund, premium sensitivity, and claim history. Outputs deductible recommendations with the premium delta. Use when premiums feel too high or after building an emergency fund.

## When to use

- Premium-renewal sticker shock.
- Emergency fund just grew large enough to support a higher deductible.
- Low claim history makes higher deductibles attractive.

## Inputs needed

- Current deductibles and premiums per policy.
- Available deductible tiers from carrier (quote-driven).
- Liquid emergency fund balance.
- Claim history (last 3–5 years).
- Risk tolerance — "I never want to think about it" vs "I'll absorb $5k once a decade."

## Workflow

1. **Per policy, list deductible tiers and their premiums** (e.g., auto comp/coll at $500, $1000, $2500; home at $1k, $2.5k, $5k; HDHP vs PPO).
2. **Compute premium savings per step-up** — $/yr saved by raising deductible.
3. **Compute payback period.** Premium savings × N years > deductible increase = breakeven. If breakeven < 2 years and emergency fund covers the higher deductible, take it.
4. **Risk-adjust for claim frequency.** Multiply by historical claim probability. If user files a claim every 4 years on average, deductible cost amortizes faster than premium savings.
5. **Emergency-fund constraint.** Deductible amount must be a small fraction of the user's liquid emergency fund. Don't recommend $5k deductible to someone with $3k in savings.
6. **Health-specific:** HDHP + HSA combo can be a big win for users who don't expect heavy medical use and want the HSA tax shelter. Run the worst-case OOP-max scenario, not just the deductible.
7. **Output recommendation per policy.**

## Required citations

- Premium tier quotes cite the carrier / declarations.
- Claim history cites user-provided log.
- HSA mechanics cite IRS for the working year.

## Deliverable shape

- Markdown report `./reports/insurance-reviewer/deductible-optimizer-<YYYYMMDD>.md`:
  - **Per-policy table** — current deductible, current premium, recommended deductible, new premium, $ saved/yr, breakeven years.
  - **Emergency-fund check** — green/yellow/red per recommendation.
  - **Health-policy section** — HDHP+HSA case if applicable.
  - **Net annual premium savings.**
  - **Action list** — request the deductible change at renewal; if mid-cycle, ask for a re-rate.

## Notes

- Don't optimize deductible without optimizing coverage limits first (`coverage_gap_audit`).
- A higher deductible only helps if the user actually has the cash to absorb it without going into debt.
- Some carriers offer "vanishing deductible" features — model those separately.
- "Not professional insurance advice."
