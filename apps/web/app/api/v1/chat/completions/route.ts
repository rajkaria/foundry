/**
 * OpenAI-compatible inference proxy for Foundry Ingots.
 *
 * Any client speaking OpenAI's chat-completions API can call a Foundry
 * Ingot by changing the base URL and passing the Ingot ID as
 * `x-foundry-ingot-id` (or as `model: "ingot:0x…"`). The proxy delegates
 * the actual model call to 0G Compute via the serving-broker SDK
 * (see lib/zg-compute.ts), and the broker reserves the fee on-chain —
 * which is the revenue stream that flows into the Ingot's RevenueSplitter.
 *
 * When ZG_BROKER_KEY / ZG_INFERENCE_PROVIDER aren't set, the proxy returns
 * an honestly-labeled stub response with `x-foundry-stub: 1`.
 */

import { NextResponse, type NextRequest } from "next/server";
import { chatCompletion, isLive } from "@/lib/zg-compute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const result = await chatCompletion({
    messages: body.messages,
    temperature: body.temperature,
    maxTokens: body.max_tokens,
  });

  const requestId = `chatcmpl-foundry-${cryptoRandom()}`;
  const created = Math.floor(Date.now() / 1000);
  const model = `ingot:${ingotId}`;

  if (body.stream) {
    return sseStream({
      requestId,
      created,
      model,
      output: result.output,
      ingotId,
      attestation: result.attestation,
      inferenceTxHash: result.inferenceTxHash,
      mode: result.mode,
    });
  }

  const response = {
    id: requestId,
    object: "chat.completion" as const,
    created,
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant" as const, content: result.output },
        finish_reason: "stop" as const,
      },
    ],
    usage: {
      prompt_tokens: result.usage?.promptTokens ?? approxTokens(joined(body)),
      completion_tokens: result.usage?.completionTokens ?? approxTokens(result.output),
      total_tokens:
        result.usage?.totalTokens ??
        approxTokens(joined(body)) + approxTokens(result.output),
    },
    foundry: {
      ingotId,
      mode: result.mode,
      provider: result.provider ?? null,
      providerModel: result.model,
      attestation: result.attestation ?? null,
      inferenceTxHash: result.inferenceTxHash ?? null,
      revenueTxHash: null,
      note:
        result.mode === "stub"
          ? "Stub response — set ZG_BROKER_KEY + ZG_INFERENCE_PROVIDER to route through real 0G Compute."
          : "Routed through 0G Compute via the serving broker. The inference fee is reserved on-chain.",
    },
  };

  return NextResponse.json(response, {
    headers: {
      "access-control-allow-origin": "*",
      "x-foundry-mode": result.mode,
      "x-foundry-ingot-id": ingotId,
      ...(result.mode === "stub" ? { "x-foundry-stub": "1" } : {}),
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

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    proxy: "foundry-inference",
    mode: isLive() ? "live" : "stub",
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
    { status, headers: { "access-control-allow-origin": "*" } }
  );
}

function sseStream(args: {
  requestId: string;
  created: number;
  model: string;
  output: string;
  ingotId: string;
  attestation?: string;
  inferenceTxHash?: string;
  mode: "live" | "stub";
}): Response {
  const encoder = new TextEncoder();
  const chunks = chunkBySpace(args.output, 6);

  const stream = new ReadableStream({
    async start(controller) {
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
              mode: args.mode,
              attestation: args.attestation ?? null,
              inferenceTxHash: args.inferenceTxHash ?? null,
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
      "x-foundry-mode": args.mode,
      "x-foundry-ingot-id": args.ingotId,
      ...(args.mode === "stub" ? { "x-foundry-stub": "1" } : {}),
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

function approxTokens(s: string): number {
  return Math.max(1, Math.ceil(s.length / 4));
}

function joined(body: ChatRequest): string {
  return body.messages.map((m) => m.content).join(" ");
}

function cryptoRandom(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
