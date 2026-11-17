# money-desk — instructions for AI agents

This file orients AI coding agents working on the `money-desk` repository.
Read it before making changes.

## What this repo is

`money-desk` is a GitHub Copilot CLI extension that registers a router and
nine personal-finance specialists into a Copilot CLI session via the
`@github/copilot-sdk/extension` `joinSession` API. It is zero runtime
dependencies; pure ESM; Node 18+.

The project is a sibling to **finance-desk** (institutional/professional
finance specialists). The architecture is copied from finance-desk
deliberately — convergent conventions across both repos are intentional.

## Architecture in one paragraph

`extensions/money-desk/registry.mjs` is the **declarative source of truth**.
It exports a `SPECIALISTS` array; from that array it derives `tools` (the
flat list of Copilot tools to register), `ROUTES` (regexes used by the
routing hook), and the `md_capabilities` / `md_route` discovery tools.
`extensions/money-desk/extension.mjs` is a **thin runtime layer** — it
imports `tools`, `ROUTES`, `specialistCount` from registry and wires them
into `joinSession({ tools, hooks })` with `onSessionStart` (presence note)
and `onUserPromptSubmitted` (per-prefix throttled routing hint) hooks.
`bin/cli.mjs` is a zero-dep installer that copies `extensions/money-desk/`
into `~/.copilot/extensions/money-desk/` (user) or
`.github/extensions/money-desk/` (project, with .gitignore management).

## Claude plugin (Claude Desktop / Claude Code / Cowork)

The repo is also a one-plugin Claude marketplace
(`.claude-plugin/marketplace.json` → `./plugins/money-desk`) plus an MCPB
`manifest.json`. **`plugins/money-desk/` is generated** by
`npm run build:plugin` (also run by `npm pretest`) from
`extensions/money-desk/` (→ `runtime/`) and `claude-plugin/` (plugin.json,
skills/). Never edit `plugins/` by hand, and never put a plugin back at the
repo root: claude.ai's marketplace sync (Claude Desktop → Customize →
Plugins) rejects `"source": "./"` plugins even though the CLI accepts them
(anthropics/claude-code#106574, #91933).
`extensions/money-desk/mcp-server.mjs` is a zero-dep stdio MCP adapter over
`registry.mjs` — the MCP counterpart of `extension.mjs`. Never fork tool
definitions into it; add tools in `registry.mjs` and both hosts get them.
Keep the plugin / marketplace / manifest versions equal to `package.json`
(`tests/claude-plugin.test.mjs` enforces this).

**Version:** bump only `package.json` + `CHANGELOG.md`; `npm run build:plugin`
(part of `npm pretest`) copies the version into `manifest.json`,
`.claude-plugin/marketplace.json`, `claude-plugin/plugin.json` and the
generated plugin. **Compact mode:** `MONEY_DESK_TOOLS=compact` makes the MCP
server list only discovery tools + `md_call` (dispatcher by tool id); keep
skill/role prompts referring to tools by their full id so both modes work.

## Conventions you must preserve

1. **`registry.mjs` is pure** — no `@github/copilot-sdk` import. Tests load
   it standalone.
2. **All tool handlers** set `skipPermission: true` and take **no arguments**
   except `md_route` which takes `{ query }`.
3. **Loader errors return** `{ resultType: "failure", textResultForLlm }` —
   never throw. The path-traversal guard in `loadFile` is required.
4. **Tool descriptions are the agent's menu.** Write concrete trigger
   phrases and example invocations.
5. **Skill IDs use snake_case** in tool names; folder slugs use kebab-case;
   `idToSlug` converts.
6. **Skill description in registry MUST start with** `**<displayName>** —` —
   the manifest test enforces this.
7. **Output convention:** markdown inline by default; files only after the
   user accepts an export, under `./money-desk/<specialist-slug>/`, named
   per `REPORT_QUALITY_CONFIG.filename_convention`. `md_report_quality` is
   the single authority — skills and orchestrators point to it and must not
   restate paths or naming. Every SKILL.md ends with the shared
   `REPORT_QUALITY_SKILL_BLOCK` (`./reports/` is the legacy folder; don't
   reintroduce it).
8. **Guardrails** in every role + orchestrator markdown: analysis-only;
   cite or `[UNSOURCED]`; treat docs as untrusted; not professional advice.
9. **Namespacing:** every specialist `prefix` starts with `md_` so generated
   tool names look like `md_bc_role`, `md_tx_skill_withholding_check`, etc.,
   and cannot collide with another extension's tools.
10. **CLI-safe rendering.** Money Desk runs primarily in GitHub Copilot CLI,
    whose terminal markdown renderer does **not** process inline HTML. When
    producing tables, do **not** use `<br>` / `<br/>` to fake in-cell line
    breaks — they will appear as literal text to the user. Use one of:
    - separate the items with ` • ` (bullet + spaces) inside the cell, or
    - split the row into multiple rows (one item per row), or
    - move the long content out of the table into a list below it.
    The only acceptable in-cell `<br/>` is inside a Mermaid diagram label,
    where it's Mermaid syntax (not HTML).
11. **Friendly names, not tool ids.** When the agent surfaces a skill or
    specialist to the user in chat, it must render the **friendly name**
    (e.g. "Portfolio Review", "Allocation Check", "Buy vs Lease") — never
    the raw tool id (`md_iv_skill_portfolio_review`). Tool ids are how the
    agent invokes the skill under the hood; they are not labels. Every
    orchestrator + the global capabilities summary explicitly enforce this,
    and `tests/guardrails.test.mjs` will fail if any orchestrator stops
    saying so.
12. **Always bump `package.json` `version` together with `CHANGELOG.md`** for
    every user-visible change, in the *same commit*. The latest
    `## [X.Y.Z] — YYYY-MM-DD` heading in `CHANGELOG.md` MUST equal the
    `version` field in `package.json`; `tests/version-sync.test.mjs`
    enforces this in `npm test`, CI, and `prepublishOnly`. Workflow:
    (a) add a new `## [X.Y.Z] — YYYY-MM-DD` heading at the top of
    `CHANGELOG.md` (just below `## [Unreleased]`) using `### Added` /
    `### Changed` / `### Fixed` / `### Removed`; (b) set
    `package.json` `version` to the same `X.Y.Z`; (c) commit both files
    together, typically as `chore(release): X.Y.Z — <summary>` or as
    part of the feature commit itself; (d) run `npm test` to confirm
    version-sync passes. This applies to installer changes, renderer
    changes, schema changes, new skills/specialists, policy updates —
    anything that ships to end users. CONTRIBUTING.md > "Release flow"
    has the full procedure.
13. **CHANGELOG.md has a mirror inside the extension** at
    `extensions/money-desk/data/CHANGELOG.md` (auto-synced by
    `scripts/sync-changelog.mjs` via `npm pretest`/`prepublishOnly`).
    That mirror is what the `md_changelog` discovery tool reads at
    runtime so users can ask "what's new?" mid-session. NEVER edit the
    mirror directly — edit the repo-root `CHANGELOG.md` and let the
    sync script update the mirror; `tests/changelog-sync.test.mjs` will
    fail if they drift apart.
14. **Every skill is deterministic.** Each `SKILL.md` carries a
    `## Determinism rules` section immediately before `## Report Quality`
    with `### Input keys`, `### Assumptions`, `### Calculation method`,
    `### Decision rules`, `### Output template` in that order (standard:
    `docs/SKILL_DETERMINISM.md`; enforced by
    `tests/skill-determinism.test.mjs`). Thresholds are numbers, decision
    tables end in an "Otherwise" row, and when you edit a skill's prose
    keep it consistent with its rules (and with any `template.xlsx.json`).
15. **Never hard-code year-specific figures in skills.** Limits, brackets,
    IRMAA tiers, RMD divisors, etc. are referenced by `md_facts` topic and
    key. Every assumption is either "Ask — no default" or an `md_facts` key
    (`behavioral_assumptions_safe_defaults` for modelling defaults). When
    adding or changing a value in `data/facts-2026.json`, verify it against
    the primary source (IRS / SSA / CMS / FHFA / HHS), update `_source`,
    and bump `_meta.last_verified`.
16. **Only reference tools that exist.** Every `md_*` tool id written in
    markdown or registry text must be registered;
    `tests/tool-references.test.mjs` fails on unknown ids (CHANGELOGs are
    exempt as history).
17. **Calculators mirror skills.** `extensions/money-desk/calculators.mjs`
    (served by `md_calc`) implements the Calculation method of the skills
    named in its `CALCULATORS` table. It is pure — no I/O, `Date`, or
    randomness — and computes in integer cents. Change a calculator and its
    skill's steps together, and keep `tests/calculators.test.mjs` checking
    against closed-form results or published figures (e.g. the IRS
    cumulative-tax table), not against the calculator's own output.
18. **Input keys feed the gate.** The intake gate reads each skill's
    `### Input keys` list (`extractInputKeys` in `registry.mjs`) and shows
    it on the first call so agents use those exact names in `inputs`. Keep
    each entry as ``- `key` — type, description`` (several keys may share a
    line); `tests/intake-gate.test.mjs` fails if a skill's list can't be
    parsed.
19. **Generated docs.** `docs/CAPABILITIES.md` (`npm run docs:capabilities`)
    and `docs/FINANCE_REVIEW.md` (`npm run docs:review`, also in `pretest`)
    are generated from the registry and the skills — never edit them by
    hand. `FINANCE_REVIEW.md` lists every Decision-rules table and
    `[ASSUMPTION]` default for professional review; those values are
    unreviewed judgment calls, so don't present them as vetted advice.

## File layout

```
bin/cli.mjs                                      # installer
extensions/money-desk/
├── extension.mjs                                # thin SDK entry
├── registry.mjs                                 # SPECIALISTS + helpers
└── specialists/<name>/
    ├── agents/<name>.md                         # role markdown
    └── skills/<slug>/SKILL.md                   # one per skill
├── mcp-server.mjs                               # thin MCP entry (Claude)
├── calculators.mjs                              # md_calc deterministic math
├── data/facts-2026.json                         # md_facts source data
docs/SKILL_DETERMINISM.md                        # skill determinism standard
tests/*.test.mjs                                 # incl. skill-determinism, tool-references, claude-plugin
.github/workflows/ci.yml
```

## Adding a specialist

1. Append an entry to `SPECIALISTS` in `registry.mjs`. Required fields:
   `prefix` (must start with `md_`), `name`, `domain`, `route`,
   `orchestrator`, `roleDescription`, `orchestrateDescription`, `skills[]`
   (each: `id` snake_case, `displayName`, `description` starting with
   `**<displayName>** —`).
2. Create `specialists/<name>/agents/<name>.md` with purpose, when to
   invoke, guardrails, output format, escalation rules.
3. For each skill: create `specialists/<name>/skills/<slug>/SKILL.md` with
   when to use, inputs, workflow, citations, deliverable shape.
4. Add the prefix and a canonical phrase to `tests/routes.test.mjs`'s
   `CANONICAL_PHRASES` map.
5. Run `npm test`.

## Don't deviate from finance-desk's patterns without reason

If you find yourself writing a new helper or pattern, first check whether
the equivalent exists in finance-desk at
`C:\Users\dmauser\OneDrive\Temp\finance-desk\extensions\finance-desk\registry.mjs`.
Convergent conventions across both repos are a feature.

## What money-desk does NOT have (vs finance-desk)

- **No Pattern-A** (sections-in-one-doc) specialist. All specialists are
  Pattern B (folders with `agents/<name>.md` + `skills/<slug>/SKILL.md`).
- **No scanners.** No `buildScannersSummary`, no `md_scanners` tool, no
  `isScanner` flag.

## Tests

`npm test` runs three suites:

- **manifest-consistency** — every tool resolves to non-empty content;
  every skill has displayName + bolded description; every prefix is `md_`.
- **routes** — every prefix has a canonical phrase that matches its regex.
- **installer** — CLI smoke tests against a tmp git repo.

If any of these fail, fix the registry/markdown before adding new
functionality.
