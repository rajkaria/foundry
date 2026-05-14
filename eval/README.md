# Foundry eval coordinator

Python service that watches `Forge` events, dispatches training + LOO attribution jobs to 0G Compute (inside a TEE for the eval), and submits the hardware-attested score vector back on-chain.

See [`docs/00-build-spec.md`](../docs/00-build-spec.md) §5.4 and [`docs/03-tech-architecture.md`](../docs/03-tech-architecture.md) §7.

## Stack

- Python 3.12
- `uv` for deps
- pydantic v2 / httpx / structlog
- transformers / sentence-transformers (small fine-tunes only)
- Sentry for observability

## Workflow

```bash
uv sync
uv run python -m foundry_eval.watcher   # local dev watcher
uv run pytest -q
```

## Status

Scaffolding only. Implementation lands Sprint 1 (watcher + trainer + non-TEE eval) → Sprint 2 (TEE).
