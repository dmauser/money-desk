#!/usr/bin/env node
// money-desk MCP server (Claude Desktop / Claude Code / Cowork)
//
// Zero-dependency stdio Model Context Protocol server that exposes the exact
// same tool set the Copilot CLI extension registers (see ./registry.mjs).
// registry.mjs stays the single source of truth; this file is only a
// transport adapter, the MCP counterpart of the thin ./extension.mjs.
//
// Transport: newline-delimited JSON-RPC 2.0 over stdin/stdout.
// stdout is reserved for protocol messages — all diagnostics go to stderr.

import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Optional working directory for deliverables / the renderer cache
// (`./money-desk/...` paths are resolved against process.cwd()). Claude
// Desktop launches MCP servers from an arbitrary directory, so let the user
// pin one explicitly. Must run before registry.mjs is imported.
// An unset optional MCPB user_config field may arrive as an empty string or
// as the literal unexpanded placeholder — ignore both.
const WORKDIR = process.env.MONEY_DESK_WORKDIR;
if (WORKDIR && !WORKDIR.includes("${")) {
    try {
        process.chdir(WORKDIR);
    } catch (err) {
        process.stderr.write(`[money-desk] MONEY_DESK_WORKDIR ignored: ${err.message}\n`);
    }
}

const { tools, specialistCount } = await import("./registry.mjs");

const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = (() => {
    for (const p of [join(HERE, "..", "..", "package.json"), join(HERE, "package.json")]) {
        try {
            return JSON.parse(readFileSync(p, "utf8")).version;
        } catch {
            /* try next */
        }
    }
    return "0.0.0";
})();

// Compact mode (MONEY_DESK_TOOLS=compact): hosts that load every tool
// description up front (e.g. the Claude Desktop chat tab) pay ~31k tokens for
// the full 146-tool list. Compact mode lists only the discovery tools plus one
// dispatcher, `md_call`, which runs any specialist tool by id.
// Hosts with tool search (Claude Code, Cowork) should keep the default.
const COMPACT = process.env.MONEY_DESK_TOOLS === "compact";
const SPECIALIST_TOOL = /^md_[a-z]{2}_(?:role|orchestrate|skill_[a-z0-9_]+)$/;

const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

// Server-level instructions: the MCP equivalent of the Copilot extension's
// PRESENCE_NOTE, plus the host-adaptation notes Claude needs because the
// specialist prompts were written for Copilot CLI built-ins.
export const INSTRUCTIONS = [
    `money-desk: ${specialistCount} personal-finance specialists, ${tools.length} tools.`,
    "When the user mentions personal finance, budgeting, taxes, investing, retirement, debt, credit, " +
        "insurance (health / auto / home / life / disability / Medicare / LTC), estate, a major purchase decision, " +
        "college / 529 / FAFSA, net worth / emergency fund, self-employment / 1099 / S-corp, a life event " +
        "(annual review, new baby, job change, home purchase, inheritance, layoff), rental property / house hacking, " +
        "market panic / FOMO / couples money / lifestyle inflation, FIRE / safe-withdrawal-rate, or cross-border / " +
        "expat / FBAR / PFIC / moving country — call `md_capabilities` for the specialist map, or `md_route` with " +
        "the user's query to pick a specialist. Then call the specialist's `<prefix>_role`, `<prefix>_orchestrate`, " +
        "and `<prefix>_skill_<id>` tools in that order.",
    "Before any user-facing deliverable call `md_report_quality` (defaults to markdown inline; PDF/DOCX/XLSX/HTML " +
        "are offered, never auto-written). Money Desk is analysis-only: it never moves money, executes trades, files " +
        "returns, or signs documents.",
    "Host adaptation (these prompts were written for GitHub Copilot CLI): " +
        "(1) where a tool result says to call `ask_user` with a JSON form payload, use your own structured question " +
        "tool if you have one (e.g. AskUserQuestion); otherwise ask the same questions concisely in chat. Then re-call " +
        "the skill tool with an `inputs` object holding the answers. " +
        "(2) `web_search` / `web_fetch` mean whatever web search / fetch tool you have; if none, mark live figures " +
        "`[UNSOURCED]`. " +
        "(3) Only write files (reports, renderer cache) if you have filesystem tools and the user accepted an export " +
        "offer; otherwise deliver markdown inline. " +
        "(4) Show users friendly skill / specialist names, never raw tool ids.",
    ...(COMPACT
        ? [
              "Compact mode: specialist tools (`<prefix>_role`, `<prefix>_orchestrate`, `<prefix>_skill_<id>`) are not " +
                  "listed individually. Wherever a prompt names one, run it with `md_call`: " +
                  '`{ "tool": "<tool id>" }` first, then for gated skills `{ "tool": "<tool id>", "inputs": { … } }` ' +
                  "after the user answers the intake questions.",
          ]
        : []),
].join("\n\n");

const byName = new Map(tools.map((t) => [t.name, t]));

const MD_CALL = {
    name: "md_call",
    description:
        "Run any Money Desk specialist tool by id: a role (`md_<prefix>_role`), orchestrator (`md_<prefix>_orchestrate`) " +
        "or skill (`md_<prefix>_skill_<id>`). Get ids from `md_route` or `md_capabilities`. Skills are intake-gated: " +
        "call once without `inputs` to get the questions, ask the user, then call again with `inputs`.",
    inputSchema: {
        type: "object",
        properties: {
            tool: { type: "string", description: "Tool id, e.g. `md_ds_skill_payoff_plan` or `md_tx_role`" },
            inputs: { type: "object", description: "Intake answers for a gated skill (second call only)" },
        },
        required: ["tool"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
};

const fullToolList = tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.parameters && t.parameters.type === "object" ? t.parameters : { type: "object", properties: {} },
    annotations: { readOnlyHint: !/renderers_(sync|ensure)$/.test(t.name), openWorldHint: false },
}));

const toolList = COMPACT ? [...fullToolList.filter((t) => !SPECIALIST_TOOL.test(t.name)), MD_CALL] : fullToolList;

// Normalize a registry handler result into an MCP CallToolResult.
export function toCallToolResult(result) {
    if (result && typeof result === "object" && "textResultForLlm" in result) {
        return {
            content: [{ type: "text", text: String(result.textResultForLlm) }],
            isError: result.resultType === "failure",
        };
    }
    const text =
        typeof result === "string" ? result : result === undefined ? "" : JSON.stringify(result, null, 2);
    return { content: [{ type: "text", text }] };
}

export async function handleMessage(msg) {
    const { id, method, params } = msg || {};
    const isRequest = id !== undefined && id !== null;
    const reply = (result) => (isRequest ? { jsonrpc: "2.0", id, result } : null);
    const fail = (code, message) => (isRequest ? { jsonrpc: "2.0", id, error: { code, message } } : null);

    switch (method) {
        case "initialize": {
            const requested = params?.protocolVersion;
            const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
                ? requested
                : SUPPORTED_PROTOCOL_VERSIONS[0];
            return reply({
                protocolVersion,
                capabilities: { tools: { listChanged: false } },
                serverInfo: { name: "money-desk", title: "Money Desk", version: VERSION },
                instructions: INSTRUCTIONS,
            });
        }
        case "ping":
            return reply({});
        case "tools/list":
            return reply({ tools: toolList });
        case "tools/call": {
            let name = params?.name;
            let args = params?.arguments ?? {};
            if (name === "md_call") {
                name = args.tool;
                if (typeof name !== "string" || !SPECIALIST_TOOL.test(name) || !byName.has(name)) {
                    return reply({
                        content: [{ type: "text", text: `Unknown specialist tool id: ${name}. Call md_route or md_capabilities for valid ids.` }],
                        isError: true,
                    });
                }
                args = args.inputs && typeof args.inputs === "object" ? { inputs: args.inputs } : {};
            }
            const t = byName.get(name);
            if (!t) return fail(-32602, `Unknown tool: ${params?.name}`);
            try {
                return reply(toCallToolResult(await t.handler(args)));
            } catch (err) {
                return reply({ content: [{ type: "text", text: `money-desk tool error: ${err?.message ?? err}` }], isError: true });
            }
        }
        case "resources/list":
            return reply({ resources: [] });
        case "prompts/list":
            return reply({ prompts: [] });
        default:
            if (typeof method === "string" && method.startsWith("notifications/")) return null;
            return fail(-32601, `Method not found: ${method}`);
    }
}

function send(obj) {
    if (obj) process.stdout.write(JSON.stringify(obj) + "\n");
}

const isMain = !!process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
    const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
    const inflight = new Set();
    const handleLine = async (line) => {
        if (!line.trim()) return;
        let msg;
        try {
            msg = JSON.parse(line);
        } catch {
            send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
            return;
        }
        if (Array.isArray(msg)) {
            const out = (await Promise.all(msg.map(handleMessage))).filter(Boolean);
            if (out.length) send(out);
        } else {
            send(await handleMessage(msg));
        }
    };
    rl.on("line", (line) => {
        const p = handleLine(line).finally(() => inflight.delete(p));
        inflight.add(p);
    });
    // Drain in-flight requests before exiting when the client closes stdin.
    rl.on("close", async () => {
        await Promise.allSettled([...inflight]);
        process.exit(0);
    });
    process.stderr.write(`[money-desk] MCP server v${VERSION} ready — ${specialistCount} specialists, ${tools.length} tools\n`);
}
