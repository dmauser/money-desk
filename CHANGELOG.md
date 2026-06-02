# Changelog

All notable changes to **money-desk** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.19.7] — 2026-06-02

### Changed

- **`SECURITY.md`** — updated supported-versions table from the stale
  `0.1.x` to `0.19.x` to reflect the actual current release line.
- **`PRIVACY.md`** — updated three references to the legacy `./reports/`
  output path to also mention the canonical `./money-desk/<specialist>/`
  path (per `md_report_quality`), so the privacy doc matches the
  renderer/write-guard contract.

### Notes

Documentation-only release in preparation for flipping the repository
public. Also refreshed the GitHub repo "About" description (was stuck
at "9 specialist agents") and added `fire` / `estate-planning` /
`expat` / `medicare` topics; those changes live on GitHub, not in the
tree.

## [0.19.6] — 2026-06-02

### Performance

Third and final perf pass after v0.19.4 / v0.19.5. Trims the verbose
discovery-tool descriptions that the model re-ingests on every turn,
and confirms that startup cost is not a regression target.

### Changed

- **Slimmed the 11 discovery-tool descriptions** (`md_capabilities`,
  `md_route`, `md_preferences`, `md_facts`, `md_report_quality`,
  `md_citation_conventions`, `md_sources`, `md_changelog`, `md_intake`,
  `md_renderers_sync`, `md_renderers_ensure`) from 9 234 chars down to
  4 358 chars (−53%, ~1 200 fewer tokens per turn). All trigger phrases
  ("call this BEFORE…", "call this FIRST when…") are preserved so
  routing behavior is unchanged; what was cut is self-referential
  meta-prose, repeated bundled-content enumeration that the handler
  output already returns, and stale historical context (e.g. v0.18.7
  recalc-gate references in the `md_renderers_sync` description). Tool
  schemas are sent to the model on every turn, so each character saved
  here is paid back many times across a session.
- **`md_renderers_ensure` description deflated to ~240 chars.** As of
  v0.19.1 the cache auto-syncs before every render-spec-emitting skill
  returns, so the model normally never needs to call this tool — the
  description now reflects that it is a defensive-retry shim, nothing
  more. The tool remains registered (some tests assert that, and a
  manual recovery path is still useful when a render fails with
  `ImportError` / `FileNotFoundError`).

### Verified

- **Cold startup is ~15 ms** for `registry.mjs` import on a Windows /
  Node 24 dev box (146 tools, 20 ROUTES). The 146 tool closures derive
  purely from the static `SPECIALISTS` table with no filesystem reads,
  so there is no startup-side optimization to chase. Closing the item
  out as verified rather than implementing speculative changes.



### Performance

Follow-up to v0.19.4. Two small, zero-risk in-process caches that
eliminate redundant work across the lifetime of a session.

### Fixed

- **In-process content cache for `loadFile()`** keyed by absolute path.
  Specialist role markdown (`specialists/<name>/agents/<name>.md`) and
  every `SKILL.md` are read-only at runtime and never change during a
  session, but each `md_capabilities` / role / skill / orchestrator
  invocation previously re-read its file from disk. With ~150
  reachable markdown files across 20 specialists × 7 skills (avg) plus
  20 role docs, a long session now collapses ~150 fs reads to ~150
  cache hits. Failure paths (path-traversal guard, ENOENT) are
  intentionally not cached so a missing file keeps surfacing the real
  error.
- **Memoized `buildCapabilitiesSummary()`.** The function is pure
  (derives entirely from the static `SPECIALISTS` table) but rebuilt
  the full markdown table + guardrails block on every `md_capabilities`
  call. Now computed once on first call and reused.



### Performance

After v0.19.0–v0.19.1 shipped, end-to-end latency in long sessions
regressed noticeably. Profiling showed two dominant causes — both per-turn
context bloat — plus a smaller per-skill-call filesystem cost. This
release restores the v0.18.x feel without removing functionality.

### Changed

- **Slimmed `PRESENCE_NOTE`** from ~5 KB of prose + the entire 3 KB
  `REPORT_QUALITY_CONFIG` JSON dump down to a ~1 KB single paragraph.
  The presence note is injected into model context on `onSessionStart`
  *and* re-injected on the first user prompt as a fallback, so its size
  multiplies across every turn for the rest of the session. The full
  report-quality contract, the specialist enumeration, the renderer
  policy, the per-specialist tool-prefix table, the discovery-tool
  enumeration, and the response-footer rule have all been removed from
  the presence note — they remain reachable on demand via
  `md_capabilities`, `md_report_quality`, and `md_citation_conventions`.
  Net effect: ~2 000 fewer input tokens per turn.
- **Throttled `MD_DIRECT_INSTRUCTION` to once per session.** Previously
  every user message containing `money-desk` / `@money-desk` re-injected
  the ~2 KB direct-mention instruction block. The instruction is now
  guarded by a `directInstructionAnnounced` flag and slimmed to ~1 KB.
- **Dropped the response-footer mandate from `PRESENCE_NOTE`.** The
  rule forced every assistant turn that touched a finance topic to end
  with a verbatim disclaimer line, costing output tokens on every turn.
  The disclaimer remains a soft convention documented in
  `md_report_quality`; it is no longer hard-required by the presence
  note.

### Fixed

- **`md_report_quality` no longer triggers the renderer-cache auto-sync.**
  In v0.19.1 every call to `md_report_quality` ran
  `_ensureRenderersSynced()` (manifest read + 6 stats per call), and
  the prompt directs the model to call `md_report_quality` before
  every deliverable — duplicating work the skill-loader auto-sync hook
  already performs immediately before returning the workflow. The
  redundant call is removed; the `_meta.renderer_cache_synced` block in
  the report-quality output is replaced with a one-line reminder.
- **Added a 60 s per-process memo to `_ensureRenderersSynced()`** so
  repeated non-forced calls within the same turn (e.g. when a single
  workflow chains multiple render-spec-emitting skills) reuse the prior
  result without re-reading the cache-side manifest or re-stat'ing the
  six tracked renderer files. `force: true` (used by
  `md_renderers_ensure`) bypasses the memo and refreshes it on success.



### Fixed

- **`md_route` was missing the natural-language phrasings real users
  type for Life Events.** A dry-run hit "we just had a baby what do
  we update" and got `No specialist matched.` — the trigger had
  `new baby` and `newborn` but not `had a baby`, `having a baby`,
  `pregnant`, `pregnancy`, `parental leave`, `adopt(ed|ing)`, or
  `baby on the way`. Same gap on every other Life Events playbook:
  Job Change missed `quitting`, `resigning`, `accepted a (job|offer)`,
  `(old|previous) 401(k)`, `rollover my 401k`; Home Purchase missed
  `pre-approv(ed|al)`, `under contract`, `closing on a (house|home)`,
  `mortgage application`, `first home`; Inheritance missed bare
  `inherited`, `bequest`, `estate distribution`, `9-month
  (disclaimer|window)`; Layoff missed `RIF`, `reduction in force`,
  `let go`, `terminated (from|by)`; Annual Review missed
  `(money|financial) check-in`, `financial review`, `financial
  tune-up`, `birthday review`. Trigger now covers all six playbooks
  end-to-end. Anti-over-trigger guards keep bare `house` / `job` /
  `baby` / `escrow` / `change` / `review` out of the alternation so
  single-specialist queries do not get swallowed.

- **Three other specialists had matching audit gaps:**
  - **Behavioral Coach** missed `fighting with my partner about
    money` (the trigger required `fight(ing) about money` adjacent),
    pluralized `regretting financial decisions` / `regretting
    purchases`, and `(partner|spouse) won't talk about money` /
    bare `talk about money`.
  - **Credit & Identity** missed `someone opened an account in my
    name`, `account opened in my name`, `dispute (a) charge /
    transaction / fee`, and `unauthorized charge`.
  - **Investing Advisor** missed `review my (portfolio|investments|
    allocation|holdings)` (the trigger required the noun first:
    `portfolio review`).

### Added

- **`tests/md-route.test.mjs`** regression suite with 46 cases:
  41 positive (using a SUPERSET assertion so multi-match — e.g. a
  401(k) rollover legitimately hitting both Retirement Planner AND
  Life Events — does not break the test) plus 5 negative cases that
  pin the Life Events / single-specialist boundary (`review my
  portfolio`, `budget my groceries`, `should I buy or lease a new
  car`, `rebalance my IRA`, `best HYSA rates right now` must NOT
  match Life Events).
- **`docs/ROUTING.md`** routing-contract document: how `md_route`
  works, why multi-match is supported, the event-shaped-vs-bare-noun
  guideline, the worked Life Events vs Purchase Advisor home-buying
  boundary, and the add-or-expand-triggers checklist.
- `tests/md-route.test.mjs` is now wired into `npm test` and
  `npm run test:watch`.



### Changed

- **`formulas` is now framed as the DEFAULT recalc backend** for
  `make_xlsx.py`'s post-save `validate_workbook()` gate; LibreOffice
  headless and Microsoft Excel + pywin32 are documented as optional
  *accelerators*. The renderer docstring, the `RECALC_SKIP_WARN` /
  `--require-recalc` ERROR messages, the `renderers/README.md` install
  table, and the `report_quality.renderer_policy` prose returned by
  `md_report_quality` were all updated to match. This closes the
  dry-run finding where a clean Windows/macOS dev box without
  LibreOffice and without Excel COM would silently `WARN` past the
  recalc gate and ship workbooks with `#VALUE!` / `#DIV/0!` cells
  through agent self-checks.

### Added

- **`extensions/money-desk/renderers/requirements.txt`** pinning
  `openpyxl>=3.1,<4` and `formulas>=1.3,<2`. Install once with
  `pip install -r requirements.txt` (or per-project under
  `./money-desk/_renderers/`) so every host has a working pure-Python
  recalc backend out of the box, with no LibreOffice / Excel COM
  dependency. The `formulas` package is now shipped to end users
  (previously it was only listed in the test requirements file).
- **`extensions/money-desk/tests/test_make_xlsx_formulas_backend.py`**
  end-to-end smoke test that monkeypatches LibreOffice and Excel COM
  to unavailable so the real `formulas` evaluator is the only backend
  that runs. Three cases pin the contract: (a) a clean
  `=PMT(rate/12, term, -principal)` workbook recalcs cleanly, (b) an
  intentional `=rate/0` workbook materializes `#DIV/0!` and is caught
  by `validate_workbook`, (c) when `formulas` itself fails to import
  the WARN includes `pip install formulas` with prose that frames it
  as the default backend. Runs in CI on Ubuntu without LibreOffice
  installed via `extensions/money-desk/tests/requirements.txt`.



### Changed

- **`md_report_quality` and every render-spec-emitting skill tool now
  auto-sync `./money-desk/_renderers/` in-process before returning.**
  The cache cannot be stale at the moment a deliverable is rendered,
  regardless of whether the LLM remembered to call the public sync
  tool. Warm-path overhead is ≈ 5 ms (in-memory canonical-hash cache
  + cache-side manifest fast-path). The response from
  `md_report_quality` now carries a `_meta.renderer_cache_synced`
  block so the model can verify the sync ran. Skills that emit a
  render spec (any SKILL.md mentioning `template.xlsx.json`,
  `make_xlsx.py`, `make_pdf.py`, `make_docx.py`, or `make_html.py`)
  surface a one-line `🔄 Renderer cache: cache OK (fast-path) / cache
  synced — N file(s) updated` notice in their inputs-received echo.
- `REPORT_QUALITY_CONFIG.renderer_sync.policy` rewritten to reflect
  the auto-sync contract: "treat the cache as ALWAYS-FRESH; do not
  instruct the user to run sync-renderers.ps1 or any manual copy
  step."
- `MD_DIRECT_INSTRUCTION` updated to match.
- `RENDERERS_MANIFEST.json` now also tracks `renderers/README.md` so
  the cache carries the renderer install + self-verification docs
  next to the scripts (6 tracked files, was 5).
- Capabilities banner bumped 145 → **146 tools**.

### Added

- **`md_renderers_ensure`** — a no-args, idempotent defensive-retry
  shim. Use it once if a render fails with `ImportError` or a
  missing-file error against a cached renderer script, then retry the
  render. For explicit drift inspection use `md_renderers_sync` (still
  available with check / apply modes).
- **`extensions/money-desk/lib/renderer_sync.py`** — pure-stdlib
  `ensure_renderer_cache(project_root, *, force=False)` Python module
  for renderers / CI / direct-CLI use. Reads the SAME bundled
  `RENDERERS_MANIFEST.json` as the JS path so both surfaces agree on
  truth. Exposes a `python -m` entry-point with `--project-root` and
  `--force` flags. Atomic manifest write via `os.replace`; thread-safe
  under concurrent calls; never touches files outside the TRACKED
  list.
- `extensions/money-desk/tests/test_renderer_sync.py` — 7 tests
  covering fresh-project sync, stale-overwrite, local-file
  preservation, manifest fast-path skips I/O, `force=True` bypass,
  missing-canonical clear error, and concurrent-call idempotency.
- `tests/renderers-sync.test.mjs` extended with 4 new scenarios:
  `md_renderers_ensure` registration, `md_report_quality`
  auto-sync on first call, fast-path no-op on warm calls, and the
  ensure shim healing a stale cache.

## [0.19.0] — 2026-06-01

### Added

- **`md_renderers_sync` tool** keeps the user's local
  `./money-desk/_renderers/` cache aligned with the canonical renderer
  scripts (`make_xlsx.py`, `make_pdf.py`, `make_docx.py`,
  `make_html.py`, `_branded.py`) shipped inside the extension. Two
  modes: `check` (default) reports drift in a markdown table with a
  one-line verdict (`OK in sync` / `DRIFT — N file(s) out of date`);
  `apply` copies missing or stale files from the extension into the
  cache and re-verifies. **Never modifies or deletes files NOT listed
  in the bundled manifest** — user-authored utilities such as
  `inspect_qa.py` are silently preserved. Tool count: 144 → **145**.
- **`extensions/money-desk/renderers/RENDERERS_MANIFEST.json`**, a
  build-time-generated manifest with `extension_version`,
  `generated_at`, and per-file `{ sha256, bytes }`. Generated by the
  new `scripts/build-renderers-manifest.mjs` and wired into the
  `pretest` hook so the committed manifest can never drift from the
  committed source files.
- **Self-verification WARN inside each renderer.** Each `.py` renderer
  now declares `__renderer_version__` and on import compares it to its
  sibling `RENDERERS_MANIFEST.json`; on disagreement, a single
  `WARN  renderer drift: …` line goes to **stderr** so the user sees
  the issue mid-render. Soft warning only — never raises, so legacy
  caches without a manifest still work.
- `tests/renderers-sync.test.mjs` — clean cache, hash-mismatch
  healing, custom-file preservation, manifest sanity.
- `extensions/money-desk/tests/test_renderers_manifest.py` — sha + byte
  match disk, `__renderer_version__` consistency across every renderer
  + manifest + `package.json`, every `*.py` renderer registered.

### Changed

- **`md_report_quality` now emits a top-level `renderer_sync` policy
  field** instructing the agent to call `md_renderers_sync({mode:'check'})`
  before any XLSX / PDF / DOCX / HTML export and `apply` on drift,
  surfacing the verdict to the user. Stale `./money-desk/_renderers/`
  is the #1 source of "fix shipped but not visible to the user" bugs
  (a real-world report: a v0.18.7 user's cached `make_xlsx.py` was
  2.7 KB short of the bundled file and missing the recalc-gate WARN
  shipped earlier the same day; three other renderers were absent
  entirely).
- Capabilities banner bumped from 144 → 145 tools in `extension.mjs`,
  README, and `MD_DIRECT_INSTRUCTION`.
- `npm pretest` now also runs `node scripts/build-renderers-manifest.mjs`,
  which (a) regenerates the manifest from the canonical source and
  (b) regex-syncs `__renderer_version__` across every renderer to
  match `package.json.version`.

## [0.18.7] — 2026-06-01

### Fixed

- **Rental Property Analyzer: corrected `% of rent` vs `% of price`
  unit mismatch between intake schema and canonical XLSX template
  (HIGH).** The intake schema collected `maintenance_pct` and
  `capex_pct` as "% of rent" but the template's
  `Summary!B8` formula multiplied them by `purchase_price` — a silent
  reference-type bug that overstated operating expenses by ~10× on a
  typical SFR ($25,600/yr instead of $2,496/yr on an 8% answer). Both
  formulas evaluated cleanly so neither the lint pass nor the recalc
  gate caught it. Renamed the schema fields to make units explicit:
  `maintenance_pct_of_price`, `capex_pct_of_price`, `mgmt_pct_of_rent`.
  Renamed the matching named ranges in the template so the JSON
  contract is self-checking. Updated the SKILL.md "Inputs needed"
  prose (1% of property value per year is the correct default for
  both maintenance and capex; the older "8% of rent" capex rule
  under-reserves on appreciated properties).
- **Rental Property Analyzer: `rehab_budget` is now wired into the
  template** (was collected by the intake schema but silently dropped).
  Added an Inputs row + named range and updated the `cash_invested`
  formula to `purchase_price*down_payment_pct + closing_costs +
  rehab_budget`.
- **Rental Property Analyzer: `appreciation_pct` is now surfaced on a
  Projection sheet** (was collected but never used). The full 10-year
  IRR build (rent_growth, expense_growth, exit_cost, depreciation
  recapture, LTCG + NIIT) is targeted for v0.19; in the meantime the
  assumption is visible and citable as `[USER-PROVIDED]` rather than
  silently swallowed.
- **make_xlsx.py recalc gate now warns instead of silently passing
  when no recalculation backend is available.** Previously the gate
  could appear to pass on a clean Windows host without LibreOffice /
  Excel COM / `formulas` — two empty tqdm bars rendered and `OK <path>`
  printed. Now `validate_workbook` returns False and writes a single-
  line `WARN  recalc gate SKIPPED — …` to **stderr** that names every
  attempted backend plus actionable remediation, while keeping stdout
  machine-parseable. Added `--require-recalc` CLI flag (default off):
  when set and no backend is available, `make_xlsx.py` exits with code
  2 instead of 0 — recommended for CI / when the user explicitly asked
  for an XLSX deliverable.

### Added

- `extensions/money-desk/tests/test_schema_template_unit_consistency.py`
  — universal regression test guarding the bug class behind the rental
  analyzer fix. For every shipped template with a structured intake
  schema in `intake-schemas.mjs`, asserts that named ranges sharing a
  name with a schema property classify to the same unit (% of rent vs
  % of price vs % per year vs $ vs years). Sanity-check confirmed: the
  test would have caught the original mismatch immediately.
- `extensions/money-desk/tests/test_xlsx_rental_property_analyzer.py` —
  synthetic-input recompute test pinning Monthly P&I = $1,596.73,
  cash invested = $93,000, NOI = $17,228, debt service = -$19,160.84,
  cash flow before tax = -$1,932.84, cap rate = 5.38%, DSCR = 0.90,
  cash-on-cash = -2.08%. Each assertion names the specific failure
  mode it guards (PMT drift, rehab dropped, % unit drift).
- `extensions/money-desk/tests/test_make_xlsx_recalc_gate.py` — pins
  the new validate_workbook contract: returns False + WARN on stderr
  when every backend is unavailable; `main()` exits 2 only when
  `--require-recalc` is passed; happy path emits no WARN.

## [0.18.6] — 2026-06-01

### Fixed

- **Panic Circuit Breaker now intake-gated (HIGH).** The
  `md_bh_skill_panic_circuit_breaker` tool used to return its 7-step
  protocol on the first call, which let the agent run a panic playbook
  without confirming what triggered it, what the user wanted to do, or
  how much money was on the line. Added an `## Inputs needed` section to
  `behavioral-coach/skills/panic-circuit-breaker/SKILL.md` (trigger,
  urge, dollar_size, account_type, has_written_ips, market_hours; first
  4 required) plus a structured `ask_user` schema in
  `intake-schemas.mjs` so the form renders fast — panic-moment UX
  matters. Sister skills missing the gate header (Decision Journal,
  Money Script Diagnostic, Geographic Arbitrage Planner, Cross-Border
  Investing) also picked up an `## Inputs needed` section so the gate
  is universal.
- **Behavioral Coach router now matches panic / FOMO / crash language
  (MEDIUM).** The `md_bh` regex used to miss `panicking`, `panicked`,
  `market drop`, `market dropping`, `market falling`, `cash out`,
  `cashing out`, `freaking out`, `scared`, `anxiety about`, `fear of
  missing out`, `hot stock`, `hot asset`, `everyone is making money`,
  `should I buy now`, `before it's too late`, and `fight about money`.
  Extended the regex to cover all 22 phrases from the QA list while
  keeping existing matches intact. Added a focused regression test in
  `tests/routes.test.mjs`.
- **Legacy `./reports/` paths replaced with `./money-desk/` (LOW).**
  `md_report_quality` already declared `output_root: "./money-desk/"`,
  but ~115 SKILL.md / agent.md files still hard-coded
  `./reports/<specialist-slug>/` and `./reports/_renderers/`. Swept all
  prose to the canonical `./money-desk/...` paths. The `legacy_root`
  field in the report-quality config stays as documentation of the old
  location.
- **Capabilities banner now says 20 specialists (LOW).** The
  presence note in `extension.mjs`, the `MD_DIRECT_INSTRUCTION` block,
  the `md_capabilities` tool description, and the `README.md` intro all
  used to say "18 personal-finance specialists" / "119 tools" / "139
  tools". Updated to "20" and "144 tools" and added Financial Literacy
  + FIRE Planner to the inline list.

### Added

- **Structured intake schemas for Portfolio Review and Cashflow Review
  (LOW).** `md_iv_skill_portfolio_review` (holdings array,
  account_types_summary, target_allocation, time_horizon_years,
  risk_tolerance, constraints) and `md_bc_skill_cashflow_review`
  (statement_window_months, take_home_income_for_window, has_bank_csv,
  has_credit_card_csv, cash_only_activity_known, notes) now ship a
  ready-to-use `ask_user` payload via `intake-schemas.mjs` instead of
  prose intake. Both drive 9-section deliverables and qualify as
  high-value skills per the capabilities doc.
- **Universal intake-gate regression test.**
  `tests/intake-gate.test.mjs` calls every `md_*_skill_*` tool with no
  inputs and asserts the response contains `intake required` plus the
  Step 1 / Step 2 instructions, then re-invokes with synthetic inputs
  and asserts the workflow + echo are returned. Wired into `npm test`.
  Prevents future regressions where a new skill ships without the gate
  header.

## [0.18.5] — 2026-06-01

### Added

- **Documentation: Word "Update fields?" prompt is expected.** Documented
  the dialog Word shows the first time a user opens a Money Desk `.docx`
  ("This document contains fields that may refer to other files. Do you
  want to update the fields in this document?"). The prompt is fired by
  the auto-generated TOC field on the cover page (combined with v0.18.2's
  `w:updateFields=true` flag) — clicking **Yes** populates the TOC from
  the Heading 1/2/3 styles. New section in
  `extensions/money-desk/renderers/README.md` (full explanation +
  screenshot) and a callout box in the main `README.md` "Report Quality &
  Formats" section. Screenshot: `docs/images/word-update-fields-prompt.png`.

## [0.18.4] — 2026-06-01

### Changed

- **Word reports: restored cover page + TOC.** Reverts v0.18.3's removal
  of the cover page. The `.docx` renderer once again emits the
  `Budget Coach` / `Money Desk - <date>` Title paragraph, the TOC field,
  and a page break before the body. The v0.18.2 `w:updateFields=true`
  workaround is also restored: when the user opens the document, Word
  prompts once ("Update fields?") and populating the TOC fills page 1
  from the Heading 1/2/3 styles. Applies uniformly to every specialist's
  `.docx` output.

## [0.18.3] — 2026-06-01

### Changed

- **Word reports: dropped the cover page.** Content now starts on page 1
  instead of behind a Title + (empty) Table of Contents + page break.
  The v0.18.2 `w:updateFields` workaround did not actually populate the
  TOC in practice — Word still rendered a blank first page — so the
  cover-page scaffolding (`add_toc_field`, `force_update_fields_on_open`,
  the Title paragraph, and the leading page break) has been removed
  outright. The footer (`Money Desk - <Specialist> - <date>`) is
  retained, so specialist + date attribution still appears on every
  page. Applies uniformly to every specialist's `.docx` output.

## [0.18.2] — 2026-06-01

### Fixed

- **Word reports: TOC now auto-populates on open.** The `.docx` renderer
  inserts a Table of Contents field on the cover page, but Word leaves
  TOC fields blank until they're refreshed — which made page 1 look
  empty (just the title + date) until the user manually pressed F9.
  `make_docx.py` now sets `w:updateFields=true` in `settings.xml`, so
  Word prompts once on open ("Update fields?") and populates the TOC
  from the Heading 1/2/3 styles in the body. Applies uniformly to every
  specialist's `.docx` output. Regression-tested in
  `tests/renderer-regression.test.mjs`.

## [0.18.1] — 2026-05-30

### Added

- **README "Recommended Models" section.** Documents that Money Desk's
  guardrails (citation tags, disclaimer footer, intake-before-skill,
  `md_report_quality` pre-write check, friendly-name rendering, no inline
  HTML in tables) are enforced via the system prompt — not the SDK runtime —
  and that adherence varies by model. Frames the recommendation in
  capability terms (instruction adherence, numerical conservatism, format
  fidelity) rather than naming specific model versions, so the guidance
  doesn't go stale as new models ship. Invites users to file issues when
  they observe consistent guardrail drift on a specific model.

## [0.18.0] — 2026-05-29

### Added

- **Report-quality governance: structured config block + write-guard +
  per-specialist destination map.** Closes the bug class where an agent
  ignored the prose Report Quality Rules and either auto-wrote a file
  to the cwd root, or improvised a raw-openpyxl script that produced
  generic Calibri output instead of the canonical Segoe UI + brand-blue
  banner + light-green value_highlight + peach callout layout.
  - New `REPORT_QUALITY_CONFIG` constant in `registry.mjs` exposed as a
    fenced ```json``` block at the top of `md_report_quality` output.
    Keys: `default_format` (`"markdown_inline"`), `offer_export`
    (`true`), `auto_write` (`false`), `pre_write_required_tool`
    (`"md_report_quality"`), `output_root` (`"./money-desk/"`),
    `specialist_subfolder_convention`
    (`"<specialist-slug>/"`), `filename_convention`
    (`"<specialist-slug>_<skill-slug>_<YYYYMMDD>_<HHMM>.<ext>"`),
    `legacy_root` (`"./reports/"`), `write_guard`, `renderers` map,
    `renderer_policy`, `canonical_xlsx_templates_dir`.
  - `md_report_quality` now also returns a per-specialist destination
    table (`./money-desk/<specialist-slug>/` for all 20 specialists)
    and the renderer-required policy as the new TL;DR rule #4.
  - `md_capabilities` table gains a new **Deliverable folder** column so
    routing decisions also drive file destinations (the user can see
    "Real Estate Investor → `./money-desk/real-estate-investor/`" up
    front).
  - `md_preferences` now leads with the same structured destination
    JSON (so it can be the persisted-config authority for one-off
    folder overrides).
- **Inline Report Quality Rules in the system-prompt presence note** as
  a fallback for environments where tool calls might be skipped — the
  literal `REPORT_QUALITY_CONFIG` JSON is embedded so the agent can
  honor the rules even if it never calls `md_report_quality`. The
  presence note also gains a HARD WRITE GUARD ("refuse to write
  before md_report_quality has been called and the user has accepted
  an OFFER to export") and a RENDERER REQUIRED clause ("XLSX → always
  via `make_xlsx.py` with a JSON spec; never raw openpyxl in a one-off
  script").

### Changed

- **Default deliverable destination:** `./money-desk/<specialist-slug>/`
  (was `./reports/<specialist-slug>/`). The old root is documented as
  `legacy_root` in the structured config — files saved under the prior
  convention may still exist; new writes use `output_root`. Renderer
  scripts (`make_pdf.py`, `make_html.py`, `make_xlsx.py`,
  `make_docx.py`) `--outdir` defaults switched from `reports` to
  `money-desk` to match.
- `data/preferences.yaml` `report_quality:` block now opens with an
  authoritative `output_destination:` sub-block listing all the same
  fields as `REPORT_QUALITY_CONFIG`, and the file-naming /
  install-location paths everywhere in the block updated to the new
  root. The `output_destination:` block is the single source of
  truth; `md_report_quality` reads it and emits the JSON config the
  agent must obey.
- Filename convention upgraded from
  `<skill>_<YYYYMMDD>[_scenario_<label>].<ext>` (skill-only) to
  `<specialist-slug>_<skill-slug>_<YYYYMMDD>_<HHMM>[_scenario_<label>].<ext>`
  (specialist + skill + date + time) so a single user can run multiple
  specialists in the same project without filename collisions.

### Tests

- `tests/report-quality.test.mjs` gains 3 new tests:
  (1) the structured JSON config appears in `md_report_quality` output
  with all required keys, the canonical `./money-desk/` root, and the
  `make_xlsx.py` renderer-required clause; (2) `REPORT_QUALITY_CONFIG`
  defaults are stable; (3) `md_capabilities` table includes the
  Deliverable folder column with the right paths for spot-checked
  specialists.
- All prior tests still green: 218 Node + 34 xlsx + 10 branded +
  9 smoke = 271 → **271 + 3 = 274 green**.

### Compatibility note

- This is a behavior change for the deliverable destination. SKILL.md
  prose still mentions the legacy `./reports/<specialist-slug>/` path
  in many places; the structured config in `md_report_quality`
  supersedes that prose. SKILL.md text will be migrated incrementally;
  in the meantime, agents that obey the structured JSON (the documented
  contract) will write to the new root automatically.

## [0.17.0] — 2026-05-29

### Added

- **Hardened XLSX pipeline — two new REQUIRED self-verification gates
  in `make_xlsx.py` close the May-2026 #VALUE! bug class.** A shipped
  workbook had a Summary cell pointing at the Notes free-text column;
  openpyxl never evaluates formulas so the broken file passed all our
  pre-ship checks and the user opened it to a `#VALUE!`. The two gates:
  - `lint_formulas(spec)` — pre-save linter that REJECTS any numeric
    formula (PMT/FV/PV/NPV/IRR/SUM/AVERAGE/MIN/MAX/PRODUCT/COUNT/SUMIF/
    ROUND/ABS/MOD/POWER/SQRT/XIRR/XNPV or arithmetic operators
    `+ - * / ^ %`) whose operands or named-range targets land in a
    column whose `style: "header"` cell value is Notes / Source /
    Citation / Comment / empty. Tokenizes via
    `openpyxl.formula.tokenizer.Tokenizer` so cross-sheet refs and
    named ranges are both followed.
  - `validate_workbook(path)` — post-save headless recalculation pass
    that tries LibreOffice (`soffice --headless --calc --convert-to
    xlsx`), then Excel COM (Windows `win32com.client`), then the
    `formulas` Python package as last resort. Re-opens with
    `data_only=True` (or scans the `formulas` model) and FAILS the
    build on any cell that resolves to `#VALUE!`, `#REF!`, `#DIV/0!`,
    `#NAME?`, `#NUM!`, or `#N/A`.
- New CLI flag `--no-validate` (default off; validation runs by
  default). The renderer API stays backward compatible: `build_sheet`,
  `validate_named_ranges`, `apply_named_ranges` are unchanged.
- New `tests/xlsx_smoke/` suite (9 tests): one parametrized test per
  shipped XLSX template, plus the linter regression and a known-bad
  fixture (`fixtures/notes_column_bug_spec.json`) reproducing the
  exact shape of the original production bug. The smoke suite proves
  (a) the linter blocks the bug at lint time and (b) `validate_workbook`
  catches it post-save even if the lint gate is bypassed.

### Changed

- `data/preferences.yaml` `report_quality.self_verification`:
  - The post-render headless recalculation pass and the formula linter
    are now **REQUIRED** (previously the recalc was a soft "after
    rendering, recalculate…" suggestion and the linter did not exist).
  - Canonical XLSX templates promoted from "preferred" to
    **REQUIRED** for every skill that ships one (and any new skill
    must author a canonical template alongside the report).
- The fire-planner / `swr-stress-test` template's `Coverage years` now
  wraps `NPER` in `IFERROR(..., 9999)` so the canonical default inputs
  (returns > withdrawals → mathematically infinite coverage) no longer
  produce `#NUM!` cells.
- The retirement-planner / `withdrawal-strategy` template's `C11` cell
  changed from `"= spend"` (a string Excel auto-promoted to the
  unbound-name formula `=spend`, producing `#NAME?`) to `"vs spend"`,
  matching the convention used by the rows above.

### Removed

- Nothing.

### Tests

- `tests/xlsx_smoke/test_xlsx_smoke.py` — 9 tests, all green.
- All prior suites still green: 218 Node tests, 44 prior Python tests
  (34 xlsx regression + 10 branded blocks).

## [0.16.0] — 2026-05-29

### Added

- **Render-time auto-styling for PDF + HTML reports — every specialist
  benefits, no per-skill prompt churn required.** New shared helper
  `extensions/money-desk/renderers/_branded.py` runs after markdown2
  converts markdown to HTML and automatically wraps common section
  patterns in the brand CSS classes:
  - `## Executive Summary` / `## TL;DR` / `## Headline Findings` /
    `## At a Glance` / `## Snapshot` / `## BLUF` headings → wrapped
    (heading + next block) in `<div class="executive-summary">` (the
    light-blue panel).
  - Paragraphs leading with `Verdict:` / `Recommendation:` /
    `Bottom line:` / `Decision:` / `Headline:` / `Key takeaway:` →
    converted to `<div class="callout [green|amber|]">` with the color
    auto-classified from emoji (`🟢` `✅` `🟠` `🟡` `⚠️` `🔴` `❌`) or
    keyword cues ("favored" → green, "caution"/"borderline" → amber).
  - Paragraphs leading with `Disclaimer:` or `Note:`, plus italic
    footers like `*Not professional financial advice*`, → wrapped in
    `<p class="note">` (italic gray sidenote style).
  - Idempotent: already-wrapped content is detected and skipped.
- Fixes the gap from v0.14.0 where the new CSS classes
  (`.executive-summary`, `.callout`, `.note`) were defined in the
  renderers but never actually appeared in real reports because no
  SKILL.md taught the agent to emit them. Now any markdown report from
  any of the 93 skills + 20 specialists gets the visual uplift in PDF
  and HTML automatically.

### Changed

- `make_html.py` and `make_pdf.py` now import `_branded.apply_branded_blocks`
  and call it on the markdown2 output before injecting the body into the
  page shell.
- `renderers/README.md` documents the new auto-styling pass with a full
  pattern table and notes that the agent can still emit explicit
  `<div class="kpi-grid">` / `<div class="verdict">` for finer control.

### Tests

- New `tests/test_branded_blocks.py` (10 unit tests) covering every
  pattern: executive-summary wrapping, TL;DR / Headline Findings / BLUF
  variants, verdict + recommendation callouts, color classification
  (green / amber / red), disclaimer notes, "Not professional advice"
  footer, idempotence, no-match-no-change, and case insensitivity.

## [0.15.0] — 2026-05-29

### Added

- **New `md_sources` discovery tool — sources-of-truth map for accuracy.**
  Documents the authoritative public data sources every specialist should
  consult before answering questions about current rates, brackets, prices,
  or fund expense ratios — and the recommended Model Context Protocol (MCP)
  servers that can supply those numbers if the user wires them into their
  Copilot CLI `mcp` config. Tier-1 (default-recommended, public, free,
  no-PII): FRED (rates / inflation / Treasury yields / mortgage),
  SEC EDGAR (fund prospectuses / 10-K), TreasuryDirect (I-bond / T-bill),
  BLS (CPI / college CPI), and a `.gov`-scoped `fetch` MCP for IRS / SSA /
  CMS / FAFSA pages. Tier-2 (opt-in): market-data MCPs (Yahoo / Polygon /
  Alpha Vantage / Tiingo / OpenBB), crypto, and citation-grade web search.
  Tier-3 (opt-in with caveats): real-estate comps, scoped filesystem.
  Each entry maps to specific specialist prefixes (e.g. FRED helps
  `md_pa` / `md_re` / `md_fl` / `md_ds` / `md_ci` / `md_ed` / `md_iv`).
- **`extensions/money-desk/data/sources.yaml`** — single source of truth
  for the recommendations map, including a non-negotiable privacy
  contract: Tier-1 queries are public-data-only, Tier-2 / Tier-3 are
  opt-in per project, no PII ever leaves the agent in any MCP query, and
  if a number has a Tier-1 source but the matching MCP is unreachable in
  the session the specialist tags it `[UNSOURCED]` instead of inventing.
- **Per-role `## Sources of truth` block** added to all 20 specialist
  role files, pointing the agent at `md_sources` whenever it needs a
  current public number that is not covered by `md_facts`.

### Changed

- **`md_citation_conventions` now references `md_sources`** alongside
  `md_facts` / `md_preferences` / `md_report_quality` so the agent knows
  where to go for live macro / market / fund / Treasury data, and the
  `[UNSOURCED]` definition explicitly mentions both `md_facts` and
  `md_sources` as verification paths.
- **`PRIVACY.md` adds an "MCP server integrations" section** spelling
  out the privacy posture for opt-in MCPs (public-data-only Tier-1,
  user-opt-in Tier-2/3, no PII, cite-or-refuse, Money Desk's own runtime
  still makes zero outbound calls).
- **`README.md` Privacy & Guardrails** gains a one-line MCP bullet
  pointing at `md_sources` and the unchanged no-network promise.

### Tests

- New `tests/sources.test.mjs` — verifies `md_sources` is registered,
  returns YAML + privacy-contract content, every role markdown
  references it, and `CITATION_CONVENTIONS` mentions it.

## [0.14.0] — 2026-05-29

### Added

- **Professional "Summary Dashboard" layout for all 6 XLSX templates.**
  Every shipped Summary sheet now opens with a full-width primary-blue
  banner, italic gray subtitle, bordered Metric / Value / Threshold /
  Status table with light-green-highlighted Value column, and a peach
  callout box rendering the headline verdict as a live formula. Matches
  the brand reference screenshot end-to-end and gives every specialist a
  consistent dashboard look. Templates updated:
  - `fire-planner/swr-stress-test`
  - `purchase-advisor/rent-vs-buy` (regression coords B3/B7/B8/B9 preserved)
  - `education-planner/college-cost-projection`
  - `real-estate-investor/mortgage-strategy-review`
  - `real-estate-investor/rental-property-analyzer`
  - `retirement-planner/withdrawal-strategy`
- **New cell styles in `make_xlsx.py`:** `banner`, `section_banner`,
  `subtitle`, `metric`, `value_highlight`, `threshold`, `status`,
  `callout` (in addition to the existing `h1` / `header` / `body`).
  Style dispatch is centralized in `_STYLE_DISPATCH` so adding more
  styles is one line.
- **New cell-spec fields in `make_xlsx.py`:** `merge: "A1:D1"` (per-cell
  merge applied after value/style so openpyxl never writes into a
  non-top-left cell of a merged range) and `border: true` (thin gray
  box border).
- **New sheet-level fields in `make_xlsx.py`:** `column_widths` (e.g.
  `{"A": 38, "B": 16}`), `row_heights` (e.g. `{"1": 26}`), and `merges`
  (e.g. `["A1:D1", "A2:D2"]`) — all additive, no breaking changes.
- **New PDF / HTML branded CSS classes:** `.executive-summary` (light-blue
  TL;DR panel), `.callout` / `.callout.green` / `.callout.amber` (peach /
  green / amber emphasis), `.verdict` (prominent end-of-report verdict),
  `.kpi-grid` + `.kpi` (`.label` / `.value` / `.note`), and `.note`.
  Agents can wrap markdown in `<div class="...">` for brand-consistent
  emphasis blocks across PDF and HTML output.
- **Brand color tokens** for the new dashboard primitives in
  `data/preferences.yaml` (`report_quality.brand.colors`):
  `value_green`, `callout_peach`, `subtitle_gray`, `border_gray`. The
  existing `primary` / `accent_green` / `warning_amber` / `risk_red` /
  `row_stripe` are unchanged.
- **`renderers/README.md`** documents the dashboard layout convention
  end-to-end (style table, sheet-level fields, PDF/HTML class table,
  full HTML example).

### Fixed

- **`make_xlsx.py` no longer produces `*.xlsx.xlsx` output paths** when
  the spec file uses Money Desk's `template.xlsx.json` convention. The
  default output stem now strips a trailing `.xlsx` so
  `template.xlsx.json` → `<specialist>/template.xlsx`.

### Changed

- `make_xlsx.py` `header` style now uses size 11 (was 10), centered
  alignment, and a thin gray border — to match the dashboard column
  headers in the brand screenshot. Existing templates that use
  `style: header` for tabular headers continue to work and look better
  out of the box.

## [0.13.0] — 2026-05-29

### Changed

- **Renderer CLIs now have ergonomic defaults** (parity with
  network-desk). `make_pdf.py`, `make_html.py`, `make_docx.py`, and
  `make_xlsx.py` no longer require `--output`: when omitted, each
  renderer writes to `<outdir>/<specialist-slug>/<input-stem>.<ext>`
  with `--outdir` defaulting to `reports/`. Existing call sites that
  pass `--output` keep working unchanged.
- **`make_xlsx.py` gained a `--specialist` flag** so the default output
  path is grouped under the specialist (was previously missing,
  forcing every xlsx call to specify `--output` explicitly). The
  spec's top-level `"specialist"` field still wins when present.
- **Friendlier error messages for missing dependencies.** All four
  renderers now catch `ImportError` for their third-party deps
  (`markdown2`, `playwright`, `python-docx`, `markdown-it-py`,
  `openpyxl`) and exit with the exact `pip install …` hint instead
  of a raw traceback. `make_pdf.py` also catches Chromium launch
  failures and points at `python -m playwright install chromium`.
- **`make_pdf.py` / `make_html.py` no longer shadow the stdlib `html`
  module** with a local `html` variable — renamed to `page_html` so
  `html.unescape(...)` inside `decode_entities()` continues to work
  even after future refactors.
- **renderers/README.md** updated with the simpler one-flag invocation
  pattern (`--input` + `--specialist` is enough).

## [0.12.0] — 2026-05-28

### Added

- **`md_changelog` discovery tool.** Returns the file preamble plus the
  **last 3 released `## [X.Y.Z] — YYYY-MM-DD` sections** of CHANGELOG.md
  on demand. Designed for "what's new in money-desk?" / "what version
  am I on?" / "release notes" questions. NOT added to the per-session
  broadcast — it's on-demand only, the tool description explicitly
  gates invocation to user-initiated release-notes requests so the
  agent doesn't over-call. Brings the discovery-tool count from 7 → 8
  (`md_capabilities`, `md_route`, `md_intake`, `md_facts`,
  `md_preferences`, `md_report_quality`, `md_citation_conventions`,
  `md_changelog`).
- **`scripts/sync-changelog.mjs`** — mirrors repo-root `CHANGELOG.md`
  → `extensions/money-desk/data/CHANGELOG.md` so the bundled tool can
  read it at runtime. Wired into `npm pretest` and `prepublishOnly`.
- **`tests/changelog-sync.test.mjs`** — byte-identical assertion
  between the two CHANGELOG copies plus structural checks on the
  `md_changelog` handler output (latest version header present,
  `[Unreleased]` excluded, `n=` parameter caps section count).

### Changed

- `package.json` `scripts.test` now includes the new test;
  `scripts.pretest` runs the sync script before tests so drift is
  impossible.

### Bumped (MINOR per CONTRIBUTING.md)

- Adding a new public tool is a feature → `0.11.x → 0.12.0`.

## [0.11.9] — 2026-05-28

### Changed

- **`copilot-instructions.md`** now encodes the
  "always sync `package.json` + `CHANGELOG.md` in the same commit"
  directive as rule 12, alongside the existing 11 conventions. The
  rule was already documented in `CONTRIBUTING.md` > "Release flow"
  and enforced by `tests/version-sync.test.mjs`, but the agent-facing
  instructions did not mirror it — so the installer change in
  `9770bef` shipped without a version bump and required a follow-up
  release commit. Encoding it in the AI-agent instruction file closes
  that gap.

## [0.11.8] — 2026-05-28

### Changed

- **Installer** (`bin/cli.mjs`) now skips `tests/`, `__pycache__/`, and
  `.pytest_cache/` path segments when copying the extension to
  `~/.copilot/extensions/money-desk/` or `.github/extensions/money-desk/`.
  The new pytest suite at `extensions/money-desk/tests/` is a
  developer/CI artifact and doesn't belong in end-user installs. Trims
  ~10 KB and a handful of files from every install. No behavior change
  for any `md_*` tool.

## [0.11.7] — 2026-05-28

### Added

- **Named ranges in XLSX JSON specs.** `make_xlsx.py` now accepts a
  top-level `named_ranges: [{name, ref}, …]` array and emits each as an
  openpyxl `DefinedName`. Validator rejects malformed refs, names that
  point at non-existent sheets, duplicate names, and reserved Excel
  names. Formulas across all sheets can now address inputs by stable
  identifier (e.g. `=PMT(mortgage_rate/12, mortgage_term_years*12,
  -loan_amount)`) instead of brittle `Inputs!B5`-style coordinates.
- **Six canonical XLSX templates** co-located with each skill:
  `purchase-advisor/rent-vs-buy`, `real-estate-investor/{rental-property-analyzer,
  mortgage-strategy-review}`, `retirement-planner/withdrawal-strategy`,
  `education-planner/college-cost-projection`,
  `fire-planner/swr-stress-test`. Templates pre-declare the Inputs
  schema, named ranges, and Summary formulas; the agent only fills
  values and narrative cells — never `A1` coordinates.
- **Python regression test suite** at `extensions/money-desk/tests/`
  (pytest + openpyxl + `formulas`). Covers schema roundtrip, validator
  rejection cases, the canonical Dallas Rent vs Buy scenario
  (Monthly P&I within $5 of $3,726; BUY NW within $1,000 of $394,340;
  RENT NW within $5,000 of $565,700; diff > $150,000), and structural
  guards for every shipped template (named ranges declared; no raw
  cross-sheet coordinates in Summary formulas).
- **`python-tests` CI job** runs the new pytest suite on
  `ubuntu-latest` with Python 3.12 on every push/PR.
- **`renderers/README.md` template-pattern documentation** explains how
  to author a new template and the named-range contract.

### Changed

- **`report_quality.self_verification`** in `data/preferences.yaml` has
  been tightened. Replaced the weak "at least one formula evaluates"
  bullet with four stronger rules: (1) independently recompute every
  headline-figure cell in Python and assert agreement within 1%;
  (2) recalculate the workbook via LibreOffice headless / Excel COM /
  `formulas` before reading values (openpyxl alone does not evaluate
  formulas); (3) cross-format diff every headline figure across
  markdown vs XLSX/DOCX, abort and re-render if any differs by >1%;
  (4) flag any two differently-labeled cells that evaluate to identical
  values as a likely reference-pointing bug.
- Every SKILL.md for the six XLSX-producing skills now carries an
  explicit "template + named-ranges contract" section requiring use of
  the shipped template, named-only references, Python recompute, and
  cross-format diff before declaring done.

### Fixed

- **PDF report generator: HTML entities + table-cell overflow**
  (also released as `1c693cf`). `make_pdf.py` / `make_html.py` /
  `make_docx.py` now pre-decode `&mdash;`, `&times;`, `&ndash;`, etc.,
  before markdown rendering; PDF + HTML CSS gain `overflow-wrap` /
  `word-break` so long narrative cells no longer overrun adjacent
  columns in Chromium-rendered PDFs.

### Bug class prevented

Silent XLSX cell-reference errors. A shipped Rent vs Buy workbook
previously had `Summary!B12` (Monthly P&I) pointing at `Inputs!B6`
(holding horizon = 10) instead of `Inputs!B4` (mortgage term = 30) —
displaying $6,502 instead of the correct $3,726 — and `Summary!B6`
(BUY net worth) pointing at the RENT total instead of BUY equity, so
RENT and BUY both displayed $1,327,980 and the headline "Difference =
$0" was wrong by design. Hand-authoring `A1` coordinates makes these
off-by-one errors invisible (labels and values live in different
cells). Named ranges + canonical templates + Python recompute +
cross-format diff is the defense-in-depth fix.

## [0.11.6] — 2026-05-27

### Added

- **`tests/version-sync.test.mjs`** — fails `npm test` (and CI, and
  `prepublishOnly`) whenever `package.json` `version` doesn't equal the
  most recent `## [X.Y.Z] — YYYY-MM-DD` heading in `CHANGELOG.md`. Catches
  the 0.11.3 → 0.11.5 drift where CHANGELOG entries shipped but the
  package version was never bumped (so `npx money-desk --version` lied).
- **CONTRIBUTING.md → Release flow** — documents the
  CHANGELOG + `package.json` bump requirement for every user-visible
  change.

## [0.11.5] — 2026-05-27

### Fixed

- **Installer now ships `.yaml` / `.yml` data files.** `bin/cli.mjs`'s
  `ALLOWED_EXTENSIONS` allowlist was missing `.yaml`, so installs silently
  dropped `extensions/money-desk/data/preferences.yaml`. The runtime tools
  `md_preferences` and `md_report_quality` then failed with `ENOENT` in the
  installed copy (worked fine from the repo). Added `.yaml` and `.yml` to
  the allowlist. Existing installs can be repaired by re-running the
  installer or copying `data/preferences.yaml` into the installed extension
  folder.

## [0.11.4] — 2026-05-27

### Added

- **Report Quality Rules** — unified deliverable standards across all 20
  specialists. New discovery tool `md_report_quality` returns the full
  policy (output formats, brand styling, 9-section content structure, table
  hygiene, citation tagging, file naming, self-verification). Defaults:
  markdown rendered inline in chat; PDF / DOCX / XLSX / HTML *offered* at
  the end of every deliverable (never auto-written without user opt-in).
- **Renderer scripts** shipped in `extensions/money-desk/renderers/`:
  `make_pdf.py` (Playwright + Chromium), `make_html.py` (standalone, inline
  CSS), `make_xlsx.py` (openpyxl with real formulas), `make_docx.py`
  (python-docx with real Word styles + TOC field). Brand palette
  (`#1a4d8f` / `#2e7d32` / `#d4a017` / `#c0392b`), Segoe UI / Helvetica,
  Letter @ 0.55in margins, Money Desk footer.
- **`report_quality:` block** in `data/preferences.yaml` — single source of
  truth, parsed by `getReportQuality()` and surfaced via the new tool.
- **Broadcast** of the Report Quality reference into all 20 orchestrators,
  20 role markdown files, and 95 SKILL.md files so every specialist call
  picks up the policy without an extra tool invocation.
- **README "Report Quality & Formats"** section documenting the policy.
- **7 new tests** in `tests/report-quality.test.mjs` covering tool
  registration, YAML block presence, broadcast coverage, and renderer
  files on disk. Total test count: 200, all passing.

## [0.11.3] — 2026-05-27

### Changed

- **Investing Advisor route regex broadened** for cash-yield phrasing so
  prompts like "where to keep my cash", "stash my savings", "rate on my
  savings account", "APY on my savings", "interest on my emergency fund",
  "emergency fund yield", "my savings is earning 0.05%", "6-month CD",
  "money market account / fund", "MMDA APY", "online savings", and direct
  references to "depositaccounts.com" / "bankrate" all auto-route to
  Investing Advisor (which can then run **Cash Yield Check**). Verified
  against a 36-phrase keyword fixture; no false negatives on common cash
  shopping language.

## [0.11.2] — 2026-05-27

### Added

- **Investing Advisor → Cash Yield Check** (`md_iv_skill_cash_yield_check`).
  New skill that surveys current high-yield savings, money-market, and
  short-term CD APYs from [depositaccounts.com](https://www.depositaccounts.com/)
  to find the best parking spot for an emergency fund or short-term cash
  bucket. Filters by minimum-balance, fee, and access constraints; computes
  pre- and after-tax dollar pickup vs the user's current APY; flags
  teaser-rate and tier-cap traps; optionally compares to money-market mutual
  funds and short-term Treasury ETFs (with the FDIC-vs-SIPC and state-tax
  distinction called out). Analysis only — never opens accounts.
- The Investing Advisor route regex now matches "money market",
  "high-yield savings / HYSA", "savings rate / APY", "where to park cash",
  and "CD rate / ladder / APY" so the auto-routing hook nudges the agent
  toward this specialist for cash-yield questions.

## [0.11.1] — 2026-05-27

### Added

- **Per-response disclaimer footer.** `PRESENCE_NOTE` and the direct-mention
  instruction in `extension.mjs` now tell the agent to append a one-line
  disclaimer ("Money Desk is informational only and is not professional
  financial, tax, legal, or insurance advice…") at the end of every response
  that touches a personal-finance topic or invokes an `md_*` tool. The
  Copilot SDK exposes no after-response hook, so the rule is enforced via
  session-start context injection (belt-and-suspenders: it's re-stated on
  the first user prompt and on every direct `@money-desk` mention).

## [0.11.0] — 2026-05-27

New **FIRE Planner** specialist (`md_fi`, 🔥) — the strategist for Financial
Independence / Retire Early. Unlike Retirement Planner (which assumes the
traditional 65+ regime with Social Security bridging and a ~25-year horizon),
FIRE Planner owns the early-retirement decision tree: 30–60-year horizons,
pre-59½ access mechanics, pre-65 healthcare, sequence-of-returns risk, the
lean / coast / barista / chubby / fat flavor decision, and the bridge / Roth
conversion ladder. It's a **router into other specialists** for execution —
hands off conversion mechanics to Tax Planner, glide-path allocation to
Investing Advisor, ACA enrollment to Health & Medicare, "one-more-year
syndrome" to Behavioral Coach, and international geo-arbitrage to
International / Expat.

### Added

- 🔥 **New specialist:** FIRE Planner (`md_fi`, 20th specialist) with 8 skills:
  - **FIRE Number Calculator** — 4% / 3.5% / 3% range with lean / coast / barista / chubby / fat flavor scenarios; never quotes a single point estimate
  - **Safe-Withdrawal Stress Test** — Trinity / Bengen / Kitces guardrails / Bogleheads VPW across multiple historical and bad-decade scenarios; sequence-of-returns risk surfaced explicitly
  - **FIRE Flavor Classifier** — lean / coast / barista / chubby / fat tradeoffs given the user's number, lifestyle, and identity-after-work concerns
  - **Savings-Rate Optimizer** — MMM-style "years to FI" sensitivity; where the next 5% comes from (hand-off to Budget Coach)
  - **Pre-59½ Bridge Strategy** — taxable bridge sizing vs SEPP/72(t) vs Roth conversion ladder; IRREVERSIBLE-decision warnings on SEPP elections
  - **Pre-65 Healthcare Plan** — ACA-MAGI management, subsidy cliff awareness, HSA stacking; flags as the #1 single-point-of-failure for early retirement
  - **Withdrawal Order Optimizer** — tax-bracket-filling early years (Roth conversions in 0% LTCG / low-bracket window), IRMAA tiering, the standard-deduction floor
  - **Geographic Arbitrage Planner** — domestic and international cost-of-living-shift framing; hands off the tax mechanics (FBAR / PFIC / FEIE) to International / Expat
- 📋 **Intake schemas** (v0.9.0 hard-gated UX) for the 4 highest-leverage skills: FIRE Number Calculator, Safe-Withdrawal Stress Test, Pre-59½ Bridge Strategy, Withdrawal Order Optimizer. Designed with the v0.9.0 zero-assumption rule — no opinion defaults for returns / inflation / longevity / bond %; every assumption is a required input.
- 🔁 **Three-direction handoff wiring** in `registry.mjs`:
  - **Forward** — every FIRE SKILL.md ends with a `**Next step → @[Specialist]:** "..."` line pointing at the right execution arm (`md_tx` for ladders, `md_iv` for glide paths, `md_ih` for ACA, `md_bc` for budget surgery, `md_bh` for one-more-year syndrome, `md_in` for FBAR / FEIE, `md_nw` for tracking the number).
  - **Reverse** — `md_rp`, `md_iv`, `md_nw`, and `md_bc` orchestrator text now explicitly routes FIRE / early-retirement / 4%-rule / lean-coast-barista-chubby-fat language to `md_fi_role`, preventing silent absorption into the traditional-retirement / allocation / budgeting flows.
- 📊 **Specialist count:** 19 → **20**.
- 🧰 **Tool count:** 129 → **139** (8 new skill tools + role + orchestrator).
- 🛣️ **Route regex** covers the full FIRE community vocabulary: FIRE / FI / financial independence / retire early, the 4% rule, Bengen / Trinity / Kitces / Bogleheads VPW, lean / coast / barista / chubby / fat FIRE, SEPP / 72(t) / Rule of 55, Roth conversion ladder, ACA subsidy cliff, MMM / ChooseFI / Bogleheads, geographic arbitrage / nomad / slow-travel.

### Design — strategy, not advice

- **Education-first framing.** Assumes the user has read FIRE basics; leads with the *decision*, not the *definition*.
- **No opinion defaults.** Same v0.9.0 rule as the original hard-gated rollout: returns, inflation, longevity, bond %, healthcare cost — all required from the user. Schemas do not pre-fill them.
- **Withdrawal rate ranges, not point estimates.** Every projection shows 3% / 3.5% / 4% / 4.5%; never quotes "the 4% rule" as a single answer.
- **Sequence-of-returns risk is loud, not buried.** Every projection skill must show the bad-decade scenario, not just the average.
- **No "you should FIRE" / "you shouldn't FIRE."** Strategy and tradeoffs only — never life advice.
- **IRREVERSIBLE-decision warnings** for SEPP/72(t) elections and FBAR reporting, with explicit "execute with a CPA, not a chat transcript" framing.

### Changed

- `registry.mjs` — 4 existing specialist orchestrators (`md_rp`, `md_iv`, `md_nw`, `md_bc`) gained a one-line reverse-handoff sentence routing FIRE-shaped intent to `md_fi`.
- `docs/CAPABILITIES.md` regenerated from registry.
- `package.json` description now lists FIRE alongside the other domains.

### Tests

- 190 tests passing (was 188), including the new `md_fi` canonical-phrase routing fixture and the auto-validated FIRE intake schemas.

## [0.10.0] — 2026-05-27

New **Financial Literacy** specialist (`md_fl`) — the on-ramp and plain-language
interpreter for the rest of Money Desk. While the other 18 specialists are
*diagnostic* ("analyze my X, recommend Y"), this one is **explanatory**: its
job is to make the concept click, define the term, demystify the document, or
set up the foundational mental model — then hand off to the right diagnostic
specialist. No shaming, ever.

### Added

- 🎓 **New specialist:** Financial Literacy (`md_fl`, 19th specialist) with
  8 skills:
  - **Concept Explainer** — any money concept at user-chosen depth (beginner / intermediate / pro)
  - **Glossary Lookup** — terse definitions + "what most people get wrong" + deep-dive pointer
  - **Paycheck Walkthrough** — line-by-line pay stub decode, red flags, hand-off to Withholding Check
  - **Account Type Map** — every common account (checking / HYSA / 401k / IRA / HSA / 529 / I-Bonds) with tax treatment + the 10-step default placement order
  - **Money Myths Debunk** — evidence-based corrections (credit cards bad, renting throws money away, max your 401k, carry a small balance, whole life is investment, time vs timing, etc.) with verdicts and primary citations
  - **Statement Walkthrough** — generic decode of brokerage / 401(k) / mortgage / EOB statements
  - **Beginner Roadmap** — 12-month sequenced curriculum for someone starting from zero
  - **Teach a Kid** — age-appropriate money lessons across 5 stages + the custodial Roth IRA pitch ($3k at 16 ≈ $100k at 67)
- 📊 **Specialist count:** 18 → **19**.
- 🧰 **Tool count:** 119 → **129** (8 skill tools + role + orchestrator).
- 🛣️ **Route regex** triggers on educational phrasings: "what is X?", "explain Y in plain English", "is it true that...?", "where do I start?", "teach my kid about money", "APR vs APY", "compound interest", "Roth vs Traditional", paycheck/statement walkthroughs, etc.

### Design — explanatory, not diagnostic

- Most Financial Literacy skills **don't have an intake gate** (deliberately) —
  explaining a concept shouldn't require a structured form first. The two
  exceptions (Paycheck Walkthrough, Statement Walkthrough) do gate, since
  those need the actual document.
- Every output ends with **one specific next step** — either a glossary term
  to look up next, the diagnostic skill that uses the concept, or a concrete
  action for the week.
- **No fabricated statistics.** If a citation isn't available, the skill says
  `[UNSOURCED]` and tells the user to verify — never "studies show 90% of
  people…".
- **No security ticker recommendations.** "Here's what an ETF is" → in scope.
  "VTSAX is the best ETF" → out of scope.

### Tests

- New canonical-phrase fixture for `md_fl`.
- Regenerated `docs/CAPABILITIES.md`.
- **179/179 pass** (was 168).

## [0.9.0] — 2026-05-27

Intake gate now emits **ready-to-use `ask_user` JSON schemas** for the 10
highest-value skills. When the agent hits the gate, it doesn't have to invent
a form — the gate response hands it a fenced `requestedSchema` JSON block to
copy verbatim into its built-in `ask_user` elicitation widget. Result: the
user sees a polished tabbed form for the questions, every time, with **zero
silent assumptions** for values that should come from them (interest rate,
tax rate, vacancy %, lease residual, etc.).

### Added

- 📋 **Structured `ask_user` schemas** for 10 priority skills:
  Contribution Optimizer, Retirement Projection, Social Security Review,
  Life Insurance Needs, Emergency Fund Assessment, Net Worth Snapshot,
  Withholding Check, Health Plan Selector, Rental Property Analyzer,
  Buy vs Lease. Defined in `extensions/money-desk/intake-schemas.mjs`.
- 🛑 **Gate response includes the form payload** — when a skill ships an
  intake schema, the first-call gate response emits a fenced ```json block
  containing the exact `{ message, requestedSchema }` payload for the agent's
  `ask_user` tool, plus instructions to render the form rather than ask in
  chat prose. Skills without a schema fall back to the prose path unchanged.
- 🔍 **`md_intake` surfaces schema availability** — when previewing a skill's
  intake, the response now flags whether a structured `ask_user` payload is
  available.

### Design — minimize silent assumptions

The schemas deliberately **omit `default` values** for any field that
represents a meaningful financial assumption (interest rate, vacancy %, tax
rate, lease residual, longevity outlook, real return, appreciation). Those
fields are marked `required` so the form will not submit until the user
provides them — eliminating the "agent picked 7% interest because that
sounded reasonable" failure mode. Defaults are reserved for genuine zeros
("Do you have a HELOC?") and a single technical convention (30-year loan
term).

### Tests

- New: `INTAKE_SCHEMAS: every key references a real skill tool`.
- New: `INTAKE_SCHEMAS: every entry is well-formed`.
- New: `skill loader emits structured ask_user payload when an intake schema
  is defined` — verifies the JSON block parses cleanly and contains the
  expected `requestedSchema.properties` and `required` keys.
- Updated: `skill loader gates on no-inputs call` now accepts either prose
  ("Ask the user") or structured ("Call `ask_user`") Step 1 wording.
- **168/168 pass** (was 165).

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

[Unreleased]: https://github.com/dmauser/money-desk/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/dmauser/money-desk/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/dmauser/money-desk/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/dmauser/money-desk/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/dmauser/money-desk/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/dmauser/money-desk/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/dmauser/money-desk/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/dmauser/money-desk/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/dmauser/money-desk/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/dmauser/money-desk/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/dmauser/money-desk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/dmauser/money-desk/releases/tag/v0.1.0
