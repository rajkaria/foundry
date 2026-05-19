/**
 * @foundryprotocol/mcp
 *
 * An MCP (Model Context Protocol) server that exposes Foundry Ingots — the
 * co-owned, revenue-routing AI models on 0G — to any MCP-capable agent
 * (Claude Desktop, Cursor, Cline, custom AI agents) as first-class tools.
 *
 * Tools exposed:
 *   - list_ingots          enumerate live Foundry Ingots
 *   - run_inference        call an Ingot via the OpenAI-compat proxy
 *                          (revenue routes to co-owners on-chain)
 *   - get_ingot            metadata + cap table for a specific Ingot
 *   - get_lineage          parent Forge + parent Ingot chain
 *   - get_attestation      TEE attestation envelope for the last mint
 *
 * Run as a stdio MCP server:
 *   npx @foundryprotocol/mcp
 *
 * Or wire programmatically:
 *   import { createFoundryMcpServer } from '@foundryprotocol/mcp';
 *   const server = createFoundryMcpServer({ baseUrl: 'https://foundryprotocol.xyz' });
 *   await server.connect(transport);
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export interface FoundryMcpOptions {
  /** Base URL of the Foundry web surface (default: https://foundryprotocol.xyz). */
  baseUrl?: string;
  /** Optional fetch implementation override (testing). */
  fetch?: typeof fetch;
  /** Optional default Ingot id used when `run_inference` is called without one. */
  defaultIngotId?: string;
}

const DEFAULT_BASE = "https://foundryprotocol.xyz";

const ListIngotsArgs = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const RunInferenceArgs = z.object({
  ingot_id: z.string().min(3).optional(),
  input: z.string().min(1),
  system: z.string().optional(),
  max_tokens: z.number().int().min(1).max(2048).optional().default(512),
  temperature: z.number().min(0).max(2).optional(),
});

const GetIngotArgs = z.object({
  ingot_id: z.string().min(3),
});

const GetLineageArgs = z.object({
  ingot_id: z.string().min(3),
});

const GetAttestationArgs = z.object({
  ingot_id: z.string().min(3),
});

const TOOLS: Tool[] = [
  {
    name: "list_ingots",
    description:
      "List live Foundry Ingots (co-owned AI models on 0G). Each row includes the Ingot id, contributor count, license, and weights root. Use this to discover models you can call.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max results (1-100). Default 20.",
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: "run_inference",
    description:
      "Call a Foundry Ingot for a chat-style completion. The request routes through the OpenAI-compatible Foundry proxy → 0G Compute. Inference fees reserve on-chain via the 0G serving broker; a portion deposits into RevenueSplitter for the Ingot's co-owners. Returns the output plus tx hashes when fees were reserved.",
    inputSchema: {
      type: "object",
      required: ["input"],
      properties: {
        ingot_id: {
          type: "string",
          description:
            "Ingot identifier (e.g. '0x8e2…') or full 'ingot:0x…/<tokenId>'. Optional if a default was configured.",
        },
        input: {
          type: "string",
          description: "The user message to send to the Ingot.",
        },
        system: {
          type: "string",
          description: "Optional system prompt.",
        },
        max_tokens: {
          type: "number",
          description: "Max tokens to generate (default 512).",
        },
        temperature: {
          type: "number",
          description: "Sampling temperature (0-2).",
        },
      },
    },
  },
  {
    name: "get_ingot",
    description:
      "Fetch full metadata for a single Foundry Ingot — share-ledger cap table, Forge of origin, eval attestation status, and weights root on 0G Storage.",
    inputSchema: {
      type: "object",
      required: ["ingot_id"],
      properties: {
        ingot_id: { type: "string" },
      },
    },
  },
  {
    name: "get_lineage",
    description:
      "Trace an Ingot's lineage — parent Forge, parent Ingot (if reforged), contributing addresses, and downstream Ingots that have re-used it.",
    inputSchema: {
      type: "object",
      required: ["ingot_id"],
      properties: { ingot_id: { type: "string" } },
    },
  },
  {
    name: "get_attestation",
    description:
      "Return the TEE attestation envelope used to mint this Ingot — score vector, hardware-signed attestation, mode flag (tee | non-tee fallback), and the on-chain submitEvalResult tx.",
    inputSchema: {
      type: "object",
      required: ["ingot_id"],
      properties: { ingot_id: { type: "string" } },
    },
  },
];

interface RestIngot {
  id?: string;
  foundry?: { ingotId?: string; name?: string; contributors?: number };
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function jsonText(payload: unknown): string {
  return JSON.stringify(payload, null, 2);
}

export interface ToolCallResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/**
 * The Foundry capability set, decoupled from the MCP transport. This is the
 * adapter `@foundryprotocol/0gkit-mcp` loads (via a computed specifier) as its opt-in Foundry
 * plugin — neutral by construction: `@foundryprotocol/0gkit-*` never imports this statically.
 */
export interface FoundryMcpPlugin {
  name: string;
  tools: Tool[];
  call(name: string, args: Record<string, unknown>): Promise<ToolCallResult>;
}

export function foundryMcpPlugin(options: FoundryMcpOptions = {}): FoundryMcpPlugin {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const defaultIngotId = options.defaultIngotId;

  async function call(
    name: string,
    rawArgs: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const args = rawArgs ?? {};

    try {
      switch (name) {
        case "list_ingots": {
          const parsed = ListIngotsArgs.parse(args);
          const res = await fetchImpl(joinUrl(baseUrl, "/api/v1/models"));
          if (!res.ok) {
            throw new Error(
              `Foundry /api/v1/models returned ${res.status} ${res.statusText}`
            );
          }
          const body = (await res.json()) as { data?: RestIngot[] };
          const list = (body.data ?? []).slice(0, parsed.limit);
          return {
            content: [{ type: "text", text: jsonText(list) }],
          };
        }

        case "run_inference": {
          const parsed = RunInferenceArgs.parse(args);
          const ingotId = parsed.ingot_id ?? defaultIngotId;
          if (!ingotId) {
            throw new Error(
              "run_inference: ingot_id required (or configure defaultIngotId)"
            );
          }
          const messages = parsed.system
            ? [
                { role: "system", content: parsed.system },
                { role: "user", content: parsed.input },
              ]
            : [{ role: "user", content: parsed.input }];

          const res = await fetchImpl(joinUrl(baseUrl, "/api/v1/chat/completions"), {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-foundry-ingot-id": ingotId,
            },
            body: JSON.stringify({
              messages,
              max_tokens: parsed.max_tokens,
              temperature: parsed.temperature,
            }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`inference failed: ${res.status} ${text.slice(0, 200)}`);
          }
          const body = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
            foundry?: Record<string, unknown>;
          };
          const output = body.choices?.[0]?.message?.content ?? "";
          return {
            content: [
              {
                type: "text",
                text: jsonText({
                  ingot_id: ingotId,
                  output,
                  foundry: body.foundry ?? null,
                }),
              },
            ],
          };
        }

        case "get_ingot": {
          const parsed = GetIngotArgs.parse(args);
          const res = await fetchImpl(
            joinUrl(baseUrl, `/api/v1/models?id=${encodeURIComponent(parsed.ingot_id)}`)
          );
          if (!res.ok) {
            throw new Error(`get_ingot failed: ${res.status}`);
          }
          const body = (await res.json()) as { data?: RestIngot[] };
          const match = (body.data ?? []).find(
            (m) =>
              m.id === parsed.ingot_id ||
              m.foundry?.ingotId === parsed.ingot_id ||
              m.id?.endsWith(parsed.ingot_id)
          );
          if (!match) {
            return {
              content: [
                {
                  type: "text",
                  text: `No Ingot found for id "${parsed.ingot_id}". Use list_ingots to enumerate.`,
                },
              ],
              isError: true,
            };
          }
          return { content: [{ type: "text", text: jsonText(match) }] };
        }

        case "get_lineage": {
          const parsed = GetLineageArgs.parse(args);
          const res = await fetchImpl(
            joinUrl(
              baseUrl,
              `/api/forge/lineage?ingot=${encodeURIComponent(parsed.ingot_id)}`
            )
          );
          if (!res.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Lineage endpoint not available (status ${res.status}). View on web: ${joinUrl(baseUrl, `/ingots/${parsed.ingot_id}`)}`,
                },
              ],
            };
          }
          const body = await res.json();
          return { content: [{ type: "text", text: jsonText(body) }] };
        }

        case "get_attestation": {
          const parsed = GetAttestationArgs.parse(args);
          const res = await fetchImpl(
            joinUrl(
              baseUrl,
              `/api/forge/attestation?ingot=${encodeURIComponent(parsed.ingot_id)}`
            )
          );
          if (!res.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Attestation endpoint not available (status ${res.status}). View on web: ${joinUrl(baseUrl, `/ingots/${parsed.ingot_id}`)}`,
                },
              ],
            };
          }
          const body = await res.json();
          return { content: [{ type: "text", text: jsonText(body) }] };
        }

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${msg}` }],
        isError: true,
      };
    }
  }

  return { name: "foundry", tools: TOOLS, call };
}

export function createFoundryMcpServer(options: FoundryMcpOptions = {}): Server {
  const plugin = foundryMcpPlugin(options);

  const server = new Server(
    { name: "foundry", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: plugin.tools,
  }));

  server.setRequestHandler(
    CallToolRequestSchema,
    async (req) =>
      (await plugin.call(req.params.name, req.params.arguments ?? {})) as CallToolResult
  );

  return server;
}

export { TOOLS as FOUNDRY_MCP_TOOLS };
