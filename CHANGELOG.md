# Changelog

All notable changes to **money-desk** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] — 2026-05-26

Intake-first goes from **soft nudge → HARD GATE.** Every `md_<prefix>_skill_<id>`
tool now refuses to return its workflow on the first call. Instead it returns
an "intake required" screen listing the required inputs and explicit
instructions to (1) ask the user in plain language and (2) re-invoke the same
tool with `{ inputs: { ... } }`. The workflow is returned on the second call
with the inputs echoed back so the user can verify them. This is structural
enforcement — the model literally does not get the workflow until inputs are
gathered from the user.

### Changed (BREAKING for agent invocation flow)

- 🛑 **All 78 skill tools are now gated.** First call with no `inputs` arg →
  intake-required screen. Second call with `{ inputs: { ... } }` → workflow
  + echo block at the top. This eliminates the "agent runs the skill on
  invented `[ASSUMPTION:]` values for personal facts" failure mode that the
  v0.7.0 soft banner couldn't prevent.
- 📋 **Inputs echo.** Whatever the agent passes in `inputs` is rendered at the
  top of the second-call response so the user sees what the agent thinks they
  said — making any hallucination visible immediately.
- ⚙️ **Every skill tool advertises an `inputs` object parameter** in its JSON
  schema, with description guiding the agent to snake_case keys keyed off the
  intake field names. The SDK now surfaces the parameter to the model.
- 🔔 **Orchestrator nudges rewritten** in all 18 specialists to describe the
  hard-gating contract: "FIRST call returns intake only; you MUST ask the user
  and re-invoke with `{ inputs: ... }`."
- 🏠 **Capabilities-summary guardrail** rewritten to call out the gate.

### Tests

- `skill loader gates on no-inputs call` — asserts the first-call response
  contains the "intake required" screen, the Step 1 / Step 2 instructions, and
  does NOT leak the workflow.
- `skill loader returns workflow + echo when inputs provided` — asserts the
  second-call response echoes the inputs and returns the workflow.
- `every skill tool advertises an 'inputs' parameter` — schema regression test.

### Why this version

User feedback after v0.7.0: "Not sure the intake is working as I expected. My
intention was before generating a response, Copilot would ask each one of the
required questions." The v0.7.0 banner was a soft nudge the model could ignore.
v0.8.0 makes refusal structural — the model can't get the workflow without
going through the user.

## [0.7.0] — 2026-05-26

Intake-first overhaul. Adds a new `md_intake` discovery tool, prepends a prominent
"⚠️ INTAKE FIRST" banner to every skill load, and updates every orchestrator with
an intake-first nudge so the agent asks the user for missing personal facts
**before** computing — instead of silently inventing `[ASSUMPTION:]` values for
things the user could trivially provide. Total: **18 specialists / 78 skills /
119 tools** (up from 118 — 1 new top-level tool).

### Added

- 📝 **`md_intake`** — returns the structured "Inputs needed" checklist for any
  skill before the agent runs it. Accepts the skill tool id
  (`md_lp_skill_life_insurance_needs`), the `prefix:id` form
  (`md_lp:life_insurance_needs`), or the friendly name (`Life Insurance Needs`).
  Omit `skill` to list every available skill with its specialist and tool id.
- 🚧 **Intake banner on every skill load.** `buildSkillLoader` now parses the
  `## Inputs needed` (or `## Inputs required`) section out of each SKILL.md and
  prepends a prominent quoted banner instructing the agent to STOP and ask the
  user for missing inputs before running the workflow. Cost: zero changes to the
  78 SKILL.md files — the existing prose is reused.
- ✅ New tests covering `extractIntake` parsing, `md_intake` lookup by friendly
  name / tool id / empty, the unknown-skill error path, and the intake banner
  on the life-insurance-needs skill load.
- ✅ New guardrail tests asserting every orchestrator carries the intake-first
  nudge, and that `buildCapabilitiesSummary` documents the intake-first rule.

### Changed

- **`CITATION_CONVENTIONS`** clarified: `[ASSUMPTION:]` is now explicitly
  reserved for *modeling defaults* (discount rate, vacancy %, real return) —
  never for personal facts the user could provide. Adds an "Intake first"
  paragraph pointing at `md_intake`.
- **`buildCapabilitiesSummary` guardrails** lead with a new **Intake first**
  bullet above Analysis-only / Citations / Privacy / Not professional advice.
- **All 18 specialist orchestrators** carry a one-line "Intake first: before
  running any skill, call `md_intake({ skill: ... })` to get its required
  inputs; for anything missing, STOP and ask the user in plain language…"
  nudge (injected via `scripts/inject-intake-nudge.mjs`).
- **`extension.mjs` discovery-tool list** now mentions `md_intake` alongside
  `md_facts` / `md_citation_conventions`; bundle-count text bumped to
  `119 tools, 18 specialists`.
- **README** bumped to 119 tools; "discovery tools" subsection documents
  `md_intake`. Friendly-label `md_facts` examples replace the old
  `[md_facts: <topic>]` raw-id form.

### Why

A worked example of running **Life Insurance Needs** revealed that the agent
would happily composite an entire family profile (income, mortgage, kids,
existing coverage) from prior conversation context — using `[ASSUMPTION:]` tags
for items the user holds — instead of pausing to ask. `md_intake` + the banner
+ the orchestrator nudges turn that anti-pattern into an explicit gate: the
agent reads the inputs list, asks the user once in plain language, then runs.

## [0.6.0] — 2026-05-26

Citations overhaul. Replaces a single scary `[UNSOURCED]` tag with a 4-tag honesty
vocabulary and ships a curated 2026 facts table so the most common figures
(IRS limits, tax brackets, IRMAA, FAFSA, conforming-loan, FEIE, etc.) are
cited from a real source instead of marked `[UNSOURCED]`. Total: **18
specialists / 78 skills / 118 tools** (up from 116 — 2 new top-level tools).

### Added

- 📚 **`md_facts`** — bundled 2026 reference data with ~14 topic blocks
  covering IRS contribution limits (401k, IRA, HSA, FSA, SEP, SIMPLE), MFJ
  income-tax brackets + standard deduction, LTCG / NIIT / AMT thresholds,
  Social Security wage base + FRA + earnings test, Medicare Part A/B/D
  premiums + IRMAA brackets (single + MFJ), estate & gift exemptions, QBI
  §199A thresholds, FAFSA / Pell / 529-to-Roth, mortgage & real-estate
  (conforming-loan, §121 exclusion, SALT cap, bonus depreciation, §179,
  §1031), Federal Poverty Level table, expat (FEIE / FBAR / FATCA / PFIC),
  and safe modeling defaults (real returns, withdrawal rates, vacancy /
  capex / maintenance / management). Each block carries `_source` and
  `_url` so cites point at the primary authority (IRS, SSA, CMS, FHFA, HUD,
  HHS, FinCEN).
- 📜 **`md_citation_conventions`** — returns the 4-tag honesty vocabulary
  so any specialist (or fresh session) can call once to align.

### Changed

- **Citation vocabulary** expanded from a single tag to four:
  - `[USER-PROVIDED]` — the user told you this value; cite the user message.
  - `[ASSUMPTION: <value>]` — explicit modeling default the user can override.
  - `[md_facts: <topic>]` — sourced from the bundled facts table.
  - `[UNSOURCED]` — last resort; only when md_facts and user docs don't cover
    the topic. Ask the user to confirm before any irreversible decision.
- Every one of the 18 specialist orchestrators now nudges the model to call
  `md_facts` BEFORE marking any contribution limit, bracket, IRMAA value,
  FAFSA threshold, conforming-loan limit, FEIE, §121 exclusion, or annual
  gift exclusion as `[UNSOURCED]`.
- `md_capabilities` guardrail summary now documents the 4-tag scheme.

### Why

In v0.5.0 the `[UNSOURCED]` tag was applied so broadly it became noise —
every output had it on almost every number, which made the genuinely shaky
claims indistinguishable from the well-known ones. v0.6.0 reserves
`[UNSOURCED]` for actual unknowns, gives modeling assumptions a proper
label, and ships the most-cited 2026 figures as data so they're sourced
instead of flagged.

## [0.5.0] — 2026-05-26

Phase 4 of the deep-review expansion **plus** an Insurance Reviewer split refactor.
Adds 3 new domain specialists (Real Estate Investor, Behavioral Coach,
International / Expat) and splits the monolithic `md_ir` Insurance Reviewer into
3 focused specialists (Health & Medicare, Property & Casualty, Life & Disability).
Total: **18 specialists / 78 skills / 116 tools** (up from 13 / 62 / 90).

### Added

- 🏘️ **Real Estate Investor** (`md_re`) — 5 skills: rental-property analyzer
  (cap rate, cash-on-cash, DSCR, 1% rule, stress tests), mortgage-strategy
  review (refi break-even, PMI removal, ARM-vs-fixed, recasting), house-hacking
  analysis (duplex / ADU / room-rent), real-estate tax strategy (depreciation,
  passive-loss rules, STR loophole, 1031, cost segregation), sell-vs-hold
  decision framework.
- 🧠 **Behavioral Coach** (`md_bh`) — 5 skills: panic / FOMO circuit-breaker,
  money-script diagnostic (Klontz-style: avoidance / worship / status / vigilance),
  decision journal & pre-commitment, couples money alignment (money date format,
  yours/mine/ours), lifestyle-inflation audit.
- 🌍 **International / Expat** (`md_in`) — 4 skills: US-expat tax overview
  (FBAR, FATCA, FEIE vs FTC, totalization), cross-border investing (PFIC trap,
  US-domiciled vs UCITS, treaty quirks), currency / FX exposure, moving-country
  checklist (tax residency exit, banking, brokerage, healthcare, hedging).
- 🏥 **Insurance — Health & Medicare** (`md_ih`) — health-plan selector
  (HDHP+HSA vs PPO with actuarial worksheet), Medicare IRMAA review (2-year
  lookback, Roth-conversion modeling), LTC planning (self-insure vs hybrid).
- ☂️ **Insurance — Property & Casualty** (`md_pc`) — auto / home / renters
  declarations-page audit, deductible optimizer, umbrella sizing
  (net-worth + future-earnings floor).
- 🛡️ **Insurance — Life & Disability** (`md_lp`) — life-insurance needs
  (DIME / HLV), individual disability review (own-occ definitions, COLA,
  group vs individual), beneficiary audit across all accounts.

### Changed

- Updated `md_le` (Life Events) orchestrator to reference the 3 new insurance
  specialists (`md_ih`, `md_pc`, `md_lp`) and added `md_re`, `md_bh`, `md_in`
  to the list of orchestratable prefixes for cross-specialist playbooks.
- `md_capabilities` now enumerates the 18-specialist team.
- README team table rewritten; per-specialist example-prompt sections added
  for the 6 new / split specialists.

### Removed

- `md_ir` Insurance Reviewer monolithic specialist. Its 5 still-valuable
  skills were redistributed without behavior change to the 3 new insurance
  specialists; `coverage_gap_audit` and `policy_comparison` were folded into
  each specialist's role workflow (no separate tool needed).

## [0.4.0] — 2026-05-26

Phase 3 of the deep-review expansion: 1 new cross-specialist orchestrator
(`md_le` Life Events) bundling 6 sequenced playbooks. Total: **13 specialists
/ 62 skills / 90 tools** (up from 12 / 56 / 82). Adds the missing "guided
experience" layer that turns a tool library into a runbook for big moments.

### Added

- 🌟 **Life Events** specialist (`md_le`) — cross-specialist orchestrator that
  does NOT compute domain work directly; instead it sequences calls to the
  other 12 specialists and stitches their outputs into one consolidated
  playbook with 30/60/90-day deadlines.
  - 📅 **Annual Financial Review** — once-a-year audit across 8–10 sub-skills
    with age-triggered specials (catch-up, Medicare/IRMAA, QCD, RMD).
  - 👶 **New Baby Playbook** — pre-arrival through 60 days post-birth, with
    the 30-day insurance qualifying-event window as the hard deadline.
  - 💼 **Job Change Playbook** — comp-package valuation, benefits enrollment,
    the old-401(k) 4-option framework, equity calendar, withholding reset.
  - 🏠 **Home Purchase Playbook** — honest PITI affordability, down-payment
    stack, buy-vs-rent crossover, loan-offer audit, post-close hygiene.
  - 🎁 **Inheritance Playbook** — 0-to-9-month runbook with the disclaimer
    window, basis step-up, inherited-IRA 10-year-rule schedule, integration.
  - 📉 **Layoff Playbook** — severance review (OWBPA), COBRA-vs-ACA decision
    math, survival cashflow, low-income-year tax opportunities.

### Changed

- `md_capabilities` description, `md_route` table, and presence note updated
  to enumerate all 13 specialists and life-event keywords.



Phase 2 of the deep-review expansion: 8 new skills backfilled into 5 existing
specialists. Total: **12 specialists / 56 skills / 82 tools** (up from 12 / 48
/ 74). Lifts CFP Board topic coverage from ~80% to ~95%.

### Added

- 💝 **Charitable Giving Strategy** (`md_tx_skill_charitable_giving_strategy`)
  — cash vs appreciated securities vs QCD vs DAF bunching with AGI caps.
- 📋 **Investment Policy Statement** (`md_iv_skill_investment_policy_statement`)
  — one-page personal IPS with allocation, rebalancing rule, behavioral guardrails.
- 🗂️ **Asset Location Review** (`md_iv_skill_asset_location_review`) — place
  bonds/REITs in tax-deferred, equity in taxable, high-growth in Roth/HSA.
- 📐 **RMD Planner** (`md_rp_skill_rmd_planner`) — SECURE 2.0 RMD calc + 10-year
  projection, pre-RMD Roth conversion sizing, QCD overlay.
- 🏥 **Medicare & IRMAA Review** (`md_ir_skill_medicare_irmaa_review`) —
  Parts A/B/C/D enrollment, Medigap vs Advantage, 2-year MAGI lookback, SSA-44 appeal.
- 🏡 **Long-Term Care Planning** (`md_ir_skill_ltc_planning`) — state-specific
  cost sizing, self-insure / traditional LTC / hybrid life+LTC / Medicaid paths.
- 🦽 **Disability Insurance Review** (`md_ir_skill_disability_insurance_review`)
  — group LTD audit + individual gap-fill (own-occupation, non-cancelable).
- 🎁 **Gifting Strategy** (`md_el_skill_gifting_strategy`) — annual exclusion,
  direct-pay medical/tuition, 529 superfunding, lifetime exemption tracking,
  2025 sunset action items.

### Changed

- `md_tx`, `md_iv`, `md_rp`, `md_ir`, `md_el` route regexes expanded with new
  trigger keywords (QCD, DAF, IPS, asset location, RMD, Medicare, IRMAA, LTC,
  long-term care, disability, own-occupation, gift tax, Form 709, etc.).
- Orchestrators updated to list new skills.



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

[Unreleased]: https://github.com/dmauser/money-desk/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/dmauser/money-desk/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/dmauser/money-desk/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/dmauser/money-desk/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/dmauser/money-desk/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/dmauser/money-desk/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/dmauser/money-desk/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/dmauser/money-desk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/dmauser/money-desk/releases/tag/v0.1.0
