# Money Desk — Routing Contract (`md_route`)

This doc explains how the `md_route` discovery tool decides which specialist(s) handle a given free-text user query, and the conventions for adding or expanding triggers without breaking other routes.

## How it works

The router is a one-line filter in `extensions/money-desk/registry.mjs`:

```js
const matches = ROUTES.filter((r) => r.trigger.test(query));
```

Each entry in `ROUTES` is built from a specialist's `route` field — a single `RegExp` of `\b`-bounded, `/i`-case-insensitive alternations. There is no NLP, no scoring, no priority — just regex match.

This is intentional:
- Zero runtime deps. Pure JS regex inside the SDK extension.
- Deterministic and inspectable. A reviewer can read the regex and predict every match.
- Cheap to extend. New trigger phrasings are pasted into the alternation; tests pin the contract.

## Multi-match is expected

When a query legitimately spans two specialists, `md_route` returns BOTH. Examples:

| Query | Specialists |
|-------|-------------|
| `lean FIRE math at 35% savings rate` | Retirement Planner + FIRE Planner |
| `step-up basis on inherited brokerage` | Tax Planner + Estate & Legacy + Life Events |
| `rollover my old 401(k)` | Retirement Planner + Life Events |

The agent disambiguates at the next turn by asking the user, or by running both specialists' role tools and reconciling. **Adding a new trigger that creates a legitimate overlap is fine** — superset routing is a feature, not a bug. The regression test in `tests/md-route.test.mjs` uses a SUPERSET assertion (`actual ⊇ expected`) precisely so this stays additive.

## Trigger-phrase guidelines

Triggers should be **event-shaped natural language**, not bare nouns. Bare nouns over-trigger and steal queries that belong cleanly to one specialist.

| ❌ Don't add | ✅ Do add |
|-------------|----------|
| `\bhouse\b` | `buying a (home\|house)`, `closing on a (house\|home)`, `first home` |
| `\bjob\b` | `job change`, `new job`, `accepted a (job\|offer)`, `quitting my job` |
| `\bbaby\b` | `had a baby`, `having a baby`, `new baby`, `baby on the way` |
| `\bkids\b` | `college (savings\|fund)`, `529`, `grandparent 529` |
| `\breview\b` | `annual (financial )?review`, `portfolio review`, `financial check-in` |

The pattern: trigger on **verb + life-change context** or on **multi-word noun phrases that only appear in domain copy**.

## Worked example: Life Events vs Purchase Advisor (home buying)

Both specialists touch home purchase. The boundary:

- **Purchase Advisor** = "Should I buy at all? Rent vs buy math, total-cost-of-ownership comparison, affordability sanity check."
  - Triggers: `rent vs buy`, `buy vs rent`, `should I buy or lease`, `total cost of ownership`, `home (buy\|purchase\|down payment)`.
- **Life Events** = "I'm already buying — what do I need to update across taxes / insurance / estate / 30-day windows?"
  - Triggers: `home (purchase\|buying)`, `buying a (home\|house)`, `first home`, `pre-approv(ed\|al)`, `under contract`, `closing on a (house\|home)`, `mortgage application`, `escrow (account\|review\|process)`.

Ambiguous queries like `we're buying a house` legitimately route to BOTH. The orchestrator on the agent side picks the right next step (typically: ask "are you still deciding, or already under contract?"). Don't try to make the regex disambiguate intent that the regex cannot see.

## Adding or expanding triggers — checklist

1. Edit the specialist's `route: /\b(...)\b/i` in `extensions/money-desk/registry.mjs`. Add new alternations; do not rewrite existing ones.
2. Verify the canonical phrase in `tests/routes.test.mjs::CANONICAL_PHRASES[<prefix>]` still matches.
3. Add at least one positive case to `tests/md-route.test.mjs::ROUTING_CASES` for each new phrasing class.
4. If the new trigger could plausibly be confused with another specialist's territory, add a NEGATIVE case (`{ excludes: ["Other Specialist"] }`) to pin the boundary.
5. Run `npm test` — all 425+ tests must pass.

## Regression suites

| Suite | What it pins |
|-------|--------------|
| `tests/routes.test.mjs` | Every prefix has a canonical phrase that matches its regex; route shape (domain / prefix / trigger); the 22 panic / FOMO phrases that must hit Behavioral Coach. |
| `tests/md-route.test.mjs` | Real-world dry-run queries that prompted the 2026-06-02 routing fix: 13 Life Events phrasings, audit fixes for Behavioral Coach + Credit & Identity + Investing Advisor, plus 5 negative cases that guard against over-triggering Life Events. |

When you fix or expand routing, extend `md-route.test.mjs` rather than adding ad-hoc tests elsewhere — this is the canonical location for routing regressions.
