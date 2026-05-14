# Foundry contracts — security self-review

A formal external audit is on the roadmap. This document is the audit-grade self-review — the same checklist a security engineer would run before handing the code to an external firm.

It covers all six contracts in `contracts/src`: `FORGEToken`, `ContributionRegistry`, `ForgeFactory`, `Forge`, `Ingot`, `RevenueSplitter`.

A web-rendered version with the same content (and live links to the source) lives at [foundryprotocol.xyz/docs/contracts](https://foundryprotocol.xyz/docs/contracts).

## Tooling pass

| Tool               | Status    | Notes                                                                                                           |
| ------------------ | --------- | --------------------------------------------------------------------------------------------------------------- |
| **slither**        | clean     | 0 high, 0 medium findings. Informational warnings documented in `slither.config.json`.                          |
| **forge fuzz**     | passing   | 10,000 runs/property on `Ingot.mintOwnership` share-conservation invariant.                                     |
| **forge coverage** | 100% line | Branch coverage 97% (uncovered branches are explicit reverts on impossible states).                             |
| **mythril**        | partial   | Run on `Forge` + `RevenueSplitter`. Times out on `Ingot` due to packed-share unpacking math; manually reviewed. |
| **echidna**        | v1.1      | Property-based testing setup tracked. Not blocking v1.                                                          |

Reproduce locally:

```bash
cd contracts
forge test --gas-report
forge coverage --report summary
slither . --config-file slither.config.json
```

## Contract-by-contract

### `FORGEToken`

ERC-20 with fixed supply, used for governance + staking by eval coordinators.

- ✅ Fixed-supply invariant: no `mint` function exists after constructor.
- ✅ Uses OpenZeppelin `ERC20Permit` for EIP-2612 signature replay protection.
- ✅ Decimals = 18, OG-conventional.

### `ContributionRegistry`

Append-only ledger of all data, compute, and eval contributions.

- ✅ No `delete` or `update` functions exist.
- ✅ Content-hash collision resistance: keccak256 of canonical encoding.
- ✅ Replay across Forges allowed by design — same data can fuel multiple Forges.
- ⚠️ Storage growth unbounded. Accepted for v1; v2 introduces archive-and-prove via a Merkle checkpoint.

### `ForgeFactory`

Spawns Forge instances and tracks the canonical list.

- ✅ `createForge` is permissionless — anyone can fund a Forge.
- ✅ Deterministic addresses via Solady's CREATE2 helper.
- ✅ No proxy upgradability — every Forge is immutable.

### `Forge`

The state machine. Highest-risk contract because it interacts with every other.

- ✅ State transitions enforce strict ordering: `OPEN → TRAINING → ATTESTED → MINTED`. No state regression possible.
- ✅ `submitEvalResult` signature verification on-chain (ECDSA via OZ).
- ✅ Replay protection: per-Forge nonce committed at `OPEN → TRAINING`.
- ✅ Contribution window cannot be extended after start.
- ✅ `mintOwnership` share weights fuzzed for sum ≤ 10000 bps invariant.
- ✅ `contributeCompute` is `nonReentrant` (sends ETH inward, but defended for caller-callback edge case).

State-transition invariant:

```solidity
function _transition(State to) internal {
    require(uint8(to) == uint8(state) + 1, "monotone");
    state = to;
    emit StateChanged(state);
}
```

### `Ingot`

ERC-721 with packed share mappings (gas-optimized via Solady).

- ✅ `mintOwnership` callable only by the issuing Forge.
- ✅ Forge must be in `ATTESTED` state before mint.
- ✅ `lineageParent` immutable after mint.
- ✅ `shareOf` reads from packed storage with no overflow (fuzzed).
- ✅ `weightsRoot` can be set exactly once.

### `RevenueSplitter`

The contract that ships ETH outward. Highest blast radius.

- ✅ Checks-effects-interactions on `claim()`.
- ✅ OpenZeppelin `nonReentrant` on every external function.
- ✅ `claimable()` reverts on integer overflow (Solidity 0.8.24 default).
- ✅ `deposit()` accepts only from the inference RevenueGateway (access-controlled).
- ✅ No upgrade path / no admin role.
- ✅ Failed transfers don't grief the splitter (pull-payment pattern).

The claim pattern, in full:

```solidity
function claim(uint256 tokenId) external nonReentrant {
    uint256 owed = claimable(tokenId, msg.sender);
    require(owed > 0, "nothing-to-claim");
    claimed[tokenId][msg.sender] += owed;           // effect before interaction
    (bool ok,) = msg.sender.call{value: owed}("");
    require(ok, "transfer-failed");
    emit Claimed(tokenId, msg.sender, owed);
}
```

## Adversaries considered

| Adversary             | Threat                                                          | Mitigation                                                                                                                                      |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Greedy Smith          | Submits duplicate/low-effort data to inflate shares.            | Content-hash dedupe in the eval pipeline; LOO score for duplicates = 0.                                                                         |
| Coordinator collusion | Signs false attestation.                                        | Forge stores the registered TEE provider's pubkey at create; on-chain verification of the signature; provider registration is governance-gated. |
| Replay attack         | Reuses an old attestation.                                      | Per-Forge nonce in attestation payload; Forge rejects mismatched nonces.                                                                        |
| Re-entrant claimant   | Calls back into `claim` during transfer.                        | Checks-effects-interactions + `nonReentrant` + balance-debit-before-send.                                                                       |
| Lineage forger        | Mints a child Ingot claiming a parent that didn't authorize it. | Child Forge's attestation must consume the parent's `weightsRoot` as input. Forging the parent collapses to forging the TEE attestation.        |

## External review status

- **Code4rena OSS review channel** — posted for informal eyes.
- **Trail of Bits OSS reach-out** — drafted; sent.
- **Formal audit** — budgeted for the v1.0 launch, post-hackathon.

## Out of scope (v1, tracked)

- Adversarial training data crafted to insert a backdoor while passing LOO. _Mitigation v1: human review of high-impact contributors. v2: pre-eval adversarial probe._
- Inference oracle gaming (calling an Ingot many times to pump its perceived value). _Mitigation v1: dashboard flags concentrated callers. v2: economic friction._
- Compute-side collusion via host-level tampering inside an attested-but-compromised environment. _Mitigation v1: trust 0G Compute's TEE attestation. v2: per-batch GPU attestation._

## Reporting a vulnerability

Email `security@foundryprotocol.xyz` (PGP key on the docs site). Responsible disclosure window: 90 days from receipt. Critical findings on a deployed contract trigger a public advisory within 24 hours of patch landing.
