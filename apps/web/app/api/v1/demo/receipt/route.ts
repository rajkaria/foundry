/**
 * Public demo-receipt endpoint for integration partners.
 *
 * Returns a deterministic, byte-identical Foundry attribution receipt for
 * any Ingot ID. Useful when a partner (e.g. VAMVault) is wiring the
 * `inferenceTxHash` / `revenueTxHash` / `attestationRef` attribution fields
 * into their UI before on-chain settlement of those specific fields is
 * fully wired in production.
 *
 * Every field's shape matches what the SDK returns from a live call. The
 * `mode: "demo"` flag, the `x-foundry-demo: 1` response header, and the
 * `disclaimer` field make it impossible to mistake these for real on-chain
 * receipts. The `ingotId` is real — those Ingots resolve via
 * `/api/v1/models` and can be inferenced against today.
 *
 *   GET /api/v1/demo/receipt?ingotId=0x8e2af4a000000000000000000000000000000001
 *   GET /api/v1/demo/receipt?ingotId=ingot:0x8e2…&seed=hello
 */

import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_INGOT = "0x8e2af4a000000000000000000000000000000001";

interface DemoReceipt {
  ingotId: `ingot:0x${string}`;
  receipt: {
    requestId: string;
    inferenceTxHash: `0x${string}`;
    revenueTxHash: `0x${string}`;
    attestationRef: string;
    latencyMs: number;
  };
  mode: "demo";
  disclaimer: string;
  verify: {
    chainscan: string;
    docs: string;
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const rawIngot = (url.searchParams.get("ingotId") ?? DEFAULT_INGOT).trim();
  const seed = url.searchParams.get("seed") ?? "demo";

  const ingotHex = normalizeIngotHex(rawIngot);
  if (!ingotHex) {
    return NextResponse.json(
      {
        error: "invalid ingotId — pass ?ingotId=0x… (40 hex chars) or ingot:0x…",
      },
      { status: 400 }
    );
  }

  const body: DemoReceipt = {
    ingotId: `ingot:${ingotHex}` as `ingot:0x${string}`,
    receipt: {
      requestId: `req_demo_${derive("req", ingotHex, seed).slice(0, 16)}`,
      inferenceTxHash: `0x${derive("inference", ingotHex, seed)}` as `0x${string}`,
      revenueTxHash: `0x${derive("revenue", ingotHex, seed)}` as `0x${string}`,
      attestationRef: `tee-attestation-${derive("attestation", ingotHex, seed).slice(0, 32)}`,
      latencyMs: 842,
    },
    mode: "demo",
    disclaimer:
      "Deterministic demo receipt — values are derived from the ingotId+seed and are not on-chain. Use for UI integration. For real on-chain receipts call POST /api/v1/chat/completions against the same Ingot.",
    verify: {
      chainscan: `https://chainscan-galileo.0g.ai/address/${ingotHex}`,
      docs: "https://foundryprotocol.xyz/docs/sdk-reference#receipt",
    },
  };

  return NextResponse.json(body, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
      "x-foundry-mode": "demo",
      "x-foundry-demo": "1",
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

function normalizeIngotHex(input: string): string | null {
  const stripped = input.replace(/^ingot:/, "").trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(stripped)) return null;
  return stripped;
}

function derive(label: string, ingotHex: string, seed: string): string {
  return createHash("sha256")
    .update(`foundry-demo:${label}:${ingotHex}:${seed}`)
    .digest("hex");
}
