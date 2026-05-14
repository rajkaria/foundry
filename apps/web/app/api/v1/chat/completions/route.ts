/**
 * OpenAI-compatible inference proxy.
 *
 * Any tool that speaks OpenAI's API can call a Foundry Ingot by changing the
 * base URL and passing the Ingot ID as `x-foundry-ingot-id` (or as `model`).
 * Revenue routes back to the Ingot's co-owners on-chain through the
 * RevenueSplitter.
 *
 * POST /api/v1/chat/completions
 *   headers: x-foundry-ingot-id: 0x… (optional if `model` is set to ingot:0x…)
 *   body:    { messages, temperature?, max_tokens?, stream? }
 *
 * Sprint 2 shipped the contract; Sprint 3 adds streaming, model resolution
 * via the `model` field, and richer receipts. The backend remains a
 * deterministic stub until 0G Compute is wired in.
 */

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

interface ChatRequest {
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function POST(req: NextRequest): Promise<Response> {
  const ingotId = resolveIngotId(req);
  if (!ingotId) {
    return jsonError(
      "missing ingot id — pass `x-foundry-ingot-id: 0x…` header or set `model` to `ingot:0x…`",
      400
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return jsonError("invalid JSON body", 400);
  }
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("messages array required", 400);
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const output = stubOutput(ingotId, lastUser?.content ?? "");
  const promptTokens = approxTokens(body.messages.map((m) => m.content).join(" "));
  const completionTokens = approxTokens(output);
  const requestId = `chatcmpl-foundry-${cryptoRandom()}`;
  const created = Math.floor(Date.now() / 1000);
  const model = `ingot:${ingotId}`;

  // Streaming branch — Server-Sent Events in the OpenAI delta format.
  if (body.stream) {
    return sseStream({ requestId, created, model, output, ingotId });
  }

  // Non-streaming JSON response.
  const response = {
    id: requestId,
    object: "chat.completion" as const,
    created,
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant" as const, content: output },
        finish_reason: "stop" as const,
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
    foundry: {
      ingotId,
      inferenceTxHash: null,
      revenueTxHash: null,
      proxy: "edge",
      note: "Stub backend — response shape is the stable v1 contract. 0G Compute dispatch + on-chain revenue routing land when the eval coordinator goes live on mainnet.",
    },
  };

  return NextResponse.json(response, {
    headers: {
      "access-control-allow-origin": "*",
      "x-foundry-stub": "1",
      "x-foundry-ingot-id": ingotId,
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization, x-foundry-ingot-id",
      "access-control-max-age": "86400",
    },
  });
}

function resolveIngotId(req: NextRequest): string | null {
  const fromHeader = req.headers.get("x-foundry-ingot-id");
  if (fromHeader && fromHeader.startsWith("0x")) return fromHeader;
  return null;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: { message, type: "invalid_request_error" } },
    {
      status,
      headers: { "access-control-allow-origin": "*" },
    }
  );
}

function sseStream(args: {
  requestId: string;
  created: number;
  model: string;
  output: string;
  ingotId: string;
}): Response {
  const encoder = new TextEncoder();
  const chunks = chunkBySpace(args.output, 6);

  const stream = new ReadableStream({
    async start(controller) {
      // First delta — role marker.
      controller.enqueue(
        encoder.encode(
          sseFrame({
            id: args.requestId,
            object: "chat.completion.chunk",
            created: args.created,
            model: args.model,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
          })
        )
      );

      // Content deltas — emit chunks with a tiny delay to mimic generation.
      for (const piece of chunks) {
        await sleep(18);
        controller.enqueue(
          encoder.encode(
            sseFrame({
              id: args.requestId,
              object: "chat.completion.chunk",
              created: args.created,
              model: args.model,
              choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
            })
          )
        );
      }

      // Final frame — stop reason + foundry receipt.
      controller.enqueue(
        encoder.encode(
          sseFrame({
            id: args.requestId,
            object: "chat.completion.chunk",
            created: args.created,
            model: args.model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            foundry: {
              ingotId: args.ingotId,
              inferenceTxHash: null,
              revenueTxHash: null,
            },
          })
        )
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "access-control-allow-origin": "*",
      "x-foundry-stub": "1",
      "x-foundry-ingot-id": args.ingotId,
    },
  });
}

function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function chunkBySpace(s: string, chunkSize: number): string[] {
  const parts = s.split(/(\s+)/);
  const out: string[] = [];
  let buf = "";
  let count = 0;
  for (const p of parts) {
    buf += p;
    if (!/\s/.test(p)) count += 1;
    if (count >= chunkSize) {
      out.push(buf);
      buf = "";
      count = 0;
    }
  }
  if (buf) out.push(buf);
  return out.length > 0 ? out : [s];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function stubOutput(ingotId: string, prompt: string): string {
  const short = ingotId.slice(0, 10) + "…";
  return `[Foundry Ingot ${short}] Stub response for: "${prompt}". Once 0G Compute dispatch is live, this proxy will route to the real model and stream tokens here, with the inference + revenue tx hashes attached in the final frame.`;
}

function approxTokens(s: string): number {
  return Math.max(1, Math.ceil(s.length / 4));
}

function cryptoRandom(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
