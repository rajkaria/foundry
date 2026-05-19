/**
 * TEE attestation envelope — sign, verify, anchor.
 *
 * The eval coordinator runs the attribution job inside a TEE on 0G Compute.
 * The enclave emits a hardware-signed attestation, plus a score vector. We
 * wrap both into a deterministic envelope (canonical JSON → keccak256) and:
 *
 *   1. Post the envelope bytes to 0G DA → get a `daRef`
 *   2. Recover an ECDSA signature using the coordinator key over the digest
 *   3. Submit `(digest, signature, scores)` on-chain via `Forge.submitEvalResult`
 *
 * The contract recovers the signer with `ecrecover` and checks against the
 * Forge's registered `evalCoordinator`. Anyone with the DA reference can
 * independently re-execute attribution and verify the score vector.
 *
 * This module is signer-agnostic: pass an ethers `Signer`, a viem
 * `WalletClient`, or a raw 32-byte private key (server-side).
 */

import { type Hex, isHex, recoverAddress, hashMessage, type Address } from "viem";
import { sign } from "viem/accounts";
import { digestJson } from "@foundryprotocol/0gkit-core";

export interface AttestationEnvelope {
  kind: "foundry/eval-result/v1";
  forge: Address;
  scores: number[];
  baseline: number;
  /** Hardware-signed TEE attestation (bytes32). 0x00...0 means no TEE. */
  teeAttestation: Hex;
  /** Optional 0G DA reference. */
  daRef?: string;
  /** Coordinator key — used for sanity, not auth. */
  coordinator: Address;
  /** Unix seconds. */
  timestamp: number;
}

export interface SignedEnvelope {
  envelope: AttestationEnvelope;
  /** keccak256 of the canonical envelope bytes — the on-chain anchor. */
  digest: Hex;
  /** 65-byte ECDSA signature over `eth_sign(digest)`. */
  signature: Hex;
}

/**
 * Canonicalise + hash an envelope. The same logical envelope → same digest.
 * Delegates to the neutral `@foundryprotocol/0gkit-core` canonical-JSON digest so the SDK,
 * CLI, MCP server, and the on-chain anchor all agree byte-for-byte.
 */
export function digestEnvelope(envelope: AttestationEnvelope): Hex {
  return digestJson(envelope);
}

/** Sign an envelope with a raw private key (server-side coordinator). */
export async function signEnvelope(
  envelope: AttestationEnvelope,
  privateKey: Hex
): Promise<SignedEnvelope> {
  if (!isHex(privateKey) || privateKey.length !== 66) {
    throw new Error(
      "[foundry-sdk:attestation] privateKey must be 0x-prefixed 32 bytes"
    );
  }
  const digest = digestEnvelope(envelope);
  // We use the EIP-191 personal-sign envelope so the recovery on-chain
  // matches `keccak256("\x19Ethereum Signed Message:\n32" || digest)`.
  const signature = await sign({
    hash: hashMessage({ raw: digest }),
    privateKey,
  });
  return { envelope, digest, signature: encodeSignature(signature) };
}

/** Recover the signer of a signed envelope. */
export async function recoverEnvelopeSigner(
  signed: Pick<SignedEnvelope, "digest" | "signature">
): Promise<Address> {
  return recoverAddress({
    hash: hashMessage({ raw: signed.digest }),
    signature: signed.signature,
  });
}

/**
 * Verify a signed envelope against an expected coordinator address.
 * Throws on mismatch; returns the recovered signer on success.
 */
export async function verifyEnvelope(
  signed: SignedEnvelope,
  expectedCoordinator: Address
): Promise<Address> {
  const expectedDigest = digestEnvelope(signed.envelope);
  if (expectedDigest !== signed.digest) {
    throw new Error(
      `[foundry-sdk:attestation] digest mismatch: envelope hashes to ${expectedDigest}, claim was ${signed.digest}`
    );
  }
  const recovered = await recoverEnvelopeSigner(signed);
  if (recovered.toLowerCase() !== expectedCoordinator.toLowerCase()) {
    throw new Error(
      `[foundry-sdk:attestation] signer mismatch: expected ${expectedCoordinator}, got ${recovered}`
    );
  }
  return recovered;
}

/** Pack the {r, s, v} signature object into a 65-byte hex blob. */
function encodeSignature(sig: { r: Hex; s: Hex; v?: bigint; yParity?: number }): Hex {
  const r = sig.r.replace(/^0x/, "").padStart(64, "0");
  const s = sig.s.replace(/^0x/, "").padStart(64, "0");
  const v =
    sig.v !== undefined
      ? Number(sig.v).toString(16).padStart(2, "0")
      : ((sig.yParity ?? 0) + 27).toString(16).padStart(2, "0");
  return `0x${r}${s}${v}` as Hex;
}
