# Specialist Prefixes

Every Money Desk specialist owns a short two-letter **prefix** (always starting with `md_`). The prefix is how the underlying tools are named — you almost never need to type one yourself, because the router will pick the right specialist from your plain-English request. They show up in a few places worth recognizing:

- **Tool names** the agent calls under the hood: `<prefix>_role`, `<prefix>_orchestrate`, `<prefix>_skill_<id>` (e.g. `md_iv_role`, `md_tx_skill_withholding_check`).
- **`md_route`** output, when you ask the router which specialist fits a query.
- **`md_capabilities`** output, which lists every tool grouped by prefix.
- **Report folders** under `./reports/<specialist-name>/` — these use the friendly name, not the prefix.

The `md_` namespace prevents collisions with any other Copilot CLI extension you may have installed.

## Prefix → Specialist

| Prefix | Specialist |
|--------|------------|
| `md_bc` | 💰 Budget Coach |
| `md_tx` | 🧾 Tax Planner |
| `md_iv` | 📈 Investing Advisor |
| `md_rp` | 🏖️ Retirement Planner |
| `md_ds` | 💳 Debt Strategist |
| `md_ci` | 🛡️ Credit & Identity |
| `md_ih` | 🏥 Insurance — Health & Medicare |
| `md_pc` | ☂️ Insurance — Property & Casualty |
| `md_lp` | 🪢 Insurance — Life & Disability |
| `md_el` | 📜 Estate & Legacy |
| `md_pa` | 🛒 Purchase Advisor |
| `md_ed` | 🎓 Education Planner |
| `md_nw` | 📊 Net Worth & Goals |
| `md_se` | 🧑‍💻 Self-Employed Planner |
| `md_le` | 🗓️ Life Events |
| `md_re` | 🏘️ Real Estate Investor |
| `md_bh` | 🧠 Behavioral Coach |
| `md_in` | 🌍 International / Expat |
| `md_fl` | 📚 Financial Literacy |
| `md_fi` | 🔥 FIRE Planner |

## Per-specialist tool shape

For each specialist `<prefix>`:

| Tool | Purpose |
|------|---------|
| 🎭 `<prefix>_role` | Loads the specialist's persona, scope, and guardrails |
| 🧭 `<prefix>_orchestrate` | Step-by-step orchestration prompt for the agent |
| 🛠️ `<prefix>_skill_<id>` | Runs an individual playbook (typically 3–5 per specialist) |

## Top-level discovery / reference tools

These are not tied to any one specialist — they sit at the Money Desk root:

| Tool | Purpose |
|------|---------|
| 🗺️ `md_capabilities` | List the full team and every skill |
| 🧭 `md_route` | Given a query, return the most relevant specialist(s) |
| ⚙️ `md_preferences` | Read the persisted source-selection config (e.g. DepositAccounts.com as default for HYSA/MMA/CD rates) |
| 📚 `md_facts` | Curated 2026 reference data (IRS limits, brackets, IRMAA, FAFSA, etc.) — cite as `[<Friendly Label>]` |
| 📝 `md_intake` | Returns the "Inputs needed" checklist for any skill before you run it |
| 🏷️ `md_citation_conventions` | The 4-tag honesty vocabulary (`[USER-PROVIDED]`, `[ASSUMPTION: <value>]`, `[<Friendly Source Label>]`, `[UNSOURCED]`) |

## You almost never type these directly

In normal use you just describe what you need ("audit my budget", "review my 401k", "should I lease or buy?") and the router invokes the right `<prefix>_role` + `<prefix>_orchestrate` + skill chain for you. Prefixes are useful when you want to:

- Pin a request to a specific desk: *"use the @money-desk tax planner to…"*
- Ask discovery questions: *"what tools does `md_iv` have?"*
- Read logs or reports and recognize which specialist produced them.
