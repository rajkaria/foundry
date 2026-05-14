/**
 * OpenAI-compatible /v1/models endpoint.
 *
 * Lists available Foundry Ingots so OpenAI-shaped clients can browse what's
 * callable. Sprint 3 returns a curated set; once the indexer is live in prod
 * this becomes a tRPC pass-through to `getIngots`.
 */

import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 60;

interface FoundryModel {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
  permission: never[];
  root: string;
  parent: null;
  foundry: {
    ingotId: string;
    forge: string;
    name: string;
    contributors: number;
    license: string;
    weightsRoot: string;
  };
}

// Curated catalog — real Ingots that exist on Aristotle once minted.
// The shape mirrors the indexer's `getIngots` response so downstream callers
// can switch sources without changing types.
const CATALOG: FoundryModel[] = [
  ingot({
    ingotId: "0x8e2af4a000000000000000000000000000000001",
    forge: "0xforge00000000000000000000000000000000001",
    name: "Konkani ↔ English translator v1",
    contributors: 9,
    license: "open-noncommercial",
    weightsRoot: "0g://weights/konkani-v1.safetensors",
  }),
  ingot({
    ingotId: "0x8e2af4a000000000000000000000000000000002",
    forge: "0xforge00000000000000000000000000000000002",
    name: "Konkani · news domain",
    contributors: 6,
    license: "open-noncommercial",
    weightsRoot: "0g://weights/konkani-news.safetensors",
  }),
  ingot({
    ingotId: "0x8e2af4a000000000000000000000000000000003",
    forge: "0xforge00000000000000000000000000000000003",
    name: "Tulu ↔ English translator v1",
    contributors: 4,
    license: "open-noncommercial",
    weightsRoot: "0g://weights/tulu-v1.safetensors",
  }),
  ingot({
    ingotId: "0x8e2af4a000000000000000000000000000000004",
    forge: "0xforge00000000000000000000000000000000004",
    name: "Clause Classifier — contract intent",
    contributors: 7,
    license: "open-permissive",
    weightsRoot: "0g://weights/clause-v1.safetensors",
  }),
  ingot({
    ingotId: "0x8e2af4a000000000000000000000000000000005",
    forge: "0xforge00000000000000000000000000000000005",
    name: "Clause · MSA specialization",
    contributors: 5,
    license: "open-permissive",
    weightsRoot: "0g://weights/clause-msa.safetensors",
  }),
];

function ingot(args: Omit<FoundryModel["foundry"], never>): FoundryModel {
  return {
    id: `ingot:${args.ingotId}`,
    object: "model",
    created: 1746576000, // 2025-05-07 — symbolic, replaced by mintedAt when live
    owned_by: "foundry-protocol",
    permission: [],
    root: `ingot:${args.ingotId}`,
    parent: null,
    foundry: args,
  };
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      object: "list",
      data: CATALOG,
    },
    {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    },
  });
}
