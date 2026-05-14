/**
 * OpenAI-compatible inference proxy.
 *
 * Any tool that speaks OpenAI's API can call a Foundry Ingot by changing the
 * base URL and passing the Ingot ID as `x-foundry-ingot-id`. Revenue routes
 * back to the Ingot's co-owners on-chain through the RevenueSplitter.
 *
 * POST /api/v1/chat/completions
 *   headers: x-foundry-ingot-id: 0x…
 *   body:    { messages, temperature?, max_tokens? }
 *
 * Sprint 2 ships the contract: stable surface, mock backend.
 * Sprint 3 wires the real 0G Compute dispatch + RevenueSplitter call.
 */

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

interface ChatRequest {
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: "stop";
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  foundry: {
    ingotId: string;
    inferenceTxHash: null;
    revenueTxHash: null;
    note: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ingotId = req.headers.get("x-foundry-ingot-id");
  if (!ingotId || !ingotId.startsWith("0x")) {
    return NextResponse.json(
      { error: "missing or invalid x-foundry-ingot-id header" },
      { status: 400 }
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  // Sprint 2: deterministic stub so integrators can wire their flows. The
  // response shape is the canonical contract — Sprint 3 swaps the backend
  // to 0G Compute + on-chain revenue without changing the API.
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const output = stubOutput(ingotId, lastUser?.content ?? "");
  const promptTokens = approxTokens(body.messages.map((m) => m.content).join(" "));
  const completionTokens = approxTokens(output);

  const response: ChatResponse = {
    id: `chatcmpl-foundry-${cryptoRandom()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: `ingot:${ingotId}`,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: output },
        finish_reason: "stop",
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
      note:
        "Sprint 2 stub. Sprint 3 wires 0G Compute dispatch and on-chain revenue routing — the response shape is stable.",
    },
  };

  return NextResponse.json(response, {
    headers: {
      "access-control-allow-origin": "*",
      "x-foundry-stub": "1",
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
    },
  });
}

function stubOutput(ingotId: string, prompt: string): string {
  const short = ingotId.slice(0, 10) + "…";
  return `[Foundry Ingot ${short}] echo (stub): ${prompt}`;
}

function approxTokens(s: string): number {
  return Math.max(1, Math.ceil(s.length / 4));
}

function cryptoRandom(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
