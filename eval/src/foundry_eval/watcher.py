"""Main coordinator loop: watch Forges, dispatch eval, submit result."""

from __future__ import annotations

import asyncio
import logging
import sys

from .attribution import leave_one_out
from .config import Config
from .tee import fallback_attestation

log = logging.getLogger("foundry_eval")


async def evaluate_forge(
    forge_addr: str, contributions: list[dict[str, object]]
) -> None:
    """Sprint 1: produces a deterministic baseline + LOO score vector.

    Sprint 2 will replace the toy baseline/contribution-score values with
    real 0G Compute training runs inside the TEE.
    """
    log.info("evaluating forge=%s contributions=%d", forge_addr, len(contributions))
    baseline = 0.5
    contribution_scores = [baseline + 0.05 * (i + 1) for i in range(len(contributions))]
    attribution = leave_one_out(baseline, contribution_scores)
    attestation = fallback_attestation(
        b",".join(str(s).encode() for s in attribution.deltas_scaled)
    )
    log.info(
        "result forge=%s baseline=%.3f deltas=%s attestation=%s tee=%s",
        forge_addr,
        attribution.baseline,
        attribution.deltas_scaled,
        attestation.hex_bytes32,
        attestation.is_real_tee,
    )
    # TODO(sprint-1): submit on-chain via web3.py using config.coordinator_key.


async def loop(config: Config) -> None:
    if not config.deployment.forge_factory:
        log.warning(
            "no deployment file yet — watcher idle. Run contracts deploy first."
        )
        # idle politely so process supervisor doesn't restart-spam
        while True:
            await asyncio.sleep(60)

    log.info(
        "coordinator online rpc=%s factory=%s tee=%s",
        config.rpc_url,
        config.deployment.forge_factory,
        config.tee_enabled,
    )
    while True:
        # TODO(sprint-1): poll ForgeFactory for new Forges; for each one in
        # state EVALUATING, dispatch evaluate_forge(forge, contributions).
        await asyncio.sleep(config.poll_interval_secs)


def main() -> None:
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    config = Config.from_env()
    asyncio.run(loop(config))


if __name__ == "__main__":
    main()
