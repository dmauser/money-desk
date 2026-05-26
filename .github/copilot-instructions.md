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
7. **Output convention** baked into prompts: multi-account reports →
   `./reports/<specialist-name>/`; single-account playbooks →
   `./reports/<ACCOUNT>/`.
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

## File layout

```
bin/cli.mjs                                      # installer
extensions/money-desk/
├── extension.mjs                                # thin SDK entry
├── registry.mjs                                 # SPECIALISTS + helpers
└── specialists/<name>/
    ├── agents/<name>.md                         # role markdown
    └── skills/<slug>/SKILL.md                   # one per skill
tests/{manifest-consistency,routes,installer}.test.mjs
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
