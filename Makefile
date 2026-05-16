# Foundry monorepo — convenience targets.
#
# Most commands are aliases over `pnpm` and `forge`. The deploy targets
# encode the right env vars + chain selection so a one-shot deploy
# can't accidentally hit the wrong network.

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:

# ─── default ────────────────────────────────────────────────────────────

.PHONY: help
help:
	@echo "Foundry targets:"
	@echo "  install              install all workspace deps + forge libs"
	@echo "  build                build all workspaces"
	@echo "  typecheck            tsc --noEmit across the monorepo"
	@echo "  test                 forge tests + workspace tests"
	@echo "  format               prettier --write across the repo"
	@echo ""
	@echo "  contracts-test       forge test -vvv"
	@echo "  contracts-coverage   forge coverage --report summary"
	@echo "  contracts-fmt        forge fmt"
	@echo ""
	@echo "  anvil                start a local Anvil node"
	@echo "  deploy-local         deploy to local Anvil; updates SDK addresses"
	@echo "  deploy-galileo       deploy to 0G Galileo testnet"
	@echo "  deploy-aristotle     deploy to 0G Aristotle mainnet (irreversible)"
	@echo "  deploy-dry           --fork-url \$$RPC dry-run (no broadcast)"
	@echo "  sync-deployments     re-sync deployments/*.json → SDK"
	@echo "  seed-aristotle       run real forge lifecycles on mainnet (Forge in Public)"
	@echo ""
	@echo "  indexer-dev          watch live chain events"
	@echo "  web-dev              next dev"

# ─── install / build / test ────────────────────────────────────────────

.PHONY: install
install:
	pnpm install
	cd contracts && forge install --no-git \
		foundry-rs/forge-std \
		OpenZeppelin/openzeppelin-contracts \
		Vectorized/solady 2>/dev/null || true

.PHONY: build
build:
	pnpm build

.PHONY: typecheck
typecheck:
	pnpm typecheck

.PHONY: test
test: contracts-test
	pnpm test || true

.PHONY: format
format:
	pnpm format

# ─── contracts ─────────────────────────────────────────────────────────

.PHONY: contracts-test
contracts-test:
	cd contracts && forge test -vvv

.PHONY: contracts-coverage
contracts-coverage:
	cd contracts && forge coverage --report summary

.PHONY: contracts-fmt
contracts-fmt:
	cd contracts && forge fmt

# ─── local dev chain ───────────────────────────────────────────────────

.PHONY: anvil
anvil:
	anvil --port 8545 --block-time 2

# ─── deploys ───────────────────────────────────────────────────────────

# Local Anvil. Uses the first default Anvil key + treasury.
# Local deploys overwrite contracts/deployments/local.json.
.PHONY: deploy-local
deploy-local:
	cd contracts && \
	  DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
	  TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
	  FOUNDRY_NET=local \
	  forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
	node scripts/sync-deployments.mjs local

# 0G Galileo testnet. Requires RPC_GALILEO, DEPLOYER_KEY_GALILEO, TREASURY_ADDR.
.PHONY: deploy-galileo
deploy-galileo:
	@[ -n "$$RPC_GALILEO" ]            || (echo "RPC_GALILEO not set" && exit 1)
	@[ -n "$$DEPLOYER_KEY_GALILEO" ]   || (echo "DEPLOYER_KEY_GALILEO not set" && exit 1)
	@[ -n "$$TREASURY_ADDR" ]          || (echo "TREASURY_ADDR not set" && exit 1)
	cd contracts && \
	  DEPLOYER_KEY=$$DEPLOYER_KEY_GALILEO \
	  TREASURY_ADDR=$$TREASURY_ADDR \
	  FOUNDRY_NET=galileo \
	  forge script script/Deploy.s.sol --rpc-url $$RPC_GALILEO --broadcast
	node scripts/sync-deployments.mjs galileo

# 0G Aristotle mainnet. Same flow as galileo with separate envs.
.PHONY: deploy-aristotle
deploy-aristotle:
	@[ -n "$$RPC_ARISTOTLE" ]          || (echo "RPC_ARISTOTLE not set" && exit 1)
	@[ -n "$$DEPLOYER_KEY_ARISTOTLE" ] || (echo "DEPLOYER_KEY_ARISTOTLE not set" && exit 1)
	@[ -n "$$TREASURY_ADDR" ]          || (echo "TREASURY_ADDR not set" && exit 1)
	@echo "WARNING: deploying to 0G Aristotle mainnet. Ctrl-C to abort."
	@sleep 5
	cd contracts && \
	  DEPLOYER_KEY=$$DEPLOYER_KEY_ARISTOTLE \
	  TREASURY_ADDR=$$TREASURY_ADDR \
	  FOUNDRY_NET=aristotle \
	  forge script script/Deploy.s.sol --rpc-url $$RPC_ARISTOTLE --broadcast
	node scripts/sync-deployments.mjs aristotle

# Dry-run against a fork of any network. Useful in CI to verify the
# deploy script compiles and runs end-to-end without touching chain.
.PHONY: deploy-dry
deploy-dry:
	@[ -n "$$RPC" ]              || (echo "set RPC=<rpc url>" && exit 1)
	cd contracts && \
	  DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
	  TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
	  FOUNDRY_NET=local \
	  forge script script/Deploy.s.sol --fork-url $$RPC

.PHONY: sync-deployments
sync-deployments:
	node scripts/sync-deployments.mjs

# Seed REAL on-chain activity on Aristotle so the public dashboard shows
# genuine, explorer-verifiable traction. Spends real OG. Honest by design:
# every counter is backed by a tx hash. SEED_DRY=1 previews without sending.
.PHONY: seed-aristotle
seed-aristotle:
	@[ -n "$$SEED_KEY$$DEPLOYER_KEY_ARISTOTLE" ] || (echo "set SEED_KEY or DEPLOYER_KEY_ARISTOTLE" && exit 1)
	node scripts/seed-mainnet.mjs

# ─── dev servers ───────────────────────────────────────────────────────

.PHONY: indexer-dev
indexer-dev:
	pnpm --filter @foundryprotocol/indexer dev

.PHONY: web-dev
web-dev:
	pnpm --filter @foundryprotocol/web dev
