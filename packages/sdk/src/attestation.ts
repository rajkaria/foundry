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
 * Thin adapter: sign / verify / digest now delegate to the neutral
 * `@foundryprotocol/0gkit-attestation` package (single source of truth, shared
 * by the SDK, CLI, MCP server, and the on-chain anchor). This module preserves
 * the `@foundryprotocol/sdk` public surface exactly — the
 * `AttestationEnvelope`/`SignedEnvelope` types, `digestEnvelope`,
 * `signEnvelope`, `recoverEnvelopeSigner`, and the **throw-on-mismatch**
 * `verifyEnvelope` that returns the recovered signer on success.
 */

import type { Address } from "viem";
import {
  digestEnvelope,
  signEnvelope,
  recoverSigner as recoverEnvelopeSigner,
  verifyEnvelope as coreVerifyEnvelope,
  type AttestationEnvelope,
  type SignedEnvelope,
} from "@foundryprotocol/0gkit-attestation";

export { digestEnvelope, signEnvelope, recoverEnvelopeSigner };
export type { AttestationEnvelope, SignedEnvelope };

/**
 * Verify a signed envelope against an expected coordinator address.
 * Throws on mismatch; returns the recovered signer on success.
 *
 * `0gkit-attestation`'s `verifyEnvelope` never throws (it returns a
 * `VerifyResult`), so we adapt it here to preserve Foundry's throw-on-mismatch
 * contract — including the historical `digest mismatch` / `signer mismatch`
 * messages callers and tests rely on.
 */
export async function verifyEnvelope(
  signed: SignedEnvelope,
  expectedCoordinator: Address
): Promise<Address> {
  const result = await coreVerifyEnvelope(signed, expectedCoordinator);
  if (!result.checks.digest) {
    throw new Error(
      `[foundry-sdk:attestation] digest mismatch: envelope hashes to ${digestEnvelope(
        signed.envelope
      )}, claim was ${signed.digest}`
    );
  }
  if (!result.checks.signer) {
    throw new Error(
      `[foundry-sdk:attestation] signer mismatch: expected ${expectedCoordinator}, got ${result.signer}`
    );
  }
  return result.signer;
}
