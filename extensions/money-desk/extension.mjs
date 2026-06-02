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
//
// PERF (v0.19.4): kept intentionally short. The full report-quality config,
// specialist enumeration, and renderer policy live in `md_report_quality`
// and `md_capabilities` — the model can fetch them on demand instead of
// paying the token cost on every turn.
let presenceAnnounced = false;
const PRESENCE_NOTE =
    "[money-desk] Loaded: 20 personal-finance specialists, ~146 tools. " +
    "When the user mentions personal finance, budgeting, taxes, investing, retirement, debt, credit, " +
    "insurance (health / auto / home / life / disability / Medicare / LTC), estate, a major purchase decision, " +
    "college / 529 / FAFSA, net worth / emergency fund, self-employment / 1099 / S-corp, a life event " +
    "(annual review, new baby, job change, home purchase, inheritance, layoff), rental property / house hacking, " +
    "market panic / FOMO / couples money / lifestyle inflation, FIRE / safe-withdrawal-rate, or cross-border / " +
    "expat / FBAR / PFIC / moving country — call `md_capabilities` for the specialist map, or `md_route` with " +
    "the user's query to pick a specialist. Before any user-facing deliverable call `md_report_quality` " +
    "(defaults to markdown inline; PDF/DOCX/XLSX/HTML are *offered*, never auto-written; files land under " +
    "`./money-desk/<specialist-slug>/`). " +
    "Money Desk is analysis-only: never moves money, executes trades, files returns, or signs documents. " +
    "Never claim money-desk is unavailable: it is loaded.";

// Matches the literal extension name in any form: money-desk, @money-desk,
// money desk, moneydesk.
const MD_MENTION = /(^|[^\w])@?money[\s-]?desk\b/i;

// Throttled to once per session — re-injecting on every "money-desk"
// mention bloats context with no marginal value once the model has the
// instruction.
let directInstructionAnnounced = false;
const MD_DIRECT_INSTRUCTION =
    "[money-desk — DIRECT MENTION] The user referenced the money-desk extension by name. " +
    "It IS loaded in this session. Do NOT tell the user it is unavailable. " +
    "Call `md_capabilities` now and answer using its specialist map. If the user asked for examples or how to use it, " +
    "summarize the 20 specialists and suggest 3–5 concrete prompts (e.g. 'zero-based monthly budget', " +
    "'withholding check for 1099 income', 'review my portfolio allocation', 'avalanche vs snowball debt payoff', " +
    "'buy vs lease a new car', 'review my 529 + project college costs', 'net worth + emergency fund target', " +
    "'Solo 401k vs SEP IRA', 'annual financial review', 'new-baby checklist', 'inheritance playbook', " +
    "'underwrite this rental', 'refi my mortgage?', 'market dropped — should I sell?', 'audit my beneficiaries', " +
    "'moving to [country] — what do I need to do?').";

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
            // Throttled to once per session — re-injecting on every mention
            // bloats context with no marginal value.
            if (MD_MENTION.test(input.prompt) && !directInstructionAnnounced) {
                directInstructionAnnounced = true;
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
