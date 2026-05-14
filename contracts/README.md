# Foundry contracts

Solidity 0.8.24, built with [Foundry](https://book.getfoundry.sh/) (the dev toolkit — different namespace from this project; see brand doc §5 trademark posture).

## Contracts

| File                           | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `src/FORGEToken.sol`           | ERC-20. Contribution-accounting + governance token.                                       |
| `src/ForgeFactory.sol`         | Deploys + registers Forges.                                                               |
| `src/Forge.sol`                | One Forge instance — state machine, contribution intake, eval submission, ownership mint. |
| `src/Ingot.sol`                | Co-owned trained-model identity. ERC-721 + internal share ledger.                         |
| `src/ContributionRegistry.sol` | Append-only log of every contribution across all Forges.                                  |
| `src/RevenueSplitter.sol`      | Receives inference payments per-Ingot; pull-payment claims.                               |

Detailed spec: [`docs/00-build-spec.md`](../docs/00-build-spec.md) §5.3 and [`docs/03-tech-architecture.md`](../docs/03-tech-architecture.md) §5.

## Workflow

```bash
forge install                    # one-time
forge build
forge test -vvv
forge coverage --report summary
forge script script/Deploy.s.sol --rpc-url aristotle --broadcast --verify
```

## Status

Scaffolding committed. Implementation lands Sprint 1 (May 18 – May 24) — mainnet deploy target **Tuesday May 19**.
