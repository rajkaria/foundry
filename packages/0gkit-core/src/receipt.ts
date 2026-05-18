/**
 * Uniform result envelope returned by every 0gkit operation that touches
 * the chain. `explorerUrl` is only present when the active network preset
 * has a verified explorer base. `attestation` is opaque here; the
 * @0gkit/attestation package gives it a concrete type.
 */
export interface Receipt {
  txHash?: `0x${string}` | string;
  explorerUrl?: string;
  blockNumber?: bigint;
  latencyMs: number;
  attestation?: unknown;
}
