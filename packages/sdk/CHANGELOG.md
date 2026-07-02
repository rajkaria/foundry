# @foundryprotocol/sdk

## 1.1.0

### Minor Changes

- 9ec8680: `StorageClient` and attestation are now thin adapters over the published
  `@foundryprotocol/0gkit-*` v1.x packages instead of a parallel implementation:
  - `storage.ts` delegates upload/download/computeRoot to
    `@foundryprotocol/0gkit-storage` (via its new per-call signer + `txSeq`
    support). The public `StorageClient` surface is unchanged —
    `upload`/`uploadText`/`uploadJson`/`download`/`downloadText`/`downloadJson`/
    `computeRoot`, the `{ rootHash, txHash, txSeq, size }` envelope, and
    `StorageError`.
  - `attestation.ts` re-exports `@foundryprotocol/0gkit-attestation` and keeps
    Foundry's throw-on-mismatch `verifyEnvelope` (returns the recovered signer;
    throws `digest mismatch` / `signer mismatch`).
  - `da.ts` already delegated to `@foundryprotocol/0gkit-da`; `inference.ts`
    (revenue-routing proxy) is unchanged.
  - `@0gfoundation/0g-storage-ts-sdk` and `ethers` dropped from `peerDependencies`
    (now transitive through `0gkit-storage`); `0gkit-*` deps bumped to `^1.x`.

  Public API preserved (minor). Deduplicates the 0G-Storage-SDK wrapping so the
  `MemData`/`Indexer` logic lives in exactly one place.
