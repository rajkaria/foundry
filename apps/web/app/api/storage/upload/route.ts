/**
 * 0G Storage upload proxy.
 *
 * Browsers can't sign 0G Storage upload transactions directly — the SDK
 * needs an ethers Signer. This route accepts a `multipart/form-data` upload,
 * runs the upload server-side using the configured `ZG_STORAGE_KEY`, and
 * returns the Merkle root + tx hash.
 *
 * Auth: a header `x-foundry-uploader` is required and must match
 * `STORAGE_UPLOAD_TOKEN`. Cheap shared-secret gate; production should swap
 * for a per-user signed challenge.
 *
 * Env:
 *   ZG_STORAGE_KEY        funded private key authorised to pay storage fees
 *   ZG_BROKER_RPC         RPC URL (default https://evmrpc.0g.ai)
 *   ZG_STORAGE_INDEXER    indexer URL (default https://indexer-storage.0g.network)
 *   STORAGE_UPLOAD_TOKEN  shared-secret bearer token; required if set
 */

import { NextResponse, type NextRequest } from "next/server";
import { StorageClient } from "@foundryprotocol/sdk/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB cap

export async function POST(req: NextRequest): Promise<Response> {
  const token = process.env.STORAGE_UPLOAD_TOKEN;
  if (token) {
    const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== token) {
      return jsonError("unauthorized", 401);
    }
  }

  const key = process.env.ZG_STORAGE_KEY;
  if (!key) {
    return jsonError(
      "0G Storage upload is not configured — set ZG_STORAGE_KEY env",
      503
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let bytes: Uint8Array;
  let mime = "application/octet-stream";

  if (contentType.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("missing 'file' field", 400);
    if (file.size > MAX_BYTES)
      return jsonError(`file too large (>${MAX_BYTES} bytes)`, 413);
    bytes = new Uint8Array(await file.arrayBuffer());
    mime = file.type || mime;
  } else if (contentType.startsWith("application/json")) {
    const body = await req.text();
    if (body.length > MAX_BYTES) return jsonError("body too large", 413);
    bytes = new TextEncoder().encode(body);
    mime = "application/json";
  } else {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return jsonError("body too large", 413);
    bytes = new Uint8Array(buf);
  }

  try {
    const { ethers } = await import("ethers");
    const rpc = process.env.ZG_BROKER_RPC ?? "https://evmrpc.0g.ai";
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(key.startsWith("0x") ? key : `0x${key}`, provider);

    const storage = new StorageClient({
      indexerUrl: process.env.ZG_STORAGE_INDEXER,
      rpcUrl: rpc,
    });

    const result = await storage.upload(bytes, { signer: wallet });
    return NextResponse.json({
      ok: true,
      rootHash: result.rootHash,
      txHash: result.txHash,
      txSeq: result.txSeq,
      size: result.size,
      mime,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonError(msg, 500);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: "foundry-storage-upload",
    configured: !!process.env.ZG_STORAGE_KEY,
  });
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { "access-control-allow-origin": "*" } }
  );
}
