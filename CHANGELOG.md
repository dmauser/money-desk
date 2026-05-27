# Changelog

All notable changes to **money-desk** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-05-26

Phase 1 of the deep-review expansion: 3 new specialists × 4 skills each (12 new
skills, 18 new tools). Total: **12 specialists / 48 skills / 74 tools** (up from
9 / 36 / 56). Lifts CFP Board topic coverage from ~55% to ~80%; fully addresses
the previously missing **Education Planning** category and meaningfully expands
**Financial Position** and **Special Situations (Self-Employed)** coverage.

### Added

- 🎓 **Education Planner** (`md_ed`) — 529 plan review, college cost projection,
  financial-aid (FAFSA / SAI) positioning, and education savings account
  selector (529 vs Coverdell vs UTMA/UGMA vs Roth IRA vs taxable).
- 📊 **Net Worth & Goals** (`md_nw`) — net worth snapshot, emergency fund
  assessment, goal-based savings plan, and sinking funds setup. Foundational
  layer that other specialists build on.
- 💼 **Self-Employed Planner** (`md_se`) — retirement plan selector (Solo 401k /
  SEP / SIMPLE / DB), quarterly estimated taxes (Form 1040-ES), entity & S-corp
  election review, and business deductions & QBI / Section 199A review.

### Changed

- `md_capabilities` description and presence note updated to enumerate all 12
  specialists.
- `extension.mjs` direct-mention instruction expanded with 3 new example
  prompts (529 / net worth / self-employed).

## [0.1.0] — 2026-05-26

Initial release.

### Added

- **Installer CLI** (`money-desk init | uninstall | status | help | --version | --dry-run`)
  with both user-level (`~/.copilot/extensions/money-desk/`) and project-level
  (`.github/extensions/money-desk/`) install modes. SHA-256-based idempotency
  and automatic `.gitignore` management for project installs.
- **9 personal-finance specialists** registered with GitHub Copilot CLI via the
  `@github/copilot-sdk` `joinSession({ tools, hooks })` integration:
  - 💵 Budget Coach (`md_bc`) — cash-flow review, category audit, monthly plan,
    subscription audit
  - 🧾 Tax Planner (`md_tx`) — return-prep checklist, withholding check,
    deductions review, tax-loss harvest review
  - 📈 Investing Advisor (`md_iv`) — portfolio review, allocation check,
    rebalance plan, fund-expense audit
  - 🏖️ Retirement Planner (`md_rp`) — retirement projection, contribution
    optimizer, withdrawal strategy, Social Security review
  - 💳 Debt Strategist (`md_ds`) — payoff plan (avalanche/snowball),
    refinance analysis, credit-card strategy, student-loan review
  - 🪪 Credit & Identity (`md_ci`) — credit-report review, score-improvement
    plan, dispute-letter helper, identity-theft response
  - 🛡️ Insurance Reviewer (`md_ir`) — coverage-gap audit, policy comparison,
    life-insurance needs, deductible optimizer
  - 📜 Estate & Legacy (`md_el`) — document inventory, beneficiary audit,
    basics checklist, digital-estate review
  - 🛒 Purchase Advisor (`md_pa`) — buy vs lease, rent vs buy, big-purchase
    review, total cost of ownership
- **Discovery tools** `md_capabilities` (team map) and `md_route` (free-text →
  specialist) so any agent loading the extension can find the right specialist
  without guessing.
- **Routing hook** (`onUserPromptSubmitted`) that injects routing guidance
  into the model based on per-specialist regex triggers, with throttling so
  guidance is delivered at most once per prefix per session.
- **`[UNSOURCED]` citation guardrail** enforced in every specialist's
  orchestrator and role markdown plus the global guardrails block, with a
  regression test (`tests/guardrails.test.mjs`) that fails if any of the
  three locations stops mentioning it.
- **Auto-generated `docs/CAPABILITIES.md`** built from `registry.mjs` via
  `scripts/generate-capabilities.mjs` and verified in CI by
  `tests/docs-sync.test.mjs`.
- **`PRIVACY.md`** — explicit plain-English data-flow statement.
- **CI** via GitHub Actions: Node 18 / 20 / 22 × ubuntu-latest /
  windows-latest, plus `npm pack --dry-run`.
- **MIT license.**

### Internal

- Zero runtime dependencies (Node 18+ built-ins only).
- 82 tests covering: tool manifest consistency, route regex coverage,
  installer smoke, `[UNSOURCED]` guardrail coverage, docs sync.

[Unreleased]: https://github.com/dmauser/money-desk/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/dmauser/money-desk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/dmauser/money-desk/releases/tag/v0.1.0
