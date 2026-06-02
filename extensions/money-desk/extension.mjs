// Extension: money-desk (standalone)
// Self-contained personal-finance agent that bundles 18 specialist roles + curated 2026 facts table
// and their skills. No external extension dependencies required.
//
// This file is intentionally thin — all tool definitions, the routing table,
// and the capabilities/route summary live in ./registry.mjs so they can be
// imported by tests without the Copilot SDK installed.

import { joinSession } from "@github/copilot-sdk/extension";
import { tools, ROUTES, specialistCount, REPORT_QUALITY_CONFIG } from "./registry.mjs";

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
    "It bundles 20 personal-finance specialists: Budget Coach, Tax Planner, Investing Advisor, " +
    "Retirement Planner, Debt Strategist, Credit & Identity, Health & Medicare, Property & Casualty, " +
    "Life & Disability, Estate & Legacy, Purchase Advisor, Education Planner, Net Worth & Goals, " +
    "Self-Employed Planner, Life Events, Real Estate Investor, Behavioral Coach, International / Expat, " +
    "Financial Literacy, FIRE Planner. " +
    "Discovery tools available right now: `md_capabilities` (full map), `md_route` (pick a specialist for a query), `md_intake` (required-input checklist for a skill — call BEFORE running it so you know what to ask the user), `md_facts` (curated 2026 reference data — IRS limits, tax brackets, IRMAA, FAFSA, real-estate / expat thresholds), `md_preferences` (persisted user config — currently locks in DepositAccounts.com as the default source for HYSA/MMA/CD/reward-checking rates, fund-issuer pages for MMFs, TreasuryDirect for T-bills; call this BEFORE quoting any deposit-product rate), `md_report_quality` (persisted Report Quality Rules — call this BEFORE producing ANY user-facing deliverable; defaults to markdown inline in chat only with PDF/DOCX/XLSX/HTML *offered* at the end, never auto-written), `md_citation_conventions` (the 4-tag honesty vocabulary). " +
    "Specialist tool prefixes: md_bc_, md_tx_, md_iv_, md_rp_, md_ds_, md_ci_, md_ih_, md_pc_, md_lp_, md_el_, md_pa_, md_ed_, md_nw_, md_se_, md_le_, md_re_, md_bh_, md_in_. " +
    "When the user mentions personal finance, budgeting, taxes, investing, retirement, debt, credit, " +
    "insurance (health / auto / home / life / disability / Medicare / LTC), estate planning, a major purchase decision, " +
    "college / 529 / FAFSA, net worth / emergency fund, self-employment / 1099 / S-corp, a life event " +
    "(annual review, new baby, job change, home purchase, inheritance, layoff), rental property / house hacking / " +
    "real-estate tax strategy, market panic / FOMO / couples-money / lifestyle inflation, or cross-border / expat / " +
    "FBAR / PFIC / moving country — or says 'money-desk' / '@money-desk' / " +
    "'this extension' / 'what can you do' in a finance context — call `md_capabilities` FIRST before answering. " +
    "Money Desk is analysis-only: never moves money, executes trades, files returns, or signs documents. " +
    "Never claim money-desk is unavailable: it is loaded.\n\n" +
    "REPORT QUALITY RULES — INLINE FALLBACK (also returned by `md_report_quality`):\n" +
    "```json\n" +
    JSON.stringify(REPORT_QUALITY_CONFIG, null, 2) + "\n" +
    "```\n" +
    "**HARD WRITE GUARD:** Refuse to write any .pdf / .docx / .xlsx / .html / .md deliverable file before BOTH " +
    "(a) `md_report_quality` has been called this turn, and (b) the user has explicitly accepted an OFFER to export. " +
    "Default behavior is markdown rendered inline in chat. Files land under " +
    "`./money-desk/<specialist-slug>/<specialist-slug>_<skill-slug>_<YYYYMMDD>_<HHMM>.<ext>` — NEVER in the cwd root, " +
    "NEVER under random ad-hoc names like `Mortgage_Scenarios.xlsx`. Use the slug from `md_capabilities` (the " +
    "Deliverable folder column) so the destination matches the routing decision.\n" +
    "**RENDERER REQUIRED:** Every deliverable MUST go through the canonical renderer. " +
    "PDF → `make_pdf.py`. HTML → `make_html.py`. **XLSX → `make_xlsx.py` ALWAYS** (emit a JSON spec and run " +
    "`make_xlsx.py --spec spec.json --specialist \"<Name>\"`; do NOT write .xlsx with raw openpyxl in a one-off " +
    "script — that produces ugly Calibri output and bypasses the brand styling, the linter, and the recalc gate). " +
    "DOCX → `make_docx.py`. Renderer scripts ship at `extensions/money-desk/renderers/`; copy them once into " +
    "`./money-desk/_renderers/` and reuse from there. Canonical XLSX templates (banner / header / value_highlight / " +
    "callout layout matching the brand) live at " +
    "`extensions/money-desk/specialists/<specialist>/skills/<skill>/template.xlsx.json` for 6 high-frequency skills; " +
    "start from those when present.\n\n" +
    "RESPONSE FOOTER (REQUIRED): At the end of EVERY assistant response in this session that touches personal finance " +
    "— any turn where you called an `md_*` tool, or where you discussed budgeting, taxes, investing, retirement, debt, " +
    "credit, insurance, estate, education, real estate, self-employment, or any other money-desk topic — append the " +
    "following disclaimer on its own line, after all other content, verbatim:\n\n" +
    "> ⚠️ _Money Desk is informational only and is not professional financial, tax, legal, or insurance advice. " +
    "Review any decision with a qualified professional (CPA, fee-only CFP®, estate attorney, or licensed insurance broker) before acting._";

// Matches the literal extension name in any form: money-desk, @money-desk,
// money desk, moneydesk.
const MD_MENTION = /(^|[^\w])@?money[\s-]?desk\b/i;

const MD_DIRECT_INSTRUCTION =
    "[money-desk — DIRECT MENTION] The user just referenced the money-desk extension by name. " +
    "It IS loaded in this session (145 tools, 20 specialists). " +
    "Do NOT tell the user money-desk is unavailable, unknown, or not part of the CLI. " +
    "REQUIRED next action: call the `md_capabilities` tool now to retrieve the specialist map, " +
    "then answer the user's question using that information. " +
    "If the user asked for examples or how to use it, after calling `md_capabilities` summarize the 20 specialists " +
    "and suggest 3–5 concrete example prompts (e.g. 'build me a zero-based monthly budget', " +
    "'run a withholding check for my 1099 income', 'review my portfolio allocation', " +
    "'compare avalanche vs snowball debt payoff', 'should I buy or lease a new car', " +
    "'review my 529 plan and project college costs', 'what's my net worth and emergency fund target', " +
    "'I'm self-employed — Solo 401k vs SEP IRA?', 'run my annual financial review', " +
    "'we just had a baby — what's the checklist?', 'I just inherited $X — what should I do first?', " +
    "'underwrite this rental property', 'should I refi my mortgage?', " +
    "'market just dropped — should I sell?', 'audit my beneficiaries', " +
    "'we are moving to [country] — what do I need to do?'). " +
    "Before producing any XLSX/PDF/DOCX/HTML deliverable, call `md_renderers_sync({mode:'check'})` " +
    "and apply on drift — stale `./money-desk/_renderers/` is the #1 source of 'fix shipped but not visible to the user' bugs. " +
    "Remember the response-footer rule from the presence note: end this response with the Money Desk disclaimer line.";

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
