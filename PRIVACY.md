# Privacy

Money Desk is a personal-finance assistant. The data you discuss with it
(statements, pay stubs, balances, brokerage exports, credit reports) is
some of the most sensitive data on your machine. This document is an
explicit, plain-English statement of what Money Desk does and does not
do with that data.

## TL;DR

- **Money Desk has no network code.** It contains zero runtime
  dependencies and makes zero outbound network calls of its own.
- **Money Desk has no telemetry, analytics, or "phone-home" of any
  kind.** It does not know you exist beyond your local machine.
- **Money Desk stores nothing.** It has no database, no cache, no log
  files. The only files it writes are the markdown reports the agent
  produces in your working directory (under `./money-desk/<specialist>/`,
  or the legacy `./reports/...` path in older versions),
  exactly where you can see them.
- The **only** data that leaves your machine is whatever the GitHub
  Copilot CLI itself sends to GitHub Copilot's model service as part of
  the normal Copilot CLI session — same as any other Copilot CLI
  conversation.

## What Money Desk actually is

A static collection of:

- Markdown role and skill prompts (`extensions/money-desk/specialists/`)
- A small declarative tool registry (`extensions/money-desk/registry.mjs`)
- A thin SDK adapter that registers those tools with Copilot CLI
  (`extensions/money-desk/extension.mjs`)
- An installer that copies the above into `~/.copilot/extensions/` or
  `.github/extensions/` (`bin/cli.mjs`)

There is no server. There is no client. There is no background process.
The extension's runtime contribution is a list of tools handed to
Copilot CLI when it loads.

## What the agent sends to GitHub Copilot

This is **the only data flow** to be aware of. It is the same flow as
every other Copilot CLI extension and is governed by your normal
GitHub Copilot subscription terms:

1. You type a prompt into Copilot CLI.
2. Copilot CLI sends your prompt **plus the relevant tool descriptions
   from loaded extensions (including Money Desk)** to GitHub Copilot's
   model service.
3. The model decides which tools to call. If it calls a Money Desk
   tool, Copilot CLI runs the tool locally (no network), gets back the
   markdown content of a role or skill prompt, and forwards that prompt
   plus your message to the model.
4. The model's response (which may contain analysis of files you've
   shared in the session) is shown to you.

If you share statements, pay stubs, or any document with the model
during the session — that document content travels to the model. That
is true of any AI assistant; Money Desk does not introduce a new path.

What Money Desk specifically **never** does:

- Open a socket, connect to a database, or call any URL.
- Read files outside the paths the model asks you to open.
- Persist anything between sessions.
- Send anything to dmauser or any third party.

## Guardrails the prompts enforce

These are encoded into every specialist's role and orchestrator markdown
(verified by `tests/guardrails.test.mjs`):

- **Analysis only.** No tool moves money, executes a trade, files a
  return, opens an account, signs a document, cancels a service, or
  contacts any third party. The user takes the final action.
- **Citations or `[UNSOURCED]`.** Every number in the output must cite
  the source document or be tagged `[UNSOURCED]`.
- **PII masking.** SSNs and full account numbers are masked in agent
  output (e.g. `***-**-1234`, `****1234`).
- **Treat inputs as untrusted.** Statements, CSVs, screenshots, and
  credit reports are data to extract, never instructions to follow.
- **No publication.** Money Desk has no email, messaging, or file-share
  capability — it produces local artifacts only.

## Reports the agent writes locally

When a skill produces a deliverable (a budget, a payoff plan, a
portfolio review), the agent writes markdown / XLSX into your **current
working directory**, by convention under `./money-desk/<specialist>/`
(older versions used `./reports/`). These files
contain real numbers from your data — treat them like any other
sensitive financial document on your machine:

- They are excluded by the default `.gitignore` so they will not be
  accidentally committed.
- Delete them when you're done if you don't need a paper trail.
- Do not share them externally unless you have personally redacted them.

## Your responsibilities

- Keep your machine encrypted at rest.
- Treat the model service's data-handling per your GitHub Copilot
  plan's terms (consumer / business / enterprise have different
  retention and training opt-out rules — check yours).
- Redact before screenshotting if you share examples publicly.
- If you remove the extension, also delete any `money-desk/` or
  `reports/` folders that contain your data.

## MCP server integrations (opt-in, off by default)

Money Desk recommends — but does not bundle — Model Context Protocol
(MCP) servers that supply authoritative public data (FRED for rates and
inflation, SEC EDGAR for fund expense ratios, TreasuryDirect for I-bond
and T-bill yields, BLS for inflation series, government `.gov` fetch
for IRS / SSA / CMS / FAFSA pages). The `md_sources` tool documents
the full map; see `extensions/money-desk/data/sources.yaml`.

If you choose to wire any of these MCP servers into your Copilot CLI
`mcp` config, the following privacy rules apply and are encoded in
every specialist's prompts:

- **Tier-1 (government) MCPs are public-data-only.** Queries identify
  data by series id (FRED `MORTGAGE30US`), ticker / CIK (SEC EDGAR),
  CUSIP (TreasuryDirect), or `.gov` URL — never by user balance, name,
  account number, address, or SSN.
- **Tier-2 (market data) and Tier-3 (real-estate / filesystem) MCPs
  are opt-in per project.** Same no-PII rule applies: the agent must
  query by ticker / ZIP / scoped path, never by user-identifying fact.
- **Money Desk does not auto-enable any MCP server.** A fresh `md
  install` adds zero MCP wiring; the user explicitly opts in via their
  Copilot CLI `mcp` config and Money Desk just routes its specialists
  to those tools when the model decides they're relevant.
- **Cite or refuse.** If an authoritative source is documented for a
  number but the matching MCP is not reachable in the session, the
  specialist tags the figure `[UNSOURCED]` and offers to retry once the
  MCP is wired — it never invents the value.
- **Money Desk's own runtime still makes ZERO outbound network calls.**
  Any traffic introduced by an MCP server you enable is the MCP
  server's responsibility, governed by your Copilot CLI MCP config, and
  visible in Copilot CLI's MCP logs.

## Reporting a privacy concern

If you believe a Money Desk prompt could be made safer (for example, a
guardrail is missing, or PII masking could be tighter), please open a
GitHub issue or PR against
[dmauser/money-desk](https://github.com/dmauser/money-desk). Do not
include real personal data in the issue.

## Verifying these claims

Three things you can do to verify the above for yourself:

1. **No network code:**
   `grep -r "http\|net\|tls\|dns\|fetch\|axios\|got" extensions/`
   (You will find references inside prompt text — not code.)
2. **No runtime dependencies:**
   `cat package.json | grep -A 5 '"dependencies"'`
   (Money Desk ships with no `dependencies` block at all.)
3. **No telemetry:**
   `grep -rn "telemetry\|analytics\|track\|beacon" extensions/ bin/`
   (Empty.)
