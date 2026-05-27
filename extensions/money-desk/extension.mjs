// Extension: money-desk (standalone)
// Self-contained personal-finance agent that bundles 18 specialist roles + curated 2026 facts table
// and their skills. No external extension dependencies required.
//
// This file is intentionally thin — all tool definitions, the routing table,
// and the capabilities/route summary live in ./registry.mjs so they can be
// imported by tests without the Copilot SDK installed.

import { joinSession } from "@github/copilot-sdk/extension";
import { tools, ROUTES, specialistCount } from "./registry.mjs";

// Throttle the auto-routing hook: each specialist prefix is announced at
// most once per session. Without this, every matching prompt re-injects the
// same routing block and crowds the context window.
const announcedPrefixes = new Set();

// Presence note is injected on session start AND on the very first user
// prompt of the session (belt-and-suspenders), so the agent learns
// money-desk exists before deciding it doesn't know about it.
let presenceAnnounced = false;
const PRESENCE_NOTE =
    "[money-desk] The money-desk extension (a.k.a. @money-desk) is LOADED in this session. " +
    "It bundles 18 personal-finance specialists: Budget Coach, Tax Planner, Investing Advisor, " +
    "Retirement Planner, Debt Strategist, Credit & Identity, Health & Medicare, Property & Casualty, " +
    "Life & Disability, Estate & Legacy, Purchase Advisor, Education Planner, Net Worth & Goals, " +
    "Self-Employed Planner, Life Events, Real Estate Investor, Behavioral Coach, International / Expat. " +
    "Discovery tools available right now: `md_capabilities` (full map), `md_route` (pick a specialist for a query), `md_intake` (required-input checklist for a skill — call BEFORE running it so you know what to ask the user), `md_facts` (curated 2026 reference data — IRS limits, tax brackets, IRMAA, FAFSA, real-estate / expat thresholds), `md_citation_conventions` (the 4-tag honesty vocabulary). " +
    "Specialist tool prefixes: md_bc_, md_tx_, md_iv_, md_rp_, md_ds_, md_ci_, md_ih_, md_pc_, md_lp_, md_el_, md_pa_, md_ed_, md_nw_, md_se_, md_le_, md_re_, md_bh_, md_in_. " +
    "When the user mentions personal finance, budgeting, taxes, investing, retirement, debt, credit, " +
    "insurance (health / auto / home / life / disability / Medicare / LTC), estate planning, a major purchase decision, " +
    "college / 529 / FAFSA, net worth / emergency fund, self-employment / 1099 / S-corp, a life event " +
    "(annual review, new baby, job change, home purchase, inheritance, layoff), rental property / house hacking / " +
    "real-estate tax strategy, market panic / FOMO / couples-money / lifestyle inflation, or cross-border / expat / " +
    "FBAR / PFIC / moving country — or says 'money-desk' / '@money-desk' / " +
    "'this extension' / 'what can you do' in a finance context — call `md_capabilities` FIRST before answering. " +
    "Money Desk is analysis-only: never moves money, executes trades, files returns, or signs documents. " +
    "Never claim money-desk is unavailable: it is loaded.";

// Matches the literal extension name in any form: money-desk, @money-desk,
// money desk, moneydesk.
const MD_MENTION = /(^|[^\w])@?money[\s-]?desk\b/i;

const MD_DIRECT_INSTRUCTION =
    "[money-desk — DIRECT MENTION] The user just referenced the money-desk extension by name. " +
    "It IS loaded in this session (119 tools, 18 specialists). " +
    "Do NOT tell the user money-desk is unavailable, unknown, or not part of the CLI. " +
    "REQUIRED next action: call the `md_capabilities` tool now to retrieve the specialist map, " +
    "then answer the user's question using that information. " +
    "If the user asked for examples or how to use it, after calling `md_capabilities` summarize the 18 specialists " +
    "and suggest 3–5 concrete example prompts (e.g. 'build me a zero-based monthly budget', " +
    "'run a withholding check for my 1099 income', 'review my portfolio allocation', " +
    "'compare avalanche vs snowball debt payoff', 'should I buy or lease a new car', " +
    "'review my 529 plan and project college costs', 'what's my net worth and emergency fund target', " +
    "'I'm self-employed — Solo 401k vs SEP IRA?', 'run my annual financial review', " +
    "'we just had a baby — what's the checklist?', 'I just inherited $X — what should I do first?', " +
    "'underwrite this rental property', 'should I refi my mortgage?', " +
    "'market just dropped — should I sell?', 'audit my beneficiaries', " +
    "'we are moving to [country] — what do I need to do?').";

const session = await joinSession({
    tools,
    hooks: {
        onSessionStart: async () => {
            // SessionStart fires on startup / new / resume. Inject the presence
            // note as session-level additional context so the agent knows
            // money-desk exists from turn 1 without waiting for a user prompt.
            presenceAnnounced = true;
            return { additionalContext: PRESENCE_NOTE };
        },
        onUserPromptSubmitted: async (input) => {
            if (!input?.prompt) return;

            const parts = [];

            // Fallback in case onSessionStart didn't fire (older CLI builds).
            if (!presenceAnnounced) {
                presenceAnnounced = true;
                parts.push(PRESENCE_NOTE);
            }

            // Strongest signal: the user literally said "money-desk".
            // Always inject the imperative (not throttled) so a follow-up
            // prompt still gets the nudge if the model previously ignored it.
            if (MD_MENTION.test(input.prompt)) {
                parts.push(MD_DIRECT_INSTRUCTION);
            }

            const matches = ROUTES.filter((r) => r.trigger.test(input.prompt));
            const fresh = matches.filter((m) => !announcedPrefixes.has(m.prefix));
            if (fresh.length > 0) {
                for (const m of fresh) announcedPrefixes.add(m.prefix);
                const guidance = fresh
                    .map((m) => `• **${m.domain}** → \`${m.prefix}_role\` then \`${m.prefix}_orchestrate\``)
                    .join("\n");
                parts.push(
                    `[money-desk] Detected personal-finance intent. Route to:\n${guidance}\n\n` +
                        `Call the role tool first, then orchestrate, then skills. ` +
                        `Call \`md_capabilities\` for the full specialist map. ` +
                        `(This routing hint is shown once per specialist per session.)`,
                );
            }

            if (parts.length === 0) return;
            return { additionalContext: parts.join("\n\n") };
        },
    },
});

await session.log(
    `money-desk loaded — ${specialistCount} specialists, ${tools.length} tools, fully standalone (md_capabilities, md_route)`,
);
