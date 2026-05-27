// Extension: money-desk (standalone)
// Self-contained personal-finance agent that bundles 12 specialist roles
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
    "It bundles 12 personal-finance specialists: Budget Coach, Tax Planner, Investing Advisor, " +
    "Retirement Planner, Debt Strategist, Credit & Identity, Insurance Reviewer, Estate & Legacy, " +
    "Purchase Advisor, Education Planner, Net Worth & Goals, Self-Employed Planner. " +
    "Discovery tools available right now: `md_capabilities` (full map), `md_route` (pick a specialist for a query). " +
    "Specialist tool prefixes: md_bc_, md_tx_, md_iv_, md_rp_, md_ds_, md_ci_, md_ir_, md_el_, md_pa_, md_ed_, md_nw_, md_se_. " +
    "When the user mentions personal finance, budgeting, taxes, investing, retirement, debt, credit, " +
    "insurance, estate planning, a major purchase decision, college / 529 / FAFSA, net worth / emergency fund, " +
    "or self-employment / 1099 / S-corp — or says 'money-desk' / '@money-desk' / " +
    "'this extension' / 'what can you do' in a finance context — call `md_capabilities` FIRST before answering. " +
    "Money Desk is analysis-only: never moves money, executes trades, files returns, or signs documents. " +
    "Never claim money-desk is unavailable: it is loaded.";

// Matches the literal extension name in any form: money-desk, @money-desk,
// money desk, moneydesk.
const MD_MENTION = /(^|[^\w])@?money[\s-]?desk\b/i;

const MD_DIRECT_INSTRUCTION =
    "[money-desk — DIRECT MENTION] The user just referenced the money-desk extension by name. " +
    "It IS loaded in this session (82 tools, 12 specialists). " +
    "Do NOT tell the user money-desk is unavailable, unknown, or not part of the CLI. " +
    "REQUIRED next action: call the `md_capabilities` tool now to retrieve the specialist map, " +
    "then answer the user's question using that information. " +
    "If the user asked for examples or how to use it, after calling `md_capabilities` summarize the 12 specialists " +
    "and suggest 3–5 concrete example prompts (e.g. 'build me a zero-based monthly budget', " +
    "'run a withholding check for my 1099 income', 'review my portfolio allocation', " +
    "'compare avalanche vs snowball debt payoff', 'should I buy or lease a new car', " +
    "'review my 529 plan and project college costs', 'what's my net worth and emergency fund target', " +
    "'I'm self-employed — Solo 401k vs SEP IRA?').";

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
