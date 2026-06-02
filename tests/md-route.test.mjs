// Regression suite for `md_route` — guards the 2026-06-02 routing-gap finding.
//
// `md_route` is regex-based: every entry in ROUTES has a `trigger` RegExp,
// and the handler returns ROUTES.filter(r => r.trigger.test(query)). The
// dry-run that motivated this suite found that "we just had a baby what
// do we update" returned no match, plus several other natural-language
// life-event phrasings that real users type. The tests below pin the
// fixed contract using a SUPERSET assertion: each query must route to AT
// LEAST the listed specialists (multi-match is legitimate — e.g. "lean
// FIRE math" intentionally hits both Retirement Planner and FIRE
// Planner). Negative cases assert that single-specialist queries do NOT
// get swallowed by the broadened Life Events trigger.
//
// To extend: add a [query, expectedDomains, options?] tuple. `options`
// supports `excludes: [...]` to assert specific domains do NOT match.

import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES } from "../extensions/money-desk/registry.mjs";

function route(query) {
    return ROUTES.filter((r) => r.trigger.test(query)).map((r) => r.domain);
}

const ROUTING_CASES = [
    // ── Life Events: every playbook trigger phrase the dry-run hit ────
    ["we just had a baby what do we update", ["Life Events"]],
    ["we are having a baby in October", ["Life Events"]],
    ["we are expecting", ["Life Events"]],
    ["expecting in March, what should we plan", ["Life Events"]],
    ["my wife is pregnant", ["Life Events"]],
    ["we are adopting", ["Life Events"]],
    ["I'm taking parental leave", ["Life Events"]],

    ["accepted a new job offer", ["Life Events"]],
    ["I'm quitting my job", ["Life Events"]],
    ["resignation letter format", ["Life Events"]],
    ["rollover my old 401k", ["Life Events"]],
    ["what to do with my old 401(k)", ["Life Events"]],

    ["first home purchase what do we update", ["Life Events"]],
    ["we are pre-approved for a mortgage", ["Life Events"]],
    ["we are under contract on a house", ["Life Events"]],
    ["closing on a house next week", ["Life Events"]],

    ["just inherited 200k", ["Life Events"]],
    ["received an inheritance from my aunt", ["Life Events"]],
    ["bequest from grandma", ["Life Events"]],
    ["9-month disclaimer window", ["Life Events"]],

    ["just got laid off — what about my insurance", ["Life Events"]],
    ["RIF announcement at work", ["Life Events"]],
    ["got let go yesterday", ["Life Events"]],
    ["severance package review", ["Life Events"]],
    ["health insurance after layoff", ["Life Events"]],

    ["annual money check-in", ["Life Events"]],
    ["financial check-in for the year", ["Life Events"]],
    ["financial tune-up", ["Life Events"]],
    ["birthday review of my finances", ["Life Events"]],

    // ── Audit fixes elsewhere ─────────────────────────────────────────
    ["got my first 1099", ["Self-Employed Planner"]],
    ["I keep fighting with my partner about money", ["Behavioral Coach"]],
    ["my partner won't talk about money", ["Behavioral Coach"]],
    ["I keep regretting financial decisions", ["Behavioral Coach"]],
    ["regretting purchases I made last year", ["Behavioral Coach"]],
    ["explain compound interest like I'm 5", ["Financial Literacy"]],
    ["someone opened an account in my name", ["Credit & Identity"]],
    ["account opened in my name without my consent", ["Credit & Identity"]],
    ["I want to dispute a charge on my card", ["Credit & Identity"]],
    ["disputed charge from a vendor", ["Credit & Identity"]],
    ["unauthorized charge on my statement", ["Credit & Identity"]],

    // ── Negative cases: must NOT over-trigger Life Events ─────────────
    ["review my portfolio", ["Investing Advisor"], { excludes: ["Life Events"] }],
    ["budget my groceries", ["Budget Coach"], { excludes: ["Life Events"] }],
    ["should I buy or lease a new car", ["Purchase Advisor"], { excludes: ["Life Events"] }],
    ["rebalance my IRA", ["Investing Advisor"], { excludes: ["Life Events"] }],
    ["best HYSA rates right now", ["Investing Advisor"], { excludes: ["Life Events"] }],
];

for (const [query, expected, opts = {}] of ROUTING_CASES) {
    test(`md_route: "${query}" routes to ⊇ ${JSON.stringify(expected)}`, () => {
        const actual = route(query);
        for (const dom of expected) {
            assert.ok(
                actual.includes(dom),
                `expected ${JSON.stringify(actual)} to include "${dom}" for query "${query}"`,
            );
        }
        if (opts.excludes) {
            for (const dom of opts.excludes) {
                assert.ok(
                    !actual.includes(dom),
                    `query "${query}" must NOT match "${dom}" but did. Full match: ${JSON.stringify(actual)}`,
                );
            }
        }
    });
}

test("md_route returns at least one specialist for every user-quoted dry-run case", () => {
    // Sanity safety net: the original bug was a NO-MATCH return on a clearly
    // life-event-shaped query. If any positive case here returns zero
    // specialists, that's a regression worth surfacing prominently.
    const positives = ROUTING_CASES.filter(([, exp]) => exp.length > 0);
    for (const [query] of positives) {
        const actual = route(query);
        assert.ok(
            actual.length >= 1,
            `md_route returned NO matches for "${query}" — that's the bug class this suite guards against`,
        );
    }
});
