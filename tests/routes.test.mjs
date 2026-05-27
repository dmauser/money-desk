// Asserts that every entry in ROUTES is a working regex that matches at
// least one canonical phrase. Guards against typos in the routing table.

import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES } from "../extensions/money-desk/registry.mjs";

// One representative phrase per prefix.
const CANONICAL_PHRASES = {
    md_bc: "Build me a zero-based monthly budget and audit my subscriptions.",
    md_tx: "Run a withholding check and review my deductions for 1099 income.",
    md_iv: "Review my portfolio allocation and propose a rebalance plan.",
    md_rp: "Project my retirement and optimize 401k/Roth IRA contributions.",
    md_ds: "Draft a debt payoff plan with avalanche vs snowball comparison.",
    md_ci: "Review my credit report and write a dispute letter for a collection.",
    md_ih: "Compare HDHP+HSA vs PPO for open enrollment and check Medicare IRMAA for next year.",
    md_pc: "Review my auto and home declarations page and size an umbrella policy.",
    md_lp: "How much term life insurance do I need? Run a DIME computation and audit my beneficiaries.",
    md_el: "Inventory my estate documents and audit beneficiaries.",
    md_pa: "Should I buy or lease a new car? Run a total cost of ownership comparison.",
    md_ed: "Review my 529 plan and project college costs for my kid; how does FAFSA work?",
    md_nw: "What's my net worth and how much emergency fund do I need for sinking funds?",
    md_se: "I just went 1099 — should I set up a Solo 401k or SEP IRA, and what about quarterly estimated taxes?",
    md_le: "We just had a baby — walk me through the new baby playbook with the 30-day insurance window.",
    md_re: "Underwrite this rental property — run cap rate, cash-on-cash, and a sell-vs-hold analysis.",
    md_bh: "The market just dropped 5% and I want to sell everything — should I?",
    md_in: "I'm a US citizen moving to Portugal next year — what about FBAR, PFICs, and FEIE vs FTC?",
    md_fl: "Can you explain what a Roth IRA is in plain English?",
    md_fi: "When can I retire if I save 50% of my income?",
};

test("every prefix has a canonical phrase fixture", () => {
    const routePrefixes = new Set(ROUTES.map((r) => r.prefix));
    const fixturePrefixes = new Set(Object.keys(CANONICAL_PHRASES));
    assert.deepEqual([...routePrefixes].sort(), [...fixturePrefixes].sort());
});

for (const r of ROUTES) {
    test(`route regex compiles and matches canonical phrase: ${r.prefix}`, () => {
        assert.ok(r.trigger instanceof RegExp, `${r.prefix} trigger must be a RegExp`);
        const phrase = CANONICAL_PHRASES[r.prefix];
        assert.ok(
            r.trigger.test(phrase),
            `${r.prefix} regex ${r.trigger} did not match canonical phrase: "${phrase}"`,
        );
    });
}

test("each route has the required shape", () => {
    for (const r of ROUTES) {
        assert.equal(typeof r.domain, "string");
        assert.equal(typeof r.prefix, "string");
        assert.ok(r.trigger instanceof RegExp);
    }
});
