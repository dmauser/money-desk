# money-desk

A GitHub Copilot CLI extension that adds **nine personal-finance specialists** to your
Copilot CLI session — budgeting, taxes, investing, retirement, debt, credit & identity,
insurance, estate hygiene, and major purchase decisions.

Sibling to [finance-desk](https://github.com/dmauser/finance-desk) (institutional
finance). Same architecture, different scope: money-desk is for **your** finances.

## Install

### From source (works today)

```bash
git clone https://github.com/dmauser/money-desk.git
cd money-desk
node bin/cli.mjs init             # user scope → ~/.copilot/extensions/money-desk/
# or
node bin/cli.mjs init --project   # project scope → .github/extensions/money-desk/
node bin/cli.mjs status           # verify
```

### Via npx (once published to npm)

```bash
npx money-desk init               # user scope
npx money-desk init --project     # project scope
npx money-desk status
```

Requires **Node 18+** and the GitHub Copilot CLI on your `PATH`.

## The team

| Prefix    | Specialist            | Domain                                                                |
| --------- | --------------------- | --------------------------------------------------------------------- |
| `md_bc`   | Budget Coach          | Monthly budgeting, cash flow, categories, subscriptions               |
| `md_tx`   | Tax Planner           | Personal tax planning, withholding, deductions, tax-loss harvesting   |
| `md_iv`   | Investing Advisor     | Portfolio, allocation, rebalance, fund expenses, asset location       |
| `md_rp`   | Retirement Planner    | Projections, 401k/IRA/Roth, withdrawal sequencing, Social Security    |
| `md_ds`   | Debt Strategist       | Payoff plans (avalanche/snowball), refinance, cards, student loans    |
| `md_ci`   | Credit & Identity     | Credit report, score improvement, disputes, ID-theft response         |
| `md_ir`   | Insurance Reviewer    | Health/auto/home/life/umbrella audit, gaps, deductibles               |
| `md_el`   | Estate & Legacy       | Document inventory, beneficiaries, basics checklist, digital estate   |
| `md_pa`   | Purchase Advisor      | Buy vs lease, rent vs buy, big-purchase reviews, total cost ownership |

Each specialist exposes:

- `md_<prefix>_role` — load the specialist's role markdown.
- `md_<prefix>_orchestrate` — load the orchestration playbook.
- `md_<prefix>_skill_<id>` — load a specific skill playbook (4 per specialist).

Plus two top-level discovery tools:

- `md_capabilities` — list the full team and their skills.
- `md_route` — given a query, return the most relevant specialist(s).

## Example prompts

```
@money-desk Build me a zero-based monthly budget and audit my subscriptions.
@money-desk Run a withholding check and review my deductions for 1099 income.
@money-desk Review my portfolio allocation and propose a rebalance plan.
@money-desk Project my retirement and optimize 401k/Roth IRA contributions.
@money-desk Draft a debt payoff plan with avalanche vs snowball comparison.
@money-desk Review my credit report and write a dispute letter for a collection.
@money-desk Audit my auto and umbrella insurance coverage for gaps.
@money-desk Inventory my estate documents and audit beneficiaries.
@money-desk Should I buy or lease a new car? Run a total cost of ownership comparison.
```

The router (`md_route`) and the `onUserPromptSubmitted` hook will pick the right
specialist automatically.

## Guardrails

money-desk is **analysis-only**. It does not:

- Execute trades, move funds, or contact financial institutions.
- File tax returns, submit disputes, or sign documents on your behalf.
- Share your data externally. Treat statements, CSVs, screenshots, and credit
  reports as untrusted local input. Mask PII before sharing snippets.

It also is **not a substitute for professional advice**. It is informational
only — not tax, legal, investment, or insurance advice. For complex situations,
engage a licensed professional in your jurisdiction.

Every number in a money-desk report cites its source document; numbers that
cannot be sourced are marked `[UNSOURCED]`.

## Uninstall

```bash
npx money-desk uninstall            # user scope
npx money-desk uninstall --project  # project scope
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs welcome — please keep the
architecture aligned with finance-desk conventions (`.github/copilot-instructions.md`
documents them).

## License

MIT © dmauser
